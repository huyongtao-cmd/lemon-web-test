import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { Switch, Tag, Input, Select, DatePicker, Tooltip } from 'antd';
import { toQs, toUrl } from '@/utils/stringUtils';
import router from 'umi/router';

const { RangePicker } = DatePicker;

const DOMAIN = 'jdeTimesheets';

@connect(({ loading, jdeTimesheets }) => ({
  jdeTimesheets,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class JdeTimesheets extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = params => {
    const {
      dispatch,
      jdeTimesheets: { searchForm },
    } = this.props;
    const searchFormNew = Object.assign({}, searchForm);
    searchFormNew.dateRangeStart = formatDT(searchForm.dateRangeStart);
    searchFormNew.dateRangeTo = formatDT(searchForm.dateRangeTo);
    dispatch({ type: `${DOMAIN}/query`, payload: searchFormNew });
  };

  /**
   * 导出excel
   */
  handleExport = () => {
    let exportUrl = `${SERVER_URL}/api/op/v1/jdeTimesheetReport/export`;
    const {
      jdeTimesheets: { searchForm },
    } = this.props;
    const searchFormNew = Object.assign({}, searchForm);
    searchFormNew.dateRangeStart = formatDT(searchForm.dateRangeStart);
    searchFormNew.dateRangeTo = formatDT(searchForm.dateRangeTo);
    exportUrl = toQs(exportUrl, searchFormNew);
    window.location.href = exportUrl;
  };

  render() {
    const { loading, jdeTimesheets, dispatch } = this.props;
    const { list, total, searchForm } = jdeTimesheets;

    const tableProps = {
      rowKey: 'id',
      pagination: false,
      columnsCache: DOMAIN,
      enableSelection: false,
      loading,
      total,
      dataSource: list,

      /**
       * 点击查询时重新拉取数据
       * @param filters
       */
      onChange: filters => {
        this.fetchData();
      },
      /**
       * 监听组件状态变化,更新state
       * @param changedValues
       * @param allValues
       */
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: formatMessage({ id: 'user.timesheet.jde.query.dateRange', desc: '日期范围' }),
          dataIndex: 'dateRange',
          options: {
            initialValue: [searchForm.dateRangeStart, searchForm.dateRangeTo],
          },
          allowClear: true,
          tag: (
            <RangePicker
              ranges={{
                上月: [
                  moment()
                    .add(-1, 'months')
                    .startOf('month'),
                  moment()
                    .add(-1, 'months')
                    .endOf('month'),
                ],
                本月: [moment().startOf('month'), moment().endOf('month')],
              }}
            />
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
          title: formatMessage({ id: 'user.timesheet.jde.table.resName', desc: '姓名' }),
          dataIndex: 'resName',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.projName', desc: '项目名' }),
          dataIndex: 'projName',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.buName', desc: 'BU名' }),
          dataIndex: 'buName',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwelco', desc: '项目所属公司' }),
          dataIndex: 'rwelco',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwelkco', desc: '资源归属公司' }),
          dataIndex: 'rwelkco',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwctry', desc: '世纪' }),
          dataIndex: 'rwctry',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwfy', desc: '年度' }),
          dataIndex: 'rwfy',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwpn', desc: '期间' }),
          dataIndex: 'rwpn',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwomcu', desc: '项目成本中心' }),
          dataIndex: 'rwomcu',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.expenseBu', desc: '费用承担BU' }),
          dataIndex: 'expenseBu',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.jdeProjNo', desc: '原项目号' }),
          dataIndex: 'jdeProjNo',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwsfnb', desc: '员工号' }),
          dataIndex: 'rwsfnb',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwelnopj', desc: '分类' }),
          dataIndex: 'rwelnopj',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.rwelumcf', desc: '当量系数' }),
          dataIndex: 'rwelumcf',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.eladwd', desc: '计算天数' }),
          dataIndex: 'eladwd',
        },
        {
          title: formatMessage({ id: 'user.timesheet.jde.table.eltclose', desc: '结算当量' }),
          dataIndex: 'eltclose',
        },
      ],
      leftButtons: [
        {
          key: 'export',
          icon: 'export',
          className: 'tw-btn-info',
          title: '导出',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.handleExport();
          },
        },
        {
          key: 'jdeConfig',
          icon: 'setting',
          className: 'tw-btn-info',
          title: '导出日期设置',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/finAccout/jde-timesheet-date-config`);
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

export default JdeTimesheets;
