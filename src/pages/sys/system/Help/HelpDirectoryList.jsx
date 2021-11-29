import React, { PureComponent } from 'react';
import { Col, Input, Row, Switch, Icon } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import Loading from '@/components/core/DataLoading';
import TreeSearch from '@/components/common/TreeSearch';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { toQs, toUrl } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'helpDirectoryList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, helpDirectoryList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...helpDirectoryList,
  dispatch,
  user,
}))
@mountToTab()
class HelpDirectoryList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    dispatch({
      type: `${DOMAIN}/getTree`,
      payload: { pageFlag: true },
    });
    this.fetchData({ offset: 0, limit: 10 });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child
          .map(item => ({
            ...item,
            icon: item.pageFlag ? <Icon type="file-text" /> : '',
            value: item.id,
            text: item.directoryName,
            child: item.children,
          }))
          .map(temp => ({
            ...temp,
            child: temp.child ? this.mergeDeep(temp.child) : null,
          }))
      : [];

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
          title: '目录名称',
          dataIndex: 'directoryName',
          options: {
            initialValue: searchForm.directoryName,
          },
          tag: <Input placeholder="请输入目录名称" />,
        },
      ],
      columns: [
        {
          title: '目录名称',
          dataIndex: 'directoryName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/maintMgmt/help/directory/detail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '上级目录',
          dataIndex: 'topDirectoryName',
        },
        {
          title: '序号',
          dataIndex: 'directoryNumber',
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
          cb: () => router.push('/sys/maintMgmt/help/directory/edit'),
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/sys/maintMgmt/help/directory/edit?id=' + id);
          },
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
      ],
    };

    return tableProps;
  };

  render() {
    const { loading, tree } = this.props;

    const treeData = this.mergeDeep(tree);

    return (
      <PageHeaderWrapper>
        <Row gutter={5}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={6}>
            {!loading ? (
              <TreeSearch
                showSearch
                placeholder="请输入关键字"
                treeData={treeData}
                onSelect={this.onSelect}
                defaultExpandedKeys={treeData.map(item => `${item.id}`)}
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

export default HelpDirectoryList;
