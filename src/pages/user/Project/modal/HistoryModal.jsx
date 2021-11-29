import { connect } from 'dva';
import React from 'react';
import { Button, Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;

const DOMAIN = 'userResPlanningHistory';

@connect(({ loading, userResPlanningHistory, dispatch }) => ({
  loading,
  userResPlanningHistory,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class HistoryModal extends React.Component {
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
      formData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title="保存历史版本"
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend=""
            getFieldDecorator={getFieldDecorator}
            col={2}
            noReactive
          >
            <Field
              name="versionNo"
              label="版本号"
              decorator={{
                initialValue: formData.versionNo || '',
                rules: [
                  {
                    required: true,
                    message: '请输入版本号',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入版本号"
                onChange={e => {
                  formData.versionNo = e.target.value;
                }}
              />
            </Field>
            <Field
              name="changeReason"
              label="变更原因"
              decorator={{
                initialValue: formData.changeReason || '',
                rules: [
                  { required: true, message: '请输入变更原因' },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入变更原因"
                autosize={{ minRows: 3, maxRows: 6 }}
                onChange={e => {
                  formData.changeReason = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default HistoryModal;
