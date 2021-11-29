import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Input, Modal, Form, InputNumber } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';

const { Field } = FieldList;
const DOMAIN = 'messageConfigTag';

@connect(({ loading, messageConfigTag, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/save`],
  messageConfigTag,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class TagInsertModal extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanFormData` });
    dispatch({ type: `${DOMAIN}/res` });
  }

  handleSave = () => {
    const { form, dispatch, closeModal } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
      }).then(data => {
        closeModal();
      });
    });
  };

  render() {
    const {
      loading,
      insertModalVisible,
      closeModal,
      form: { getFieldDecorator },
      messageConfigTag: { formData },
      user: {
        user: { admin },
      },
    } = this.props;
    return (
      <Modal
        title="标签新增"
        visible={insertModalVisible}
        destroyOnClose
        onCancel={closeModal}
        width="40%"
        footer={[
          <Button
            key="confirm"
            type="primary"
            size="large"
            htmlType="button"
            loading={loading}
            onClick={() => this.handleSave()}
          >
            保存
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="tagNo"
              label="标签编号"
              decorator={{
                initialValue: formData.tagNo,
                rules: [{ required: true, message: '请输入标签编号' }],
              }}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
            >
              <Input className="x-fill-100" placeholder="请输入标签编号" />
            </Field>
            <Field
              name="messageTagName"
              label="标签名称"
              decorator={{
                initialValue: formData.messageTagName,
                rules: [{ required: true, message: '请输入标签名称' }],
              }}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
            >
              <Input className="x-fill-100" placeholder="请输入标签名称" />
            </Field>
            <Field
              name="tagLevel"
              label="标签级别"
              decorator={{
                initialValue: formData.tagLevel,
                rules: [{ required: true, message: '请输入标签级别' }],
              }}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
            >
              <InputNumber min={0} placeholder="请输入标签级别" className="x-fill-100" />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false, message: '请输入备注' }],
              }}
              fieldCol={1}
              labelCol={{ span: 10, xxl: 5 }}
              wrapperCol={{ span: 19, xxl: 19 }}
            >
              <Input.TextArea rows={3} maxLength={400} placeholder="请输入备注" />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default TagInsertModal;
