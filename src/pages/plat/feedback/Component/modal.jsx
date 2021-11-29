import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input, Modal, Row, Col, Divider, Table, Form } from 'antd';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Ueditor from '@/components/common/Ueditor';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { result } from 'lodash';
import { fromQs, toQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'feedbackInfo';
const { Field } = FieldList;
// import styles from './course.less';
@connect(({ loading, feedbackInfo, dispatch }) => ({
  loading,
  feedbackInfo,
  dispatch,
}))
@Form.create({})
class PointModal extends PureComponent {
  componentDidMount() {}

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      addPoint,
      pointType,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        addPoint && addPoint({ ...values, pointType, feedbackId: fromQs().id });
      }
    });
  };

  render() {
    const {
      visible,
      onToggle,
      pointType,
      feedbackInfo = {},
      form: { getFieldDecorator },
    } = this.props;
    const title = pointType === 'remark' ? '添加备注' : '添加处理结果';
    const { formData = {} } = feedbackInfo;
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        onCancel={onToggle}
        width="60%"
        onOk={this.handleSave}
        bodyStyle={{ padding: '10px 30px 30px' }}
        centered
      >
        {pointType === 'remark' ? (
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              decorator={{
                initialValue: formData.mark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={8} placeholder="请输入备注" />
            </Field>
          </FieldList>
        ) : (
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="problemLead"
              label="负责人"
              decorator={{
                initialValue: formData.problemLead || '',
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="负责人" />
            </Field>
            <Field
              name="result"
              label="处理结果"
              decorator={{
                initialValue: formData.result || '',
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Selection.UDC code="APM:SOLVE_RESULT" placeholder="请选择状态" />
            </Field>
          </FieldList>
        )}
      </Modal>
    );
  }
}

export default PointModal;
