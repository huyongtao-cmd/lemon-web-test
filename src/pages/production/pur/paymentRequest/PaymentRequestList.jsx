import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import {
  paymentRequestListPagingUri,
  paymentRequestCompletePayment,
} from '@/services/production/pur';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { remindString } from '@/components/production/basic/Remind.tsx';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import createMessage from '@/components/core/AlertMessage';
import { Modal } from 'antd';
import BusinessErrorHandler from '@/utils/production/BusinessErrorHandler.tsx';
// import FormItem from 'antd/lib/form/FormItem';
import BusinessForm from '@/components/production/business/BusinessForm';
import styles from './index.less';
import { accountSelectPaging } from '@/services/production/common/select';
import FormItem from '@/components/production/business/FormItem.tsx';

const DOMAIN = 'paymentRequestList';

@connect(({ loading, dispatch, paymentRequestList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...paymentRequestList,
}))
class PaymentRequestList extends React.PureComponent {
  state = {
    payModalVisible: false,
    accountList: [],
    payAccountNo: undefined,
    holderName: undefined,
    bankName: undefined,
    bankBranch: undefined,
  };

  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    //expectedPaymentDateRange  actualPaymentDateRange createDateRange
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
    if (params.createDateRange) {
      [wrappedParam.createDateFrom, wrappedParam.createDateTo] = params.createDateRange;
      delete wrappedParam.createDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(paymentRequestListPagingUri, wrappedParam);
    return data;
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
    const { ok, warns } = await outputHandle(paymentRequestCompletePayment, {
      keys,
      payAccountNo,
    });
    if (warns && warns.length > 0) {
      Modal.warn({
        title: '??????',
        content: React.createElement(BusinessErrorHandler, {
          warns,
        }),
        okText: '??????',
      });
    } else {
      message({ type: 'success' });
    }
    getInternalState().refreshData();
    message({ type: 'success', content: '????????????' });
  };

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

