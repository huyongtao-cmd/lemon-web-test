import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Input } from 'antd';
import DataTable from '@/components/common/DataTable';
import { TagOpt } from '@/utils/tempUtils';

const DOMAIN = 'sysUdc';

@connect(({ dispath, loading, sysUdc }) => ({
  dispath,
  loading: loading.effects[`DOMAIN/fetch`],
  sysUdc,
}))
@mountToTab()
class SysUdc extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/fetch`, payload: { ...params } });
  };

  render() {
    const {
      dispatch,
      loading,
      sysUdc: { dataSource = [], total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'defId',
      // sortBy: 'id',
      // sortDirection: 'DESC',
      dataSource,
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
          title: 'UDC类别码',
          dataIndex: 'defId',
          options: {
            initialValue: searchForm.defId,
          },
          tag: <Input placeholder="请输入UDC类别码" />,
        },
        {
          title: 'UDC名称',
          dataIndex: 'defName',
          options: {
            initialValue: searchForm.defName,
          },
          tag: <Input placeholder="请输入UDC名称" />,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/udcInfo`);
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/udcInfo?defId=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'detail',
          title: '维护明细',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/system/udcDetail?defId=${selectedRowKeys[0]}`);
          },
        },
      ],
      columns: [
        {
          title: 'UDC编码',
          dataIndex: 'defId',
          sorter: true,
          align: 'center',
        },
        {
          title: 'UDC名称',
          dataIndex: 'defName',
          align: 'center',
          sorter: true,
        },
        {
          title: '上级UDC编码',
          dataIndex: 'pdefId',
          align: 'center',
          sorter: true,
        },
        {
          title: '上级UDC名称',
          dataIndex: 'pdefName',
          align: 'center',
          sorter: true,
        },
        {
          title: '是否可修改',
          dataIndex: 'isBuiltIn',
          sorter: true,
          align: 'center',
          render: val => (
            <TagOpt
              value={val}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '创建时间',
          dataIndex: 'modifyTime',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="数据字典">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default SysUdc;
