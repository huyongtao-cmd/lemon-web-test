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
          title: '????????????',
          dataIndex: 'sourceNo',
          options: {
            initialValue: searchForm.sourceNo,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'sourceType',
          options: {
            initialValue: searchForm.sourceType,
          },
          tag: <Selection.UDC code="ACC.LEDGER_SOURCE_TYPE" placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: <Selection source={() => selectProject()} placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId,
          },
          tag: <Selection source={() => selectAllTask()} placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'settleDate',
          // options: {
          //   initialValue: searchForm.settleDate,
          // },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        {
          title: '??????',
          dataIndex: 'date',
          // options: {
          //   initialValue: searchForm.date,
          // },
          tag: <MonthRangePicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '???????????????',
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'sourceClassName',
        },
        {
          title: '????????????',
          dataIndex: 'sourceTypeName',
          align: 'center',
        },
        {
          title: '???????????????',
          dataIndex: 'qty',
          align: 'right',
        },
        {
          title: '????????????',
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '??????',
          dataIndex: 'currCodeName',
          align: 'center',
        },
        {
          title: 'FROM??????',
          dataIndex: 'oledgerNo',
        },
        {
          title: 'TO??????',
          dataIndex: 'iledgerNo',
        },
        {
          title: '????????????',
          dataIndex: 'projName',
        },
        {
          title: '????????????',
          dataIndex: 'taskName',
        },
        {
          title: '??????????????????',
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
          title: '????????????',
          dataIndex: 'settleDate',
        },
        {
          title: '????????????',
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '????????????',
          dataIndex: 'finPeriod',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '??????????????????',
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
