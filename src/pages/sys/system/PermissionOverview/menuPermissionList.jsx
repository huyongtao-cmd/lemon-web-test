import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import component from './component/index';

const DOMAIN = 'menuPermissionList';

const { DataPermissionList, FlowPermissionList } = component;

@connect(({ loading, menuPermissionList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  menuPermissionList,
  dispatch,
  user,
}))
@mountToTab()
class MenuPermissionList extends PureComponent {
  constructor(props) {
    super(props);
    const { selectRow, menuPermission, selectedRowKey } = props;
    menuPermission ? selectRow(this.fetchData) : null;
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
    // myPermission个人信息下的我的权限页签定义的字段  用来控制初始化右侧的菜单权限是否加载数据
    // 有的话要查询，没有的话就是权限总览里点击左侧的用户维度才开始查询
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
    const { selectedRowKey } = this.props;
    const {
      loading,
      menuPermissionList: { dataSource, total, searchForm },
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
      enableSelection: false,
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '路径',
          dataIndex: 'navCode',
          options: {
            initialValue: searchForm.navCode,
          },
          tag: <Input placeholder="请输入路径" />,
        },
        {
          title: '功能名称',
          dataIndex: 'functionName',
          options: {
            initialValue: searchForm.functionName,
          },
          tag: <Input placeholder="请输入功能名称" />,
        },
      ],
      columns: [
        {
          title: '路径',
          dataIndex: 'fname',
          align: 'center',
          render: (value, row, index) => `${row.fname}/${row.pname}`,
        },
        {
          title: '功能名称',
          dataIndex: 'name',
          align: 'center',
          width: 250,
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default MenuPermissionList;
