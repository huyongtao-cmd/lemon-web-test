import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, DatePicker, Button, Card } from 'antd';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { UdcSelect, MonthRangePicker } from '@/pages/gen/field';
import { selectProject, selectAllTask } from '@/services/gen/list';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';

const DOMAIN = 'resAccountEquivalent';

@connect(({ loading, resAccountEquivalent }) => ({
  resAccountEquivalent,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ResAccountEquivalent extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    // this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    // modified params
    const { settleDate, date, ...otherParams } = params;
    const settleDateObject = { settleDateFrom: undefined, settleDateTo: undefined };
    if (!isNil(settleDate) && !isEmpty(settleDate)) {
      settleDateObject.settleDateFrom = formatDT(settleDate[0]);
      settleDateObject.settleDateTo = formatDT(settleDate[1]);
    }
    const dateObject = { dateFrom: undefined, dateTo: undefined };
    const { date: standardDate, resId } = fromQs();
    if (!isNil(standardDate)) {
      dateObject.dateFrom = standardDate; // 既然有URL了， 取url上面的值更靠谱一些
      dateObject.dateTo = standardDate;
    } else if (!isNil(date) && !isEmpty(date)) {
      dateObject.dateFrom = formatDT(date[0], 'YYYYMM');
      dateObject.dateTo = formatDT(date[1], 'YYYYMM');
    }

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
        payload: { ...otherParams, ...settleDateObject, ...dateObject, id: resId },
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      resAccountEquivalent: { searchForm, dataSource, total },
    } = this.props;
    const { date } = fromQs();

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      loading,
      enableSelection: false,
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
          tag: <UdcSelect code="ACC.LEDGER_SOURCE_TYPE" placeholder="请选择交易类型" />,
        },
        {
          title: '相关项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: (
            <AsyncSelect
              source={() => selectProject().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择相关项目"
            />
          ),
        },
        {
          title: '相关任务',
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId,
          },
          tag: (
            <AsyncSelect
              source={() => selectAllTask().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择相关任务"
            />
          ),
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          options: {
            initialValue:
              searchForm.settleDateFrom && searchForm.settleDateTo
                ? [moment(searchForm.settleDateFrom), moment(searchForm.settleDateTo)]
                : [],
          },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        // 明细会携带date，届时直接传固定值
        isNil(date)
          ? {
              title: '期间',
              dataIndex: 'date',
              options: {
                initialValue:
                  searchForm.dateFrom && searchForm.dateTo
                    ? [moment(searchForm.dateFrom), moment(searchForm.dateTo)]
                    : [],
              },
              tag: <MonthRangePicker className="x-fill-100" />,
            }
          : {
              title: '期间',
              dataIndex: 'date',
              options: {
                initialValue: `${date}~${date}`,
              },
              tag: <Input disabled />,
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
          title: 'FROM账号名称',
          dataIndex: 'oledgerName',
        },
        {
          title: 'TO账号',
          dataIndex: 'iledgerNo',
        },
        {
          title: 'TO账号名称',
          dataIndex: 'iledgerName',
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
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              from
                ? closeThenGoto(
                    `/user/center/myTeam/resAccount?resId=${fromQs().resId}&from=${from}`
                  )
                : closeThenGoto(`/user/center/myTeam/resAccount?resId=${fromQs().resId}`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <DataTable {...tableProps} scroll={{ x: 1800 }} />
      </PageHeaderWrapper>
    );
  }
}

export default ResAccountEquivalent;
