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
          title: '???????????????',
          dataIndex: 'applyNoOrName',
        },
        {
          title: '??????????????????',
          dataIndex: 'apprStatusName',
        },
        {
          title: '????????????',
          dataIndex: 'bookingDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '????????????',
          dataIndex: 'tripDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '???????????????',
          dataIndex: 'applyResName',
        },
        {
          title: '??????????????????',
          dataIndex: 'applyStatus',
          tag: <Selection source={ticketUdcList} placeholder="???????????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'ticketExpType',
          tag: <Selection source={ticketExpTypeList} placeholder="?????????????????????" />,
        },
      ],
      columns: [
        {
          title: '??????????????????',
          dataIndex: 'useStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'ticketExpTypeDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'apprStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'buyType',
          // width: 200,
        },
        {
          title: '????????????',
          dataIndex: 'bookingDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '????????????',
          dataIndex: 'tripDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '??????/??????',
          dataIndex: 'vehicleNo',
          width: 100,
        },
        {
          title: '??????',
          dataIndex: 'timespan',
          align: 'right',
          width: 100,
          // render: value => formatDT(value),
        },
        {
          title: '?????????',
          dataIndex: 'fromPlaceDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '?????????',
          dataIndex: 'toPlaceDesc',
          width: 100,
        },
        {
          title: '?????????',
          dataIndex: 'tripResName',
          width: 100,
        },
        {
          title: '??????',
          dataIndex: 'expAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '??????????????????',
          dataIndex: 'applyNo',
          width: 150,
        },
        {
          title: '?????????????????????',
          dataIndex: 'applyName',
          // width: 250,
        },
        {
          title: '??????????????????',
          dataIndex: 'procNo',
        },
        {
          title: '????????????',
          dataIndex: 'createTime',
          width: 150,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="??????????????????">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/user/center/myTravel`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TicketMgmt;
