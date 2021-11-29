import React, { PureComponent } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import { Tooltip } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { queryUdc } from '@/services/gen/app';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'sysButemplate';

@connect(({ loading, sysButemplate }) => ({
  sysButemplate,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class BaseinfoBuTemplate extends PureComponent {
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const { dispatch, sysButemplate, loading } = this.props;
    const { dataSource, total } = sysButemplate;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      searchBarForm: [
        {
          title: '模板编号',
          dataIndex: 'tmplNo',
        },
        {
          title: '模板名称',
          dataIndex: 'tmplName',
        },
        {
          title: '模板类型',
          dataIndex: 'tmplType',
          tag: <Selection source={() => queryUdc('ORG.BUTMPL_TYPE')} placeholder="" />,
        },
        {
          title: '模板状态',
          dataIndex: 'tmplStatus',
          tag: <Selection source={() => queryUdc('COM.STATUS1')} placeholder="" />,
        },
      ],
      columns: [
        {
          title: '模板编号',
          dataIndex: 'tmplNo',
          sorter: true,
          defaultSortOrder: 'descend',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/buMgmt/butempdetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '模板名称',
          dataIndex: 'tmplName',
          sorter: true,
        },
        {
          title: '类别',
          dataIndex: 'tmplTypeName',
        },
        {
          title: '状态',
          dataIndex: 'tmplStatusName',
          align: 'center',
        },
        {
          title: '科目模板',
          dataIndex: 'accTmplName',
        },
        {
          title: '财务日历格式',
          dataIndex: 'finCalendarName',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '15%',
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: <Title id="misc.insert" />,
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/buMgmt/butempcreate?mode=create`),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: <Title id="misc.update" />,
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/buMgmt/butempedit?id=${selectedRowKeys}&mode=update&tab=basic`),
        },
        {
          key: 'active',
          className: 'tw-btn-info',
          title: <Title id="misc.active" />,
          icon: 'tag',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/active`,
              payload: { id: selectedRowKeys, statu: 'ACTIVE', row: selectedRows, queryParams },
            });
          },
        },
        {
          key: 'inactive',
          className: 'tw-btn-info',
          title: <Title id="misc.inactive" />,
          icon: 'tag',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/active`,
              payload: { id: selectedRowKeys, statu: 'INACTIVE', row: selectedRows, queryParams },
            });
          },
        },
        {
          key: 'remove',
          // type: 'danger',
          className: 'tw-btn-error',
          title: <Title id="misc.delete" />,
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // TODO：
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { id: selectedRowKeys, queryParams },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="BU模板查询">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default BaseinfoBuTemplate;
