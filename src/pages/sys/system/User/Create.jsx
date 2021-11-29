import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Form, Card, Input } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;
const DOMAIN = 'sysuserCreate';

@connect(({ sysuserCreate }) => ({ sysuserCreate }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];

      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class SystemUserDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { values },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/system/user');
  };

  render() {
    const { form, sysuserCreate, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const { formData, custData = [], custDataSource = [] } = sysuserCreate;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList legend="基本情况" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="name"
              label={formatMessage({ id: 'sys.system.users.name', desc: '用户名' })}
              decorator={{
                initialValue: formData.name,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入姓名" />
            </Field>
            <Field
              name="login"
              label={formatMessage({ id: 'sys.system.loginName', desc: '登录名' })}
              decorator={{
                initialValue: formData.login,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入登陆名" />
            </Field>
            <Field
              name="title"
              label={formatMessage({ id: 'sys.system.users.title', desc: '抬头' })}
              decorator={{
                initialValue: formData.title,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入抬头" />
            </Field>
            <Field
              name="password"
              label={formatMessage({ id: 'sys.system.password', desc: '密码' })}
              decorator={{
                initialValue: formData.password,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入密码" />
            </Field>
            <Field
              name="email"
              label={formatMessage({ id: 'sys.system.email', desc: '邮箱' })}
              decorator={{
                initialValue: formData.email,
                rules: [
                  {
                    pattern: /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                    message: '请录入正确的邮件编码',
                  },
                  { required: true, message: '必填' },
                ],
              }}
            >
              <Input placeholder="请输入邮箱" />
            </Field>
            <Field
              name="phone"
              label={formatMessage({ id: 'sys.system.phone', desc: '手机号' })}
              decorator={{
                initialValue: formData.phone,
                rules: [
                  {
                    pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                    message: '请录入正确的手机号码',
                  },
                  { required: true, message: '必填' },
                ],
              }}
            >
              <Input placeholder="请输入手机号" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemUserDetail;
