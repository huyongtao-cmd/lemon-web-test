import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, Divider, Col, InputNumber } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { isEmpty, isNil } from 'ramda';
import createMessage from '@/components/core/AlertMessage';

import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { UdcSelect, Selection, DatePicker } from '@/pages/gen/field';

import AsyncSelect from '@/components/common/AsyncSelect';
import { selectFinperiod, selectSubContract, recvPlanSelect } from '@/services/user/Contract/sales';
import { selectProjectConditional } from '@/services/user/project/project';
import {
  selectLedgerConditional,
  selectFeeCodeConditional,
  selectAccConditional,
} from '@/services/user/equivalent/equivalent';

const DOMAIN = 'generalAmtSettleCreate';
const { Field, FieldLine } = FieldList;
const { Option } = Select;
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, generalAmtSettleCreate, dispatch, user }) => ({
  loading,
  ...generalAmtSettleCreate,
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
class GeneralAmtSettleCreate extends PureComponent {
  componentDidMount() {
    const { dispatch, contractList } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { id: param.id },
      });
    }
    selectProjectConditional({ projStatus: 'ACTIVE' }).then(data => {
      if (data.response) {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { projectList: data.response },
        });
      }
    });

    selectLedgerConditional({ auTypes: "'BU','PROJ'" }).then(data => {
      if (data.response) {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { buLedgerList: data.response },
        });
      }
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  handleOutAcc = projId => {
    const { formData, buLedgerList, dispatch, form } = this.props;
    const { busiType } = formData;
    if (busiType === 'CONTRACT') {
      const ledgerList = buLedgerList;
      let projLedger = [];
      if (projId) {
        projLedger = ledgerList.filter(
          (item, index, arr) => item.valSphd1 === 'PROJ' && item.valSphd2 === projId + ''
        );
      }
      if (isEmpty(projLedger)) {
        form.setFieldsValue({ outAccount: undefined });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { projLedgerList: [] },
        });
        createMessage({ type: 'warn', description: '未找到项目账户' });
      } else {
        // projLedger.key=projLedger.id;
        form.setFieldsValue({ outAccount: undefined });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { projLedgerList: [...projLedger], outAccount: undefined },
        });
      }
    }
  };

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: { ...formData, ...values },
      });
    });
  };

  handleTransfer = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/transfer`,
      payload: { id },
    });
  };

  // 提交按钮事件
  submit = isSubmit => {
    const { form, dispatch, formData } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/submit`,
        payload: { ...formData, ...values },
      });
    });
  };

  render() {
    const {
      loading,
      projectDisableFlag,
      recvPlanList,
      projectList,
      buLedgerList = [],
      projLedgerList = [],
      outFeeCodeList = [],
      inFeeCodeList = [],
      outAccList = [],
      inAccList = [],
      formData,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
    } = this.props;
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetail`] ||
      loading.effects[`${DOMAIN}/transfer`] ||
      loading.effects[`${DOMAIN}/save`] ||
      loading.effects[`${DOMAIN}/submit`];

    const sideStyle = { textAlign: 'center', fontWeight: 'bold' };

    const { id, apprId } = fromQs();

    return (
      <PageHeaderWrapper title="泛用金额结算">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={disabledBtn}
            onClick={this.handleSave}
            hidden={apprId}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={disabledBtn}
            hidden={apprId}
            onClick={() => {
              if (formData.id) {
                this.handleTransfer(formData.id);
              } else {
                createMessage({ type: 'warn', description: '请先保存！' });
              }
            }}
          >
            过账
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={disabledBtn}
            hidden={!apprId}
            onClick={() => this.submit(formData.id)}
          >
            提交
          </Button>
        </Card>

        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList legend="申请信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyResId"
              label="单据创建人"
              decorator={{
                initialValue: formData.applyResId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="settleNo"
              label="结算单号"
              decorator={{
                initialValue: formData.settleNo,
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>

            <Field
              name="createType"
              label="单据创建类型"
              decorator={{
                initialValue: formData.createType || 'HANDWORK',
                rules: [{ required: true, message: '请选择单据创建类型' }],
              }}
            >
              <UdcSelect disabled code="ACC.CREATE_TYPE" placeholder="请选择单据创建类型" />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || formatDT(moment()),
              }}
            >
              <DatePicker disabled format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
          </FieldList>

          <FieldList legend="结算相关信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="busiType"
              label="业务类型"
              decorator={{
                initialValue: formData.busiType,
                rules: [{ required: true, message: '请选择单据创建类型' }],
              }}
            >
              <UdcSelect code="ACC:NORM_SETTLE_TYPE" placeholder="请选择单据创建类型" />
            </Field>

            <Field
              name="relevNo"
              label="相关业务单据号"
              decorator={{
                initialValue: formData.relevNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="contractId"
              label="相关子合同"
              decorator={{
                initialValue: formData.contractId,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectSubContract()}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({ recvplanId: undefined });
                  if (value && value.id) {
                    const proj = projectList.filter(
                      (item, index, arr) => item.valSphd1 === value.id + ''
                    );
                    const projId = isNil(proj[0]) ? undefined : proj[0].id;
                    this.handleOutAcc(projId);
                    setFieldsValue({ projId });
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { projectDisableFlag: true },
                    });

                    recvPlanSelect(value.id).then(data => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: { recvPlanList: data.response },
                      });
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { projectDisableFlag: false },
                    });
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { recvPlanList: [] },
                    });
                  }
                }}
              />
            </Field>

            <Field
              name="recvplanId"
              label="收款号"
              decorator={{
                initialValue: undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={recvPlanList || []}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>

            <Field
              name="projId"
              label="相关项目"
              decorator={{
                initialValue: formData.projId,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={projectList || []}
                disabled={projectDisableFlag}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  if (value && value.id) {
                    this.handleOutAcc(value.id);
                  }
                }}
              />
            </Field>

            <Field
              name="approveSettleAmt"
              label="交易总额"
              decorator={{
                initialValue: formData.approveSettleAmt,
                rules: [{ required: true, message: '请输入交易总额' }],
              }}
            >
              <InputNumber className="x-fill-100" />
            </Field>

            <Field
              name="settleDate"
              label="交易日期"
              decorator={{
                initialValue: formData.settleDate || formatDT(moment()),
                rules: [{ required: true, message: '请输入交易日期' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode,
                rules: [{ required: true, message: '请选择币种' }],
              }}
            >
              <UdcSelect code="COM.CURRENCY_KIND" placeholder="请选择币种" />
            </Field>

            <Field
              name="finPeriodId"
              label="财务期间"
              decorator={{
                initialValue: formData.finPeriodId,
                rules: [{ required: true, message: '请选择财务期间' }],
              }}
            >
              <AsyncSelect
                source={() => selectFinperiod().then(resp => resp.response)}
                placeholder="请选择财务期间"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
          </FieldList>

          <FieldList legend="交易方信息" getFieldDecorator={getFieldDecorator} col={2}>
            <div
              className="ant-row ant-form-item ant-col-xs-24 ant-col-sm-8"
              style={{ ...sideStyle, textAlign: 'right' }}
            >
              支出方
            </div>
            <div className="ant-row ant-form-item ant-col-xs-24 ant-col-sm-8" style={sideStyle}>
              --------&gt;
            </div>
            <div
              className="ant-row ant-form-item ant-col-xs-24 ant-col-sm-8"
              style={{ ...sideStyle, textAlign: 'left' }}
            >
              收入方
            </div>

            <Field
              name="outAccount"
              label="支出账户"
              decorator={{
                initialValue: formData.outAccount,
                rules: [{ required: true, message: '请选择支出账户' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={formData.busiType === 'CONTRACT' ? projLedgerList : buLedgerList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({ outAcc: undefined, outFeeCode: undefined });
                  if (value && value.id) {
                    const ledger = buLedgerList.filter(
                      (item, index, arr) => item.id === value.id
                    )[0];
                    if (!ledger) {
                      return;
                    }
                    selectFeeCodeConditional({ type: ledger.valSphd1, id: ledger.valSphd2 }).then(
                      data => {
                        if (data.response) {
                          const feeCode = data.response.map(fee => ({ ...fee, id: fee.code }));
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { outFeeCodeList: feeCode },
                          });
                        }
                      }
                    );
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { outFeeCodeList: [] },
                    });
                  }
                }}
              />
            </Field>
            <Field
              name="inAccount"
              label="收入账户"
              decorator={{
                initialValue: formData.inAccount,
                rules: [{ required: true, message: '请选择收入账户' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={buLedgerList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({ inAcc: undefined, inFeeCode: undefined });
                  if (value && value.id) {
                    const ledger = buLedgerList.filter(
                      (item, index, arr) => item.id === value.id
                    )[0];
                    if (!ledger) {
                      return;
                    }
                    selectFeeCodeConditional({ type: ledger.valSphd1, id: ledger.valSphd2 }).then(
                      data => {
                        if (data.response) {
                          const feeCode = data.response.map(fee => ({ ...fee, id: fee.code }));
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { inFeeCodeList: feeCode },
                          });
                        }
                      }
                    );
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { inFeeCodeList: [] },
                    });
                  }
                }}
              />
            </Field>

            <Field
              name="outFeeCode"
              label="费用码"
              decorator={{
                initialValue: formData.outFeeCode,
              }}
            >
              {/* <AsyncSelect allowClear={false} source={feeCodeList} /> */}
              <Selection.Columns
                className="x-fill-100"
                source={outFeeCodeList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({ outAcc: undefined });
                  if (value && value.id) {
                    const outAccount = getFieldValue('outAccount');
                    const ledger = buLedgerList.filter(
                      (item, index, arr) => item.id === outAccount
                    )[0];
                    if (!ledger) {
                      return;
                    }
                    selectAccConditional({
                      type: ledger.valSphd1,
                      id: ledger.valSphd2,
                      feeCode: value.id,
                    }).then(data => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: { outAccList: data.response },
                      });
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { outAccList: [] },
                    });
                  }
                }}
              />
            </Field>

            <Field
              name="inFeeCode"
              label="费用码"
              decorator={{
                initialValue: formData.inFeeCode,
              }}
            >
              {/* <AsyncSelect allowClear={false} source={feeCodeList} /> */}
              <Selection.Columns
                className="x-fill-100"
                source={inFeeCodeList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({ inAcc: undefined });
                  if (value && value.id) {
                    const inAccount = getFieldValue('inAccount');
                    const ledger = buLedgerList.filter(
                      (item, index, arr) => item.id === inAccount
                    )[0];
                    if (!ledger) {
                      return;
                    }
                    selectAccConditional({
                      type: ledger.valSphd1,
                      id: ledger.valSphd2,
                      feeCode: value.id,
                    }).then(data => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: { inAccList: data.response },
                      });
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { inAccList: [] },
                    });
                  }
                }}
              />
            </Field>

            <Field
              name="outAcc"
              label="财务科目"
              decorator={{
                initialValue: formData.outAcc,
              }}
            >
              {/* <AsyncSelect allowClear={false} source={feeCodeList} /> */}
              <Selection.Columns
                className="x-fill-100"
                source={outAccList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>

            <Field
              name="inAcc"
              label="财务科目"
              decorator={{
                initialValue: formData.inAcc,
              }}
            >
              {/* <AsyncSelect allowClear={false} source={feeCodeList} /> */}
              <Selection.Columns
                className="x-fill-100"
                source={inAccList}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default GeneralAmtSettleCreate;
