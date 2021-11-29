import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, DatePicker } from 'antd';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, BuVersion } from '@/pages/gen/field';

import { mountToTab } from '@/layouts/routerControl';
import { selectCust } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'recvContract';
const { RangePicker } = DatePicker;
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, recvContract, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  recvContract,
}))
@mountToTab()
class RecvContract extends PureComponent {
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'recvNo', sortDirection: 'DESC' });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const parm = {
      ...params,
      expectRecvDate: null,
      invDate: null,
      actualRecvDate: null,
      ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...parm } });
  };

  render() {
    const {
      dispatch,
      loading,
      recvContract: { recvPlanList, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: 2800,
      },
      dataSource: recvPlanList,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        const filter = allValues;
        switch (Object.keys(changedValues)[0]) {
          case 'expectRecvDate':
            filter.expectRecvDateStart = formatDT(changedValues.expectRecvDate[0]);
            filter.expectRecvDateEnd = formatDT(changedValues.expectRecvDate[1]);
            break;
          case 'invDate':
            filter.invDateStart = formatDT(changedValues.invDate[0]);
            filter.invDateEnd = formatDT(changedValues.invDate[1]);
            break;
          case 'actualRecvDate':
            filter.actualRecvDateStart = formatDT(changedValues.actualRecvDate[0]);
            filter.actualRecvDateEnd = formatDT(changedValues.actualRecvDate[1]);
            break;
          default:
            break;
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: filter,
        });
      },
      leftButtons: [
        {
          key: 'invBatchApply',
          title: '申请开票',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows.filter(item => !!item.invbatchId).length > 0) {
              const batchNos =
                '【' +
                selectedRows
                  .filter(item => !!item.batchNo)
                  .map(value => value.batchNo)
                  .join(',') +
                '】';
              createMessage({
                type: 'warn',
                description: '不能重复申请开票！已申请开票的开票批次号：' + batchNos,
              });
              return;
            }
            const { custId, ouId } = selectedRows[0];
            let status = true;
            selectedRows.map(v => {
              if (v.recvStatus !== '1') {
                status = false;
              }
              return void 0;
            });
            if (!status) {
              createMessage({ type: 'warn', description: '只可对"未收款"的收款计划发起申请开票' });
              return;
            }
            const sameCustId = selectedRows.filter(v => v.custId !== custId).length; // 客户不同的条数
            const sameOuId = selectedRows.filter(v => v.ouId !== ouId).length; // 公司不同的条数
            const invoiceAmt = selectedRows.filter(v => !!v.invAmt).length; // 已开票合同条数
            if (sameCustId) {
              createMessage({ type: 'warn', description: '只能勾选同一个客户进行开票' });
              return;
            }
            if (sameOuId) {
              createMessage({ type: 'warn', description: '不同公司的合同，不能一起开票' });
              return;
            }
            if (invoiceAmt) {
              createMessage({ type: 'warn', description: '勾选项包含已开票合同，不允许重复开票' });
              return;
            }
            const uniqueSubContractNo = Array.from(
              new Set(selectedRows.map(row => row.contractNo))
            );
            if (uniqueSubContractNo.length > 1) {
              createMessage({ type: 'warn', description: '不同的子合同，不能一块申请开票' });
            } else {
              router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
            }
          },
        },
        // {
        //   key: 'distInfo',
        //   title: '收益分配',
        //   className: 'tw-btn-info',
        //   icon: 'money-collect',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     // （1）收款状态为“部分收款”/“已全额收款”  -> recvStatus 为 '2' 或 '3'
        //     const unStatisfiedStatus = selectedRows.filter(
        //       ({ recvStatus }) => `${recvStatus}` !== '2' && `${recvStatus}` !== '3'
        //     );
        //     if (!isEmpty(unStatisfiedStatus)) {
        //       createMessage({
        //         type: 'warn',
        //         description: '只能勾选收款状态为“部分收款”/“已全额收款”',
        //       });
        //       return;
        //     }
        //     // （2）可以基于一个/多个收款计划发起  -> minSelections: 1
        //     // （3）子合同状态为“暂挂”/“激活”/“关闭” -> contractStatus 为 '3' '4' '5'
        //     const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
        //       const toStr = `${contractStatus}`;
        //       return toStr !== 'PENDING' && toStr !== 'ACTIVE' && toStr !== 'CLOSE';
        //     });
        //     if (!isEmpty(unStatisfiedContractStatus)) {
        //       createMessage({
        //         type: 'warn',
        //         description: '只能勾选子合同状态为“暂挂”/“激活”/“关闭”',
        //       });
        //       return;
        //     }
        //     // （4）收款计划中新增”已分配收入“和“可分配收入”字段，基于“可分配收入“的金额计算出收益分配数额，“可分配收入”金额必须有值才可以发起
        //     router.push(`/sale/contract/recvContract/distInfo?ids=${selectedRowKeys.join(',')}`);
        //   },
        // },
      ],
      searchBarForm: [
        {
          title: '客户名称',
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: <Selection source={() => selectCust()} placeholder="请选择客户名称" />,
        },
        {
          title: '子合同号',
          dataIndex: 'subContractNo',
          options: {
            initialValue: searchForm.subContractNo,
          },
          tag: <Input placeholder="请输入子合同号" />,
        },
        {
          title: '子合同名称',
          dataIndex: 'subContractName',
          options: {
            initialValue: searchForm.subContractName,
          },
          tag: <Input placeholder="请输入子合同名称" />,
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
          options: {
            initialValue: searchForm.mainContractName,
          },
          tag: <Input placeholder="请输入主合同名称" />,
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          options: {
            initialValue: searchForm.userdefinedNo,
          },
          tag: <Input placeholder="请输入参考合同号" />,
        },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder="请输入收款账号" />,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '销售人员',
          dataIndex: 'salesManResId',
          options: {
            initialValue: searchForm.salesManResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择销售人员"
              showSearch
            />
          ),
        },
        {
          title: 'BU负责人',
          dataIndex: 'deliBuResId',
          options: {
            initialValue: searchForm.deliBuResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择BU负责人"
              showSearch
            />
          ),
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResId',
          options: {
            initialValue: searchForm.pmoResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择子合同PMO"
              showSearch
            />
          ),
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          options: {
            initialValue: searchForm.recvStatus,
          },
          tag: <Selection.UDC code="ACC.RECV_STATUS" placeholder="请选择收款状态" />,
        },
        {
          title: '预期收款日期',
          dataIndex: 'expectRecvDate',
          options: {
            initialValue: searchForm.expectRecvDate,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        {
          title: '开票日期',
          dataIndex: 'invDate',
          options: {
            initialValue: searchForm.invDate,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        {
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          options: {
            initialValue: searchForm.actualRecvDate,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
      ],
      columns: [
        {
          title: '客户名',
          dataIndex: 'custName',
          width: 200,
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
          // width: 200,
        },
        {
          title: '子合同号',
          dataIndex: 'contractNo',
          align: 'center',
          width: 150,
          sorter: true,
          render: (value, row, index) => {
            const href = `/sale/contract/salesSubDetail?mainId=${row.mainContractId}&id=${
              row.contractId
            }`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '子合同名称',
          dataIndex: 'contractName',
          sorter: true,
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          width: 120,
          sorter: true,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          align: 'center',
          width: 100,
          sorter: true,
          render: (value, row, index) => row.recvStatusDesc,
        },
        {
          title: '开票状态',
          dataIndex: 'batchStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          sorter: true,
          width: 100,
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          sorter: true,
          width: 100,
          align: 'center',
        },
        {
          title: '销售人员',
          dataIndex: 'salesManResName',
          width: 100,
          // align: 'center',
        },
        {
          title: 'BU负责人',
          dataIndex: 'deliBuResName',
          width: 100,
          // align: 'center',
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResName',
          width: 100,
          // align: 'center',
        },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          // align: 'center',
          width: 120,
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          // width: 100,
          align: 'center',
        },
        {
          title: '当期收款金额',
          dataIndex: 'recvAmt',
          align: 'right',
          width: 120,
          sorter: true,
        },
        {
          title: '当期收款比例 %',
          dataIndex: 'recvRatio',
          align: 'right',
          width: 120,
          sorter: true,
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          width: 130,
          sorter: true,
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          align: 'right',
          width: 80,
          sorter: true,
        },
        {
          title: '开票日期',
          dataIndex: 'invDate',
          width: 130,
          sorter: true,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'right',
          width: 100,
          sorter: true,
        },
        {
          title: '未开票金额',
          dataIndex: 'unInvAmt',
          align: 'right',
          width: 100,
          sorter: true,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'right',
          width: 100,
          sorter: true,
        },
        {
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          width: 130,
          sorter: true,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'right',
          width: 100,
          sorter: true,
        },
        {
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          align: 'right',
          width: 100,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="收款计划列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default RecvContract;
