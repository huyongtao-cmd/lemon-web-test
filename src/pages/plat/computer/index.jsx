import React, { PureComponent } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import moment from 'moment';
import { connect } from 'dva';
import { DatePicker, Tooltip, Modal } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { mountToTab } from '@/layouts/routerControl';
import { selectUsers } from '@/services/sys/user';
import { Selection } from '@/pages/gen/field';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'platComputer';
const { MonthPicker } = DatePicker;
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, platComputer }) => ({
  platComputer,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class PlatComputerApply extends PureComponent {
  componentDidMount() {
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  deleteItem = (ids, queryParams) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/deleteRow`,
      payload: { ids, queryParams },
    });
  };

  render() {
    const { dispatch, platComputer, loading } = this.props;
    const { dataSource, total, searchForm } = platComputer;
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
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '申请id',
          dataIndex: 'id',
          options: {
            initialValue: searchForm.id,
          },
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker format="YYYY-MM-DD" className="x-fill-100" />,
        },
        {
          title: '补贴起始月份',
          dataIndex: 'startPeriodId',
          options: {
            initialValue: searchForm.startPeriodId,
          },
          tag: <MonthPicker format="YYYY-MM" mode="month" className="x-fill-100" />,
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择报销申请人"
              showSearch
            />
          ),
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatus',
          options: {
            initialValue: searchForm.applyStatus,
          },
          tag: <Selection.UDC code="TSK:PC_APPLY_STATUS" placeholder="申请状态" />,
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="审批状态" />,
        },
      ],
      columns: [
        {
          title: '申请id',
          dataIndex: 'id',
          sorter: true,
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/expense/computer/apply/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '申请人',
          dataIndex: 'applyResName',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          render: value => (value ? moment(value).format('YYYY-MM-DD') : value),
        },
        {
          title: '补贴起始月份',
          dataIndex: 'startPeriodId',
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '申请理由',
          dataIndex: 'applyDesc',
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
          key: 'edit',
          className: 'tw-btn-primary',
          title: <Title id="misc.update" />,
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].applyStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/expense/computer/apply/edit?id=${selectedRowKeys}&page=list`);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows[0] && selectedRows.filter(item => item.applyStatus !== 'CREATE').length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            Modal.confirm({
              title: '删除自购电脑申请',
              content: '确定删除吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => this.deleteItem(selectedRowKeys, queryParams),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="自购电脑申请列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PlatComputerApply;
