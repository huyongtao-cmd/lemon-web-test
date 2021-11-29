import React from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Input } from 'antd';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';

import { injectUdc, mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { createAlert } from '@/components/core/Confirm';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';
import { fromQs } from '@/utils/stringUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userTaskOriginated';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ dispatch, loading, userTaskOriginated }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...userTaskOriginated, // 代表与该组件相关redux的model
}))
@injectUdc(
  {
    taskStatus: 'TSK:TASK_STATUS',
  },
  DOMAIN
)
@mountToTab()
class TaskOriginated extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  state = {
    visible: false,
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
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
      },
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;
    const { _udcMap = {}, visible } = this.state;
    const { taskStatus } = _udcMap;

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
        {
          title: '事由号',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="事由号名称" />,
        },
        {
          title: '接收资源',
          dataIndex: 'receiverResName',
          options: {
            initialValue: searchForm.receiverResName,
          },
        },
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
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
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
          title: '编号',
          dataIndex: 'taskNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '任务包名称',
          dataIndex: 'taskName',
          render: (value, row, index) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '任务状态',
          dataIndex: 'taskStatusName',
          align: 'center',
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
          title: '发包资源',
          dataIndex: 'disterResName',
        },
        {
          title: '接收资源',
          dataIndex: 'receiverResName',
        },
        {
          title: '复合能力', // jobType1Name + jobType2Name + capasetLeveldName
          dataIndex: 'jobType1Name',
          align: 'center',
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
        },
        {
          title: '事由号',
          dataIndex: 'reasonName',
          align: 'center',
        },
        {
          title: '接受BU',
          dataIndex: 'expenseBuName',
        },
        {
          title: '是否跨BU', // expenseBuId === receiverBuId
          dataIndex: 'expenseBuId',
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={+(rows.expenseBuId !== rows.receiverBuId)}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: 'BU结算价',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '总当量',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          align: 'right',
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
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 只有状态为新建的任务才可以修改
            if (selectedRows[0].taskStatus !== 'CREATE') {
              createMessage({ type: 'warn', description: '只有状态为新建的任务才可以修改。' });
              return;
            }
            router.push(`/user/task/edit?id=${selectedRowKeys}`);
          },
        },
        {
          key: 'settle',
          className: 'tw-btn-primary',
          title: '发起结算',
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && !selectedRows[0].pricingMethod,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, pricingMethod } = selectedRows[0];
            pricingMethod === 'SUM' &&
              router.push(`/plat/intelStl/list/sum?id=${id}&from=originated`);
            pricingMethod === 'SINGLE' &&
              router.push(`/plat/intelStl/list/single?id=${id}&from=originated`);
          },
        },
        {
          key: 'originate',
          className: 'tw-btn-info',
          title: '派发',
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'CREATE') {
              createMessage({ type: 'warn', description: '只有新建的任务才能派发！' });
              return;
            }
            router.push(`/user/distribute/create?taskId=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          icon: 'delete',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'CREATE') {
              createMessage({ type: 'warn', description: '只有状态为新建的任务才可以删除。' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys },
            });
          },
        },
        {
          key: 'change',
          className: 'tw-btn-info',
          title: '当量调整',
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'IN PROCESS',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只有进行中的任务才能当量调整！' });
              return;
            }
            router.push(`/user/task/change?id=${selectedRowKeys[0]}&from=originated`);
          },
        },
        {
          key: 'pending',
          className: 'tw-btn-error',
          title: '暂挂',
          loading: false,
          icon: 'rollback',
          hidden: true,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'IN PROCESS',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只能暂挂处理中的任务。' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/pending`,
              payload: {
                id: selectedRowKeys[0],
              },
            });
          },
        },
        {
          key: 'close',
          className: 'tw-btn-error',
          title: '关闭',
          loading: false,
          icon: 'close',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'IN PROCESS',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只有状态为处理中的任务才可以关闭。' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/close`,
              payload: { id: selectedRowKeys[0] },
            }).then(res => {
              if (res) {
                // 如果接包人和发包人是同一个人 不需评价
                if (selectedRows[0].disterResId === selectedRows[0].receiverResId) return;
                this.setState({ visible: true });
                dispatch({
                  type: `evalCommonModal/query`,
                  payload: {
                    evalClass: 'TASK',
                    evalType: 'SENDER2RECEIVER',
                    evalerResId: selectedRows[0].disterResId,
                    evaledResId: selectedRows[0].receiverResId,
                    sourceId: selectedRows[0].id,
                  },
                });
              }
            });
          },
        },
        {
          key: 'cancel',
          className: 'tw-btn-warning',
          title: '取消暂挂',
          loading: false,
          icon: 'close-square',
          hidden: true,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'PENDING',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'PENDING') {
              createMessage({ type: 'warn', description: '只能激活暂挂的任务!' });
              return;
            }
            // 暂挂与重新打开暂时是一致的。
            dispatch({
              type: `${DOMAIN}/reopen`,
              payload: {
                id: selectedRowKeys[0],
              },
            });
          },
        },
        {
          key: 're-open',
          className: 'tw-btn-warning',
          title: '重新打开',
          loading: false,
          icon: 'redo',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CLOSED',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'CLOSED') {
              createMessage({ type: 'warn', description: '只能打开关闭的状态!' });
              return;
            }
            dispatch({
              type: `userTask/reopen`,
              payload: {
                id: selectedRowKeys[0],
              },
            }).then(
              this.fetchData(searchForm) // 参数貌似没用
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="发起的任务">
        {taskStatus && <DataTable scroll={{ x: 2000 }} {...tableProps} />}
        <EvalCommonModal visible={visible} toggle={() => this.setState({ visible: !visible })} />
      </PageHeaderWrapper>
    );
  }
}

export default TaskOriginated;
