import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
import BudgetProgress from './BudgetProgress';
// @ts-ignore
import {
  budgetListPaging,
  budgetLogicalDelete,
  budgetPartialModify,
} from '@/services/production/bud';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { fromQs } from '@/utils/production/stringUtil.ts';

const DOMAIN = 'budgetList';

@connect(({ loading, dispatch, budgetList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...budgetList,
}))
class BudgetList extends React.PureComponent {
  state = {};

  constructor(props) {
    super(props);
    const pathParam = fromQs();
    this.state = { defaultSearchForm: pathParam };
  }

  componentDidMount() {}

  fetchData = async params => {
    const { budgetDate, ...restparams } = params;
    if (Array.isArray(budgetDate) && (budgetDate[0] || budgetDate[1])) {
      [restparams.budgetStartDate, restparams.budgetEndDate] = budgetDate;
    }
    const { data } = await outputHandle(budgetListPaging, restparams);
    return data;
  };

  deleteData = async keys =>
    outputHandle(budgetLogicalDelete, { keys: keys.join(',') }, undefined, false);

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
      key="budgetCode"
      fieldType="BaseInput"
      label="编码"
      fieldKey="budgetCode"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="budgetName"
      fieldType="BaseInput"
      label="名称"
      fieldKey="budgetName"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="budgetType"
      fieldType="BaseCustomSelect"
      label="费用归属"
      fieldKey="chargeClassification"
      defaultShow
      advanced
      parentKey="CUS:CHARGE_CLASSIFICATION"
    />,
    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="项目"
      fieldKey="chargeProjectId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      label="部门"
      fieldKey="chargeBuId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="enabledFlag"
      fieldType="BaseSelect"
      label="预算状态"
      fieldKey="budgetStatus"
      defaultShow
      parentKey="COM:DOC_STATUS"
    />,
    <SearchFormItem
      key="budgetDate"
      fieldType="BaseDateRangePicker"
      label="预算起止日期"
      fieldKey="budgetDate"
    />,
  ];

  /**
   * 关闭预算
   */
  closeBudget = async key => {
    const response = outputHandle(budgetPartialModify, { id: key, budgetStatus: 'CLOSE' });
    return response;
  };

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '编码',
        dataIndex: 'budgetCode',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '名称',
        dataIndex: 'budgetName',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/bud/budgetDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '预算类型',
        dataIndex: 'chargeClassificationDesc',
        ellipsis: true,
      },
      {
        title: '项目',
        dataIndex: 'chargeProjectName',
        ellipsis: true,
      },
      {
        title: '所属部门',
        dataIndex: 'chargeBuName',
        ellipsis: true,
      },
      {
        title: '科目模板',
        dataIndex: 'tmplName',
        ellipsis: true,
      },
      {
        title: '预算总金额',
        dataIndex: 'totalBudgetAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '拨款金额',
        dataIndex: 'totalAppropriationAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '占用金额',
        dataIndex: 'occupiedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '已用金额',
        dataIndex: 'usedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        width: '200px',
        render: (value, row, index) => <BudgetProgress row={row} />,
      },
      {
        title: '状态',
        dataIndex: 'budgetStatusDesc',
      },
      {
        title: '申请人',
        dataIndex: 'applyResName',
      },
      {
        title: '申请日期',
        dataIndex: 'applyDate',
      },
    ];

    const { defaultSearchForm } = this.state;
    const { chargeBuId, chargeProjectId } = fromQs();

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={defaultSearchForm}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => {
            if (fromQs().chargeBuId) {
              //判断是否是从相关概览跳转到采购页，如果是点击新增的时候把对应的数据带过去
              router.push(
                `/workTable/bud/budgetDisplayPage?mode=EDIT&chargeBuId=${chargeBuId}&chargeProjectId=${chargeProjectId}`
              );
            } else {
              router.push('/workTable/bud/budgetDisplayPage?mode=EDIT');
            }
          }}
          onEditClick={data => {
            if (data.budgetStatus === 'CREATE') {
              router.push(`/workTable/bud/budgetDisplayPage?id=${data.id}&mode=EDIT`);
            } else {
              message({ type: 'error', content: '只有新建状态可以修改！' });
            }
          }}
          deleteData={this.deleteData}
          extraButtons={[
            {
              key: 'close',
              title: '关闭',
              type: 'danger',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                // 获得刷新数据方法，并且刷新数据
                const { selectedRowKeys, refreshData, selectedRows } = internalState;
                if (selectedRows[0].budgetStatus === 'ACTIVE') {
                  // router.push(`/workTable/bud/budgetDisplayPage?id=${data.id}&mode=EDIT`);
                  this.closeBudget(selectedRowKeys[0]).then(() => refreshData());
                } else {
                  message({ type: 'error', content: '只有新建状态可以修改！' });
                }
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default BudgetList;
