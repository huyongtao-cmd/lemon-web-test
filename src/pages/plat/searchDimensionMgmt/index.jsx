import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'searchDimensionMgmt';

@connect(({ loading, dispatch, searchDimensionMgmt }) => ({
  searchDimensionMgmt,
  dispatch,
  loading,
}))
@mountToTab()
class searchDimensionList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SEARCH_SAVE' },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      searchDimensionMgmt: {
        list,
        total,
        searchForm,
        pageConfig: { pageBlockViews = [] },
      },
    } = this.props;
    const tableLoading = loading.effects[`${DOMAIN}/query`];

    const urls = getUrl();
    const fromUrl = stringify({ from: urls });

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度定义');
    const { pageFieldViews = {} } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { searchNo = {}, searchName = {}, remark = {} } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: tableLoading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '编号/名称',
          dataIndex: 'searchNoName',
          options: {
            initialValue: searchForm.searchNoName,
          },
          tag: <Input placeholder="编号/名称" />,
        },
      ],
      columns: [
        {
          title: searchNo.displayName,
          dataIndex: 'searchNo',
          align: 'center',
        },
        {
          title: searchName.displayName,
          dataIndex: 'searchName',
          align: 'center',
        },
        {
          title: remark.displayName,
          dataIndex: 'remark',
          render: val => <pre>{val}</pre>,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'create',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/market/searchDimensionMgmt/add?${fromUrl}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/plat/market/searchDimensionMgmt/edit?id=${id}&${fromUrl}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/searchDimensionDelete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="查询维度列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default searchDimensionList;
