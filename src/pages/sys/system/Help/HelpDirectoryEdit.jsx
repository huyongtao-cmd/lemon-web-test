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

const DOMAIN = 'helpDirectoryEdit';

@connect(({ loading, helpDirectoryEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...helpDirectoryEdit,
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
class HelpDirectoryEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getTree`,
    });
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
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

    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
        },
      });
    });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child.map(item => ({
          ...item,
          value: item.id,
          title: item.directoryName,
          key: item.id,
          children: item.children ? this.mergeDeep(item.children) : null,
        }))
      : [];

  render() {
    const {
      loading,
      formData,
      tree,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;

    const treeData = this.mergeDeep(tree);

    // const treeData = [
    //   {
    //     title: '根节点',
    //     value: '0',
    //     key: '0',
    //     children: [
    //       {
    //         title: 'Child Node1',
    //         value: '0-0-1',
    //         key: '0-0-1',
    //       },
    //       {
    //         title: 'Child Node2',
    //         value: '0-0-2',
    //         key: '0-0-2',
    //       },
    //     ],
    //   },
    //   {
    //     title: 'Node2',
    //     value: '0-1',
    //     key: '0-1',
    //   },
    // ];
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
            <Field
              name="directoryName"
              label="目录名称"
              decorator={{
                initialValue: formData.directoryName,
                rules: [{ required: true, message: '请输入目录名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="topDirectory"
              label="上级目录"
              decorator={{
                initialValue: formData.topDirectory,
              }}
            >
              <TreeSelect treeData={treeData} />
            </Field>

            <Field
              name="directoryNumber"
              label="序号"
              decorator={{
                initialValue: formData.directoryNumber,
                rules: [{ required: true, message: '请输入序号' }],
              }}
            >
              <InputNumber className="x-fill-100" />
            </Field>
          </FieldList>
          <div style={{ color: 'red', lineHeight: '20px', paddingLeft: '160px' }}>
            这里的序号决定目录在项目左侧菜单中的顺序
            在根目录或者父目录下，每个子目录按照序号从小到大排序。
            <br />
            比如98，那么该目录将比其他99的目录都要靠前。以此类推
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default HelpDirectoryEdit;
