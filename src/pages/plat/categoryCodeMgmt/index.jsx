import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { getUrl } from '@/utils/flowToRouter';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';

const DOMAIN = 'categoryCodeMgmt';

@connect(({ loading, dispatch, categoryCodeMgmt }) => ({
  categoryCodeMgmt,
  dispatch,
  loading,
}))
@mountToTab()
class CategoryCodeList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'CATEGORY_SAVE' },
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
      categoryCodeMgmt: {
        list,
        total,
        searchForm,
        pageConfig: { pageBlockViews = [] },
      },
    } = this.props;
    const from = stringify({ from: markAsNoTab(getUrl()) });
    const tableLoading = loading.effects[`${DOMAIN}/query`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '类别码定义新增');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { catNo = {}, catName = {}, tabName = {}, remark = {} } = pageFieldJson;

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
          dataIndex: 'selectCatNoName',
          options: {
            initialValue: searchForm.selectCatNoName,
          },
          tag: <Input placeholder="编号/名称" />,
        },
      ],
      columns: [
        {
          title: catNo.displayName,
          dataIndex: 'catNo',
          align: 'center',
        },
        {
          title: catName.displayName,
          dataIndex: 'catName',
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
            router.push(`/plat/market/categoryCodeMgmt/add?${from}`);
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
            router.push(`/plat/market/categoryCodeMgmt/edit?id=${id}&${from}`);
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
              type: `${DOMAIN}/catCodeDelete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="类别码列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default CategoryCodeList;
