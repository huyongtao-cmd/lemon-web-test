import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Modal, Form, Divider, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'trainAblityList';
const RadioGroup = Radio.Group;
const { Field } = FieldList;

@connect(({ loading, dispatch, trainAblityList, user, global }) => ({
  loading,
  dispatch,
  trainAblityList,
  user,
  global,
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
class CancelCheckModal extends PureComponent {
  state = {
    checkedValue: null,
  };

  componentDidMount() {}

  handleSave = () => {
    const { form, closeModal, dispatch } = this.props;
    const { checkedValue } = this.state;
    checkedValue &&
      dispatch({
        type: `${DOMAIN}/cancelCheck`,
        payload: {
          type: checkedValue,
        },
      }).then(data => {
        closeModal('YES');
      });
    if (checkedValue === null) {
      createMessage({ type: 'warn', description: '请选择取消方式' });
    }
  };

  render() {
    const {
      loading,
      visible,
      closeModal,
      form: { getFieldDecorator },
      trainAblityList: { formData, dataSource },
      global: { userList },
    } = this.props;
    const { checkedValue } = this.state;
    return (
      <Modal
        centered
        title="取消考核确认"
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
            loading={false}
            onClick={() => this.handleSave()}
          >
            确定
          </Button>,
          <Button key="cancel" type="primary" size="large" onClick={() => closeModal()}>
            取消
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList legend="取消方式" noReactive>
            <RadioGroup
              onChange={e => {
                this.setState({ checkedValue: e.target.value });
              }}
            >
              <Radio value="0">只恢复能力状态为“有效”,资源仍需完成相关的适岗培训</Radio>
              <Radio value="1">恢复能力状态为“有效”,并关闭相关适岗培训</Radio>
            </RadioGroup>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default CancelCheckModal;
