import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Form, Card, Input, Switch } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect } from '@/pages/gen/field';
import { selectIamUsers } from '@/services/gen/list';

const { Field } = FieldList;
const DOMAIN = 'flowRoleCreate';

@connect(({ flowRoleCreate }) => ({ flowRoleCreate }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;

      if (name === 'resId') {
        val = value.id;
      } else {
        val = value;
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class FlowRoleCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanFormData` });
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
          payload: values,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/flowMen/flow/roles');
  };

  render() {
    const { form, flowRoleCreate, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const { formData, custData = [], custDataSource = [] } = flowRoleCreate;

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
              name="flowRoleCode"
              label={formatMessage({ id: 'sys.system.flow.roleCode', desc: '角色编号' })}
              decorator={{
                initialValue: formData.flowRoleCode,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入角色编号" />
            </Field>
            <Field
              name="flowRoleName"
              label={formatMessage({ id: 'sys.system.flow.roleName', desc: '角色名称' })}
              decorator={{
                initialValue: formData.flowRoleName,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入角色名称" />
            </Field>
            <Field
              name="isMoreUser"
              label={formatMessage({ id: 'sys.system.flow.isMoreUser', desc: '是否多人' })}
              decorator={{
                initialValue: formData.isMoreUser,
                valuePropName: 'checked',
                normalize: (value, prevValue, allValues) => {
                  const { userIds = [] } = allValues;
                  if (value) return value;
                  if (userIds.length > 1) {
                    // 此时绑定用户大于1，但是是否多人将要变成否，因此不允许为否
                    createMessage({
                      type: 'warning',
                      description: '“绑定用户”值大于1个与“是否多人”为【否】不能共存',
                    });
                    return prevValue;
                  }
                  return value;
                },
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field>
            <Field
              name="roleStatus"
              label={formatMessage({ id: 'sys.system.flow.roleStatus', desc: '角色状态' })}
              decorator={{
                initialValue: formData.roleStatus,
                valuePropName: 'checked',
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              decorator={{
                initialValue: formData.phone,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="userIds"
              label={formatMessage({ id: 'sys.system.flow.userBind', desc: '绑定用户' })}
              decorator={{
                initialValue: formData.userIds,
                normalize: (value, prevValue, allValues) => {
                  const { isMoreUser } = allValues;
                  if (isMoreUser) return value;
                  if (value.length > 1) {
                    // createMessage({ type: 'warning', description: '“是否多人”为【否】时，只能选择单个用户' });
                    return prevValue;
                  }
                  return value;
                },
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelect
                mode="multiple"
                source={() => selectIamUsers().then(resp => resp.response)}
              />
            </Field>
            <Field
              name="baseCitys"
              label={formatMessage({ id: 'sys.system.flow.baseCity', desc: '管理区域' })}
              decorator={{
                initialValue: formData.baseCity,
              }}
            >
              <UdcSelect mode="multiple" code="COM.CITY" placeholder="请选择管理区域" />
            </Field>
            <Field
              name="defaultFlag"
              label={formatMessage({ id: 'sys.system.flow.defaultFlag', desc: '是否默认' })}
              decorator={{
                initialValue: formData.defaultFlag,
                valuePropName: 'checked',
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FlowRoleCreate;
