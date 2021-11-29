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
import { selectIamAllUsers, tenantProc } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';

const DOMAIN = 'flowDone';
const { Option } = Select;
const hasStartTime = has('startTime');

@connect(({ dispatch, loading, flowDone }) => ({
  dispatch,
  flowDone,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class Done extends Component {
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
        id,
        taskId,
        docId,
        mode: 'view',
        originalUrl: window.location.origin + '/user/flow/process?type=done',
      });
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
      originalUrl: window.location.origin + '/user/flow/process?type=done',
    });
    return (
      <Link className="tw-link" to={route}>
        {value}
      </Link>
    );
  };

  tableCfg = () => {
    const { loading, flowDone, dispatch } = this.props;
    const { searchForm, list, total } = flowDone;
    // console.log('-------list--', list);
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
      // expirys: 0,
      total,
      dataSource: list,
      searchForm,
      enableSelection: false,
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
          tag: <Selection source={() => selectIamAllUsers()} placeholder="请选择发起人" />,
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
          title: '我的审批时间',
          dataIndex: 'doneTime',
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
      <PageHeaderWrapper title="我的已办">
        <DataTable {...this.tableCfg()} />
      </PageHeaderWrapper>
    );
  }
}

export default Done;
