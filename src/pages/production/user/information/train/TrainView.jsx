// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';
import ButtonCard from '@/components/production/layout/ButtonCard';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { fromQs } from '@/utils/production/stringUtil';

/***
 * 培训详情/编辑
 */
@connect(({ user: { user } }) => ({ user }))
@Form.create()
class TrainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      loading: false,
    };
  }

  componentDidMount() {}

  render() {
    const { form } = this.props;
    const { mode } = fromQs();
    const { loading, formData } = this.state;
    return (
      <PageWrapper>
        <ButtonCard>
          {mode === 'EDIT' && [
            <Button
              size="large"
              type="primary"
              // disabled
              // onClick={() => {
              //   this.handleSave({ submit: false }, () => {
              //     closeThenGoto(`/hr/resource/information?refresh=` + new Date().valueOf());
              //   });
              // }}
              // loading={loading}
            >
              保存
            </Button>,
          ]}
        </ButtonCard>

        <BusinessForm
          title="基本信息"
          form={form}
          formData={formData}
          formMode={mode}
          defaultColumnStyle={12}
        >
          <FormItem fieldType="BaseInput" label="课程名称" fieldKey="login" />

          <FormItem fieldType="BaseInput" label="姓名" fieldKey="name" />

          <FormItem fieldType="BaseInput" label="员工编号" fieldKey="resNo" />

          <FormItem
            fieldType="BaseAllOuSimpleSelect"
            label="所属公司"
            fieldKey="ouId"
            descriptionRender={formData.ouName}
          />
          <FormItem
            fieldType="BuSimpleSelect"
            label="所属BU"
            fieldKey="buId"
            descriptionRender={formData.buName}
          />
          <FormItem
            fieldType="BaseCustomSelect"
            label="Base地"
            fieldKey="baseCity"
            parentKey="CUS:CITY"
          />
          <FormItem
            fieldType="ResSimpleSelect"
            label="直接主管"
            fieldKey="parentResId"
            descriptionRender={formData.presName}
          />
          <FormItem
            fieldType="BaseSelect"
            label="课程类型"
            fieldKey="gender"
            parentKey="COM:GENDER"
          />
          <FormItem fieldType="BaseDatePicker" label="课程时间" fieldKey="enrollDate" defaultShow />
          <FormItem fieldType="BaseInput" label="课程时长（分钟）" fieldKey="email" />
          <FormItem fieldType="BaseInput" label="费用（元）" fieldKey="email" />
          <FormItem
            fieldType="SupplierSimpleSelect"
            label="供应商"
            // disabled
            fieldKey="supplierId"
            descriptionField="supplierDesc"
          />
          <FormItem
            fieldType="BaseInputTextArea"
            label="备注"
            fieldKey="remark"
            // descriptionField="supplierDesc"
          />
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default TrainView;
