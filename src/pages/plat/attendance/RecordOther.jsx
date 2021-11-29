import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const DOMAIN = 'platAttendanceRecordOther';

@connect(({ loading, dispatch, platAttendanceRecordOther }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  platAttendanceRecordOther,
}))
@mountToTab()
class AttendanceRecordOther extends PureComponent {
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
      platAttendanceRecordOther: { dataSource, searchForm, total },
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
      // showColumn: false,
      // showExport: false,
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
          dataIndex: 'time',
          options: {
            initialValue: searchForm.time || [],
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
          title: '姓名',
          dataIndex: 'attendanceResId',
          options: {
            initialValue: searchForm.attendanceResId,
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
      ],
      columns: [
        {
          title: '时间',
          dataIndex: 'attendanceDate',
          sorter: true,
        },
        {
          title: '姓名',
          dataIndex: 'attendanceResIdName',
          align: 'center',
        },
        {
          title: '打卡时间',
          dataIndex: 'attendanceTimeStart',
        },
        {
          title: '打卡地点',
          dataIndex: 'attendanceLocation',
        },
        {
          title: '打卡说明',
          dataIndex: 'attendanceRemark',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="其他打卡记录">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/attendance')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="其他打卡记录" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceRecordOther;
