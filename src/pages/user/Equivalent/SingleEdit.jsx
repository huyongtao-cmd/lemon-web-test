import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import { pickBy, isNil } from 'ramda';
import { Card, Button, Form, Input, DatePicker, Divider, Radio, Table } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { mul, add, div } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { toIsoDate } from '@/utils/timeUtils';
import { showProcBtn } from '@/utils/flowToRouter';
import EvalList from './config/EvalList';

const DOMAIN = 'SingleEdit';
const { Field } = FieldList;

const FILTERED_SHOW = {
  UNFINISHED: 'NONE|IN PROCESS',
  ALL: 'NONE|IN PROCESS|FINISH',
};

@connect(({ loading, SingleEdit, user }) => ({
  loading,
  SingleEdit,
  user,
}))
@Form.create()
@mountToTab()
class DetailSingleEdit extends Component {
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

  handleSave = () => {
    const {
      dispatch,
      form: { getFieldsValue, validateFieldsAndScroll, setFields },
      SingleEdit: { list, selectedRowKeys, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const fieldsData = getFieldsValue(['settleDate', 'remark']);
      const { applySettleEqva } = formD;
      if (!applySettleEqva || +applySettleEqva <= 0)
        setFields({
          applySettleEqva: {
            value: '0',
            errors: [new Error('请在下方结算明细表选择申请结算当量')],
          },
        });
      else {
        const formData = {
          settleType: 'TASK_BY_MANDAY',
          id: fromQs().id,
          settleDate: fieldsData.settleDate ? toIsoDate(fieldsData.settleDate) : undefined,
          remark: fieldsData.remark,
          twEqvaSettleDEntities: Object.values(
            pickBy(value => selectedRowKeys.includes(value.id), list)
          ),
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
      SingleEdit: { list, selectedRowKeys, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const { id, taskId, remark } = fromQs(); // remark 流程提交意见
      const fieldsData = getFieldsValue(['settleDate', 'remark']);
      const { applySettleEqva } = formD;
      if (!applySettleEqva || +applySettleEqva <= 0)
        setFields({
          applySettleEqva: {
            value: '0',
            errors: [new Error('请在下方结算明细表选择申请结算当量')],
          },
        });
      else {
        const formData = {
          settleType: 'TASK_BY_MANDAY',
          id,
          settleDate: fieldsData.settleDate ? toIsoDate(fieldsData.settleDate) : undefined,
          remark: fieldsData.remark,
          twEqvaSettleDEntities: Object.values(
            pickBy(value => selectedRowKeys.includes(value.id), list)
          ),
          submitted: true,
        };
        dispatch({ type: `${DOMAIN}/submitData`, payload: { formData, taskId, remark } });
      }
    });
  };

  tableProps = () => {
    const {
      SingleEdit: { list, tableStatus = FILTERED_SHOW.UNFINISHED, selectedRowKeys, formData },
      loading,
      dispatch,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryInfo`],
      scroll: {
        x: 1200,
      },
      dataSource: list.filter(
        item => !item.settleStatus || tableStatus.includes(item.settleStatus)
      ),
      bordered: true,
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
          const unFinishedKeys = selectedRows
            .filter(row => FILTERED_SHOW.UNFINISHED.includes(row.settleStatus))
            .map(row => row.id);
          // 申请结算当量 = 各理论获得当量之和
          const applySettleEqva = selectedRows
            .filter(row => FILTERED_SHOW.UNFINISHED.includes(row.settleStatus))
            .map(item => item.applySettleEqva)
            .reduce((sum, val) => add(sum || 0, val || 0), 0);
          // 金额 = 申请结算当量 * 结算单价
          const applySettleAmt =
            formData.settlePrice && applySettleEqva
              ? mul(applySettleEqva || 0, formData.settlePrice || 0).toFixed(2)
              : 0;
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: { applySettleAmt, applySettleEqva },
          });
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              selectedRowKeys: unFinishedKeys,
            },
          });
        },
      },
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
          className: 'text-center',
          width: 100,
        },
        {
          title: '工时状态',
          dataIndex: 'timeSheetStatusName',
          className: 'text-center',
          width: 80,
        },
        {
          title: '结算状态',
          dataIndex: 'settleStatusName',
          className: 'text-center',
          width: 80,
        },
        {
          title: '活动编号',
          dataIndex: 'actNo',
          className: 'text-center',
          width: 50,
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          width: 200,
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          width: 300,
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          className: 'text-center',
          width: 50,
        },
        {
          title: '理论获得当量',
          dataIndex: 'applySettleEqva',
          className: 'text-center',
          width: 100,
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
      SingleEdit: { formData, tableStatus = FILTERED_SHOW.UNFINISHED },
      user: {
        user: { info = {} },
      },
    } = this.props;
    const { id, taskId, sourceUrl } = fromQs();

    const { apprStatus } = formData;
    const showButton = showProcBtn(apprStatus, taskId);
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryInfo`] ||
      loading.effects[`${DOMAIN}/saveData`] ||
      loading.effects[`${DOMAIN}/submitData`];

    return (
      <PageHeaderWrapper title="当量结算总价">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
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
              type="primary"
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
                initialValue: formData.settleDate ? moment(formData.settleDate) : moment(),
                rules: [{ required: true, message: '请选择结算日期' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="applySettleEqva"
              label="申请结算当量"
              decorator={{
                initialValue: `${isNil(formData.applySettleEqva) ? 0 : formData.applySettleEqva}`,
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
                initialValue: `${formData.eqvaSalary ? formData.eqvaSalary : ''}`,
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
            <Table {...this.tableProps()} />
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

export default DetailSingleEdit;
