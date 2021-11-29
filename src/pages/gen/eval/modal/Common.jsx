import { connect } from 'dva';
import React from 'react';
import { Checkbox, Form, Input, Modal, Tooltip, Button, Rate, Icon, Divider } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const fieldLayout = {
  labelCol: { span: 8, xxl: 8 },
  wrapperCol: { span: 16, xxl: 16 },
};

const fieldCol1Layout = {
  labelCol: { span: 4, xxl: 4 },
  wrapperCol: { span: 18, xxl: 18 },
};

const DOMAIN = 'evalCommonModal';

@connect(({ user, loading, evalCommonModal, dispatch }) => ({
  user,
  loading,
  evalCommonModal,
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
class EvalCommonModal extends React.Component {
  // 保存按钮
  handleSubmit = bool => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      toggle,
    } = this.props;
    if (bool) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/submit`,
            payload: bool,
          }).then(resp => {
            if (resp) {
              dispatch({
                type: `userTaskView/updateState`,
                payload: {
                  hasEval: 1,
                },
              });
              //
              const param = fromQs();
              if (param.id) {
                dispatch({
                  type: `userTaskView/query`,
                  payload: param,
                }).then(res => {
                  dispatch({
                    type: `userTaskView/principal`,
                    payload: param,
                  }).then(resId => {
                    let evalType = '';
                    let evaledResId = '';
                    if (resId === res.disterResId) {
                      evalType = 'SENDER2RECEIVER';
                      evaledResId = res.receiverResId;
                    } else if (resId === res.receiverResId) {
                      evalType = 'RECEIVER2SENDER';
                      evaledResId = res.disterResId;
                    }
                    // 检查是否评价过
                    dispatch({
                      type: `userTaskView/isEval`,
                      payload: {
                        evalClass: 'TASK',
                        evalType,
                        sourceId: param.id,
                      },
                    });
                  });
                });
              }
            }
            toggle();
          });
        }
      });
    } else {
      dispatch({
        type: `${DOMAIN}/submit`,
        payload: bool,
      }).then(res => {
        if (res) {
          dispatch({
            type: `userTaskView/updateState`,
            payload: {
              hasEval: 1,
            },
          });
        }
        toggle();
      });
    }
  };

  handleCancel = () => {
    const { toggle } = this.props;
    toggle();
  };

  render() {
    const {
      loading,
      visible,
      form: { getFieldDecorator },
      evalCommonModal: { formData },
    } = this.props;
    return (
      <Modal
        width={950}
        destroyOnClose
        title="评价"
        okText="提交"
        visible={visible}
        // onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        footer={
          <>
            <Button size="large" onClick={() => this.handleSubmit(false)}>
              忽略评价
            </Button>
            <Button type="primary" size="large" onClick={() => this.handleSubmit(true)}>
              确定
            </Button>
            <Button size="large" onClick={this.handleCancel}>
              取消
            </Button>
          </>
        }
      >
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
          {/* <Field
            name="evalClass"
            label="评价类别"
            decorator={{
              initialValue: formData.evalClassName,
            }}
            {...fieldLayout}
          >
            <Input disabled />
          </Field>
          <Field
            name="evalType"
            label="评价类型"
            decorator={{
              initialValue: formData.evalTypeName,
            }}
            {...fieldLayout}
          >
            <Input disabled />
          </Field>
          <Field
            name="evalerResId"
            label="评价人"
            decorator={{
              initialValue: formData.evalerResName,
            }}
            {...fieldLayout}
          >
            <Input disabled />
          </Field>
          <Field
            name="evaledResId"
            label="被评价人"
            decorator={{
              initialValue: formData.evaledResName,
            }}
            {...fieldLayout}
          >
            <Input disabled />
          </Field> */}
          <Field
            name="evalComment"
            label="总评语"
            decorator={{
              initialValue: formData.evalComment,
              rules: [{ max: 400, message: '不超过400个字' }],
            }}
            fieldCol={1}
            {...fieldCol1Layout}
          >
            <Input.TextArea
              placeholder="请输入评语"
              rows={1}
              onChange={e => {
                formData.evalComment = e.target.value;
              }}
            />
          </Field>
        </FieldList>

        <Divider dashed />

        {formData.itemList.length > 0 &&
          formData.itemList.map((v, i) => (
            <>
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                noReactive
              >
                <Field
                  name={'evalScore' + i}
                  label={<span style={{ color: '#284488', fontWeight: 400 }}>{v.evalPoint}</span>}
                  decorator={{
                    initialValue: formData.evalDEntities[i] && formData.evalDEntities[i].evalScore,
                    rules: [
                      {
                        required: !formData['inapplicable' + i],
                        message: '请评分',
                      },
                    ],
                  }}
                  {...fieldLayout}
                >
                  <Rate
                    count={+v.scoreTo}
                    character={
                      <Tooltip title={v.standardDesc}>
                        <Icon type="star" theme="filled" />
                      </Tooltip>
                    }
                    allowClear
                  />
                </Field>
                <Field
                  name={'inapplicable' + i}
                  label="不适用"
                  decorator={{
                    initialValue:
                      formData.evalDEntities[i] && formData.evalDEntities[i].inapplicable,
                  }}
                  {...fieldLayout}
                >
                  <Checkbox />
                </Field>
                <Field
                  name={'evalComment' + i}
                  label="简评"
                  fieldCol={1}
                  decorator={{
                    initialValue:
                      formData.evalDEntities[i] && formData.evalDEntities[i].evalComment,
                    rules: [{ max: 400, message: '不超过400个字' }],
                  }}
                  {...fieldCol1Layout}
                >
                  <Input.TextArea placeholder="请输入简评" rows={1} />
                </Field>
              </FieldList>
            </>
          ))}
      </Modal>
    );
  }
}

export default EvalCommonModal;
