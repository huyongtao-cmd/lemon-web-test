import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection, UdcSelect } from '@/pages/gen/field';
import AsyncSelectDisable from '@/components/common/AsyncSelectDisable';
import { selectEvalPoint } from '@/services/sys/baseinfo/eval';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'projectLogDetails';
const { Field } = FieldList;

@connect(({ loading, projectLogDetails, dispatch }) => ({
  loading,
  projectLogDetails,
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
class AddHistory extends React.Component {
  state = {
    evalTypeData: [],
  };

  // 保存按钮
  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      toggle,
      projectLogDetails,
      mode,
      logId,
    } = this.props;
    const { formData } = projectLogDetails;
    validateFieldsAndScroll((error, values) => {
      const ids = formData.id;
      const form = {
        ...values,
        changeId: ids,
      };
      if (!error) {
        const changeContentTemp = values.changeContent ? values.changeContent : null;
        if (changeContentTemp === null) {
          createMessage({ type: 'error', description: '请最少输入5个字' });
          return;
        }
        if (changeContentTemp.length < 5) {
          createMessage({ type: 'error', description: '请最少输入5个字' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            values: {
              ...form,
            },
          },
        }).then(res => {
          createMessage({ type: 'success', description: '添加成功' });
          dispatch({
            type: `${DOMAIN}/findProjectChangeLogList`,
            payload: { mode, changeId: isNil(logId) ? '' : logId },
          });
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
      visible,
      title,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      projectLogDetails: { formData },
    } = this.props;
    const { evalTypeData } = this.state;

    return (
      <Modal
        width="60%"
        destroyOnClose
        title="添加备注"
        okText="保存"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            <Field
              name="changeContent"
              decorator={{
                initialValue: undefined,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 10, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea autosize={{ minRows: 5, maxRows: 8 }} placeholder="请输入备注说明" />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default AddHistory;
