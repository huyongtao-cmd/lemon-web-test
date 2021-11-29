import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal, InputNumber } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, hasIn } from 'ramda';
import { UdcSelect, ScopeInput } from '@/pages/gen/field';

const { Field } = FieldList;
const fieldLayout = {
  labelCol: { span: 10, xxl: 8 },
  wrapperCol: { span: 12, xxl: 14 },
};
const fieldColLayout = {
  labelCol: { span: 5, xxl: 4 },
  wrapperCol: { span: 18, xxl: 19 },
};

const DOMAIN = 'sysEvalPoint';

@connect(({ loading, sysEvalPoint, dispatch }) => ({
  loading,
  sysEvalPoint,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
class AddPointModal extends React.Component {
  // 保存按钮
  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      toggle,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(res => {
          res &&
            dispatch({
              type: `${DOMAIN}/clean`,
            }) &&
            toggle();
        });
      }
    });
  };

  handleCancel = () => {
    const { dispatch, toggle } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    toggle();
  };

  render() {
    const {
      loading,
      dispatch,
      visible,
      title,
      form: { getFieldDecorator, setFieldsValue },
      sysEvalPoint: { formData },
    } = this.props;

    return (
      <Modal
        width="50%"
        destroyOnClose
        title={title ? '评价点主数据新增' : '评价点主数据修改'}
        okText="保存"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            <Field
              name="evalPoint"
              label="评价点"
              decorator={{
                initialValue: formData.evalPoint,
                rules: [{ required: true, message: '请选评价类别' }],
              }}
              {...fieldLayout}
            >
              <Input placeholder="请输入评价点" />
            </Field>
            <Field
              name="evalStatus"
              label="状态"
              decorator={{
                initialValue: formData.evalStatus,
                rules: [{ required: true, message: '请选择状态' }],
              }}
              {...fieldLayout}
            >
              <UdcSelect code="COM.STATUS1" placeholder="请选择状态" />
            </Field>
            <Field
              name="evalScore"
              label="分数下限/上限"
              decorator={{
                initialValue: formData.evalScore,
                rules: [
                  { required: true, message: '请输入分数下限' },
                  {
                    validator: (rule, value, callback) => {
                      const BEFORE = value[0];
                      const AFTER = value[1];
                      BEFORE &&
                      AFTER &&
                      (!Number.isNaN(BEFORE) && !Number.isNaN(AFTER)) &&
                      (BEFORE > 0 && AFTER > 0)
                        ? callback()
                        : callback('请输入大于0的整数');
                    },
                  },
                ],
              }}
              {...fieldLayout}
            >
              <ScopeInput
                onChange={() => {
                  setFieldsValue({
                    defaultScore: undefined,
                  });
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      defaultScore: undefined,
                    },
                  });
                }}
              />
            </Field>
            <Field
              name="defaultScore"
              label="默认分数"
              decorator={{
                initialValue: formData.defaultScore,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const [FROM, TO] = formData.evalScore;
                      value && !Number.isNaN(value) && +value > 0 && +value >= FROM && +value <= TO
                        ? callback()
                        : callback('分数下限与上限之间的整数');
                    },
                  },
                ],
              }}
              {...fieldLayout}
            >
              <Input
                placeholder="请输入默认分数"
                disabled={!(formData.evalScore && formData.evalScore[0] && formData.evalScore[1])}
              />
            </Field>
            <Field
              name="standardDesc"
              label="评分标准"
              decorator={{
                initialValue: formData.standardDesc,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              {...fieldColLayout}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default AddPointModal;
