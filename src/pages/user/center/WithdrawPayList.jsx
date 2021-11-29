import React, { PureComponent } from 'react';
import { Input, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { DatePicker, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'withdrawPayList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, withdrawPayList, dispatch, user }) => ({
  loading,
  ...withdrawPayList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class WithdrawPayList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];
    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loadingStatus,
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
          title: '单据号',
          dataIndex: 'withdrawPayNo',
          options: {
            initialValue: searchForm.withdrawPayNo,
          },
          tag: <Input placeholder="请输入单据号" />,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '单据号',
          dataIndex: 'withdrawPayNo',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/center/withDrawPayDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '提现付款状态',
          dataIndex: 'withdrawPayStatusDesc',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
        },
        // {
        //   title: '提现当量',
        //   dataIndex: 'eqva',
        // },
        {
          title: '付款金额',
          dataIndex: 'amt',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, briefStatus } = selectedRows[0];
            if (briefStatus === 'CREATE') {
              router.push('/user/project/projectReport?id=' + id);
            } else {
              createMessage({ type: 'warn', description: '只有新建状态的可以修改！' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录进行删除！' });
              return;
            }
            const flag = selectedRows.filter(item => item.withdrawPayStatus !== 'CREATE').length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新建状态的可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: ids.join(',') },
            });
          },
        },
        {
          key: 'generateFlow',
          title: '生成报销流程',
          className: 'tw-btn-info',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条提现付款记录' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/autoFlow`,
              payload: { id: selectedRowKeys[0] },
            });
          },
        },
        {
          key: 'deleteFlow',
          title: '删除报销流程',
          className: 'tw-btn-info',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条提现付款记录' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/deleteFlow`,
              payload: { id: selectedRowKeys[0] },
            });
          },
        },
        {
          key: 'export',
          title: '导出报表',
          className: 'tw-btn-info',
          icon: 'export',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条提现付款记录' });
              return;
            }
            // saveAs(`https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg`);
            // saveAs(`${SERVER_URL}/api/worth/v1/withdraw/hrBatchExport`);
            // eslint-disable-next-line no-restricted-globals
            location.href = `${SERVER_URL}/api/worth/v1/withdraw_pay/export/${selectedRowKeys[0]}`;
          },
        },
      ],
    };
  };

  render() {
    return (
      <PageHeaderWrapper title="提现付款列表">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawPayList;
