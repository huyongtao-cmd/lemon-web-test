import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { omit } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { DatePicker, Radio } from 'antd';
import { Selection, BuVersion } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import {
  selectActiveBu,
  selectUserTask,
  selectUserProj,
  selectUsersWithBu,
} from '@/services/gen/list';
import { selectUsers } from '@/services/sys/user';
import { showProcBtn } from '@/utils/flowToRouter';
import { formatDT } from '@/utils/tempUtils/DateTime';
import tableCfg from './config/table.cfg';
import LastCountModal from './config/LastCountModal';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'equivalent';
// 默认为结算单汇总，这里肯定是要选一个类型得，所以点重置为空的时候，会重新给默认值
const SUM_TYPE_ENUM = {
  BY_STATEMENT_SUM: 'BY_STATEMENT_SUM', // 结算单汇总
  BY_PROJ_SUM: 'BY_PROJ_SUM', // 项目汇总
  NO_SUM: 'NO_SUM', // 不汇总
};
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, equivalent }) => ({
  equivalent,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class EquivalentList extends Component {
  state = {
    lastCountModalVisible: false, // 最晚结算日弹出框
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'settleNo', sortDirection: 'ASC', sumType: 'BY_STATEMENT_SUM' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { settleDate } = params;
    const newParams = omit(['settleDate'], params);
    if (settleDate) {
      const date = {
        settleDateStart: formatDT(settleDate[0]),
        settleDateEnd: formatDT(settleDate[1]),
      };
      newParams.settleDateStart = date.settleDateStart;
      newParams.settleDateEnd = date.settleDateEnd;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...newParams,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
        ...getBuVersionAndBuParams(params.resBuId, 'resBuId', 'resBuVersionId'),
      },
    });
  };

  tablePropsConfig = () => {
    const { loading, equivalent, dispatch } = this.props;
    const { list, total, searchForm, record = SUM_TYPE_ENUM.BY_STATEMENT_SUM } = equivalent;

    const giveRowKey = rowRecord => {
      if (record === SUM_TYPE_ENUM.BY_PROJ_SUM) return rowRecord.projId;
      if (record === SUM_TYPE_ENUM.BY_STATEMENT_SUM) return rowRecord.settleNo;
      return `${rowRecord.settleNo}-${rowRecord.taskId}-${rowRecord.projId}-${rowRecord.workDate}`;
    };

    const tableProps = {
      rowKey: record => giveRowKey(record), // eslint-disable-line
      columnsCache: DOMAIN,
      loading,
      total,
      scroll: tableCfg[record].scroll,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        const { sumType = SUM_TYPE_ENUM.BY_STATEMENT_SUM, ...restValues } = allValues;
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            sumType,
            ...restValues,
          },
        });
      },
      searchBarForm: [
        {
          title: '结算单号',
          dataIndex: 'settleNo',
          options: {
            initialValue: searchForm.settleNo,
          },
        },
        {
          title: '结算类型',
          dataIndex: 'settleType',
          options: {
            initialValue: searchForm.settleType,
          },
          tag: <Selection.UDC code="ACC.SETTLE_TYPE" placeholder="请选择" />,
        },
        {
          title: '发包人',
          dataIndex: 'disterResId',
          options: {
            initialValue: searchForm.disterResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择发包人"
              showSearch
            />
          ),
        },
        {
          title: '相关项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: (
            <Selection
              transfer={{ code: 'id', name: 'name' }}
              source={() => selectUserProj()}
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
            <Selection
              transfer={{ code: 'id', name: 'name' }}
              source={() => selectUserTask()}
              placeholder="请选择相关任务"
            />
          ),
        },
        {
          title: '收入资源',
          dataIndex: 'incomeResId',
          options: {
            initialValue: searchForm.incomeResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择收入资源"
              showSearch
            />
          ),
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          options: {
            initialValue: searchForm.settleDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '结算单状态',
          dataIndex: 'settleStatus',
          options: {
            initialValue: searchForm.settleStatus,
          },
          tag: <Selection.UDC code="ACC.SETTLE_STATUS" placeholder="请选择" />,
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择申请人"
              showSearch
            />
          ),
        },
        {
          title: '评价状态',
          dataIndex: 'evalStatus',
          options: {
            initialValue: searchForm.evalStatus,
          },
          tag: <Selection.UDC code="ACC.EVAL_STATUS" placeholder="请选择" />,
        },
        {
          title: '支出BU',
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '收入BU',
          dataIndex: 'resBuId',
          options: {
            initialValue: searchForm.resBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '活动',
          dataIndex: 'actNoOrName',
          options: {
            initialValue: searchForm.actNoOrName,
          },
        },
        {
          title: '汇总级别',
          dataIndex: 'sumType',
          options: {
            initialValue: searchForm.sumType,
          },
          tag: (
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={SUM_TYPE_ENUM.BY_STATEMENT_SUM}>按结算单</Radio.Button>
              <Radio.Button value={SUM_TYPE_ENUM.BY_PROJ_SUM}>按项目</Radio.Button>
              <Radio.Button value={SUM_TYPE_ENUM.NO_SUM}>不汇总</Radio.Button>
            </Radio.Group>
          ),
        },
      ],
      columns: tableCfg[record].columns,
      leftButtons: [
        record === SUM_TYPE_ENUM.BY_STATEMENT_SUM && {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增泛用当量',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/plat/intelStl/list/common');
          },
        },
        record !== SUM_TYPE_ENUM.BY_PROJ_SUM && {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows[0] && !showProcBtn(selectedRows[0].apprStatus),
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, settleType } = selectedRows[0];
            let url;
            if (settleType === 'TASK_BY_PACKAGE') url = `/plat/intelStl/list/sum/edit?id=${id}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/edit?id=${id}`;
            else url = `/plat/intelStl/list/common/edit?id=${id}`;
            router.push(url);
          },
        },
        record !== SUM_TYPE_ENUM.BY_PROJ_SUM && {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !!selectedRows.filter(
              item => item.settleStatus !== 'CREATE' && item.settleStatus !== 'REJECTED'
            ).length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(
              item => item.settleStatus !== 'CREATE' && item.settleStatus !== 'REJECTED'
            ).length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新增和退回的可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/removeItems`,
              payload: ids,
            });
          },
        },
        {
          key: 'account',
          className: 'tw-btn-primary',
          title: '结算日期冻结管理',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/getLastCountDate`,
            }).then(() => {
              this.setState({
                lastCountModalVisible: true,
              });
            });
          },
        },
      ].filter(Boolean),
    };

    return tableProps;
  };

  // 打开/关闭结算日期冻结弹窗
  handleCountModal = flag => {
    const { lastCountModalVisible } = this.state;
    this.setState({
      lastCountModalVisible: !lastCountModalVisible,
    });
    if (flag === 'YES') {
      createMessage({ type: 'success', description: '修改成功' });
    }
  };

  render() {
    const { lastCountModalVisible } = this.state;
    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
        {lastCountModalVisible ? (
          <LastCountModal visible={lastCountModalVisible} closeModal={this.handleCountModal} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default EquivalentList;
