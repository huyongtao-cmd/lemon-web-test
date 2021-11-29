import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  Divider,
  Row,
  Col,
  InputNumber,
  Tooltip,
  Icon,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect, MonthRangePicker, Selection } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import DataSet from '@antv/data-set';
import Link from 'umi/link';
import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  Bar,
  Pie,
  TimelineChart,
} from '@/components/common/Charts';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Chart, Geom, Axis, Legend, Coord, Tooltip as ChartsToolTip } from 'bizcharts';

import { selectFinperiod } from '@/services/user/Contract/sales';
import router from 'umi/router';
import moment from 'moment';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'projectReport';

// https://bizcharts.net/products/bizCharts/demo/detail?id=bar-grouped&selectedKey=%E6%8A%98%E7%BA%BF%E5%9B%BE

@connect(({ loading, projectReport, dispatch, user }) => ({
  loading,
  ...projectReport,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class ProjectReport extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { id, projId } = param;
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
    if (projId) {
      dispatch({
        type: `${DOMAIN}/queryInfo`,
        payload: { projId, mode: 'EDIT' },
      });

      dispatch({
        type: `${DOMAIN}/queryFinPeriod`,
        payload: {},
      });
    }

    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      if (isNil(formData.reprotCompPercent)) {
        createMessage({ type: 'warn', description: '请填写本期累计完工百分比' });
        return;
      }
      // if (isNil(formData.confirmCompPercent)) {
      //   createMessage({ type: 'warn', description: '请填写本期财务调整完工百分比' });
      //   return;
      // }
      if (isNil(formData.confirmAmt)) {
        createMessage({ type: 'warn', description: '请填写本期确认收入' });
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: { ...formData, ...values },
      });
    });
  };

  handleSubmit = flowForm => {
    const { form, dispatch, formData } = this.props;
    const param = fromQs();
    const { modeView } = flowForm;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      if (isNil(formData.predictReimAmt) && modeView !== 'FINANCE') {
        createMessage({ type: 'warn', description: '请填写本期预计剩余报销费用' });
        return;
      }
      if (isNil(formData.predictLaborAmt) && modeView !== 'FINANCE') {
        createMessage({ type: 'warn', description: '请填写本期预计剩余人工成本' });
        return;
      }
      if (isNil(formData.reprotCompPercent)) {
        createMessage({ type: 'warn', description: '请填写本期累计完工百分比' });
        return;
      }
      // if (isNil(formData.confirmCompPercent)) {
      //   createMessage({ type: 'warn', description: '请填写本期财务调整完工百分比' });
      //   return;
      // }
      if (isNil(formData.confirmAmt)) {
        createMessage({ type: 'warn', description: '请填写本期确认收入' });
        return;
      }
      const wrapParam = { ...param };
      delete wrapParam.id;
      dispatch({
        type: `${DOMAIN}/submit`,
        payload: { ...formData, ...values, ...wrapParam, ...flowForm, submit: true },
      });
    });
  };

  autoReportPercent = modeView => {
    const { dispatch, formData } = this.props;
    const { feeUsedAmt, passedLaborAmt, predictReimAmt, predictLaborAmt } = formData;
    const reprotCompPercent =
      ((feeUsedAmt + passedLaborAmt) /
        (feeUsedAmt + passedLaborAmt + predictReimAmt + predictLaborAmt)) *
      100;
    let param;
    if (modeView === 'FINANCE') {
      param = { confirmCompPercent: reprotCompPercent.toFixed(2) };
    } else {
      param = { reprotCompPercent: reprotCompPercent.toFixed(2) };
    }
    param.confirmAmt = (formData.projAmt * reprotCompPercent) / 100 - formData.confirmedAmt;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: param,
    });
  };

  // 行编辑触发事件
  onCellChanged = rowField => rowFieldValue => {
    const { formData, dispatch } = this.props;
    const param = {};
    param[rowField] = rowFieldValue;
    if (rowField === 'confirmCompDesc') {
      param[rowField] = rowFieldValue.target.value;
    }
    if (rowField === 'reprotCompPercent') {
      // 2019-06-04 财务调整百分比不自动带出,当取完工百分比时自己判断财务调整百分比是否存在,如果存在按照财务调整的计算,否则按填写的计算
      // param.confirmCompPercent = rowFieldValue;
      param.confirmAmt = (formData.projAmt * rowFieldValue) / 100 - formData.confirmedAmt;
    }
    if (rowField === 'confirmCompPercent') {
      param.confirmAmt = (formData.projAmt * rowFieldValue) / 100 - formData.confirmedAmt;
    }

    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: param,
    });
  };

  render() {
    const {
      loading,
      formData,
      fieldsConfig: config,
      flowForm,
      currentFinPeriodId,
      mode,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
    } = this.props;
    const that = this;
    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`];
    let modeView = mode;
    let fieldsConfig = {};
    const param = fromQs();
    if (param.mode === 'view') {
      modeView = 'VIEW';
    }
    if (!isEmpty(config)) {
      const { taskKey } = config;
      fieldsConfig = config;
      // 提交节点
      // if (
      //   taskKey === TASK_FLOW_SUBMIT &&
      //   (formData.apprStatus === 'NOTSUBMIT' ||
      //     formData.apprStatus === 'REJECTED' ||
      //     formData.apprStatus === 'WITHDRAW')
      // ) {
      //   fieldsConfig = config;
      // }
      if (param.mode !== 'EDIT') {
        modeView = 'VIEW';
      }
      // 发包人确认节点 审批中只有通过和拒绝按钮
      if (taskKey === 'TSK_P09_03_FINANCE_CONFIRM' && formData.apprStatus === 'APPROVING') {
        modeView = 'FINANCE';
      }
    }

    const data = [
      {
        label: '数量',
        总预算: formData.eqvaBudgetCnt,
        已派发: formData.eqvaDistedQty,
        已结算: formData.eqvaSettledQty,
      },
      {
        label: '金额(千元)',
        总预算: formData.eqvaBudgetAmt / 1000,
        已派发: formData.eqvaDistedAmt / 1000,
        已结算: formData.eqvaSettledAmt / 1000,
      },
    ];
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['总预算', '已派发', '已结算'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    // 费用数据
    const feeData = [
      {
        label: '费用',
        总预算: formData.feeBudgetAmt,
        已使用: formData.feeUsedAmt,
      },
    ];
    const feeDs = new DataSet();
    const feeDv = feeDs.createView().source(feeData);
    feeDv.transform({
      type: 'fold',
      fields: ['总预算', '已使用'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    const editSource = [formData];
    if (formData.lastPeriodBrief) {
      editSource.splice(0, 0, formData.lastPeriodBrief);
    }

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource: editSource,
      total: 0,
      showAdd: false,
      showCopy: false,
      readOnly: true,
      columns: [
        {
          title: '',
          dataIndex: 'faker',
          align: 'right',
          width: '100',
          render: (value, row, index) => (row.id === formData.id ? '本期汇报' : '上期汇报'),
        },
        {
          title: '期间',
          dataIndex: 'finPeriodName',
          align: 'right',
          width: '120',
          render: (value, row, index) => <Input value={value} className="x-fill-100" disabled />,
        },
        {
          title: '预计剩余报销费用',
          dataIndex: 'predictReimAmt',
          align: 'right',
          width: '200',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              precision={2} // 小数点两位
              disabled={index === 0 || modeView === 'VIEW' || modeView === 'FINANCE'}
              onChange={this.onCellChanged('predictReimAmt')}
            />
          ),
        },
        {
          title: '预计剩余人工成本',
          dataIndex: 'predictLaborAmt',
          align: 'right',
          width: '200',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              precision={2} // 小数点两位
              disabled={index === 0 || modeView === 'VIEW' || modeView === 'FINANCE'}
              onChange={this.onCellChanged('predictLaborAmt')}
            />
          ),
        },
        {
          title: '累计完工百分比',
          dataIndex: 'reprotCompPercent',
          align: 'right',
          width: '150',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              formatter={val => `${val}%`}
              parser={val => val.replace('%', '')}
              precision={2} // 小数点两位
              disabled={index === 0 || modeView === 'VIEW' || modeView === 'FINANCE'}
              max={100}
              min={0}
              onChange={this.onCellChanged('reprotCompPercent')}
            />
          ),
        },
        {
          title: '财务调整完工百分比',
          dataIndex: 'confirmCompPercent',
          required: false,
          align: 'right',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              formatter={val => `${val}%`}
              parser={val => val.replace('%', '')}
              precision={2} // 小数点两位
              disabled={index === 0 || modeView === 'EDIT' || modeView === 'VIEW'}
              max={100}
              min={0}
              onChange={this.onCellChanged('confirmCompPercent')}
            />
          ),
        },
        {
          title: '财务调整说明',
          dataIndex: 'confirmCompDesc',
          required: false,
          align: 'right',
          render: (value, row, index) => (
            <Input
              value={value}
              className="x-fill-100"
              disabled={index === 0 || modeView === 'EDIT' || modeView === 'VIEW'}
              onChange={this.onCellChanged('confirmCompDesc')}
            />
          ),
        },
        {
          title: '累计确认收入',
          dataIndex: 'confirmedAmt',
          required: false,
          align: 'right',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              precision={2} // 小数点两位
              disabled
            />
          ),
        },
        {
          title: '当期确认收入',
          dataIndex: 'confirmAmt',
          required: false,
          align: 'right',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              precision={2} // 小数点两位
              disabled
              onChange={this.onCellChanged('confirmAmt')}
            />
          ),
        },
      ],
    };

    let confirmAmt = 0;
    let confirmCompPercent = 0;
    // if (formData.confirmAmt) {
    //   confirmAmt = formData.confirmAmt + formData.confirmedAmt; // eslint-disable-line
    // }
    // if (formData.confirmCompPercent) {
    //   confirmCompPercent = formData.confirmCompPercent || formData.reportCompPercent; // eslint-disable-line
    // }
    if (formData.lastPeriodBrief && formData.lastPeriodBrief.id !== -999) {
      confirmAmt = formData.lastPeriodBrief.confirmAmt + formData.lastPeriodBrief.confirmedAmt; // eslint-disable-line
      confirmCompPercent = formData.lastPeriodBrief.confirmCompPercent; // eslint-disable-line
    }

    return (
      <PageHeaderWrapper title="项目情况汇报">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={disabledBtn}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };

            if (key === 'AUTO-REPORT') {
              this.autoReportPercent(modeView);
              return Promise.resolve(false);
            }

            if (key === 'EDIT') {
              closeThenGoto(
                `/user/project/ProjectReport?id=${param.id}&mode=EDIT&taskId=${
                  param.taskId
                }&remark=${bpmForm.remark}`
              );
            }

            if (key === 'APPROVED' && taskKey !== 'TSK_P09_03_FINANCE_CONFIRM') {
              return Promise.resolve(true);
            }
            if (key === 'APPROVED' && taskKey === 'TSK_P09_03_FINANCE_CONFIRM') {
              that.handleSubmit({
                submit: true,
                procTaskId: param.taskId,
                procRemark: bpmForm.remark,
                modeView,
              });
              return Promise.resolve(false);
            }

            if (key === 'REJECTED') {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            {/* <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSave}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button> */}
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              loading={disabledBtn}
              onClick={() => this.handleSubmit({ procTaskId: param.taskId, modeView })}
            >
              提交
            </Button>
            {modeView === 'VIEW' || (
              <Tooltip title="完工百分比= （已发生的总费用+已发生的实际人工成本）/（已发生的总费用+已发生的实际人工成本+预计还会发生的总费用+预计还会发生的人工成本）">
                <Button
                  className="tw-btn-primary"
                  type="primary"
                  size="large"
                  loading={disabledBtn}
                  hidden={modeView !== 'FINANCE'}
                  onClick={() => this.autoReportPercent(modeView)}
                >
                  自动计算完工百分比
                </Button>
              </Tooltip>
            )}
          </Card>

          <Card bordered={false} className="tw-card-adjust deepColorDecorator">
            <FieldList legend="申请信息" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="briefNo"
                label="汇报编号"
                decorator={{
                  initialValue: formData.briefNo,
                }}
              >
                <Input disabled style={{ width: '100%' }} />
              </Field>
              <Field
                name="projId"
                label="相关项目"
                decorator={{
                  initialValue: formData.projId,
                }}
              >
                <Link className="tw-link" to={`/user/project/projectDetail?id=${formData.projId}`}>
                  {formData.projName}
                </Link>
              </Field>

              <Field
                name="applyResId"
                label="提交人"
                decorator={{
                  initialValue: formData.applyResId || (extInfo && extInfo.resId),
                }}
              >
                <Select disabled>
                  <Option value={extInfo.resId}>{extInfo.resName}</Option>
                  <Option value={formData.applyResId}>{formData.applyResName}</Option>
                </Select>
              </Field>

              <Field
                name="finPeriodId"
                label="财务期间"
                decorator={{
                  initialValue: formData.finPeriodId || currentFinPeriodId,
                  rules: [{ required: true, message: '请选择财务期间' }],
                }}
              >
                <Selection
                  disabled={modeView === 'VIEW' || modeView === 'FINANCE'}
                  source={() => selectFinperiod()}
                  placeholder="汇报期间"
                  // resTransform={res => res.filter(v => moment(v.name).isBefore(moment()))}
                  showSearch
                />
              </Field>
              <Field
                name="projProcessStatus"
                label="项目进度状态"
                decorator={{
                  initialValue: formData.projProcessStatus,
                  rules: [{ required: true, message: '请选项目进度状态' }],
                }}
              >
                <UdcSelect
                  disabled={modeView === 'VIEW' || modeView === 'FINANCE'}
                  allowClear={false}
                  code="TSK:PROJ_PROCESS_STATUS"
                  className="x-fill-100"
                />
              </Field>

              <Field
                name="briefStatus"
                label="项目汇报状态"
                decorator={{
                  initialValue: formData.briefStatus,
                }}
              >
                <UdcSelect
                  disabled
                  allowClear={false}
                  code="TSK:BRIEF_STATUS"
                  className="x-fill-100"
                />
              </Field>

              <Field
                name="briefDesc"
                label="项目情况描述"
                decorator={{
                  initialValue: formData.briefDesc,
                  rules: [{ required: true, message: '请输入项目情况描述' }],
                }}
              >
                <Input.TextArea
                  autosize={{ minRows: 2, maxRows: 5 }}
                  disabled={modeView === 'VIEW' || modeView === 'FINANCE'}
                />
              </Field>

              <Field
                name="riskDesc"
                label="项目风险描述"
                decorator={{
                  initialValue: formData.riskDesc,
                }}
              >
                <Input.TextArea
                  autosize={{ minRows: 2, maxRows: 5 }}
                  disabled={modeView === 'VIEW' || modeView === 'FINANCE'}
                />
              </Field>
            </FieldList>

            <DescriptionList title="项目收款信息" />
            <Row style={{ width: '80%', margin: '0px auto' }}>
              <Col span={24}>
                <h2 style={{ textAlign: 'center' }}>
                  项目总应收款:
                  {formData.projAmt}元
                </h2>
              </Col>
            </Row>
            <Row style={{ width: '80%', margin: '0px auto' }}>
              <Col span={8}>
                <div
                  style={{
                    backgroundColor: '#DDD',
                    width: '60%',
                    margin: '0px auto',
                    borderRadius: '5px',
                    minWidth: '210px',
                  }}
                >
                  <div
                    style={{
                      height: 30,
                      textAlign: 'center',
                      padding: '5px 0',
                      fontWeight: 'bold',
                    }}
                  >
                    未收款金额
                  </div>
                  <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                  <div style={{ height: 100, textAlign: 'center' }}>
                    <h3>{formData.notReceivedAmt}元</h3>
                    <div style={{ width: '48%', float: 'left' }}>
                      <p style={{ margin: '0' }}>开票未收款</p>
                      <p style={{ color: '#0000FF' }}>{formData.invoicedNotReceivedAmt}元</p>
                    </div>
                    <Divider
                      type="vertical"
                      style={{
                        float: 'left',
                        margin: '0 2px',
                        height: '60px',
                        width: '3px',
                        backgroundColor: '#AAA',
                      }}
                    />
                    <div style={{ width: '48%', float: 'left' }}>
                      <p style={{ margin: '0' }}>未开票应收款</p>
                      <p style={{ color: 'red' }}>{formData.notInvoicedReceivedAmt}元</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    backgroundColor: '#DDD',
                    width: '60%',
                    margin: '0px auto',
                    borderRadius: '5px',
                    minWidth: '210px',
                  }}
                >
                  <div
                    style={{
                      height: 30,
                      textAlign: 'center',
                      padding: '5px 0',
                      fontWeight: 'bold',
                    }}
                  >
                    已收款金额(%)
                  </div>
                  <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                  <div style={{ height: 100, textAlign: 'center' }}>
                    <h3 style={{ paddingTop: '25px' }}>
                      {formData.recvedAmt}
                      元(
                      {formData.actualReceivedRate}
                      %)
                    </h3>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    backgroundColor: '#DDD',
                    width: '60%',
                    margin: '0px auto',
                    borderRadius: '5px',
                    minWidth: '210px',
                  }}
                >
                  <div
                    style={{
                      height: 30,
                      textAlign: 'center',
                      padding: '5px 0',
                      fontWeight: 'bold',
                    }}
                  >
                    已确认收入
                  </div>
                  <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                  <div style={{ height: 100, textAlign: 'center' }}>
                    <h3 style={{}}>{confirmAmt ? confirmAmt.toFixed(2) : confirmAmt}元</h3>
                    {modeView === 'FINANCE' ? (
                      <h4 style={{}}>
                        已发生的人工费用:
                        {formData.passedLaborAmt}元
                      </h4>
                    ) : (
                      ''
                    )}
                    <h4 style={{}}>
                      完工百分比:
                      {confirmCompPercent}%
                    </h4>
                  </div>
                </div>
              </Col>
            </Row>

            <DescriptionList title="项目进度填报" />
            <EditableDataTable {...editTableProps} />

            <DescriptionList title="项目预算情况" />
            <Row>
              <Col span={12}>
                <ChartCard loading={false} title="当量使用情况">
                  <Chart data={dv} height={300} forceFit>
                    <Legend />
                    <Coord transpose scale={[1, -1]} />
                    <Axis
                      name="label"
                      label={{
                        offset: 12,
                      }}
                    />
                    <Axis name="value" position="right" />
                    <ChartsToolTip />
                    <Geom
                      type="interval"
                      position="label*value"
                      color="type"
                      adjust={[
                        {
                          type: 'dodge',
                          marginRatio: 1 / 32,
                        },
                      ]}
                    />
                  </Chart>
                </ChartCard>
              </Col>

              <Col span={12}>
                <ChartCard loading={false} title="费用使用情况">
                  <Chart data={feeDv} height={300}>
                    <Legend />
                    <Coord transpose scale={[1, -1]} />
                    <Axis
                      name="label"
                      label={{
                        offset: 12,
                      }}
                    />
                    <Axis name="value" position="right" />
                    <ChartsToolTip />
                    <Geom
                      type="interval"
                      position="label*value"
                      color="type"
                      adjust={[
                        {
                          type: 'dodge',
                          marginRatio: 1 / 32,
                        },
                      ]}
                    />
                  </Chart>
                </ChartCard>
              </Col>
            </Row>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectReport;
