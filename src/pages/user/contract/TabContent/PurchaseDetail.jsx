import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider } from 'antd';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { div, mul } from '@/utils/mathUtils';

const DOMAIN = 'userContractPurchasesTab';

@connect(({ loading, dispatch, userContractPurchasesTab, userContractEditSub }) => ({
  dispatch,
  loading,
  userContractPurchasesTab,
  userContractEditSub,
}))
@mountToTab()
class Purchase extends PureComponent {
  state = {
    formData: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        subContractId: id,
      },
    });
  }

  handleLook = row => {
    const { dispatch } = this.props;
    if (row.id) {
      dispatch({
        type: `${DOMAIN}/queryRecvPurList`,
        payload: row.id,
      });
      this.setState({
        formData: row,
      });
    }
  };

  render() {
    const {
      dispatch,
      loading,
      userContractPurchasesTab: { dataSource, total, list },
      userContractEditSub: { pageConfig },
    } = this.props;
    const { formData } = this.state;
    const { mainId, id } = fromQs();

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 2) {
      return <div />;
    }

    let pageFieldView = [];
    let payView = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_PUR') {
        pageFieldView = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_PUR_PAY') {
        payView = block.pageFieldViews;
      }
    });

    const pageFieldJson = {};
    const payJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    payView.forEach(field => {
      payJson[field.fieldKey] = field;
    });

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      showColumn: false,
      showExport: false,
      total,
      rowKey: 'id',
      showSearch: false,
      enableSelection: false,
      dataSource,
      leftButtons: [
        // {
        //   key: 'view',
        //   title: '查看付款计划',
        //   className: 'tw-btn-primary',
        //   icon: 'eye',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.handleLook(selectedRows[0]);
        //   },
        // },
      ],
      columns: [
        {
          title: '新旧采购合同',
          key: 'orderFlag',
          dataIndex: 'orderFlag',
          align: 'center',
        },
        {
          title: '采购合同编号',
          key: 'contractNo',
          dataIndex: 'contractNo',
          align: 'center',
          render: (value, rowData) => {
            if (rowData.orderFlag === '旧') {
              const href = `/sale/contract/purchasesDetail?pid=${
                rowData.id
              }&sourceUrl=/sale/contract/editSub&mainId=${mainId}&purchasesId=${id}`;
              return (
                <Link className="tw-link" to={href}>
                  {value}
                </Link>
              );
            }
            // 新采购合同
            const href = `/sale/purchaseContract/Detail?id=${
              rowData.id
            }&pageMode=purchase&from=CONTRACT`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '采购名称',
          key: 'contractName',
          dataIndex: 'contractName',
        },
        {
          title: '含税金额',
          key: 'amt',
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '税率(%)',
          key: 'taxRate',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '采购BU',
          key: 'purchaseBuId',
          dataIndex: 'purchaseBuName',
        },
        {
          title: '供应商',
          key: 'supplierId',
          dataIndex: 'supplierName',
        },
        {
          title: '采购大类',
          key: 'purchaseType1',
          dataIndex: 'purchaseType1Desc',
          align: 'center',
        },
        {
          title: '采购小类',
          key: 'purchaseType2',
          dataIndex: 'purchaseType2Desc',
          align: 'center',
        },
        {
          title: '平台合同类型',
          key: 'platType',
          dataIndex: 'platTypeDesc',
          align: 'center',
        },
        {
          title: '采购产品',
          key: 'productName',
          dataIndex: 'productName',
        },
        {
          title: '采购内容简述',
          key: 'briefDesc',
          dataIndex: 'briefDesc',
        },
        {
          title: '签约日期',
          key: 'signDate',
          dataIndex: 'signDate',
          align: 'center',
          sorter: true,
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

    const recvPurTableProps = {
      columnsCache: DOMAIN,
      rowKey: 'id',
      showSearch: false,
      loading: loading.effects[`${DOMAIN}/queryRecvPurList`],
      dataSource: list,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      columns: [
        {
          title: '行号',
          dataIndex: 'lineNo',
          className: 'text-center',
          width: 100,
          render: (value, record, index) => (value === -1 ? '合计' : value),
        },
        {
          title: '付款阶段号',
          dataIndex: 'stage',
          className: 'text-center',
          width: 200,
          render: (value, record, index) =>
            value === -1 ? undefined : `${formData.contractNo}-${record.lineNo}`,
        },
        {
          title: '付款阶段名称',
          dataIndex: 'phaseDesc',
          width: 200,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当期付款金额',
          dataIndex: 'payAmt',
          className: 'text-right',
          width: 200,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当期付款比例',
          dataIndex: 'payRatio',
          className: 'text-right',
          width: 200,
          render: (value, row, index) =>
            value === -1
              ? undefined
              : `${mul(div(row.payAmt || 1, formData.amt || 1), 100).toFixed(2)}%`,
        },
        {
          title: '预计付款日期',
          dataIndex: 'planPayDate',
          width: 150,
          render: (value, row, index) => (value === -1 ? undefined : formatDT(value)),
        },
        {
          title: '付款状态',
          dataIndex: 'payStatusDesc',
          className: 'text-center',
          width: 150,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value === -1 ? undefined : `${value}%`),
        },
        {
          title: '当期实际付款金额',
          dataIndex: 'actualPayAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '当期未付金额',
          dataIndex: 'unPayAmt',
          className: 'text-right',
          width: 100,
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <div className="tw-card-title">采购合同列表</div>
        <DataTable {...tableProps} />
        {!isEmpty(formData) && (
          <div>
            <Divider dashed />
            <div className="tw-card-title">付款计划列表</div>
            <DataTable {...recvPurTableProps} />
          </div>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default Purchase;
