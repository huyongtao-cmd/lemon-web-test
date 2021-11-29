import React from 'react';
import { Table } from 'antd';
import { formatMessage } from 'umi/locale';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { createAlert } from '@/components/core/Confirm';

import { AddrViewContext } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT4 = props => (
  <AddrViewContext.Consumer>
    {({ dispatch, connList }) => {
      const getTableProps = () => ({
        rowKey: 'id',
        scroll: { x: 1800 },
        loading: false,
        bordered: true,
        pagination: false,
        total: connList.length,
        dataSource: connList,
        columns: [
          {
            title: '联系人类型',
            dataIndex: 'contactTypeDesc',
            align: 'center',
            width: 180,
          },
          {
            title: '姓名',
            dataIndex: 'contactPerson',
            align: 'center',
          },
          {
            title: '手机',
            dataIndex: 'mobile',
            align: 'right',
          },
          {
            title: '电话',
            dataIndex: 'tel',
            align: 'right',
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            align: 'left',
          },
          {
            title: '联系地址',
            dataIndex: 'address',
            align: 'left',
          },
          {
            title: '社交账号类型',
            dataIndex: 'snsType',
            align: 'center',
          },
          {
            title: '社交账号',
            dataIndex: 'snsNo',
            align: 'right',
          },
          {
            title: '部门',
            dataIndex: 'department',
            align: 'center',
          },
          {
            title: '岗位',
            dataIndex: 'position',
            align: 'center',
          },
          {
            title: '关系',
            dataIndex: 'relation',
            align: 'center',
          },
        ],
        buttons: [],
      });

      return <Table {...getTableProps()} />;
    }}
  </AddrViewContext.Consumer>
);

AddrDetT4.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" text="联系信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT4;
