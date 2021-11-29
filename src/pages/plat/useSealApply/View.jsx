import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'useSealApplyApproval';

@connect(({ user: { user }, loading, useSealApplyApproval, dispatch }) => ({
  loading,
  ...useSealApplyApproval,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class index extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SEAL_APPLY:ADM_M01_DETAILS' },
    });

    // id &&
    //   dispatch({
    //     type: `${DOMAIN}/flowDetail`,
    //     payload: { id },
    //   });
  }

  renderPage = () => {
    const {
      dispatch,
      formMode,
      form,
      formData,
      pageConfig: { pageBlockViews = [] },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockKey === 'SEAL_APPLY_MAIN');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};

    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        applyResId = {},
        applyDate = {},
        baseBuId = {},
        ouId = {},
        contactNo = {},
        email = {},
        seal = {},
        sealPurpose = {},
        lendFlag = {},
        returnDate = {},
        remark = {},
      } = pageFieldJson;

      const fields1 = [
        <FormItem
          fieldType="ResSimpleSelect"
          // label='申请人'
          label={applyResId.displayName}
          key="applyResId"
          fieldKey="applyResId"
          required={applyResId.requiredFlag}
          sortNo={applyResId.sortNo}
          form={form}
          initialValue={formData.applyResId}
          onChange={value => {
            dispatch({
              type: `${DOMAIN}/queryResDetail`,
              payload: value,
            });
          }}
          descList={[{ id: formData.applyResId, title: formData.applyResName }]}
          disabled={applyResId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseDatePicker"
          // label='申请日期'
          label={applyDate.displayName}
          key="applyDate"
          fieldKey="applyDate"
          required={applyDate.requiredFlag}
          sortNo={applyDate.sortNo}
          form={form}
          disabled={applyDate.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={baseBuId.displayName}
          // label='BaseBu'
          key="baseBuId"
          fieldKey="baseBuName"
          required={baseBuId.requiredFlag}
          sortNo={baseBuId.sortNo}
          form={form}
          disabled={baseBuId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={ouId.displayName}
          // label='所属公司'
          key="ouId"
          fieldKey="ouName"
          required={ouId.requiredFlag}
          sortNo={ouId.sortNo}
          form={form}
          disabled={baseBuId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={contactNo.displayName}
          // label='联系电话'
          key="contactNo"
          fieldKey="contactNo"
          required={contactNo.requiredFlag}
          sortNo={contactNo.sortNo}
          form={form}
          disabled={contactNo.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={email.displayName}
          // label='邮箱'
          key="email"
          fieldKey="email"
          required={email.requiredFlag}
          sortNo={email.sortNo}
          form={form}
          disabled={email.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseUdcSelect"
          label={seal.displayName}
          // label='印章'
          udcCode="COM:CORPORATE_SEAL"
          key="seal"
          fieldKey="seal"
          required={seal.requiredFlag}
          sortNo={seal.sortNo}
          form={form}
          disabled={seal.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseUdcSelect"
          label={sealPurpose.displayName}
          // label='印章用途'
          udcCode="COM:SEAL_PURPOSE"
          key="sealPurpose"
          fieldKey="sealPurpose"
          required={sealPurpose.requiredFlag}
          sortNo={sealPurpose.sortNo}
          form={form}
          disabled={sealPurpose.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseRadioSelect"
          label={lendFlag.displayName}
          key="lendFlag"
          fieldKey="lendFlag"
          options={[{ label: '是', value: 'YES' }, { label: '否', value: 'NO' }]}
          required={lendFlag.requiredFlag}
          sortNo={lendFlag.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseDatePicker"
          // label='归还时间'
          label={returnDate.displayName}
          key="returnDate"
          fieldKey="returnDate"
          required={returnDate.requiredFlag}
          sortNo={returnDate.sortNo}
          form={form}
          disabled={returnDate.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInputTextArea"
          label={remark.displayName}
          key="remark"
          fieldKey="remark"
          required={remark.requiredFlag}
          sortNo={remark.sortNo}
          form={form}
          disabled={returnDate.fieldMode === 'UNEDITABLE'}
        />,
      ];

      const filterList1 = fields1
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

      return (
        <>
          <BusinessForm formData={formData} formMode={formMode}>
            {filterList1}
          </BusinessForm>
        </>
      );
    }
    return '';
  };

  render() {
    return <PageWrapper>{this.renderPage()}</PageWrapper>;
  }
}

export default index;
