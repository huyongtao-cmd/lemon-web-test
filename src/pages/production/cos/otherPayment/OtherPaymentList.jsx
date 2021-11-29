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

  renderSearchForm = () => {
    const { pageConfig } = this.props;
    const { abLists } = this.state;
    const fields = [
      <SearchFormItem
        key="paymentNo"
        fieldKey="paymentNo"
        label="付款单号"
        fieldType="BaseInput"
      />,
      <SearchFormItem
        label="类型"
        fieldKey="paymentType"
        key="paymentType"
        fieldType="BaseCustomSelect"
        parentKey="CUS:OTHER_PAYMENT:TYPE"
      />,
      <SearchFormItem
        key="paymentStatus"
        label="状态"
        fieldType="BaseSelect"
        parentKey="COS:OTHER_PAYMENT:STATUS"
        fieldKey="paymentStatus"
      />,
      <SearchFormItem
        key="relatedProductId"
        fieldKey="relatedProductId"
        label="相关产品"
        fieldType="ProductSimpleSelect"
      />,
      <SearchFormItem
        key="createUserId"
        fieldKey="createUserId"
        label="创建人"
        fieldType="UserSimpleSelect"
      />,
      <SearchFormItem
        key="paymentName"
        fieldKey="paymentName"
        label="付款单名称"
        fieldType="BaseInput"
      />,
      <SearchFormItem
        key="chargeClassification"
        label="费用归属"
        fieldType="BaseCustomSelect"
        parentKey="CUS:CHARGE_CLASSIFICATION"
        fieldKey="chargeClassification"
      />,
      <SearchFormItem
        key="paymentTarget"
        fieldKey="paymentTarget"
        label="付款对象"
        fieldType="BaseSelect"
        descList={[...abLists]}
      />,
      <SearchFormItem
        key="relatedContractId"
        label="相关合同"
        fieldType="ContractSimpleSelect"
        fieldKey="relatedContractId"
      />,
      <SearchFormItem
        key="createTime"
        label="创建时间"
        fieldType="BaseDateRangePicker"
        fieldKey="createTime"
      />,
      <SearchFormItem
        key="relatedBudgetId"
        label="相关预算"
        fieldType="BudgetSimpleSelect"
        fieldKey="relatedBudgetId"
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
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
      />,

      <SearchFormItem
        key="inchargeResId"
        label="发起人"
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
        title: '付款单号',
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
        title: '付款单名称',
        key: 'paymentName',
        dataIndex: 'paymentName',
      },
      {
        title: '类型',
        key: 'paymentType',
        dataIndex: 'paymentTypeDesc',
      },
      {
        title: '费用归属',
        key: 'chargeClassificationDesc',
        dataIndex: 'chargeClassificationDesc',
      },
      {
        title: '金额',
        key: 'baseCurrencyAmt',
        dataIndex: 'baseCurrencyAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '付款对象',
        key: 'paymentTarget',
        dataIndex: 'paymentTargetDesc',
      },
      {
        title: '状态',
        key: 'paymentStatusDesc',
        dataIndex: 'paymentStatusDesc',
      },
      {
        title: '相关合同',
        key: 'relatedContractIdDesc',
        dataIndex: 'relatedContractIdDescDesc',
      },
      {
        title: '相关产品',
        key: 'relatedProductIdDesc',
        dataIndex: 'relatedProductIdDesc',
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
        title: '发起人',
        key: 'inchargeResIdDesc',
        dataIndex: 'inchargeResIdDesc',
      },
      {
        title: '创建人',
        key: 'createUserName',
        dataIndex: 'createUserIdDesc',
      },
      {
        title: '创建日期',
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
          onAddClick={() => router.push('/plat/othersExpense/othersPaymentDisplay?mode=EDIT')} // 新增按钮逻辑,不写不展示
          onEditClick={data => {
            if (data.paymentStatus !== 'CREATE') {
              message({ type: 'error', content: '只有新建状态可以修改！' });
            } else {
              router.push(`/plat/othersExpense/othersPaymentDisplay?id=${data.id}&mode=EDIT`);
            }
          }} // 编辑按钮逻辑,不写不显示
          onCopyClick={data =>
            router.push(
              `/plat/othersExpense/othersPaymentDisplay?id=${data.id}&copy=true&mode=EDIT`
            )
          } // 复制按钮逻辑,不写不显示
          deleteData={(selectedRowKeys, selectedRows) => {
            const tt = selectedRows.filter(v => v.paymentStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `仅“新建”状态的数据表允许删除！`,
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
