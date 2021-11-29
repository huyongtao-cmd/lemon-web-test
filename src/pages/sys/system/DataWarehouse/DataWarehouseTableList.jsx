import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'dataWarehouseTableList';

@connect(({ loading, dataWarehouseTableList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...dataWarehouseTableList,
  dispatch,
  user,
}))
@mountToTab()
class DataWarehouseTableList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { functionId } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, functionId } });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      showSearch: true,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues || {},
        });
      },
      searchBarForm: [
        {
          title: '表名',
          dataIndex: 'dataTable',
          options: {
            initialValue: searchForm.dataTable,
          },
          tag: <Input placeholder="请输入名称" />,
        },
      ],
      columns: [
        {
          title: '表名',
          dataIndex: 'dataTable',
          width: 500,
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/dataWarehouseTableDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '备注',
          dataIndex: 'remark',
        },
        {
          title: '数据管理',
          dataIndex: 'fake1',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/dataWarehouseList?tableId=${id}`;
            return (
              <Link className="tw-link" to={href}>
                数据管理
              </Link>
            );
          },
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/sys/system/dataWarehouseTableEdit'),
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
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/sys/system/dataWarehouseTableEdit?id=' + id);
          },
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push('/sys/system/dataWarehouseTableEdit?copy=true&id=' + selectedRowKeys[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length < 1) {
              createMessage({ type: 'warn', description: '请至少选择一条记录删除！' });
              return;
            }
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { keys: selectedRowKeys.join(',') },
                }),
            });
          },
        },
        {
          key: 'extractRun',
          className: 'tw-btn-info',
          title: '执行抽取',
          loading,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.callModelEffects('dataWarehouseTableRun', { no: selectedRows[0].extractNo });
          },
        },
        {
          key: 'dataWarehouseManage',
          className: 'tw-btn-info',
          title: '数据管理',
          loading,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/dataWarehouseList?tableId=' + selectedRows[0].id);
          },
        },
      ],
    };

    return tableProps;
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  render() {
    const { loading } = this.props;

    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default DataWarehouseTableList;
