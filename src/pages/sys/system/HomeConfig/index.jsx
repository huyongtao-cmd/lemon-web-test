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

const DOMAIN = 'HomeConfigList';

@connect(({ loading, HomeConfigList }) => ({
  HomeConfigList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class HomeConfig extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData();
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  };

  onCellChange = (rowData, rowField) => rowFieldValue => {
    const { dispatch, ticketMgmt } = this.props;
    const { list } = ticketMgmt;
    const newList = list.map(row => {
      if (row.id === rowData.id) {
        return { ...row, [rowField]: rowFieldValue };
      }
      return row;
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { list: newList } });
  };

  render() {
    const { loading, HomeConfigList, dispatch } = this.props;
    const { list, total, searchForm } = HomeConfigList;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource: list,
      showSearch: false,
      pagination: false,
      showExport: false,
      onChange: filters => this.fetchData(filters),
      columns: [
        {
          title: '工作台名称',
          dataIndex: 'wbName',
          className: 'text-center',
        },
        {
          title: '链接',
          dataIndex: 'wbLink',
          className: 'text-center',
        },
        {
          title: '是否为默认工作台',
          dataIndex: 'wbStatus',
          className: 'text-center',
          render: (val, record) => (val === 'YES' ? '是' : '否'),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'setting',
          className: 'tw-btn-primary',
          title: '设置为默认工作台',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/setDefaultHomePageFn`,
              payload: {
                id: selectedRowKeys[0],
              },
            });
          },
        },
        {
          key: 'edit',
          icon: 'setting',
          className: 'tw-btn-primary',
          title: '快捷入口菜单维护',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/homeConfig/menu');
          },
        },
        {
          key: 'logo',
          icon: 'setting',
          className: 'tw-btn-primary',
          title: '首页Logo区配置',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/homeConfig/logo');
          },
        },
        {
          key: 'rightMenu',
          icon: 'setting',
          className: 'tw-btn-primary',
          title: '右上角功能区域配置',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/homeConfig/extensionMenu');
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

export default HomeConfig;
