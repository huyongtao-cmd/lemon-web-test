import React, { Component, PureComponent } from 'react';
import { isEmpty } from 'ramda';
import { Spin } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';

class FormComponent extends PureComponent {
  componentDidMount() {}

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form, attachments } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="产品编号"
        key="productNo"
        fieldKey="productNo"
        fieldType="BaseInput"
        initialValue={formData.productNo}
        placeholder="系统自动生成"
      />,
      <FormItem
        label="产品名称"
        key="productName"
        fieldKey="productName"
        fieldType="BaseInput"
        initialValue={formData.productName}
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
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="Logo"
      //   key="logo"
      //   fieldKey="logo"
      //   dataKey={formData.id}
      //   initialValue={formData.id}
      //   api="/api/production/pro/productManagement/sfs/token"
      //   listType="text"
      //   attach
      // />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="logo"
        key="logo"
        label="Logo"
        fileList={attachments}
        accept=".jpg,.gif,.png"
        attach
      />,
      <p key="logo" style={{ lineHeight: '40px', color: 'red', marginLeft: '30px' }}>
        Logo要求:支持*.jpg、*.gif、*png，建议上传16:9(256*144)的图片，文件最大300K
      </p>,

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
    const { loading } = this.props;

    return (
      <PageWrapper>
        <Spin spinning={loading || false}>{this.renderPage()}</Spin>
      </PageWrapper>
    );
  }
}

export default FormComponent;
