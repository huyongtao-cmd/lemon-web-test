import React, { PureComponent } from 'react';
import { connect } from 'dva';

import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const DOMAIN = 'platAttendanceRecordDay';

@connect(({ loading, dispatch, platAttendanceRecordDay }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  platAttendanceRecordDay,
}))
@mountToTab()
class AttendanceRecordDay extends PureComponent {
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
      platAttendanceRecordDay: { dataSource, searchForm, total, ruleList },
    } = this.props;

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
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
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
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择BU"
              showSearch
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'status',
          options: {
            initialValue: searchForm.status,
          },
          tag: <Selection.UDC code="COM:ATTENDANCE_ATTENDACE_RESULT" placeholder="请选择状态" />,
        },
        {
          title: '姓名',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              source={selectUsersWithBu}
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
        {
          title: '打卡规则',
          dataIndex: 'ruleId',
          options: {
            initialValue: searchForm.ruleId,
          },
          tag: (
            <Selection.Columns
              source={ruleList || []}
              columns={[{ dataIndex: 'ruleName', title: '规则名称' }]}
              transfer={{ key: 'id', code: 'id', name: 'ruleName' }}
              placeholder="请选择打卡规则"
              showSearch
            />
          ),
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
          title: '上班打卡时间',
          dataIndex: 'attendanceTimeStart',
          align: 'center',
          sorter: true,
        },
        {
          title: '下班打卡时间',
          dataIndex: 'attendanceTimeEnd',
          align: 'center',
        },
        {
          title: '工作时长(小时)',
          dataIndex: 'workTime',
          align: 'center',
          sorter: true,
        },
        {
          title: '状态',
          dataIndex: 'attendanceResultDetailName',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'approvalResultName',
          align: 'center',
        },
        // {
        //   title: '审批单',
        //   dataIndex: 'approvalCount',
        // },
        // {
        //   title: '校准状态',
        //   dataIndex: 'attendanceResultDetailName',
        //   align: 'center',
        // },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default AttendanceRecordDay;
