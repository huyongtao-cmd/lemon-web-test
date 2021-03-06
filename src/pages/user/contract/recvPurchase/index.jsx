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
          title: '????????????',
          dataIndex: 'purchaseContract',
          options: {
            initialValue: searchForm.purchaseContract,
          },
          tag: <Input placeholder="???????????????????????????" />,
        },
        {
          title: '?????????',
          dataIndex: 'supplierId',
          options: {
            initialValue: searchForm.supplierId,
          },
          tag: <Selection source={() => selectSupplier()} placeholder="?????????????????????" />,
        },
        {
          title: '?????????',
          dataIndex: 'payNo',
          options: {
            initialValue: searchForm.payNo,
          },
          tag: <Input placeholder="?????????" />,
        },
        {
          title: '??????????????????',
          dataIndex: 'salesContract',
          options: {
            initialValue: searchForm.salesContract,
          },
          tag: <Input placeholder="???????????????????????????" />,
        },
        {
          title: '??????',
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: <Selection source={() => selectCust()} placeholder="???????????????" />,
        },
        {
          title: '??????BU',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '????????????',
          dataIndex: 'payStatus',
          options: {
            initialValue: searchForm.payStatus,
          },
          tag: <Selection.UDC code="ACC.PAY_STATUS" placeholder="?????????????????????" />,
        },
      ],
      columns: [
        {
          title: '???????????????',
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
          title: '??????????????????',
          dataIndex: 'purchaseContractName',
          width: 200,
        },
        {
          title: '?????????',
          dataIndex: 'payNo',
          className: 'text-center',
          width: 150,
        },
        {
          title: '????????????',
          dataIndex: 'phaseDesc',
          width: 100,
        },
        {
          title: '??????????????????',
          dataIndex: 'planPayDate',
          width: 100,
          render: (value, row, index) => formatDT(value),
        },
        {
          title: '?????????',
          dataIndex: 'supplierName',
          className: 'text-center',
          width: 250,
        },
        {
          title: '??????BU',
          dataIndex: 'deliBuName',
          className: 'text-center',
          width: 150,
        },
        {
          title: '????????????',
          dataIndex: 'projectManager',
          width: 100,
        },
        {
          title: '??????????????????',
          dataIndex: 'salesContractName',
          width: 200,
        },
        {
          title: '??????',
          dataIndex: 'custName',
          className: 'text-center',
          width: 200,
        },
        {
          title: '??????????????????',
          dataIndex: 'payAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '??????????????????',
          dataIndex: 'payRatio',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value ? `${value}%` : undefined),
        },
        {
          title: '??????',
          dataIndex: 'taxRate',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value ? `${value}%` : undefined),
        },
        {
          title: '????????????????????????',
          dataIndex: 'actualPayAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '?????????????????????',
          dataIndex: 'unPayAmt',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => {
            const { payAmt, actualPayAmt } = row;
            return sub(payAmt || 0, actualPayAmt || 0);
          },
        },
        {
          title: '????????????',
          dataIndex: 'payStatusDesc',
          className: 'text-center',
          width: 100,
        },
        // {
        //   title: 'apprStatusName',
        //   dataIndex: '????????????',
        //   width: 100,
        // },
        // {
        //   title: 'actualPayDate',
        //   dataIndex: '???????????????',
        //   width: 100,
        //   render: (value, row, index) => formatDT(value),
        // },
        // {
        //   title: 'planStatusName',
        //   dataIndex: '????????????',
        //   width: 100,
        // },
        // {
        //   title: 'remark',
        //   dataIndex: '??????',
        //   width: 100,
        //   render: (value, row, index) => <pre>{value}</pre>,
        // },
        // {
        //   title: 'phaseNo',
        //   dataIndex: '???????????????',
        //   width: 100,
        // },
      ],
      leftButtons: [
        {
          key: 'request',
          icon: 'money-collect',
          className: 'tw-btn-info',
          title: '??????????????????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createAlert.info({
              content: '????????????????????????',
            });
          },
        },
        {
          key: 'money',
          icon: 'dollar',
          className: 'tw-btn-info',
          title: '???????????????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createAlert.info({
              content: '????????????????????????',
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '??????' }),
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
