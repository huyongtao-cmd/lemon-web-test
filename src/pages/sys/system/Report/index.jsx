import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Radio } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import SyntheticField from '@/components/common/SyntheticField';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';

const DOMAIN = 'reportMgtList';

@connect(({ loading, reportMgtList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  reportMgtList,
}))
@mountToTab()
class ReportMgt extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData();
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      dispatch,
      loading,
      reportMgtList: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      searchForm,
      dataSource,
      total,
      // rowSelection: {
      //   selectedRowKeys,
      //   onChange: () => {

      //   },
      // },
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '报表名称',
          dataIndex: 'reportTitle',
          options: {
            initialValue: searchForm.reportTitle,
          },
          tag: <Input placeholder="请输入报表名称" />,
        },
      ],
      leftButtons: [
        {
          key: 'create',
          title: '新建',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/report/edit`);
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/report/edit?id=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'remove',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: selectedRowKeys.join(','),
            });
          },
        },
        {
          key: 'auth',
          title: '配置权限',
          className: 'tw-btn-primary',
          icon: 'team',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/report/auth?id=${selectedRowKeys[0]}`);
          },
        },
      ],
      columns: [
        {
          title: '报表名称',
          dataIndex: 'reportTitle',
          width: 350,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/sys/system/report/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '备注',
          dataIndex: 'reportMark',
        },
        {
          title: '报表类型',
          dataIndex: 'reportTypeDesc',
          width: 120,
          align: 'center',
        },
        {
          title: '是否显示',
          dataIndex: 'reportStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '排序(倒序)',
          dataIndex: 'reportSort',
          width: 100,
          align: 'center',
        },
        {
          title: '发布时间',
          dataIndex: 'modifyTime',
          width: 120,
          align: 'right',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="报表管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ReportMgt;
