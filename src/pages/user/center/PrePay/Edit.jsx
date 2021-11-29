import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Card, InputNumber, Form, Input, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { selectUsersWithBu, selectBusWithOus, selectInternalOus } from '@/services/gen/list';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectBuBy } from '@/services/user/feeapply/feeapply';
import { queryParticularSelect } from '@/services/user/center/prePay';
import { fromQs } from '@/utils/stringUtils';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'prePayEdit'; //

const buColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const particularColumns = [
  { dataIndex: 'applyNo', title: '编号', span: 8 },
  { dataIndex: 'applyName', title: '名称', span: 16 },
];

const accColumns = [
  { title: '账户', dataIndex: 'accountNo', span: 10 },
  { title: '银行', dataIndex: 'bankName', span: 7 },
  { title: '网点', dataIndex: 'bankBranch', span: 7 },
];

@connect(({ loading, dispatch, prePayEdit }) => ({
  loading,
  dispatch,
  prePayEdit,
}))
@Form.create()
@mountToTab()
class PrePayEdit extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: id });
  }

  componentWillUnmount() {
    const {
      dispatch,
      form: { getFieldsValue },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: getFieldsValue(),
    });
  }

  handleSave = submitted => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      prePayEdit: { formData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { applyStatus, apprStatus } = formData;
        const payload = {
          ...values,
          id: fromQs().id,
          apprStatus,
          applyStatus,
          submitted,
        };
        dispatch({
          type: `${DOMAIN}/update`,
          payload,
        });
      }
    });
  };

  resubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      prePayEdit: { formData },
    } = this.props;
    const { id, remark } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // tag :: big step !!! taskId 包含在业务单据里面，不需要从 URL 里面拿了
        const { applyStatus, apprStatus, taskId } = formData;
        const payload = {
          ...values,
          id,
          apprStatus,
          applyStatus,
          submitted: false,
          remarkUrl: remark,
          taskId,
          result: 'APPLIED',
        };
        dispatch({
          type: `${DOMAIN}/resubmit`,
          payload,
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      prePayEdit: { formData, accList, contractList, reasonList },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const preparing = loading.effects[`${DOMAIN}/query`];
    const submitting = loading.effects[`${DOMAIN}/update`];
    const resubmitting = loading.effects[`${DOMAIN}/resubmit`];

    const { apprStatus } = formData;
    const showStartButton = !apprStatus || apprStatus === 'NOTSUBMIT';
    const showPushButton = apprStatus === 'REJECTED' || apprStatus === 'WITHDRAW';

    const applyName = [
      formData.applyResName,
      formData.pcontractName ? `(${formData.pcontractName})` : undefined,
      formData.reasonName ? `(${formData.reasonName})` : undefined,
      formData.prepayTypeName,
      getFieldValue('adpayAmt'),
    ]
      .filter(Boolean)
      .join('-');

    return (
      <PageHeaderWrapper title="预付款申请修改">
        <Card className="tw-card-rightLine">
          {!showPushButton && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={preparing || submitting}
              onClick={this.handleSave(false)}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          )}
          {showPushButton && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={preparing || submitting}
              onClick={() => this.resubmit()}
            >
              提交
            </Button>
          )}
          {showStartButton && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={preparing || resubmitting}
              onClick={this.handleSave(true)}
            >
              提交
            </Button>
          )}
          {fromQs().id && (
            <a
              href={`/print?scope=adPay&id=${fromQs().id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', marginRight: 8 }}
            >
              <Tooltip title="打印单据">
                <Button
                  className={classnames('tw-btn-default')}
                  type="dashed"
                  icon="printer"
                  size="large"
                />
              </Tooltip>
            </a>
          )}
          <Button
            className={classnames('tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/center/prePay')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="预付款申请新增" />}
        >
          <div className="tw-card-title">基本信息</div>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <FieldLine label="单据号/单据名称">
              <Field
                name="applyNo"
                decorator={{
                  initialValue: formData.applyNo,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input disabled placeholder="系统生成" />
              </Field>
              <Field
                name="applyName"
                decorator={{
                  initialValue: applyName,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled placeholder="系统生成" />
              </Field>
            </FieldLine>
            <Field
              name="feeApplyId"
              label="相关特殊费用申请"
              decorator={{
                initialValue: formData.feeApplyId,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => queryParticularSelect()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'applyName' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  let updateForm = {};
                  if (isNil(value) || isEmpty(value)) {
                    updateForm = {
                      applyType: undefined,
                      reasonId: undefined,
                      pcontractId: undefined,
                      prepayType: undefined,
                      expenseBuId: undefined,
                      applyResId: undefined,
                      ouId: undefined,
                    };
                  } else {
                    updateForm = {
                      applyType: value.applyType,
                      reasonId: value.reasonId,
                      pcontractId: 0,
                      prepayType: 'SPECIAL',
                      expenseBuId: value.expenseBuId,
                      applyResId: value.applyResId,
                      ouId: value.ouId,
                    };
                  }
                  setFieldsValue(updateForm);
                }}
              />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId,
                rules: [
                  {
                    required: true,
                    message: '请选择申请人',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={buColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
                allowClear
                disabled={!isNil(getFieldValue('feeApplyId'))}
                onChange={value => {
                  !isNil(value) &&
                    (dispatch({ type: `${DOMAIN}/queryReasonList`, payload: { resId: value } }) &&
                      dispatch({ type: `${DOMAIN}/queryContract`, payload: value }));
                  !isNil(value) &&
                    isNil(getFieldValue('supplierId')) &&
                    dispatch({
                      type: `${DOMAIN}/queryAccSelect`,
                      payload: { resId: value },
                    });
                }}
                onColumnsChange={value => {
                  let updateForm = {};
                  if (isNil(value) || isEmpty(value)) {
                    updateForm = {
                      applyBuId: undefined,
                    };
                  } else {
                    updateForm = {
                      applyBuId: value.receiverBuId,
                    };
                  }
                  setFieldsValue(updateForm);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { applyResName: isNil(value) ? undefined : value.name },
                  });
                }}
              />
            </Field>
            <Field
              name="applyBuId"
              label="申请人Base BU"
              decorator={{
                initialValue: formData.applyBuId,
              }}
            >
              <Selection
                transfer={{ code: 'id', name: 'name' }}
                source={() => selectBusWithOus()}
                disabled
              />
            </Field>

            <Field
              name="pcontractId"
              label="相关采购合同"
              decorator={{
                initialValue: formData.pcontractId,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={contractList}
                columns={buColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                disabled={!isNil(getFieldValue('feeApplyId'))}
                onColumnsChange={value => {
                  let updateForm = {};
                  // value.id === 0 无合同
                  if (isNil(value) || value.code === 'PU0000000000') {
                    updateForm = {
                      applyType: undefined,
                      reasonId: undefined,
                    };
                  } else if (isNil(value.subContractId) || value.subContractId === 0) {
                    // 不是匹配固定id的记录，不用进行多租户改造
                    updateForm = {
                      applyType: 'NONPROJECT',
                      reasonId: undefined,
                    };
                  } else {
                    updateForm = {
                      applyType: 'PROJECT',
                      reasonId: undefined,
                    };
                  }
                  setFieldsValue(updateForm);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { pcontractName: isNil(value) ? undefined : value.name },
                  });
                }}
              />
            </Field>
            <FieldLine label="是否项目/事由号" required>
              <Field
                name="applyType"
                decorator={{
                  initialValue: formData.applyType,
                  rules: [
                    {
                      required: true,
                      message: '请选择项目',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.UDC
                  code="ACC:PROJECT_JUDGE"
                  placeholder="请选择项目"
                  disabled={!isNil(getFieldValue('feeApplyId'))}
                  onChange={value => {
                    (value === 'NONPROJECT' || isNil(value)) &&
                      setFieldsValue({ reasonId: undefined });
                    setFieldsValue({ expenseBuId: undefined, ouId: undefined });
                  }}
                />
              </Field>
              <Field
                name="reasonId"
                decorator={{
                  initialValue: formData.reasonId,
                  rules: [
                    {
                      required: getFieldValue('applyType') === 'PROJECT',
                      message: '请选择事由号',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Selection
                  source={reasonList}
                  transfer={{ name: 'name', code: 'id' }}
                  placeholder={getFieldValue('applyType') === 'NONPROJECT' ? '' : '请选择事由号'}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 340 }}
                  dropdownAlign={{
                    points: ['tr', 'br'],
                    overflow: false,
                  }}
                  disabled={
                    !isNil(getFieldValue('feeApplyId')) || getFieldValue('applyType') !== 'PROJECT'
                  }
                  onValueChange={value => {
                    const updateValue = {
                      ouId: undefined,
                      expenseBuId: undefined,
                    };
                    if (!isNil(value) && !isEmpty(value)) {
                      const { ouId, buId, name } = value;
                      updateValue.ouId = ouId;
                      updateValue.expenseBuId = buId;
                    }
                    setFieldsValue(updateValue);
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { reasonName: isNil(value) ? undefined : value.name },
                    });
                  }}
                />
              </Field>
            </FieldLine>

            <Field
              name="prepayType"
              label="业务类型"
              decorator={{
                initialValue: formData.prepayType,
                rules: [
                  {
                    required: true,
                    message: '请选择业务类型',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="ACC:PREPAY_TYPE"
                placeholder="请选择业务类型"
                disabled={!isNil(getFieldValue('feeApplyId'))}
                onValueChange={value => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { prepayTypeName: isNil(value) ? undefined : value.name },
                  });
                }}
              />
            </Field>
            <Field
              name="expenseBuId"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuId,
                rules: [
                  {
                    required: true,
                    message: '请选择费用承担BU',
                  },
                ],
              }}
            >
              <Selection
                placeholder="请选择费用承担BU"
                source={() => selectBusWithOus()}
                transfer={{ name: 'name', code: 'id' }}
                disabled={
                  !isNil(getFieldValue('feeApplyId')) ||
                  (getFieldValue('applyType') === 'PROJECT' && !isNil(getFieldValue('reasonId')))
                }
                onValueChange={value => {
                  const updateValue = {
                    ouId: undefined,
                  };
                  if (!isNil(value) && !isEmpty(value)) {
                    const { ouId } = value;
                    updateValue.ouId = ouId;
                  }
                  setFieldsValue(updateValue);
                }}
              />
            </Field>
            <Field
              name="ouId"
              label="费用所属公司"
              decorator={{
                initialValue: formData.ouId,
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '根据承担费用BU所属公司司或项目',
              }}
            >
              <Selection source={selectInternalOus} placeholder="自动带出" />
            </Field>
            <Field
              name="payDate"
              label="约定付款期限"
              decorator={{
                initialValue: formData.payDate,
              }}
            >
              <DatePicker placeholder="请选择约定付款期限" />
            </Field>
            <Field
              name="supplierId"
              label="供应商"
              decorator={{
                initialValue: formData.supplierId,
              }}
            >
              <Selection
                placeholder="请选择供应商"
                onChange={value => {
                  if (isNil(value) || formData.supplierId !== value) {
                    const updateForm = {
                      abAccId: undefined,
                      bankName: undefined,
                      holderName: undefined,
                    };
                    setFieldsValue(updateForm);
                  }
                  const param = isNil(value)
                    ? { resId: getFieldValue('applyResId') }
                    : { supplierId: value };
                  dispatch({ type: `${DOMAIN}/queryAccSelect`, payload: param });
                  dispatch({ type: `${DOMAIN}/updateForm`, payload: { supplierId: value } });
                }}
                source={() => selectSupplier()}
              />
            </Field>
            <Field
              name="holderName"
              label="付款户名"
              decorator={{
                initialValue: formData.holderName,
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="abAccId"
              label="收款账户"
              decorator={{
                initialValue: formData.abAccId,
                rules: [
                  {
                    required: true,
                    message: '请选择收款账户',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={accList}
                columns={accColumns}
                transfer={{ key: 'id', code: 'id', name: 'accountNo' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 540 }}
                showSearch
                onColumnsChange={value => {
                  let updateForm = {};
                  if (isNil(value)) {
                    updateForm = {
                      bankName: undefined,
                      holderName: undefined,
                    };
                  } else {
                    updateForm = {
                      bankName: value.bankName,
                      holderName: value.holderName,
                    };
                  }
                  setFieldsValue(updateForm);
                }}
              />
            </Field>
            <Field
              name="bankName"
              label="收款银行"
              decorator={{
                initialValue: formData.bankName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="adpayAmt"
              label="预付款总额"
              decorator={{
                initialValue: formData.adpayAmt,
                rules: [
                  {
                    required: true,
                    message: '请输入预付款总额',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || moment().format('YYYY-MM-DD'),
              }}
            >
              <DatePicker className="x-fill-100" disabled />
            </Field>
            <Field
              name="applyStatusDesc"
              label="申请状态"
              decorator={{
                initialValue: formData.applyStatusDesc,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              name="attache"
              label="相关附件"
              decorator={{
                initialValue: formData.attache,
              }}
            >
              <FileManagerEnhance
                api="/api/worth/v1/adpay/sfs/token"
                dataKey={formData.id}
                listType="text"
              />
            </Field>
            {/* <Field presentational /> */}
            <Field
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              name="remark"
              label="备注说明"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} className="x-fill-100" />
            </Field>
          </FieldList>

          <br />
          <div style={{ marginTop: 60 }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrePayEdit;
