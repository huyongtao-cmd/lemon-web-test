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

const DOMAIN = 'dataMartEdit';

@connect(({ loading, dataMartEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...dataMartEdit,
  dispatch,
  user,
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
// @mountToTab()
class DataMartEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
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
        },
      });
    });
  };

  render() {
    const {
      loading,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;

    const param = fromQs();

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
              name="martName"
              label="名称"
              decorator={{
                initialValue: formData.martName,
                rules: [{ required: false, message: '请输入名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="tableId"
              label="来源表"
              decorator={{
                initialValue: formData.tableId,
                rules: [{ required: false, message: '请输入序号' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="keyColumn"
              label="键字段"
              decorator={{
                initialValue: formData.keyColumn,
                rules: [{ required: false, message: '请输入键字段' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="keyRangeType"
              label="键区间类型"
              decorator={{
                initialValue: formData.keyRangeType,
                rules: [{ required: false, message: '请输入键区间类型' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="keyRangeDefine"
              label="键区间自定义"
              decorator={{
                initialValue: formData.keyRangeDefine,
                rules: [{ required: false, message: '请输入键区间自定义' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="valueColumn"
              label="值字段"
              decorator={{
                initialValue: formData.valueColumn,
                rules: [{ required: false, message: '请输入值字段' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="filterExpression"
              label="过滤条件表达式"
              decorator={{
                initialValue: formData.filterExpression,
                rules: [{ required: false, message: '请输入过滤条件表达式' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="rowLimit"
              label="数据最大长度"
              decorator={{
                initialValue: formData.rowLimit,
                rules: [{ required: false, message: '请输入数据最大长度' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="chartType"
              label="表格类型"
              decorator={{
                initialValue: formData.chartType,
                rules: [{ required: false, message: '请输入表格类型' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="transposeFlag"
              label="坐标轴旋转"
              decorator={{
                initialValue: formData.transposeFlag,
                rules: [{ required: false, message: '请输入坐标轴旋转' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="groupColumn"
              label="分组字段"
              decorator={{
                initialValue: formData.groupColumn,
                rules: [{ required: false, message: '请输入分组字段' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="dimensionColumn"
              label="统计维度字段"
              decorator={{
                initialValue: formData.dimensionColumn,
                rules: [{ required: false, message: '请输入统计维度字段' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="orderColumn"
              label="排序字段"
              decorator={{
                initialValue: formData.orderColumn,
                rules: [{ required: false, message: '请输入排序字段' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="orderDirection"
              label="排序方向"
              decorator={{
                initialValue: formData.orderDirection,
                rules: [{ required: false, message: '请输入排序方向' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            {/* <Field
              name="directoryVisibleFlag"
              label="目录显示"
              decorator={{
                initialValue: formData.directoryVisibleFlag,
                rules: [{ required: false, message: '请选择目录是否显示' }],
              }}
            >
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={formData.directoryVisibleFlag}
                loading={loading}
                // onChange={() => this.handleDirectoryVisibleChange(row.id, value===1?0:1)}
              />
            </Field> */}

            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>

          <br />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DataMartEdit;
