import React from 'react';
import { connect } from 'dva';
import { Checkbox, DatePicker, Input, Modal, Form, Select, InputNumber, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty, all, equals, isNil } from 'ramda';
import Debounce from 'lodash-decorators/debounce';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { mountToTab } from '@/layouts/routerControl';
import { selectBus } from '@/services/org/bu/bu';
import { Selection } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import { fromQs } from '@/utils/stringUtils';
import { formatDTHM, formatDT } from '@/utils/tempUtils/DateTime';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import ScanBarCode from './ScanBarCode';

import FieldList from '@/components/layout/FieldList';

const DOMAIN = 'userExpenseList';
const CREATE = 'CREATE';
const { Field } = FieldList;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

// 记账审批、退回对应的taskKey
const accountList = [
  'ACC_A12_05_FIN_ACCOUNT',
  'ACC_A13_05_FIN_ACCOUNT',
  'ACC_A24_03_FIN_ACCOUNT',
  'ACC_A25_03_FIN_ACCOUNT',
  'ACC_A27_05_FIN_ACCOUNT',
];
// 出纳审批、退回对应的taskKey
const cashierList = [
  'ACC_A12_06_FIN_CASHIER_CONFIRM',
  'ACC_A13_06_FIN_CASHIER_CONFIRM',
  'ACC_A25_04_FIN_CASHIER',
  'ACC_A27_06_FIN_CASHIER_CONFIRM',

  // 老流程节点暂时审批
  'ACC_A12_05_FIN_CASHIER_CONFIRM',
  'ACC_A13_05_FIN_CASHIER_CONFIRM',
  'ACC_A25_03_FIN_CASHIER',
];

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 费用报销
 */
