import { formatMessage } from 'umi/locale';
import React from 'react';
import { TagOpt } from '@/utils/tempUtils';

// labelKey="name"
// valueKey="code"
// columns={commonCol}

const taskSelectProps = {
  labelKey: 'taskName',
  valueKey: 'taskNo',
  columns: [{ title: '编号', dataIndex: 'taskNo' }, { title: '名称', dataIndex: 'taskName' }],
};

const resSelectProps = {
  labelKey: 'taskName',
  valueKey: 'taskNo',
  columns: [{ title: '编号', dataIndex: 'code' }, { title: '名称', dataIndex: 'name' }],
};

const expenseList = [
  {
    title: '报销单批次号',
    dataIndex: 'reimBatchNo',
    sorter: true,
    align: 'center',
  },
  {
    title: '报销单号',
    dataIndex: 'reimNo',
    align: 'center',
  },
  {
    title: '事由名称',
    dataIndex: 'reasonName',
    align: 'center',
  },
  {
    title: '报销费用(含税)',
    dataIndex: 'taxedReimAmt',
    align: 'right',
    render: value => (value ? value.toFixed(2) : null),
  },
  {
    title: '调整后费用',
    dataIndex: 'totalAdjustedAmt',
    align: 'right',
    render: value => (value ? value.toFixed(2) : null),
  },
  {
    title: '报销类型',
    dataIndex: 'reimType1Name',
    align: 'center',
  },
  {
    title: '费用类型',
    dataIndex: 'reimType2Name',
    align: 'center',
  },
  {
    title: '事由类型',
    dataIndex: 'reasonTypeName',
    align: 'center',
  },
  {
    title: '单据状态',
    dataIndex: 'reimStatusDesc',
    align: 'center',
  },
  {
    title: '审批状态',
    dataIndex: 'apprStatusDesc',
    align: 'center',
  },
  {
    title: '费用承担BU',
    dataIndex: 'expenseBuName',
    align: 'left',
  },
  {
    title: '费用归属BU',
    dataIndex: 'sumBuName',
    align: 'left',
  },
  {
    title: '是否分摊',
    dataIndex: 'allocationFlag',
    align: 'center',
    render: value => (
      <TagOpt
        value={value}
        opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
        palette="red|green"
      />
    ),
  },
  {
    title: '是否有票',
    dataIndex: 'hasInv',
    align: 'center',
    render: value => (
      <TagOpt
        value={value}
        opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
        palette="red|green"
      />
    ),
  },
  {
    title: '发票法人公司',
    dataIndex: 'expenseOuName',
    align: 'left',
  },
  {
    title: '报销日期',
    dataIndex: 'applyDate',
    align: 'center',
    // render: applyDate => formatDT(applyDate),
  },
];

export { resSelectProps, taskSelectProps, expenseList };
