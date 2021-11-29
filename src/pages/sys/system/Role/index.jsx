import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { mountToTab } from '@/layouts/routerControl';
import { Switch, Input, Select } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'sysroles';
const { Option } = Select;

@connect(({ loading, sysroles }) => ({
  sysroles,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class SystemRole extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({
      sortBy: 'code',
      sortDirection: 'ASC',
      custom: undefined,
      disabled: undefined,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, sysroles, dispatch } = this.props;
    const { list, total, searchForm } = sysroles;

    const tableProps = {
      rowKey: 'code',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: formatMessage({ id: 'sys.system.mainQuery', desc: '主查询' }),
          dataIndex: 'nameLike',
          options: {
            initialValue: searchForm.nameLike,
          },
          tag: <Input placeholder="角色名称" />,
        },
        {
          title: formatMessage({ id: 'sys.system.customType', desc: '角色类型' }),
          dataIndex: 'custom',
          options: {
            initialValue: searchForm.custom || 'all',
          },
          tag: (
            <Select>
              <Option value="all">全部</Option>
              <Option value="true">显示定制</Option>
              <Option value="false">不显示定制</Option>
            </Select>
          ),
        },
        {
          title: formatMessage({ id: 'sys.system.accountType', desc: '账号类型' }),
          dataIndex: 'disabled',
          options: {
            initialValue: searchForm.disabled || 'all',
          },
          tag: (
            <Select>
              <Option value="all">全部</Option>
              <Option value="false">有效</Option>
              <Option value="true">无效</Option>
            </Select>
          ),
        },
      ],
      columns: [
        {
          title: formatMessage({ id: 'sys.system.name', desc: '名称' }),
          dataIndex: 'name',
          width: '10%',
          render: (value, rowData) => {
            const href = `/sys/powerMgmt/role/detail?id=${rowData.code}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: formatMessage({ id: 'sys.system.code', desc: '编号' }),
          dataIndex: 'code',
          className: 'text-center',
          width: '15%',
        },
        {
          title: '用户姓名',
          dataIndex: 'userName',
          width: '30%',
        },
        {
          title: formatMessage({ id: 'sys.system.remark', desc: '备注' }),
          dataIndex: 'remark',
          width: '30%',
        },
        {
          title: formatMessage({ id: 'sys.system.status', desc: '状态' }),
          dataIndex: 'disabled',
          className: 'text-center',
          width: '15%',
          render: (value, record, index) => (
            <Switch
              checked={!value} // Tag: disabled，所以要绕一下
              checkedChildren={formatMessage({ id: 'sys.system.status.valid', desc: '有效' })}
              unCheckedChildren={formatMessage({ id: 'sys.system.status.invalid', desc: '无效' })}
              onChange={checked => {
                const { code } = record;
                if (checked) {
                  dispatch({ type: `${DOMAIN}/enable`, payload: { code, record } });
                } else {
                  dispatch({ type: `${DOMAIN}/disable`, payload: { code, record } });
                }
              }}
            />
          ),
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
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/powerMgmt/role/create');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sys/powerMgmt/role/edit?id=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/removeRole`,
              payload: { id: selectedRowKeys[0] },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default SystemRole;
