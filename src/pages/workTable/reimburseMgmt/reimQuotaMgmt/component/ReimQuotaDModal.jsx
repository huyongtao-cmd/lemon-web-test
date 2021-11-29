import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, type } from 'ramda';
import { Form, Modal } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import { fromQs } from '@/utils/production/stringUtil';

import styles from '../style.less';

const DOMAIN = 'reimQuotaMgmtEdit';

@connect(({ loading, reimQuotaMgmtEdit, dispatch }) => ({
  loading,
  ...reimQuotaMgmtEdit,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { modalformdata } = props;
    const fields = {};
    Object.keys(modalformdata).forEach(key => {
      const tempValue = modalformdata[key];
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
      type: `${DOMAIN}/updateModalForm`,
      payload: newFieldData,
    });
  },
})
class index extends Component {
  handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      modalformdata: { ...newFormData },
      onChange,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        type(onChange) === 'Function' &&
          onChange({
            ...newFormData,
            ...values,
            expenseQuotaId: fromQs().id,
          });
      }
    });
  };

  handleCancel = e => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        visible: false,
      },
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      form,
      modalformdata,
      formMode,
      dimension1List,
      dimension2List,
      pageConfig,
    } = this.props;

    const fields = [
      <FormItem
        label="规则码"
        key="ruleCode"
        fieldKey="ruleCode"
        fieldType="BaseInput"
        initialValue={modalformdata.ruleCode}
        disabled
        placeholder="系统自动生成"
      />,
      <FormItem
        label="币种"
        key="currCode"
        fieldKey="currCode"
        fieldType="BaseSelect"
        initialValue={modalformdata.currCode}
        parentKey="COMMON_CURRENCY"
        required
      />,
      <FormItem
        label="维度1"
        key="quotaDimension1Value"
        fieldKey="quotaDimension1Value"
        fieldType="BaseSelect"
        initialValue={modalformdata.quotaDimension1Value}
        descList={dimension1List}
        mode="multiple"
        extraRequired={!!dimension1List.length}
      />,
      <FormItem
        label="维度2"
        key="quotaDimension2Value"
        fieldKey="quotaDimension2Value"
        fieldType="BaseSelect"
        initialValue={modalformdata.quotaDimension2Value}
        descList={dimension2List}
        mode="multiple"
        extraRequired={!!dimension2List.length}
      />,
      <FormItem
        label="报销额度"
        key="quotaAmt"
        fieldKey="quotaAmt"
        fieldType="BaseInputAmt"
        initialValue={modalformdata.quotaAmt}
        required
      />,
      <FormItem
        label="时间单位"
        key="timeUnit"
        fieldKey="timeUnit"
        fieldType="BaseSelect"
        initialValue={modalformdata.timeUnit}
        parentKey="COM:TIME_UNIT"
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'EXPENSE_QUOTA_D_MODAL',
      fields
    );

    return (
      <>
        <BusinessForm
          formData={modalformdata}
          form={form}
          formMode={formMode}
          defaultColumnStyle={12}
        >
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  render() {
    const { dispatch, loading, visible } = this.props;

    return (
      <PageWrapper>
        <Modal
          title="额度明细"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="70%"
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                modalformdata: {},
              },
            });
          }}
          confirmLoading={loading.effects[`${DOMAIN}/expenseQuotaDSave`]}
        >
          <div className={styles.boxWarp}>{this.renderPage()}</div>
        </Modal>
      </PageWrapper>
    );
  }
}

export default index;
