import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Form, Radio } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { omit } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';

const DOMAIN = 'weeklyReportCheck';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const formatYW = value => `${moment(value).weekYear()}${formatDT(value, 'WW')}`;
@connect(({ loading, weeklyReportCheck, dispatch, user }) => ({
  weeklyReportCheck,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class WeeklyReportCheck extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/clean` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { yearWeekStart } = params || [];
    let newYearWeekStart;
    if (Array.isArray(yearWeekStart) && yearWeekStart[0] && yearWeekStart[1]) {
      newYearWeekStart = {
        yearWeekStart: formatYW(yearWeekStart[0]),
        yearWeekEnd: formatYW(yearWeekStart[1]),
      };
    }

    const newParams = {
      ...newYearWeekStart,
      ...omit(['yearWeekStart'], params),
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...newParams } });
  };

  render() {
    const {
      weeklyReportCheck: { list, total, searchForm, resDataSource, baseBuData },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource: list,
      enableSelection: false,
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
          title: '期间',
          dataIndex: 'yearWeekStart',
          options: {
            initialValue: searchForm.yearWeekStart,
          },
          tag: (
            <DatePicker.RangePicker // 只能选周一
              disabledDate={current =>
                moment(current).format('YYYY-MM-DD') !==
                moment(current)
                  .startOf('week')
                  .format('YYYY-MM-DD')
              }
              format="YYYY-MM-DD"
            />
          ),
        },
        {
          title: '执行人',
          dataIndex: 'reportResId',
          options: {
            initialValue: searchForm.reportResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择执行人"
            />
          ),
        },
        // {
        //   title: '汇报对象',
        //   dataIndex: 'reportedResId',
        //   options: {
        //     initialValue: searchForm.reportedResId || undefined,
        //   },
        //   tag: (
        //     <Selection.Columns
        //       className="x-fill-100"
        //       source={resDataSource}
        //       columns={particularColumns}
        //       transfer={{ key: 'id', code: 'id', name: 'name' }}
        //       dropdownMatchSelectWidth={false}
        //       showSearch
        //       onColumnsChange={value => {}}
        //       placeholder="请选择汇报对象"
        //       mode="multiple"
        //     />
        //   ),
        // },
        {
          title: 'BaseBU',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择所属BU"
            />
          ),
        },
        {
          title: '资源负责人',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源负责人"
            />
          ),
        },
      ],
      columns: [
        {
          title: '填报人',
          dataIndex: 'reportResName',
          align: 'center',
        },
        {
          title: '周报开始日(周一)',
          dataIndex: 'weekStartDate',
          align: 'center',
          render: (value, rowData) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            return (
              <Link
                className="tw-link"
                to={`/user/weeklyReport/weeklyReportView?id=${rowData.id}&${from}`}
              >
                {value}
              </Link>
            );
          },
        },
        {
          title: '年周',
          dataIndex: 'yearWeek',
          align: 'center',
        },
        {
          title: '汇报对象',
          dataIndex: 'reportedResName',
          align: 'center',
        },
        {
          title: '汇报时间',
          dataIndex: 'reportDate',
          align: 'center',
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '资源负责人',
          dataIndex: 'presName',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="周报查看">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default WeeklyReportCheck;
