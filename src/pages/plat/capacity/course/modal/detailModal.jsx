import React, { PureComponent } from 'react';
import { Card, Divider, Form, Input, Modal, Select, Radio } from 'antd';
import { isEmpty } from 'ramda';
import update from 'immutability-helper';
import { connect } from 'dva';
import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'platCapaCourse';

const blankState = {
  selectedRowKeys: [],
};
@connect(({ loading, platCapaCourse }) => ({
  loading: loading.effects[`${DOMAIN}/fetch`],
  ...platCapaCourse,
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
class DetailModal extends PureComponent {
  ok = () => {
    const {
      dispatch,
      formData,
      close,
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(error => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            ...formData,
            courseStatusName: formData.courseStatus === 'IN_USE' ? '启用' : '停用',
          },
        }).then(res => {
          res && close();
        });
      }
    });
  };

  cancel = () => {
    const { close } = this.props;
    close();
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      formData,
    } = this.props;
    return (
      <Modal
        className="p-b-5"
        destroyOnClose
        title={formData.id ? '课程修改' : '课程新增'}
        visible={visible}
        onOk={() => {
          this.ok();
        }}
        onCancel={() => {
          this.cancel();
        }}
        width={800}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            <Field
              name="courseNo"
              label="课程编号"
              decorator={{
                initialValue: formData.courseNo,
                rules: [{ required: true, message: '请输入课程编号' }],
              }}
            >
              <Input />
            </Field>
            <Field
              name="courseName"
              label="课程名称"
              decorator={{
                initialValue: formData.courseName,
                rules: [{ required: true, message: '请输入课程名称' }],
              }}
            >
              <Input />
            </Field>
            <Field
              name="classHour"
              label="学时"
              decorator={{
                initialValue: formData.classHour,
                rules: [{ required: true, message: '请输入学时' }],
              }}
            >
              <Input />
            </Field>
            <Field
              name="credit"
              label="学分"
              decorator={{
                initialValue: formData.credit,
              }}
            >
              <Input />
            </Field>
            <Field
              name="courseStatus"
              label="状态"
              decorator={{
                initialValue: formData.courseStatus,
              }}
            >
              <Radio.Group>
                <Radio value="IN_USE">启用</Radio>
                <Radio value="NOT_USED">停用</Radio>
              </Radio.Group>
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default DetailModal;