  renderSearchForm = () => [
    <SearchFormItem
      key="paymentOrderNameOrNo"
      fieldType="BaseInput"
      label="???????????????/??????"
      fieldKey="paymentOrderNameOrNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="supplierId"
      fieldType="SupplierSimpleSelect"
      label="?????????"
      fieldKey="supplierId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="paymentRequestStatus"
      fieldType="BaseSelect"
      label="??????????????????"
      fieldKey="paymentRequestStatus"
      defaultShow
      advanced
      parentKey="PUR:PAYMENT_REQUEST_STATUS"
    />,
    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="??????????????????"
      fieldKey="chargeProjectId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      label="??????????????????"
      fieldKey="chargeBuId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeCompany"
      defaultShow
      advanced
      fieldType="BaseCustomSelect"
      label="??????????????????"
      fieldKey="chargeCompany"
      parentKey="CUS:INTERNAL_COMPANY"
    />,
    <SearchFormItem
      key="originalCurrency"
      fieldType="BaseSelect"
      label="????????????"
      fieldKey="originalCurrency"
      defaultShow
      advanced
      parentKey="COMMON_CURRENCY"
    />,
    <SearchFormItem
      key="originalCurrencyAmtFrom"
      fieldType="BaseInputAmt"
      label="???????????????"
      fieldKey="originalCurrencyAmtFrom"
      defaultShow
    />,
    <SearchFormItem
      key="originalCurrencyAmtTo"
      fieldType="BaseInputAmt"
      label="???????????????"
      fieldKey="originalCurrencyAmtTo"
      defaultShow
    />,
    <SearchFormItem
      key="expectedPaymentDateRange"
      fieldType="BaseDateRangePicker"
      label="??????????????????"
      fieldKey="expectedPaymentDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="actualPaymentDateRange"
      fieldType="BaseDateRangePicker"
      label="?????????????????????"
      fieldKey="actualPaymentDateRange"
      defaultShow
    />,
    <SearchFormItem
      key="paymentBatch"
      fieldType="BaseInput"
      label="???????????????"
      fieldKey="paymentBatch"
      defaultShow
    />,
    <SearchFormItem
      key="createUserId"
      fieldType="UserSimpleSelect"
      label="?????????"
      fieldKey="createUserId"
      defaultShow
    />,
    <SearchFormItem
      key="createDateRange"
      fieldType="BaseDateRangePicker"
      label="????????????"
      fieldKey="createDateRange"
      defaultShow
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;
    const {
      payModalVisible,
      accountList,
      payAccountNo,
      holderName,
      bankName,
      bankBranch,
    } = this.state;

    const columns = [
      {
        title: '???????????????',
        dataIndex: 'paymentOrderNo',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/pur/paymentRequestDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '???????????????',
        dataIndex: 'paymentOrderName',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'paymentRequestStatusDesc',
        ellipsis: true,
      },
      {
        title: '????????????',
        dataIndex: 'originalCurrencyAmt',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '???????????????',
        dataIndex: 'invoiceNo',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'currWrittenAmt',
        ellipsis: true,
      },
      {
        title: '????????????',
        dataIndex: 'originalCurrencyDesc',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'expectedPaymentDate',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'actualPaymentDate',
        ellipsis: true,
      },
      {
        title: '?????????',
        dataIndex: 'supplierName',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'chargeProjectName',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'chargeBuName',
        ellipsis: true,
      },
      {
        title: '??????????????????',
        dataIndex: 'chargeCompanyDesc',
        ellipsis: true,
      },
      {
        title: '???????????????',
        dataIndex: 'paymentBatch',
        ellipsis: true,
      },
      {
        title: '????????????',
        key: 'payAccountNo',
        dataIndex: 'payAccountNo',
      },
      {
        title: '?????????',
        dataIndex: 'createUserName',
        ellipsis: true,
      },
      {
        title: '????????????',
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
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          // onAddClick={() => router.push('/workTable/pur/purchaseDisplayPage?mode=EDIT')}
          onEditClick={data => {
            if (data.paymentRequestStatus === 'CREATE') {
              router.push(`/workTable/pur/paymentRequestDisplayPage?id=${data.id}&mode=EDIT`);
            } else {
              message({
                type: 'error',
                content: remindString({
                  remindCode: 'COM:E:ALLOW_MODIFY_CHECK',
                  defaultMessage: '?????????????????????????????????',
                }),
              });
            }
          }}
          // deleteData={this.deleteData}
          extraButtons={[
            {
              key: 'paymentRequest',
              title: '????????????',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows, selectedRowKeys } = internalState;
                //TODO ??????????????????
                // this.updateModelState({ selectedRows });
                router.push(
                  `/workTable/pur/paymentRequestDisplayPage?id=${
                    selectedRowKeys[0]
                  }&mode=view&from=RELATED_INVOICE`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
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
                    v.paymentRequestStatus !== 'WAITING_TO_PAY' ||
                    (v.paymentBatch && v.paymentBatch.trim().length > 0)
                );
                if (!isEmpty(findFalseList)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: '',
                      defaultMessage: '??????????????????????????????????????????????????????????????????????????????',
                    }),
                  });
                  return;
                }
                // eslint-disable-next-line no-restricted-globals
                location.href = `${SERVER_URL}/api/production/pur/paymentRequest/payExport?keys=${selectedRowKeys.join(
                  ','
                )}`;
              },
              disabled: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                return selectedRowKeys.length < 1;
              },
            },
            {
              key: 'completePayment',
              title: '????????????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: async internalState => {
                const { selectedRowKeys, selectedRows, refreshData } = internalState;
                const findFalseList = selectedRows.filter(
                  v =>
                    v.paymentRequestStatus !== 'WAITING_TO_PAY' ||
                    !v.paymentBatch ||
                    v.paymentBatch.trim().length === 0
                );
                if (!isEmpty(findFalseList)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: '',
                      defaultMessage: '??????????????????????????????????????????????????????????????????????????????',
                    }),
                  });
                  return;
                }
                this.fetchAbAccByCompanys(internalState);
                this.setState({ payModalVisible: true }); //?????????????????????????????????????????????
                // const { ok, warns } = await outputHandle(paymentRequestCompletePayment, {
                //   keys: selectedRowKeys.join(','),
                // });
                // if (warns && warns.length > 0) {
                //   Modal.warn({
                //     title: '??????',
                //     content: React.createElement(BusinessErrorHandler, {
                //       warns,
                //     }),
                //     okText: '??????',
                //   });
                // } else {
                //   message({ type: 'success' });
                // }
                // refreshData();
              },
              disabled: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                return selectedRowKeys.length < 1;
              },
            },
          ]}
        />
        <Modal
          title="??????????????????"
          visible={payModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width="50%"
        >
          <div className={styles.boxWarp}>
            <BusinessForm formData={{}} form={null} formMode="EDIT" defaultColumnStyle={12}>
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
          </div>
        </Modal>
      </PageWrapper>
    );
  }
}

export default PaymentRequestList;
