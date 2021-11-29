import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, Tooltip } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectAbOus } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'salaryAccountList';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, salaryAccountList, dispatch, global }) => ({
  salaryAccountList,
  loading,
  dispatch,
  global,
}))
class SalaryAccount extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'SALARY_ACCOUNT_CONFIG',
      },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const newParams = params;
    if (params.selectedRowKeys) {
      newParams.selectedRowKeys = undefined;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...newParams,
      },
    });
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const {
      loading,
      dispatch,
      salaryAccountList: { list = [], total = 0, searchForm, pageConfig = {} },
      global: { userList },
    } = this.props;

    let { pageBlockViews = [] } = pageConfig;
    pageBlockViews = pageBlockViews.sort(this.sortObj);
    let columns = [];
    let searchKeyBox = [];
    let searchBarForms = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'no') {
            columnsItem.render = (value, rowData, index) => (
              <span
                style={{
                  color: '#008FDB',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  router.push(
                    `/sale/purchaseContract/purchaseSalaryAccount/edit?id=${rowData.id}&mode=view`
                  );
                }}
              >
                {index + 1}
              </span>
            );
          }
          return columnsItem;
        });
    }

    if (pageBlockViews && pageBlockViews.length > 1) {
      searchKeyBox = pageBlockViews[1].pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj);

      searchBarForms = searchKeyBox.map(item => {
        const { displayName, fieldKey } = item;
        const searchBar = {
          title: displayName,
          dataIndex: fieldKey,
          options: {
            initialValue: searchForm[fieldKey],
          },
        };
        if (fieldKey === 'paymentOuId') {
          searchBar.tag = (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectAbOus()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              placeholder="请选择薪资成本-公司"
            />
          );
        }

        if (fieldKey === 'collectionAbId') {
          searchBar.tag = (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectAbOus()}
              transfer={{ key: 'valSphd1', code: 'valSphd1', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              placeholder="请选择薪资成本-付款对象"
            />
          );
        }

        return searchBar;
      });
    }

    const tableLoading = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: 4500,
      },
      loading: tableLoading,
      total,
      dataSource: list,
      enableSelection: true,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [...searchBarForms],
      columns: [...columns],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新建',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: false,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sale/purchaseContract/purchaseSalaryAccount/edit');
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/sale/purchaseContract/purchaseSalaryAccount/edit?id=${selectedRowKeys[0]}`
            );
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/deleteHandle`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="付款记录确认列表 ( 出纳 )">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default SalaryAccount;
