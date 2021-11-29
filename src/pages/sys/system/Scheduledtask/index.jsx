import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { mountToTab } from '@/layouts/routerControl';
import { Switch, Input, Select, Button } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'sysTimedTask';
const { Option } = Select;

@connect(({ loading, sysTimedTask }) => ({
  sysTimedTask,
  loading,
}))
@mountToTab()
class SystemRole extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({
      // sortBy: 'code',
      // sortDirection: 'ASC',
      // custom: undefined,
      // disabled: undefined,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  execute = taskCode => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/timedTaskNowStart`, payload: { code: taskCode } });
  };

  render() {
    const { loading, sysTimedTask, dispatch } = this.props;
    const { list, total, searchForm } = sysTimedTask;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: formatMessage({ id: 'sys.scheduledtask.search', desc: '名称' }),
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
          tag: <Input placeholder="定时任务名称" />,
        },
      ],
      columns: [
        {
          title: formatMessage({ id: 'sys.scheduledtask.name', desc: '名称' }),
          dataIndex: 'taskName',
          width: '20%',
          // render: (value, rowData) => {
          //   const href = `/sys/system/Scheduledtask/detail?id=${rowData.code}`;
          //   return (
          //     <Link className="tw-link" to={href}>
          //       {value}
          //     </Link>
          //   );
          // },
        },
        {
          title: formatMessage({ id: 'sys.scheduledtask.code', desc: '编码' }),
          dataIndex: 'taskCode',
          width: '20%',
        },
        {
          title: formatMessage({ id: 'sys.scheduledtask.cron', desc: '表CRON表达式' }),
          dataIndex: 'cron',
          width: '25%',
        },
        {
          title: formatMessage({ id: 'sys.scheduledtask.run', desc: '是否运行' }),
          dataIndex: 'enable',
          className: 'text-center',
          width: '10%',
        },
        {
          title: formatMessage({ id: 'sys.scheduledtask.time', desc: '更新时间' }),
          dataIndex: 'modifyTime',
          className: 'text-center',
          width: '15%',
        },
        {
          title: '操作',
          dataIndex: 'modifyTime1',
          width: '10%',
          className: 'text-center',
          render: (value, row, index) => (
            <Button
              type="primary"
              className="tw-btn-info"
              icon="play-circle"
              loading={loading.effects[`${DOMAIN}/timedTaskNowStart`]}
              onClick={e => {
                this.execute(row.taskCode);
              }}
            >
              立即执行
            </Button>
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/Scheduledtask/create');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/Scheduledtask/edit?taskCode=${selectedRows[0].taskCode}`);
          },
        },
        {
          key: 'start',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.start.use`, desc: '启用' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/startTimedTask`,
              payload: { taskCode: selectedRows[0].taskCode },
            });
          },
        },
        {
          key: 'stop',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.stop.use`, desc: '停用' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/stopTimedTask`,
              payload: { taskCode: selectedRows[0].taskCode },
            });
          },
        },
        {
          key: 'quickStart',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.quickStart`, desc: '立即生效' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/startTimedTaskQuick`,
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default SystemRole;
