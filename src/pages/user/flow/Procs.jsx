import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, has } from 'ramda';
import { DatePicker, Select } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { selectIamUsers, tenantProc } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import api from '@/api';

const DOMAIN = 'flowProcs';
const { Option } = Select;
const { revoke } = api.bpm;

const hasStartTime = has('startTime');

@connect(({ dispatch, loading, user, flowProcs }) => ({
  dispatch,
  user,
  flowProcs,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class Procs extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'no', sortDirection: 'DESC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
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
        // 不能改成procIden
        id,
        taskId,
        docId,
        mode: 'view',
        originalUrl: window.location.origin + '/user/flow/process?type=procs',
      });
      router.push(route);
    }
  };

  renderLink = (value, rowData) => {
    const { defKey, id, taskId, docId, procIden } = rowData;
    // if (defKey === 'TSK_P07') {
    //   return (
    //     <Link className="tw-link" to={`/user/task/subpackDetail?id=${docId}`}>
    //       {value}
    //     </Link>
    //   );
    // }
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
      originalUrl: window.location.origin + '/user/flow/process?type=procs',
    });

    return (
      <Link className="tw-link" to={route}>
        {value}
      </Link>
    );
  };

  handleRevoked = prcId => {
    request.post(toUrl(revoke, { id: prcId })).then(({ response }) => {
      if (response.ok) {
        createMessage({ type: 'success', description: '撤销成功' });
        const { flowProcs, dispatch } = this.props;
        const { searchForm } = flowProcs;
        dispatch({ type: `${DOMAIN}/updateSearchForm`, payload: { selectedRowKeys: [] } });
        this.fetchData(searchForm);
      } else {
        createMessage({ type: 'error', description: `当前流程不可撤回` });
      }
    });
  };

  tableCfg = () => {
    const { loading, flowProcs, dispatch, user = {} } = this.props;
    const { searchForm, list, total } = flowProcs;
    const tableProps = {
      rowKey: 'no',
      sortBy: 'no',
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
      // enableSelection: false,
      onChange: filters => {
        if (hasStartTime(filters)) {
          const { startTime } = filters;
          const convertTime = startTime ? formatDT(startTime) : undefined;
          this.fetchData({ ...filters, startTime: convertTime });
        } else {
          this.fetchData(filters);
        }
      },
      onSearchBarChange: (_, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      leftButtons: [
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'warning',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, todoInfo = {} } = selectedRows[0];
            const { workerNames, isInitial } = todoInfo;
            const { info = {}, roles = [] } = user.user || {};
            const { name } = info;
            if (!isInitial && !roles.includes('SYS_ADMIN')) {
              createMessage({ type: 'warn', description: '流程只有在发起节点才能删除！' });
              return;
            }
            if (name === workerNames || roles.includes('SYS_ADMIN')) {
              // 代办人是当前登录人 或者管理员能删
              dispatch({
                type: `${DOMAIN}/deleteProc`,
                payload: id,
              });
            } else createMessage({ type: 'warn', description: '当前流程不允许删除' });
          },
        },
        {
          key: 'rollback',
          title: '撤回',
          className: 'tw-btn-primary',
          icon: 'rollback',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !(
              selectedRows.length === 1 &&
              selectedRows[0].revokable &&
              // A45绩效考核流程不能撤回
              selectedRows[0].defKey !== 'ACC_A45'
            ),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            this.handleRevoked(id);
          },
        },
      ],
      searchBarForm: [
        {
          title: '当前处理人',
          dataIndex: 'todoAssigneeNameLike',
          options: {
            initialValue: searchForm.todoAssigneeNameLike,
          },
        },
        {
          title: '是否结束',
          dataIndex: 'done',
          options: {
            initialValue: searchForm.done || 'all',
          },
          tag: (
            <Select>
              <Option value="all">全部</Option>
              <Option value="true">是</Option>
              <Option value="false">否</Option>
            </Select>
          ),
        },
        {
          title: '流程类型',
          // dataIndex: 'defKey',
          dataIndex: 'procIden',
          options: {
            initialValue: searchForm.defKey,
          },
          tag: <Selection source={() => tenantProc()} placeholder="请选择流程类型" />,
        },
        {
          title: '流程编号',
          dataIndex: 'no',
          options: {
            initialValue: searchForm.no,
          },
        },
        {
          title: '流程名',
          dataIndex: 'nameLike',
          options: {
            initialValue: searchForm.nameLike,
          },
        },
        {
          title: '相关信息',
          dataIndex: 'infoLike',
          options: {
            initialValue: searchForm.infoLike,
          },
        },
        {
          title: '发起人',
          dataIndex: 'initiator',
          options: {
            initialValue: searchForm.initiator,
          },
          tag: <Selection source={() => selectIamUsers()} placeholder="请选择发起人" />,
        },
        {
          title: '创建日期(从)',
          dataIndex: 'sinceDate',
          options: {
            initialValue: searchForm.sinceDate,
          },
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
        },
        {
          title: '创建日期(至)',
          dataIndex: 'untilDate',
          options: {
            initialValue: searchForm.untilDate,
          },
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
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
          sorter: true,
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
          // render: value => formatDT(value),
          width: 200,
        },
        {
          title: '发起人',
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
          width: 200,
          className: 'text-center',
          render: (_, record) => {
            const current = record.todoInfo || {};
            if (isEmpty(current)) return <span>空</span>;
            return <span>{current.taskNames}</span>;
          },
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
      <PageHeaderWrapper title="流程检索">
        <DataTable {...this.tableCfg()} />
      </PageHeaderWrapper>
    );
  }
}

export default Procs;
