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
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { mul, add, sub, div, checkIfNumber } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { toIsoDate } from '@/utils/timeUtils';

const DOMAIN = 'SumCreate';
const { Field } = FieldList;

const FILTERED_SHOW = {
  UNFINISHED: 'NONE|IN PROCESS',
  ALL: 'NONE|IN PROCESS|FINISH',
};

@connect(({ loading, SumCreate, user }) => ({
  loading,
  SumCreate,
  user,
}))
@Form.create()
@mountToTab()
class DetailSumCreate extends Component {
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
      SumCreate: { list, formData },
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
        createMessage({ type: 'warn', description: `????????????????????????${avalSettleEqva}` });
        const modifiedList = list.map(item => {
          if (`${actId}` === `${item.actId}`) return { ...item, [rowField]: avalSettleEqva };
          return item;
        });
        const applySettleEqvaCalc = modifiedList
          .map(l => l.applySettleEqva)
          .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
        const applySettleAmtCalc = applySettleEqvaCalc * formData.settlePrice;
        setFields({
          applySettleEqva: {
            value: `${applySettleEqvaCalc}`,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [rowField]: applySettleEqvaCalc,
            applySettleAmt: applySettleAmtCalc,
          },
        });
        // ?????????????????????
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
        const applySettleAmtCalc = applySettleEqvaCalc * formData.settlePrice;

        setFields({
          applySettleEqva: {
            value: `${applySettleEqvaCalc}`,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [rowField]: applySettleEqvaCalc,
            applySettleAmt: applySettleAmtCalc,
          },
        });
        // ?????????????????????
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
        createMessage({ type: 'warn', description: `????????????????????????100` });
        // ?????????????????????
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
        // ?????????????????????
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
      SumCreate: { list, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const fieldsData = getFieldsValue(['settleDate', 'remark']);
      const { applySettleEqva } = formD;
      const unfillReportPercentRows = list.filter(item => isNil(item.reportCompPercent));
      if (!isEmpty(unfillReportPercentRows)) {
        // createMessage({ type: 'warn', description: '????????????????????????' });
      } else if (!applySettleEqva || +applySettleEqva <= 0) {
        setFields({
          applySettleEqva: {
            value: '0 / 0',
            errors: [new Error('???????????????????????????????????????????????????')],
          },
        });
      } else {
        const formData = {
          settleType: 'TASK_BY_PACKAGE',
          taskId: fromQs().id,
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
      SumCreate: { list, formData: formD },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const fieldsData = getFieldsValue(['settleDate', 'remark']);
      const { applySettleEqva } = formD;
      const unfillReportPercentRows = list.filter(item => isNil(item.reportCompPercent));
      if (!isEmpty(unfillReportPercentRows)) {
        // createMessage({ type: 'warn', description: '????????????????????????' });
      } else if (!applySettleEqva || +applySettleEqva <= 0) {
        setFields({
          applySettleEqva: {
            value: '0 / 0',
            errors: [new Error('???????????????????????????????????????????????????')],
          },
        });
      } else {
        const formData = {
          settleType: 'TASK_BY_PACKAGE',
          taskId: fromQs().id,
          settleDate: fieldsData.settleDate ? toIsoDate(fieldsData.settleDate) : undefined,
          remark: fieldsData.remark,
          twEqvaSettleDEntities: list,
          submitted: true,
        };
        dispatch({ type: `${DOMAIN}/submitData`, payload: formData });
      }
    });
  };

  tableProps = () => {
    const {
      SumCreate: { list, tableStatus = FILTERED_SHOW.UNFINISHED },
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'actId',
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
          title: '??????',
          dataIndex: 'actNo',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'actName',
          width: 200,
        },
        {
          title: '????????????',
          dataIndex: 'planEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '???????????????',
          dataIndex: 'distedEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '???????????????',
          dataIndex: 'settledEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'actStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'settleStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????????????????',
          dataIndex: 'ssCompPercent',
          className: 'text-center',
          width: 150,
          render: value => (value !== null ? `${value}%` : undefined),
        },
        {
          title: '???????????????',
          dataIndex: 'reportCompPercent',
          width: 150,
          options: {
            rules: [
              {
                required: true,
                message: '????????????????????????',
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback();
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('?????????????????????');
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
          title: '??????????????????',
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
          title: '??????????????????',
          dataIndex: 'applySettleEqva',
          width: 150,
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['???????????????????????????']);
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('?????????????????????');
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
          title: '??????????????????',
          dataIndex: 'planStartDate',
          width: 120,
        },
        {
          title: '??????????????????',
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
      SumCreate: { formData, tableStatus = FILTERED_SHOW.UNFINISHED },
      user: {
        user: { info = {} },
      },
    } = this.props;
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryInfo`] ||
      loading.effects[`${DOMAIN}/saveData`] ||
      loading.effects[`${DOMAIN}/submitData`];

    console.warn(this.props);
    return (
      <PageHeaderWrapper title="??????????????????">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '??????' })}
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            ??????
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/task/originated')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="????????????" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList legend="????????????????????????" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="settleNo"
              label="????????????"
              decorator={{
                initialValue: formData.settleNo,
              }}
            >
              <Input disabled placeholder="????????????" />
            </Field>
            <Field
              name="applyResName"
              label="?????????"
              decorator={{
                initialValue: formData.applyResName || info.name,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="????????????"
              decorator={{
                initialValue: formData.applyDate || moment().format('YYYY-MM-DD'),
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="settleDate"
              label="????????????"
              decorator={{
                initialValue: formData.settleDate ? moment(formData.settleDate) : moment(),
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="applySettleEqva"
              label="??????????????????"
              decorator={{
                initialValue: `${isNil(formData.applySettleEqva) ? 0 : formData.applySettleEqva}`,
              }}
            >
              <Input
                disabled
                style={{ color: 'red' }}
                // addonAfter={
                //   formData.applySettleEqva
                //     ? mul(formData.applySettleEqva || 0, formData.settlePrice)
                //     : undefined
                // }
              />
            </Field>
            <Field
              name="eqvaSalary"
              label="????????????"
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
              label="???????????????/????????????"
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
                // addonBefore={`${formData.guaranteeRate}%`}
              />
            </Field>
            <Field
              name="resAmt"
              label="????????????????????????"
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
              label="????????????"
              decorator={{
                initialValue: formData.acceptMethodName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="projName" // projId
              label="????????????"
              decorator={{
                initialValue: formData.projName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taskName" // taskId
              label="???????????????"
              decorator={{
                initialValue: formData.taskName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="incomeResName" // incomeResId
              label="????????????"
              decorator={{
                initialValue: formData.incomeResName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="remark"
              label="????????????"
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="?????????????????????" />
            </Field>
          </FieldList>
          <Divider dashed />
          <Card
            className="tw-card-adjust"
            title={
              <>
                <span>????????????</span>
                <Radio.Group
                  buttonStyle="solid"
                  value={tableStatus}
                  onChange={e => this.changeTableStatus(e.target.value)}
                  style={{ marginLeft: 24 }}
                >
                  <Radio.Button value={FILTERED_SHOW.UNFINISHED}>??????????????????</Radio.Button>
                  <Radio.Button value={FILTERED_SHOW.ALL}>????????????</Radio.Button>
                </Radio.Group>
              </>
            }
            bordered={false}
          >
            <EditableDataTable {...this.tableProps()} />
          </Card>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DetailSumCreate;
