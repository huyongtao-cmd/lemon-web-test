import React, { Component } from 'react';
import { Card, Table } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'wageCostMainPage';

@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class BU extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loading, BUList, dispatch, BUTotal } = this.props;

    const defaultPagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      showTotal: total => `共 ${total} 条`,
      defaultPageSize: 10,
      defaultCurrent: 1,
      size: 'default',
    };

    const to2 = num => {
      if (num) {
        return num.toFixed(2);
      }
      return '';
    };

    const columns = [
      {
        title: '序号',
        dataIndex: '',
        align: 'center',
        width: '18',
        render: (record, obj, index) => <span>{index + 1}</span>,
      },
      {
        title: 'BU编号',
        dataIndex: 'buNo',
        align: 'center',
        width: '200',
      },
      {
        title: 'BU名称',
        dataIndex: 'buName',
        align: 'center',
        width: '80',
      },
      {
        title: 'BU负责人',
        dataIndex: 'inchargeRes',
        align: 'center',
        width: '120',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        align: 'right',
        width: '100',
        render: (record, obj, index) => <span>{to2(record)}</span>,
      },
      {
        title: '财务期间',
        dataIndex: 'finPeriodName',
        align: 'center',
        width: '120',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        align: 'center',
        render: (record, obj, index) => <pre>{record}</pre>,
      },
    ];
    return (
      <PageHeaderWrapper title="BU成本">
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.expense.wageCost.mainpage.BUInfo"
              defaultMessage="BU人力成本"
            />
          }
          bordered={false}
          headStyle={{ backgroundColor: '#fff' }}
          bodyStyle={{ padding: '0px' }}
        />
        <DataTable
          enableSelection={false}
          showSearch={false}
          // bordered
          // pagination={defaultPagination}
          // loading={
          //   loading.effects[`wageCostMainPage/BUSave`] ||
          //   loading.effects[`wageCostMainPage/BUCreateData`]
          // }
          dataSource={BUList}
          total={BUTotal}
          scroll={{ x: 1200 }}
          columns={columns}
          searchBarForm={[]}
          rowKey={(record, index) => `${index}`}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BU;
