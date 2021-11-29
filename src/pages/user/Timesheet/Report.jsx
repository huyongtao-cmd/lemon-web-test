import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, DatePicker } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { omit, keys, values, isNil, isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import styles from './Report.less';

const { MonthPicker } = DatePicker;
const buColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'timesheetReport';

@connect(({ loading, timesheetReport, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  timesheetReport,
}))
@mountToTab()
class TimesheetReport extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource: [] } });
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/queryBuSelect` });
    dispatch({ type: `${DOMAIN}/queryOrgSelect` });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const { month } = params || {};
    if (isNil(month)) {
      createMessage({ type: 'warn', description: '请选择月份后再查询' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        month: moment(month).format('YYYYMM'),
        monthDays: moment(month).format('YYYY-MM'),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      timesheetReport: { dataSource, total, searchForm, orgList, buList, dateCfg },
    } = this.props;

    const tableProps = {
      title: () => (
        <Row className={styles.tip}>
          <span>图例</span>
          <ul>
            <li>空白--未提交</li>
            <li>图标上的数字--提交工时数</li>
            <li>
              <i className={styles.blue} />
              --已提交未审批工时
            </li>
            <li>
              <i className={styles.green} />
              --已审批(全部为有任务工时)
            </li>
            <li>
              <i className={styles.orange} />
              --已审批(全部为无任务工时)
            </li>
            <li>
              <i className={styles.yellow} />
              --已审批(部分为有任务工时，部分为无任务工时)
            </li>
          </ul>
        </Row>
      ),
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'resId',
      sortBy: 'resId',
      sortDirection: 'ASC',
      scroll: { x: isEmpty(dateCfg) ? 480 : 480 + dateCfg.length * 50 },
      showColumn: false,
      showExport: false,
      enableSelection: false,
      dataSource,
      total,
      // searchForm,
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
          title: '月份',
          dataIndex: 'month',
          options: {
            initialValue: isNil(searchForm.month) ? undefined : searchForm.month,
          },
          tag: <MonthPicker className="x-fill-100" mode="month" format="YYYY-MM" />,
        },
        {
          title: 'BU',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择所属组织"
              source={orgList}
              columns={buColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
        {
          title: '资源负责人',
          dataIndex: 'upResId',
          options: {
            initialValue: searchForm.upResId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择资源负责人"
              source={buList}
              columns={buColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择资源"
              source={buList}
              columns={buColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          fixed: 'left',
          align: 'center',
          width: 100,
        },
        {
          title: '资源',
          dataIndex: 'resName',
          fixed: 'left',
          align: 'center',
          width: 100,
        },
        {
          title: '资源负责人',
          dataIndex: 'upResName',
          fixed: 'left',
          align: 'center',
          width: 100,
        },
        {
          title: 'BU',
          dataIndex: 'baseBuName',
          fixed: 'left',
          align: 'center',
          width: 180,
        },
      ].concat(
        dateCfg.map((v, i) => ({
          title: () => v.date.slice(8),
          dataIndex: 'itemList',
          align: 'center',
          width: 50,
          key: Math.random(),
          render: val => {
            let color = '';
            switch (val[i]?.type) {
              case '1':
                color = 'blue';
                break;
              case '2':
                color = 'orange';
                break;
              case '3':
                color = 'green';
                break;
              case '4':
                color = 'yellow';
                break;
              default:
                break;
            }
            return <i className={styles[color]}>{val[i]?.hours}</i>;
          },
        }))
      ),
    };

    return (
      <PageHeaderWrapper title="工时填报报表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TimesheetReport;
