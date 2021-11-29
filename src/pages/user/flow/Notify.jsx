import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, has } from 'ramda';
import { TagOpt } from '@/utils/tempUtils';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { readNotify } from '@/services/user/flow/flow';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { DatePicker } from 'antd';
import { tenantProc } from '@/services/gen/list';

const DOMAIN = 'flowNotify';

const hasStartTime = has('startTime');

@connect(({ dispatch, loading, flowNotify }) => ({
  dispatch,
  flowNotify,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class Notify extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'startTime', sortDirection: 'DESC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, onlyShowUnRead: 0 } });
  };

  requestRealType = async rowData => {
    const { id, taskId, docId } = rowData;
    const { status, response } = await getType(docId);
    if (status === 200 && response.ok) {
      const defKey =
        // eslint-disable-next-line
        response.datum === 'TASK_BY_PACKAGE'
          ? 'ACC_A22.SUM'
          : response.datum === 'TASK_BY_MANDAY'
            ? 'ACC_A22.SINGLE'
            : 'ACC_A22.COM';
      const route = flowToRouter(defKey, {
        id,
        taskId,
        docId,
        mode: 'view',
        originalUrl: window.location.origin + '/user/flow/process?type=cc',
      });
      readNotify(taskId); // 更新知会状态，静默请求，不管返回结果
      router.push(route);
    }
  };

  renderLink = (value, rowData) => {
    const { defKey, id, taskId, docId, procIden } = rowData;
    if (procIden === 'ACC_A22') {
      return (
        <a className="tw-link" onClick={() => this.requestRealType(rowData)}>
          {value}
        </a>
      );
    }
    const route = flowToRouter(procIden, {
      id,
      taskId,
      docId,
      mode: 'view',
      originalUrl: window.location.origin + '/user/flow/process?type=cc',
    });
    return (
      <a
        className="tw-link"
        onClick={() => {
          readNotify(taskId); // 更新知会状态，静默请求，不管返回结果
          router.push(route);
        }}
      >
        {value}
      </a>
    );
  };

  tableCfg = () => {
    const { loading, flowNotify, dispatch } = this.props;
    const { searchForm, list, total } = flowNotify;
    const tableProps = {
      rowKey: record => `${record.id}-${record.taskId}`,
      sortBy: 'startTime',
      sortDirection: 'DESC',
      scroll: {
        // x: '120%',
        // y: 330,
      },
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      dataSource: list,
      searchForm,
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: !!record.readTime,
        }),
      },
      // enableSelection: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (_, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '流程编号',
          dataIndex: 'no',
        },
        {
          title: '流程名称',
          dataIndex: 'nameLike',
        },
        {
          title: '流程类型',
          // dataIndex: 'defKey',
          dataIndex: 'procIden',
          tag: <Selection source={() => tenantProc()} placeholder="请选择流程类型" />,
        },
        {
          title: '创建时间(从)',
          dataIndex: 'sinceDate',
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
        },
        {
          title: '创建时间(至)',
          dataIndex: 'untilDate',
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
        },
      ],
      leftButtons: [
        {
          key: 'batchRead',
          className: 'tw-btn-primary',
          icon: 'form',
          title: '标记为已读',
          loading: false,
          hidden: false,
          disabled: selectedRows => !(selectedRows.length > 0),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const arr = [];
            selectedRows.forEach(v => {
              arr.push(v.taskId);
            });
            dispatch({
              type: `${DOMAIN}/readNotifyBatch`,
              payload: arr.join(','),
            });
          },
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'no',
          className: 'text-center',
          width: 150,
          render: this.renderLink,
        },
        {
          title: '流程名称',
          dataIndex: 'docName',
          render: this.renderLink,
        },
        {
          title: '相关信息',
          dataIndex: 'docInfo',
          width: 220,
        },
        {
          title: '创建时间',
          dataIndex: 'startTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
          // render: value => formatDT(value),
          width: 200,
        },
        {
          title: '创建者',
          dataIndex: 'initiatorName',
          width: 80,
          className: 'text-center',
        },
        {
          title: '当前处理人',
          dataIndex: 'currentName',
          width: 80,
          className: 'text-center',
          render: (_, record) => {
            const current = record.todoInfo || {};
            if (isEmpty(current)) return <span>空</span>;
            return <span>{current.workerNames}</span>;
          },
        },
        {
          title: '当前节点名',
          dataIndex: 'currentTask',
          className: 'text-center',
          width: 200,
          render: (_, record) => {
            const current = record.todoInfo || {};
            if (isEmpty(current)) return <span>空</span>;
            return <span>{current.taskNames}</span>;
          },
        },
        {
          title: '是否已读', // expenseBuId === receiverBuId
          dataIndex: 'readTime',
          width: 80,
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={!rows.readTime ? 0 : 1}
              opts={[{ code: 0, name: '未读' }, { code: 1, name: '已读' }]}
              palette="red|green"
            />
          ),
        },
        // {
        //   title: '下一节点处理人',
        //   dataIndex: 'nextName',
        //   width: '15%',
        //   render: (_, record) => {
        //     const current = (record.taskInfo || []).filter(task => Number(task.taskSeq) === 1);
        //     if (isEmpty(current)) return <span>空</span>;
        //     return <span>{current[0].taskNames}</span>;
        //   },
        // },
        // {
        //   title: '下一节点名',
        //   dataIndex: 'nextTask',
        //   width: '15%',
        //   render: (_, record) => {
        //     const current = (record.taskInfo || []).filter(task => Number(task.taskSeq) === 1);
        //     if (isEmpty(current)) return <span>空</span>;
        //     return <span>{current[0].candidates}</span>;
        //   },
        // },
      ],
    };
    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="我的已办">
        <DataTable {...this.tableCfg()} />
      </PageHeaderWrapper>
    );
  }
}

export default Notify;
