import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Table } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { sub, genFakeId } from '@/utils/mathUtils';
import moment from 'moment';

const DOMAIN = 'vacationFlowNew';

@connect(({ loading, vacationFlowNew, dispatch }) => ({
  loading,
  vacationFlowNew,
  dispatch,
}))
@mountToTab()
class DetailEntityTable extends Component {
  detailTable = record => {
    const columns = [
      {
        title: '日期',
        dataIndex: 'vdate',
        align: 'center',
      },
      {
        title: '请假天数(精确到0.5天)',
        dataIndex: 'vdays',
        align: 'center',
        render: (value, row, index) => value,
      },
    ];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: records => ({
        disabled: records.name === 'Disabled User', // Column configuration not to be checked
        name: records.name,
      }),
    };

    return (
      <Table
        rowKey="keyId"
        style={{ marginLeft: '-8px', marginRight: '-8px' }}
        columns={columns}
        dataSource={record.children1}
        pagination={false}
        // rowSelection={rowSelection}
      />
    );
  };

  render() {
    const {
      loading,
      vacationFlowNew: {
        formData: { startDate, endDate },
        detailEntityList,
      },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'keyId',
      columnsCache: DOMAIN,
      sortDirection: 'DESC',
      showColumn: false,
      dataSource: detailEntityList,
      expandedRowRender: this.detailTable,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '月份',
          dataIndex: 'Emonth',
          align: 'center',
        },
        {
          title: '请假天数',
          dataIndex: 'Edays',
          align: 'center',
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default DetailEntityTable;
