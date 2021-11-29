import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil, isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import {
  salesInvoiceApplyPgingRq,
  salesInvoiceApplyDeleteRq,
  salesInvoiceApplyPartialRq,
} from '@/services/production/salesInvoice';

const DOMAIN = 'salesInvoice';

@connect(({ loading, dispatch, salesInvoice }) => ({
  loading,
  dispatch,
  ...salesInvoice,
}))
class index extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALES_INVOICE_LIST' },
    });

    // 客户列表
    dispatch({
      type: `${DOMAIN}/getCustomerList`,
    });
  }

  fetchData = async params => {
    const { batchDate, expectedCollectionDate, ...restparams } = params;

    if (Array.isArray(batchDate) && (batchDate[0] || batchDate[1])) {
      [restparams.batchDateStart, restparams.batchDateEnd] = batchDate;
    }

    if (
      Array.isArray(expectedCollectionDate) &&
      (expectedCollectionDate[0] || expectedCollectionDate[1])
    ) {
      [
        restparams.expectedCollectionDateStart,
        restparams.expectedCollectionDateEnd,
      ] = expectedCollectionDate;
    }

    const { response } = await salesInvoiceApplyPgingRq(restparams);
    return { ...response.data, rows: response.data.rows.map(v => ({ ...v, key: genFakeId(-1) })) };
  };

  changeStatus = async parmars => {
    const { response } = await salesInvoiceApplyPartialRq(parmars);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(salesInvoiceApplyDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '开票批次号',
        key: 'batchNo',
        dataIndex: 'batchNo',
        align: 'center',
        render: (value, row) => (
          <Link
            onClick={() => {
              const { id } = row;
              router.push(`/workTable/sale/salesInvoice/detail?id=${id}&mode=DESCRIPTION`);
            }}
          >
            {value}
          </Link>
        ),
      },
      {
        title: '批次状态',
        key: 'batchStatus',
        dataIndex: 'batchStatusDesc',
        align: 'center',
      },
      {
        title: '开票主体',
        key: 'invOu',
        dataIndex: 'invOuDesc',
        align: 'center',
      },
      {
        title: '客户名称',
        key: 'custId',
        dataIndex: 'custIdDesc',
        align: 'center',
      },
      {
        title: '销售单编号',
        key: 'soNo',
        dataIndex: 'soNo',
        align: 'center',
      },
      {
        title: '销售单名称',
        key: 'soName',
        dataIndex: 'soName',
        align: 'center',
      },
      {
        title: '参考合同号',
        key: 'refContractNo',
        dataIndex: 'refContractNo',
        align: 'center',
      },
      {
        title: '开票日期',
        key: 'batchDate',
        dataIndex: 'batchDate',
        align: 'center',
      },
      {
        title: '发票号',
        key: 'invNo',
        dataIndex: 'invNo',
        align: 'center',
      },
      {
        title: '开票金额',
        key: 'invAmt',
        dataIndex: 'invAmt',
        align: 'right',
        render: val => (!isNil(val) ? val.toFixed(2) : ''),
      },
      {
        title: '发票抬头',
        key: 'invTitle',
        dataIndex: 'invTitle',
        align: 'center',
      },
      {
        title: '快递单号',
        key: 'deliveryNo',
        dataIndex: 'deliveryNo',
        align: 'center',
      },
      // {
      //   title: '关联收款计划号',
      //   key: 'collectionNo',
      //   dataIndex: 'collectionNo',
      //   align: 'center',
      //   render: (value, row) => {
      //     const { collectionPlanId } = row;
      //     return collectionPlanId ? (
      //       <Link
      //         onClick={() => {
      //           if (collectionPlanId) {
      //             router.push(
      //               `/workTable/sale/collectionPlan/detail?id=${collectionPlanId}&mode=DESCRIPTION`
      //             );
      //           }
      //         }}
      //       >
      //         {value}
      //       </Link>
      //     ) : (
      //       value
      //     );
      //   },
      // },

      {
        title: '预计收款日期',
        key: 'expectedCollectionDate',
        dataIndex: 'expectedCollectionDate',
        align: 'center',
      },
      {
        title: '创建人',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'TABLE_COLUMNS',
      fields
    );

    return fieldsConfig;
  };

  renderSearchForm = () => {
    const { pageConfig, customerList } = this.props;

    const fields = [
      <SearchFormItem
        label="开票批次号"
        key="batchNo"
        fieldKey="batchNo"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="批次状态"
        key="batchStatus"
        fieldKey="batchStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:SALE_INV_BATCH_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="发票号"
        key="invNo"
        fieldKey="invNo"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="发票抬头"
        key="invTitle"
        fieldKey="invTitle"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="客户名称"
        key="custId"
        fieldKey="custId"
        fieldType="BaseSelect"
        descList={customerList}
        defaultShow
      />,
      // <SearchFormItem
      //   label="订单编号/名称"
      //   key="soNOorName"
      //   fieldKey="soNOorName"
      //   fieldType="BaseInput"
      //   defaultShow
      // />,
      <SearchFormItem
        label="开票日期"
        key="batchDate"
        fieldKey="batchDate"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="预计收款日期"
        key="expectedCollectionDate"
        fieldKey="expectedCollectionDate"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="开票主体"
        key="invOu"
        fieldKey="invOu"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  render() {
    const { loading, dispatch, formData, form, formMode, bankList } = this.props;

    const { getInternalState } = this.state;

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          rowKey="key"
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[
            {
              key: 'adjust',
              title: '录入发票详情',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                const { id, batchStatus } = selectedRows[0];
                if (!(batchStatus === 'INVOICED' || batchStatus === 'APPR_FOR_INVOICE')) {
                  createMessage({
                    type: 'warn',
                    description: `只有批次状态为已开票和已批准待开票状态可以录入发票详情！`,
                  });
                  return;
                }
                // 跳转到新增页面
                router.push(`/workTable/sale/salesInvoice/edit?id=${id}&mode=EDIT`);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            // {
            //   key: 'active',
            //   title: '发起退票',
            //   type: 'primary',
            //   size: 'large',
            //   loading: false,
            //   cb: internalState => {
            //     const { selectedRowKeys, selectedRows } = internalState;
            //   },
            //   disabled: internalState => {
            //     const { selectedRowKeys } = internalState;
            //     return selectedRowKeys.length !== 1;
            //   },
            // },
          ]}
          tableExtraProps={{
            scroll: {
              x: 2500,
            },
          }}
        />
      </PageWrapper>
    );
  }
}

export default index;
