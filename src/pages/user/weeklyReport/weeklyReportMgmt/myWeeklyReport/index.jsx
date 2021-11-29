import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { omit } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { formatMessage } from 'umi/locale';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';

const DOMAIN = 'myWeeklyReport';

const formatYW = value => `${moment(value).weekYear()}${formatDT(value, 'WW')}`;
@connect(({ loading, myWeeklyReport, dispatch, user }) => ({
  myWeeklyReport,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class WeeklyReportCheck extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') &&
      this.fetchData({
        offset: 0,
        limit: 10,
      });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { yearWeekStart } = params || [];
    let newYearWeekStart;
    if (Array.isArray(yearWeekStart) && yearWeekStart[0] && yearWeekStart[1]) {
      newYearWeekStart = {
        yearWeekStart: formatYW(yearWeekStart[0]),
        yearWeekEnd: formatYW(yearWeekStart[1]),
      };
    }

    const newParams = {
      ...newYearWeekStart,
      ...omit(['yearWeekStart'], params),
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...newParams } });
  };

  render() {
    const {
      myWeeklyReport: { list, total, searchForm },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '期间',
          dataIndex: 'yearWeekStart',
          options: {
            initialValue: searchForm.yearWeekStart,
          },
          tag: (
            <DatePicker.RangePicker // 只能选周一
              disabledDate={current =>
                moment(current).format('YYYY-MM-DD') !==
                moment(current)
                  .startOf('week')
                  .format('YYYY-MM-DD')
              }
              format="YYYY-MM-DD"
            />
          ),
        },
      ],
      columns: [
        {
          title: '填报人',
          dataIndex: 'reportResName',
          align: 'center',
        },
        {
          title: '周报开始日(周一)',
          dataIndex: 'weekStartDate',
          align: 'center',
          render: (value, rowData) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            return (
              <Link
                className="tw-link"
                to={`/user/weeklyReport/weeklyReportView?id=${rowData.id}&${from}`}
              >
                {value}
              </Link>
            );
          },
        },
        {
          title: '年周',
          dataIndex: 'yearWeek',
          align: 'center',
        },
        {
          title: '汇报对象',
          dataIndex: 'reportedResName',
          align: 'center',
        },
        {
          title: '汇报时间',
          dataIndex: 'reportDate',
          align: 'center',
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '资源负责人',
          dataIndex: 'presName',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { weekStartDate } = selectedRows[0];
            router.push(`/user/weeklyReport/makeWeeklyReport?weekStartDate=${weekStartDate}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="我的周报">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default WeeklyReportCheck;
