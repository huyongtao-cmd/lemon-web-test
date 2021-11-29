// 报告查看
import React, { PureComponent } from 'react';
import { Input, Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, UdcSelect, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'myReportList';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, myReportList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...myReportList,
  dispatch,
  user,
}))
@mountToTab()
class MyReportList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const dateStart = params.reportDate ? params.reportDate[0] : '';
    const dateEnd = params.reportDate ? params.reportDate[1] : '';
    // const { reportToResId, reportType } = params;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        dateStart,
        dateEnd,
        ...params,
      },
    });
  };

  toSearch = () => {};

  tablePropsConfig = () => {
    const {
      loading,
      dataSource,
      total,
      searchForm,
      dispatch,
      user,
      workLogPeriodType,
    } = this.props;
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
          title: '报告类型',
          dataIndex: 'reportType',
          tag: (
            <UdcSelect
              // value={workLogPeriodType}
              code="TSK:WORK_REPORT_TYPE"
              placeholder="请选择报告类型"
              // onChange={value => value && this.fetchData(value)}
            />
          ),
        },
        {
          title: '日期范围',
          dataIndex: 'reportDate',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '汇报给',
          dataIndex: 'reportToResId',
          options: {
            initialValue: searchForm.reportToResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择相关负责人"
              // mode="multiple"
            />
          ),
        },
      ],
      columns: [
        {
          title: '汇报给',
          dataIndex: 'reportToResIdName',
          width: '20%',
        },
        {
          title: '日期',
          dataIndex: 'dateStart',
          width: '20%',
          render: (value, row, index) => (value ? `${row.dateStart} ~ ${row.dateEnd}` : ''),
        },
        {
          title: '状态',
          dataIndex: 'reportStatusName',
          width: '10%',
        },
        {
          title: '报告类型',
          dataIndex: 'reportTypeName',
          width: '10%',
        },
        {
          title: '工作总结',
          dataIndex: 'workSummary',
          width: '30%',
        },
        {
          title: '详情',
          dataIndex: 'multiDetail',
          render: (value, rowData) => {
            const { id } = rowData;
            // const reportSource = false;
            const href = `/user/weeklyReport/workReportDetail?id=${id}&reportSource=${false}`;
            return (
              <Link className="tw-link" to={href}>
                报告详情
              </Link>
            );
          },
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          // hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            if (selectedRows[0].reportStatus === 'SUBMIT') {
              createMessage({ type: 'warn', description: '已提交无法修改！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/user/weeklyReport/workReportEdit?id=' + id);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          // loading,
          // hidden: true,
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
                  payload: selectedRowKeys,
                }),
            });
          },
        },
        {
          key: 'submit',
          icon: 'upload',
          className: 'tw-btn-primary',
          title: '汇报',
          loading: false,
          // hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            if (selectedRows[0].reportStatus === 'CREATE') {
              dispatch({
                type: `${DOMAIN}/modalSaveReport`,
                payload: selectedRowKeys[0],
              });
            } else {
              createMessage({ type: 'warn', description: '已汇报' });
            }
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

export default MyReportList;
