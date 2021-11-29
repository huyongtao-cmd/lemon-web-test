import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  TreeSelect,
  Switch,
  Tooltip,
} from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import DescriptionList from '@/components/layout/DescriptionList';
import FieldList from '@/components/layout/FieldList';
import Loading from '@/components/core/DataLoading';
import { createConfirm } from '@/components/core/Confirm';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import styles from '../Help/help.less';

const DOMAIN = 'tenantMenu';
const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

/**
 * 租户菜单维护
 */
@connect(({ loading, tenantMenu, dispatch }) => ({
  treeLoading: loading.effects[`${DOMAIN}/getTree`],
  ...tenantMenu,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class TenantMenu extends PureComponent {
  state = {};

  componentDidMount() {
    this.callModelEffects('getTree');
    this.callModelEffects('handleMenuSelectChange', { code: ' ' });
  }

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onCheck = (checkedKeys, info) => {};

  onSelect = async (selectedKeys, e) => {
    const { node } = e;
    const { eventKey, children } = node.props;
    this.callModelEffects('handleMenuSelectChange', { code: selectedKeys[0] });
  };

  renderMenuForm = () => {
    const {
      formData,
      tree,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    if (!formData.edit) {
      return (
        <DescriptionList size="large" col={2}>
          <Description term="菜单名称">{formData.name}</Description>
          <Description term="上级菜单">
            {formData.pcode && formData.pcode.trim().length > 0 ? formData.pname : '系统菜单'}
          </Description>
          <Description term="图标">{formData.icon}</Description>
          <Description term="排序码">{formData.tcode}</Description>
          <Description term="有效">{formData.enabledFlag ? '是' : '否'}</Description>
        </DescriptionList>
      );
    }
    return (
      <FieldList legend="申请信息" getFieldDecorator={getFieldDecorator} col={2}>
        <Field
          name="name"
          label="菜单名称"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.name,
          }}
        >
          <Input style={{ width: '100%' }} />
        </Field>
        <Field
          name="pcode"
          label="上级菜单"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.pcode && formData.pcode.trim().length > 0 ? formData.pcode : ' ',
          }}
        >
          <TreeSelect allowClear treeData={tree} />
        </Field>

        <Field
          name="icon"
          label="图标"
          popover={{
            placement: 'topLeft',
            trigger: 'hover',
            content: '请参考: https://3x.ant.design/components/icon-cn/ 文档,配置图标的type值即可.',
          }}
          decorator={{
            initialValue: formData.icon,
          }}
        >
          <Input style={{ width: '100%' }} />
        </Field>
        <Field
          name="tcode"
          label="排序码"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.tcode,
          }}
        >
          <Input style={{ width: '100%' }} />
        </Field>
        <Field
          name="enabledFlag"
          label="有效"
          valuePropName="checked"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.enabledFlag,
          }}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Field>
      </FieldList>
    );
  };

  handleInsert = () => {
    const { formData } = this.props;
    this.updateModelState({
      formData: {
        edit: true,
        insert: true,
        code: formData.code.trim().length > 0 ? formData.code + '.' : formData.code.trim(),
        pcode: formData.code,
      },
    });
  };

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      // eslint-disable-next-line no-param-reassign
      delete values.code;
      dispatch({
        type: `${DOMAIN}/save`,
        payload: { ...formData, ...values, pcode: values.pcode.trim() },
      });
    });
  };

  render() {
    const { treeLoading, tree, formData, defaultSelectedKeys, dispatch } = this.props;
    const editProps = {};
    if (formData.code === ' ') {
      editProps.style = { color: 'rgba(0, 0, 0, 0.25)', cursor: 'not-allowed' };
    } else {
      editProps.onClick = function() {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { edit: true, insert: false },
        });
      };
    }
    let extra = [];
    if (formData.edit) {
      extra = extra.concat([
        <a
          key="EDIT"
          onClick={() => {
            this.handleSave();
          }}
        >
          保存
        </a>,
      ]);
    } else {
      extra = extra.concat([
        <a key="EDIT" {...editProps}>
          编辑
        </a>,
        ' | ',
        <a
          key="DELETE"
          {...editProps}
          onClick={() => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { keys: formData.id, code: ' ' },
                }),
            });
          }}
        >
          删除
        </a>,
      ]);
    }

    return (
      <PageHeaderWrapper>
        <Row gutter={5} className={styles['help-wrap']}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={6} className={styles['help-menu-wrap']}>
            {!treeLoading ? (
              <TreeSearch
                checkable={false}
                showSearch
                placeholder="请输入关键字"
                treeData={tree}
                onSelect={this.onSelect}
                defaultExpandedKeys={tree.map(item => `${item.id}`)}
                defaultSelectedKeys={defaultSelectedKeys}
                onCheck={this.onCheck}
              />
            ) : (
              <Loading />
            )}
          </Col>

          <Col id="helpPreviewPage" span={18} className={styles['help-content-wrap']}>
            <Card className="tw-card-adjust" title="菜单信息" bordered={false} extra={extra}>
              {this.renderMenuForm()}
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default TenantMenu;
