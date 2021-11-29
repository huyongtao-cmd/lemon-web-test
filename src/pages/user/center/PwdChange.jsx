import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Form, Input } from 'antd';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';

const { Field } = FieldList;

const DOMAIN = 'userCenterPwdChange';

@connect(({ loading, userCenterPwdChange, dispatch }) => ({
  loading,
  userCenterPwdChange,
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
class PwdChange extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
  }

  // 保存按钮事件
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      userCenterPwdChange: { formData },
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="oldPwd"
              label="旧密码"
              decorator={{
                initialValue: formData.oldPwd,
                rules: [
                  {
                    required: true,
                    message: '请输入旧密码',
                  },
                ],
              }}
            >
              <Input type="password" placeholder="请输入旧密码" />
            </Field>

            <Field
              name="newPwd"
              label="新密码"
              decorator={{
                initialValue: formData.newPwd,
                rules: [
                  {
                    required: true,
                    message: '请输入新密码',
                  },
                ],
              }}
            >
              <Input
                type="password"
                placeholder="字母大小写、数字、特殊符号任意3个组成且长度大于6"
              />
            </Field>

            <Field
              name="newPwdConfirm"
              label="确认密码"
              decorator={{
                initialValue: formData.newPwdConfirm,
                rules: [
                  {
                    required: true,
                    message: '请输入确认密码',
                  },
                ],
              }}
            >
              <Input type="password" placeholder="请输入确认密码" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PwdChange;
