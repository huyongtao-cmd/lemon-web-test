import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
// import { formatMessage } from 'umi/locale';
import { isNil, isEmpty } from 'ramda';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { DatePicker, Selection, BuVersion } from '@/pages/gen/field';
import { selectBu, selectFinperiod } from '@/services/user/Contract/sales';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'distInfoMgmt';

@connect(({ loading, distInfoMgmt }) => ({
  // loading,
  distInfoMgmt,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class DistInfoMgmt extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    const { contractId, groupRole, gainerBuId } = fromQs();
    if (contractId && groupRole && gainerBuId) {
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: {
          contractId,
          groupRole,
          gainerBuId,
        },
      });
      this.fetchData({
        sortBy: 'batchTime',
        sortDirection: 'DESC',
        limit: 10,
        contractId,
        groupRole,
        gainerBuId,
      });
    } else {
      this.fetchData({ sortBy: 'batchTime', sortDirection: 'DESC', limit: 10 });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { batchTime, ...restParams } = params || {};
    const batchTimeObject = { batchTimeFrom: undefined, batchTimeTo: undefined };
    if (!isNil(batchTime) && !isEmpty(batchTime)) {
      const [start, end] = batchTime;
      batchTimeObject.batchTimeFrom = start;
      batchTimeObject.batchTimeTo = end;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...restParams,
        ...batchTimeObject,
        ...getBuVersionAndBuParams(params.gainerBuId, 'gainerBuId', 'gainerBuVersionId'),
      },
    });
  };

  render() {
    const { loading, distInfoMgmt, dispatch } = this.props;
    const { list, total, searchForm } = distInfoMgmt;

    const tableProps = {
      rowKey: 'resultId',
      columnsCache: DOMAIN,
      sortBy: 'batchTime',
      sortDirection: 'DESC',
      scroll: { x: 2050 },
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
          title: '????????????',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'batchTime',
          options: {
            initialValue: searchForm.batchTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '???????????????',
          dataIndex: 'contractInfo',
          options: {
            initialValue: searchForm.contractInfo,
          },
          tag: <Input placeholder="???????????????????????????????????????" />,
        },

        {
          title: '??????bu',
          dataIndex: 'gainerBuId',
          options: {
            initialValue: searchForm.gainerBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '??????????????????',
          dataIndex: 'groupRole',
          options: {
            initialValue: searchForm.groupRole,
          },
          tag: <Selection.UDC code="ACC:PROFIT_ROLE" placeholder="???????????????????????????" />,
        },
        {
          title: '??????????????????',
          dataIndex: 'groupBaseType',
          options: {
            initialValue: searchForm.groupBaseType,
          },
          tag: <Selection.UDC code="ACC:PROFIT_SHARE_BASE" placeholder="???????????????????????????" />,
        },

        {
          title: '????????????',
          dataIndex: 'triggerType',
          options: {
            initialValue: searchForm.triggerType,
          },
          tag: <Selection.UDC code="ACC:CONTRACT_TRIGGER_TYPE" placeholder="?????????????????????" />,
        },
        {
          title: '??????????????????',
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder="???????????????????????????" />,
        },
        {
          title: '??????????????????',
          dataIndex: 'briefNo',
          options: {
            initialValue: searchForm.briefNo,
          },
          tag: <Input placeholder="???????????????????????????" />,
        },

        {
          title: '??????????????????',
          dataIndex: 'periodFrom',
          options: {
            initialValue: searchForm.periodFrom,
          },
          tag: (
            <Selection
              transfer={{ code: 'name', name: 'name' }}
              source={() => selectFinperiod()}
              placeholder="???????????????????????????"
            />
          ),
        },
        {
          title: '??????????????????',
          dataIndex: 'periodTo',
          options: {
            initialValue: searchForm.periodTo,
          },
          tag: (
            <Selection
              transfer={{ code: 'name', name: 'name' }}
              source={() => selectFinperiod()}
              placeholder="???????????????????????????"
            />
          ),
        },
      ],
      columns: [
        {
          title: '????????????',
          dataIndex: 'batchNo',
          width: 180,
          render: (value, rowData) => {
            const href = `/plat/distInfoMgmt/distInfoMgmt/detail?id=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '????????????',
          dataIndex: 'batchTime',
          width: 120,
          render: value => formatDT(value),
        },
        {
          title: '???????????????',
          dataIndex: 'contractInfo',
          width: 200,
          render: (value, rowData) => {
            const href = `/sale/contract/salesSubDetail?id=${rowData.contractId}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '????????????',
          dataIndex: 'triggerTypeDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'triggerType',
          width: 150,
          render: (value, rowData) => {
            const { recvId, recvNo, beriefId, briefNo } = rowData;
            let val = '';
            let href = '';
            if (value === 'RECV_DIST') {
              val = recvNo;
              href = `/plat/saleRece/contract/detail?id=${recvId}`;
            } else if (value === 'CONFIREM') {
              val = briefNo;
              href = `/user/project/projectReportDetail?id=${beriefId}`;
            }
            return (
              <Link className="tw-link" to={href}>
                {val}
              </Link>
            );
          },
        },
        {
          title: '????????????',
          dataIndex: 'finPeriodName',
          align: 'center',
          width: 100,
        },
        {
          title: '????????????????????????',
          dataIndex: 'batchDistRecvedAmt',
          align: 'right',
          width: 150,
        },
        {
          title: '????????????????????????',
          dataIndex: 'batchDistConfirmedAmt',
          align: 'right',
          width: 150,
        },
        {
          title: '??????????????????',
          dataIndex: 'groupRoleDesc',
          align: 'center',
          width: 130,
        },
        {
          title: '??????bu',
          dataIndex: 'gainerBuName',
          width: 150,
        },
        {
          title: '??????????????????',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
          width: 150,
        },
        {
          title: '????????????(%)',
          dataIndex: 'gainerInallPercent',
          width: 120,
        },
        {
          title: '??????????????????',
          dataIndex: 'receivedGainAmt',
          align: 'right',
          width: 120,
        },
        {
          title: '????????????',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
          width: 120,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="????????????????????????">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistInfoMgmt;
