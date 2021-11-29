import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil, isEmpty } from 'ramda';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import Link from 'umi/link';

const DOMAIN = 'ticketMgmt';

@connect(({ loading, ticketMgmt }) => ({
  // loading,
  ticketMgmt,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@injectUdc(
  {
    ticketUdcList: 'ACC:USE_STATUS',
    ticketExpTypeList: 'ACC:TICKET_EXP_TYPE',
    reimbursementStatusList: 'ACC.REIM_STATE',
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

  onCellChange = (rowData, rowField) => rowFieldValue => {
    const { dispatch, ticketMgmt } = this.props;
    const { list } = ticketMgmt;
    const newList = list.map(row => {
      if (row.id === rowData.id) {
        return { ...row, [rowField]: rowFieldValue };
      }
      return row;
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { list: newList } });
  };

  render() {
    const { loading, ticketMgmt, dispatch } = this.props;
    const { list, total, searchForm } = ticketMgmt;
    const { _udcMap = {} } = this.state;
    const { ticketUdcList = [], ticketExpTypeList = [], reimbursementStatusList = [] } = _udcMap;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2000 },
      loading,
      total,
      dataSource: list,
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
          dataIndex: 'procInfo',
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
          dataIndex: 'useStatus',
          tag: <Selection source={ticketUdcList} placeholder="请选择票务使用状态" />,
        },
        {
          title: '费用类型',
          dataIndex: 'ticketExpType',
          tag: <Selection source={ticketExpTypeList} placeholder="请选择费用类型" />,
        },
        {
          title: '报销状态',
          dataIndex: 'reimbursementStatus',
          tag: <Selection source={reimbursementStatusList} placeholder="请选择报销类型" />,
        },
      ],
      columns: [
        {
          title: '票务使用状态',
          dataIndex: 'useStatusDesc',
          width: 100,
          // render: (value, rowData) => (
          //   <Selection
          //     source={ticketUdcList}
          //     value={value}
          //     onChange={this.onCellChange(rowData, 'useStatus')}
          //     placeholder="请选择票务使用状态"
          //     allowClear={false}
          //   />
          // ),
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
          dataIndex: 'reimbursementStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '出差申请单名称',
          dataIndex: 'applyName',
          // width: 250,
          render: (key, { applyId }, index) => (
            <Link
              to={`/user/center/travel/detail?id=${applyId}&isMy=1&sourceUrl=/plat/adminMgmt/ticketMgmt`}
            >
              {key}
            </Link>
          ),
        },
        {
          title: '相关出差单号',
          dataIndex: 'applyNo',
          width: 150,
        },
        {
          title: '购票渠道',
          dataIndex: 'ticketPurchasingChannelDesc',
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
          title: '出差申请流程',
          dataIndex: 'procNo',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          width: 150,
        },
      ],
      leftButtons: [
        {
          key: 'start',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '发起报销',
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            if (isEmpty(selectedRows) || isNil(selectedRows)) return false;
            // 1. 选择的订票详情行中的“票务使用状态”为“已使用”，“已出票”，要过滤出“SEARCHED”的状态
            // 2. 选择的订票详情行中的“购票渠道”必须相同，否则无法发起报销并提示报错
            // 3. 所选中的订票信息行的”报销状态“为”未报销“或空

            // step one: filter 1. 3.
            const useStatusApprStatusFilter = selectedRows.filter(
              (
                { useStatus, reimbursementStatus } // 1. useStatus ; 3. reimbursementStatusDesc
              ) =>
                useStatus === 'SEARCHED' ||
                !(
                  isNil(reimbursementStatus) ||
                  isEmpty(reimbursementStatus) ||
                  reimbursementStatus === 'UNREIM'
                )
            );
            const useStatusApprStatusSatisfy = isEmpty(useStatusApprStatusFilter);
            // step one: 2.
            const buyTypeUnique =
              Array.from(
                new Set(selectedRows.map(({ ticketPurchasingChannel }) => ticketPurchasingChannel))
              ).length === 1;
            return !buyTypeUnique || !useStatusApprStatusSatisfy;
          },
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const ids = selectedRows.map(({ id }) => id);
            // dispatch({ type: `${DOMAIN}/batchExpense`, payload: { ids, queryParams } });
            router.push(`/plat/adminMgmt/ticketMgmt/details?idList=${ids.join(',')}`);
          },
        },

        {
          key: 'exportTrip',
          icon: 'export',
          className: 'tw-btn-warning',
          title: '导出差旅对账表',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows && selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const ids = selectedRowKeys.join(',');
            // aLink.download = '';
            window.open(`${SERVER_URL}/api/op/v1/tripTickets/statement/export?ids=${ids}`);
          },
        },
        {
          key: 'export',
          icon: 'export',
          className: 'tw-btn-warning',
          title: '导出因公差旅报销表',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows && selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const ids = selectedRowKeys.join(',');
            window.open(`${SERVER_URL}/api/op/v1/tripTickets/reim/export?ids=${ids}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="行政订票管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TicketMgmt;
