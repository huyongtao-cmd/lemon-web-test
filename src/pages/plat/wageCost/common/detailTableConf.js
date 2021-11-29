import React, { Component } from 'react';

function to2(num) {
  if (num) {
    return num.toFixed(2);
  }
  return '';
}

const conf = () => [
  {
    title: '序号',
    dataIndex: '',
    align: 'center',
    width: '18',
    render: (record, obj, index) => <span>{index + 1}</span>,
  },
  {
    title: '公司',
    dataIndex: 'coName',
    align: 'center',
    width: '200',
  },
  {
    title: '部门',
    dataIndex: 'buName',
    align: 'center',
    width: '120',
  },
  {
    title: '社保缴纳地',
    dataIndex: 'socialSecPlace',
    align: 'center',
    width: '120',
  },
  {
    title: '费用承担BU',
    dataIndex: 'costBearingBuName',
    align: 'center',
    width: '100',
  },
  {
    title: '付款对象',
    dataIndex: 'paymentObj',
    align: 'center',
    width: '120',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    align: 'center',
    width: '120',
  },
  {
    title: '人数',
    dataIndex: 'staffNum',
    align: 'center',
    width: '80',
  },
  {
    title: '基本工资',
    dataIndex: 'bscSalary',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '岗位津贴',
    dataIndex: 'allowanceSalary',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '当月应发绩效工资',
    dataIndex: 'performanceWages',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '出差补贴',
    dataIndex: 'travelSubsidies',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '病假',
    dataIndex: 'sickLeave',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '当量工资',
    dataIndex: 'eqvaSalary',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '加项',
    dataIndex: 'addition',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '减项',
    dataIndex: 'deduction',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '应付工资',
    dataIndex: 'grossPay',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.grossPay ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '个人社保',
    dataIndex: 'perSocSec',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '个人公积金',
    dataIndex: 'perAccFund',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '个调税',
    dataIndex: 'perIncTax',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '实发工资',
    dataIndex: 'netPay',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.netPay ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '公司社保',
    dataIndex: 'corSocSec',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司公积金',
    dataIndex: 'corAccFund',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '残保金',
    dataIndex: 'disInsFund',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '服务费',
    dataIndex: 'serviceCharge',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司福利保险合计',
    dataIndex: 'corBenefits',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.corBenefits ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '公司成本合计',
    dataIndex: 'corCost',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.corCost ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '外包1',
    dataIndex: 'outSupplier1',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '外包2',
    dataIndex: 'outSupplier2',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '外包3',
    dataIndex: 'outSupplier3',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '外包4',
    dataIndex: 'outSupplier4',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '外包5',
    dataIndex: 'outSupplier5',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '个人养保',
    dataIndex: 'perEndIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '个人医保',
    dataIndex: 'perMedIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '个人失保',
    dataIndex: 'perUneIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '社保个人小计',
    dataIndex: 'perSubIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.perSubIns ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '公司养保',
    dataIndex: 'corEndIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司医保',
    dataIndex: 'corMedIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司失保',
    dataIndex: 'corUneIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司工伤',
    dataIndex: 'corInjIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司生育',
    dataIndex: 'corMatIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '异地大病医疗',
    dataIndex: 'corDifMedIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '残保金',
    dataIndex: 'disInsFund2',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司社保小计',
    dataIndex: 'corSubIns',
    align: 'right',
    width: '120',
    render: (record, obj, index) => (
      <span style={{ color: `${obj.tempobj && obj.tempobj.corSubIns ? 'red' : ''}` }}>
        {to2(record)}
      </span>
    ),
  },
  {
    title: '个人公积金',
    dataIndex: 'perAccFund2',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
  {
    title: '公司公积金',
    dataIndex: 'corAccFund2',
    align: 'right',
    width: '120',
    render: (record, obj, index) => <span>{to2(record)}</span>,
  },
];

export default conf;
