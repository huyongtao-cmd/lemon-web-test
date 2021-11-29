import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import {
  expenseClaimListPaging,
  expenseClaimLogicalDelete,
  expenseClaimFinishPay,
} from '@/services/production/cos';
import { accountSelectPaging } from '@/services/production/common/select';
import router from 'umi/router';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { remindString } from '@/components/production/basic/Remind.tsx';
import { Modal } from 'antd';
import FormItem from '@/components/production/business/FormItem.tsx';
import BusinessForm from '@/components/production/business/BusinessForm';
import styles from './style.less';

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
class ExpenseClaimList extends React.PureComponent {
  state = {
    payModalVisible: false,
    payBatchNo: undefined,
    date: moment().format('YYYY-MM-DD'),
    accountList: [],
    payAccountNo: undefined,
    holderName: undefined,
    bankName: undefined,
    bankBranch: undefined,
  };

  constructor(props) {
    super(props);
    const pathParam = fromQs();
    this.setState({ defaultSearchForm: pathParam });
  }

  componentDidMount() {
    // outputHandle(expenseQuotaFindQuotas, [
    //   { busiAccItemId: 5, quotaDimension1Value: 'L2', quotaDimension2Value: '02' },
    // ]).then(data => {
    //   console.log(data);
    // });
  }

