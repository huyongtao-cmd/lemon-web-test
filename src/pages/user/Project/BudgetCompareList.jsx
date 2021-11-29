import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Tooltip } from 'antd';
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
import Loading from '@/components/core/DataLoading';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'budgetCompareList';

@connect(({ loading, budgetCompareList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...budgetCompareList,
  dispatch,
  user,
}))
@mountToTab()
class BudgetCompareList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, projId: param.projId } });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      defaultExpandAllRows: true,
      pagination: false,
      enableSelection: false,
      showSearch: false,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [],
      columns: [
        // {
        //   title: '拨付单号',
        //   dataIndex: 'appropriationNo',
        //   render: (value, rowData) => {
        //     const { id } = rowData;
        //     const href = `/user/project/budgetAppropriationDetail?id=${id}`;
        //     return (
        //       <Link className="tw-link" to={href}>
        //         {value}
        //       </Link>
        //     );
        //   },
        // },
        {
          title: '科目编码',
          dataIndex: 'accCode',
        },
        {
          title: '科目',
          dataIndex: 'accName',
        },
        {
          title: '预算金额',
          dataIndex: 'budgetAmt',
        },
        {
          title: '已使用金额',
          dataIndex: 'amt',
        },
        {
          title: '申请中金额',
          dataIndex: 'usingAmt',
        },
        {
          title: (
            <span>
              汇总使用金额&nbsp;
              <Tooltip title="已使用金额和申请中金额相加,并且按照科目上下级关系下级汇总到上级">
                <Icon type="question-circle" />
              </Tooltip>
            </span>
          ),
          dataIndex: 'summaryAmt',
        },
        {
          title: '是否预算控制',
          dataIndex: 'budgetControlFlag',
          render: (value, rowData) => {
            if (value === undefined || value === null) {
              return '';
            }
            return value === 1 ? '是' : '否';
          },
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
          cb: () => router.push('/sys/system/functionEdit'),
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/sys/system/functionEdit?id=' + id);
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
            router.push('/sys/system/functionEdit?copy=true&id=' + selectedRowKeys[0]),
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
    const { loading } = this.props;

    return (
      <PageHeaderWrapper>
        {loading ? (
          <Loading />
        ) : (
          <>
            <DataTable {...this.tablePropsConfig()} />
          </>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default BudgetCompareList;
