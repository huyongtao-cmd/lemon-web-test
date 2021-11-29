import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'businessCheckList';

@connect(({ loading, businessCheckList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  switchLoading: loading.effects[`${DOMAIN}/switchChange`],
  ...businessCheckList,
  dispatch,
  user,
}))
@mountToTab()
class BusinessCheckList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { params, functionId: param.functionId } });
  };

  onSwitchChange = params => {
    const { dispatch } = this.props;
    const enabled = params.value === 1 ? 0 : 1;
    dispatch({ type: `${DOMAIN}/switchChange`, payload: { id: params.id, enabled } });
  };

  tablePropsConfig = () => {
    const { loading, switchLoading, dataSource, total, searchForm, dispatch, user } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '检查名称',
          dataIndex: 'checkName',
          options: {
            initialValue: searchForm.checkName,
          },
          tag: <Input placeholder="请输入功能名称" />,
        },
      ],
      columns: [
        {
          title: '检查名称',
          dataIndex: 'checkName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sys/system/businessCheckDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '检查开关',
          dataIndex: 'enabledFlag',
          render: (value, row, index) => (
            <Switch
              loading={switchLoading}
              checkedChildren="开"
              unCheckedChildren="关"
              checked={value !== 0}
              disabled={row.allowCloseFlag === 0}
              onChange={() => this.onSwitchChange({ id: row.id, value })}
            />
          ),
        },
        {
          title: '允许关闭',
          dataIndex: 'allowCloseFlag',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '配置参数1',
          dataIndex: 'ext1',
        },
        {
          title: '配置参数2',
          dataIndex: 'ext2',
        },
        {
          title: '配置参数3',
          dataIndex: 'ext3',
        },
        {
          title: '可配置参数说明',
          dataIndex: 'configRemark',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: true,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/sys/system/businessCheckEdit'),
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/sys/system/businessCheckEdit?id=' + id);
          },
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push('/sys/system/businessCheckEdit?copy=true&id=' + selectedRowKeys[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading,
          hidden: true,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length < 1) {
              createMessage({ type: 'warn', description: '请至少选择一条记录删除！' });
              return;
            }
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { keys: selectedRowKeys.join(',') },
                }),
            });
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default BusinessCheckList;
