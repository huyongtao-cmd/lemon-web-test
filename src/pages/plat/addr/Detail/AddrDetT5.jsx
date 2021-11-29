import React from 'react';
import { Input, Switch, Table } from 'antd';
import update from 'immutability-helper';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';

import { AddrViewContext, DOMAIN } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT5 = props => (
  <AddrViewContext.Consumer>
    {({ dispatch, bankList }) => {
      const getTableProps = () => ({
        rowKey: 'id',
        scroll: { x: 2400 },
        loading: false,
        bordered: true,
        pagination: false,
        total: bankList.length,
        dataSource: bankList,
        columns: [
          {
            title: '账户类型',
            dataIndex: 'accTypeName',
            align: 'center',
          },
          {
            title: '银行',
            dataIndex: 'bankName',
            align: 'center',
          },
          {
            title: '开户地',
            dataIndex: 'bankCity',
            align: 'center',
          },
          {
            title: '开户网点',
            dataIndex: 'bankBranch',
            align: 'center',
          },
          {
            title: '户名',
            dataIndex: 'holderName',
            align: 'center',
          },
          {
            title: '账号',
            dataIndex: 'accountNo',
            align: 'center',
          },
          {
            title: '币种',
            dataIndex: 'currCodeName',
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

AddrDetT5.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" text="银行账户" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT5;
