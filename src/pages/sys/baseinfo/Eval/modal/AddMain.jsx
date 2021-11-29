import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { Selection, UdcSelect } from '@/pages/gen/field';
import AsyncSelectDisable from '@/components/common/AsyncSelectDisable';
import { selectEvalPoint } from '@/services/sys/baseinfo/eval';
import { queryCascaderUdc } from '@/services/gen/app';
// import { queryUdc } from '@/services/gen/app';

const DOMAIN = 'sysEvalMain';
const { Field } = FieldList;

@connect(({ loading, sysEvalMain, dispatch }) => ({
  loading,
  sysEvalMain,
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
class AddMainModal extends React.Component {
  state = {
    evalTypeData: [],
  };

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
      visible,
      title,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      sysEvalMain: { formData },
    } = this.props;
    const { evalTypeData } = this.state;

    console.warn(formData);

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={title ? '评价主数据新增' : '评价主数据修改'}
        okText="保存"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            <Field
              name="evalClass"
              label="评价类别"
              decorator={{
                initialValue: formData.id ? formData.evalClassName : formData.evalClass,
                rules: [{ required: !!title, message: '请选评价类别' }],
              }}
            >
              {formData.id ? (
                <Input disabled />
              ) : (
                <UdcSelect
                  code="TSK.EVAL_CLASS"
                  placeholder="请选评价类别"
                  disabled={!title}
                  onChange={v => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { evalType: '' },
                    });
                    setFieldsValue({ evalType: '' });
                    v &&
                      queryCascaderUdc({
                        defId: 'TSK:EVAL_TYPE',
                        parentDefId: 'TSK:EVAL_CLASS',
                        parentVal: v,
                      }).then(({ response }) =>
                        this.setState({
                          evalTypeData: response,
                        })
                      );
                  }}
                />
              )}
            </Field>
            <Field
              name="evalType"
              label="评价类型"
              decorator={{
                initialValue: formData.id ? formData.evalTypeName : formData.evalType,
                rules: [{ required: !!title, message: '请选择评价类型' }],
              }}
            >
              {/* <UdcSelect code="TSK.EVAL_TYPE" placeholder="请选择评价类型" disabled={!title} /> */}
              {formData.id ? (
                <Input disabled />
              ) : (
                <Selection disabled={!title} source={evalTypeData} placeholder="请选择评价类型" />
              )}
            </Field>
            <Field
              name="pointIds"
              label="评价点"
              decorator={{
                initialValue: formData.pointIds,
                rules: [{ required: true, message: '请选择评价点' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelectDisable
                source={() => selectEvalPoint().then(resp => resp.response)}
                placeholder="请选择评价点"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                mode="multiple"
              />
            </Field>
            <Field
              name="evalDesc"
              label="评价标准"
              decorator={{
                initialValue: formData.evalDesc,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default AddMainModal;
