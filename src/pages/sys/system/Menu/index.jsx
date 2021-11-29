import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Col, Divider, Form, Input, Row, Select, TreeSelect } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import DescriptionList from '@/components/layout/DescriptionList';
import FieldList from '@/components/layout/FieldList';
import Loading from '@/components/core/DataLoading';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import styles from '../Help/help.less';

const DOMAIN = 'systemMenu';
const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

/**
 * 系统菜单
 */
@connect(({ loading, systemMenu, dispatch }) => ({
  treeLoading: loading.effects[`${DOMAIN}/getTree`],
  ...systemMenu,
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
class SystemMenu extends PureComponent {
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
          <Description term="编码">{formData.code}</Description>
          <Description term="上级菜单">
            {formData.pcode && formData.pcode.trim().length > 0 ? formData.pname : '系统菜单'}
          </Description>
          <Description term="前端路由">{formData.portalRoute}</Description>
          <Description term="图标">{formData.icon}</Description>
          <Description term="排序码">{formData.tcode}</Description>
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
          name="code"
          label="编码"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.code,
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
          name="portalRoute"
          label="前端路由"
          decorator={{
            rules: [{ required: true, message: '请输入' }],
            initialValue: formData.portalRoute,
          }}
        >
          <Input style={{ width: '100%' }} />
        </Field>
        <Field
          name="icon"
          label="图标"
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
          key="NEW"
          onClick={() => {
            this.handleInsert();
          }}
        >
          新增子菜单
        </a>,
      ]);
    }

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            size="large"
            onClick={() => router.push('/back/tenant/navTenantManage')}
          >
            租户菜单管理
          </Button>
        </Card>
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

export default SystemMenu;
