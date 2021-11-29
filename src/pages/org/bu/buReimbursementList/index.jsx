import React from 'react';
import { connect } from 'dva';
import { Checkbox, DatePicker, Input, Modal, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty, all, equals, isNil } from 'ramda';
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

import FieldList from '@/components/layout/FieldList';

const DOMAIN = 'buReimbursementList';
const CREATE = 'CREATE';
const { Field } = FieldList;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
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
@connect(({ loading, buReimbursementList }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  loading,
  ...buReimbursementList, // 代表与该组件相关redux的model
}))
@Form.create()
@mountToTab()
class BuReimbursementList extends React.PureComponent {
  state = {
    procConfig: [],
    visible: false,
    branch: null,
    ids: null,
    apprType: 'account',
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

  // 选择确认调接口
  handleOk = () => {
    const { visible, branch, ids, apprType } = this.state;
    const { dispatch, searchForm } = this.props;
    dispatch({
      type: `${DOMAIN}/rejectedExpense`,
      payload: { ids, type: apprType, branch, queryParams: searchForm },
    });
    this.setState({ branch: null, ids: null, procConfig: [] });
    this.toggleVisible();
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
        {
          title: '是否已分摊',
          dataIndex: 'isEndSharing',
          options: {
            initialValue: searchForm.isEndSharing,
          },
          tag: <Selection.UDC code="ACC:COST_SHARE" placeholder="请选择是否已分摊" />,
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
          title: '是否已分摊',
          dataIndex: 'isEndSharingName',
          align: 'center',
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
          key: 'view',
          className: '',
          title: '费用分摊',
          loading: false,
          hidden: false,
          disabled: false,
          icon: '',
          // eslint-disable-next-line no-dupe-keys
          className: 'tw-btn-primary',
          minSelections: 0,
          // eslint-disable-next-line
          cb: (selectedRowKeys, selectedRows) => {
            if (selectedRowKeys.length === 1) {
              dispatch({ type: `${DOMAIN}/checkReimbursement`, payload: selectedRowKeys[0] }).then(
                response => {
                  if (response.ok) {
                    router.push(
                      `/org/bu/buReimbursementList/create?id=${selectedRowKeys[0]}&mode=create`
                    );
                  } else {
                    createMessage({ type: 'error', description: response.reason || '操作失败' });
                  }
                }
              );
            } else {
              createMessage({ type: 'warn', description: '请选择一条报销单' });
            }
          },
        },
      ],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { visible, procConfig } = this.state;

    return (
      <PageHeaderWrapper title="费用报销">
        <DataTable {...this.getTableProps()} />
        {/* <Modal
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
        </Modal> */}
      </PageHeaderWrapper>
    );
  }
}

export default BuReimbursementList;
