import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { sub } from '@/utils/mathUtils';
import moment from 'moment';

const DOMAIN = 'vacationFlowNew';

@connect(({ loading, vacationFlowNew, dispatch }) => ({
  loading,
  vacationFlowNew,
  dispatch,
}))
@Form.create({})
@mountToTab()
class ResVacationTable extends Component {
  render() {
    const {
      loading,
      vacationFlowNew: { resVacationList, formData },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryResDetail`],
      showColumn: false,
      dataSource: resVacationList,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: [formData.vacationId] || [],
        onChange: () => {},
      },
      enableDoubleClick: false,
      columns: formData.enabledFlag
        ? [
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
            },
            {
              title: '截止日期',
              dataIndex: 'endDate',
              align: 'center',
            },
            {
              title: '有效期',
              dataIndex: 'expirationDate',
              align: 'center',
            },
            {
              title: '总天数',
              dataIndex: 'totalDays',
              align: 'center',
            },
            {
              title: '已用天数',
              dataIndex: 'usedDays',
              width: 100,
              align: 'center',
            },
            {
              title: '可用天数',
              dataIndex: 'canUsedDays',
              align: 'center',
              render: (value, row, index) => sub(row.totalDays, row.usedDays).toFixed(1),
            },
            {
              title: '备注',
              dataIndex: 'remark',
              render: (value, row, index) => <pre>{value}</pre>,
            },
          ]
        : [
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
              render: (value, row, index) =>
                sub(sub(row.totalDays, row.usedDays), row.frozenDay).toFixed(1),
            },
            {
              title: '未开放',
              dataIndex: 'frozenDay',
              align: 'center',
            },
            {
              title: '备注',
              dataIndex: 'remark',
              render: (value, row, index) => <pre>{value}</pre>,
            },
          ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default ResVacationTable;
