import React from 'react';
import { Table } from 'antd';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';

import { AddrViewContext } from '../customerInfoDetail';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT7 = props => (
  <AddrViewContext.Consumer>
    {({ dispatch, addressList }) => {
      const getTableProps = () => ({
        rowKey: 'id',
        scroll: { x: 1200 },
        bordered: true,
        loading: false,
        pagination: false,
        total: addressList.length,
        dataSource: addressList,
        columns: [
          {
            title: '地址类型',
            dataIndex: 'addressTypeName',
            align: 'center',
          },
          {
            title: '国家',
            dataIndex: 'countryName',
            align: 'center',
            width: 100,
          },
          {
            title: '省',
            dataIndex: 'provinceName',
            width: 200,
            align: 'center',
          },
          {
            title: '市',
            dataIndex: 'cityName',
            width: 200,
            align: 'center',
          },
          {
            title: '区',
            dataIndex: 'districtName',
            width: 200,
            align: 'center',
          },
          {
            title: '详细地址',
            dataIndex: 'detailaddr',
            align: 'left',
          },
          {
            title: '邮编',
            dataIndex: 'zipcode',
            align: 'right',
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

AddrDetT7.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" text="地址信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT7;
