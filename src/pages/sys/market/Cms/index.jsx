import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { createConfirm } from '@/components/core/Confirm';

const DOMAIN = 'sysCms';

@connect(({ dispath, loading, sysCms }) => ({
  dispath,
  loading: loading.effects[`DOMAIN/fetch`],
  sysCms,
}))
@mountToTab()
class sysCms extends PureComponent {
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
      sysCms: { dataSource = [], total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'defId',
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
          title: '标题',
          dataIndex: 'title',
          options: {
            initialValue: searchForm.title,
          },
          tag: <Input placeholder="" />,
        },
        {
          title: '分类',
          dataIndex: 'categoryCode',
          options: {
            initialValue: searchForm.categoryCode,
          },
          tag: <Selection.UDC code="OPE:CMS_APP" placeholder="请选择" />,
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
            router.push(`/plat/contentMgmt/cmsCreate`);
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
            const { id } = selectedRows[0];
            router.push(`/plat/contentMgmt/cmsEdit?defId=${id}`);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const ids = [];
            selectedRows.forEach((value, index) => {
              ids.push(value.id);
            });

            createConfirm({
              content: '确认删除吗？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { ids },
                }),
            });
          },
        },
      ],
      columns: [
        {
          title: '标题',
          dataIndex: 'title',
          align: 'center',
          key: 'title',
        },
        {
          title: '编码',
          dataIndex: 'cmsNo',
          align: 'center',
          key: 'cmsNo',
        },
        {
          title: '分类',
          dataIndex: 'categoryCodeName',
          align: 'center',
          key: 'categoryCodeName',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          key: 'remark',
        },
        {
          title: '是否显示',
          dataIndex: 'enableFlag',
          align: 'center',
          key: 'enableFlag',
          render: (key, item, index) => (item.enableFlag === 1 ? '显示' : '隐藏'),
        },
        {
          title: '发布时间',
          dataIndex: 'releaseTime',
          align: 'center',
          key: 'releaseTime',
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

export default sysCms;
