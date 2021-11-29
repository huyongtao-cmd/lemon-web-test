import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'phaseEdit';
@connect(({ user, loading, phaseEdit, dispatch }) => ({
  loading,
  ...phaseEdit,
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
class WBSPhaseEdit extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, projectTemplateId } = fromQs();
    this.setState({ projectTemplateId });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id, projectTemplateId },
      });
    }
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

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handleSave = flag => {
    const {
      form: { validateFieldsAndScroll },
      formData: { ...newFormData },
      dispatch,
    } = this.props;
    const { projectTemplateId } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/edit`,
          payload: {
            ...newFormData,
            ...values,
            projectTemplateId,
            flag,
          },
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      formData,
      formMode,
      pageConfig,
      form,
      user: {
        user: { extInfo = {} },
      },
    } = this.props;

    const { userId } = extInfo;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="编号"
        key="phaseNo"
        fieldKey="phaseNo"
        fieldType="BaseInput"
        initialValue={formData.phasePlanNo}
        required
      />,
      <FormItem
        label="阶段名称"
        key="phaseName"
        fieldKey="phaseName"
        fieldType="BaseInput"
        initialValue={formData.phasePlanName}
        required
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.phasePlanRemark}
      />,
    ];

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fields}
      </BusinessForm>
    );
  };

  render() {
    const { loading } = this.props;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] || loading.effects[`${DOMAIN}/projectRiskEdit`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={() => this.handleSave(false)}
            disabled={disabledBtn}
          >
            保存
          </Button>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={() => this.handleSave(true)}
            disabled={disabledBtn}
          >
            保存并创建下一条
          </Button>
        </ButtonCard>
        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default WBSPhaseEdit;
