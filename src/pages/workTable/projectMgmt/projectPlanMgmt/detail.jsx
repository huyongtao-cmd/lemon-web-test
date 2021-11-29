import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'projectPhaseDetail';

@connect(({ loading, projectPhaseDetail, dispatch }) => ({
  loading,
  ...projectPhaseDetail,
  dispatch,
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
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();

    id &&
      dispatch({
        type: `${DOMAIN}/phaseDetail`,
        payload: { id },
      });

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: `PROJECT_PLAN_EDIT` },
    });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="项目阶段" />,
      <FormItem
        label="编号"
        key="phaseNo"
        fieldKey="phaseNo"
        fieldType="BaseInputNumber"
        initialValue={formData.phaseNo}
        required
      />,
      <FormItem
        label="名称"
        key="phaseName"
        fieldKey="phaseName"
        fieldType="BaseInput"
        initialValue={formData.phaseName}
        required
      />,
      <FormItem
        label="日期起"
        fieldKey="planStartDate"
        key="planStartDate"
        fieldType="BaseDatePicker"
        initialValue={formData.planStartDate}
      />,
      <FormItem
        label="日期止"
        fieldKey="planEndDate"
        key="planEndDate"
        fieldType="BaseDatePicker"
        initialValue={formData.planEndDate}
      />,
      <FormItem
        label="负责人"
        fieldKey="inchargeResId"
        key="inchargeResId"
        fieldType="ResSimpleSelect"
        initialValue={formData.inchargeResId}
      />,
      <FormItem
        label="状态"
        fieldKey="executeStatus"
        key="executeStatus"
        fieldType="BaseSelect"
        parentKey="PRO:EXECUTE_STATUS"
        initialValue={formData.executeStatus}
        required
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
      />,
    ];

    // const fieldsConfig = ProductFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PROJECT_PLAN_EDIT_FORM',
    //   fields
    // );

    return (
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
          {fields}
        </BusinessForm>
      </>
    );
  };

  render() {
    return <PageWrapper>{this.renderPage()}</PageWrapper>;
  }
}

export default index;
