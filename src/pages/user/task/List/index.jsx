import React from 'react';
import { connect } from 'dva';
import { DatePicker, Input, Select, Radio } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import { injectUdc, mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import SyntheticField from '@/components/common/SyntheticField';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { createAlert } from '@/components/core/Confirm';
import { Selection, BuVersion } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import router from 'umi/router';
import Link from 'umi/link';
import { fromQs } from '@/utils/stringUtils';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userTask';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ dispatch, loading, userTask }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...userTask, // 代表与该组件相关redux的model
}))
@injectUdc(
  {
    taskStatus: 'TSK:TASK_STATUS',
  },
  DOMAIN
)
@mountToTab()
class TaskList extends React.PureComponent {
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
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'TASK_MANAGER_LIST' },
    });

    if (taskStatus === 'CLOSED') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          searchForm: {
            taskStatus: ['0', 'CLOSED'],
          },
        },
      });
      this.fetchData({ offset: 0, limit: 10, taskStatus: ['0', 'CLOSED'] });
    } else {
      this.fetchData({ offset: 0, limit: 10 });
    }
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;
    const { createStartTime } = params || {};
    const time = createStartTime ? formatDT(createStartTime) : undefined;
    const payload = time
      ? {
          ...params,
          createStartTime: time,
        }
      : params;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...payload,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
      },
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total, pageConfig } = this.props;
    const { _udcMap = {}, visible } = this.state;
    const { taskStatus } = _udcMap;

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentQueryConfig = [];
    let currentListConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'TASK_MANAGER_QUERY') {
        // 任务列表列表查询页面
        currentQueryConfig = view; // 查询条件区域
      } else if (view.blockKey === 'TASK_MANAGER_LIST') {
        currentListConfig = view; // 主区域
      }
    });
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig; // 查询区域
    const { pageFieldViews: pageFieldViewsList } = currentListConfig; // 列表区域

    const pageFieldJsonQuery = {}; // 查询区域
    const pageFieldJsonList = {}; // 列表区域
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2000 },
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      rowSelection: {
        type: 'radio',
      },
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
        pageFieldJsonQuery.taskName.visibleFlag && {
          title: `${pageFieldJsonQuery.taskName.displayName}`,
          dataIndex: 'taskNoOrName',
          sortNo: `${pageFieldJsonQuery.taskName.sortNo}`,
          options: {
            placeholder: '名称/编号',
            initialValue: searchForm.taskNoOrName,
          },
          tag: <Input placeholder="名称/编号" />,
        },
        pageFieldJsonQuery.reasonType.visibleFlag && {
          title: `${pageFieldJsonQuery.reasonType.displayName}`,
          dataIndex: 'reasonType',
          sortNo: `${pageFieldJsonQuery.reasonType.sortNo}`,
          tag: (
            <Selection.UDC
              code="TSK:REASON_TYPE"
              placeholder={`请选择${pageFieldJsonQuery.reasonType.displayName}`}
            />
          ), // TODO: 第四条隐藏
          options: {
            initialValue: searchForm.reasonType,
          },
        },
        pageFieldJsonQuery.reasonId.visibleFlag && {
          title: `${pageFieldJsonQuery.reasonId.displayName}`,
          dataIndex: 'reasonName',
          sortNo: `${pageFieldJsonQuery.reasonId.sortNo}`,
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder={`${pageFieldJsonQuery.reasonId.displayName}名称`} />,
        },
        pageFieldJsonQuery.disterResId.visibleFlag && {
          title: `${pageFieldJsonQuery.disterResId.displayName}`,
          dataIndex: 'disterResName',
          sortNo: `${pageFieldJsonQuery.disterResId.sortNo}`,
          options: {
            initialValue: searchForm.disterResName,
          },
        },
        pageFieldJsonQuery.receiverResId.visibleFlag && {
          title: `${pageFieldJsonQuery.receiverResId.displayName}`,
          dataIndex: 'receiverResName',
          sortNo: `${pageFieldJsonQuery.receiverResId.sortNo}`,
          options: {
            initialValue: searchForm.receiverResName,
          },
        },
        pageFieldJsonQuery.taskStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.taskStatus.displayName}`,
          dataIndex: 'taskStatus',
          sortNo: `${pageFieldJsonQuery.taskStatus.sortNo}`,
          options: {
            initialValue: searchForm.taskStatus,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                <Radio.Button value="0">=</Radio.Button>
                <Radio.Button value="1">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK:TASK_STATUS"
                placeholder={`请选择${pageFieldJsonQuery.taskStatus.displayName}`}
                showSearch
              />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.expenseBuId.visibleFlag && {
          title: `${pageFieldJsonQuery.expenseBuId.displayName}`,
          dataIndex: 'expenseBuId',
          sortNo: `${pageFieldJsonQuery.expenseBuId.sortNo}`,
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
        },
        pageFieldJsonQuery.strideBuFlag.visibleFlag && {
          title: `${pageFieldJsonQuery.strideBuFlag.displayName}`,
          dataIndex: 'isDifBu',
          sortNo: `${pageFieldJsonQuery.strideBuFlag.sortNo}`,
          options: {
            initialValue: searchForm.isDifBu,
          },
          tag: (
            <Select name="defFlag" allowClear>
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={0}>否</Select.Option>
            </Select>
          ),
        },
        pageFieldJsonQuery.createTime.visibleFlag && {
          title: `${pageFieldJsonQuery.createTime.displayName}`,
          dataIndex: 'createStartTime',
          sortNo: `${pageFieldJsonQuery.createTime.sortNo}`,
          tag: (
            <DatePicker
              placeholder={`请选择${pageFieldJsonQuery.createTime.displayName}`}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
          options: {
            initialValue: searchForm.createStartTime,
          },
        },
        pageFieldJsonQuery.modifyTime.visibleFlag && {
          title: `${pageFieldJsonQuery.modifyTime.displayName}`,
          dataIndex: 'createEndTime',
          sortNo: `${pageFieldJsonQuery.modifyTime.sortNo}`,
          tag: (
            <DatePicker
              placeholder={`请选择${pageFieldJsonQuery.modifyTime.displayName}`}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
          options: {
            initialValue: searchForm.createEndTime,
          },
        },
        pageFieldJsonQuery.taskPackageType.visibleFlag && {
          title: `${pageFieldJsonQuery.taskPackageType.displayName}`,
          dataIndex: 'taskPackageType',
          sortNo: `${pageFieldJsonQuery.taskPackageType.sortNo}`,
          tag: (
            <Selection.UDC
              code="TSK:TASK_PACKAGE_TYPE"
              placeholder={`请选择${pageFieldJsonQuery.taskPackageType.displayName}`}
            />
          ), // TODO: 第四条隐藏
          options: {
            initialValue: searchForm.taskPackageType,
          },
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.taskNo.visibleFlag && {
          title: `${pageFieldJsonList.taskNo.displayName}`,
          dataIndex: 'taskNo',
          sortNo: `${pageFieldJsonList.taskNo.sortNo}`,
          sorter: true,
          align: 'center',
        },
        pageFieldJsonList.taskName.visibleFlag && {
          title: `${pageFieldJsonList.taskName.displayName}`,
          dataIndex: 'taskName',
          sortNo: `${pageFieldJsonList.taskName.sortNo}`,
          render: (value, row, index) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.id}&from=/user/task/list`}>
              {value}
            </Link>
          ),
        },
        pageFieldJsonList.taskStatus.visibleFlag && {
          title: `${pageFieldJsonList.taskStatus.displayName}`,
          dataIndex: 'taskStatus',
          sortNo: `${pageFieldJsonList.taskStatus.sortNo}`,
          align: 'center',
          render: status => <TagOpt value={status} opts={taskStatus} palette="red|green" />,
        },
        pageFieldJsonList.disterResId.visibleFlag && {
          title: `${pageFieldJsonList.disterResId.displayName}`,
          dataIndex: 'disterResName',
          sortNo: `${pageFieldJsonList.disterResId.sortNo}`,
        },
        pageFieldJsonList.receiverResId.visibleFlag && {
          title: `${pageFieldJsonList.receiverResId.displayName}`,
          dataIndex: 'receiverResName',
          sortNo: `${pageFieldJsonList.receiverResId.sortNo}`,
        },
        pageFieldJsonList.capasetLeveldId.visibleFlag && {
          title: `${pageFieldJsonList.capasetLeveldId.displayName}`, // jobType1Name + jobType2Name + capasetLeveldName
          dataIndex: 'jobType1Name',
          sortNo: `${pageFieldJsonList.capasetLeveldId.sortNo}`,
          align: 'center',
          render: (value, row, index) =>
            [row.jobType1Name, row.jobType2Name, row.capasetLeveldName].join('-'),
        },
        pageFieldJsonList.reasonType.visibleFlag && {
          title: `${pageFieldJsonList.reasonType.displayName}`,
          dataIndex: 'reasonTypeName',
          sortNo: `${pageFieldJsonList.reasonType.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.reasonId.visibleFlag && {
          title: `${pageFieldJsonList.reasonId.displayName}`,
          dataIndex: 'reasonName',
          sortNo: `${pageFieldJsonList.reasonId.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.expenseBuId.visibleFlag && {
          title: `${pageFieldJsonList.expenseBuId.displayName}`,
          dataIndex: 'expenseBuName',
          sortNo: `${pageFieldJsonList.expenseBuId.sortNo}`,
        },
        pageFieldJsonList.strideBuFlag.visibleFlag && {
          title: `${pageFieldJsonList.strideBuFlag.displayName}`, // expenseBuId === receiverBuId
          dataIndex: 'expenseBuId',
          sortNo: `${pageFieldJsonList.strideBuFlag.sortNo}`,
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={+(rows.expenseBuId !== rows.receiverBuId)}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        pageFieldJsonList.transferFlag.visibleFlag && {
          title: `${pageFieldJsonList.transferFlag.displayName}`,
          dataIndex: 'transferFlag',
          sortNo: `${pageFieldJsonList.transferFlag.sortNo}`,
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        pageFieldJsonList.buSettlePrice.visibleFlag && {
          title: `${pageFieldJsonList.buSettlePrice.displayName}`,
          dataIndex: 'buSettlePrice',
          sortNo: `${pageFieldJsonList.buSettlePrice.sortNo}`,
          align: 'right',
        },
        pageFieldJsonList.eqvaSalary.visibleFlag && {
          title: `${pageFieldJsonList.eqvaSalary.displayName}`,
          dataIndex: 'eqvaSalary',
          sortNo: `${pageFieldJsonList.eqvaSalary.sortNo}`,
          align: 'right',
        },
        pageFieldJsonList.eqvaQty.visibleFlag && {
          title: `${pageFieldJsonList.eqvaQty.displayName}`,
          dataIndex: 'eqvaQty',
          sortNo: `${pageFieldJsonList.eqvaQty.sortNo}`,
          align: 'right',
        },
        pageFieldJsonList.settledEqva.visibleFlag && {
          title: `${pageFieldJsonList.settledEqva.displayName}`,
          dataIndex: 'settledEqva',
          sortNo: `${pageFieldJsonList.settledEqva.sortNo}`,
          align: 'right',
        },
        pageFieldJsonList.acceptMethod.visibleFlag && {
          title: `${pageFieldJsonList.acceptMethod.displayName}`,
          dataIndex: 'acceptMethodName',
          sortNo: `${pageFieldJsonList.acceptMethod.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.pricingMethod.visibleFlag && {
          title: `${pageFieldJsonList.pricingMethod.displayName}`,
          dataIndex: 'pricingMethodName',
          sortNo: `${pageFieldJsonList.pricingMethod.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.createTime.visibleFlag && {
          title: `${pageFieldJsonList.createTime.displayName}`,
          dataIndex: 'createTime',
          sortNo: `${pageFieldJsonList.createTime.sortNo}`,
          align: 'center',
          render: createTime => formatDT(createTime),
        },
        pageFieldJsonList.taskPackageType.visibleFlag && {
          title: `${pageFieldJsonList.taskPackageType.displayName}`,
          dataIndex: 'taskPackageTypeName',
          sortNo: `${pageFieldJsonList.taskPackageType.sortNo}`,
          align: 'center',
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/task/edit?from=/user/task/list');
          },
        },
        {
          key: 'copy',
          title: '复制',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/task/edit?id=${selectedRowKeys}&mode=copy&from=/user/task/list`);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 只有状态为新建的任务才可以修改
            if (selectedRows[0].taskStatus !== 'CREATE') {
              createMessage({ type: 'warn', description: '只有状态为新建的任务才可以修改。' });
              return;
            }
            router.push(`/user/task/edit?id=${selectedRowKeys}&from=/user/task/list`);
          },
        },
        {
          key: 'originate',
          className: 'tw-btn-info',
          title: '派发',
          loading: false,
          icon: 'upload',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'CREATE') {
              createMessage({ type: 'warn', description: '只有状态为新建的任务才可以派发。' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/checkDist`,
              payload: { reasonId: selectedRowKeys[0], reasonType: 'TASK', id: selectedRowKeys[0] },
            });
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
          icon: 'branches',
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'IN PROCESS',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].taskStatus !== 'IN PROCESS') {
              createMessage({ type: 'warn', description: '只有状态为处理中的任务才可以变更。' });
              return;
            }
            router.push(`/user/task/change?id=${selectedRowKeys[0]}&from=task`);
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
            }).then(() => {
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
              createMessage({ type: 'warn', description: '只能激活暂挂的任务。' });
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
              createMessage({ type: 'warn', description: '只能打开关闭的状态。' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/reopen`,
              payload: {
                id: selectedRowKeys[0],
              },
            });
          },
        },
      ],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // const { dispatch, loading, searchForm, dataSource, total } = this.props;
    const { _udcMap = {}, visible } = this.state;
    const { taskStatus } = _udcMap;
    const { pageConfig } = this.props;
    return (
      <PageHeaderWrapper title="任务列表">
        {taskStatus && pageConfig && <DataTable {...this.getTableProps()} />}
        <EvalCommonModal visible={visible} toggle={() => this.setState({ visible: !visible })} />
      </PageHeaderWrapper>
    );
  }
}

export default TaskList;
