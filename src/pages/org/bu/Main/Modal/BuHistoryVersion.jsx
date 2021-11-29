import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;

const DOMAIN = 'orgbuEqva';

@Form.create()
class BuHistoryVersion extends React.Component {
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
      handleCancel,
      formData,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        width="60%"
        destroyOnClose
        confirmLoading={loading.effects['orgbu/buSaveVersion']}
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
                rules: [
                  {
                    required: true,
                    message: '请输入版本号',
                  },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 10, xxl: 10 }}
            >
              <Input
                placeholder="请输入版本号"
                onChange={e => {
                  formData.versionNo = e.target.value;
                }}
              />
            </Field>
            <Field
              name="changeDesc"
              label="变更原因"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请输入变更原因',
                  },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入变更原因"
                rows={3}
                onChange={e => {
                  formData.changeDesc = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default BuHistoryVersion;
