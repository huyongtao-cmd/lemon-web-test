import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import MonthRangePicker from '../../../plat/res/profile/modal/component/MonthRangePicker';

const { Field } = FieldList;
// const DOMAIN = 'platResProfileProjectExperience';

@connect(({ loading, dispatch }) => ({
  loading,
  dispatch,
}))
@Form.create()
class ProExpModal extends React.Component {
  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk();
      }
    });
  };

  render() {
    const {
      visible,
      handleCancel,
      handleSofar,
      formData,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={formData.id ? '项目履历修改' : '项目履历新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="date"
              label="时间"
              decorator={{
                initialValue: [
                  formData.dateFrom ? moment(formData.dateFrom) : null,
                  formData.dateTo ? moment(formData.dateTo) : null,
                ],
                rules: [
                  {
                    required: true,
                    message: '请选择时间',
                  },
                ],
              }}
            >
              <MonthRangePicker
                className="x-fill-100"
                onChange={e => {
                  formData.date = e;
                }}
                handleSofar={handleSofar}
              />
            </Field>
            <Field
              name="projName"
              label="项目名称"
              decorator={{
                initialValue: formData.projName,
                rules: [
                  {
                    required: true,
                    message: '请输入项目名称',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入项目名称"
                onChange={e => {
                  formData.projName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="product"
              label="相关产品"
              decorator={{
                initialValue: formData.product,
              }}
            >
              <Input
                placeholder="请输入相关产品"
                onChange={e => {
                  formData.product = e.target.value;
                }}
              />
            </Field>
            <Field
              name="industry"
              label="相关行业"
              decorator={{
                initialValue: formData.industry,
              }}
            >
              <Input
                placeholder="请输入相关行业"
                onChange={e => {
                  formData.industry = e.target.value;
                }}
              />
            </Field>
            <Field
              name="projRole"
              label="项目角色"
              decorator={{
                initialValue: formData.projRole,
              }}
            >
              <Input
                placeholder="请输入项目角色"
                onChange={e => {
                  formData.projRole = e.target.value;
                }}
              />
            </Field>
            <Field
              name="company"
              label="所在公司"
              decorator={{
                initialValue: formData.company,
              }}
            >
              <Input
                placeholder="请输入所在公司"
                onChange={e => {
                  formData.company = e.target.value;
                }}
              />
            </Field>
            <Field
              name="projIntro"
              label="项目简介"
              decorator={{
                initialValue: formData.projIntro,
                rules: [
                  {
                    required: true,
                    message: '请输入项目简介',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入项目简介"
                rows={3}
                onChange={e => {
                  formData.projIntro = e.target.value;
                }}
              />
            </Field>
            <Field
              name="dutyAchv"
              label="职责&业绩"
              decorator={{
                initialValue: formData.dutyAchv,
                rules: [
                  {
                    required: true,
                    message: '请输入职责&业绩',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入职责&业绩"
                rows={3}
                onChange={e => {
                  formData.dutyAchv = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default ProExpModal;
