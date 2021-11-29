import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'projectRiskDetail';

@connect(({ loading, projectRiskDetail, dispatch }) => ({
  loading,
  ...projectRiskDetail,
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
  componentDidMount() {
    const { dispatch } = this.props;

    // // 调用页面载入初始化方法,一般是请求页面数据
    // // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    // const { id, copy, mode } = fromQs();
    // // 把url的参数保存到state
    // this.updateModelState({ formMode: mode, id, copy });
    // this.callModelEffects('init');

    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PRODUCT_EDIT' },
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

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="产品编号"
        key="productName"
        fieldKey="productName"
        fieldType="BaseInput"
        initialValue={formData.productName}
        placeholder="系统自定生成"
      />,
      <FormItem
        label="产品名称"
        key="productNo"
        fieldKey="productNo"
        fieldType="BaseInput"
        initialValue={formData.productNo}
      />,

      <FormItem fieldType="Group" label="产品分类" key="productClass">
        <FormItem
          fieldType="BaseCustomSelect"
          key="productClass1"
          fieldKey="productClass1"
          parentKey="CUS:PRODUCT_CLASS1"
          initialValue={formData.productClass1}
        />
        <FormItem
          fieldType="BaseCustomSelect"
          key="productClass2"
          fieldKey="productClass2"
          parentKey="CUS:PRODUCT_CLASS2"
          initialValue={formData.productClass2}
        />
      </FormItem>,
      <FormItem
        label="标签"
        key="productTag"
        fieldKey="productTag"
        fieldType="BaseInput"
        initialValue={formData.productTag}
        disabled
      />,
      <FormItem
        label="所属公司"
        fieldType="BaseCustomSelect"
        key="inchargeCompany"
        fieldKey="inchargeCompany"
        parentKey="CUS:INTERNAL_COMPANY"
        initialValue={formData.inchargeCompany}
      />,
      <FormItem
        label="所属部门"
        key="inchargeBuId"
        fieldKey="inchargeBuId"
        fieldType="BuSimpleSelect"
        initialValue={formData.inchargeBuId}
      />,
      <FormItem
        fieldType="BaseFileManagerEnhance"
        label="Logo"
        key="logo"
        fieldKey="logo"
        dataKey={formData.id}
        initialValue={formData.id}
        api="/api/production/pro/productManagement/sfs/token"
        listType="text"
        attach
      />,

      <FormItem
        fieldType="BaseSelect"
        label="状态"
        key="productStatus"
        fieldKey="productStatus"
        parentKey="PRO:PRODUCT_STATUS"
        initialValue={formData.productStatus}
      />,
      <BusinessFormTitle title="扩展信息" />,
      // <FormItem
      //   label="可配置字段1"
      //   key="configurableField1"
      //   fieldKey="configurableField1"
      //   fieldType="BaseInput"
      //   initialValue={formData.configurableField1}
      // />
    ];

    for (let i = 1; i <= 10; i += 1) {
      fields.push(
        <FormItem
          label={`可配置字段${i}`}
          key={`configurableField${i}`}
          fieldKey={`configurableField${i}`}
          fieldType="BaseInput"
          initialValue={formData[`configurableField${i}`]}
        />
      );
    }

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PRODUCT_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  render() {
    return <PageWrapper>{this.renderPage()}</PageWrapper>;
  }
}

export default index;
