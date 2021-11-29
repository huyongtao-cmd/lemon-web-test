// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, InputNumber, Tooltip, Checkbox, Switch } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';

import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import update from 'immutability-helper';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'taskTmplEdit';

@connect(({ loading, taskTmplEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...taskTmplEdit,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class TaskTmplEdit extends PureComponent {
  componentDidMount() {
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

  // checkbox触发事件
  onCellCheckBoxChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch } = this.props;
    const val = rowFieldValue.target.checked ? 1 : 0;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    });

    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource: newDataSource } });
  };

  handleSave = () => {
    const { form, dispatch, formData, dataSource, deleteKeys } = this.props;

    const unLegalRows = dataSource.filter(
      data => isNil(data.actNo) || isNil(data.actName) || isNil(data.eqvaQty)
    );
    if (!isEmpty(unLegalRows)) {
      createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
      return;
    }
    const dtlEntities = dataSource.map(data => {
      if (!data.milestoneFlag) {
        return { ...data, milestoneFlag: 0 };
      }
      return { ...data };
    });
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          entity: {
            ...formData,
            ...values,
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
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
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
          title: '活动编码',
          dataIndex: 'actNo',
          required: true,
          align: 'center',
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请输入活动编号!',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'actNo')}
            />
          ),
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          required: true,
          width: 300,
          options: {
            rules: [
              {
                required: true,
                message: '请输入活动名称!',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'actName')}
            />
          ),
        },
        {
          title: '活动当量',
          dataIndex: 'eqvaQty',
          required: true,
          align: 'right',
          width: 50,
          options: {
            rules: [
              {
                required: true,
                message: '请输入活动当量!',
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'eqvaQty')}
            />
          ),
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'milestoneFlag')}
            />
          ),
        },
        {
          title: '要求文档清单',
          dataIndex: 'requiredDocList',
          required: false,
          width: 300,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'requiredDocList')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 200,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'remark')} />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="任务模板编辑">
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
              name="tmplName"
              label="名称"
              decorator={{
                initialValue: formData.tmplName,
                rules: [{ required: true, message: '请输入名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="resId"
              label="申请人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="permissionType"
              label="权限类型"
              decorator={{
                initialValue: formData.permissionType,
                rules: [{ required: true, message: '请选择权限类型' }],
              }}
            >
              <UdcSelect code="TSK:TASK_TMPL_PERMISSION_TYPE" placeholder="权限类型" />
            </Field>
            <Field
              name="reasonType"
              label="事由类型"
              decorator={{
                initialValue: formData.reasonType,
                rules: [{ required: true, message: '请选择事由类型' }],
              }}
            >
              <Select>
                <Option value="02">售前</Option>
                <Option value="03">BU</Option>
              </Select>
            </Field>

            <Field
              name="attachuploadMethod"
              label="完工附件上传方法"
              decorator={{
                initialValue: formData.attachuploadMethod,
              }}
            >
              <Input.TextArea rows={1} placeholder="完工附件上传方法" />
            </Field>

            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card title="任务活动" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskTmplEdit;
