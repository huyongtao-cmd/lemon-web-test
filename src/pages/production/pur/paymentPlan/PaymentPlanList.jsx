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
  paymentPlanListPaging,
  paymentPlanDetail,
  findPaymentRequestIdByIds,
  purchasePartialModify,
} from '@/services/production/pur';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'paymentPlanList';

@connect(({ loading, dispatch, paymentPlanList, paymentRequestDisplayPage }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...paymentPlanList,
  ...paymentRequestDisplayPage,
}))
class PaymentPlanList extends React.PureComponent {
  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    //paymentAmtRange  expectedPaymentDateRange  actualPaymentDateRange
    if (params.expectedPaymentDateRange) {
      [
        wrappedParam.expectedPaymentDateFrom,
        wrappedParam.expectedPaymentDateTo,
      ] = params.expectedPaymentDateRange;
      delete wrappedParam.expectedPaymentDateRange;
    }
    if (params.actualPaymentDateRange) {
      [
        wrappedParam.actualPaymentDateFrom,
        wrappedParam.actualPaymentDateTo,
      ] = params.actualPaymentDateRange;
      delete wrappedParam.actualPaymentDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(paymentPlanListPaging, wrappedParam);
    return data;
  };

  paymentPlanDetail = async params => {
    const { data } = await outputHandle(paymentPlanDetail, params);
    return data;
  };

  findPaymentRequestIdByIds = async params => {
    const { ids } = params;
    const { data } = await outputHandle(findPaymentRequestIdByIds, { keys: ids.join(',') });
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
      key="poNameOrNo"
      fieldType="BaseInput"
      label="采购单编号/名称"
      fieldKey="poNameOrNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="paymentOrderNo"
      fieldType="BaseInput"
      label="付款申请单号"
      fieldKey="paymentOrderNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="paymentStageOrNo"
      fieldType="BaseInput"
      label="付款计划编号/名称"
      fieldKey="paymentStageOrNo"
      defaultShow
      advanced
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
      key="paymentStatus"
      fieldType="BaseSelect"
      label="付款计划状态"
      fieldKey="paymentStatus"
      defaultShow
      advanced
      parentKey="PUR:PAYMENT_STATUS"
    />,

    <SearchFormItem
      key="paymentAmtFrom"
      fieldType="BaseInputAmt"
      label="付款金额起"
      fieldKey="paymentAmtFrom"
      defaultShow
    />,

    <SearchFormItem
      key="paymentAmtTo"
      fieldType="BaseInputAmt"
      label="付款金额止"
      fieldKey="paymentAmtTo"
      defaultShow
    />,

    <SearchFormItem
      key="originalCurrency"
      fieldType="BaseSelect"
      label="原币币种"
      fieldKey="originalCurrency"
      defaultShow
      advanced
      parentKey="COMMON_CURRENCY"
    />,
    <SearchFormItem
      key="expectedPaymentDateFrom"
      fieldType="BaseDateRangePicker"
      label="预计付款日期"
      fieldKey="expectedPaymentDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="actualPaymentDateFrom"
      fieldType="BaseDateRangePicker"
      label="实际付款日期"
      fieldKey="actualPaymentDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="费用承担项目"
      fieldKey="chargeProjectId"
      defaultShow
      advanced
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
      defaultShow
      advanced
      fieldType="BaseCustomSelect"
      label="费用承担公司"
      fieldKey="chargeCompany"
      parentKey="CUS:INTERNAL_COMPANY"
    />,
    <SearchFormItem
      key="inchargeResId"
      fieldType="ResSimpleSelect"
      label="采购负责人"
      fieldKey="inchargeResId"
      defaultShow
    />,
  ];

