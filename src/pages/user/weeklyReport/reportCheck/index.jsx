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
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'MyReportCheckList';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, MyReportCheckList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...MyReportCheckList,
  dispatch,
  user,
}))
@mountToTab()
class MyReportCheckList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
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
          title: '阅读状态',
          dataIndex: 'readStatus',
          tag: (
            <UdcSelect
              // value={workLogPeriodType}
              code="TSK:WORK_REPORT_READ_STATE"
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
          title: '填报人',
          dataIndex: 'reportResIdName',
          options: {
            initialValue: searchForm.reportResIdName || undefined,
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
              placeholder="请选择填报人"
              // mode="multiple"
            />
          ),
        },
      ],
      columns: [
        {
          title: '填报人',
          dataIndex: 'reportResIdName',
          width: '20%',
        },
        {
          title: '日期',
          dataIndex: 'dateStart',
          width: '20%',
          render: (value, row, index) => (value ? `${row.dateStart} ~ ${row.dateEnd}` : ''),
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
          title: '阅读状态',
          dataIndex: 'readStatus',
          width: '10%',
        },
        {
          title: '详情',
          dataIndex: 'multiDetail',
          render: (value, rowData) => {
            const { id } = rowData;
            // const reportSource = false;
            const href = `/user/weeklyReport/workReportDetail?id=${id}&reportSource=${true}`;
            return (
              <Link className="tw-link" to={href}>
                阅读
              </Link>
            );
          },
        },
      ],
      leftButtons: [],
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

export default MyReportCheckList;
