import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

const DOMAIN = 'platAttendanceRule';

@connect(({ loading, dispatch, platAttendanceRule }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  platAttendanceRule,
}))
@mountToTab()
class AttendanceRecordOther extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  }

  render() {
    const {
      dispatch,
      loading,
      platAttendanceRule: { dataSource, total },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      total,
      showSearch: false,
      showColumn: false,
      showExport: false,
      columns: [
        {
          title: '规则名称',
          dataIndex: 'ruleName',
        },
        {
          title: '打卡时间',
          dataIndex: 'clockDateRuleView',
          render: (value, row, index) =>
            value.map((v, i) => {
              const {
                attendanceDateMon,
                attendanceDateTue,
                attendanceDateWed,
                attendanceDateThu,
                attendanceDateFri,
                attendanceDateSat,
                attendanceDateSun,
                attendanceTimeStart,
                attendanceTimeEnd,
              } = v;
              return (
                <div>
                  {`${i + 1}.${attendanceDateMon ? '星期一' : ''}
                    ${attendanceDateTue ? '星期二' : ''}
                    ${attendanceDateWed ? '星期三' : ''}
                    ${attendanceDateThu ? '星期四' : ''}
                    ${attendanceDateFri ? '星期五' : ''}
                    ${attendanceDateSat ? '星期六' : ''}
                    ${attendanceDateSun ? '星期天' : ''}
                    上班${attendanceTimeStart || '--:--'} ~ 下班${attendanceTimeEnd || '--:--'}`}
                </div>
              );
            }),
        },
        {
          title: '打卡地点',
          dataIndex: 'clockSiteRuleView',
          render: (value, row, index) =>
            value.map((v, i) => {
              const { siteDesc, siteRadius, id } = v;
              return <div key={id}>{`${i + 1}.${siteDesc} ${siteRadius}米`}</div>;
            }),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新增',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/hr/attendanceMgmt/attendance/rule/edit');
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const id = selectedRowKeys[0];
            router.push(`/hr/attendanceMgmt/attendance/rule/edit?id=${id}`);
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/del`,
              payload: selectedRowKeys.join(','),
            });
          },
        },
        {
          key: 'abnormalRule',
          className: 'tw-btn-primary',
          title: '打卡异常算法管理',
          icon: 'setting',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/hr/attendanceMgmt/attendance/AbnormalRule');
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="打卡规则列表">
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
          title={<Title icon="profile" text="打卡规则" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceRecordOther;
