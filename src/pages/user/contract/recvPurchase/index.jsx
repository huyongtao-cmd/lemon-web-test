import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { Switch, Tag, Input, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { createAlert } from '@/components/core/Confirm';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { Selection, BuVersion } from '@/pages/gen/field';
import { selectCust, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'recvPurchasePlan';

@connect(({ loading, recvPurchasePlan }) => ({
  loading,
  recvPurchasePlan,
}))
@mountToTab()
class PurchasePlan extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC', disabled: undefined });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
      },
    });
  };

  render() {
    const { loading, recvPurchasePlan, dispatch } = this.props;
    const { list, total, searchForm } = recvPurchasePlan;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      scroll: {
        x: 2250,
      },
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '采购合同',
          dataIndex: 'purchaseContract',
          options: {
            initialValue: searchForm.purchaseContract,
          },
          tag: <Input placeholder="采购合同编号或名称" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierId',
          options: {
            initialValue: searchForm.supplierId,
          },
          tag: <Selection source={() => selectSupplier()} placeholder="请选择供应商号" />,
        },
        {
          title: '付款号',
          dataIndex: 'payNo',
          options: {
            initialValue: searchForm.payNo,
          },
          tag: <Input placeholder="付款号" />,
        },
        {
          title: '相关销售合同',
          dataIndex: 'salesContract',
          options: {
            initialValue: searchForm.salesContract,
          },
          tag: <Input placeholder="销售合同编号或名称" />,
        },
        {
          title: '客户',
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: <Selection source={() => selectCust()} placeholder="请选择客户" />,
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
          title: '付款状态',
          dataIndex: 'payStatus',
          options: {
            initialValue: searchForm.payStatus,
          },
          tag: <Selection.UDC code="ACC.PAY_STATUS" placeholder="请选择付款状态" />,
        },
      ],
      columns: [
        {
          title: '采购合同号',
          dataIndex: 'purchaseContractNo',
          className: 'text-center',
          width: 200,
          render: (value, row, index) => {
            const href = `/sale/contract/purchasesDetail?pcontractId=${row.pcontractId}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '采购合同名称',
          dataIndex: 'purchaseContractName',
          width: 200,
        },
        {
          title: '付款号',
          dataIndex: 'payNo',
          className: 'text-center',
          width: 150,
        },
        {
          title: '付款阶段',
          dataIndex: 'phaseDesc',
          width: 100,
        },
        {
          title: '预计付款日期',
          dataIndex: 'planPayDate',
          width: 100,
          render: (value, row, index) => formatDT(value),
        },
        {
          title: '供应商',
          dataIndex: 'supplierName',
          className: 'text-center',
          width: 250,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          className: 'text-center',
          width: 150,
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          width: 100,
        },
        {
          title: '相关销售合同',
          dataIndex: 'salesContractName',
          width: 200,
        },
        {
          title: '客户',
          dataIndex: 'custName',
          className: 'text-center',
          width: 200,
        },
        {
          title: '当期付款金额',
          dataIndex: 'payAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '当期付款比例',
          dataIndex: 'payRatio',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value ? `${value}%` : undefined),
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value ? `${value}%` : undefined),
        },
        {
          title: '当期实际付款金额',
          dataIndex: 'actualPayAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '当期未付款金额',
          dataIndex: 'unPayAmt',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => {
            const { payAmt, actualPayAmt } = row;
            return sub(payAmt || 0, actualPayAmt || 0);
          },
        },
        {
          title: '付款状态',
          dataIndex: 'payStatusDesc',
          className: 'text-center',
          width: 100,
        },
        // {
        //   title: 'apprStatusName',
        //   dataIndex: '审批状态',
        //   width: 100,
        // },
        // {
        //   title: 'actualPayDate',
        //   dataIndex: '实际付款日',
        //   width: 100,
        //   render: (value, row, index) => formatDT(value),
        // },
        // {
        //   title: 'planStatusName',
        //   dataIndex: '计划状态',
        //   width: 100,
        // },
        // {
        //   title: 'remark',
        //   dataIndex: '备注',
        //   width: 100,
        //   render: (value, row, index) => <pre>{value}</pre>,
        // },
        // {
        //   title: 'phaseNo',
        //   dataIndex: '付款阶段号',
        //   width: 100,
        // },
      ],
      leftButtons: [
        {
          key: 'request',
          icon: 'money-collect',
          className: 'tw-btn-info',
          title: '发起付款申请',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createAlert.info({
              content: '该功能尚未开发。',
            });
          },
        },
        {
          key: 'money',
          icon: 'dollar',
          className: 'tw-btn-info',
          title: '发起预付款',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createAlert.info({
              content: '该功能尚未开发。',
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: selectedRowKeys.join(','),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PurchasePlan;
