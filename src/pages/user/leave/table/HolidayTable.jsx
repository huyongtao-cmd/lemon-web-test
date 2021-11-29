import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import moment from 'moment';

const DOMAIN = 'leave';

@connect(({ loading, leave, dispatch }) => ({
  loading,
  leave,
  dispatch,
}))
@Form.create({})
@mountToTab()
class HolidayTable extends Component {
  render() {
    const {
      loading,
      leave: { myVacationList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/myVacationList`],
      dataSource: myVacationList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
        showTotal: total => `共 ${total} 条`,
        defaultPageSize: 10,
        defaultCurrent: 1,
        size: 'default',
      },
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          align: 'center',
        },
        {
          title: '起始日期',
          dataIndex: 'startDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '总数',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '已用',
          dataIndex: 'usedDays',
          align: 'center',
        },
        {
          title: '可用',
          dataIndex: 'availableDays',
          align: 'center',
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default HolidayTable;
