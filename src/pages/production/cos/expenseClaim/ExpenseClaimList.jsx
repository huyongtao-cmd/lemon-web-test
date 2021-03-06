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

  // ??????model???state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // ??????model???????????????
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  // ??????????????????????????????????????????
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
    <SearchFormItem key="expenseNo" fieldKey="expenseNo" label="????????????" fieldType="BaseInput" />,
    <SearchFormItem
      key="chargeClassification"
      label="????????????"
      fieldType="BaseCustomSelect"
      parentKey="CUS:CHARGE_CLASSIFICATION"
      fieldKey="chargeClassification"
    />,
    <SearchFormItem
      key="expenseClaimStatus"
      label="???????????????"
      fieldType="BaseSelect"
      parentKey="COS:EXPENSE_CLAIM_STATUS"
      fieldKey="expenseClaimStatus"
    />,
    <SearchFormItem
      label="????????????"
      fieldKey="expenseDocType"
      key="expenseDocType"
      fieldType="BaseCustomSelect"
      parentKey="CUS:EXPENSE_DOC_TYPE"
    />,
    <SearchFormItem
      label="??????????????????"
      fieldKey="chargeProjectId"
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      parentKey="CUS:PROJECT_CLASS2"
      initialValue={fromQs().chargeProjectId}
    />,
    <SearchFormItem
      label="??????????????????"
      fieldKey="chargeBuId"
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      parentKey="PRO:PROJECT_STATUS"
      initialValue={fromQs().chargeBuId}
    />,
    <SearchFormItem
      label="??????????????????"
      fieldKey="chargeCompany"
      key="chargeCompany"
      fieldType="BaseCustomSelect"
      parentKey="CUS:INTERNAL_COMPANY"
      initialValue={fromQs().chargeCompany}
    />,
    <SearchFormItem
      key="relatedBudgetId"
      label="????????????"
      fieldType="BudgetSimpleSelect"
      fieldKey="relatedBudgetId"
    />,
    <SearchFormItem
      key="expenseClaimResId"
      label="?????????"
      fieldType="ResSimpleSelect"
      fieldKey="expenseClaimResId"
    />,
    <SearchFormItem
      key="createUserId"
      label="?????????"
      fieldType="UserSimpleSelect"
      fieldKey="createUserId"
    />,
    <SearchFormItem
      key="paymentBatch"
      label="???????????????"
      fieldType="BaseInput"
      fieldKey="paymentBatch"
    />,
    <SearchFormItem
      key="createTime"
      label="????????????"
      fieldType="BaseDateRangePicker"
      fieldKey="createTime"
    />,
    <SearchFormItem
      key="paymentDate"
      label="????????????"
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
      message({ type: 'warning', content: '????????????????????????' });
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
    message({ type: 'success', content: '????????????' });
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
        title: '????????????',
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
        title: '???????????????',
        key: 'paymentBatch',
        dataIndex: 'paymentBatch',
      },
      {
        title: '???????????????',
        key: 'expenseClaimStatusDesc',
        dataIndex: 'expenseClaimStatusDesc',
      },
      {
        title: '?????????',
        key: 'expenseClaimResName',
        dataIndex: 'expenseClaimResName',
      },
      {
        title: '????????????',
        key: 'expenseDocTypeDesc',
        dataIndex: 'expenseDocTypeDesc',
      },
      {
        title: '????????????',
        key: 'originalCurrencyAmt',
        dataIndex: 'originalCurrencyAmt',
      },
      {
        title: '????????????',
        key: 'originalCurrencyDesc',
        dataIndex: 'originalCurrencyDesc',
      },
      {
        title: '????????????',
        key: 'paymentAmt',
        dataIndex: 'paymentAmt',
      },
      {
        title: '????????????',
        key: 'paymentCurrencyDesc',
        dataIndex: 'paymentCurrencyDesc',
      },
      {
        title: '????????????',
        key: 'createTime',
        dataIndex: 'createTime',
      },
      {
        title: '????????????',
        key: 'accountingDate',
        dataIndex: 'accountingDate',
      },
      {
        title: '????????????',
        key: 'paymentDate',
        dataIndex: 'paymentDate',
      },
      {
        title: '????????????',
        key: 'chargeClassificationDesc',
        dataIndex: 'chargeClassificationDesc',
      },
      {
        title: '??????????????????',
        key: 'chargeProjectIdDesc',
        dataIndex: 'chargeProjectIdDesc',
      },
      {
        title: '??????????????????',
        key: 'chargeBuIdDesc',
        dataIndex: 'chargeBuIdDesc',
      },
      {
        title: '??????????????????',
        key: 'chargeCompanyDesc',
        dataIndex: 'chargeCompanyDesc',
      },
      {
        title: '????????????',
        key: 'relatedBudgetIdDesc',
        dataIndex: 'relatedBudgetIdDesc',
      },
      {
        title: '????????????',
        key: 'payAccountNo',
        dataIndex: 'payAccountNo',
      },
      {
        title: '?????????',
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
              title: '????????????',
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
                      defaultMessage: '?????????????????????????????????????????????????????????????????????????????????',
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
              title: '????????????',
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
                        '?????????????????????????????????????????????????????????????????????????????????????????????',
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
              title: '????????????',
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
          title="??????????????????"
          visible={payModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="50%"
        >
          <BusinessForm formData={{}} form={null} formMode={formMode} defaultColumnStyle={12}>
            <FormItem
              label="????????????"
              fieldType="BaseDatePicker"
              value={date}
              required
              onChange={value => {
                this.setState({ date: value });
              }}
            />
            <FormItem
              label="????????????"
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
              label="??????"
              fieldKey="holderName"
              fieldType="BaseInput"
              value={holderName}
              disabled
            />
            <FormItem
              label="????????????"
              fieldKey="bankName"
              fieldType="BaseInput"
              value={bankName}
              disabled
            />
            <FormItem
              label="??????????????????"
              fieldKey="bankBranch"
              fieldType="BaseInputTextArea"
              value={bankBranch}
              disabled
            />
          </BusinessForm>

          {/*<FormItem
            label="???????????????"
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
