import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import { expenseClaimListPaging, expenseClaimLogicalDelete } from '@/services/production/cos';
import { expenseQuotaFindQuotas } from '@/services/workbench/reimQuotaMgmt';
import router from 'umi/router';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { remindString } from '@/components/production/basic/Remind.tsx';

const DOMAIN = 'expenseClaimList';

const docTypeMap = {
  REGULAR: 'regular',
  WELFARE: 'welfare',
  TRIP: 'trip',
  LOAN: 'loan',
  OTHERS: 'special',
};

@connect(({ loading, dispatch, expenseClaimList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...expenseClaimList,
}))
class MyExpenseClaimList extends React.PureComponent {
  fetchData = async params => {
    const wrappedParam = { ...params, myFlag: true };
    if (params.createTime) {
      [wrappedParam.createTimeStart, wrappedParam.createTimeEnd] = params.createTime;
      delete wrappedParam.createTime;
    }
    if (params.paymentDate) {
      [wrappedParam.paymentDateStart, wrappedParam.paymentDateEnd] = params.paymentDate;
      delete wrappedParam.paymentDate;
    }
    const { data } = await outputHandle(expenseClaimListPaging, wrappedParam);
    return data;
  };

  deleteData = async (keys, rows) => {
    if (keys.length !== 1) {
      message({ type: 'error', content: '请选择一条数据删除!' });
      return Promise.reject();
    }
    if (rows[0].expenseClaimStatus !== 'CREATE') {
      message({ type: 'error', content: '只能删除创建状态数据!' });
      return Promise.reject();
    }
    return outputHandle(expenseClaimLogicalDelete, { keys: keys.join(',') }, undefined, false);
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
    <SearchFormItem key="expenseNo" fieldKey="expenseNo" label="报销单号" fieldType="BaseInput" />,
    <SearchFormItem
      key="createTime"
      label="创建日期"
      fieldType="BaseDateRangePicker"
      fieldKey="createTime"
    />,
    <SearchFormItem
      key="paymentDate"
      label="付款日期"
      fieldType="BaseDateRangePicker"
      fieldKey="paymentDate"
    />,
    <SearchFormItem
      key="chargeClassification"
      label="费用归属"
      fieldType="BaseCustomSelect"
      parentKey="CUS:CHARGE_CLASSIFICATION"
      fieldKey="chargeClassification"
    />,
    <SearchFormItem
      key="expenseClaimStatus"
      label="报销单状态"
      fieldType="BaseSelect"
      parentKey="COS:EXPENSE_CLAIM_STATUS"
      fieldKey="expenseClaimStatus"
    />,
    <SearchFormItem
      label="单据类型"
      fieldKey="expenseDocType"
      key="expenseDocType"
      fieldType="BaseCustomSelect"
      parentKey="CUS:EXPENSE_DOC_TYPE"
    />,
    <SearchFormItem
      label="费用承担项目"
      fieldKey="chargeProjectId"
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      parentKey="CUS:PROJECT_CLASS2"
    />,
    <SearchFormItem
      label="费用承担部门"
      fieldKey="chargeBuId"
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      parentKey="PRO:PROJECT_STATUS"
    />,
    <SearchFormItem
      label="费用承担公司"
      fieldKey="chargeCompany"
      key="chargeCompany"
      fieldType="BaseUdcSelect"
      udcCode="CUS:INTERNAL_COMPANY"
    />,
    <SearchFormItem
      key="relatedBudgetId"
      label="相关预算"
      fieldType="BudgetSimpleSelect"
      fieldKey="relatedBudgetId"
    />,
    <SearchFormItem
      key="expenseClaimResId"
      label="报销人"
      fieldType="ResSimpleSelect"
      fieldKey="expenseClaimResId"
    />,
    <SearchFormItem
      key="paymentBatch"
      label="付款批次号"
      fieldType="BaseInput"
      fieldKey="paymentBatch"
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '报销单号',
        key: 'expenseNo',
        dataIndex: 'expenseNo',
        sorter: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(
                row.expenseDocType === 'OTHERS'
                  ? `/plat/othersExpense/othersExpenseApply?id=${row.id}&mode=DESCRIPTION`
                  : `/workTable/cos/${docTypeMap[row.expenseDocType]}ExpenseDisplay?id=${
                      row.id
                    }&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '付款批次号',
        key: 'paymentBatch',
        dataIndex: 'paymentBatch',
      },
      {
        title: '报销单状态',
        key: 'expenseClaimStatusDesc',
        dataIndex: 'expenseClaimStatusDesc',
      },
      {
        title: '报销人',
        key: 'expenseClaimResName',
        dataIndex: 'expenseClaimResName',
      },
      {
        title: '单据类型',
        key: 'expenseDocTypeDesc',
        dataIndex: 'expenseDocTypeDesc',
      },
      {
        title: '报销金额',
        key: 'originalCurrencyAmt',
        dataIndex: 'originalCurrencyAmt',
      },
      {
        title: '报销币种',
        key: 'originalCurrencyDesc',
        dataIndex: 'originalCurrencyDesc',
      },
      {
        title: '支付金额',
        key: 'paymentAmt',
        dataIndex: 'paymentAmt',
      },
      {
        title: '支付币种',
        key: 'paymentCurrencyDesc',
        dataIndex: 'paymentCurrencyDesc',
      },
      {
        title: '创建日期',
        key: 'createTime',
        dataIndex: 'createTime',
      },
      {
        title: '记账日期',
        key: 'accountingDate',
        dataIndex: 'accountingDate',
      },
      {
        title: '付款日期',
        key: 'paymentDate',
        dataIndex: 'paymentDate',
      },
      {
        title: '费用归属',
        key: 'chargeClassificationDesc',
        dataIndex: 'chargeClassificationDesc',
      },
      {
        title: '费用承担项目',
        key: 'chargeProjectIdDesc',
        dataIndex: 'chargeProjectIdDesc',
      },
      {
        title: '费用承担部门',
        key: 'chargeBuIdDesc',
        dataIndex: 'chargeBuIdDesc',
      },
      {
        title: '费用承担公司',
        key: 'chargeCompanyDesc',
        dataIndex: 'chargeCompanyDesc',
      },
      {
        title: '相关预算',
        key: 'relatedBudgetIdDesc',
        dataIndex: 'relatedBudgetIdDesc',
      },
      {
        title: '创建人',
        key: 'createUserName',
        dataIndex: 'createUserName',
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          fetchData={this.fetchData}
          columns={columns}
          tableExtraProps={{
            scroll: {
              x: 2400,
            },
          }}
          onEditClick={data => {
            if (data.expenseClaimStatus === 'CREATE') {
              if (data.expenseDocType === 'OTHERS') {
                router.push(`/plat/othersExpense/othersExpenseApply?id=${data.id}&mode=EDIT`);
              } else {
                router.push(
                  `/workTable/cos/${docTypeMap[data.expenseDocType]}ExpenseDisplay?id=${
                    data.id
                  }&mode=EDIT`
                );
              }
            } else {
              message({ type: 'error', content: '只有新建状态可以修改！' });
            }
          }}
          deleteData={this.deleteData}
          extraButtons={
            [
              // {
              //   key: 'revoke',
              //   title: '撤回',
              //   type: 'primary',
              //   size: 'large',
              //   loading: false,
              //   cb: internalState => {
              //     const { selectedRowKeys, selectedRows } = internalState;
              //     console.log(selectedRowKeys)
              //   },
              //   disabled: internalState => {
              //     const { selectedRowKeys } = internalState;
              //     return selectedRowKeys.length !== 1;
              //   },
              // },
            ]
          }
        />
      </PageWrapper>
    );
  }
}

export default MyExpenseClaimList;
