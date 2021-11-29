/* eslint-disable no-underscore-dangle */
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
  Switch,
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
import Ueditor from '@/components/common/Ueditor';
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

const DOMAIN = 'helpPageEdit';

@connect(({ loading, helpPageEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...helpPageEdit,
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
// @mountToTab()
class HelpPageEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/getTree`,
    });
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { editorContent: '' },
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { loadFinish: false, editorContent: this.editor.getContent() },
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
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }

    const helpContent = this.editor.getContent();
    // if (isEmpty(helpContent)) {
    //   createMessage({ type: 'warn', description: '请输入帮助页面正文!' });
    //   return;
    // }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      let { linkUrl } = formData;
      if (linkUrl) {
        linkUrl = linkUrl.replace(/[\r\n]/g, '');
        const linkUrlArray = linkUrl.split(';');
        const linkUrlArrayResult = linkUrlArray
          .filter(tempLink => !isEmpty(tempLink))
          .map(
            tempLink =>
              tempLink.indexOf('?') > 0 ? tempLink.substr(0, tempLink.indexOf('?')) : tempLink
          );
        linkUrl = linkUrlArrayResult.join(';');
      }

      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          linkUrl,
          helpContent,
          ...copyObj,
        },
      });
    });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child.map(item => ({
          ...item,
          value: item.id,
          title: item.helpTitle,
          key: item.id,
          children: item.children ? this.mergeDeep(item.children) : null,
        }))
      : [];

  onEditorContentChange = content => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { editorContent: content },
    });
  };

  render() {
    const {
      loading,
      formData,
      tree,
      editorContent,
      loadFinish,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;

    const treeData = this.mergeDeep(tree);

    const param = fromQs();
    let editorFlag = false;
    if (!param.id) {
      editorFlag = true;
    } else if (loadFinish) {
      editorFlag = true;
    }

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
              name="helpTitle"
              label="标题"
              decorator={{
                initialValue: formData.helpTitle,
                rules: [{ required: true, message: '请输入标题' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="parentId"
              label="上级页面"
              decorator={{
                initialValue: formData.parentId,
              }}
            >
              <TreeSelect allowClear treeData={treeData} />
            </Field>

            <Field
              name="pageNumber"
              label="序号"
              decorator={{
                initialValue: formData.pageNumber,
                rules: [{ required: true, message: '请输入序号' }],
              }}
            >
              <InputNumber className="x-fill-100" precision={0} />
            </Field>

            <Field
              name="directoryVisibleFlag"
              label="目录显示"
              decorator={{
                initialValue: formData.directoryVisibleFlag,
                rules: [{ required: true, message: '请选择目录是否显示' }],
              }}
            >
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={formData.directoryVisibleFlag}
                loading={loading}
                // onChange={() => this.handleDirectoryVisibleChange(row.id, value===1?0:1)}
              />
            </Field>

            <Field presentational />

            <Field
              name="linkUrl"
              label="关联URL"
              fieldCol={1}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              decorator={{
                initialValue: formData.linkUrl,
                rules: [{ required: false, message: '请输入关联URL' }],
              }}
            >
              <Input.TextArea placeholder="请输入关联URL" rows={3} />
            </Field>
          </FieldList>
          <div style={{ color: 'red', lineHeight: '20px', paddingLeft: '160px' }}>
            最多输入10个关联URL，用分号+回车分行。 样例：
            <br />
            /user/home;
            <br />
            /user/home1；
            <br />
            /user/home2；
            <br />
          </div>

          <br />

          {/* {editorFlag && (
            <RichText
              style={{ marginBottom: 20 }}
              value={formData.helpContent}
              onChange={value => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { helpContent: value },
                });
              }}
            />
          )} */}
          {editorFlag ? (
            <Ueditor
              id="helpPageEditor"
              height="500"
              initialContent={param.id || param._refresh === '0' ? editorContent : ''}
              // onChange={this.onEditorContentChange}
              ref={editor => {
                this.editor = editor;
              }}
            />
          ) : (
            ''
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default HelpPageEdit;
