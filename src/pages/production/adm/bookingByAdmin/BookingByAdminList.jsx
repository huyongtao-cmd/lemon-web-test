import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
// @ts-ignore
import { tripExpenseDetailMyTripListPaging } from '@/services/production/adm/trip/tripApply';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import Link from '@/components/production/basic/Link.tsx';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'bookingByAdminList';

@connect(({ loading, dispatch, bookingByAdminList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...bookingByAdminList,
}))
class BookingByAdminList extends React.PureComponent {
  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    //expectedPaymentDateRange  actualPaymentDateRange createDateRange
    if (params.bookDateRange) {
      [wrappedParam.bookDateFrom, wrappedParam.bookDateTo] = params.bookDateRange;
      delete wrappedParam.bookDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(tripExpenseDetailMyTripListPaging, wrappedParam);
    // const { data } = await outputHandle(purchaseListPaging, wrappedParam);
    return data;
  };

  // 修改model层state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  renderSearchForm = () => [
    <SearchFormItem
      key="bookDateRange"
      fieldType="BaseDateRangePicker"
      label="订票日期"
      fieldKey="bookDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="bookStatus"
      fieldType="BaseSelect"
      label="订票状态"
      fieldKey="bookStatus"
      defaultShow
      advanced
      parentKey="ADM:BOOK_STATUS"
    />,
    <SearchFormItem
      key="tripExpenseStatus"
      fieldType="BaseSelect"
      label="费用状态"
      fieldKey="tripExpenseStatus"
      defaultShow
      advanced
      parentKey="ADM:TRIP_EXPENSE_STATUS"
    />,
    <SearchFormItem
      key="ticketNo"
      fieldType="BaseInput"
      label="订票号"
      fieldKey="ticketNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="ticketBookSite"
      fieldType="BaseCustomSelect"
      label="订票方"
      fieldKey="ticketBookSite"
      defaultShow
      advanced
      parentKey="CUS:TICKET_BOOK_SITE"
    />,
    <SearchFormItem
      key="supplierId"
      fieldType="SupplierSimpleSelect"
      label="供应商"
      fieldKey="supplierId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="relatedDocNo"
      defaultShow
      advanced
      fieldType="BaseInput"
      label="相关单据号"
      fieldKey="relatedDocNo"
    />,
    <SearchFormItem
      key="bookClass1"
      fieldType="BaseCustomSelect"
      label="订票类型1"
      fieldKey="bookClass1"
      defaultShow
      advanced
      parentKey="CUS:BOOK_CLASS1"
    />,
    <SearchFormItem
      key="bookClass2"
      fieldType="BaseCustomSelect"
      label="订票类型2"
      fieldKey="bookClass2"
      defaultShow
      advanced
      parentKey="CUS:BOOK_CLASS2"
    />,
    <SearchFormItem
      key="bookResId"
      fieldType="ResSimpleSelect"
      label="订票人"
      fieldKey="bookResId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="tripResId"
      fieldType="ResSimpleSelect"
      label="出差人"
      fieldKey="tripResId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeCompany"
      fieldType="BaseCustomSelect"
      label="费用承担公司"
      fieldKey="chargeCompany"
      parentKey="CUS:INTERNAL_COMPANY"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeBu"
      fieldType="BuSimpleSelect"
      label="费用承担部门"
      fieldKey="chargeBu"
      defaultShow
      advanced
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '出差申请单',
        dataIndex: 'tripNo',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) =>
          value ? (
            <Link
              twUri={`/workTable/user/myTripApplyDisplay?id=${row.tripApplyId}&mode=DESCRIPTION`}
            >
              {value}
            </Link>
          ) : (
            value
          ),
      },
      {
        title: '费用编号',
        dataIndex: 'tripExpenseNo',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '订票号',
        dataIndex: 'ticketNo',
        ellipsis: true,
      },
      {
        title: '订票状态',
        dataIndex: 'bookStatusDesc',
        // render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)), bookStatus tripExpenseStatus
      },
      {
        title: '费用状态',
        dataIndex: 'tripExpenseStatusDesc',
        ellipsis: true,
      },
      {
        title: '结算单',
        dataIndex: 'tripTicketClaimNo',
        ellipsis: true,
        render: (value, row, index) =>
          value ? (
            <Link
              twUri={`/workTable/adm/tripManagementClaimDisPlay?id=${
                row.tripTicketClaimId
              }&mode=DESCRIPTION`}
            >
              {value}
            </Link>
          ) : (
            value
          ),
      },
      {
        title: '订票方',
        dataIndex: 'ticketBookSiteDesc',
        ellipsis: true,
      },
      {
        title: '供应商',
        dataIndex: 'supplierDesc',
        ellipsis: true,
      },
      {
        title: '订票结果',
        dataIndex: 'bookResultDesc',
        ellipsis: true,
      },
      {
        title: '订票金额',
        dataIndex: 'baseCurrencyBookAmt',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '费用承担部门',
        dataIndex: 'chargeBuName',
        ellipsis: true,
      },
      {
        title: '费用承担公司',
        dataIndex: 'chargeCompanyDesc',
        ellipsis: true,
      },
      {
        title: '订票日期',
        dataIndex: 'bookDateDesc',
        ellipsis: true,
      },
      {
        title: '行政订票单',
        dataIndex: 'ticketBookNo',
        ellipsis: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/adm/bookingByAdminDisplay?id=${
                  row.tripTicketBookingId
                }&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '订票人',
        dataIndex: 'bookResDesc',
        ellipsis: true,
      },
      {
        title: '订票类型1',
        dataIndex: 'bookClass1Name',
        ellipsis: true,
      },
      {
        title: '订票类型2',
        dataIndex: 'bookClass2Name',
        ellipsis: true,
      },
      {
        title: '出差人',
        dataIndex: 'tripResDesc',
        ellipsis: true,
      },
      {
        title: '出差地',
        dataIndex: 'tripCityDesc',
        ellipsis: true,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        ellipsis: true,
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          tableExtraProps={{ scroll: { x: 2400 } }}
          // onAddClick={() => router.push('/workTable/adm/tripManagementClaimDisPlay?mode=EDIT')}
          // deleteData={this.deleteData}
          extraButtons={[
            {
              key: 'paymentRequest',
              title: '申请结算',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                const selectedRowsOne = selectedRows[0];
                const {
                  id,
                  supplierId,
                  chargeCompany,
                  tripApplyId,
                  // bookStatus,
                  // tripExpenseStatus,
                } = selectedRowsOne;

                // 	订票方所对应的供应商必须相同
                // 	订票明细对应的费用明细中费用承担公司必须相同
                if (selectedRows.length > 1) {
                  const filterLength = selectedRows.filter(
                    e =>
                      e.supplierId === supplierId &&
                      e.chargeCompany === chargeCompany &&
                      e.tripApplyId === tripApplyId
                  ).length;
                  if (filterLength !== selectedRows.length) {
                    createMessage({
                      type: 'error',
                      description:
                        '只有同一出差下、相同费用承担公司、相同供应商的订票记录发起结算申请！',
                    });
                    return;
                  }
                }
                // 	订票状态为“已确认”
                if (selectedRows.filter(e => e.bookStatus !== 'CONFIRM').length > 0) {
                  createMessage({
                    type: 'error',
                    description: '只有订票状态为“已确认”的明细才能结算！',
                  });
                  return;
                }

                //计算付款计划之和 当作原币币种的初始值
                const baseCurrencyBookTotalAmt = selectedRows
                  .map(e => e.baseCurrencyBookAmt)
                  .reduce((a, b) => a + b, 0);

                const paymentPlanDetails = [];
                const date = new Date();
                const today = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate();
                selectedRows.forEach(e => {
                  const temp = {};
                  temp.ticketBookSite = e.ticketBookSite;
                  temp.tripExpenseId = e.tripExpenseId;
                  temp.supplierId = e.supplierId;
                  temp.chargeCompany = e.chargeCompany;
                  temp.temName = e.ticketNo;
                  temp.unitPrice = e.baseCurrencyBookAmt;
                  temp.amt = e.baseCurrencyBookAmt;
                  temp.deliveryDate = e.bookDateDesc;
                  temp.abNo = e.abNo;
                  temp.remark = e.bookClass1Name + '-' + e.bookClass2Name + '-' + e.bookResDesc;
                  temp.tripTicketClaimName = e.ticketBookSiteDesc + '-' + today + '结算';
                  temp.tripExpenseId = e.tripExpenseId;
                  temp.tripTicketBookingId = e.tripTicketBookingId;
                  paymentPlanDetails.push(temp);
                });

                this.updateModelState({
                  selectedRows: paymentPlanDetails,
                  baseCurrencyBookTotalAmt,
                });
                router.push(
                  `/workTable/adm/tripManagementClaimDisPlay?mode=EDIT&from=bookingByAdminList&refresh=${new Date().getTime()}`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length === 0;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default BookingByAdminList;
