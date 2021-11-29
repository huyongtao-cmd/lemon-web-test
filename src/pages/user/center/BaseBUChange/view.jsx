import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn, clone } from 'ramda';
import { Card, Form, Input, Divider, Switch, Radio, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { selectUsersWithBu } from '@/services/gen/list';
import update from 'immutability-helper';

const { Field } = FieldList;

const { Option } = Select;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'baseChangeFlow';

@connect(({ loading, baseChangeFlow, dispatch }) => ({
  loading,
  baseChangeFlow,
  dispatch,
}))
@mountToTab()
class BaseBUView extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      baseChangeFlow: { fieldsConfig },
    } = this.props;
    const {
      // panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, mode } = fromQs();
    dispatch({
      type: `${DOMAIN}/fetchDetail`,
      payload: id,
    });
    if (taskKey === 'ACC_A61_07_HR') {
      dispatch({
        type: `${DOMAIN}/HrCheckresult`,
        payload: id,
      });
    }
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      baseChangeFlow: { resultChkList },
    } = this.props;
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        resultChkList: update(resultChkList, {
          [rowIndex]: {
            [rowField]: {
              $set:
                rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
            },
          },
        }),
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      baseChangeFlow: { formData, resultChkList, baseBuList, flowForm, fieldsConfig },
    } = this.props;
    const {
      // panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();
    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      // loading: disabledBtn,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkMethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItem',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={(bool, e) => {
                const parmas = bool ? '已完成' : '未处理';
                this.onCellChanged(index, 'finishStatus');
              }}
              disabled={row.checkMethod === 'AUTO'}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={this.onCellChanged(index, 'remark')}
            />
          ),
        },
      ],

      // 获取最新办理事项进度
      leftButtons: [
        {
          key: 'reload',
          icon: 'sync',
          className: 'tw-btn-primary',
          title: '刷新',
          loading: false,
          hidden: false,
          // disabled: disabledBtn,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/checkresult`,
              payload: id,
            });
          },
        },
      ],
    };
    const hrTableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      // loading: disabledBtn,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkMethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItem',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="BaseBU变更申请" />}
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="原BU"
          >
            <Field
              name="resId"
              label="变更资源"
              decorator={{
                initialValue: baseBuList.resName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="oldBuId"
              label="BaseBU"
              decorator={{
                initialValue: baseBuList.oldBuName || '',
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="oldPResId"
              label="上级资源"
              decorator={{
                initialValue: baseBuList.oldPResName || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="新BU"
          >
            <Field
              name="newBuId"
              label="新BaseBU"
              decorator={{
                initialValue: baseBuList.newBuName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="newPResId"
              label="上级资源"
              decorator={{
                initialValue: baseBuList.newPResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="dateFrom"
              label="加入时间"
              decorator={{
                initialValue: baseBuList.dateFrom || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: baseBuList.coopTypeName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="eqvaRatio"
              label="当量系数"
              decorator={{
                initialValue: baseBuList.eqvaRatio || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="date"
              label="当量系数有效期"
              decorator={{
                initialValue: baseBuList.date || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="salaryMethodName"
              label="发薪方式"
              decorator={{
                initialValue: baseBuList.salaryMethodName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="salaryPeriodName"
              label="发薪周期"
              decorator={{
                initialValue: baseBuList.salaryPeriodName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="roleCodeStr"
              label="BU角色"
              decorator={{
                initialValue: baseBuList.roleCodeStr,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input disabled />
            </Field>
            <Field
              name="changeDesc"
              label="变更说明"
              decorator={{
                initialValue: baseBuList.changeDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} disabled />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: baseBuList.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请时间"
              decorator={{
                initialValue: baseBuList.applyDate || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          <FieldList legend="办理事项" getFieldDecorator={getFieldDecorator} col={2}>
            {taskKey === 'ACC_A61_06_RESID' && mode === 'edit' ? (
              <DataTable {...tableProps} dataSource={resultChkList} />
            ) : (
              ''
            )}
            {taskKey === 'ACC_A61_07_HR' && mode === 'edit' ? (
              <DataTable {...hrTableProps} dataSource={resultChkList} />
            ) : (
              ''
            )}
          </FieldList>
        </Card>
        {/* </BpmWrapper> */}
      </PageHeaderWrapper>
    );
  }
}

export default BaseBUView;
