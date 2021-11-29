import React from 'react';
import { Table } from 'antd';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';

import { AddrViewContext } from '../customerInfoDetail';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT6 = props => (
  <AddrViewContext.Consumer>
    {({ dispatch, invoiceList }) => {
      const getTableProps = () => ({
        rowKey: 'id',
        scroll: { x: 1600 },
        loading: false,
        bordered: true,
        pagination: false,
        total: invoiceList.length,
        dataSource: invoiceList,
        columns: [
          {
            title: '发票信息',
            dataIndex: 'invInfo',
            align: 'left',
          },
          {
            title: '发票抬头',
            dataIndex: 'invTitle',
            align: 'left',
          },
          {
            title: '税率',
            dataIndex: 'taxRate',
            align: 'center',
            render: (key, record, index) => <span>{key}%</span>,
          },
          {
            title: '开票类型',
            dataIndex: 'invTypeName',
            align: 'center',
          },
          {
            title: '开票地址',
            dataIndex: 'invAddr',
            align: 'center',
          },
          {
            title: '电话',
            dataIndex: 'invTel',
            align: 'center',
          },
          {
            title: '开户行',
            dataIndex: 'bankName',
            align: 'left',
          },
          {
            title: '账号',
            dataIndex: 'accountNo',
            align: 'center',
            width: 120,
          },
          {
            title: '默认',
            dataIndex: 'defaultFlag',
            align: 'center',
            render: (value, row, index) => (+value ? '是' : '否'),
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'left',
          },
        ],
        buttons: [],
      });

      return <Table {...getTableProps()} />;
    }}
  </AddrViewContext.Consumer>
);

AddrDetT6.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" text="开票信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT6;
