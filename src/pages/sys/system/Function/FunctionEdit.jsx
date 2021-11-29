// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  TreeSelect,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import RichText from '@/components/common/RichText';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'systemFunctionEdit';

@connect(({ loading, systemFunctionEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...systemFunctionEdit,
  dispatch,
  user,
}))
@Form.create({
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
class SystemFunction extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryList`,
    });
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }
    let linkNav;
    if (formData.linkNav) {
      linkNav = formData.linkNav.join(',') + ',';
    }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          ...copyObj,
          linkNav,
        },
      });
    });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child.map(item => ({
          ...item,
          value: item.tcode,
          title: item.name,
          key: item.tcode,
          children: item.children ? this.mergeDeep(item.children) : null,
        }))
      : [];

  render() {
    const {
      loading,
      formData,
      navTree,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const treeData = this.mergeDeep(navTree);

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={loading}
            onClick={this.handleSave}
          >
            保存
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            {/* <Field
              name="module"
              label="模块"
              decorator={{
                initialValue: formData.module,
                rules: [{ required: true, message: '请输入模块' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field> */}

            <Field
              name="functionName"
              label="功能名称"
              decorator={{
                initialValue: formData.functionName,
                rules: [{ required: true, message: '请选择功能名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="linkNav"
              label="关联目录"
              decorator={{
                initialValue: formData.linkNav,
                rules: [{ required: true, message: '请输入关联目录' }],
              }}
            >
              <TreeSelect treeData={treeData} treeCheckable />
            </Field>

            <Field
              name="functionNumber"
              label="序号"
              decorator={{
                initialValue: formData.functionNumber,
                rules: [{ required: false, message: '请输入序号' }],
              }}
            >
              <InputNumber className="x-fill-100" />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false, message: '请输入备注' }],
              }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemFunction;
