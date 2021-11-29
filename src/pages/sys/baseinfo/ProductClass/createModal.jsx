import React from 'react';
import { Icon, Modal, Input, Form, message } from 'antd';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';

const { Field } = FieldList;

const fieldLabels = {
  classCode: '分类编号',
  className: '分类名称',
  pclassName: '上级分类',
  sortNo: '排序号',
  remark: '备注',
};

const itemLayout = {
  labelCol: { span: 8, xxl: 8 },
  wrapperCol: { span: 16, xxl: 16 },
};

@Form.create()
class CreateModal extends React.PureComponent {
  handleSubmit = (...args) => {
    const { form, onSubmit, formData } = this.props;
    // console.log(formData);
    if (formData.id === formData.pid) {
      createMessage({ type: 'error', description: '上级分类不能是当前分类' });
    } else {
      form.validateFields(void 0, { force: true }, (errors, values) => {
        if (!errors) {
          return onSubmit(...args);
        }
        return false;
      });
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      formData,
      onToggle,
      popTree,
      confirmLoading,
    } = this.props;

    return (
      <Modal
        width={900}
        destroyOnClose
        title={formData.id ? '分类修改' : '分类新增'}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={onToggle}
        confirmLoading={confirmLoading}
      >
        <FieldList
          layout="horizontal"
          getFieldDecorator={getFieldDecorator}
          col={2}
          style={{ overflow: 'hidden' }}
          noReactive
        >
          <Field
            name="pclassName"
            label={fieldLabels.pclassName}
            decorator={{
              initialValue: formData.pclassName,
            }}
            {...itemLayout}
          >
            <Input
              disabled
              addonAfter={
                <a className="tw-link-primary" onClick={popTree}>
                  <Icon type="search" />
                </a>
              }
            />
          </Field>
          <Field
            name="sortNo"
            label={fieldLabels.sortNo}
            decorator={{
              initialValue: formData.sortNo,
              rules: [{ required: true, message: '请输入' + fieldLabels.sortNo }],
            }}
            {...itemLayout}
          >
            <Input
              maxLength={35}
              onChange={e => {
                formData.sortNo = e.target.value;
              }}
            />
          </Field>
          {formData.classCode && (
            <Field
              name="classCode"
              label={fieldLabels.classCode}
              decorator={{
                initialValue: formData.classCode,
                rules: [{ required: true, message: '请输入' + fieldLabels.classCode }],
              }}
              {...itemLayout}
            >
              <Input
                placeholder="请输入分类编号"
                disabled
                onChange={e => {
                  formData.classCode = e.target.value;
                }}
              />
            </Field>
          )}
          <Field
            name="className"
            label={fieldLabels.className}
            decorator={{
              initialValue: formData.className,
              rules: [{ required: true, message: '请输入' + fieldLabels.className }],
            }}
            {...itemLayout}
          >
            <Input
              placeholder="请输入分类名称"
              maxLength={35}
              onChange={e => {
                formData.className = e.target.value;
              }}
            />
          </Field>
          <Field
            name="remark"
            label={fieldLabels.remark}
            decorator={{
              initialValue: formData.remark,
            }}
            fieldCol={1}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Input.TextArea
              placeholder="请输入备注"
              rows={3}
              maxLength={400}
              onChange={e => {
                formData.remark = e.target.value;
              }}
            />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default CreateModal;
