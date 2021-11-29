import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';

const DOMAIN = 'dataPermissionList';

@connect(({ loading, dataPermissionList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dataPermissionList,
  dispatch,
  user,
}))
@mountToTab()
class DataPermissionList extends PureComponent {
  constructor(props) {
    super(props);
    const { selectRow, dataPermission, selectedRowKey } = props;
    dataPermission ? selectRow(this.fetchData) : null;
    selectedRowKey ? this.fetchData({ offset: 0, limit: 10 }) : null;
  }

  componentDidMount() {
    const {
      selectedRowKey,
      myPermission,
      dispatch,
      user: {
        user: {
          extInfo: { userId },
        },
      },
    } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !selectedRowKey && dispatch({ type: `${DOMAIN}/clean` });
    myPermission
      ? dispatch({
          type: `${DOMAIN}/query`,
          payload: {
            userId,
            offset: 0,
            limit: 10,
          },
        }) && dispatch({ type: `${DOMAIN}/updateState`, payload: { userId } })
      : dispatch({
          type: `${DOMAIN}/query`,
          payload: {
            userId: selectedRowKey,
            offset: 0,
            limit: 10,
          },
        });
  }

  fetchData = params => {
    const { dispatch, selectedRowKey } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { userId: selectedRowKey, ...params } });
  };

  render() {
    const {
      loading,
      dataPermissionList: { dataSource, total, searchForm },
      dispatch,
      user,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm,
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableSelection: false,
      searchBarForm: [
        {
          title: '功能名称/表名称',
          dataIndex: 'functionName',
          colProps: {
            xs: 24,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 14,
          },
          options: {
            initialValue: searchForm.functionName,
          },
          tag: <Input placeholder="请输入功能名称/表名称" />,
        },
      ],
      columns: [
        {
          title: '功能名称(表名称)',
          dataIndex: 'name',
          align: 'center',
        },
        {
          title: '权限配置',
          dataIndex: 'fname',
          align: 'center',
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default DataPermissionList;