  render() {
    const { form, formData, ...rest } = this.props;

    const columns = [
      {
        title: '付款计划编号',
        dataIndex: 'paymentPlanNo',
        ellipsis: true,
      },
      {
        title: '采购单编号',
        dataIndex: 'poNo',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/pur/purchaseDisplayPage?id=${row.poId}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '采购单名称',
        dataIndex: 'poName',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '供应商',
        dataIndex: 'supplierName',
        ellipsis: true,
      },
      {
        title: '付款阶段',
        dataIndex: 'paymentStage',
        ellipsis: true,
      },
      {
        title: '付款金额',
        dataIndex: 'paymentAmt',
        align: 'right',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '预计付款日期',
        dataIndex: 'expectedPaymentDate',
        ellipsis: true,
      },
      {
        title: '付款状态',
        dataIndex: 'paymentStatusDesc',
        ellipsis: true,
      },
      {
        title: '预算项目',
        dataIndex: 'relatedBudgetName',
        ellipsis: true,
      },
      {
        title: '会计科目',
        dataIndex: 'finAccSubjName',
        ellipsis: true,
      },
      {
        title: '采购币种',
        dataIndex: 'originalCurrencyDesc',
        ellipsis: true,
      },
      {
        title: '实际付款日期',
        dataIndex: 'actualPaymentDate',
        ellipsis: true,
      },
      {
        title: '已付款金额',
        dataIndex: 'paymentReceivedAmt',
        align: 'right',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '付款申请单号',
        dataIndex: 'paymentOrderNo',
        ellipsis: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/pur/paymentRequestDisplayPage?id=${
                  row.paymentRequestId
                }&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '申请单状态',
        dataIndex: 'paymentRequestStatusDesc',
        ellipsis: true,
      },
      {
        title: '采购负责人',
        dataIndex: 'inchargeResName',
        ellipsis: true,
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
        title: '费用承担项目',
        dataIndex: 'chargeProjectName',
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
          extraButtons={[
            {
              key: 'paymentRequest',
              title: '申请付款',
              type: 'info',
              size: 'large',
              loading: false,
              cb: async internalState => {
                //临时写法 判断付款申请页面是否打开
                if (formData.paymentPlanDetails.length > 0) {
                  createMessage({ type: 'info', description: '请先关闭已打开的付款申请页面！' });
                  return;
                }
                const { selectedRows } = internalState;
                const selectedRowsOne = selectedRows[0];
                const {
                  supplierId,
                  supplierName,
                  chargeProjectId,
                  chargeBuId,
                  chargeCompany,
                  originalCurrency,
                  poName,
                  paymentStage,
                  poId,
                  relatedBudgetId,
                  expectedPaymentDate,
                } = selectedRowsOne;
                //付款单名称按以下规则生成默认值 只选中了一行付款计划，则名称默认值为“采购单名称-付款阶段名称”
                let paymentRequestName = poName + '-' + paymentStage;
                let minExpectedPaymentDate = new Date(expectedPaymentDate);
                let minExpectedPayment = expectedPaymentDate;
                //只有状态为“未付款”的付款计划，才能发起付款申请（PUR:E:UNPAID_CHECK）
                if (selectedRows.filter(e => e.paymentStatus !== 'UNPAID').length > 0) {
                  message({
                    type: 'error',
                    content: '只有状态为“未付款”的付款计划，才能发起付款申请！',
                  });
                  return;
                }

                if (selectedRows.length > 1) {
                  //只有供应商、费用承担项目、费用承担部门、费用承担公司、采购币种都相同的付款计划
                  const filterLength = selectedRows.filter(
                    e =>
                      e.supplierId === supplierId &&
                      e.chargeProjectId === chargeProjectId &&
                      e.relatedBudgetId === relatedBudgetId &&
                      e.chargeBuId === chargeBuId &&
                      e.chargeCompany === chargeCompany &&
                      e.originalCurrency === originalCurrency
                  ).length;
                  if (filterLength !== selectedRows.length) {
                    message({
                      type: 'error',
                      content:
                        '请选择供应商、费用承担项目、相关预算、费用承担部门、费用承担公司、采购币种都相同的付款计划！',
                    });
                    return;
                  }

                  //付款单名称按以下规则生成默认值
                  const date = new Date();
                  date.setTime(date.getTime());
                  const today =
                    date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate();
                  if (selectedRows.filter(e => e.poId !== poId).length > 0) {
                    //如果选中了多行付款计划，且不来自同一采购单，则名称默认值为“供应商名称-付款申请日期”
                    paymentRequestName = supplierName + '-' + today;
                  } else {
                    //如果选中了多行付款计划，且都来自同一采购单，则名称默认值为“采购单名称--付款申请日期”
                    paymentRequestName = poName + '-' + today;
                  }

                  //如果所关联付款计划的“预计付款日期”都大于当前系统日期，则将最小的“预计付款日期”作为 “期望付款日期”字段的默认值
                  selectedRows.forEach(e => {
                    //let minExpectedPaymentDate = new Date(expectedPaymentDate);
                    const expectedPaymentDateTemp = new Date(e.expectedPaymentDate);
                    if (minExpectedPaymentDate > expectedPaymentDateTemp) {
                      minExpectedPaymentDate = expectedPaymentDateTemp;
                      minExpectedPayment = e.expectedPaymentDate;
                    }
                  });
                }

                const ids = [];
                selectedRows.forEach((item, index) => {
                  const selectedRow = selectedRows[index];
                  const { id } = selectedRow;
                  ids.push(id);
                });
                const data = await this.findPaymentRequestIdByIds({ ids });
                if (data > 0) {
                  message({ type: 'error', content: '选择的付款计划已生成过付款申请单！' });
                  return;
                }

                const toDay = new Date();
                if (minExpectedPaymentDate < toDay) {
                  // minExpectedPayment = toDay.getFullYear() + '-' + (toDay.getMonth() + 1) + '-' + toDay.getDate();
                  minExpectedPayment = '';
                }

                //计算付款计划之和 当作原币币种的初始值
                const paymentTotalAmt = selectedRows
                  .map(e => e.paymentAmt)
                  .reduce((a, b) => a + b, 0);
                this.updateModelState({
                  selectedRows,
                  paymentTotalAmt,
                  paymentRequestName,
                  minExpectedPayment,
                });
                router.push(
                  `/workTable/pur/paymentRequestDisplayPage?mode=EDIT&from=paymentPlayList`
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

export default PaymentPlanList;
