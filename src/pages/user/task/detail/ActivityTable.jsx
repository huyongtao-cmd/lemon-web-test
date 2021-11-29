import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Checkbox, DatePicker, Input, InputNumber } from 'antd';
import update from 'immutability-helper';
import moment from 'moment';
import { isNil, sum } from 'ramda';

import { formatDT } from '@/utils/tempUtils/DateTime';
import SelectWithCols from '@/components/common/SelectWithCols';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId, mul, sub } from '@/utils/mathUtils';

const DOMAIN = 'userTaskChange';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
@connect(({ loading, userTaskChange }) => ({
  loading,
  ...userTaskChange,
}))
class TaskActivityTable extends PureComponent {
  state = {};

  componentDidMount() {}

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataList, dispatch, formData, changeTableList } = this.props;
    let preparedData = {};
    let val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'milestoneFlag') {
      val = rowFieldValue.target.checked ? 1 : 0;
    }
    if (rowField === 'planEndDate' || rowField === 'planStartDate') {
      val = formatDT(val);
    }
    preparedData = {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    };
    // 选择项目活动切换数据
    if (rowField === 'actId') {
      preparedData = {
        [rowIndex]: {
          actName: {
            $set: val && val.actName ? val.actName : null,
          },
          actNo: {
            $set: val && val.actNo ? val.actNo : null,
          },
          projActivityId: {
            $set: val && val.id ? val.id : null,
          },
          milestoneFlag: {
            $set: val && val.milestoneFlag ? val.milestoneFlag : 0,
          },
        },
      };
    }
    const newDataList = update(dataList, preparedData);
    if (rowField === 'planEqva') {
      // 总金额 = 总当量 * 最终结算单价
      const arr = newDataList.map(item => item.planEqva).filter(value => value && value > 0);
      const planEqva = sum(arr);
      const amt =
        planEqva && formData.settlePrice
          ? mul(planEqva || 0, formData.settlePrice || 0).toFixed(2)
          : 0;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dataList: newDataList, formData: { ...formData, planEqva, amt } },
      });
    } else {
      // 更新单元格状态
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          dataList: newDataList,
        },
      });
    }
    // 计算当量变更表数据 changeTableList
    const row = newDataList[rowIndex];
    const newChangeTable = changeTableList.map(
      item =>
        item.resActivityId === row.id
          ? {
              ...item,
              resActivityId: row.id,
              resActivityDesc: row.actName,
              deltaEava: sub(row.planEqva || 0, item.oldEqva || 0).toFixed(2),
              newEqva: row.planEqva || 0,
            }
          : item
    );

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { changeTableList: newChangeTable },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      formData,
      dataList,
      changeTableList,
      actSource,
      actList,
    } = this.props;

    const { _selectedRowKeys } = this.state;

    const tableProps = {
      rowKey: 'id',
      scroll: { x: 2000 },
      loading: loading.effects[`${DOMAIN}/query`],
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      showDelete: true,
      rowSelection: {
        selectedRowKeys: _selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
            _selectedRowKeys: selectedRowKeys,
          });
        },
        getCheckboxProps: record => ({
          disabled: record.id > 0,
        }),
      },
      onAdd: newRow => {
        const genId = genFakeId(-1);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genId,
                  settledEqva: 0,
                  planEqva: 0,
                  planStartDate: moment(Date.now()),
                  planEndDate: moment(Date.now()).add(1, 'days'),
                },
              ],
            }),
            changeTableList: update(changeTableList, {
              $push: [
                {
                  id: genFakeId(-1),
                  resActivityId: genId,
                  resActivityDesc: newRow.actName,
                  oldEqva: 0,
                  deltaEava: 0,
                  newEqva: 0,
                  changeDesc: null,
                  approveDesc: null,
                },
              ],
            }),
          },
        });
        return genId;
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // 被减数
        const eqvaQty = dataList
          .filter(row => !selectedRowKeys.includes(row.id))
          .map(item => item.eqvaQty || 0)
          .reduce((total, num) => total + Math.round(num), 0);
        const min = sum(
          dataList.filter(row => !selectedRowKeys.includes(row.id)).map(item => item.eqvaQty || 0)
        );
        const amt =
          eqvaQty && formData.settlePrice ? mul(eqvaQty, formData.settlePrice).toFixed(2) : 0;

        // console.log('----------delete---form', formData.eqvaQty, selectedRowKeys, min, eqvaQty, amt)
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(row => !selectedRowKeys.includes(row.id)),
            formData: { ...formData, eqvaQty, amt },
          },
        });
        this.setState({
          _selectedRowKeys: [],
        });
        // form.setFieldsValue({
        //   eqvaQty,
        //   amt,
        // });
      },
      columns: [
        {
          title: '活动编号',
          dataIndex: 'actNo',
          key: 'actNo',
          className: 'text-center',
          required: true,
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
              disabled={formData.reasonType === '01' || row.actNo === '0000' || row.id > 0}
              value={value}
              placeholder={formData.reasonType === '01' ? '[由项目活动带出]' : '请输入活动编号'}
              onChange={this.onCellChanged(index, 'actNo')}
            />
          ),
        },
        {
          title: '活动',
          dataIndex: 'actName',
          key: 'actName',
          width: 200,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入活动!',
              },
            ],
          },
          render: (value, row, index) => {
            if (formData.reasonType === '01') {
              return (
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  value={value ? { name: value, code: row.actNo } : undefined}
                  columns={SEL_COL}
                  dataSource={actSource}
                  onChange={this.onCellChanged(index, 'actId')}
                  selectProps={{
                    showSearch: true,
                    disabled: row.actNo === '0000' || row.id > 0,
                    onSearch: val => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          actSource: actList.filter(
                            d =>
                              d.code.indexOf(val) > -1 ||
                              d.name.toLowerCase().indexOf(val.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              );
            }

            return (
              <Input
                value={value}
                disabled={row.actNo === '0000' || row.id > 0}
                onChange={this.onCellChanged(index, 'actName')}
              />
            );
          },
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
          key: 'planStartDate',
          className: 'text-center',
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100"
              disabled={row.id > 0}
              value={moment(value || Date.now())}
              placeholder="预计开始日期"
              format="YYYY-MM-DD"
              onChange={this.onCellChanged(index, 'planStartDate')}
            />
          ),
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
          key: 'planEndDate',
          className: 'text-center',
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100"
              disabled={row.id > 0}
              value={value ? moment(value) : moment(Date.now()).add(1, 'days')}
              placeholder="预计结束日期"
              format="YYYY-MM-DD"
              onChange={this.onCellChanged(index, 'planEndDate')}
            />
          ),
        },
        {
          title: '活动当量', // 小于1000
          dataIndex: 'planEqva',
          key: 'planEqva',
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入活动当量!',
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['请输入活动当量']);
                  }
                },
              },
            ],
          },
          className: 'text-right',
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              precision={2}
              min={0}
              max={999999999999}
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'planEqva')}
            />
          ),
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          key: 'settledEqva',
          className: 'text-right',
          render: (value, row, index) => (
            <InputNumber disabled value={value} onBlur={this.onCellChanged(index, 'settledEqva')} />
          ),
        },
        {
          title: '执行状态',
          dataIndex: 'actStatusName',
          key: 'actStatusName',
          className: 'text-center',
          render: (value, row, index) => value || '未开始',
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          key: 'milestoneFlag',
          className: 'text-center',
          render: (value, row, index) => (
            <Checkbox
              // 项目的会带过来，其他的可选
              disabled={formData.reasonType === '01' || row.id > 0}
              checked={!!value}
              onChange={this.onCellChanged(index, 'milestoneFlag')}
            />
          ),
        },
        {
          title: '要求文档清单',
          dataIndex: 'requiredDocList',
          key: 'requiredDocList',
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              placeholder="要求文档清单"
              rows={1}
              onChange={this.onCellChanged(index, 'requiredDocList')}
            />
          ),
        },
        {
          title: '完工时间',
          dataIndex: 'finishDate',
          key: 'finishDate',
          className: 'text-center',
          render: value => formatDT(value),
        },
        {
          title: '完工说明',
          dataIndex: 'finishDesc',
          key: 'finishDesc',
          render: (value, row, index) => (
            <Input
              disabled
              value={value}
              placeholder="完工说明"
              onBlur={this.onCellChanged(index, 'finishDesc')}
            />
          ),
        },
      ],
      //   buttons: [
      //     {
      //       key: 'delete',
      //       className: "tw-btn-error",
      //       title: '删除',
      //       loading: false,
      //       hidden: false,
      //       disabled: selectedRows => selectedRows && selectedRows.filter(row => row.id > 0).length,
      //       minSelections: 0,
      //       cb: (selectedRowKeys, selectedRows) => {
      //         dispatch({
      //           type: `${DOMAIN}/updateState`,
      //           payload: {
      //             dataList: dataList.filter(
      //               row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
      //             ),
      //           },
      //         });
      //       },
      //     },
      //   ],
    };

    return (
      <div style={{ margin: 12 }}>
        <EditableDataTable {...tableProps} />
      </div>
    );
  }
}

export default TaskActivityTable;
