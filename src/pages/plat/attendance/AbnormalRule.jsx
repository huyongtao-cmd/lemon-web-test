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

const DOMAIN = 'attendanceAbnormalRule';

@connect(({ loading, dispatch, attendanceAbnormalRule }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  attendanceAbnormalRule,
}))
@mountToTab()
class AttendanceAbnormal extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  }

  render() {
    const {
      dispatch,
      loading,
      attendanceAbnormalRule: { dataSource, total },
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
      pagination: false,
      columns: [
        {
          title: '名称',
          dataIndex: 'proName',
          align: 'center',
        },
        {
          title: '异常表达式',
          dataIndex: 'proExpression',
          align: 'center',
        },
        {
          title: '异常说明',
          dataIndex: 'remark',
          align: 'center',
        },
        {
          title: '是否启用',
          dataIndex: 'isEnable',
          align: 'center',

          render: (value, row, index) => (value === 0 ? '否' : '是'),
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
            router.push('/hr/attendanceMgmt/attendance/AbnormalRule/edit');
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
            router.push(`/hr/attendanceMgmt/attendance/AbnormalRule/edit?id=${id}`);
          },
        },
        {
          key: 'switch',
          className: 'tw-btn-primary',
          title: '状态开关',
          icon: 'tool',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/switch`,
              payload: selectedRowKeys[0],
            });
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
      ],
    };

    return (
      <PageHeaderWrapper title="打卡异常算法列表">
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
          title={<Title icon="profile" text="打卡异常算法" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceAbnormal;
