import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Input, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';

const { Field } = FieldList;
const DOMAIN = 'vacationMgmt';

@connect(({ loading, vacationMgmt, user, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/batchSave`],
  vacationMgmt,
  user,
  dispatch,
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
class BatchEditModal extends PureComponent {
  componentDidMount() {}

  handleSave = () => {
    const { form, closeModal, dispatch } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/batchSave`,
      }).then(data => {
        closeModal('YES');
      });
    });
  };

  render() {
    const {
      loading,
      visible,
      closeModal,
      form: { getFieldDecorator },
      vacationMgmt: { formData, selectedKeys },
    } = this.props;
    return (
      <Modal
        centered
        title="有效期批量修改"
        visible={visible}
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
          <Button key="cancel" type="primary" size="large" onClick={() => closeModal()}>
            取消
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="expirationDate"
              label="有效期"
              fieldCol={1}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={{
                initialValue: formData.expirationDate,
                rules: [{ required: true, message: '请输入有效期' }],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="有效期" format="YYYY-MM-DD" />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default BatchEditModal;
