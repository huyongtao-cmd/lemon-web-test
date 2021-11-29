import React, { PureComponent } from 'react';
import { connect } from 'dva';

import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectBuMember } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { toQs, toUrl } from '@/utils/stringUtils';
import RangeMonthPicker from '../components/RangeMonthPicker';

const DOMAIN = 'orgAttendanceRecordMonth';

@connect(({ loading, dispatch, orgAttendanceRecordMonth }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  orgAttendanceRecordMonth,
}))
@mountToTab()
class AttendanceRecordMonth extends PureComponent {
  componentDidMount() {
    // const { dispatch } = this.props;
    // this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
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
      orgAttendanceRecordMonth: { dataSource, searchForm, total },
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
          title: '时间',
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
          title: '姓名',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              source={selectBuMember}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择姓名"
              showSearch
            />
          ),
        },
        // {
        //   title: '状态',
        //   dataIndex: 'status',
        //   options: {
        //     initialValue: searchForm.status,
        //   },
        //   tag: <Selection.UDC code="COM:ATTENDANCE_ATTENDACE_RESULT" placeholder="请选择状态" />,
        // },
      ],
      rightButtons: [
        // {
        //   key: 'download',
        //   className: 'tw-btn-primary',
        //   title: '下载报表',
        //   icon: 'cloud-download',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     // eslint-disable-next-line no-restricted-globals
        //     location.href = toQs(`${SERVER_URL}/api/op/v1/attendance/monthExcel`, params);
        //     // dispatch({
        //     //   type: `${DOMAIN}/exportMonthExcelFn`,
        //     // });
        //   },
        // },
        {
          key: 'download',
          className: 'tw-btn-primary',
          icon: 'cloud-download',
          title: '下载报表(新)',
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
              isAll: false,
              ...params,
            });
          },
        },
      ],
      columns: [
        {
          title: '时间',
          dataIndex: 'attendanceDate',
          sorter: true,
          // align: 'center',
        },
        {
          title: '姓名',
          dataIndex: 'attendanceResIdName',
          align: 'center',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '所属规则',
          dataIndex: 'ruleName',
          align: 'center',
        },
        {
          title: '应打卡天数',
          dataIndex: 'shouldColock',
          align: 'center',
          sorter: true,
        },
        {
          title: '正常天数',
          dataIndex: 'normalDays',
          align: 'center',
        },
        {
          title: '异常天数',
          dataIndex: 'fieldClock',
          align: 'center',
          sorter: true,
        },
        // {
        //   title: '补卡',
        //   dataIndex: 'currEffectiveInvAmt',
        //   align: 'right',
        //   sorter: true,
        // },
        // {
        //   title: '外勤',
        //   dataIndex: 'currEffectiveActualRecvAmt',
        //   align: 'center',
        // },
        // {
        //   title: '年假',
        //   dataIndex: 'custName',
        // },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default AttendanceRecordMonth;
