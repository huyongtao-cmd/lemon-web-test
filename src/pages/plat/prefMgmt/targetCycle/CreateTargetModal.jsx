import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Radio, Input, InputNumber, Tooltip, Modal, Button, Card, Form, Checkbox } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import FormItem from '@/components/production/business/FormItem';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { isEmpty, isNil } from 'ramda';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const { Field } = FieldList;
const DOMAIN = 'targetCycle';

@connect(({ loading, dispatch, targetCycle }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...targetCycle,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class CreateTargetModal extends PureComponent {
  componentDidMount() {}

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData,
      handleCancel,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { ...formData },
        });
        handleCancel();
      }
    });
  };

  render() {
    const { formData, form, visible, handleCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title="新增KPI周期"
        visible={visible}
        onCancel={handleCancel}
        width="50%"
        footer={
          <div>
            <Button
              className="tw-btn-default"
              type="primary"
              size="large"
              style={{ marginBottom: '5px' }}
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button
              className="tw-btn-primary"
              type="primary"
              size="large"
              style={{ marginBottom: '5px' }}
              onClick={() => {
                this.handleSave();
              }}
            >
              保存
            </Button>
          </div>
        }
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="periodName"
              label="周期名称"
              labelCol={{ span: 8 }}
              decorator={{
                initialValue: formData.periodName,
                rules: [{ required: true, message: '请输入周期名称' }],
              }}
            >
              <Input placeholder="请输入周期名称" />
            </Field>
            <Field
              name="dates"
              label="周期时间段"
              labelCol={{ span: 8 }}
              decorator={{
                initialValue: [formData.beginDate, formData.endDate],
                rules: [{ required: true, message: '请选择周期时间段' }],
              }}
            >
              <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="ouId"
              label="公司名称"
              labelCol={{ span: 8 }}
              decorator={{
                initialValue: formData.ouName,
                rules: [{ required: true, message: '请选择公司名称' }],
              }}
            >
              <Selection source={() => selectInternalOus()} placeholder="请选择公司名称" />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default CreateTargetModal;
