import React, { PureComponent } from 'react';
import { Button, Form, Card, Input, DatePicker, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import moment from 'moment';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { UdcSelect, UdcCheck, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectContract, selectFinperiod } from '@/services/user/Contract/sales';
import { selectInternalOus } from '@/services/gen/list';

const DOMAIN = 'userContractCreateMain';
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, userContractCreateMain, dispatch }) => ({
  loading,
  userContractCreateMain,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      if (value instanceof Object && name !== 'signDate') {
        const key = name.split('Id')[0];
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
        });
      } else if (name === 'signDate') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: formatDT(value) },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: value },
        });
      }
    }
  },
})
@mountToTab()
class CreateMain extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { leadId } = fromQs();
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({ type: `${DOMAIN}/oppo` });
    dispatch({ type: `${DOMAIN}/cust` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/user` });
    dispatch({ type: `${DOMAIN}/salesRegionBu` });
    if (leadId) {
      dispatch({
        type: `${DOMAIN}/queryLead`,
        payload: leadId,
      });
    }
    // 加载页面配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_CREATE' },
    });
  }

  handleSourceType = e => {
    const {
      dispatch,
      userContractCreateMain: { formData },
    } = this.props;
    if (e.target.value === 'EXTERNAL') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            sourceType: e.target.value,
            internalBuId: null,
            internalResId: null,
            profitDesc: null,
          },
        },
      });
    } else if (e.target.value === 'INTERNAL') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            sourceType: e.target.value,
            externalIden: null,
            externalName: null,
            externalPhone: null,
          },
        },
      });
    }
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userContractCreateMain: { formData },
      dispatch,
    } = this.props;
    if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
      createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
      return;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/create`,
          payload: formData,
        });
      }
    });
  };

  handleChange = value => {
    const { dispatch, form } = this.props;
    if (!value) {
      return;
    }
    dispatch({
      type: `${DOMAIN}/UDC_SmallClass`,
      payload: value,
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        saleType2: '',
        saleType2Desc: '',
      });
    });
  };

  handleLead = value => {
    const { dispatch } = this.props;
    if (value && value.id) {
      dispatch({
        type: `${DOMAIN}/queryLead`,
        payload: value.id,
      });
    }
  };

  handleRegionBu = value => {
    const { dispatch } = this.props;
    if (value && value.id) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          regionPrincipalResName: value.salesmanResName,
        },
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userContractCreateMain: {
        formData,
        smallClass = [],
        oppoData = [],
        oppoDataSource = [],
        custData = [],
        custDataSource = [],
        buData = [],
        signBuDataSource = [],
        deliBuDataSource = [],
        coBuDataSource = [],
        codeliBuDataSource = [],
        internalBuDataSource = [],
        userData = [],
        salesmanResDataSource = [],
        deliResDataSource = [],
        coResDataSource = [],
        codeliResDataSource = [],
        internalResDataSource = [],
        salesRegionBuData = [],
        salesRegionBuDataSource = [],
        pageConfig = {},
      },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;
    const isInternal = formData.sourceType === 'INTERNAL';

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const { pageFieldViews = {} } = pageBlockViews[0];
    if (!pageFieldViews) {
      return <div />;
    }
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryLead`] || loading.effects[`${DOMAIN}/create`];

    const {
      contractName,
      contractNo,
      ouId,
      userdefinedNo,
      oppoId,
      relatedContractId,
      custId,
      newContractFlag,
      signDate,
      specialConcerned,
      attache,
      audit,
      contractStatus,
      closeReason,
      currCode,
      remark,
      createUserId,
      createTime,
      custProj,
      saleContent,
      saleType1,
      saleType2,
      deliveryAddress,
      finPeriodId,
      amt,
      extraAmt,
      effectiveAmt,
      grossProfit,
      horizontal,
      regionBuId,
      regionPrincipalResName,
      signBuId,
      salesmanResId,
      deliBuId,
      deliResId,
      coBuId,
      coResId,
      codeliBuId,
      codeliResId,
      platType,
      mainType,
      pmoResId,
      sourceType,
      internalBuId,
      internalResId,
      profitDesc,
      externalIden,
      externalName,
      externalPhone,
    } = pageFieldJson;
    return (
      <PageHeaderWrapper title="创建销售合同">
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
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title
              icon="profile"
              id="user.contract.menu.createContract"
              defaultMessage="创建销售合同"
            />
          }
        >
          <FieldList
            layout="horizontal"
            legend={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {contractName.visibleFlag === 1 && (
              <Field
                name="contractName"
                label={contractName.displayName}
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.contractName,
                  rules: [
                    {
                      required: contractName.requiredFlag,
                      message: `请输入${contractName.displayName}`,
                    },
                  ],
                }}
              >
                <Input
                  disabled={contractName.fieldMode !== 'EDITABLE'}
                  placeholder={`请输入${contractName.displayName}`}
                />
              </Field>
            )}

            {contractNo.visibleFlag === 1 && (
              <Field
                name="contractNo"
                label={contractNo.displayName}
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.contractNo,
                }}
              >
                <Input disabled={readOnly} placeholder="系统生成" />
              </Field>
            )}

            {ouId.visibleFlag === 1 && (
              <Field
                name="ouId"
                label={ouId.displayName}
                decorator={{
                  initialValue: formData.ouId,
                  rules: [{ required: ouId.requiredFlag, message: `请选择${ouId.displayName}` }],
                }}
                {...FieldListLayout}
              >
                <AsyncSelect
                  source={() => selectInternalOus().then(resp => resp.response)}
                  placeholder={`请选择${ouId.displayName}`}
                  disabled={ouId.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {userdefinedNo.visibleFlag === 1 && (
              <Field
                name="userdefinedNo"
                label={userdefinedNo.displayName}
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.userdefinedNo,
                  rules: [
                    {
                      required: userdefinedNo.requiredFlag,
                      message: `请输入${userdefinedNo.displayName}`,
                    },
                  ],
                }}
              >
                <Input
                  placeholder={`请输入${userdefinedNo.displayName}`}
                  disabled={userdefinedNo.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {oppoId.visibleFlag === 1 && (
              <Field
                name="oppoId"
                label="关联商机"
                decorator={{
                  initialValue:
                    formData.oppoId && formData.oppoName
                      ? {
                          code: formData.oppoId,
                          name: formData.oppoName,
                        }
                      : null,
                  rules: [
                    {
                      required: oppoId.requiredFlag,
                      message: `请选择${oppoId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  placeholder={`请选择${oppoId.displayName}`}
                  columns={subjCol}
                  dataSource={oppoDataSource}
                  onChange={this.handleLead}
                  disabled={oppoId.fieldMode !== 'EDITABLE'}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          oppoDataSource: oppoData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {relatedContractId.visibleFlag === 1 && (
              <Field
                name="relatedContractId"
                label={relatedContractId.displayName}
                decorator={{
                  initialValue: formData.relatedContractId,
                  rules: [
                    {
                      required: relatedContractId.requiredFlag,
                      message: `请输入${relatedContractId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <AsyncSelect
                  source={() => selectContract().then(resp => resp.response)}
                  disabled={relatedContractId.fieldMode !== 'EDITABLE'}
                  placeholder={`请选择${relatedContractId.displayName}`}
                />
              </Field>
            )}

            {custId.visibleFlag === 1 && (
              <Field
                name="custId"
                label={custId.displayName}
                decorator={{
                  initialValue:
                    formData.custId && formData.custName
                      ? {
                          code: formData.custId,
                          name: formData.custName,
                        }
                      : null,
                  rules: [
                    {
                      required: custId.requiredFlag,
                      message: `请选择${custId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  placeholder={`请选择${custId.displayName}`}
                  columns={subjCol}
                  dataSource={custDataSource}
                  disabled={custId.fieldMode !== 'EDITABLE'}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          custDataSource: custData.filter(
                            d =>
                              !!d.name &&
                              (d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {newContractFlag.visibleFlag === 1 && (
              <Field
                name="newContractFlag"
                label={newContractFlag.displayName}
                decorator={{
                  initialValue: formData.newContractFlag,
                  rules: [
                    {
                      required: newContractFlag.requiredFlag,
                      message: `请选择${newContractFlag.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="TSK.CONTRACT_CUSTPROP"
                  placeholder={`请选择${newContractFlag.displayName}`}
                  disabled={newContractFlag.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {signDate.visibleFlag === 1 && (
              <Field
                name="signDate"
                label={signDate.displayName}
                decorator={{
                  initialValue: formData.signDate ? moment(formData.signDate) : null,
                  rules: [
                    {
                      required: signDate.requiredFlag,
                      message: `请选择${signDate.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker
                  placeholder={`请选择${signDate.displayName}`}
                  format="YYYY-MM-DD"
                  className="x-fill-100"
                  disabled={signDate.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {specialConcerned.visibleFlag === 1 && (
              <Field
                name="specialConcerned"
                label={specialConcerned.displayName}
                decorator={{
                  initialValue: formData.specialConcerned,
                  rules: [
                    {
                      required: specialConcerned.requiredFlag,
                      message: `请输入${specialConcerned.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input
                  disabled={specialConcerned.fieldMode !== 'EDITABLE'}
                  placeholder={`请输入${specialConcerned.displayName}`}
                />
              </Field>
            )}

            {attache.visibleFlag && (
              <Field
                decorator={{
                  initialValue: formData.attache,
                  rules: [
                    {
                      required: attache.requiredFlag,
                      message: `请输入${attache.displayName}`,
                    },
                  ],
                }}
                name="attache"
                label={attache.displayName}
                {...FieldListLayout}
              >
                <FileManagerEnhance
                  api="/api/op/v1/contract/sfs/token"
                  dataKey=""
                  listType="text"
                  disabled={false}
                />
              </Field>
            )}

            {audit.visibleFlag === 1 && (
              <Field
                name="audit"
                label={audit.displayName}
                decorator={{
                  initialValue: formData.audit,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} placeholder={`请输入${audit.displayName}`} />
              </Field>
            )}

            {contractStatus.visibleFlag === 1 && (
              <Field
                name="contractStatus"
                label={contractStatus.displayName}
                decorator={{
                  initialValue: formData.contractStatus,
                  rules: [
                    {
                      required: contractStatus.requiredFlag,
                      message: `请选择${contractStatus.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  disabled={contractStatus.fieldMode !== 'EDITABLE'}
                  code="TSK.CONTRACT_STATUS"
                  placeholder={`请选择${contractStatus.displayName}`}
                />
              </Field>
            )}

            {closeReason.visibleFlag === 1 && (
              <Field
                name="closeReason"
                label={closeReason.displayName}
                decorator={{
                  initialValue: formData.closeReason,
                  rules: [
                    {
                      required: closeReason.requiredFlag,
                      message: `请选择${closeReason.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  disabled={readOnly}
                  code="TSK.CONTRACT_CLOSE_REASON"
                  placeholder={`请选择${closeReason.displayName}`}
                />
              </Field>
            )}

            {currCode.visibleFlag === 1 && (
              <Field
                name="currCode"
                label={currCode.displayName}
                decorator={{
                  initialValue: formData.currCode,
                  rules: [
                    {
                      required: currCode.requiredFlag,
                      message: `请选择${currCode.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="COM.CURRENCY_KIND"
                  placeholder={`请选择${currCode.displayName}`}
                  disabled={currCode.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {remark.visibleFlag === 1 && (
              <Field
                name="remark"
                label={remark.displayName}
                decorator={{
                  initialValue: formData.remark,
                  rules: [
                    {
                      required: remark.requiredFlag,
                      message: `请输入${remark.displayName}`,
                    },
                  ],
                }}
                fieldCol={1}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                <Input.TextArea
                  placeholder={`请输入${remark.displayName}`}
                  rows={3}
                  disabled={remark.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {createUserId.visibleFlag === 1 && (
              <Field label={createUserId.displayName} presentational {...FieldListLayout}>
                <Input value={formData.createUserName} disabled={readOnly} placeholder="系统生成" />
              </Field>
            )}

            {createTime.visibleFlag === 1 && (
              <Field label={createTime.displayName} presentational {...FieldListLayout}>
                <Input
                  value={formData.createTime ? formatDT(formData.createTime) : null}
                  disabled={readOnly}
                  placeholder="系统生成"
                />
              </Field>
            )}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="销售和财务信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {custProj.visibleFlag === 1 && (
              <Field
                name="custProj"
                label={custProj.displayName}
                decorator={{
                  initialValue: formData.custProj,
                  rules: [
                    {
                      required: custProj.requiredFlag,
                      message: `请输入${custProj.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input
                  placeholder={`请输入${custProj.displayName}`}
                  disabled={custProj.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {saleContent.visibleFlag === 1 && (
              <Field
                name="saleContent"
                label={saleContent.displayName}
                decorator={{
                  initialValue: formData.saleContent,
                  rules: [
                    {
                      required: saleContent.requiredFlag,
                      message: `请输入${saleContent.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input
                  placeholder={`请输入${saleContent.displayName}`}
                  disabled={saleContent.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {saleType1.visibleFlag === 1 && (
              <Field
                name="saleType1"
                label={saleType1.displayName}
                decorator={{
                  initialValue: formData.saleType1,
                  rules: [
                    {
                      required: saleType1.requiredFlag,
                      message: `请选择${saleType1.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="TSK.SALE_TYPE1"
                  onChange={this.handleChange}
                  placeholder={`请选择${saleType1.displayName}`}
                  disabled={saleType1.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {saleType2.visibleFlag === 1 && (
              <Field
                name="saleType2"
                label={saleType2.displayName}
                decorator={{
                  initialValue: formData.saleType2,
                  rules: [
                    {
                      required: saleType2.requiredFlag,
                      message: `请选择${saleType2.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <AsyncSelect
                  source={smallClass}
                  placeholder={`请选择${saleType2.displayName}`}
                  disabled={saleType2.fieldMode !== 'EDITABLE'}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Field>
            )}

            {deliveryAddress.visibleFlag === 1 && (
              <Field
                name="deliveryAddress"
                label={deliveryAddress.displayName}
                decorator={{
                  initialValue: formData.deliveryAddress,
                  rules: [
                    {
                      required: deliveryAddress.requiredFlag,
                      message: `请输入${deliveryAddress.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input
                  placeholder={`请输入${deliveryAddress.displayName}`}
                  disabled={deliveryAddress.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {finPeriodId.visibleFlag === 1 && (
              <Field
                name="finPeriodId"
                label={finPeriodId.displayName}
                decorator={{
                  initialValue: formData.finPeriodId,
                  rules: [
                    {
                      required: finPeriodId.requiredFlag,
                      message: `请选择${finPeriodId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <AsyncSelect
                  source={() => selectFinperiod().then(resp => resp.response)}
                  placeholder={`请选择${finPeriodId.displayName}`}
                  disabled={finPeriodId.fieldMode !== 'EDITABLE'}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Field>
            )}

            {amt.visibleFlag === 1 && (
              <Field
                name="amt"
                label={amt.displayName}
                decorator={{
                  initialValue: formData.amt,
                  rules: [
                    {
                      required: amt.requiredFlag,
                      message: `请输入${amt.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <InputNumber
                  placeholder={`请输入${amt.displayName}`}
                  disabled={amt.fieldMode !== 'EDITABLE'}
                  className="x-fill-100"
                />
              </Field>
            )}

            {extraAmt.visibleFlag === 1 && (
              <Field
                name="extraAmt"
                label={extraAmt.displayName}
                decorator={{
                  initialValue: formData.extraAmt,
                  rules: [
                    {
                      required: extraAmt.requiredFlag,
                      message: `请输入${extraAmt.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <InputNumber
                  placeholder={`请输入${extraAmt.displayName}`}
                  disabled={extraAmt.fieldMode !== 'EDITABLE'}
                  className="x-fill-100"
                />
              </Field>
            )}

            {effectiveAmt.visibleFlag === 1 && (
              <Field
                name="effectiveAmt"
                label={effectiveAmt.displayName}
                decorator={{
                  initialValue: formData.effectiveAmt,
                  rules: [
                    {
                      required: effectiveAmt.requiredFlag,
                      message: `请输入${effectiveAmt.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <InputNumber
                  placeholder={`请输入${effectiveAmt.displayName}`}
                  disabled={effectiveAmt.fieldMode !== 'EDITABLE'}
                  className="x-fill-100"
                />
              </Field>
            )}

            {grossProfit.visibleFlag === 1 && (
              <Field
                name="grossProfit"
                label={grossProfit.displayName}
                decorator={{
                  initialValue: formData.grossProfit,
                  rules: [
                    {
                      required: grossProfit.requiredFlag,
                      message: `请输入${grossProfit.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <InputNumber
                  placeholder={`请输入${grossProfit.displayName}`}
                  disabled={grossProfit.fieldMode !== 'EDITABLE'}
                  className="x-fill-100"
                />
              </Field>
            )}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="内部信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {regionBuId.visibleFlag === 1 && (
              <Field
                name="regionBuId"
                label={regionBuId.displayName}
                decorator={{
                  initialValue:
                    formData.regionBuId && formData.regionBuName
                      ? {
                          code: formData.regionBuId,
                          name: formData.regionBuName,
                        }
                      : null,
                  rules: [
                    {
                      required: regionBuId.requiredFlag,
                      message: `请选择${regionBuId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  placeholder={`请选择${regionBuId.displayName}`}
                  disabled={regionBuId.fieldMode !== 'EDITABLE'}
                  onChange={this.handleRegionBu}
                  columns={subjCol}
                  dataSource={salesRegionBuDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          salesRegionBuDataSource: salesRegionBuData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {regionPrincipalResName.visibleFlag === 1 && (
              <Field label={regionPrincipalResName.displayName} presentational {...FieldListLayout}>
                <Input value={formData.regionPrincipalResName} disabled={readOnly} />
              </Field>
            )}
            {signBuId.visibleFlag === 1 && (
              <Field
                name="signBuId"
                label={signBuId.displayName}
                decorator={{
                  initialValue: formData.signBuId,
                  rules: [
                    {
                      required: signBuId.requiredFlag,
                      message: `请选择${signBuId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.ColumnsForBu />
              </Field>
            )}

            {salesmanResId.visibleFlag === 1 && (
              <Field
                name="salesmanResId"
                label={salesmanResId.displayName}
                decorator={{
                  initialValue:
                    formData.salesmanResId && formData.salesmanResName
                      ? {
                          code: formData.salesmanResId,
                          name: formData.salesmanResName,
                        }
                      : null,
                  rules: [
                    {
                      required: salesmanResId.requiredFlag,
                      message: `请选择${salesmanResId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  placeholder={`请选择${salesmanResId.displayName}`}
                  disabled={salesmanResId.fieldMode !== 'EDITABLE'}
                  columns={subjCol}
                  dataSource={salesmanResDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          salesmanResDataSource: userData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {deliBuId.visibleFlag === 1 && (
              <Field
                name="deliBuId"
                label={deliBuId.displayName}
                decorator={{
                  initialValue: formData.deliBuId,
                  rules: [
                    {
                      required: deliBuId.requiredFlag,
                      message: `请选择${deliBuId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.ColumnsForBu />
              </Field>
            )}

            {deliResId.visibleFlag === 1 && (
              <Field
                name="deliResId"
                label={deliResId.displayName}
                decorator={{
                  initialValue:
                    formData.deliResId && formData.deliResName
                      ? {
                          code: formData.deliResId,
                          name: formData.deliResName,
                        }
                      : null,
                  rules: [
                    {
                      required: deliResId.requiredFlag,
                      message: `请选择${deliResId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  placeholder={`请输入${deliResId.displayName}`}
                  disabled={deliResId.fieldMode !== 'EDITABLE'}
                  columns={subjCol}
                  dataSource={deliResDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          deliResDataSource: userData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {coBuId.visibleFlag === 1 && (
              <Field
                name="coBuId"
                label={coBuId.displayName}
                decorator={{
                  initialValue: formData.coBuId,
                  rules: [
                    {
                      required: coBuId.requiredFlag,
                      message: `请选择${coBuId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.ColumnsForBu />
              </Field>
            )}

            {coResId.visibleFlag === 1 && (
              <Field
                name="coResId"
                label={coResId.displayName}
                decorator={{
                  initialValue:
                    formData.coResId && formData.coResName
                      ? {
                          code: formData.coResId,
                          name: formData.coResName,
                        }
                      : null,
                  rules: [
                    {
                      required: coResId.requiredFlag,
                      message: `请选择${coResId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  placeholder={`请选择${coResId.displayName}`}
                  disabled={coResId.fieldMode !== 'EDITABLE'}
                  columns={subjCol}
                  dataSource={coResDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          coResDataSource: userData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {codeliBuId.visibleFlag === 1 && (
              <Field
                name="codeliBuId"
                label={codeliBuId.displayName}
                decorator={{
                  initialValue: formData.codeliBuId,
                  rules: [
                    {
                      required: codeliBuId.requiredFlag,
                      message: `请选择${codeliBuId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.ColumnsForBu />
              </Field>
            )}

            {codeliResId.visibleFlag === 1 && (
              <Field
                name="codeliResId"
                label={codeliResId.displayName}
                decorator={{
                  initialValue:
                    formData.codeliResId && formData.codeliResName
                      ? {
                          code: formData.codeliResId,
                          name: formData.codeliResName,
                        }
                      : null,
                  rules: [
                    {
                      required: codeliResId.requiredFlag,
                      message: `请选择${codeliResId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  placeholder={`请选择${codeliResId.displayName}`}
                  disabled={codeliResId.fieldMode !== 'EDITABLE'}
                  columns={subjCol}
                  dataSource={codeliResDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          codeliResDataSource: userData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}

            {platType.visibleFlag === 1 && (
              <Field
                name="platType"
                label={platType.displayName}
                decorator={{
                  initialValue: formData.platType,
                  rules: [
                    {
                      required: platType.requiredFlag,
                      message: `请选择${platType.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="TSK.PLAT_TYPE"
                  placeholder={`请选择${platType.displayName}`}
                  disabled={platType.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            {mainType.visibleFlag === 1 && (
              <Field
                name="mainType"
                label={mainType.displayName}
                decorator={{
                  initialValue: formData.mainType,
                  rules: [
                    {
                      required: mainType.requiredFlag,
                      message: `请选择${mainType.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="TSK.MAIN_TYPE"
                  disabled={readOnly}
                  placeholder={`请选择${mainType.displayName}`}
                />
              </Field>
            )}
            {pmoResId.visibleFlag === 1 && (
              <Field
                name="pmoResId"
                label={pmoResId.displayName}
                decorator={{
                  initialValue:
                    formData.pmoResId && formData.pmoResIdName
                      ? {
                          code: formData.pmoResId,
                          name: formData.pmoResIdName,
                        }
                      : null,
                  rules: [
                    {
                      required: pmoResId.requiredFlag,
                      message: `请选择${pmoResId.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  placeholder={`请选择${pmoResId.displayName}`}
                  disabled={pmoResId.fieldMode !== 'EDITABLE'}
                  columns={subjCol}
                  dataSource={coResDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          coResDataSource: userData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              </Field>
            )}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="来源信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            {sourceType.visibleFlag === 1 && (
              <Field
                name="sourceType"
                label={sourceType.displayName}
                decorator={{
                  initialValue: formData.sourceType,
                  rules: [
                    {
                      required: sourceType.requiredFlag,
                      message: `请选择${sourceType.displayName}`,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcCheck
                  code="TSK.SOURCE_TYPE"
                  onChange={this.handleSourceType}
                  placeholder={`请选择${sourceType.displayName}`}
                  disabled={sourceType.fieldMode !== 'EDITABLE'}
                />
              </Field>
            )}

            <Field label="" presentational>
              &nbsp;
            </Field>
            {isInternal && [
              internalBuId.visibleFlag === 1 && (
                <Field
                  name="internalBuId"
                  label={internalBuId.displayName}
                  decorator={{
                    initialValue: formData.internalBuId,
                    rules: [
                      {
                        required: internalBuId.requiredFlag,
                        message: `请选择${internalBuId.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <Selection.ColumnsForBu />
                </Field>
              ),
              internalResId.visibleFlag === 1 && (
                <Field
                  name="internalResId"
                  label={internalResId.displayName}
                  decorator={{
                    initialValue:
                      formData.internalResId && formData.internalResName
                        ? {
                            code: formData.internalResId,
                            name: formData.internalResName,
                          }
                        : null,
                    rules: [
                      {
                        required: internalResId.requiredFlag,
                        message: `请选择${internalResId.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <SelectWithCols
                    labelKey="name"
                    valueKey="code"
                    placeholder={`请选择${internalResId.displayName}`}
                    disabled={internalResId.fieldMode !== 'EDITABLE'}
                    columns={subjCol}
                    dataSource={internalResDataSource}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            internalResDataSource: userData.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                      style: { width: '100%' },
                    }}
                  />
                </Field>
              ),
              profitDesc.visibleFlag === 1 && (
                <Field
                  name="profitDesc"
                  label={profitDesc.displayName}
                  decorator={{
                    initialValue: formData.profitDesc,
                    rules: [
                      {
                        required: profitDesc.requiredFlag,
                        message: `请输入${profitDesc.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <Input
                    placeholder={`请输入${profitDesc.displayName}`}
                    disabled={profitDesc.fieldMode !== 'EDITABLE'}
                  />
                </Field>
              ),
            ]}
            {!isInternal && [
              externalIden.visibleFlag === 1 && (
                <Field
                  name="externalIden"
                  label={externalIden.displayName}
                  decorator={{
                    initialValue: formData.externalIden,
                    rules: [
                      {
                        required: externalIden.requiredFlag,
                        message: `请输入${externalIden.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <Input
                    placeholder={`请输入${externalIden.displayName}`}
                    disabled={externalIden.fieldMode !== 'EDITABLE'}
                  />
                </Field>
              ),
              externalName.visibleFlag === 1 && (
                <Field
                  name="externalName"
                  label={externalName.displayName}
                  decorator={{
                    initialValue: formData.externalName,
                    rules: [
                      {
                        required: externalName.requiredFlag,
                        message: `请输入${externalName.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <Input
                    placeholder={`请输入${externalName.displayName}`}
                    disabled={externalName.fieldMode !== 'EDITABLE'}
                  />
                </Field>
              ),
              externalPhone.visibleFlag === 1 && (
                <Field
                  name="externalPhone"
                  label={externalPhone.displayName}
                  decorator={{
                    initialValue: formData.externalPhone,
                    rules: [
                      {
                        required: externalPhone.requiredFlag,
                        message: `请输入${externalPhone.displayName}`,
                      },
                    ],
                  }}
                  {...FieldListLayout}
                >
                  <Input
                    placeholder={`请输入${externalPhone.displayName}`}
                    disabled={externalPhone.fieldMode !== 'EDITABLE'}
                  />
                </Field>
              ),
            ]}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CreateMain;
