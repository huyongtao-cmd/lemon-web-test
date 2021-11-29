import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Input } from 'antd';
import { UdcSelect } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'userContractGathering';

@connect(({ dispath, loading, userContractGathering, userContractEditSub }) => ({
  dispath,
  loading,
  userContractGathering,
  userContractEditSub,
}))
@mountToTab()
class Gathering extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: {
          recvNo: null,
          recvStatus: null,
        },
      },
    });
    this.fetchData({ contractId: id });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        contractId: id,
        ...params,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userContractGathering: { dataList, searchForm, total },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 3) {
      return <div />;
    }

    let pageFieldView = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_RECV') {
        pageFieldView = block.pageFieldViews;
      }
    });

    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      rowKey: 'id',
      sortBy: 'recvNo',
      sortDirection: 'DESC',
      // showSearch: false,
      showCopy: false,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dataList,
      searchForm,
      total,
      // enableSelection: false,
      scroll: {
        x: 2100,
        // y: 450,
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
        {
          title: '收款号',
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder="请输入收款号" />,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          options: {
            initialValue: searchForm.recvStatus,
          },
          tag: <UdcSelect code="ACC.RECV_STATUS" placeholder="请选择收款状态" />,
        },
      ],
      leftButtons: [
        {
          key: 'invoice',
          title: '申请开票',
          className: 'tw-btn-info',
          // icon: 'form',
          loading: false,
          hidden: false,
          minSelections: 2,
          disabled: row => {
            let bool = false;
            row.forEach(v => {
              if (!(!v.batchStatus || v.batchStatus === '1' || v.batchStatus === '5')) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const invoiceAmt = selectedRows.filter(v => !!v.invAmt).length; // 已开票合同条数
            if (invoiceAmt) {
              createMessage({ type: 'error', description: '勾选项包含已开票合同，不允许重复开票' });
              return;
            }
            // 签约公司与客户都相同
            router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
          },
        },
      ],
      columns: [
        {
          title: '收款号',
          key: 'recvNo',
          dataIndex: 'recvNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '收款阶段',
          key: 'phaseDesc',
          dataIndex: 'phaseDesc',
        },
        {
          title: '当期收款金额',
          key: 'recvAmt',
          dataIndex: 'recvAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '当期收款比例 %',
          key: 'recvRatio',
          dataIndex: 'recvRatio',
          sorter: true,
          align: 'right',
          render: value => (value ? `${value * 100}%` : '0%'),
        },
        {
          title: '预计收款日',
          key: 'expectRecvDate',
          dataIndex: 'expectRecvDate',
          sorter: true,
          render: value => formatDT(value, 'YYYY-MM-DD'),
        },
        {
          title: '收款状态',
          key: 'recvStatus',
          dataIndex: 'recvStatusDesc',
          align: 'center',
        },
        {
          title: '开票状态',
          key: 'batchStatusDesc',
          dataIndex: 'batchStatusDesc',
          align: 'center',
        },
        {
          title: '税率',
          key: 'taxRate',
          dataIndex: 'taxRate',
          sorter: true,
          align: 'right',
        },
        {
          title: '开票日期',
          key: 'invDate',
          dataIndex: 'invDate',
          sorter: true,
        },
        {
          title: '已开票金额',
          key: 'invAmt',
          dataIndex: 'invAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '未开票金额',
          key: 'unInvAmt',
          dataIndex: 'unInvAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '已收款金额',
          key: 'actualRecvAmt',
          dataIndex: 'actualRecvAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '实际收款日期',
          key: 'actualRecvDate',
          dataIndex: 'actualRecvDate',
          sorter: true,
        },
        {
          title: '未收款金额',
          key: 'unRecvAmt',
          dataIndex: 'unRecvAmt',
          align: 'right',
          sorter: true,
        },
        {
          title: '已确认金额',
          key: 'confiremedAmt',
          dataIndex: 'confirmedAmt',
          align: 'right',
        },
        {
          title: '确认收入日期',
          key: 'confirmDate',
          dataIndex: 'confirmDate',
          align: 'center',
        },
      ]
        .filter(
          col => !col.key || (pageFieldJson[col.key] && pageFieldJson[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJson[col.key].displayName,
          sortNo: pageFieldJson[col.key].sortNo,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return <DataTable {...tableProps} />;
  }
}

export default Gathering;
