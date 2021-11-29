import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Input } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';

// namespace声明
const DOMAIN = 'tenantProcDetail';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, tenantProcDetail }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...tenantProcDetail,
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
class TenantProcDetail extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode } = fromQs();
    // 把url的参数保存到state
    this.updateModelState({ formMode: mode, id, copy });
    this.callModelEffects('init');
    this.callModelEffects('pageQuery');
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

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

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', { formData: { ...formData, ...values } });
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  render() {
    const { form, formData, formMode, loading, pageConfig } = this.props;
    if (
      !pageConfig ||
      !pageConfig.configInfo ||
      !pageConfig.configInfo.pageBlockViews ||
      pageConfig.configInfo.pageBlockViews.length < 1
    ) {
      return <div />;
    }

    const formJson = {};
    pageConfig.configInfo.pageBlockViews[0].pageFieldViews.forEach(f => {
      formJson[f.fieldKey] = f;
    });
    const formItems = [
      // <BusinessFormTitle title="基本信息" />,
      <FormItem
        fieldType="TenantSimpleSelect"
        label="所属租户"
        fieldKey="tenantId"
        descriptionField="tenantName"
        required
      />,

      <FormItem fieldType="BaseInput" label="流程标识" fieldKey="procIden" required />,

      <FormItem fieldType="BaseInput" label="流程类型" fieldKey="procKey" required />,

      <FormItem fieldType="BaseInput" label="流程名称" fieldKey="procName" required />,

      <FormItem
        fieldType="BaseSwitch"
        label="是否启用"
        fieldKey="isEnable"
        initialValue={true} // eslint-disable-line
        checkedChildren="启用"
        unCheckedChildren="不启用"
      />,

      <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />,
    ]
      .filter(f => formJson[f.props.fieldKey] && formJson[f.props.fieldKey].visibleFlag)
      .map(f => ({
        ...f,
        label: formJson[f.props.fieldKey].displayName,
        required: formJson[f.props.fieldKey].requiredFlag,
      }))
      .sort((f1, f2) => formJson[f1.props.fieldKey].sortNo - formJson[f2.props.fieldKey].sortNo);
    formItems.unshift(<BusinessFormTitle title="基本信息" />); // 在数组的起止位置添加元素；这个元素一定要先加到数组中，后渲染；否则会报错

    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {formMode === 'EDIT' && (
            <Button size="large" type="primary" onClick={this.handleSave}>
              保存
            </Button>
          )}
          {formMode === 'DESCRIPTION' && (
            <Button size="large" type="primary" onClick={this.switchEdit}>
              编辑
            </Button>
          )}
        </ButtonCard>
        <BusinessForm title="" form={form} formData={formData} formMode={formMode}>
          {formItems}
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default TenantProcDetail;
