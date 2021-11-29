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
  Radio,
  DatePicker,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil, sum } from 'ramda';

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
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId, checkIfNumber, add, div, mul } from '@/utils/mathUtils';
import update from 'immutability-helper';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'businessCheckEdit';

@connect(({ loading, businessCheckEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...businessCheckEdit,
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
class BusinessCheck extends PureComponent {
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
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  getTableProps = () => {
    const { loading, dispatch, formData, dataSource, deleteKeys } = this.props;

    return {
      rowKey: 'id',
      loading,
      pagination: false,
      sortBy: 'id',
      total: 0,
      dataSource,
      showCopy: true,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(row => _selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
            deleteKeys: [...deleteKeys, ..._selectedRowKeys],
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = update(dataSource, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
          },
        });
      },
      columns: [
        {
          title: '提示语言',
          dataIndex: 'language',
          key: 'language',
          width: '200px',
          required: true,
          options: {
            rules: [{ required: true, message: '请选择提示语言!' }],
          },
          render: (value, row, index) => (
            <Select
              value={value}
              defaultValue="zh-CN"
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'language')}
            >
              <Option value="zh-CN">简体中文(中国)</Option>
              <Option value="zh-HK">繁体中文(香港)</Option>
              <Option value="en-US">英语(美国)</Option>
              <Option value="ja-JP">日语(日本)</Option>
              <Option value="fr-FR">法语(法国)</Option>
              <Option value="de-DE">德语(德国)</Option>
              <Option value="ru-RU">俄语(俄罗斯)</Option>
            </Select>
          ),
        },
        {
          title: '提示信息', // 小于1000
          dataIndex: 'message',
          key: 'message',
          required: true,
          options: {
            rules: [{ required: true, message: '请输入提示信息!' }],
          },
          render: (value, row, index) => (
            <Input.TextArea
              className="x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'message')}
            />
          ),
        },
      ],
      buttons: [],
    };
  };

  handleSave = () => {
    const { form, dispatch, formData, dataSource, deleteKeys } = this.props;
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }

    if (!dataSource || dataSource.length === 0) {
      createMessage({ type: 'warn', description: '请至少添加一条提示信息!' });
      return;
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
          messages: dataSource,
          deleteKeys,
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
              name="checkName"
              label="检查名称"
              decorator={{
                initialValue: formData.checkName,
                rules: [{ required: true, message: '请输入检查名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="functionName"
              label="功能名称"
              decorator={{
                initialValue: formData.functionName,
                rules: [{ required: true, message: '请选择功能名称' }],
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>

            <Field
              name="checkNo"
              label="检查编号"
              decorator={{
                initialValue: formData.checkNo,
                rules: [{ required: true, message: '请输入检查编号' }],
              }}
            >
              <Input style={{ width: '100%' }} disabled />
            </Field>

            <Field
              name="enabledFlag"
              label="是否启用"
              decorator={{
                initialValue:
                  formData.enabledFlag === undefined ? undefined : formData.enabledFlag + '',
                rules: [{ required: true, message: '请选择是否启用' }],
              }}
            >
              <Radio.Group disabled={formData.allowCloseFlag === 0}>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            </Field>

            <Field
              name="allowCloseFlag"
              label="是否可关闭"
              decorator={{
                initialValue:
                  formData.allowCloseFlag === undefined ? undefined : formData.allowCloseFlag + '',
                rules: [{ required: true, message: '请选择是否可关闭' }],
              }}
            >
              <Radio.Group disabled>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            </Field>

            <Field
              name="ext1"
              label="配置参数1"
              decorator={{
                initialValue: formData.ext1,
                rules: [{ required: false, message: '请输入配置参数1' }],
              }}
            >
              <Input style={{ width: '100%' }} placeholder="可输入40个字符" />
            </Field>

            <Field
              name="ext2"
              label="配置参数2"
              decorator={{
                initialValue: formData.ext2,
                rules: [{ required: false, message: '请输入配置参数2' }],
              }}
            >
              <Input style={{ width: '100%' }} placeholder="可输入40个字符" />
            </Field>

            <Field
              name="ext3"
              label="配置参数3"
              decorator={{
                initialValue: formData.ext3,
                rules: [{ required: false, message: '请输入配置参数3' }],
              }}
            >
              <Input style={{ width: '100%' }} placeholder="可输入40个字符" />
            </Field>

            {/* <Field presentational /> */}

            <Field
              name="ext4"
              label="长配置参数4"
              decorator={{
                initialValue: formData.ext4,
                rules: [{ required: false, message: '请输入配置参数4' }],
              }}
            >
              <Input.TextArea style={{ width: '100%' }} placeholder="可输入500个字符" />
            </Field>

            <Field
              name="ext5"
              label="长配置参数5"
              decorator={{
                initialValue: formData.ext5,
                rules: [{ required: false, message: '请输入配置参数5' }],
              }}
            >
              <Input.TextArea style={{ width: '100%' }} placeholder="可输入500个字符" />
            </Field>

            <Field
              name="configRemark"
              label="可配置参数说明"
              fieldCol={1}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              decorator={{
                initialValue: formData.configRemark,
                rules: [{ required: false, message: '请输入可配置参数说明' }],
              }}
            >
              <Input.TextArea placeholder="可配置参数说明" rows={3} disabled />
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
        <br />
        <Card title="提示信息" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...this.getTableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BusinessCheck;
