import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import { otherPaymentListPaging, otherPaymentLogicalDelete } from '@/services/production/cos';
import router from 'umi/router';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { remindString } from '@/components/production/basic/Remind.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import { abSelectPaging } from '@/services/production/common/select';

const DOMAIN = 'otherPaymentList';

@connect(({ loading, dispatch, otherPaymentList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...otherPaymentList,
}))
class OtherPaymentList extends React.PureComponent {
  state = {
    abLists: [],
  };

  componentDidMount() {
    // outputHandle(expenseQuotaFindQuotas, [
    //   { busiAccItemId: 5, quotaDimension1Value: 'L2', quotaDimension2Value: '02' },
    // ]).then(data => {
    //   console.log(data);
    // });
    this.fetchAbList();
  }

  fetchData = async params => {
    const wrappedParam = { ...params };
    if (params.createTime) {
      [wrappedParam.createTimeFrom, wrappedParam.createTimeTo] = params.createTime;
      delete wrappedParam.createTime;
    }
    const { data } = await outputHandle(otherPaymentListPaging, wrappedParam);
    return data;
  };

  fetchAbList = async payload => {
    const { data } = await outputHandle(abSelectPaging, { limit: 0, ...payload });
    const abList = data.rows.map(item => ({
      ...item,
      value: item.abNo,
      title: item.abName,
    }));
    this.setState({
      abLists: abList,
    });
  };

  deleteData = async keys =>
    outputHandle(otherPaymentLogicalDelete, { keys: keys.join(',') }, undefined, false);

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

  renderSearchForm = () => {
    const { pageConfig } = this.props;
    const { abLists } = this.state;
    const fields = [
      <SearchFormItem
        key="paymentNo"
        fieldKey="paymentNo"
        label="????????????"
        fieldType="BaseInput"
      />,
      <SearchFormItem
        label="??????"
        fieldKey="paymentType"
        key="paymentType"
        fieldType="BaseCustomSelect"
        parentKey="CUS:OTHER_PAYMENT:TYPE"
      />,
      <SearchFormItem
        key="paymentStatus"
        label="??????"
        fieldType="BaseSelect"
        parentKey="COS:OTHER_PAYMENT:STATUS"
        fieldKey="paymentStatus"
      />,
      <SearchFormItem
        key="relatedProductId"
        fieldKey="relatedProductId"
        label="????????????"
        fieldType="ProductSimpleSelect"
      />,
      <SearchFormItem
        key="createUserId"
        fieldKey="createUserId"
        label="?????????"
        fieldType="UserSimpleSelect"
      />,
      <SearchFormItem
        key="paymentName"
        fieldKey="paymentName"
        label="???????????????"
        fieldType="BaseInput"
      />,
      <SearchFormItem
        key="chargeClassification"
        label="????????????"
        fieldType="BaseCustomSelect"
        parentKey="CUS:CHARGE_CLASSIFICATION"
        fieldKey="chargeClassification"
      />,
      <SearchFormItem
        key="paymentTarget"
        fieldKey="paymentTarget"
        label="????????????"
        fieldType="BaseSelect"
        descList={[...abLists]}
      />,
      <SearchFormItem
        key="relatedContractId"
        label="????????????"
        fieldType="ContractSimpleSelect"
        fieldKey="relatedContractId"
      />,
      <SearchFormItem
        key="createTime"
        label="????????????"
        fieldType="BaseDateRangePicker"
        fieldKey="createTime"
      />,
      <SearchFormItem
        key="relatedBudgetId"
        label="????????????"
        fieldType="BudgetSimpleSelect"
        fieldKey="relatedBudgetId"
      />,
      <SearchFormItem
        label="??????????????????"
        fieldKey="chargeProjectId"
        key="chargeProjectId"
        fieldType="ProjectSimpleSelect"
        parentKey="CUS:PROJECT_CLASS2"
      />,
      <SearchFormItem
        label="??????????????????"
        fieldKey="chargeBuId"
        key="chargeBuId"
        fieldType="BuSimpleSelect"
        parentKey="PRO:PROJECT_STATUS"
      />,
      <SearchFormItem
        label="??????????????????"
        fieldKey="chargeCompany"
        key="chargeCompany"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
      />,

      <SearchFormItem
        key="inchargeResId"
        label="?????????"
        fieldType="ResSimpleSelect"
        fieldKey="inchargeResId"
      />,
    ];
    return fields;
  };

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '????????????',
        key: 'paymentNo',
        dataIndex: 'paymentNo',
        sorter: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(`/plat/othersExpense/othersPaymentDisplay?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '???????????????',
        key: 'paymentName',
        dataIndex: 'paymentName',
      },
      {
        title: '??????',
        key: 'paymentType',
        dataIndex: 'paymentTypeDesc',
      },
      {
        title: '????????????',
        key: 'chargeClassificationDesc',
        dataIndex: 'chargeClassificationDesc',
      },
      {
        title: '??????',
        key: 'baseCurrencyAmt',
        dataIndex: 'baseCurrencyAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '????????????',
        key: 'paymentTarget',
        dataIndex: 'paymentTargetDesc',
      },
      {
        title: '??????',
        key: 'paymentStatusDesc',
        dataIndex: 'paymentStatusDesc',
      },
      {
        title: '????????????',
        key: 'relatedContractIdDesc',
        dataIndex: 'relatedContractIdDescDesc',
      },
      {
        title: '????????????',
        key: 'relatedProductIdDesc',
        dataIndex: 'relatedProductIdDesc',
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
        title: '?????????',
        key: 'inchargeResIdDesc',
        dataIndex: 'inchargeResIdDesc',
      },
      {
        title: '?????????',
        key: 'createUserName',
        dataIndex: 'createUserIdDesc',
      },
      {
        title: '????????????',
        key: 'createTime',
        dataIndex: 'createTime',
        render: v => moment(v).format('YYYY-MM-DD'),
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
          tableExtraProps={{ scroll: { x: 2400 } }}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => router.push('/plat/othersExpense/othersPaymentDisplay?mode=EDIT')} // ??????????????????,???????????????
          onEditClick={data => {
            if (data.paymentStatus !== 'CREATE') {
              message({ type: 'error', content: '?????????????????????????????????' });
            } else {
              router.push(`/plat/othersExpense/othersPaymentDisplay?id=${data.id}&mode=EDIT`);
            }
          }} // ??????????????????,???????????????
          onCopyClick={data =>
            router.push(
              `/plat/othersExpense/othersPaymentDisplay?id=${data.id}&copy=true&mode=EDIT`
            )
          } // ??????????????????,???????????????
          deleteData={(selectedRowKeys, selectedRows) => {
            const tt = selectedRows.filter(v => v.paymentStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `????????????????????????????????????????????????`,
                }),
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(selectedRowKeys);
          }}
        />
      </PageWrapper>
    );
  }
}

export default OtherPaymentList;
