import React from 'react';
import { TagOpt } from '@/utils/tempUtils';
import { Table } from 'antd';

// In the fifth row, other columns are merged into first column
// by setting it's colSpan to be 0
const renderContent = (value, row, index) => {
  const obj = {
    children: value,
    props: {},
  };
  if (index === 4) {
    obj.props.colSpan = 0;
  }
  return obj;
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text, row, index) => {
      if (index < 4) {
        return <a>{text}</a>;
      }
      return {
        children: <a>{text}</a>,
        props: {
          colSpan: 7,
        },
      };
    },
  },
  {
    title: 'Age',
    dataIndex: 'age',
    render: renderContent,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    className: 'text-center',
    render: (value, row, index) => renderContent(value, row, index),
  },
  {
    title: 'Home phone',
    colSpan: 2,
    dataIndex: 'tel',
    render: (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      if (index === 2) {
        obj.props.rowSpan = 2;
      }
      // These two are merged into above cell
      if (index === 3) {
        obj.props.rowSpan = 0;
      }
      if (index === 4) {
        obj.props.colSpan = 0;
      }
      return obj;
    },
  },
  {
    title: 'Phone',
    colSpan: 0,
    dataIndex: 'phone',
    render: renderContent,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    render: renderContent,
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    render: renderContent,
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    status: 1,
    tel: '0571-22098909',
    phone: 18889898989,
    address: 'New York No. 1 Lake Park',
    salary: '1,000,000',
  },
  {
    key: '2',
    name: 'Jim Green',
    tel: '0571-22098333',
    phone: 18889898888,
    age: 42,
    status: 0,
    address: 'London No. 1 Lake Park',
    salary: '1,000,000',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    tel: '0575-22098909',
    phone: 18900010002,
    status: 1,
    address: 'Sidney No. 1 Lake Park',
    salary: '1,000,000',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 18,
    tel: '0575-22098909',
    phone: 18900010002,
    status: 0,
    address: 'London No. 2 Lake Park',
    salary: '1,000,000',
  },
  {
    key: '5',
    name: <div data-desc="这里随便你写任何东西，想怎么对齐靠样式调">总计: 1,000,000,000</div>,
  },
];

export default () => <Table columns={columns} dataSource={data} bordered />;
