import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Input } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { Selection, MonthRangePicker, DatePicker } from '@/pages/gen/field';
import { selectProject, selectAllTask } from '@/services/gen/list';

const DOMAIN = 'orgBuLedgerIo';

@connect(({ loading, orgBuLedgerIo }) => ({
  orgBuLedgerIo,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class BuLedgerIo extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      orgBuLedgerIo: { searchForm, dataSource, total },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      enableSelection: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        let searchData = { ...allValues };
        if (allValues && allValues.settleDate && allValues.settleDate.length > 0) {
          searchData = {
            ...searchData,
            settleDate: null,
            settleDateFrom: moment(allValues.settleDate[0]).format('YYYY-MM-DD'),
            settleDateTo: moment(allValues.settleDate[1]).format('YYYY-MM-DD'),
          };
        } else {
          searchData = {
            ...searchData,
            settleDate: null,
            settleDateFrom: null,
            settleDateTo: null,
          };
        }

        if (allValues && allValues.date && allValues.date.length > 0) {
          searchData = {
            ...searchData,
            date: null,
            dateFrom: allValues.date[0].format('YYYYMM'),
            dateTo: allValues.date[1].format('YYYYMM'),
          };
        } else {
          searchData = { ...searchData, date: null, dateFrom: null, dateTo: null };
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: searchData,
        });
      },
      searchBarForm: [
        {
          title: '业务单号',
          dataIndex: 'sourceNo',
          options: {
            initialValue: searchForm.sourceNo,
          },
          tag: <Input placeholder="请输入业务单号" />,
        },
        {
          title: '交易类型',
          dataIndex: 'sourceType',
          options: {
            initialValue: searchForm.sourceType,
          },
          tag: <Selection.UDC code="ACC.LEDGER_SOURCE_TYPE" placeholder="请选择交易类型" />,
        },
        {
          title: '相关项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: <Selection source={() => selectProject()} placeholder="请选择相关项目" />,
        },
        {
          title: '相关任务',
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId,
          },
          tag: <Selection source={() => selectAllTask()} placeholder="请选择相关任务" />,
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          // options: {
          //   initialValue: searchForm.settleDate,
          // },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        {
          title: '期间',
          dataIndex: 'date',
          // options: {
          //   initialValue: searchForm.date,
          // },
          tag: <MonthRangePicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '交易流水号',
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '交易类别',
          dataIndex: 'sourceClassName',
        },
        {
          title: '交易类型',
          dataIndex: 'sourceTypeName',
          align: 'center',
        },
        {
          title: '交易当量数',
          dataIndex: 'qty',
          align: 'right',
        },
        {
          title: '交易金额',
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '币种',
          dataIndex: 'currCodeName',
          align: 'center',
        },
        {
          title: 'FROM账号',
          dataIndex: 'oledgerNo',
        },
        {
          title: 'TO账号',
          dataIndex: 'iledgerNo',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
        },
        {
          title: '相关任务',
          dataIndex: 'taskName',
        },
        {
          title: '相关业务单号',
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
          title: '结算日期',
          dataIndex: 'settleDate',
        },
        {
          title: '会计年度',
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '会计期间',
          dataIndex: 'finPeriod',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增泛用当量',
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/plat/intelStl/list/common');
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 1600 }} />
      </PageHeaderWrapper>
    );
  }
}

export default BuLedgerIo;
