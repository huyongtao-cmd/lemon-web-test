import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Switch, Tag, Input, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { createConfirm } from '@/components/core/Confirm';
import { findRoles } from '@/services/sys/iam/roles';

const DOMAIN = 'sysusers';
const { Option } = Select;

@connect(({ loading, sysusers }) => ({
  // loading,
  sysusers,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class SystemUser extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC', disabled: undefined });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  handleResetPwd = id => {
    const { dispatch } = this.props;
    createConfirm({
      content: '确认重置密码吗？',
      onOk: () => {
        dispatch({ type: `${DOMAIN}/resetPwd`, payload: id });
      },
    });
  };

  render() {
    const { loading, sysusers, dispatch } = this.props;
    const { list, total, searchForm } = sysusers;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'ASC',
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
      searchForm,
      searchBarForm: [
        {
          title: formatMessage({ id: 'sys.system.mainQuery', desc: '主查询' }),
          dataIndex: 'nameLike',
          options: {
            initialValue: searchForm.nameLike,
          },
          tag: <Input placeholder="匹配用户名、登录名、邮箱、电话" />,
        },
        {
          title: formatMessage({ id: 'sys.system.role', desc: '角色' }),
          dataIndex: 'roleCode',
          options: {
            initialValue: searchForm.roleCode,
          },
          tag: (
            <AsyncSelect
              mode="multiple"
              source={() => findRoles({ limit: 0 }).then(resp => resp.response.rows)}
            />
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
        // {
        //   title: 'id',
        //   dataIndex: 'id',
        //   className: 'text-center',
        // },
        {
          title: formatMessage({ id: 'sys.system.roles.name', desc: '姓名' }),
          dataIndex: 'name',
          className: 'text-center',
          width: '8%',
          render: (value, rowData) => {
            const href = `/sys/system/user/detail?id=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: formatMessage({ id: 'sys.system.loginName', desc: '登录名' }),
          dataIndex: 'login',
          width: '20%',
        },
        // {
        //   title: formatMessage({ id: 'sys.system.resNo', desc: '资源编号' }),
        //   dataIndex: 'resNo',
        // },
        // {
        //   title: formatMessage({ id: 'sys.system.resName', desc: '资源' }),
        //   dataIndex: 'resName',
        // },
        {
          title: formatMessage({ id: 'sys.system.email', desc: '邮箱' }),
          dataIndex: 'email',
          width: '20%',
        },
        {
          title: formatMessage({ id: 'sys.system.phone', desc: '手机号' }),
          dataIndex: 'phone',
          width: '14%',
        },
        {
          title: formatMessage({ id: 'sys.system.status', desc: '状态' }),
          dataIndex: 'disabled',
          className: 'text-center',
          width: '8%',
          render: (value, record, index) => (
            <Switch
              checked={!value} // Tag: disabled，所以要绕一下
              checkedChildren={formatMessage({ id: 'sys.system.status.valid', desc: '有效' })}
              unCheckedChildren={formatMessage({ id: 'sys.system.status.invalid', desc: '无效' })}
              onChange={checked => {
                const { id } = record;
                if (checked) {
                  dispatch({ type: `${DOMAIN}/enable`, payload: { id, record } });
                } else {
                  dispatch({ type: `${DOMAIN}/disable`, payload: { id, record } });
                }
              }}
            />
          ),
        },
        {
          title: formatMessage({ id: 'sys.system.role', desc: '角色' }),
          dataIndex: 'roles',
          width: '30%',
          render: (value, record, index) =>
            (value || []).map((item, i) => <Tag key={item.code}>{item.name}</Tag>),
        },
        // {
        //   title: '能力配置',
        //   dataIndex: 'perms',
        //   render: (value, record, index) => <Icon type="setting" onClick={() => {}} />,
        // },
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
            router.push('/sys/system/user/create');
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
            router.push(`/sys/system/user/edit?id=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'reset',
          icon: 'tag',
          className: 'tw-btn-info',
          title: '重置密码',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.handleResetPwd(selectedRowKeys[0]);
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

export default SystemUser;
