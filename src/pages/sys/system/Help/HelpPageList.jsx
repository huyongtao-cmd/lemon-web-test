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
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import TreeSearch from '@/components/common/TreeSearch';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { toQs, toUrl } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'helpPageList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, helpPageList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  treeLoading: loading.effects[`${DOMAIN}/getTree`],
  switchLoading: loading.effects[`${DOMAIN}/directoryVisibleChange`],
  ...helpPageList,
  dispatch,
  user,
}))
@mountToTab()
class HelpPageList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getTree`,
      payload: { directoryVisibleFlag: 1 },
    });
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  handleDirectoryVisibleChange = (id, visibleFlag) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/directoryVisibleChange`,
      payload: { id, visibleFlag },
    });
  };

  tablePropsConfig = () => {
    const { loading, switchLoading, dataSource, total, searchForm, dispatch, user } = this.props;
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
          title: '标题',
          dataIndex: 'helpTitle',
          options: {
            initialValue: searchForm.helpTitle,
          },
          tag: <Input placeholder="请输入标题" />,
        },
      ],
      columns: [
        {
          title: '标题',
          dataIndex: 'helpTitle',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/maintMgmt/help/page/detail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '上级页面',
          dataIndex: 'parentName',
        },
        {
          title: '序号',
          dataIndex: 'pageNumber',
        },
        {
          title: '关联页面',
          dataIndex: 'linkUrl',
        },
        {
          title: '目录显示',
          dataIndex: 'directoryVisibleFlag',
          render: (value, row, index) => (
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              checked={value}
              loading={switchLoading}
              onChange={() => this.handleDirectoryVisibleChange(row.id, !value)}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'directoryMange',
          className: 'tw-btn-primary',
          title: '帮助目录管理',
          loading: false,
          hidden: true,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/sys/maintMgmt/help/directory'),
        },
        {
          key: 'preview',
          className: 'tw-btn-primary',
          title: '预览',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: selectedRowKeys =>
            router.push('/sys/maintMgmt/help/page/preview?id=' + selectedRowKeys[0]),
        },
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/sys/maintMgmt/help/page/edit'),
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
            router.push('/sys/maintMgmt/help/page/edit?id=' + id);
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
            router.push('/sys/maintMgmt/help/page/edit?copy=true&id=' + selectedRowKeys[0]),
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

  onSelect = selectedKeys => {
    const { dispatch } = this.props;
    const id = selectedKeys[0];
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    dispatch({
      type: `${DOMAIN}/notLoadingQuery`,
      payload: { offset: 0, limit: 10, parentId: id },
    });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child
          .map(item => ({
            ...item,
            icon: <Icon type="file-text" />,
            value: item.id,
            text: item.helpTitle,
            child: item.children,
          }))
          .map(temp => ({
            ...temp,
            child: temp.child ? this.mergeDeep(temp.child) : null,
          }))
      : [];

  render() {
    const { loading, treeLoading, tree } = this.props;
    const treeData = this.mergeDeep(tree);

    return (
      <PageHeaderWrapper>
        <Row gutter={5}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={6}>
            {!treeLoading ? (
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

export default HelpPageList;
