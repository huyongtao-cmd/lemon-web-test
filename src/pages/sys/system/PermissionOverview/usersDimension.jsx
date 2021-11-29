import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';

const DOMAIN = 'usersDimension';

@connect(({ loading, usersDimension, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  usersDimension,
  dispatch,
  user,
}))
@mountToTab()
class UsersDimension extends PureComponent {
  render() {
    const {
      loading,
      dispatch,
      usersDimension: { total, dataSource, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '姓名',
          dataIndex: 'name', // todo
          options: {
            initialValue: searchForm.role,
          },
          tag: <Input placeholder="请输入姓名" />,
        },
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'name', // todo
        },
        {
          title: '业务角色',
          dataIndex: 'role', // todo
        },
        {
          title: '登录名',
          dataIndex: 'loginName', // todo
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}
export default UsersDimension;
