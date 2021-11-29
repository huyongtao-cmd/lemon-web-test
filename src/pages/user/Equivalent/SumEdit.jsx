import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import update from 'immutability-helper';
import moment from 'moment';
import { gt, gte, isNil, isEmpty } from 'ramda';
import { Card, Button, Form, Input, DatePicker, Divider, Radio, Table } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mul, add, sub, div, checkIfNumber } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { toIsoDate } from '@/utils/timeUtils';
import { showProcBtn } from '@/utils/flowToRouter';
import EvalList from './config/EvalList';

const DOMAIN = 'SumEdit';
const { Field } = FieldList;

const FILTERED_SHOW = {
  UNFINISHED: 'NONE|IN PROCESS',
  ALL: 'NONE|IN PROCESS|FINISH',
};

@connect(({ loading, SumEdit, user }) => ({
  loading,
  SumEdit,
  user,
}))
@Form.create()
@mountToTab()
class DetailSumEdit extends Component {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryInfo`,
      payload: id,
    });
  }

  changeTableStatus = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        tableStatus: value,
      },
    });
  };

  onCellChanged = (actId, rowField) => rowFieldValue => {
    const {
      SumEdit: { list, formData },
      form: { setFields },
      dispatch,
    } = this.props;
    const value =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newList = list.map(item => {
      if (`${actId}` === `${item.actId}`) return { ...item, [rowField]: value };
      return item;
    });
    const rowData = list.filter(item => `${actId}` === `${item.actId}`)[0];
    const { avalSettleEqva, ssCompPercent } = rowData;
    // applySettleEqva
    if (rowField === 'applySettleEqva') {
      const result = gte(avalSettleEqva, value);
      if (!result) {
        createMessage({ type: 'warn', description: `输入的值不能大于${avalSettleEqva}` });
        const modifiedList = list.map(item => {
          if (`${actId}` === `${item.actId}`) return { ...item, [rowField]: avalSettleEqva };
          return item;
        });
        const applySettleEqvaCalc = modifiedList
          .map(l => l.applySettleEqva)
          .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
        setFields({
          applySettleEqva: {
            value: `${applySettleEqvaCalc}
            }`,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [rowField]: applySettleEqvaCalc,
          },
        });
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: modifiedList,
          },
        });
      } else {
        const applySettleEqvaCalc = newList
          .map(l => l.applySettleEqva)
          .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
        setFields({
          applySettleEqva: {
            value: `${applySettleEqvaCalc}`,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [rowField]: applySettleEqvaCalc,
          },
        });
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: newList,
          },
        });
      }
      // reportCompPercent
    } else {
      const result = gte(100, value);
      if (!result) {
        createMessage({ type: 'warn', description: `输入的值不能大于100` });
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: list.map(item => {
              if (`${actId}` === `${item.actId}`) return { ...item, [rowField]: 100 };
              return item;
            }),
          },
        });
      } else {
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: newList,
          },
        });
      }
    }
  };

  handleSave = () => {
    const {
      dispatch,
      form: { getFieldsValue, validateFieldsAndScroll, setFields },
      SumEdit: { list, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const fieldsData = getFieldsValue(['settleDate', 'remark']);
      const { applySettleEqva } = formD;
      const unfillReportPercentRows = list.filter(item => isNil(item.reportCompPercent));
      if (!isEmpty(unfillReportPercentRows)) {
        // createMessage({ type: 'warn', description: '请输入完工百分比' });
      } else if (!applySettleEqva || +applySettleEqva <= 0) {
        setFields({
          applySettleEqva: {
            value: '0',
            errors: [new Error('请在下方结算明细表选择申请结算当量')],
          },
        });
      } else {
        const formData = {
          settleType: 'TASK_BY_PACKAGE',
          id: fromQs().id,
          settleDate: fieldsData.settleDate ? toIsoDate(fieldsData.settleDate) : undefined,
          remark: fieldsData.remark,
          twEqvaSettleDEntities: list,
          submitted: false,
        };
        dispatch({ type: `${DOMAIN}/saveData`, payload: formData });
      }
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { getFieldsValue, validateFieldsAndScroll, setFields },
      SumEdit: { list, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const { id, taskId, remark } = fromQs(); // remark 流程流转意见
      const fieldsData = getFieldsValue(['settleDate', 'remark']); // remark 表单的备注
      const { applySettleEqva } = formD;
      const unfillReportPercentRows = list.filter(item => isNil(item.reportCompPercent));
      if (!isEmpty(unfillReportPercentRows)) {
        // createMessage({ type: 'warn', description: '请输入完工百分比' });
      } else if (!applySettleEqva || +applySettleEqva <= 0) {
        setFields({
          applySettleEqva: {
            value: '0',
            errors: [new Error('请在下方结算明细表选择申请结算当量')],
          },
        });
      } else {
        const formData = {
          settleType: 'TASK_BY_PACKAGE',
          id,
          settleDate: fieldsData.settleDate ? toIsoDate(fieldsData.settleDate) : undefined,
          remark: fieldsData.remark,
          twEqvaSettleDEntities: list,
          submitted: true,
        };
        dispatch({ type: `${DOMAIN}/submitData`, payload: { formData, taskId, remark } });
      }
    });
  };

  tableProps = () => {
    const {
      SumEdit: { list, tableStatus = FILTERED_SHOW.UNFINISHED, selectedRowKeys },
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      showAdd: false,
      showCopy: false,
      showDelete: false,
      loading: loading.effects[`${DOMAIN}/queryInfo`],
      scroll: {
        x: 1590,
      },
      dataSource: list.filter(item => tableStatus.includes(item.settleStatus)),
      columns: [
        {
          title: '编号',
          dataIndex: 'actNo',
          className: 'text-center',
          width: 100,
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          width: 200,
        },
        {
          title: '计划当量',
          dataIndex: 'planEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '已派发当量',
          dataIndex: 'distedEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '活动状态',
          dataIndex: 'actStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '结算状态',
          dataIndex: 'settleStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '申请时完工百分比',
          dataIndex: 'ssCompPercent',
          className: 'text-center',
          width: 150,
          render: value => (value !== null ? `${value}%` : undefined),
        },
        {
          title: '完工百分比',
          dataIndex: 'reportCompPercent',
          width: 150,
          options: {
            rules: [
              {
                required: true,
                message: '请输入完工百分比',
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback();
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) =>
            row.settleStatus === 'FINISH' ? (
              <span>{`${value}%`}</span>
            ) : (
              <Input
                value={value}
                addonAfter="%"
                onChange={this.onCellChanged(row.actId, 'reportCompPercent')}
              />
            ),
        },
        {
          title: '可结算百分比',
          dataIndex: 'avalSettleEqvaPercent',
          className: 'text-center',
          width: 100,
          // render: value => (value !== null ? `${value}%` : undefined),
          render: (value, row, index) => {
            const { reportCompPercent, avalSettleEqvaMinPercent, avalSettleEqvaMaxPercent } = row;
            if (!reportCompPercent || gt(avalSettleEqvaMinPercent, reportCompPercent)) return '0%';
            if (gt(100, reportCompPercent)) return `${avalSettleEqvaMaxPercent || 0}%`;
            return '100%';
          },
        },
        {
          title: '申请结算当量',
          dataIndex: 'applySettleEqva',
          width: 150,
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['请输入申请结算当量']);
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) =>
            row.settleStatus === 'FINISH' ? (
              <span>{value}</span>
            ) : (
              <Input value={value} onChange={this.onCellChanged(row.actId, 'applySettleEqva')} />
            ),
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
          width: 120,
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
          width: 120,
        },
      ],
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      SumEdit: { formData, tableStatus = FILTERED_SHOW.UNFINISHED },
      user: {
        user: { info = {} },
      },
    } = this.props;
    const { id, taskId, sourceUrl } = fromQs();

    const { apprStatus } = formData;
    const showButton = showProcBtn(apprStatus, taskId);
    // console.warn(' --- formData ::', formData);

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryInfo`] ||
      loading.effects[`${DOMAIN}/saveData`] ||
      loading.effects[`${DOMAIN}/submitData`];

    return (
      <PageHeaderWrapper title="当量结算总价">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          {showButton && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交
            </Button>
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() =>
              sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/intelStl/list')
            }
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList legend="当量结算基本信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="settleNo"
              label="结算单号"
              decorator={{
                initialValue: formData.settleNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || info.name,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || moment().format('YYYY-MM-DD'),
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="settleDate"
              label="结算日期"
              decorator={{
                initialValue: formData.settleDate ? moment(formData.settleDate) : undefined,
                rules: [{ required: true, message: '请选择结算日期' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="applySettleEqva"
              label="申请结算当量"
              decorator={{
                initialValue: `${isNil(formData.applySettleEqva) ? 0 : formData.applySettleEqva} `,
              }}
            >
              <Input
                disabled
                style={{ color: 'red' }}
                // addonAfter={formData.applySettleAmt ? formData.applySettleAmt : undefined}
              />
            </Field>
            <Field
              name="settlePrice"
              label="当量工资"
              decorator={{
                initialValue: `${formData.settlePrice || ''} / ${
                  formData.eqvaSalary ? formData.eqvaSalary : ''
                }`,
              }}
            >
              <Input
                disabled
                style={{ color: 'red' }}
                // addonAfter={formData.eqvaSalary ? formData.eqvaSalary : undefined}
              />
            </Field>
            <Field
              name="guarantee"
              label="质保金比例/质保当量"
              decorator={{
                initialValue: `${formData.guaranteeRate ? `${formData.guaranteeRate}%` : ''} / ${
                  formData.guaranteeRate
                    ? `${mul(
                        formData.applySettleEqva || 0,
                        div(+formData.guaranteeRate, 100)
                      ).toFixed(2)}`
                    : ''
                }`,
              }}
            >
              <Input
                disabled
                // addonBefore={formData.guaranteeRate ? `${formData.guaranteeRate}%` : undefined}
              />
            </Field>
            <Field
              name="resAmt"
              label="资源当量收入金额"
              decorator={{
                initialValue: !isNil(formData.applySettleEqva)
                  ? mul(formData.applySettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)
                  : 0,
              }}
            >
              <Input disabled style={{ color: 'red' }} />
            </Field>
            <Field
              name="acceptMethodName"
              label="验收方式"
              decorator={{
                initialValue: formData.acceptMethodName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="projName" // projId
              label="相关项目"
              decorator={{
                initialValue: formData.projName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taskName" // taskId
              label="任务包名称"
              decorator={{
                initialValue: formData.taskName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="incomeResName" // incomeResId
              label="收入资源"
              decorator={{
                initialValue: formData.incomeResName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="remark"
              label="结算说明"
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入结算说明" />
            </Field>
          </FieldList>
          <Divider dashed />
          <Card
            className="tw-card-adjust"
            title={
              <>
                <span>结算明细</span>
                <Radio.Group
                  buttonStyle="solid"
                  value={tableStatus}
                  onChange={e => this.changeTableStatus(e.target.value)}
                  style={{ marginLeft: 24 }}
                >
                  <Radio.Button value={FILTERED_SHOW.UNFINISHED}>显示未结算的</Radio.Button>
                  <Radio.Button value={FILTERED_SHOW.ALL}>显示所有</Radio.Button>
                </Radio.Group>
              </>
            }
            bordered={false}
          >
            <EditableDataTable {...this.tableProps()} />
          </Card>
          {/* <EvalList
            isEval={formData.evalStatus === 'FINISH'}
            sourceId={id}
            options={{
              evalClass: 'TASK',
              evalType: 'RECIEVER2SENDER',
            }}
          /> */}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DetailSumEdit;
