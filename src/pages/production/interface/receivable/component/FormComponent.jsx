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
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="公司"
        fieldType="InternalOuSimpleSelect"
        key="dwbm"
        fieldKey="dwbm"
        initialValue={formData.dwbm}
        transfer={{ code: 'abNo', name: 'ouName' }}
        disabled
      />,
      <FormItem
        label="交易类型名称"
        fieldType="BaseInput"
        key="djlxbm"
        fieldKey="djlxbm"
        initialValue={formData.djlxbm}
        disabled
      />,
      <FormItem
        label="单据号"
        key="djbh"
        fieldKey="djbh"
        fieldType="BaseInput"
        initialValue={formData.djbh}
        disabled
      />,
      <FormItem
        label="单据日期"
        fieldType="BaseDatePicker"
        key="djrq"
        fieldKey="djrq"
        initialValue={formData.djrq}
        disabled
      />,
      <FormItem
        label="币种"
        key="bzbm"
        fieldKey="bzbm"
        fieldType="BaseSelect"
        initialValue={formData.bzbm}
        parentKey="COMMON_CURRENCY"
        disabled
      />,
      <FormItem
        label="往来对象标识"
        fieldType="BaseInputNumber"
        key="wldx"
        fieldKey="wldx"
        initialValue={formData.wldx}
        disabled
      />,
      <FormItem
        label="客商"
        fieldType="BaseInput"
        key="hbbm"
        fieldKey="hbbm"
        initialValue={formData.hbbm}
        disabled
      />,
      <FormItem
        label="业务员"
        fieldType="ResSimpleSelect"
        key="ywybm"
        fieldKey="ywybm"
        transfer={{ code: 'resNo', name: 'resName' }}
        resStatus="3"
        initialValue={formData.ywybm}
        disabled
      />,
      <FormItem
        label="本方银行帐号"
        key="bfyhzh"
        fieldKey="bfyhzh"
        fieldType="BaseInput"
        initialValue={formData.bfyhzh}
        disabled
      />,
      <FormItem
        label="部门编码"
        key="deptid"
        fieldKey="deptid"
        fieldType="BuSimpleSelect"
        initialValue={formData.deptid}
        transfer={{ code: 'buNo', name: 'buName' }}
        disabled
      />,
      <FormItem
        label="对方银行账号"
        fieldType="BaseInput"
        key="dfyhzh"
        fieldKey="dfyhzh"
        initialValue={formData.dfyhzh}
        disabled
      />,
      <FormItem
        label="起算日期"
        fieldType="BaseDatePicker"
        key="effectdate"
        fieldKey="effectdate"
        initialValue={formData.effectdate}
        disabled
      />,
      <FormItem
        label="发票类型"
        fieldType="BaseInput"
        key="finvoicetype"
        fieldKey="finvoicetype"
        parentKey="COM:INV_TYPE"
        initialValue={formData.finvoicetype}
        disabled
      />,
      <FormItem
        label="科目编码"
        fieldType="BaseInput"
        key="kmbm"
        fieldKey="kmbm"
        initialValue={formData.kmbm}
        disabled
      />,
      <FormItem
        label="录入人编码"
        fieldType="ResSimpleSelect"
        key="lrr"
        fieldKey="lrr"
        initialValue={formData.lrr}
        transfer={{ code: 'mobile', name: 'resName' }}
        resStatus="3"
        disabled
      />,
      <FormItem
        label="结算方式编码"
        fieldType="BaseInput"
        key="pjJsfs"
        fieldKey="pjJsfs"
        // parentKey="PRO:PRODUCT_STATUS"
        initialValue={formData.pjJsfs}
        disabled
      />,
      <FormItem
        label="票据号"
        fieldType="BaseInput"
        key="pjNum"
        fieldKey="pjNum"
        initialValue={formData.pjNum}
        disabled
      />,
      <FormItem
        label="预收付标志"
        fieldType="BaseRadioSelect"
        key="prepay"
        fieldKey="prepay"
        initialValue={formData.prepay}
        options={[{ label: '是', value: true }, { label: '否', value: false }]}
        disabled
      />,
      <FormItem
        label="是期初"
        fieldType="BaseInput"
        key="qcbz"
        fieldKey="qcbz"
        initialValue={formData.qcbz}
        disabled
      />,
      <FormItem
        label="收支项目编码"
        fieldType="BaseInput"
        key="szxmid"
        fieldKey="szxmid"
        initialValue={formData.szxmid}
        disabled
      />,
      <FormItem
        label="交易对象类型"
        fieldType="BaseInput"
        key="tradertype"
        fieldKey="tradertype"
        // parentKey="PRO:PRODUCT_STATUS"
        initialValue={formData.tradertype}
        disabled
      />,
      <FormItem
        label="业务流程编码"
        fieldType="BaseInput"
        key="xslxbm"
        fieldKey="xslxbm"
        initialValue={formData.xslxbm}
        disabled
      />,
      <FormItem
        label="备注"
        fieldType="BaseInputTextArea"
        key="scomment"
        fieldKey="scomment"
        initialValue={formData.scomment}
        disabled
      />,
    ];

    const fieldsConfig = pageConfig
      ? ProductFormItemBlockConfig(pageConfig, 'blockKey', 'PRODUCT_EDIT_FORM', fields)
      : fields;

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
