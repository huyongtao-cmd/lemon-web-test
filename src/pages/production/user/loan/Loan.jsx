import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
// @ts-ignore
import { loanListPaging } from '@/services/production/user';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import FormItem from '@/components/production/business/FormItem.tsx';

const DOMAIN = 'Loan';

@connect(({ loading, dispatch, Loan }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...Loan,
}))
class Loan extends React.PureComponent {
  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    //paymentAmtRange  expectedPaymentDateRange  actualPaymentDateRange
    if (params.createTimeRange) {
      [wrappedParam.createTimeFrom, wrappedParam.createTimeTo] = params.createTimeRange;
      delete wrappedParam.createTimeRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(loanListPaging, wrappedParam);
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
      key="loanNo"
      fieldType="BaseInput"
      label="借款单号"
      fieldKey="loanNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeClassification"
      fieldType="BaseCustomSelect"
      label="费用归属"
      fieldKey="chargeClassification"
      parentKey="CUS:CHARGE_CLASSIFICATION"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="loanResId"
      fieldType="ResSimpleSelect"
      label="借款人"
      fieldKey="loanResId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="loanResBuId"
      fieldType="BuSimpleSelect"
      label="借款人部门"
      fieldKey="loanResBuId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="loanBrief"
      fieldType="BaseInput"
      label="借款简述"
      fieldKey="loanBrief"
      defaultShow
      advanced
      parentKey="PUR:PAYMENT_STATUS"
    />,

    <SearchFormItem
      key="loanType"
      fieldType="BaseCustomSelect"
      label="借款类型"
      fieldKey="loanType"
      parentKey="COS:LOAN_APPLY:TYPE"
      defaultShow
    />,

    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="费用承担项目"
      fieldKey="chargeProjectId"
      defaultShow
    />,

    <SearchFormItem
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      label="费用承担部门"
      fieldKey="chargeBuId"
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
    />,
    <SearchFormItem
      key="relatedBudgetId"
      fieldType="BudgetSimpleSelect"
      label="相关预算"
      fieldKey="relatedBudgetId"
      defaultShow
    />,
    <SearchFormItem
      key="baseCurrencyAmt"
      fieldType="BaseInputAmt"
      label="本币金额"
      fieldKey="baseCurrencyAmt"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="loanStatus"
      fieldType="BaseSelect"
      label="状态"
      fieldKey="loanStatus"
      parentKey="COS:LOAN_APPLY:STATUS"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="createUserId"
      defaultShow
      advanced
      fieldType="UserSimpleSelect"
      label="创建人"
      fieldKey="createUserId"
    />,
    <SearchFormItem
      key="createTimeRange"
      fieldType="BaseDateRangePicker"
      label="创建日期"
      fieldKey="createTimeRange"
      defaultShow
    />,
  ];

  render() {
    const { form, formData, ...rest } = this.props;

    const columns = [
      {
        title: '借款单号',
        dataIndex: 'loanNo',
        ellipsis: true,
        render: (value, row) => (
          <Link
            onClick={() => router.push(`/workTable/cos/loanDisplay?id=${row.id}&mode=DESCRIPTION`)}
          >
            {value}
          </Link>
        ),
      },
      {
        title: '费用归属',
        dataIndex: 'chargeClassificationDesc',
        ellipsis: true,
      },
      {
        title: '借款人',
        dataIndex: 'loanResIdDesc',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '借款人部门',
        dataIndex: 'loanResBuIdDesc',
        ellipsis: true,
      },
      {
        title: '借款简述',
        dataIndex: 'loanBrief',
        ellipsis: true,
      },
      {
        title: '借款类型',
        dataIndex: 'loanTypeDesc',
        ellipsis: true,
      },
      {
        title: '费用承担项目',
        dataIndex: 'chargeProjectIdDesc',
        ellipsis: true,
      },
      {
        title: '费用承担部门',
        dataIndex: 'chargeBuIdDesc',
        ellipsis: true,
      },
      {
        title: '费用承担公司',
        dataIndex: 'chargeCompanyDesc',
        ellipsis: true,
      },
      {
        title: '相关预算',
        dataIndex: 'relatedBudgetIdDesc',
        ellipsis: true,
      },
      {
        title: '本币金额',
        dataIndex: 'baseCurrencyAmt',
        align: 'right',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '状态',
        dataIndex: 'loanStatusDesc',
        ellipsis: true,
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        ellipsis: true,
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
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
          // extraButtons={[
          //   {
          //     key: 'paymentRequest',
          //     title: '申请付款',
          //     type: 'info',
          //     size: 'large',
          //     loading: false,
          //     cb: internalState => {
          //       router.push(
          //         `/workTable/pur/paymentRequestDisplayPage?mode=EDIT&from=paymentPlayList`
          //       );
          //     },
          //     disabled: internalState => {
          //       const { selectedRowKeys } = internalState;
          //       return selectedRowKeys.length === 0;
          //     },
          //   },
          // ]}
        />
      </PageWrapper>
    );
  }
}

export default Loan;
