// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';
import ButtonCard from '@/components/production/layout/ButtonCard';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { outputHandle } from '@/utils/production/outputUtil';
import { userInduction } from '@/services/production/user';
import { closeThenGoto } from '@/layouts/routerControl';

/***
 * 新增入职
 */
@Form.create()
class InformationAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      loading: false,
    };
  }

  componentDidMount() {}

  // 保存
  handleSave = async (params, cb) => {
    const { form } = this.props;
    const basic = await form.validateFields(); // 基本信息
    // 往后端传的参数
    const data = {
      ...params,
      ...basic,
    };

    const resSub = await outputHandle(userInduction, data, 'string', false);
    if (resSub.ok) {
      cb(resSub);
    }
  };

  render() {
    const { form } = this.props;
    const { loading, formData } = this.state;
    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {[
            <Button
              size="large"
              type="primary"
              onClick={() => {
                this.handleSave(
                  {
                    submit: false,
                  },
                  () => {
                    closeThenGoto(`/hr/resource/information?refresh=` + new Date().valueOf());
                  }
                );
              }}
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
          // formMode={formMode}
          defaultColumnStyle={12}
        >
          <FormItem required fieldType="BaseInput" label="姓名" fieldKey="name" />
          <FormItem fieldType="BaseAllOuSimpleSelect" label="所属公司" fieldKey="ouId" required />
          <FormItem fieldType="BuSimpleSelect" label="所属BU" fieldKey="buId" required />
          <FormItem
            fieldType="BaseCustomSelect"
            label="职级"
            fieldKey="jobGrade"
            parentKey="CUS:JOB_GRADE"
            // descriptionRender={formData.jobGrade}
          />
          <FormItem fieldType="BaseInput" label="职位" fieldKey="position" />
          <FormItem
            fieldType="ResSimpleSelect"
            label="直属上级"
            fieldKey="parentResId"
            // descriptionRender={formData.presName}
          />
          <FormItem fieldType="BaseInputNumber" label="薪资（单位：元）" fieldKey="salary" />
          <FormItem
            required
            fieldType="BaseCustomSelect"
            label="工作地"
            fieldKey="baseCity"
            parentKey="CUS:CITY"
          />
          <FormItem fieldType="BaseDatePicker" label="入职日期" fieldKey="enrollDate" />
          <FormItem fieldType="BaseDatePicker" label="合同开始日期" fieldKey="contractSignDate" />
          <FormItem fieldType="BaseDatePicker" label="合同结束日期" fieldKey="contractExpireDate" />
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default InformationAdd;
