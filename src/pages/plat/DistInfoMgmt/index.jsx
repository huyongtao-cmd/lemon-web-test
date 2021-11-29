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
          title: '批次编号',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="请输入批次编号" />,
        },
        {
          title: '批次区间',
          dataIndex: 'batchTime',
          options: {
            initialValue: searchForm.batchTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '销售子合同',
          dataIndex: 'contractInfo',
          options: {
            initialValue: searchForm.contractInfo,
          },
          tag: <Input placeholder="按编号匹配或按名称模糊匹配" />,
        },

        {
          title: '收益bu',
          dataIndex: 'gainerBuId',
          options: {
            initialValue: searchForm.gainerBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '利益分配角色',
          dataIndex: 'groupRole',
          options: {
            initialValue: searchForm.groupRole,
          },
          tag: <Selection.UDC code="ACC:PROFIT_ROLE" placeholder="请选择利益分配角色" />,
        },
        {
          title: '利益分配基于',
          dataIndex: 'groupBaseType',
          options: {
            initialValue: searchForm.groupBaseType,
          },
          tag: <Selection.UDC code="ACC:PROFIT_SHARE_BASE" placeholder="请选择利益分配角色" />,
        },

        {
          title: '触发类型',
          dataIndex: 'triggerType',
          options: {
            initialValue: searchForm.triggerType,
          },
          tag: <Selection.UDC code="ACC:CONTRACT_TRIGGER_TYPE" placeholder="请选择触发类型" />,
        },
        {
          title: '收款计划编号',
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder="请输入收款计划编号" />,
        },
        {
          title: '项目汇报编号',
          dataIndex: 'briefNo',
          options: {
            initialValue: searchForm.briefNo,
          },
          tag: <Input placeholder="请输入项目汇报编号" />,
        },

        {
          title: '核算期间起始',
          dataIndex: 'periodFrom',
          options: {
            initialValue: searchForm.periodFrom,
          },
          tag: (
            <Selection
              transfer={{ code: 'name', name: 'name' }}
              source={() => selectFinperiod()}
              placeholder="请选择收入核算期间"
            />
          ),
        },
        {
          title: '核算期间截止',
          dataIndex: 'periodTo',
          options: {
            initialValue: searchForm.periodTo,
          },
          tag: (
            <Selection
              transfer={{ code: 'name', name: 'name' }}
              source={() => selectFinperiod()}
              placeholder="请选择收入核算期间"
            />
          ),
        },
      ],
      columns: [
        {
          title: '批次编号',
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
          title: '批次时间',
          dataIndex: 'batchTime',
          width: 120,
          render: value => formatDT(value),
        },
        {
          title: '相关子合同',
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
          title: '触发类型',
          dataIndex: 'triggerTypeDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '触发来源',
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
          title: '核算期间',
          dataIndex: 'finPeriodName',
          align: 'center',
          width: 100,
        },
        {
          title: '本期分配收款金额',
          dataIndex: 'batchDistRecvedAmt',
          align: 'right',
          width: 150,
        },
        {
          title: '本期分配确认金额',
          dataIndex: 'batchDistConfirmedAmt',
          align: 'right',
          width: 150,
        },
        {
          title: '利益分配角色',
          dataIndex: 'groupRoleDesc',
          align: 'center',
          width: 130,
        },
        {
          title: '收益bu',
          dataIndex: 'gainerBuName',
          width: 150,
        },
        {
          title: '利益分配基于',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
          width: 150,
        },
        {
          title: '分配比例(%)',
          dataIndex: 'gainerInallPercent',
          width: 120,
        },
        {
          title: '收款分得金额',
          dataIndex: 'receivedGainAmt',
          align: 'right',
          width: 120,
        },
        {
          title: '确认金额',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
          width: 120,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="收益分配管理列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistInfoMgmt;