@connect(({ loading, userExpenseList }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  loading,
  ...userExpenseList, // 代表与该组件相关redux的model
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    const { reimNo } = changedValues;
    if (reimNo) {
      return;
    }
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateState`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class ExpenseList extends React.PureComponent {
  state = {
    procConfig: [],
    visible: false,
    branch: null,
    ids: null,
    apprType: 'account',
    discountVisible: false,
    scanVisible: false,
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
    dispatch({ type: `${DOMAIN}/queryConfig` });
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    // console.log(params);
    const { dispatch } = this.props;
    const param = fromQs();
    // 判断isMy，作为接口参数，请求是否本人的报销
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, isMy: param.isMy || false },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  triggerDiscountVisble = () => {
    const { discountVisible } = this.state;
    this.setState({ discountVisible: !discountVisible });
  };

  discountOk = () => {
    const { dispatch, discount, dataSource, discountReimIds } = this.props;
    if (!discount) {
      createMessage({ type: 'warn', description: '请填写要打折的折扣！' });
      return;
    }
    if (discount < 0) {
      createMessage({ type: 'warn', description: '折扣只能是正数' });
      return;
    }
    this.triggerDiscountVisble();
    dispatch({
      type: `${DOMAIN}/discount`,
      payload: null,
    }).then(response => {
      if (response.ok) {
        createMessage({ type: 'success', description: '打折成功！' });
        // 打折成功后，直接修改前端 调整后金额，不重新加载页面，以加快相应速度
        const newDataSource = dataSource
          .filter(row => discountReimIds.filter(reimid => reimid === row.id).length > 0)
          .map(row => ({
            ...row,
            adjustedAmt: (row.adjustedAmt * discount) / 10, // 前端数值计算会产生小数精度问题，四舍五入后可基本保证正确
          }));
        const oldDateSource = dataSource.filter(
          row => discountReimIds.filter(reimid => reimid === row.id).length <= 0
        );
        const allDateSource = [...oldDateSource, ...newDataSource].sort((r1, r2) => r2.id - r1.id);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: allDateSource,
          },
        });
        // this.fetchData();
      }
    });
  };

  // 选择确认调接口
  handleOk = () => {
    const { visible, branch, ids, apprType } = this.state;
    const { dispatch, searchForm } = this.props;
    dispatch({
      type: `${DOMAIN}/rejectedExpense`,
      payload: { ids, type: apprType, branch, queryParams: searchForm },
    }).then(res => {
      this.setState({ branch: null, ids: null, procConfig: [] });
      this.toggleVisible();
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total, config } = this.props;

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 3300 },
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      searchForm,
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
          title: '报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="报销单号" />,
        },
        {
          title: '流程编号',
          dataIndex: 'procNo',
          options: {
            initialValue: searchForm.procNo,
          },
          tag: <Input placeholder="流程编号" />,
        },
        {
          title: '批次号',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="批次号" />,
        },
        {
          title: '报销申请人',
          dataIndex: 'reimResId',
          options: {
            initialValue: searchForm.reimResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择报销申请人"
              showSearch
            />
          ),
        },
        {
          title: '流程类型',
          dataIndex: 'procKey',
          options: {
            initialValue: searchForm.procKey,
          },
          tag: <Selection.UDC code="ACC:REIM_PROC_KEY" placeholder="请选择流程类型" />,
        },
        {
          title: '当前流程节点',
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
          tag: <Input placeholder="当前流程节点名称" />,
        },

        {
          title: '财务负责人审批',
          dataIndex: 'reimApproveTime',
          options: {
            initialValue: [searchForm.reimApproveTimeStart, searchForm.reimApproveTimeEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '财务记账审批',
          dataIndex: 'reimAccountTime',
          options: {
            initialValue: [searchForm.reimAccountTimeStart, searchForm.reimAccountTimeEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '事由类型',
          dataIndex: 'reasonType',
          options: {
            initialValue: searchForm.reasonType,
          },
          tag: <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" />,
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="事由名称" />,
        },
        {
          title: '发票法人公司',
          dataIndex: 'expenseOuId',
          options: {
            initialValue: searchForm.expenseOuId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择发票法人公司" />,
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1',
          options: {
            initialValue: searchForm.reimType1,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE1" placeholder="请选择报销类型" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <Selection source={() => selectBus()} placeholder="费用承担BU" />,
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2',
          options: {
            initialValue: searchForm.reimType2,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE2" placeholder="请选择费用类型" />,
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.sumBuId,
          },
          tag: <Selection source={() => selectBus()} placeholder="费用归属BU" />,
        },
        {
          title: '报销单状态',
          dataIndex: 'reimStatus',
          options: {
            initialValue: searchForm.reimStatus,
          },
          tag: <Selection.UDC code="ACC:REIM_STATUS" placeholder="报销单状态" />,
        },
        {
          title: '核销状态',
          dataIndex: 'clearStatus',
          options: {
            initialValue: searchForm.clearStatus,
          },
          tag: <Selection.UDC code="ACC:CLEAR_STATUS" placeholder="核销状态" />,
        },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: !!searchForm.allocationFlag,
            valuePropName: 'checked',
          },
          tag: <Checkbox>是</Checkbox>,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: [searchForm.applyDateStart, searchForm.applyDateEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '记账旧批次号',
          dataIndex: 'batchNoLast',
          options: {
            initialValue: searchForm.batchNoLast,
          },
          tag: <Input placeholder="记账旧批次号" />,
        },
      ],
      columns: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          align: 'center',
          render: (value, row, key) => {
            let type;
            switch (row.reimType2) {
              // 差旅报销
              case 'TRIP': {
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              // 专项费用报销
              case 'SPEC': {
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              // 提现付款报销
              case 'WITHDRAW_PAY': {
                type = 'withdrawFlowPay';
                break;
              }
              // 非差旅报销
              default: {
                type = 'normal';
                break;
              }
            }
            return (
              <Link className="tw-link" to={`/plat/expense/${type}/view?id=${row.id}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '流程编号',
          dataIndex: 'procNo',
          align: 'center',
          width: '200',
        },
        {
          title: '批次号',
          dataIndex: 'batchNo',
          align: 'center',
        },
        {
          title: '旧批次号',
          dataIndex: 'batchNoLast',
          align: 'center',
        },
        {
          title: '版本',
          dataIndex: 'versionTag',
          align: 'right',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
          // render: value => formatDT(value),
        },
        {
          title: '报销申请人',
          dataIndex: 'reimResName',
          align: 'center',
        },
        {
          title: '报销费用(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '调整后费用',
          dataIndex: 'adjustedAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '规则检查说明',
          dataIndex: 'ruleExplain',
          align: 'center',
          width: 200,
          render: (value, row, index) =>
            value && value.length > 28 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <pre style={{ color: '#f8ac30' }}>{`${value.substr(0, 28)}...`}</pre>
              </Tooltip>
            ) : (
              <pre style={{ color: '#f8ac30' }}>{value}</pre>
            ),
        },
        {
          title: '单据状态',
          dataIndex: 'reimStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '核销状态',
          dataIndex: 'clearStatusName',
          align: 'center',
        },
        {
          title: '流程类型',
          dataIndex: 'procName',
          align: 'center',
        },
        {
          title: '流程节点名称',
          dataIndex: 'taskName',
          align: 'center',
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
        },
        {
          title: '财务负责人审批时间',
          dataIndex: 'reimApproveTime',
          render: value => formatDTHM(value),
        },
        {
          title: '财务记账审批时间',
          dataIndex: 'reimAccountTime',
          render: value => formatDTHM(value),
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1Name',
          align: 'center',
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2Name',
          align: 'center',
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          align: 'left',
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuName',
          align: 'left',
        },
        // {
        //   title: '费用报销总额',
        //   dataIndex: 'taxedReimAmt',
        //   align: 'right',
        //   // 这个字段，后端在insert的时候，没有初始化为 0
        //   render: value => (value ? value.toFixed(2) : null),
        // },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '是否有票',
          dataIndex: 'hasInv',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '发票法人公司',
          dataIndex: 'expenseOuName',
          align: 'left',
        },
        {
          title: '报销单批次号',
          dataIndex: 'reimBatchNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
      ],
      leftButtons: [
        {
          key: 'batch_export_acc',
          className: 'tw-btn-warning',
          title: '记账导出',
          loading: false,
          hidden: false,
          disabled: false,
          icon: 'warning',
          minSelections: 0,
          // eslint-disable-next-line
          cb: (selectedRowKeys, selectedRows) => {
            return router.push('/plat/expense/account/list');
          },
        },
        {
          key: 'batch_export_pay',
          className: 'tw-btn-warning',
          title: '付款导出',
          loading: false,
          hidden: false,
          disabled: false,
          icon: 'warning',
          minSelections: 0,
          // eslint-disable-next-line
          cb: (selectedRowKeys, selectedRows) => {
            return router.push('/plat/expense/pay/list');
          },
        },
        {
          key: 'scanBarCode',
          className: 'tw-btn-primary',
          icon: 'form',
          title: '扫描报销单',
          loading: false,
          hidden: false,
          // disabled: selectedRows => selectedRows.filter(({ editable }) => !editable).length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.scanVisible();
          },
        },
        {
          key: 'approvedCashier',
          title: '批量待记账审批',
          className: 'tw-btn-success',
          icon: 'check-square',
          loading: false,
          hidden: false, // 没有节点，或节点不属于财务记账中的任何一个
          disabled: selectedRows =>
            selectedRows.filter(
              val => !(val.taskKey && config.map(({ taskKey }) => taskKey).includes(val.taskKey))
            ).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const isSameTaskKey =
              Array.from(new Set(selectedRows.map(({ taskKey }) => taskKey))).length === 1;
            if (!isSameTaskKey) {
              createMessage({ type: 'warn', description: '请选择同一种流程批量审批' });
            } else {
              dispatch({
                type: `${DOMAIN}/approvedExpense`,
                payload: { ids: selectedRowKeys.join(','), type: 'account', queryParams },
              });
            }
          },
        },
        {
          key: 'rejectedCashier',
          title: '批量待记账退回',
          className: 'tw-btn-error',
          icon: 'close-square',
          loading: false,
          hidden: false, // 没有节点，或节点不属于财务记账中的任何一个
          disabled: selectedRows =>
            selectedRows.filter(
              val => !(val.taskKey && config.map(({ taskKey }) => taskKey).includes(val.taskKey))
            ).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const isSameTaskKey =
              Array.from(new Set(selectedRows.map(({ taskKey }) => taskKey))).length === 1;
            const isSameVersionTag =
              Array.from(new Set(selectedRows.map(({ versionTag }) => versionTag))).length === 1;
            if (!all(equals(true), [isSameTaskKey, isSameVersionTag])) {
              createMessage({ type: 'warn', description: '请选择同一种流程同一个版本批量审批' });
            } else {
              /**
               * 费用报销批量审批，退回时拉去退回分支判断调整。
               * 原先是，根据taskKey和versionTag判断。
               * 现在要优化一下，如果根据taskKey和versionTag没有匹配到对应的配置信息，
               * 要在去找versionTag小于本versioinTag的最大的版本号的信息.
               * 这个过程后端完成，赋值在 jsonConfig 这个字段里，不为 null 时即为需要的节点，为 null 说明没有流程或者流程已结束
               */
              const { jsonConfig } = selectedRows[0];
              if (!isNil(jsonConfig)) {
                const btnBranch =
                  ((jsonConfig.buttons || []).find(({ key }) => key === 'REJECTED') || {})
                    .branches || [];
                this.setState({ procConfig: btnBranch, ids: selectedRowKeys.join(',') });
                // 弹出模态框
                this.toggleVisible();
                this.setState({ apprType: 'account' });
              }
            }
          },
        },
        {
          key: 'approvedAccount',
          title: '批量待付款审批',
          className: 'tw-btn-success',
          icon: 'check-square',
          loading: false,
          hidden: false, // 没有节点，或节点不属于财务出纳付款中的任何一个
          disabled: selectedRows =>
            selectedRows.filter(
              val => !(val.taskKey && config.map(({ taskKey }) => taskKey).includes(val.taskKey))
            ).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const isSameTaskKey =
              Array.from(new Set(selectedRows.map(({ taskKey }) => taskKey))).length === 1;
            if (!isSameTaskKey) {
              createMessage({ type: 'warn', description: '请选择同一种流程批量审批' });
            } else {
              dispatch({
                type: `${DOMAIN}/approvedExpense`,
                payload: { ids: selectedRowKeys.join(','), type: 'cashier', queryParams },
              });
            }
          },
        },
        {
          key: 'rejectedAccount',
          title: '批量待付款退回',
          className: 'tw-btn-error',
          icon: 'close-square',
          loading: false,
          hidden: false, // 没有节点，或节点不属于财务出纳付款中的任何一个
          disabled: selectedRows =>
            selectedRows.filter(
              val => !(val.taskKey && config.map(({ taskKey }) => taskKey).includes(val.taskKey))
            ).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const isSameTaskKey =
              Array.from(new Set(selectedRows.map(({ taskKey }) => taskKey))).length === 1;
            const isSameVersionTag =
              Array.from(new Set(selectedRows.map(({ versionTag }) => versionTag))).length === 1;
            if (!all(equals(true), [isSameTaskKey, isSameVersionTag])) {
              createMessage({ type: 'warn', description: '请选择同一种流程同一个版本批量审批' });
            } else {
              /**
               * 费用报销批量审批，退回时拉去退回分支判断调整。
               * 原先是，根据taskKey和versionTag判断。
               * 现在要优化一下，如果根据taskKey和versionTag没有匹配到对应的配置信息，
               * 要在去找versionTag小于本versioinTag的最大的版本号的信息.
               * 这个过程后端完成，赋值在 jsonConfig 这个字段里，不为 null 时即为需要的节点，为 null 说明没有流程或者流程已结束
               */
              const { jsonConfig } = selectedRows[0];
              if (!isNil(jsonConfig)) {
                const btnBranch =
                  ((jsonConfig.buttons || []).find(({ key }) => key === 'REJECTED') || {})
                    .branches || [];
                this.setState({ procConfig: btnBranch, ids: selectedRowKeys.join(',') });
                // 弹出模态框
                this.toggleVisible();
                this.setState({ apprType: 'cashier' });
              }
            }
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false, // selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            // TODO： 根据报销类型：特殊费用，跳转特殊费用报销

            if (selectedRows[0].reimStatus !== CREATE) {
              createMessage({ type: 'warn', description: '仅新建的报销单能够修改' });
              return 0;
            }

            let type = '';
            switch (selectedRows[0].reimType2) {
              case 'TRIP': {
                // 差旅报销
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              case 'SPEC': {
                // 专项费用报销
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              default: {
                // 非差旅报销
                type = 'normal';
                break;
              }
            }

            router.push(
              `/plat/expense/${type}/edit?type=0&id=${
                selectedRowKeys[0]
              }&sourceUrl=/plat/expense/list`
            );
            return 1;
            // router.push(
            //   `/plat/expense/${type}/apply/edit?id=${selectedRowKeys}&feeApplyId=${
            //     selectedRows[0].feeApplyId
            //     }`,
            // );
          },
        },
        {
          key: 'hightEdit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.highUpdate`, desc: '高级修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false, // selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            // TODO： 根据报销类型：特殊费用，跳转特殊费用报销

            let type = '';
            switch (selectedRows[0].reimType2) {
              case 'TRIP': {
                // 差旅报销
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              case 'SPEC': {
                // 专项费用报销
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              default: {
                // 非差旅报销
                type = 'normal';
                break;
              }
            }

            router.push(
              `/plat/expense/${type}/edit?type=1&id=${
                selectedRowKeys[0]
              }&sourceUrl=/plat/expense/list&hightEdit=true`
            );
            return 1;
            // router.push(
            //   `/plat/expense/${type}/apply/edit?id=${selectedRowKeys}&feeApplyId=${
            //     selectedRows[0].feeApplyId
            //     }`,
            // );
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.filter(({ editable }) => !editable).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // editable 为 true 的时候可以删除
            // 万一 rowKey 变了， selectedRowKeys 就不是 id 了
            const ids = selectedRows.map(({ id }) => id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: ids,
            }).then(result => {
              createMessage({
                type: result ? 'success' : 'warn',
                description: result ? '删除成功' : '删除失败',
              });
              result &&
                this.fetchData({
                  ...searchForm,
                  allocationFlag: searchForm.allocationFlag ? 1 : 0,
                  applyDate: undefined,
                  applyDateStart:
                    searchForm.applyDate && searchForm.applyDate[0]
                      ? searchForm.applyDate[0].format('YYYY-MM-DD')
                      : undefined,
                  applyDateEnd:
                    searchForm.applyDate && searchForm.applyDate[1]
                      ? searchForm.applyDate[1].format('YYYY-MM-DD')
                      : undefined,
                });
            });
          },
        },
        {
          key: 'discount',
          className: 'tw-btn-primary',
          icon: 'form',
          title: '打折',
          loading: false,
          hidden: false,
          // disabled: selectedRows => selectedRows.filter(({ editable }) => !editable).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const wrongProc = selectedRows.filter(
              row => !row.procKey || (row.procKey !== 'ACC_A12' && row.procKey !== 'ACC_A13')
            ).length;
            if (wrongProc > 0) {
              createMessage({ type: 'warn', description: '仅非差旅、差旅报销允许打折！' });
              return;
            }
            const wrongTask = selectedRows.filter(
              row => !row.taskKey || row.taskKey.indexOf('FIN_AUDIT_CONFIRM') < 0
            ).length;
            if (wrongTask > 0) {
              createMessage({ type: 'warn', description: '仅财务稽核专员审批节点允许打折！' });
              return;
            }
            // todo 延期的才能打折
            this.triggerDiscountVisble();
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                discountReimIds: selectedRowKeys,
              },
            });
          },
        },
      ],
    };
  };

  scanVisible = () => {
    const { scanVisible } = this.state;
    this.setState({ scanVisible: !scanVisible });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { visible, procConfig, discountVisible, scanVisible } = this.state;

    return (
      <PageHeaderWrapper title="费用报销">
        <DataTable {...this.getTableProps()} />
        <ScanBarCode visible={scanVisible} scanVisible={() => this.scanVisible()} />
        <Modal
          destroyOnClose
          title="退回节点"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            // style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field name="branch" label="退回节点">
              <Select
                onChange={value => {
                  this.setState({ branch: value });
                }}
              >
                {procConfig.length ? ( // 循环渲染出下拉组件
                  procConfig.map(item => (
                    <Select.Option key={item.id} value={item.code}>
                      {item.name}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option key="">空</Select.Option>
                )}
              </Select>
            </Field>
          </FieldList>
        </Modal>
        <Modal
          title="打折"
          onOk={this.discountOk}
          onCancel={this.triggerDiscountVisble}
          visible={discountVisible}
          width="35%"
        >
          <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={1}>
            <Field
              name="discount"
              label="折扣"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请输入折扣',
                  },
                ],
              }}
            >
              <InputNumber
                placeholder="调整后金额=原调整后金额*折扣/10"
                className="x-fill-100"
                addonAfter="折"
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseList;
