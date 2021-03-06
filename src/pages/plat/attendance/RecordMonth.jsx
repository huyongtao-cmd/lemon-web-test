import React, { PureComponent } from 'react';
import { connect } from 'dva';

import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectUsersWithBu } from '@/services/gen/list';
import { toQs, toUrl } from '@/utils/stringUtils';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import RangeMonthPicker from './components/RangeMonthPicker';

const DOMAIN = 'platAttendanceRecordMonth';

@connect(({ loading, dispatch, platAttendanceRecordMonth }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  platAttendanceRecordMonth,
}))
@mountToTab()
class AttendanceRecordMonth extends PureComponent {
  componentDidMount() {
    // const { dispatch } = this.props;
    // this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryRuleList`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platAttendanceRecordMonth: { dataSource, searchForm, total, ruleList },
    } = this.props;

    const {
      month: [attendanceDateStart, attendanceDateEnd],
    } = searchForm;
    const params = {
      ...searchForm,
      attendanceDateStart,
      attendanceDateEnd,
    };
    if (params.month) {
      delete params.month;
    }

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      showColumn: false,
      showExport: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '??????',
          dataIndex: 'month',
          options: {
            initialValue: searchForm.month,
            trigger: 'onPanelChange',
          },
          tag: (
            <RangeMonthPicker
              val={searchForm.month}
              onChange={v => {
                dispatch({
                  type: `${DOMAIN}/updateSearchForm`,
                  payload: {
                    month: v,
                  },
                });
              }}
            />
          ),
        },
        {
          title: 'BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: (
            <Selection.Columns
              source={selectBuMultiCol}
              columns={[
                { dataIndex: 'code', title: '??????', span: 10 },
                { dataIndex: 'name', title: '??????', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="?????????BU"
              showSearch
            />
          ),
        },
        // {
        //   title: '??????',
        //   dataIndex: 'status',
        //   options: {
        //     initialValue: searchForm.status,
        //   },
        //   tag: <Selection.UDC code="COM:ATTENDANCE_ATTENDACE_RESULT" placeholder="???????????????" />,
        // },
        {
          title: '??????',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={[
                { dataIndex: 'code', title: '??????', span: 10 },
                { dataIndex: 'name', title: '??????', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="???????????????"
              showSearch
            />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'ruleId',
          options: {
            initialValue: searchForm.ruleId,
          },
          tag: (
            <Selection.Columns
              source={ruleList || []}
              columns={[{ dataIndex: 'ruleName', title: '????????????' }]}
              transfer={{ key: 'id', code: 'id', name: 'ruleName' }}
              placeholder="?????????????????????"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'download',
          className: 'tw-btn-primary',
          title: '????????????',
          icon: 'cloud-download',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // dispatch({
            //   type: `${DOMAIN}/exportMonthExcelFn`,
            // });

            // eslint-disable-next-line no-restricted-globals
            location.href = toQs(`${SERVER_URL}/api/op/v1/attendance/monthExcel`, params);
          },
        },
        {
          key: 'download',
          className: 'tw-btn-primary',
          icon: 'cloud-download',
          title: '????????????(???)',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // dispatch({
            //   type: `${DOMAIN}/exportMonthExcelFn`,
            // });

            // eslint-disable-next-line no-restricted-globals
            location.href = toQs(`${SERVER_URL}/api/worth/v1/attendanceAudit`, {
              isAll: true,
              ...params,
            });
          },
        },
      ],
      columns: [
        {
          title: '??????',
          dataIndex: 'attendanceDate',
          sorter: true,
          // align: 'center',
        },
        {
          title: '??????',
          dataIndex: 'attendanceResIdName',
          align: 'center',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'ruleName',
          align: 'center',
        },
        {
          title: '???????????????',
          dataIndex: 'shouldColock',
          align: 'center',
          sorter: true,
        },
        {
          title: '????????????',
          dataIndex: 'normalDays',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'fieldClock',
          align: 'center',
          sorter: true,
        },
        // {
        //   title: '??????',
        //   dataIndex: 'currEffectiveInvAmt',
        //   align: 'right',
        //   sorter: true,
        // },
        // {
        //   title: '??????',
        //   dataIndex: 'currEffectiveActualRecvAmt',
        //   align: 'center',
        // },
        // {
        //   title: '??????',
        //   dataIndex: 'custName',
        // },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default AttendanceRecordMonth;
