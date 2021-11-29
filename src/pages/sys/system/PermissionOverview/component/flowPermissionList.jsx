import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';

const DOMAIN = 'flowPermissionList';

@connect(({ loading, flowPermissionList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  flowPermissionList,
  dispatch,
  user,
}))
@mountToTab()
class FlowPermissionList extends PureComponent {
  constructor(props) {
    super(props);
    const { selectRow, flowPermission, selectedRowKey } = props;
    flowPermission ? selectRow(this.fetchData) : null;
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
      flowPermissionList: { dataSource, total, searchForm },
      dispatch,
      user,
    } = this.props;

    const tableProps = {
      rowKey: 'key',
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
          title: '流程名称',
          dataIndex: 'bpmName',
          options: {
            initialValue: searchForm.bpmName,
          },
          tag: <Input placeholder="请输入流程名称" />,
        },
      ],
      columns: [
        {
          title: '流程名称',
          dataIndex: 'businessDefName',
          align: 'center',
        },
        {
          title: '流程节点',
          dataIndex: 'remark',
          align: 'center',
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default FlowPermissionList;
