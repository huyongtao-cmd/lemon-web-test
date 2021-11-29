import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import { injectUdc, mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';

const DOMAIN = 'myTicketMgmt';

@connect(({ loading, myTicketMgmt }) => ({
  // loading,
  myTicketMgmt,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@injectUdc(
  {
    ticketUdcList: 'ACC:USE_STATUS',
    ticketExpTypeList: 'ACC:TICKET_EXP_TYPE',
  },
  DOMAIN
)
@mountToTab()
class TicketMgmt extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC', offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { bookingDate, tripDate, ...restParams } = params || {};
    const bookingDateObject = { bookingDateStart: undefined, bookingDateEnd: undefined };
    if (!isNil(bookingDate) && !isEmpty(bookingDate)) {
      const [bookingDateStart, bookingDateEnd] = bookingDate;
      bookingDateObject.bookingDateStart = bookingDateStart;
      bookingDateObject.bookingDateEnd = bookingDateEnd;
    }
    const tripDateObject = { tripDateStart: undefined, tripDateEnd: undefined };
    if (!isNil(tripDate) && !isEmpty(tripDate)) {
      const [tripDateStart, tripDateEnd] = tripDate;
      tripDateObject.tripDateStart = tripDateStart;
      tripDateObject.tripDateEnd = tripDateEnd;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...restParams, ...bookingDateObject } });
  };

  render() {
    const { loading, myTicketMgmt, dispatch } = this.props;
    const { list, total, searchForm } = myTicketMgmt;
    const { _udcMap = {} } = this.state;
    const { ticketUdcList = [], ticketExpTypeList = [] } = _udcMap;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2000 },
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
          title: '出差申请单',
          dataIndex: 'applyNoOrName',
        },
        {
          title: '出差申请流程',
          dataIndex: 'apprStatusName',
        },
        {
          title: '购票日期',
          dataIndex: 'bookingDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '出发日期',
          dataIndex: 'tripDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '出差申请人',
          dataIndex: 'applyResName',
        },
        {
          title: '票务使用状态',
          dataIndex: 'applyStatus',
          tag: <Selection source={ticketUdcList} placeholder="请选择票务使用状态" />,
        },
        {
          title: '费用类型',
          dataIndex: 'ticketExpType',
          tag: <Selection source={ticketExpTypeList} placeholder="请选择费用类型" />,
        },
      ],
      columns: [
        {
          title: '票务使用状态',
          dataIndex: 'useStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '费用类型',
          dataIndex: 'ticketExpTypeDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '报销状态',
          dataIndex: 'apprStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '购票渠道',
          dataIndex: 'buyType',
          // width: 200,
        },
        {
          title: '购票日期',
          dataIndex: 'bookingDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '出发日期',
          dataIndex: 'tripDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '航班/车次',
          dataIndex: 'vehicleNo',
          width: 100,
        },
        {
          title: '时间',
          dataIndex: 'timespan',
          align: 'right',
          width: 100,
          // render: value => formatDT(value),
        },
        {
          title: '出发地',
          dataIndex: 'fromPlaceDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '目的地',
          dataIndex: 'toPlaceDesc',
          width: 100,
        },
        {
          title: '出差人',
          dataIndex: 'tripResName',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'expAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '相关出差单号',
          dataIndex: 'applyNo',
          width: 150,
        },
        {
          title: '出差申请单名称',
          dataIndex: 'applyName',
          // width: 250,
        },
        {
          title: '出差申请流程',
          dataIndex: 'procNo',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          width: 150,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="行政订票管理">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/user/center/myTravel`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TicketMgmt;
