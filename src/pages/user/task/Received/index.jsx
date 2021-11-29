import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { DatePicker, Input, Table, Button } from 'antd';
import Link from 'umi/link';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { createAlert, createConfirm } from '@/components/core/Confirm';
import { Selection } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userTaskReceived';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, userTaskReceived }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...userTaskReceived, // 代表与该组件相关redux的model
}))
@mountToTab()
class TaskReceived extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  state = {
    _selectedRowKeys: [],
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { taskStatus } = fromQs();
    if (taskStatus === 'CLOSED') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          searchForm: {
            taskStatus: 'CLOSED',
          },
        },
      });
      this.fetchData({ offset: 0, limit: 10, taskStatus: 'CLOSED' });
    } else {
      this.fetchData({ offset: 0, limit: 10 });
    }
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  startResAct = (id, status) => {
    const { dispatch } = this.props;
    if (!status || status === 'TO BE STARTED') {
      dispatch({
        type: `${DOMAIN}/startResAct`,
        payload: { id },
      });
    } else {
      createMessage({ type: 'warn', description: '该活动状态目前不可开始' });
    }
  };

  finishResAct = (resActId, taskId, status, apprStatus) => {
    const { dispatch } = this.props;
    if (!status || status === 'TO BE STARTED' || status === 'IN PROCESS' || status === 'DELAYED') {
      if (!apprStatus) {
        dispatch({
          type: `${DOMAIN}/finishResAct`,
          payload: { resActId, taskId },
        });
      } else {
        createMessage({ type: 'warn', description: '已存在完工流程,请勿重新发起' });
      }
    } else {
      createMessage({ type: 'warn', description: '该活动状态目前不可发起完工' });
    }
  };

  nestedTableRender = (record, index, indent, expanded) => {
    const columns = [
      { title: '活动名称', dataIndex: 'actName', key: 'actName' },
      { title: '活动当量', dataIndex: 'eqvaQty', key: 'eqvaQty' },
      { title: '计划开始日期', dataIndex: 'planStartDate', key: 'planStartDate' },
      { title: '计划结束日期', dataIndex: 'planEndDate', key: 'planEndDate' },
      { title: '活动状态', dataIndex: 'actStatusName', key: 'actStatusName' },
      {
        title: '操作',
        key: 'operation',
        render: (text, childrenRecord) => (
          <span className="table-operation">
            <Button
              type="primary"
              onClick={() =>
                this.startResAct(childrenRecord.id.split('-')[1], childrenRecord.actStatus)
              }
            >
              开始
            </Button>
            &nbsp;
            <Button
              type="primary"
              onClick={() =>
                this.finishResAct(
                  childrenRecord.id.split('-')[1],
                  childrenRecord.taskId,
                  childrenRecord.actStatus,
                  childrenRecord.apprStatus
                )
              }
            >
              完工
            </Button>
          </span>
        ),
      },
    ];

    return (
      <Table
        rowKey="id"
        style={{ marginLeft: '25px' }}
        columns={columns}
        dataSource={record.children1}
        pagination={false}
      />
    );
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;
    const { _selectedRowKeys } = this.state;
    // dataSource.forEach( data =>{
    //   // eslint-disable-next-line
    //   data.children1=data.children.slice();
    //   // eslint-disable-next-line
    //   data.children=undefined;
    // });

    const tableProps = {
      // rowKey: record => `${record.name || record.taskName}-${record.id}`, // 解决 children 的 id 跟父级重复的问题
      rowKey: 'id',
      columnsCache: DOMAIN,
      // expandedRowRender: record => <p style={{ margin: 0 }}>{record.description}</p>,
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
      expandedRowRender: this.nestedTableRender,
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: !record.pricingMethod,
        }),
      },
      searchBarForm: [
        {
          title: '任务',
          dataIndex: 'taskNoOrName',
          options: {
            initialValue: searchForm.taskNoOrName,
          },
          tag: <Input placeholder="名称/编号" />,
        },
        {
          title: '事由类型',
          dataIndex: 'reasonType',
          tag: <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" />, // TODO: 第四条隐藏
          options: {
            initialValue: searchForm.reasonType,
          },
        },
        // {
        //   title: '事由号',
        //   dataIndex: 'reasonNo',
        //   options: {
        //     initialValue: searchForm.reasonNo,
        //   },
        // },
        // {
        //   title: '接收资源',
        //   dataIndex: 'receiverResName',
        //   options: {
        //     initialValue: searchForm.receiverResName,
        //   },
        // },
        {
          title: '状态', // TSK:TASK_STATUS
          dataIndex: 'taskStatus',
          tag: <Selection.UDC code="TSK:TASK_STATUS" placeholder="请选择状态" />,
          options: {
            initialValue: searchForm.taskStatus,
          },
        },
        {
          title: '承担费用BU',
          dataIndex: 'expenseBuName',
          options: {
            initialValue: searchForm.expenseBuName,
          },
        },
        {
          title: '创建开始时间',
          dataIndex: 'createStartTime',
          tag: (
            <DatePicker
              placeholder="请选择创建开始时间"
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
          options: {
            initialValue: searchForm.createStartTime,
          },
        },
        {
          title: '创建结束时间',
          dataIndex: 'createEndTime',
          tag: <DatePicker placeholder="创建结束时间" format="YYYY-MM-DD" className="x-fill-100" />,
          options: {
            initialValue: searchForm.createEndTime,
          },
        },
      ],
      columns: [
        {
          title: '任务名称',
          dataIndex: 'taskName',
          render: (value, row, index) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.id}&from=/user/task/received`}>
              {value}
            </Link>
          ),
        },
        {
          title: '派发资源',
          dataIndex: 'disterResName',
          key: 'disterResName',
        },
        {
          title: '验收方式',
          dataIndex: 'acceptMethodName',
          key: 'acceptMethodName',
        },
        {
          title: '任务状态',
          dataIndex: 'taskStatusName',
          key: 'taskStatusName',
        },
        {
          title: '评价状态',
          dataIndex: 'evalStatus',
          align: 'center',
          render: (val, row) => {
            let value = '';
            if (row.taskStatus === 'CLOSED') {
              if (val === '1') {
                value = '已评价';
              } else if (val === '2') {
                value = '不需评价';
              } else {
                value = '待评价';
              }
            }
            return value;
          },
        },
        {
          title: '任务当量',
          dataIndex: 'eqvaQty',
          key: 'eqvaQty',
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        // {
        //   title: '项目活动',
        //   dataIndex: 'name',
        //   key: 'name',
        // },
        {
          title: '计划开始时间',
          dataIndex: 'planStartDate',
          key: 'planStartDate',
        },
        {
          title: '计划结束时间',
          dataIndex: 'planEndDate',
          key: 'planEndDate',
        },
        {
          title: '转包任务包',
          dataIndex: 'transferFlag',
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        // { // TODO: 重复字段允许显示
        //   title: '活动当量',
        //   dataIndex: 'eqvaQty',
        //   key: 'eqvaQty',
        // },
        // {
        //   title: '完工百分比',
        //   dataIndex: 'pct',
        //   key: 'pct',
        // },
        // {
        //   title: '执行状态',
        //   dataIndex: 'actStatusName',
        //   key: 'actStatusName',
        // },
        // {
        //   title: '开始活动',
        //   dataIndex: '_init',
        //   key: '_init',
        // },
        // {
        //   title: '填写工时',
        //   dataIndex: '_timesheet',
        //   key: '_timesheet',
        // },
        // {
        //   title: '发起完工',
        //   dataIndex: '_finish',
        //   key: '_finish',
        // },
        // {
        //   title: '填写出差',
        //   dataIndex: '_business',
        //   key: '_business',
        // },
        // {
        //   title: '事件',
        //   dataIndex: '_event',
        //   key: '_event',
        // },
      ],
      leftButtons: [
        {
          key: 'subpack',
          className: 'tw-btn-primary',
          title: '转包',
          loading: false,
          icon: 'apartment',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].allowTransferFlag === 0) {
              createMessage({ type: 'warn', description: '该任务包按照转包策略不可转包' });
              return;
            }
            if (selectedRows[0].pid) {
              createMessage({ type: 'warn', description: '子任务包不可转包' });
              return;
            }
            if (selectedRows[0].pricingMethod === 'SINGLE') {
              createMessage({ type: 'warn', description: '按单价验收的任务包不可转包' });
              return;
            }
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只有处理中的任务可以转包' });
              return;
            }
            const { id } = selectedRows[0];
            router.push(`/user/task/subpack?id=${id}`);
          },
        },
        {
          key: 'splitpack',
          className: 'tw-btn-primary',
          title: '拆包',
          loading: false,
          icon: 'disconnect',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // if (selectedRows[0].allowTransferFlag === 0) {
            //   createMessage({ type: 'warn', description: '该任务包按照转包策略不可拆包' });
            //   return;
            // }
            // if (selectedRows[0].pid) {
            //   createMessage({ type: 'warn', description: '子任务包不可拆包' });
            //   return;
            // }
            // if (selectedRows[0].pricingMethod === 'SINGLE') {
            //   createMessage({ type: 'warn', description: '按单价验收的任务包不可拆包' });
            //   return;
            // }
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只有处理中的任务可以拆包' });
              return;
            }
            router.push(`/user/task/splitpack?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'approve',
          className: 'tw-btn-primary',
          title: '发起报销',
          loading: false,
          icon: 'reconciliation',
          hidden: true,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            createAlert.info({
              content: '该功能尚未开发。',
            }),
        },
        {
          key: 'request',
          className: 'tw-btn-info',
          title: '申请结算',
          loading: false,
          icon: 'file-add',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'IN PROCESS',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, pricingMethod } = selectedRows[0];
            pricingMethod === 'SUM' &&
              router.push(`/plat/intelStl/list/sum?id=${id}&from=received`);
            pricingMethod === 'SINGLE' &&
              router.push(`/plat/intelStl/list/single?id=${id}&from=received`);
          },
        },
        {
          key: 'complete',
          className: 'tw-btn-info',
          title: '申请完工',
          loading: false,
          hiddern: false,
          icon: 'file-add',
          disabled: selectedRows => {
            const result =
              selectedRows.filter(
                r => !r.taskStatus || (r.taskStatus !== 'IN PROCESS' && r.taskStatus !== 'FINISHED')
              ).length > 0;
            return result;
          },
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认申请关闭任务包？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/checkTaskEqva`, // 先校验任务包当量是否已经全部结算
                  payload: selectedRowKeys[0],
                }).then(resp => {
                  if (resp && resp.ok) {
                    if (resp.datum) {
                      // 全部结算
                      dispatch({
                        // 发起任务包完工流程
                        type: `${DOMAIN}/startCompleteProc`,
                        payload: { taskId: selectedRowKeys[0] },
                      }).then(() => {
                        // dispatch方法必须放到函数里，否则流程api结束前就会发起查询请求
                        dispatch({
                          type: `${DOMAIN}/query`,
                          payload: null,
                        });
                      });
                    } else {
                      createConfirm({
                        content: '还有未结算当量，确定关闭任务包吗？',
                        onOk: () =>
                          dispatch({
                            // 发起任务包完工流程
                            type: `${DOMAIN}/startCompleteProc`,
                            payload: { taskId: selectedRowKeys[0] },
                          }).then(() => {
                            dispatch({
                              type: `${DOMAIN}/query`,
                              payload: null,
                            });
                          }),
                      });
                    }
                  } else if (resp && !resp.ok) {
                    // 请求出错
                    createMessage({ type: 'error', description: resp.reason });
                  }
                }),
            });
          },
        },
      ],
    };

    // rowSelection objects indicates the need for row selection

    return (
      <PageHeaderWrapper title="接收的任务">
        <DataTable scroll={{ x: 1000 }} {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TaskReceived;
