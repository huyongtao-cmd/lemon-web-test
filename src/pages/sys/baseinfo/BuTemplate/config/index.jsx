import React from 'react';
import moment from 'moment';
import { Tag, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';

import { formatDT } from '@/utils/tempUtils/DateTime';

const operationTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' }),
  },
  {
    key: 'finance',
    tab: formatMessage({ id: `app.settings.menuMap.finance`, desc: '财务信息' }),
  },
  {
    key: 'role',
    tab: formatMessage({ id: `app.settings.menuMap.role`, desc: '角色信息' }),
  },
  {
    key: 'income',
    tab: formatMessage({ id: `app.settings.menuMap.income`, desc: '资源当量收入' }),
  },
  // {
  //   key: 'eqva',
  //   tab: formatMessage({ id: `app.settings.menuMap.eqva`, desc: '结算当量' }),
  // },
  {
    key: 'operation',
    tab: formatMessage({ id: `app.settings.menuMap.operation`, desc: '经营信息' }),
  },
];

const financeColumns = [
  {
    title: '包含',
    dataIndex: 'includeFlag',
    align: 'center',
    render: (value, row, index) =>
      value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
  },
  {
    title: '处理状态',
    dataIndex: 'procStatusName',
    align: 'center',
  },
  {
    title: '科目编号',
    dataIndex: 'accCode',
    align: 'center',
  },
  {
    title: '科目名称',
    dataIndex: 'accName',
  },
  {
    title: '状态',
    dataIndex: 'accStatusName',
    align: 'center',
  },
  {
    title: '大类',
    dataIndex: 'accType1',
  },
  {
    title: '明细类1',
    dataIndex: 'accType2',
  },
  {
    title: '明细类2',
    dataIndex: 'accType3',
  },
  {
    title: '明细账',
    dataIndex: 'dtlAcc',
  },
  {
    title: '汇总',
    dataIndex: 'sumFlag',
    align: 'center',
    render: (value, row, index) =>
      value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
  },
  {
    title: '子账类型',
    dataIndex: 'ledgertypeName',
    align: 'center',
  },
  {
    title: '处理时间',
    dataIndex: 'procTime',
    render: (value, row, index) => (value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null),
  },
  {
    title: '处理信息',
    dataIndex: 'procInfo',
    align: 'left',
  },
];

const roleColumns = [
  {
    title: '角色',
    dataIndex: 'roleName',
    align: 'center',
  },
  {
    title: '资源',
    dataIndex: 'resName',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    render: (value, row, index) =>
      value && value.length > 30 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 30)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
const incomeColumns = [
  {
    title: '工种',
    dataIndex: 'jobTypeName',
    align: 'center',
  },
  {
    title: '合作方式',
    dataIndex: 'coopTypeName',
    align: 'center',
  },
  {
    title: '城市级别',
    dataIndex: 'cityLevelName',
    align: 'center',
  },
  {
    title: '单位当量收入',
    dataIndex: 'preeqvaAmt',
    align: 'right',
    // className:'text-right',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    render: (value, row, index) =>
      value && value.length > 30 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 30)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];

const operateColumns = [
  {
    title: '分类编号',
    dataIndex: 'code',
    align: 'center',
  },
  {
    title: '分类名称',
    dataIndex: 'name',
  },
  {
    title: '上级分类',
    dataIndex: 'pname',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    render: (value, row, index) =>
      value && value.length > 30 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 30)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];

const examPeriodColumns = [
  {
    title: '日期从',
    dataIndex: 'dateFrom',
    render: (value, row, index) => formatDT(value),
  },
  {
    title: '日期到',
    dataIndex: 'dateTo',
    render: (value, row, index) => formatDT(value),
  },
  {
    title: '期间名称',
    dataIndex: 'periodName',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    render: (value, row, index) =>
      value && value.length > 30 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 30)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];

const subjCol = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const roleCol = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 10 },
];

const resCol = [
  { dataIndex: 'code', title: '编号', span: 4 },
  { dataIndex: 'name', title: '名称', span: 8 },
  { dataIndex: 'valSphd1', title: '英文名', span: 8 },
];

export {
  operationTabList,
  financeColumns,
  roleColumns,
  incomeColumns,
  operateColumns,
  examPeriodColumns,
  subjCol,
  roleCol,
  resCol,
};
