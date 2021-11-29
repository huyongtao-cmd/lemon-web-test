import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Form, Input, Upload, Select, Button, DatePicker } from 'antd';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import { selectCustomer } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectOus, selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'invBatchesList';
const { RangePicker } = DatePicker;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, invBatchesList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  invBatchesList,
}))
@mountToTab()
class invBatchesList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData();
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const parm = {
      ...params,
      expectRecvDate: null,
      batchDate: null,
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...parm } });
  };

  render() {
    const {
      dispatch,
      loading,
      invBatchesList: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      total,
      scroll: {
        x: '150%',
      },
      rowKey: record => `${record.id}-${record.planId}-${record.invId}`,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        const filter = allValues;
        switch (Object.keys(changedValues)[0]) {
          case 'batchDate':
            filter.batchDateStart = formatDT(changedValues.batchDate[0]);
            filter.batchDateEnd = formatDT(changedValues.batchDate[1]);
            break;
          case 'expectRecvDate':
            filter.expectRecvDateStart = formatDT(changedValues.expectRecvDate[0]);
            filter.expectRecvDateEnd = formatDT(changedValues.expectRecvDate[1]);
            break;
          default:
            break;
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: filter,
        });
      },
      searchBarForm: [
        {
          title: '开票批次号',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="请输入批次号" />,
        },
        {
          title: '批次状态',
          dataIndex: 'batchStatus',
          options: {
            initialValue: searchForm.batchStatus,
          },
          tag: <Selection.UDC code="ACC.INVBATCH_STATUS" placeholder="请选择批次状态" />,
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          options: {
            initialValue: searchForm.invNo,
          },
          tag: <Input placeholder="请输入发票号" />,
        },
        {
          title: '发票抬头',
          dataIndex: 'invTitle',
          options: {
            initialValue: searchForm.invTitle,
          },
          tag: <Input placeholder="请输入发票抬头" />,
        },
        {
          title: '客户名称',
          dataIndex: 'custId',
          // options: {
          //   initialValue: searchForm.custName,
          // },
          tag: (
            <Selection
              source={() => selectCustomer()}
              placeholder="请选择客户名称"
              transfer={{ key: 'id', code: 'id', name: 'name' }}
            />
          ),
        },
        {
          title: '主合同名称',
          dataIndex: 'contractName',
          options: {
            initialValue: searchForm.contractName,
          },
          tag: <Input placeholder="请输入主合同名称" />,
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
          title: '子合同号',
          dataIndex: 'subContractNo',
          options: {
            initialValue: searchForm.subContractNo,
          },
          tag: <Input placeholder="请输入子合同号" />,
        },
        {
          title: '预期开票日期',
          dataIndex: 'batchDate',
          options: {
            initialValue: searchForm.batchDate,
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
          title: '预计收款日期',
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
          title: '逾期天数',
          dataIndex: 'overDays',
          options: {
            initialValue: searchForm.overDays,
          },
          tag: <Input placeholder="请输入逾期天数" />,
        },
        {
          title: '开票主体', // TODO: 国际化
          dataIndex: 'ouId',
          tag: <Selection source={() => selectOus()} placeholder="请选择开票主体" />,
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
              placeholder="请选择PMO"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { custId, id, batchStatus } = selectedRows[0];
            if (batchStatus === '1' || batchStatus === '5') {
              router.push(`/sale/contract/invBatches/edit?id=${id}&from=/sale/contract/invBatches`); // &custId=${custId}
            } else {
              createMessage({ type: 'error', description: '发票批次已经审批或收款中，不能再修改' });
            }
          },
        },

        {
          key: 'reback',
          title: '发起退票',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            let flag = true;
            if (
              selectedRows.length === 1 &&
              selectedRows[0].batchStatusDesc === '已开票待收款' &&
              selectedRows[0].apprStatus === 'APPROVED'
            ) {
              flag = false;
            } else {
              flag = true;
            }
            return flag;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { custId, id, batchStatus, batchStatusDesc } = selectedRows[0];
            if (batchStatus === '4') {
              router.push(
                `/plat/saleRece/invBatch/edit?id=${id}&from=/sale/contract/invBatches&status=${batchStatus}`
              );
            }
          },
        },
      ],
      columns: [
        {
          title: '开票批次号',
          dataIndex: 'batchNo',
          key: 'batchNo',
          align: 'center',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sale/contract/invBatches/detail?id=${id}&from=/sale/contract/invBatches`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '开票主体',
          dataIndex: 'ouName',
          sorter: true,
          key: 'ouName',
        },
        {
          title: '批次状态',
          dataIndex: 'batchStatusDesc',
          align: 'center',
          key: 'batchStatusDesc',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
          key: 'createUserName',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
        },
        {
          title: '客户名',
          dataIndex: 'custName',
          align: 'center',
          key: 'custName',
        },
        {
          title: '主合同名',
          dataIndex: 'mianContractName',
          key: 'mianContractName',
        },
        {
          title: '子合同号',
          dataIndex: 'subContractNo',
          sorter: true,
          align: 'center',
          key: 'subContractNo',
        },
        {
          title: '子合同名',
          dataIndex: 'subContractName',
          key: 'subContractName',
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          key: 'userdefinedNo',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          align: 'center',
          key: 'projectManager',
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          align: 'center',
          sorter: true,
          key: 'invNo',
        },
        {
          title: '快递号',
          dataIndex: 'deliveryNo',
          align: 'center',
          sorter: true,
          key: 'deliveryNo',
        },
        {
          title: '发票抬头',
          dataIndex: 'invTitle',
          align: 'center',
          key: 'invTitle',
        },
        {
          title: '开票日期',
          dataIndex: 'batchDate',
          sorter: true,
          key: 'batchDate',
        },
        {
          title: '批次开票金额',
          dataIndex: 'invAmt',
          align: 'right',
          sorter: true,
          key: 'invAmt',
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          align: 'center',
          key: 'phaseDesc',
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          sorter: true,
          key: 'expectRecvDate',
        },
        {
          title: '主签约BU',
          dataIndex: 'signBuName',
          align: 'center',
          key: 'signBuName',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          align: 'center',
          key: 'deliBuName',
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResName',
          width: 100,
          // align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="合同开票列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default invBatchesList;
