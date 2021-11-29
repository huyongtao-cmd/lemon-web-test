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
  Modal,
  Switch,
} from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import Link from 'umi/link';
import router from 'umi/router';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';

// 比较常用的本框架的组件
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import EditableDataTable from '@/components/common/EditableDataTable';

// service 方法
import { selectBusinessTableConditional } from '@/services/sys/system/pageConfig';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'businessSceneBlockModal';

@connect(({ loading, businessSceneBlockModal, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/save`],
  ...businessSceneBlockModal,
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

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class BusinessSceneBlockModal extends PureComponent {
  componentDidMount() {}

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

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { pageFieldEntities, dispatch } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;
    if (rowField === 'visibleFlag' || rowField === 'requiredFlag') {
      value = value === true ? 1 : 0;
    }

    const newDataSource = update(pageFieldEntities, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { pageFieldEntities: newDataSource },
    });
  };

  getTableProps = () => {
    const { dispatch, loading, pageFieldEntities, selectedRowKeys } = this.props;
    return {
      sortBy: 'id',
      rowKey: 'id',
      loading,
      total: 0,
      dataSource: pageFieldEntities,
      showAdd: false,
      showCopy: false,
      showDelete: false,
      readOnly: false,
      rowSelection: {
        selectedRowKeys,
        onChange: (_selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedRowKeys: _selectedRowKeys },
          });
        },
      },
      columns: [
        {
          title: '字段名称',
          dataIndex: 'fieldName',
          align: 'center',
        },
        {
          title: '字段备注',
          dataIndex: 'fieldDesc',
        },
        {
          title: '字段类型',
          dataIndex: 'fieldTypeDesc',
          align: 'center',
        },
        {
          title: '类型码',
          dataIndex: 'udcCode',
          align: 'center',
        },
        {
          title: '业务类型',
          dataIndex: 'businessType',
          align: 'center',
        },
        {
          title: '是否显示',
          dataIndex: 'visibleFlag',
          align: 'center',
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <Switch
              disabled={selectedRowKeys.indexOf(row.id) === -1}
              checkedChildren="是"
              unCheckedChildren="否"
              checked={value === 1}
              onChange={this.onCellChanged(index, 'visibleFlag')}
            />
          ),
        },
        {
          title: '显示名称',
          dataIndex: 'displayName',
          align: 'center',
          // options: {
          //   rules: [{required: true, message: '请输入显示名称!',}],
          // },
          render: (value, row, index) => (
            <Input
              disabled={selectedRowKeys.indexOf(row.id) === -1}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'displayName')}
            />
          ),
        },
        {
          title: '显示模式',
          dataIndex: 'fieldMode',
          align: 'center',
          width: 120,
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <Select
              className="x-fill-100"
              size="small"
              value={value}
              onChange={this.onCellChanged(index, 'fieldMode')}
            >
              <Option value="EDITABLE">可编辑</Option>
              <Option value="UNEDITABLE">不可编辑</Option>
              <Option value="DETAIL">详情</Option>
            </Select>
          ),
        },
        {
          title: '是否必填',
          dataIndex: 'requiredFlag',
          align: 'center',
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <Switch
              disabled={selectedRowKeys.indexOf(row.id) === -1}
              checkedChildren="是"
              unCheckedChildren="否"
              checked={value === 1}
              onChange={this.onCellChanged(index, 'requiredFlag')}
            />
          ),
        },
        {
          title: '默认值',
          dataIndex: 'fieldDefaultValue',
          align: 'center',
          width: 100,
          // options: {
          //   rules: [{required: true, message: '请输入显示名称!',}],
          // },
          render: (value, row, index) => (
            <Input
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'fieldDefaultValue')}
            />
          ),
        },
        {
          title: '排序号',
          dataIndex: 'sortNo',
          align: 'center',
          width: 50,
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <InputNumber
              disabled={selectedRowKeys.indexOf(row.id) === -1}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'sortNo')}
            />
          ),
        },
        {
          title: '字段KEY',
          dataIndex: 'fieldKey',
          align: 'center',
          width: 150,
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <Input
              disabled
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'fieldKey')}
            />
          ),
        },
        {
          title: '字段组',
          dataIndex: 'fieldGroup',
          align: 'center',
          width: 50,
          // options: {
          //   rules: [{required: true, message: '请输入字段KEY!',}],
          // },
          render: (value, row, index) => (
            <Input
              disabled={selectedRowKeys.indexOf(row.id) === -1}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'fieldGroup')}
            />
          ),
        },
      ],
      buttons: [],
    };
  };

  handleSave = () => {
    const {
      form,
      pageId,
      sceneId,
      dispatch,
      formData,
      selectedRowKeys,
      pageFieldEntities,
      scenePageBlockEntities,
      onOk,
    } = this.props;

    const deleteKeys = scenePageBlockEntities.pageFieldViews
      .map(item => item.id)
      .filter(item => selectedRowKeys.indexOf(item) === -1);
    const addKeys = selectedRowKeys.filter(
      item => scenePageBlockEntities.pageFieldViews.map(view => view.id).indexOf(item) === -1
    );
    const dtlEntities = pageFieldEntities.filter(item => selectedRowKeys.indexOf(item.id) !== -1);
    dtlEntities.forEach((item, index) => {
      if (addKeys.indexOf(item.id) !== -1) {
        dtlEntities[index].id = genFakeId(-1);
        dtlEntities[index].sceneId = sceneId;
      }
    });

    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          pageFieldEntities,
          deleteKeys,
        },
      }).then(() => {
        typeof onOk === 'function' && onOk();
      });
    });
  };

  render() {
    const {
      visible,
      onCancel,
      formData,
      form: { getFieldDecorator },
      loading,
      dispatch,
    } = this.props;
    return (
      <Modal
        title="页面区域"
        visible={visible}
        onOk={this.onSelectTmp}
        onCancel={onCancel}
        width="80%"
        footer={[
          <Button
            loading={loading}
            key="confirm"
            type="primary"
            size="large"
            htmlType="button"
            onClick={() => this.handleSave()}
          >
            保存
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="blockKey"
              label="区域KEY"
              decorator={{
                initialValue: formData.blockKey,
                rules: [{ required: true, message: '请输入区域KEY' }],
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="blockPageName"
              label="区域名称"
              decorator={{
                initialValue: formData.blockPageName,
                rules: [{ required: true, message: '请输入区域名称' }],
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="tableId"
              label="关联表"
              decorator={{
                initialValue: formData.tableId,
                rules: [{ required: true, message: '请选择相关表' }],
              }}
            >
              <Selection.Columns
                disabled
                className="x-fill-100"
                source={() => selectBusinessTableConditional({})}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onChange={value => {
                  if (value) {
                    this.callModelEffects('queryBusinessTableFields', { tableId: value });
                  } else {
                    this.updateModelState({ pageFieldEntities: [] });
                  }
                }}
              />
            </Field>

            <Field
              name="blockPageType"
              label="区域类型"
              decorator={{
                initialValue: formData.blockPageType,
                rules: [{ required: true, message: '请选择区域类型' }],
              }}
            >
              <Select disabled>
                <Option value="MAIN_FORM">主表单</Option>
                <Option value="SUB_DETAIL">明细子表</Option>
              </Select>
            </Field>

            <Field
              name="sortNo"
              label="排序号"
              decorator={{
                initialValue: formData.sortNo,
                rules: [{ required: true, message: '请输入排序号' }],
              }}
            >
              <InputNumber disabled className="x-fill-100" />
            </Field>
            {/* <Field
              name="allowExportFlag"
              label="允许导出"
              decorator={{
                initialValue: isNil(formData.allowExportFlag) ? true : formData.allowExportFlag,
                rules: [{ required: true, message: '请选择' }],
                valuePropName: 'checked',
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field> */}
          </FieldList>
        </Card>
        <Card title="字段编辑" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...this.getTableProps()} />
        </Card>
      </Modal>
    );
  }
}

export default BusinessSceneBlockModal;
