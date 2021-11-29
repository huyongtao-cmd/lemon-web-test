import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Input, DatePicker } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { UdcSelect, MonthRangePicker } from '@/pages/gen/field';
import { selectProject, selectTaskByProjIds } from '@/services/gen/list';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userProjLedgerIo';

@connect(({ loading, userProjLedgerIo }) => ({
  userProjLedgerIo,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class ProjLedgerIo extends PureComponent {
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
      userProjLedgerIo: { searchForm, dataSource, total },
    } = this.props;
    const param = fromQs();

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
          tag: <UdcSelect code="ACC.LEDGER_SOURCE_TYPE" placeholder="请选择交易类型" />,
        },
        {
          title: '相关任务', // TODO: 国际化
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId,
          },
          tag: (
            <AsyncSelect
              source={() =>
                (param.projId &&
                  selectTaskByProjIds({ projId: param.projId }).then(resp => resp.response)) ||
                []
              }
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择相关任务"
            />
          ),
        },
        {
          title: '结算日期', // TODO: 国际化
          dataIndex: 'settleDate',
          // options: {
          //   initialValue: searchForm.settleDate,
          // },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        {
          title: '期间', // TODO: 国际化
          dataIndex: 'date',
          // options: {
          //   initialValue: searchForm.date,
          // },
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

export default ProjLedgerIo;
