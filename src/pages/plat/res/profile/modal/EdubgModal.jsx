import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';
import MonthRangePicker from './component/MonthRangePicker';

const { Field } = FieldList;
const DOMAIN = 'platResProfileBackground';

@connect(({ loading, platResProfileBackground, dispatch }) => ({
  loading,
  platResProfileBackground,
  dispatch,
}))
@Form.create()
class EdubgModal extends React.Component {
  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk();
      }
    });
  };

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      handleSofar,
      edubgFormData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={edubgFormData.id ? '教育经历修改' : '教育经历新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
        // footer={[
        //   <Button type="primary" key="save" onClick={this.handleSave}>
        //     保存
        //   </Button>,
        //   <Button type="ghost" key="cancel" onClick={handleCancel}>
        //     取消
        //   </Button>,
        // ]}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="date"
              label="时间"
              decorator={{
                initialValue: [
                  edubgFormData.dateFrom ? moment(edubgFormData.dateFrom) : null,
                  edubgFormData.dateTo ? moment(edubgFormData.dateTo) : null,
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
                  edubgFormData.date = e;
                }}
                handleSofar={handleSofar}
              />
            </Field>
            <Field
              name="schoolName"
              label="学校"
              decorator={{
                initialValue: edubgFormData.schoolName,
                rules: [
                  {
                    required: true,
                    message: '请输入学校',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入学校"
                onChange={e => {
                  edubgFormData.schoolName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="qualification"
              label="学历"
              decorator={{
                initialValue: edubgFormData.qualification,
                rules: [
                  {
                    required: true,
                    message: '请选择学历',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.EDUCATION"
                placeholder="请选择学历"
                onChange={e => {
                  edubgFormData.qualification = e;
                }}
              />
            </Field>
            <Field
              name="majorName"
              label="专业"
              decorator={{
                initialValue: edubgFormData.majorName,
                rules: [
                  {
                    required: true,
                    message: '请输入专业',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入专业"
                onChange={e => {
                  edubgFormData.majorName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="edusysType"
              label="学历类别"
              decorator={{
                initialValue: edubgFormData.edusysType,
                rules: [
                  {
                    required: true,
                    message: '学历类别',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.EDU_SYS"
                placeholder="请选择学历类别"
                onChange={e => {
                  edubgFormData.edusysType = e;
                }}
              />
            </Field>
            <Field
              name="majorDesc"
              label="专业描述"
              decorator={{
                initialValue: edubgFormData.majorDesc,
                rules: [
                  {
                    required: false,
                    message: '请输入专业描述',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入专业描述"
                rows={3}
                onChange={e => {
                  edubgFormData.majorDesc = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default EdubgModal;
