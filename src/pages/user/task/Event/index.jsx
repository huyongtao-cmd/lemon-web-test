import React from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';

import { mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { TagOpt } from '@/utils/tempUtils';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import { createAlert } from '@/components/core/Confirm';
// import Title from '@/components/layout/Title';
// import Loading from '@/components/core/DataLoading';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

const DOMAIN = 'userTaskEvent';

/**
 * 公共空白模版页面
 */
@connect(({ loading, userTaskEvent }) => ({
  loading: loading.effects[`${DOMAIN}/query`], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...userTaskEvent, // 代表与该组件相关redux的model
}))
@mountToTab()
class TaskEvent extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    this.fetchData();
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading,
      total,
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
          title: '项目',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.projName,
          },
        },
        {
          title: '主题',
          dataIndex: 'eventTitle',
          options: {
            initialValue: searchForm.eventTitle,
          },
        },
        {
          title: '负责人',
          dataIndex: 'eventUserName',
          options: {
            initialValue: searchForm.eventUserName,
          },
        },
        {
          title: '状态',
          dataIndex: 'eventStatus',
          tag: <Selection.UDC code="TSK.EVENT_STATUS" allowClear />,
          options: {
            initialValue: searchForm.eventStatus,
          },
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'eventNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '事件主题',
          dataIndex: 'eventTitle',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '负责人',
          dataIndex: 'eventUserName',
        },
        {
          title: '活动',
          dataIndex: 'actName',
        },
        {
          title: '地点',
          dataIndex: 'workPlace',
        },
        {
          title: '状态',
          dataIndex: 'eventStatus',
          align: 'center',
          render: status => (
            <TagOpt
              value={status}
              opts={[{ code: 0, name: '正常' }, { code: 'CREATE', name: '新建' }]}
              palette="gray|green"
            />
          ),
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: createTime => formatDT(createTime),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          icon: 'plus-circle',
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            createAlert.info({
              content: '该功能尚未开发。',
            }),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            createAlert.info({
              content: '该功能尚未开发。',
            }),
        },
        {
          key: 'start',
          className: 'tw-btn-info',
          title: '发起出差',
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            createAlert.info({
              content: '该功能尚未开发。',
            }),
        },
        {
          key: 'close',
          className: 'tw-btn-error',
          title: '关闭事件',
          loading: false,
          icon: 'close',
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            createAlert.info({
              content: '该功能尚未开发。',
            }),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="任务事件">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TaskEvent;
