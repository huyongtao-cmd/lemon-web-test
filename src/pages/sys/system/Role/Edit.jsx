import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { treeToPlain } from '@/components/common/TreeTransfer';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { fromQs } from '@/utils/stringUtils';
import { RoleRaabsTransfer, NavsTree } from '@/pages/gen/field';

const { Field } = FieldList;
const DOMAIN = 'sysroleEdit';

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

@connect(({ sysroleEdit }) => ({ sysroleEdit }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class SystemRoleDetail extends PureComponent {
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
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: values,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/powerMgmt/role');
  };

  handleNavs = checkedKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        navChekcedKeys: checkedKeys,
      },
    });
  };

  handleNavsSave = () => {
    const { dispatch, sysroleEdit } = this.props;
    const { id } = fromQs();
    const { navTree, navChekcedKeys } = sysroleEdit;
    const { plain } = treeToPlain(navTree, defaultStructure);
    const checkedPalins = plain.filter(p => navChekcedKeys.indexOf(p.code) > -1).map(p => p.code);
    dispatch({
      type: `${DOMAIN}/saveNavs`,
      payload: {
        id,
        navCodes: checkedPalins,
      },
    });
  };

  handleRaabs = (activeKeys, activeData) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        raabCodes: activeKeys,
      },
    });
  };

  handleRaabsSave = () => {
    const { dispatch, sysroleEdit } = this.props;
    const { id } = fromQs();
    const { raabCodes } = sysroleEdit;
    dispatch({
      type: `${DOMAIN}/saveRaabs`,
      payload: {
        id,
        raabCodes,
      },
    });
  };

  render() {
    const { form, sysroleEdit } = this.props;
    const { getFieldDecorator } = form;
    const { formData, navTree, navChekcedKeys, raabCodes } = sysroleEdit;

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
              name="name"
              label={formatMessage({ id: 'sys.system.name', desc: '名称' })}
              decorator={{
                initialValue: formData.name,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入名称" />
            </Field>
            <Field
              name="code"
              label={formatMessage({ id: 'sys.system.code', desc: '编号' })}
              decorator={{
                initialValue: formData.code,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入编号" disabled />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="sys.system.roles.navs" defaultMessage="导航清单" />}
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={() => this.handleNavsSave()}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <ReactiveWrapper>
            <NavsTree checkedKeys={navChekcedKeys} treeData={navTree} onChange={this.handleNavs} />
          </ReactiveWrapper>
        </Card>
        <br />
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="sys.system.roles.raabs" defaultMessage="能力清单" />}
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleRaabsSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <DescriptionList size="large" col={1} noReactive>
            <ReactiveWrapper colProps={{ xl: 24 }}>
              <RoleRaabsTransfer defaultCheckedKeys={raabCodes || []} onChange={this.handleRaabs} />
            </ReactiveWrapper>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
