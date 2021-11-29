import React from 'react';
import { connect } from 'dva';
import { Switch } from 'antd';
import router from 'umi/router';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import {
  expenseQuotaPagingRq,
  expenseQuotaDeleteRq,
  expenseQuotaPartialRq,
} from '@/services/workbench/reimQuotaMgmt';
import { businessAccItemListPaging } from '@/services/production/acc';

const DOMAIN = 'reimQuotaMgmtList';

@connect(({ loading, dispatch, reimQuotaMgmtList }) => ({
  loading,
  dispatch,
  ...reimQuotaMgmtList,
}))
class ReimQuotaMgmtList extends React.PureComponent {
  state = {};

  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PRODUCT_TABLE' },
    // });
  }

  fetchData = async params => {
    const { response } = await expenseQuotaPagingRq(params);
    return response.data;
  };

  fetchTree = async () => {
    const { data } = await outputHandle(businessAccItemListPaging, { limit: 0 });
    return data.rows.map(item => ({ ...item, title: item.itemName }));
  };

  deleteData = async keys =>
    outputHandle(expenseQuotaDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await expenseQuotaPartialRq(parmars);
    return response.data;
  };

  renderColumns = () => {
    // const { pageConfig } = this.props;
    const { getInternalState } = this.state;

    const fields = [
      {
        title: '核算项目',
        key: 'busiAccItemId',
        dataIndex: 'busiAccItemIdDesc',
        align: 'center',
        // sorter: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/reimburseMgmt/reimQuotaMgmt/detail?id=${row.id}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '报销额度维度1',
        key: 'quotaDimension1',
        dataIndex: 'quotaDimension1Desc',
        align: 'center',
      },
      {
        title: '报销额度维度2',
        key: 'quotaDimension2',
        dataIndex: 'quotaDimension2Desc',
        align: 'center',
      },
      {
        title: '状态',
        key: 'quotaStatus',
        dataIndex: 'quotaStatus',
        align: 'center',
        render: (val, row) => (
          <Switch
            checkedChildren="有效"
            unCheckedChildren="无效"
            checked={val}
            onChange={e => {
              this.changeStatus({ id: row.id, quotaStatus: e }).then(res => {
                const { refreshData } = getInternalState();
                refreshData();
              });
            }}
          />
        ),
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  renderSearchForm = () => {
    // const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="busiAccItemId"
        fieldKey="busiAccItemId"
        label="核算项目"
        fieldType="BaseTreeSelect"
        fetchData={this.fetchTree}
        defaultShow
      />,
      <SearchFormItem
        label="报销额度维度1"
        key="quotaDimension1"
        fieldKey="quotaDimension1"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        defaultShow
      />,
      <SearchFormItem
        label="报销额度维度2"
        key="quotaDimension2"
        fieldKey="quotaDimension2"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        fieldKey="quotaStatus"
        key="quotaStatus"
        fieldType="BaseSelect"
        parentKey="COM:ENABLE_FLAG"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  render() {
    const { getInternalState } = this.state;

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          onAddClick={() => router.push('/workTable/reimburseMgmt/reimQuotaMgmt/edit')}
          onEditClick={data => {
            router.push(`/workTable/reimburseMgmt/reimQuotaMgmt/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => this.deleteData(data)}
          extraButtons={
            [
              // {
              //   key: 'adjust',
              //   title: '调整',
              //   type: 'primary',
              //   size: 'large',
              //   loading: false,
              //   cb: internalState => {
              //     // eslint-disable-next-line no-console
              //     const { selectedRowKeys, selectedRows } = internalState;
              //     const tt = selectedRows.filter(v => v.productStatus !== 'ACTIVE');
              //     if (!isEmpty(tt)) {
              //       createMessage({
              //         type: 'warn',
              //         description: remindString({
              //           remindCode: 'COM:ALLOW_ADJUST_CHECK',
              //           defaultMessage: `仅“激活”状态允许调整！`,
              //         }),
              //       });
              //       return;
              //     }
              //     router.push(
              //       `/workTable/projectMgmt/productMgmt/edit?id=${
              //         selectedRows[0].id
              //       }&mode=EDIT&scene=adjust`
              //     );
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

export default ReimQuotaMgmtList;
