import React, { PureComponent } from 'react';
import { connect } from 'dva';

import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'platAttendanceReapply';

@connect(({ loading, dispatch, platAttendanceReapply }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  platAttendanceReapply,
}))
@mountToTab()
class platAttendanceReapply extends PureComponent {
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
      platAttendanceReapply: { dataSource, searchForm, total },
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
          dataIndex: 'contractNmNo',
          options: {
            initialValue: searchForm.contractNmNo,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '状态',
          dataIndex: 'mainType',
          options: {
            initialValue: searchForm.mainType,
          },
          tag: <Selection.UDC code="COM:ATTENDANCE_ATTENDACE_RESULT" placeholder="请选择姓名" />,
        },
        {
          title: '姓名',
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择评价人"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '补卡人',
          dataIndex: 'contractNo',
          align: 'center',
        },
        {
          title: '时间',
          dataIndex: 'contractName',
          sorter: true,
        },
        {
          title: '最早打卡',
          dataIndex: 'buName',
          sorter: true,
        },
        {
          title: '最晚打卡',
          dataIndex: 'buNamccce',
          sorter: true,
        },
        {
          title: '打卡状态',
          dataIndex: 'contractStatusDesc',
          align: 'center',
        },
        {
          title: '打卡类型',
          dataIndex: 'mainTypeDesc',
          align: 'center',
        },
        {
          title: '打卡次数',
          dataIndex: 'currAmt',
          sorter: true,
          align: 'center',
        },
        {
          title: '补卡原因',
          dataIndex: 'currEffectiveAmt',
        },
        {
          title: '补卡状态',
          dataIndex: 'currEffectiveInvAmt',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          title: '通过',
          key: 'approved',
          className: 'tw-btn-success',
          icon: 'check-square',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            console.log(selectedRowKeys, selectedRows, queryParams);
          },
        },
        {
          title: '拒绝',
          key: 'rejected',
          className: 'tw-btn-error',
          icon: 'close-square',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            console.log(selectedRowKeys, selectedRows, queryParams);
          },
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default platAttendanceReapply;
