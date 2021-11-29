// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, Switch, InputNumber, Tooltip } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import update from 'immutability-helper';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import EditableDataTable from '@/components/common/EditableDataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import { genFakeId } from '@/utils/mathUtils';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'dataWarehouseTableEdit';

@connect(({ loading, dataWarehouseTableEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...dataWarehouseTableEdit,
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
@mountToTab()
class DataWarehouseTableEdit extends PureComponent {
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

  handleSave = () => {
    const { form, dispatch, formData, dataSource, deleteKeys } = this.props;
    const unLegalRows = dataSource.filter(
      data =>
        isNil(data.fieldColumn) ||
        isEmpty(data.fieldColumn) ||
        isNil(data.fieldName) ||
        isEmpty(data.fieldName) ||
        isNil(data.fieldType) ||
        isEmpty(data.fieldType)
    );
    if (!isEmpty(unLegalRows)) {
      createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
      return;
    }
    const dtlEntities = dataSource;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      const formValues = values;
      delete formValues.reasonId;
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          entity: {
            ...formData,
            ...formValues,
          },
          dtlEntities,
          deleteKeys,
        },
      });
    });
  };

  render() {
    const {
      loading,
      dataSource,
      formData,
      deleteKeys,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
    } = this.props;

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
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
          title: '数据库字段',
          dataIndex: 'fieldColumn',
          required: true,
          align: 'center',
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'fieldColumn')}
            />
          ),
        },
        {
          title: '字段标题',
          dataIndex: 'fieldName',
          required: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'fieldName')}
            />
          ),
        },
        {
          title: '值类型',
          dataIndex: 'fieldType',
          required: true,
          align: 'center',
          render: (value, row, index) => (
            <Selection.UDC
              code="COM:BUSINESS_TABLE_FIELD_TYPE"
              placeholder="请选择"
              value={value}
              onChange={this.onCellChanged(index, 'fieldType')}
            />
          ),
        },
      ],
      buttons: [],
    };

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
              name="dataTable"
              label="名称"
              decorator={{
                initialValue: formData.dataTable,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

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
        </Card>
        <br />
        <Card title="抽取字段明细" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DataWarehouseTableEdit;