  fetchData = async params => {
    const wrappedParam = { ...params };
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

  deleteData = async keys =>
    outputHandle(expenseClaimLogicalDelete, { keys: keys.join(',') }, undefined, false);

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

  // 根据费用承担公司获取银行账号
  fetchAbAccByCompanys = async internalState => {
    const companyCodes = internalState.selectedRows.map(r => r.chargeCompany).join(',');
    const resp = await outputHandle(accountSelectPaging, { companyCodes });
    const { data } = resp;
    const accountList = data.rows.map(item => ({
      ...item,
      value: item.accountNo,
      title: item.accountNo,
    }));
    this.setState({
      accountList,
      payAccountNo: accountList[0]?.accountNo,
      holderName: accountList[0]?.holderName,
      bankName: accountList[0]?.bankName,
      bankBranch: accountList[0]?.bankBranch,
    });
  };

  renderSearchForm = () => [
    <SearchFormItem key="expenseNo" fieldKey="expenseNo" label="报销单号" fieldType="BaseInput" />,
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
      initialValue={fromQs().chargeProjectId}
    />,
    <SearchFormItem
      label="费用承担部门"
      fieldKey="chargeBuId"
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      parentKey="PRO:PROJECT_STATUS"
      initialValue={fromQs().chargeBuId}
    />,
    <SearchFormItem
      label="费用承担公司"
      fieldKey="chargeCompany"
      key="chargeCompany"
      fieldType="BaseCustomSelect"
      parentKey="CUS:INTERNAL_COMPANY"
      initialValue={fromQs().chargeCompany}
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
      key="createUserId"
      label="创建人"
      fieldType="UserSimpleSelect"
      fieldKey="createUserId"
    />,
    <SearchFormItem
      key="paymentBatch"
      label="付款批次号"
      fieldType="BaseInput"
      fieldKey="paymentBatch"
    />,
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
  ];

  handleCancel = () => {
    this.setState({
      payModalVisible: false,
      payAccountNo: undefined,
      holderName: undefined,
      bankName: undefined,
      bankBranch: undefined,
    });
  };

  handleOk = async () => {
    const { date, payBatchNo, getInternalState, payAccountNo } = this.state;
    if (!payAccountNo) {
      message({ type: 'warning', content: '请选择付款账户！' });
      return;
    }
    this.setState({
      payModalVisible: false,
      payAccountNo: undefined,
      holderName: undefined,
      bankName: undefined,
      bankBranch: undefined,
    });
    const keys = getInternalState().selectedRowKeys.join(',');
    await outputHandle(expenseClaimFinishPay, { date, payAccountNo, keys });
    getInternalState().refreshData();
    message({ type: 'success', content: '操作成功' });
  };

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;
    const {
      payModalVisible,
      date,
      payBatchNo,
      accountList,
      payAccountNo,
      holderName,
      bankName,
      bankBranch,
    } = this.state;

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
        title: '付款账户',
        key: 'payAccountNo',
        dataIndex: 'payAccountNo',
      },
      {
        title: '创建人',
        key: 'createUserName',
        dataIndex: 'createUserName',
      },
    ];
    const { defaultSearchForm } = this.state;

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={defaultSearchForm}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          tableExtraProps={{ scroll: { x: true } }}
          fetchData={this.fetchData}
          columns={columns}
          // deleteData={this.deleteData}
          extraButtons={[
            {
              key: 'paymentExport',
              title: '付款导出',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows, refreshData } = internalState;
                const findFalseList = selectedRows.filter(
                  v =>
                    v.expenseClaimStatus !== 'WAITING_TO_PAY' ||
                    (v.paymentBatch && v.paymentBatch.trim().length > 0)
                );
                if (!isEmpty(findFalseList)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: '',
                      defaultMessage: '仅“已通过待付款”状态且未导出的的报销单允许付款导出！',
                    }),
                  });
                  return;
                }
                // eslint-disable-next-line no-restricted-globals
                const url = `${SERVER_URL}/api/production/cos/expenseClaim/payExport?keys=${selectedRowKeys.join(
                  ','
                )}`;
                const net = window.open(url);
                net.addEventListener('beforeunload', e => {
                  refreshData();
                });

                // const myRequest = new Request('http://localhost/api', {method: 'POST', body: '{"foo":"bar"}'});
                //
                // const myURL = myRequest.url; // http://localhost/api
                // const myMethod = myRequest.method; // POST
                // const myCred = myRequest.credentials; // omit
                // const bodyUsed = myRequest.bodyUsed;
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length < 1;
              },
            },
            {
              key: 'completePayment',
              title: '完成付款',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const findFalseList = selectedRows.filter(
                  v =>
                    v.expenseClaimStatus !== 'WAITING_TO_PAY' ||
                    !v.paymentBatch ||
                    v.paymentBatch.trim().length <= 0
                );
                if (!isEmpty(findFalseList)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: '',
                      defaultMessage:
                        '仅“已通过待付款”状态且已生成付款批次号的报销单允许完成付款！',
                    }),
                  });
                  return;
                }
                this.fetchAbAccByCompanys(internalState);
                this.setState({ payModalVisible: true });
                // this.setState({
                //   visible: true,
                // });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length < 1;
              },
            },
            {
              key: 'advancedModification',
              title: '高级修改',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                // router.push(
                //   `/workTable/cos/regularExpenseDisplay?id=${
                //     selectedRowKeys[0]
                //   }&mode=EDIT&currentNode=advanceEdit`
                // );

                router.push(
                  selectedRows[0].expenseDocType === 'OTHERS'
                    ? `/plat/othersExpense/othersExpenseApply?id=${
                        selectedRowKeys[0]
                      }&mode=EDIT&currentNode=advanceEdit`
                    : `/workTable/cos/${
                        docTypeMap[selectedRows[0].expenseDocType]
                      }ExpenseDisplay?id=${selectedRowKeys[0]}&mode=EDIT&currentNode=advanceEdit`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />
        <Modal
          title="付款完成处理"
          visible={payModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="50%"
        >
          <BusinessForm formData={{}} form={null} formMode={formMode} defaultColumnStyle={12}>
            <FormItem
              label="付款日期"
              fieldType="BaseDatePicker"
              value={date}
              required
              onChange={value => {
                this.setState({ date: value });
              }}
            />
            <FormItem
              label="付款账户"
              fieldKey="payAccountNo"
              fieldType="BaseSelect"
              descList={accountList}
              value={payAccountNo}
              required
              onChange={(value, options) => {
                this.setState({
                  payAccountNo: value,
                  holderName: options[0]?.holderName,
                  bankName: options[0]?.bankName,
                  bankBranch: options[0]?.bankBranch,
                });
              }}
            />
            <FormItem
              label="户名"
              fieldKey="holderName"
              fieldType="BaseInput"
              value={holderName}
              disabled
            />
            <FormItem
              label="付款银行"
              fieldKey="bankName"
              fieldType="BaseInput"
              value={bankName}
              disabled
            />
            <FormItem
              label="付款银行网点"
              fieldKey="bankBranch"
              fieldType="BaseInputTextArea"
              value={bankBranch}
              disabled
            />
          </BusinessForm>

          {/*<FormItem
            label="付款批次号"
            fieldType="BaseInput"
            value={payBatchNo}
            onChange={value => {
              this.setState({ payBatchNo: value });
            }}
          />*/}
        </Modal>
      </PageWrapper>
    );
  }
}

export default ExpenseClaimList;
