import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Switch, Input, Select } from 'antd';
import { isNil, isEmpty } from 'ramda';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'homeConfigMenuList';

@connect(({ loading, homeConfigMenuList }) => ({
  homeConfigMenuList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MenuConfig extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/queryNav` });
    this.fetchData({
      sortBy: 'id',
      sortDirection: 'DESC',
      offset: 0,
      limit: 10,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const { loading, homeConfigMenuList, dispatch } = this.props;
    const { list, total, searchForm, HomeConfigListNav = [] } = homeConfigMenuList;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
      loading,
      total,
      dataSource: list,
      showExport: false,
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
          title: formatMessage({ id: 'sys.system.menuConfig.name', desc: '菜单名称' }),
          dataIndex: 'menuName',
          options: {
            initialValue: searchForm.menuName,
          },
          tag: <Input placeholder="请输入名称或简称" />,
        },
        {
          title: '所属工作台',
          dataIndex: 'menuType',
          options: {
            initialValue: searchForm.menuType,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={HomeConfigListNav}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择所属工作台"
            />
          ),
        },
      ],
      columns: [
        {
          title: formatMessage({ id: 'sys.system.menuConfig.name', desc: '菜单名称' }),
          dataIndex: 'menuName',
          className: 'text-center',
          width: '16%',
        },
        {
          title: formatMessage({ id: 'sys.market.banner.link', desc: '链接' }),
          dataIndex: 'menuLink',
          className: 'text-center',
          width: '30%',
        },
        {
          title: formatMessage({ id: 'sys.system.menuConfig.icon', desc: '图标' }),
          dataIndex: 'imgFile',
          className: 'text-center',
          width: '14%',
          render: (text, record) => (
            <img
              src={`data:image/jpeg;base64,${text}`}
              alt=""
              style={{
                height: '40px',
                width: '40px',
              }}
            />
          ),
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artSort', desc: '排序' }),
          dataIndex: 'menuSort',
          className: 'text-center',
          width: '14%',
        },
        {
          title: '状态',
          dataIndex: 'menuStatus',
          className: 'text-center',
          width: '10%',
          render: (val, record) => (val === 'YES' ? '启用' : '不启用'),
        },
        {
          title: '所属工作台',
          dataIndex: 'wbName',
          className: 'text-center',
          width: '16%',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/homeConfig/menu/edit');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/homeConfig/menu/edit?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: selectedRowKeys[0],
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="BANNER管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MenuConfig;
