import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import { queryUdc } from '@/services/gen/app';
import { mountToTab } from '@/layouts/routerControl';
import { Input } from 'antd';

const DOMAIN = 'sysSubjTemplate';

@connect(({ loading, sysSubjTemplate }) => ({
  sysSubjTemplate,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class BaseinfoSubjTemplate extends PureComponent {
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'tmplNo', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysSubjTemplate: { dataSource, total },
    } = this.props;

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
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplNo` }),
          dataIndex: 'tmplNo',
          tag: <Input placeholder="请输入科目模板编号" maxLength={35} />,
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplName` }),
          dataIndex: 'tmplName',
          tag: <Input placeholder="请输入科目模板名称" maxLength={35} />,
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplClass` }),
          dataIndex: 'tmplClass',
          tag: <Selection source={() => queryUdc('ACC.TMPL_CLASS')} placeholder="请选择模版类别" />,
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplStatus` }),
          dataIndex: 'tmplStatus',
          tag: <Selection source={() => queryUdc('COM.STATUS1')} placeholder="请选择模版状态" />,
        },
      ],
      columns: [
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplNo`, desc: '模板编号' }),
          dataIndex: 'tmplNo',
          align: 'center',
          sorter: true,
          defaultSortOrder: 'descend',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/finAccout/subjtempdetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplName`, desc: '模板名称' }),
          dataIndex: 'tmplName',
          sorter: true,
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplIndustry`, desc: '适用行业' }),
          dataIndex: 'tmplIndustryName',
          align: 'center',
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplStatus`, desc: '模板状态' }),
          dataIndex: 'tmplStatusName',
          align: 'center',
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplClass`, desc: '模板类别' }),
          dataIndex: 'tmplClassName',
          align: 'center',
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.tmplType`, desc: '适用类型' }),
          dataIndex: 'tmplType',
        },
        {
          title: formatMessage({ id: `sys.baseinfo.subjTemplate.num`, desc: '待处理科目数' }),
          dataIndex: 'num',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/finAccout/subjtempcreate?mode=create`),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/finAccout/subjtempedit?id=${selectedRowKeys}&mode=update`),
        },
        {
          key: 'active',
          className: 'tw-btn-info',
          title: formatMessage({ id: `misc.active`, desc: '激活' }),
          icon: 'tag',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/active`,
              payload: { id: selectedRowKeys, statu: 'ACTIVE', queryParams },
            });
          },
        },
        {
          key: 'inactive',
          className: 'tw-btn-info',
          title: formatMessage({ id: `misc.inactive`, desc: '不激活' }),
          icon: 'tag',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/active`,
              payload: { id: selectedRowKeys, statu: 'INACTIVE', queryParams },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { id: selectedRowKeys, queryParams },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="科目模板查询">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default BaseinfoSubjTemplate;
