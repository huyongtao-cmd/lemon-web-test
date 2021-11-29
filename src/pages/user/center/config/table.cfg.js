import React from 'react';
import Link from 'umi/link';

const BY_PROJ_SUM = {
  scroll: {
    x: 2200,
  },
  columns: [
    {
      title: '项目',
      dataIndex: 'projName',
      width: 200,
    },
    {
      title: '申请结算当量',
      dataIndex: 'applySettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '申请结算金额',
      dataIndex: 'applySettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算当量',
      dataIndex: 'approveSettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算金额',
      dataIndex: 'approveSettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '结算单价',
      dataIndex: 'settlePrice',
      className: 'text-right',
      width: 200,
    },
    {
      title: '当量工资',
      dataIndex: 'eqvaSalary',
      className: 'text-right',
      width: 200,
    },
    {
      title: '发包人',
      dataIndex: 'disterResName',
      width: 200,
    },
    {
      title: '收入资源',
      dataIndex: 'incomeResName',
      width: 200,
    },
    {
      title: '支出BU',
      dataIndex: 'expenseBuName',
      width: 200,
    },
    {
      title: '收入BU',
      dataIndex: 'resBuName',
      width: 200,
    },
  ],
};

const BY_STATEMENT_SUM = {
  scroll: {
    x: 4400,
  },
  columns: [
    {
      title: '结算单号',
      dataIndex: 'settleNo',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => {
        const { id, settleType } = row;
        let url;
        if (settleType === 'TASK_BY_PACKAGE')
          url = `/plat/intelStl/list/sum/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        else if (settleType === 'TASK_BY_MANDAY')
          url = `/plat/intelStl/list/single/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        else
          url = `/plat/intelStl/list/common/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        return React.createElement(
          Link,
          {
            className: 'tw-link',
            to: url,
          },
          value
        );
      },
    },
    {
      title: '结算类型',
      dataIndex: 'settleTypeName',
      className: 'text-center',
      width: 200,
    },
    {
      title: '结算单状态',
      dataIndex: 'settleStatusName',
      className: 'text-center',
      width: 200,
    },
    {
      title: '评价状态',
      dataIndex: 'evalStatusName',
      className: 'text-center',
      width: 200,
    },
    {
      title: '结算日期',
      dataIndex: 'settleDate',
      className: 'text-center',
      width: 200,
    },
    {
      title: '提交日期',
      dataIndex: 'applyDate',
      className: 'text-center',
      width: 200,
    },
    {
      title: '申请人',
      dataIndex: 'applyResName',
      width: 200,
    },
    {
      title: '当前审批人',
      dataIndex: 'approveResName',
      width: 200,
    },
    {
      title: '项目',
      dataIndex: 'projName',
      width: 200,
    },
    {
      title: '任务',
      dataIndex: 'taskName',
      width: 200,
    },
    {
      title: '申请结算当量',
      dataIndex: 'applySettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '申请结算金额',
      dataIndex: 'applySettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算当量',
      dataIndex: 'approveSettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算金额',
      dataIndex: 'approveSettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '结算单价',
      dataIndex: 'settlePrice',
      className: 'text-right',
      width: 200,
    },
    {
      title: '当量工资',
      dataIndex: 'eqvaSalary',
      className: 'text-right',
      width: 200,
    },
    {
      title: '当量系数',
      dataIndex: 'eqvaRatio',
      className: 'text-right',
      width: 200,
    },
    {
      title: '质保当量',
      dataIndex: 'graranteeEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '发包人',
      dataIndex: 'disterResName',
      width: 200,
    },
    {
      title: '收入资源',
      dataIndex: 'incomeResName',
      width: 200,
    },
    {
      title: '支出BU',
      dataIndex: 'expenseBuName',
      width: 200,
    },
    {
      title: '收入BU',
      dataIndex: 'resBuName',
      width: 200,
    },
  ],
};

const NO_SUM = {
  scroll: {
    x: 5400,
  },
  columns: [
    {
      title: '结算单号',
      dataIndex: 'settleNo',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => {
        const { id, settleType } = row;
        let url;
        if (settleType === 'TASK_BY_PACKAGE')
          url = `/plat/intelStl/list/sum/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        else if (settleType === 'TASK_BY_MANDAY')
          url = `/plat/intelStl/list/single/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        else
          url = `/plat/intelStl/list/common/preview?id=${id}&sourceUrl=/user/center/myEquivalent`;
        return React.createElement(
          Link,
          {
            className: 'tw-link',
            to: url,
          },
          value
        );
      },
    },
    {
      title: '结算类型',
      dataIndex: 'settleTypeName',
      className: 'text-center',
      width: 200,
    },
    {
      title: '结算单状态',
      dataIndex: 'settleStatusName',
      className: 'text-center',
      width: 200,
    },
    {
      title: '结算日期',
      dataIndex: 'settleDate',
      className: 'text-center',
      width: 200,
    },
    {
      title: '提交日期',
      dataIndex: 'applyDate',
      className: 'text-center',
      width: 200,
    },
    {
      title: '申请人',
      dataIndex: 'applyResName',
      width: 200,
    },
    {
      title: '当前审批人',
      dataIndex: 'approveResName',
      width: 200,
    },
    {
      title: '项目',
      dataIndex: 'projName',
      width: 200,
    },
    {
      title: '任务',
      dataIndex: 'taskName',
      width: 200,
    },
    {
      title: '活动',
      dataIndex: 'actName',
      width: 200,
    },
    {
      title: '工作日期',
      dataIndex: 'workDate',
      className: 'text-center',
      width: 200,
    },
    {
      title: '工时',
      dataIndex: 'tsName',
      className: 'text-right',
      width: 200,
    },
    {
      title: '申请结算当量',
      dataIndex: 'applySettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '申请结算金额',
      dataIndex: 'applySettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算当量',
      dataIndex: 'approveSettleEqva',
      className: 'text-right',
      width: 200,
    },
    {
      title: '批准结算金额',
      dataIndex: 'approveSettleAmt',
      className: 'text-right',
      width: 200,
    },
    {
      title: '填报完工比例',
      dataIndex: 'reportCompPercent',
      className: 'text-right',
      width: 200,
    },
    {
      title: '调整完工比例',
      dataIndex: 'approveCompPercent',
      className: 'text-right',
      width: 200,
    },
    {
      title: '结算单价',
      dataIndex: 'settlePrice',
      className: 'text-right',
      width: 200,
    },
    {
      title: '当量工资',
      dataIndex: 'eqvaSalary',
      className: 'text-right',
      width: 200,
    },
    {
      title: '当量系数',
      dataIndex: 'eqvaRatio',
      className: 'text-right',
      width: 200,
    },
    {
      title: '质保当量',
      dataIndex: 'graranteeEqva',
      className: 'text-right',
      width: 200,
      hidden: true,
    },
    {
      title: '工作内容',
      dataIndex: 'workDesc',
      width: 200,
    },
    {
      title: '发包人',
      dataIndex: 'disterResName',
      width: 200,
    },
    {
      title: '收入资源',
      dataIndex: 'incomeResName',
      width: 200,
    },
    {
      title: '支出BU',
      dataIndex: 'expenseBuName',
      width: 200,
    },
    {
      title: '收入BU',
      dataIndex: 'resBuName',
      width: 200,
    },
  ],
};

const detail = {
  scroll: {
    x: 1590,
  },
  columns: [
    {
      title: '编号',
      dataIndex: 'actNo',
      className: 'text-center',
      width: 100,
    },
    {
      title: '活动名称',
      dataIndex: 'actName',
      width: 200,
    },
    {
      title: '计划当量',
      dataIndex: 'planEqva',
      className: 'text-center',
      width: 100,
    },
    {
      title: '已派发当量',
      dataIndex: 'distedEqva',
      className: 'text-center',
      width: 100,
    },
    {
      title: '已结算当量',
      dataIndex: 'settledEqva',
      className: 'text-center',
      width: 100,
    },
    {
      title: '活动状态',
      dataIndex: 'actStatusName',
      className: 'text-center',
      width: 100,
    },
    {
      title: '结算状态',
      dataIndex: 'actSettleStatusName',
      className: 'text-center',
      width: 100,
    },
    {
      title: '申请时完工百分比',
      dataIndex: 'ssCompPercent',
      className: 'text-center',
      width: 150,
      render: value => (value ? `${value}%` : undefined),
    },
    {
      title: '完工百分比',
      dataIndex: 'reportCompPercent',
      width: 150,
      editable: true,
      percentable: true,
    },
    {
      title: '可结算百分比',
      dataIndex: 'avalSettleEqvaPercent',
      className: 'text-center',
      width: 100,
      render: value => (value ? `${value}%` : undefined),
    },
    {
      title: '申请结算当量',
      dataIndex: 'applySettlePercent',
      width: 100,
      editable: true,
    },
    {
      title: '预计开始日期',
      dataIndex: 'planStartDate',
      width: 120,
    },
    {
      title: '预计结束日期',
      dataIndex: 'planEndDate',
      width: 120,
    },
  ],
};

export default {
  BY_PROJ_SUM,
  BY_STATEMENT_SUM,
  NO_SUM,
  detail,
};
