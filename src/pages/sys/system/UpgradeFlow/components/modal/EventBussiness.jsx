import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { MonthRangePicker, Selection } from '@/pages/gen/field';

const { Field } = FieldList;
const DOMAIN = 'flowUpgradeBusinessConfig';

@connect(({ loading, flowUpgradeBusinessConfig, dispatch }) => ({
  loading,
  flowUpgradeBusinessConfig,
  dispatch,
}))
@Form.create()
class EventModal extends React.Component {
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
      eventFormData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="70%"
        destroyOnClose
        title={eventFormData.id ? '业务事件修改' : '业务事件新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="businessEvenCode"
              label="事件代码"
              decorator={{
                initialValue: eventFormData.businessEvenCode,
                rules: [
                  {
                    required: true,
                    message: '请输入事件代码',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入事件代码"
                onChange={e => {
                  eventFormData.businessEvenCode = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenName"
              label="事件名称"
              decorator={{
                initialValue: eventFormData.businessEvenName,
                rules: [
                  {
                    required: true,
                    message: '请输入事件名称',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入事件名称"
                onChange={e => {
                  eventFormData.businessEvenName = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenClass"
              label="事件类"
              decorator={{
                initialValue: eventFormData.businessEvenClass,
                rules: [
                  {
                    required: true,
                    message: '请输入事件类',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入事件类"
                onChange={e => {
                  eventFormData.businessEvenClass = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenMethod"
              label="事件方法"
              decorator={{
                initialValue: eventFormData.businessEvenMethod,
                rules: [
                  {
                    required: true,
                    message: '请输入事件方法',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入事件方法"
                onChange={e => {
                  eventFormData.businessEvenMethod = e.target.value;
                }}
              />
            </Field>
            <Field
              name="businessEvenParame"
              label="参数"
              decorator={{
                initialValue: eventFormData.businessEvenParame,
              }}
            >
              <Input
                placeholder="请输入参数"
                onChange={e => {
                  eventFormData.businessEvenParame = e.target.value;
                }}
              />
            </Field>
            <Field
              name="businessEvenType"
              label="事件类型"
              decorator={{
                initialValue: eventFormData.businessEvenType,
              }}
            >
              <Input
                placeholder="请输入事件类型"
                onChange={e => {
                  eventFormData.businessEvenType = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenType2"
              label="事件类型2"
              decorator={{
                initialValue: eventFormData.businessEvenType2,
              }}
            >
              <Input
                placeholder="请输入事件类型2"
                onChange={e => {
                  eventFormData.businessEvenType2 = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenType3"
              label="事件类型3"
              decorator={{
                initialValue: eventFormData.businessEvenType3,
              }}
            >
              <Input
                placeholder="请输入事件类型3"
                onChange={e => {
                  eventFormData.businessEvenType3 = e.target.value;
                }}
              />
            </Field>

            <Field
              name="businessEvenStatus"
              label="是否启用"
              decorator={{
                initialValue: eventFormData.businessEvenStatus || 'YES',
                rules: [
                  {
                    required: true,
                    message: '请选择是否启用',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM:YESNO"
                placeholder="请选择是否启用"
                onValueChange={e => {
                  eventFormData.businessEvenStatus = e.code;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default EventModal;
