import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';

const DOMAIN = 'functionList';

@connect(({ loading, functionList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...functionList,
  dispatch,
  user,
}))
@mountToTab()
class FunctionList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
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
          title: '功能名称',
          dataIndex: 'functionName',
          options: {
            initialValue: searchForm.functionName,
          },
          tag: <Input placeholder="请输入功能名称" />,
        },
        {
          title: '模块',
          dataIndex: 'module',
          options: {
            initialValue: searchForm.module,
          },
          tag: <Input placeholder="请输入模块" />,
        },
      ],
      columns: [
        {
          title: '功能名称',
          dataIndex: 'functionName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/functionDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '模块',
          dataIndex: 'module',
          sorter: true,
        },
        {
          title: '序号',
          dataIndex: 'functionNumber',
        },
        {
          title: '配置项目',
          dataIndex: 'businessCheck',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/businessCheckList?functionId=${id}`;
            return (
              <Link className="tw-link" to={href}>
                业务检查项
              </Link>
            );
          },
        },
        {
          title: '页面配置',
          dataIndex: 'pageConfig',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/businessPageList?functionId=${id}`;
            return (
              <Link className="tw-link" to={href}>
                页面配置
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
          hidden: true,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/sys/system/functionEdit'),
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
            router.push('/sys/system/functionEdit?id=' + id);
          },
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push('/sys/system/functionEdit?copy=true&id=' + selectedRowKeys[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading,
          hidden: true,
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
      ],
    };

    return tableProps;
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child
          .map(item => ({
            ...item,
            // icon: <Icon type="file-text" />,
            value: item.tcode,
            text: item.name,
            child: item.children,
            id: item.tcode,
          }))
          .map(temp => ({
            ...temp,
            child: temp.child ? this.mergeDeep(temp.child) : null,
          }))
      : [];

  onSelect = selectedKeys => {
    const { dispatch } = this.props;
    const id = selectedKeys[0];
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    dispatch({
      type: `${DOMAIN}/notLoadingQuery`,
      payload: { offset: 0, limit: 10, linkNav: id },
    });
  };

  render() {
    const { loading, treeLoading, tree } = this.props;

    return (
      <PageHeaderWrapper>
        <Row gutter={5}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={6}>
            {!treeLoading ? (
              <TreeSearch
                showSearch
                placeholder="请输入关键字"
                treeData={tree}
                onSelect={this.onSelect}
                defaultExpandedKeys={tree.map(item => `${item.id}`)}
              />
            ) : (
              <Loading />
            )}
          </Col>

          <Col span={18}>
            <DataTable {...this.tablePropsConfig()} />
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default FunctionList;
