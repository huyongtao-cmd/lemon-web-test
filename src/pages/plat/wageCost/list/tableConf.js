import React, { Component } from 'react';
import { Checkbox, Input, Modal, Form, Select } from 'antd';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { selectFinperiod } from '@/services/user/Contract/sales';
import router from 'umi/router';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const DOMAIN = 'wageCostModels';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const goInfoPage = row => router.push(`/plat/expense/wageCost/info?id=${row.id}`);
const tableConf = (dispatch, dataSource, loading, searchForm, total, resDataSource) => ({
  expirys: 0,
  dispatch,
  sortBy: 'id',
  rowKey: 'id',
  sortDirection: 'DESC',
  // scroll: { x: 3300 },
  columnsCache: DOMAIN,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/del`] || false,
  total,
  dataSource,
  // 查询
  onChange: filters => {
    // this.fetchData(filters);
    const { ...tempQuery } = filters;
    tempQuery.createTimeBegin = filters.createTime && filters.createTime[0];
    tempQuery.createTimeEnd = filters.createTime && filters.createTime[1];
    tempQuery.finPeriodIds = [filters.finPeriodId];
    delete tempQuery.createTime;
    delete tempQuery.finPeriodId;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...tempQuery,
      },
    });
  },
  // 输入框变化回调
  // onSearchBarChange: (changedValues, allValues) => {
  //   // dispatch({
  //   //   type: `${DOMAIN}/updateSearchForm`,
  //   //   payload: allValues,
  //   // });
  // },
  searchBarForm: [
    {
      title: '单据编号',
      dataIndex: 'sacMasNo',
      tag: <Input placeholder="单据编号" />,
    },
    {
      title: '单据名称',
      dataIndex: 'sacMasName',
      tag: <Input placeholder="单据名称" />,
    },
    {
      title: '状态',
      dataIndex: 'apprStatus',
      tag: <UdcSelect code="COM:APPR_STATUS" placeholder="请选择状态" />,
    },
    {
      title: '财务期间',
      dataIndex: 'finPeriodId',
      option: {
        initValues: '65',
      },
      tag: (
        <AsyncSelect
          source={() => selectFinperiod().then(resp => resp.response)}
          placeholder="请选择财务期间"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      ),
    },
    {
      title: '创建人',
      dataIndex: 'createUserId',
      tag: (
        <Selection.Columns
          className="x-fill-100"
          source={resDataSource}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择创建人"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      tag: <DatePicker.RangePicker className="x-fill-100" />,
    },
  ],
  columns: [
    {
      title: '单据编号',
      dataIndex: 'sacMasNo',
      align: 'center',
      width: '180',
      render: (value, row, index) => <a onClick={() => goInfoPage(row)}>{value}</a>,
    },
    {
      title: '单据名称',
      dataIndex: 'sacMasName',
      align: 'center',
      width: '200',
    },
    {
      title: '状态',
      dataIndex: 'apprStatusName',
      align: 'center',
      width: '80',
    },
    {
      title: '财务期间',
      dataIndex: 'finPeriodName',
      align: 'center',
      width: '120',
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      align: 'center',
      width: '100',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: '120',
      render: (record, obj, index) => <span>{moment(record).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      render: (record, obj, index) => <pre>{record}</pre>,
    },
  ],
  leftButtons: [
    {
      className: 'tw-btn-primary',
      icon: 'plus-circle',
      title: '新增',
      loading: false,
      hidden: false,
      disabled: false,
      minSelections: 0,
      // eslint-disable-next-line
      cb: (selectedRowKeys, selectedRows) => {
        return router.push('/plat/expense/wageCost/main');
      },
    },
    {
      key: 'edit',
      className: 'tw-btn-primary',
      title: '修改',
      loading: false,
      hidden: false,
      disabled: false,
      icon: 'form',
      minSelections: 1,
      // eslint-disable-next-line
      cb: (selectedRowKeys, selectedRows) => {
        if (
          selectedRows[0].apprStatus !== 'NOTSUBMIT' &&
          selectedRows[0].apprStatus !== 'WITHDRAW' &&
          selectedRows[0].apprStatus !== 'REJECTED'
        ) {
          createMessage({ type: 'error', description: '此单据不能被修改' });
          return false;
        }
        return router.push(`/plat/expense/wageCost/main?id=${selectedRows[0].id}&opMode=UPDATE`);
      },
    },
    {
      key: 'delete',
      title: '删除',
      className: 'tw-btn-error',
      loading: false,
      hidden: false,
      disabled: false,
      icon: 'delete',
      minSelections: 1,
      // eslint-disable-next-line
      cb: (selectedRowKeys, selectedRows, queryParams) => {
        if (
          selectedRows[0].apprStatus !== 'NOTSUBMIT' &&
          selectedRows[0].apprStatus !== 'WITHDRAW' &&
          selectedRows[0].apprStatus !== 'REJECTED'
        ) {
          createMessage({ type: 'error', description: '此单据不能被删除' });
          return false;
        }
        dispatch({
          type: `${DOMAIN}/del`,
          payload: {
            // sacMasNo: selectedRows[0].sacMasNo,
            masterId: selectedRows[0].id,
          },
        });
      },
    },
  ],
});

export default tableConf;
