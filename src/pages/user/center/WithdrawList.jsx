import React, { PureComponent } from 'react';
import { Input, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { toQs, toUrl } from '@/utils/stringUtils';
import { selectProjectConditional } from '@/services/user/project/project';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectFinperiod } from '@/services/user/Contract/sales';

const DOMAIN = 'withdrawList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, withdrawList, dispatch, user }) => ({
  loading,
  ...withdrawList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class WithdrawList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const url = window.location.href;
    const { dispatch } = this.props;
    const param = { ...params };
    if (url.indexOf('user') > -1) {
      param.myFlag = true;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: param });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loadingStatus,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '提现单号',
          dataIndex: 'withdrawNo',
          options: {
            initialValue: searchForm.withdrawNo,
          },
          tag: <Input placeholder="请输入提现单号" />,
        },
        {
          title: '项目',
          dataIndex: 'projId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectProjectConditional({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '内部资源类型',
          dataIndex: 'resInnerType',
          tag: <Selection.UDC code="RES:RES_TYPE1" placeholder="请选择内部资源类型" />,
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatus',
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="请选择审批状态" />,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          tag: <Selection.UDC code="COM:COOPERATION_MODE" placeholder="请选择资源合作方式" />,
        },
        {
          title: 'HR处理批次号',
          dataIndex: 'hrBatchNo',
          tag: <Input placeholder="请输HR处理批次号" />,
        },
        {
          title: 'HR未处理',
          dataIndex: 'notExport',
          tag: <Switch checkedChildren="是" unCheckedChildren="否" />,
        },
      ],
      columns: [
        {
          title: '提现单号',
          dataIndex: 'withdrawNo',
          render: (value, rowData) => {
            const { id, withdrawType } = rowData;
            const href =
              withdrawType === 'PERSONAL'
                ? `/user/center/withDrawDetail?id=${id}`
                : `/org/bu/buWithdrawDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '提现类型',
          dataIndex: 'withdrawTypeDesc',
        },
        {
          title: '提现人',
          dataIndex: 'resName',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
        },
        {
          title: '提现状态',
          dataIndex: 'withdrawStatusDesc',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
        },
        {
          title: '内部资源类型',
          dataIndex: 'resInnerTypeDesc',
          align: 'center',
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
        },
        {
          title: '提现当量',
          dataIndex: 'eqva',
        },
        {
          title: '提现金额',
          dataIndex: 'amt',
        },
        {
          title: 'HR处理批次号',
          dataIndex: 'hrBatchNo',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, briefStatus } = selectedRows[0];
            if (briefStatus === 'CREATE') {
              router.push('/user/project/projectReport?id=' + id);
            } else {
              createMessage({ type: 'warn', description: '只有新建状态的可以修改！' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(item => item.briefStatus !== 'CREATE').length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新建状态的可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: ids.join(',') },
            });
          },
        },
        {
          key: 'batch',
          title: 'HR批量导出(内部)',
          className: 'tw-btn-info',
          icon: 'export',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // saveAs(`https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg`);
            // saveAs(`${SERVER_URL}/api/worth/v1/withdraw/hrBatchExport`);
            // eslint-disable-next-line no-restricted-globals
            location.href = toQs(`${SERVER_URL}/api/worth/v1/withdraw/hrBatchExport`, queryParams);
          },
        },
        {
          key: 'withdrawPay',
          title: '发起付款(外部)',
          className: 'tw-btn-info',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (!selectedRowKeys || selectedRowKeys.length === 0) {
              createMessage({ type: 'warn', description: '请至少选择一条记录！' });
              return;
            }
            const buId = selectedRows[0].baseBuId;
            for (let i = 0; i < selectedRows.length; i += 1) {
              if (selectedRows[i].baseBuId !== buId) {
                createMessage({
                  type: 'warn',
                  description:
                    selectedRows[i].resName +
                    ' 与 ' +
                    selectedRows[0].resName +
                    '所属BU不同,只能同BU的资源可一起发起付款申请',
                });
                return;
              }
              if (selectedRows[i].resInnerType !== 'EXTERNAL_RES') {
                createMessage({ type: 'warn', description: '只有外部资源才可发起付款流程！' });
                return;
              }
              if (selectedRows[i].withdrawStatus !== 'APPROVED') {
                createMessage({ type: 'warn', description: '只有已审批的提现记录可发起付款！' });
                return;
              }
            }
            router.push('/user/center/WithDrawPay?ids=' + selectedRowKeys.join(','));
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="提现列表">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawList;
