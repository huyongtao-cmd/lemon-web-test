import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Link from 'umi/link';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'vacationFlow';

@connect(({ loading, vacationFlow, dispatch }) => ({
  loading,
  vacationFlow,
  dispatch,
}))
@Form.create({})
@mountToTab()
class RecentResVacationTable extends Component {
  render() {
    const {
      loading,
      vacationFlow: { recentResVacationList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'detailId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryResDetail`],
      showColumn: false,
      dataSource: recentResVacationList,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: record => {
          if (!record.usedDays) {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '请假单号',
          dataIndex: 'applyNo',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/user/center/myVacation/vacationFlow/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '休假日期',
          dataIndex: 'detailVDate',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeDesc',
          align: 'center',
        },
        {
          title: '休假天数',
          dataIndex: 'detailVDays',
          align: 'center',
        },
        {
          title: '事由',
          dataIndex: 'reason',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default RecentResVacationTable;
