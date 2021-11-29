import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Input, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import moment from 'moment';

const { Field } = FieldList;
const DOMAIN = 'equivalent';

@connect(({ loading, dispatch, equivalent, user }) => ({
  loading: loading.effects[`${DOMAIN}/setLastCountDate`],
  dispatch,
  equivalent,
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
class LastCountModal extends PureComponent {
  componentDidMount() {}

  handleSave = () => {
    const { form, closeModal, dispatch } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/setLastCountDate`,
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
      equivalent: { formData },
    } = this.props;
    return (
      <Modal
        centered
        title="结算日期冻结管理"
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
              name="lastCountDate"
              label="结算日期冻结至"
              fieldCol={1}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={{
                initialValue: formData.lastCountDate ? moment(formData.lastCountDate) : null,
                rules: [{ required: true, message: '请选择' }],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="" format="YYYY-MM-DD" />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default LastCountModal;
