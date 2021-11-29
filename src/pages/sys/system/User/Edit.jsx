import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, omit } from 'ramda';
import { Button, Form, Card, Input, Switch, Divider } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { findRoles } from '@/services/sys/iam/roles';
import { getFlowRoles } from '@/services/sys/iam/users';
import { getRaabs } from '@/services/sys/iam/raabs';

const { Field } = FieldList;
const DOMAIN = 'sysuserEdit';

@connect(({ sysuserEdit }) => ({ sysuserEdit }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { dispatch } = props;
    const { name, value } = Object.values(changedFields)[0];
    let val = null;

    if (name === 'resId') {
      val = value.id;
    } else {
      val = value;
    }
    if (name === 'roleCodes' || name === 'raabCodes' || name === 'flowRoleCodes') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          [name]: val,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class SystemUserDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      // console.warn(values);
      const resId = values.resId ? values.resId.id : undefined;
      if (!error) {
        const payload = omit(
          ['roleCodes', 'raabCodes', 'signUpTime', 'activeTime', 'disabled'],
          values
        );
        const { id } = fromQs();
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            id,
            params: { ...payload, resId, disabled: !values.disabled },
          },
        });
      }
    });
  };

  handleRoles = () => {
    const { dispatch, sysuserEdit } = this.props;
    const { id } = fromQs();
    const { roleCodes } = sysuserEdit;
    dispatch({
      type: `${DOMAIN}/saveRoles`,
      payload: {
        id,
        roleCodes,
      },
    });
  };

  handleFlowRoles = () => {
    const { dispatch, sysuserEdit } = this.props;
    const { id } = fromQs();
    const { flowRoleCodes } = sysuserEdit;
    // console.log('------flowRoleCodes', flowRoleCodes);

    dispatch({
      type: `${DOMAIN}/saveFlowRoles`,
      payload: {
        userId: id,
        flowRoleIds: flowRoleCodes,
      },
    });
  };

  handleRaabs = () => {
    const { dispatch, sysuserEdit } = this.props;
    const { id } = fromQs();
    const { raabCodes } = sysuserEdit;
    dispatch({
      type: `${DOMAIN}/saveRaabs`,
      payload: {
        id,
        raabCodes,
      },
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/system/user');
  };

  render() {
    const { form, sysuserEdit, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const {
      formData,
      roleCodes,
      flowRoleCodes,
      raabCodes,
      custData = [],
      custDataSource = [],
    } = sysuserEdit;

    // console.log('------roleCodes----', roleCodes);
    // console.log('------flowRoleCodes----', flowRoleCodes);
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
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
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
        >
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
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="type"
              label={formatMessage({ id: 'sys.system.users.type', desc: '类型' })}
              decorator={{
                initialValue: formData.type,
              }}
            >
              <Input disabled />
            </Field>
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
              <Input placeholder="请输入登录名" />
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
            <Field
              name="signUpTime"
              label={formatMessage({ id: 'sys.system.users.signUpTime', desc: '注册时间' })}
              decorator={{
                initialValue: formatDT(formData.signUpTime, 'YYYY-MM-DD HH:mm:ss'),
              }}
            >
              <Input placeholder="请输入注册时间" disabled />
            </Field>
            <Field
              name="activeTime"
              label={formatMessage({ id: 'sys.system.users.activeTime', desc: '激活时间' })}
              decorator={{
                initialValue: formatDT(formData.activeTime, 'YYYY-MM-DD HH:mm:ss'),
              }}
            >
              <Input placeholder="请输入激活时间" disabled />
            </Field>
            <Field
              name="builtIn"
              label={formatMessage({ id: 'sys.system.users.isbuiltIn', desc: '是否内置' })}
              decorator={{
                initialValue: formData.builtIn,
                valuePropName: 'checked',
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" disabled />
            </Field>
            <Field
              name="disabled"
              label={formatMessage({ id: 'sys.system.users.isDisabled', desc: '是否启用' })}
              decorator={{
                initialValue: !formData.disabled,
                valuePropName: 'checked',
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field>
          </FieldList>
        </Card>

        <br />
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="sys.system.roleConfig" defaultMessage="业务角色配置" />}
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleRoles}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="roleCodes"
              label={formatMessage({ id: 'sys.system.role', desc: '业务角色' })}
              decorator={{
                initialValue: roleCodes,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelect
                mode="multiple"
                source={() => findRoles({ limit: 0 }).then(resp => resp.response.rows)}
              />
            </Field>
          </FieldList>
        </Card>

        <br />
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="sys.system.flow.roleConfig" defaultMessage="流程角色配置" />
          }
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleFlowRoles}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="flowRoleCodes"
              label={formatMessage({ id: 'sys.system.flow.role', desc: '流程角色' })}
              decorator={{
                initialValue: flowRoleCodes,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelect
                mode="multiple"
                source={() => getFlowRoles({ limit: 0 }).then(resp => resp.response)}
              />
            </Field>
          </FieldList>
        </Card>

        <br />
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="sys.system.users.externalConfig"
              defaultMessage="额外能力配置"
            />
          }
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleRaabs}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="raabCodes"
              label={formatMessage({ id: 'sys.system.users.external', desc: '额外能力' })}
              decorator={{
                initialValue: raabCodes,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelect
                mode="multiple"
                source={() => getRaabs().then(resp => resp.response.rows)}
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemUserDetail;
