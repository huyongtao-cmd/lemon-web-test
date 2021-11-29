import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import {
  tripManagementClaimListPaging,
  tripManagementClaimLogicalDelete,
} from '@/services/production/adm/trip/tripApply';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { remindString } from '@/components/production/basic/Remind.tsx';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import { purchaseListPaging, purchaseLogicalDelete } from '@/services/production/pur';

const DOMAIN = 'tripManagementClaimList';

@connect(({ loading, dispatch, tripManagementClaimList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...tripManagementClaimList,
}))
class TripManagementClaimList extends React.PureComponent {
  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    //expectedPaymentDateRange  actualPaymentDateRange createDateRange
    if (params.applyDateRange) {
      [wrappedParam.applyDateFrom, wrappedParam.applyDateTo] = params.applyDateRange;
      delete wrappedParam.applyDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(tripManagementClaimListPaging, wrappedParam);
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

  deleteData = async keys =>
    outputHandle(tripManagementClaimLogicalDelete, { keys: keys.join(',') }, undefined, false);

  renderSearchForm = () => [
    <SearchFormItem
      key="tripTicketClaimNoOrName"
      fieldType="BaseInput"
      label="结算单号/名称"
      fieldKey="tripTicketClaimNoOrName"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="applyDateRange"
      fieldType="BaseDateRangePicker"
      label="申请日期"
      fieldKey="applyDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="applyStatus"
      fieldType="BaseSelect"
      label="申请状态"
      fieldKey="applyStatus"
      defaultShow
      advanced
      parentKey="COM:APPLY_STATUS"
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
      key="applyResId"
      fieldType="ResSimpleSelect"
      label="申请人"
      fieldKey="applyResId"
      defaultShow
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '结算单号',
        dataIndex: 'tripTicketClaimNo',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/adm/tripManagementClaimDisPlay?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '结算单名称',
        dataIndex: 'tripTicketClaimName',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '订票方',
        dataIndex: 'ticketBookSiteDesc',
        ellipsis: true,
      },
      {
        title: '结算金额(本位币)',
        dataIndex: 'baseCurrencyClaimAmt',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '申请状态',
        dataIndex: 'applyStatusDesc',
        ellipsis: true,
      },
      {
        title: '供应商',
        dataIndex: 'supplierName',
        ellipsis: true,
      },
      {
        title: '申请人',
        dataIndex: 'applyResName',
        ellipsis: true,
      },
      {
        title: '申请日期',
        dataIndex: 'applyDate',
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
          // tableExtraProps={{ scroll: { x: 2400 } }}
          // onAddClick={() => router.push('/workTable/pur/purchaseDisplayPage?mode=EDIT')}
          onEditClick={data => {
            console.log(data);
            if (data.applyStatus === 'CREATE') {
              router.push(`/workTable/adm/tripManagementClaimDisPlay?id=${data.id}&mode=EDIT`);
            } else {
              message({
                type: 'error',
                content: remindString({
                  remindCode: 'COM:E:ALLOW_MODIFY_CHECK',
                  defaultMessage: '仅“新建”状态允许修改',
                }),
              });
            }
          }}
          deleteData={this.deleteData}
        />
      </PageWrapper>
    );
  }
}

export default TripManagementClaimList;
