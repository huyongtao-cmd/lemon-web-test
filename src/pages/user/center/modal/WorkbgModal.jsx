import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import MonthRangePicker from '../../../plat/res/profile/modal/component/MonthRangePicker';

const { Field } = FieldList;
const DOMAIN = 'platResProfileBackground';

@connect(({ loading, platResProfileBackground, dispatch }) => ({
  loading,
  platResProfileBackground,
  dispatch,
}))
@Form.create()
class WorkbgModal extends React.Component {
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
      workbgFormData,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={workbgFormData.id ? '工作经历修改' : '工作经历新增'}
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
                  workbgFormData.dateFrom ? moment(workbgFormData.dateFrom) : null,
                  workbgFormData.dateTo ? moment(workbgFormData.dateTo) : null,
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
                  workbgFormData.date = e;
                }}
                handleSofar={handleSofar}
              />
            </Field>
            <Field
              name="industry"
              label="行业"
              decorator={{
                initialValue: workbgFormData.industry,
                rules: [
                  {
                    required: false,
                    message: '请输入行业',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入行业"
                onChange={e => {
                  workbgFormData.industry = e.target.value;
                }}
              />
            </Field>
            <Field
              name="companyName"
              label="公司"
              decorator={{
                initialValue: workbgFormData.companyName,
                rules: [
                  {
                    required: true,
                    message: '请输入公司',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入公司"
                onChange={e => {
                  workbgFormData.companyName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="deptName"
              label="部门"
              decorator={{
                initialValue: workbgFormData.deptName,
                rules: [
                  {
                    required: false,
                    message: '请输入部门',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入部门"
                onChange={e => {
                  workbgFormData.deptName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="jobtitle"
              label="职位"
              decorator={{
                initialValue: workbgFormData.jobtitle,
                rules: [
                  {
                    required: true,
                    message: '请输入职位',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入职位"
                onChange={e => {
                  workbgFormData.jobtitle = e.target.value;
                }}
              />
            </Field>
            <Field
              name="dutyDesc"
              label="职责描述"
              decorator={{
                initialValue: workbgFormData.dutyDesc,
                rules: [
                  {
                    required: false,
                    message: '请输入职责描述',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入职责描述"
                rows={3}
                onChange={e => {
                  workbgFormData.dutyDesc = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default WorkbgModal;
