import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, DatePicker } from 'antd';
import { isEmpty } from 'ramda';
import moment from 'moment';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { Selection, MonthRangePicker } from '@/pages/gen/field';
import { selectProject, selectAllTask } from '@/services/gen/list';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'userResLedgerIo';

@connect(({ loading, userResLedgerIo }) => ({
  userResLedgerIo,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ResLedgerIo extends PureComponent {
  componentDidMount() {
    // this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `user/fetchPrincipal`,
    }).then(currentUser => {
      if (!currentUser.user.extInfo) {
        createMessage({ type: 'warn', description: `当前登录人资源不存在` });
        return;
      }
      dispatch({
        type: `${DOMAIN}/query`,
        payload: params,
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userResLedgerIo: { searchForm, dataSource, total },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      enableSelection: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData({
          ...filters,
          ...searchForm,
          settleDate: null,
          settleDateFrom:
            searchForm.settleDate === undefined ? undefined : searchForm.settleDateFrom,
          settleDateTo: searchForm.settleDate === undefined ? undefined : searchForm.settleDateTo,
          date: null,
          dateFrom: searchForm.date === undefined ? undefined : searchForm.dateFrom,
          dateTo: searchForm.date === undefined ? undefined : searchForm.dateTo,
        });
      },
      onSearchBarChange: (changedValues, allValues) => {
        let searchData = { ...searchForm, ...changedValues };
        if (allValues && allValues.settleDate) {
          searchData = {
            ...searchData,
            settleDate: null,
            settleDateFrom: isEmpty(allValues.settleDate)
              ? null
              : moment(allValues.settleDate[0]).format('YYYY-MM-DD'),
            settleDateTo: isEmpty(allValues.settleDate)
              ? null
              : moment(allValues.settleDate[1]).format('YYYY-MM-DD'),
          };
        }
        if (allValues && allValues.date) {
          searchData = {
            ...searchData,
            date: null,
            dateFrom: isEmpty(allValues.date) ? null : allValues.date[0].format('YYYYMM'),
            dateTo: isEmpty(allValues.date) ? null : allValues.date[1].format('YYYYMM'),
          };
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: searchData,
        });
      },
      searchBarForm: [
        {
          title: '业务单号', // TODO: 国际化
          dataIndex: 'sourceNo',
          options: {
            initialValue: searchForm.sourceNo,
          },
          tag: <Input placeholder="请输入业务单号" />,
        },
        {
          title: '交易类型', // TODO: 国际化
          dataIndex: 'sourceType',
          options: {
            initialValue: searchForm.sourceType,
          },
          tag: <Selection.UDC code="ACC.LEDGER_SOURCE_TYPE" placeholder="请选择交易类型" />,
        },
        {
          title: '相关项目', // TODO: 国际化
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: <Selection source={() => selectProject()} placeholder="请选择相关项目" />,
        },
        {
          title: '相关任务', // TODO: 国际化
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId,
          },
          tag: <Selection source={() => selectAllTask()} placeholder="请选择相关任务" />,
        },
        {
          title: '结算日期', // TODO: 国际化
          dataIndex: 'settleDate',
          options: {
            initialValue:
              searchForm.settleDateFrom && searchForm.settleDateTo
                ? [moment(searchForm.settleDateFrom), moment(searchForm.settleDateTo)]
                : [],
          },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        {
          title: '期间', // TODO: 国际化
          dataIndex: 'date',
          options: {
            initialValue:
              searchForm.dateFrom && searchForm.dateTo
                ? [moment(searchForm.dateFrom), moment(searchForm.dateTo)]
                : [],
          },
          tag: <MonthRangePicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '交易流水号', // TODO: 国际化
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '交易类别', // TODO: 国际化
          dataIndex: 'sourceClassName',
        },
        {
          title: '交易类型', // TODO: 国际化
          dataIndex: 'sourceTypeName',
          align: 'center',
        },
        {
          title: '交易当量数', // TODO: 国际化
          dataIndex: 'qty',
          align: 'right',
        },
        {
          title: '交易金额', // TODO: 国际化
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '币种', // TODO: 国际化
          dataIndex: 'currCodeName',
          align: 'center',
        },
        {
          title: 'FROM账号', // TODO: 国际化
          dataIndex: 'oledgerNo',
        },
        {
          title: 'TO账号', // TODO: 国际化
          dataIndex: 'iledgerNo',
        },
        {
          title: '相关项目', // TODO: 国际化
          dataIndex: 'projName',
        },
        {
          title: '相关任务', // TODO: 国际化
          dataIndex: 'taskName',
        },
        {
          title: '相关业务单号', // TODO: 国际化
          dataIndex: 'sourceNo',
          align: 'center',
          //   render: (value, row, key) => (
          //     <Link
          //       className="tw-link"
          //       to={`/user/Project/projectDetail?id=${row.id}&from=myproject`}
          //     >
          //       {value}
          //     </Link>
          //   ),
        },
        {
          title: '结算日期', // TODO: 国际化
          dataIndex: 'settleDate',
        },
        {
          title: '会计年度', // TODO: 国际化
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '会计期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          align: 'right',
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 1600 }} />
      </PageHeaderWrapper>
    );
  }
}

export default ResLedgerIo;
