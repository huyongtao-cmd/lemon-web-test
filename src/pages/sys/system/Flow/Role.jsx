import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { connect } from 'dva';
import { has } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { TagOpt } from '@/utils/tempUtils';

const DOMAIN = 'flowRoles';
const hasStartTime = has('startTime');

@connect(({ dispatch, loading, flowRoles }) => ({
  dispatch,
  flowRoles,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class FlowRoles extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tableCfg = () => {
    const { loading, flowRoles, dispatch } = this.props;
    const { searchForm, list, total } = flowRoles;
    const tableProps = {
      rowKey: 'id',
      scroll: {
        x: '100%',
      },
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      dataSource: list,
      onChange: filters => {
        if (hasStartTime(filters)) {
          const { startTime } = filters;
          const convertTime = startTime ? formatDT(startTime) : undefined;
          this.fetchData({ ...filters, startTime: convertTime });
        } else {
          this.fetchData(filters);
        }
      },
      onSearchBarChange: (_, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: formatMessage({ id: 'sys.system.flow.roleCode', desc: '角色编号' }),
          dataIndex: 'flowRoleCode',
          options: {
            initialValue: searchForm.flowRoleCode,
          },
        },
        {
          title: formatMessage({ id: 'sys.system.flow.roleName', desc: '角色名称' }),
          dataIndex: 'flowRoleName',
          options: {
            initialValue: searchForm.flowRoleName,
          },
        },
      ],
      columns: [
        {
          title: formatMessage({ id: 'sys.system.flow.roleCode', desc: '角色编号' }),
          dataIndex: 'flowRoleCode',
          className: 'text-center',
          width: '200',
        },
        {
          title: formatMessage({ id: 'sys.system.flow.roleName', desc: '角色名称' }),
          dataIndex: 'flowRoleName',
        },
        {
          title: '人员配置',
          dataIndex: 'userNames',
        },
        {
          title: formatMessage({ id: 'sys.system.flow.isMoreUser', desc: '是否多人' }),
          dataIndex: 'isMoreUser',
          className: 'text-center',
          width: '50',
          render: (value, record, index) => {
            const isMore = value || false;
            return (
              <TagOpt
                value={isMore}
                opts={[{ code: true, name: '是' }, { code: false, name: '否' }]}
                palette="green|red"
              />
            );
          },
        },
        {
          title: formatMessage({ id: 'sys.system.flow.roleStatus', desc: '角色状态' }),
          dataIndex: 'roleStatus',
          width: '50',
          className: 'text-center',
          render: (value, record, index) => {
            const isMore = value || false;
            return (
              <TagOpt
                value={isMore}
                opts={[{ code: true, name: '有效' }, { code: false, name: '无效' }]}
                palette="green|red"
              />
            );
          },
          // render: value => value ? '有效' : '无效',
        },
        {
          title: formatMessage({ id: 'sys.system.remark', desc: '备注' }),
          dataIndex: 'remark',
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
            router.push('/sys/flowMen/flow/roles/create');
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
            router.push(`/sys/flowMen/flow/roles/edit?id=${selectedRowKeys[0]}`);
          },
        },
        // 删除说不要，我这里就先隐藏了
        // {
        //   key: 'remove',
        //   icon: 'file-excel',
        //   className: 'tw-btn-error',
        //   title: formatMessage({ id: `misc.delete`, desc: '删除' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 2,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     dispatch({ type: `${DOMAIN}/delete`, payload: selectedRowKeys });
        //   },
        // },
      ],
    };
    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="流程角色">
        <DataTable {...this.tableCfg()} />
      </PageHeaderWrapper>
    );
  }
}

export default FlowRoles;
