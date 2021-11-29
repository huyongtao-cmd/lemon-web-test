import React from 'react';
import { connect } from 'dva';
import { DatePicker, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'userFeeApplyList';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------
/**
 * 费用申请
 */
@connect(({ loading, userFeeApplyList }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  loading,
  ...userFeeApplyList, // 代表与该组件相关redux的model
}))
@mountToTab()
class FeeApplyList extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
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
          title: '申请单号',
          dataIndex: 'applyNo',
          options: {
            initialValue: searchForm.applyNo,
          },
          tag: <Input placeholder="申请单号" />,
        },
        {
          title: '申请单名称',
          dataIndex: 'applyName',
          options: {
            initialValue: searchForm.applyName,
          },
          tag: <Input placeholder="申请单名称" />,
        },
        {
          title: '申请人',
          dataIndex: 'applyRes',
          options: {
            initialValue: searchForm.applyRes,
          },
          tag: <Input placeholder="申请人" />,
        },
        {
          title: '用途类型',
          dataIndex: 'usageType',
          options: {
            initialValue: searchForm.usageType,
          },
          tag: <Selection.UDC code="ACC.EXP_USE_TYPE" placeholder="请选择用途类型" />,
        },
        {
          title: '相关项目',
          dataIndex: 'reason',
          options: {
            initialValue: searchForm.reason,
          },
          tag: <Input placeholder="相关项目编号/名称" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBu',
          options: {
            initialValue: searchForm.expenseBu,
          },
          tag: <Input placeholder="费用承担BU编号/名称" />,
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBu',
          options: {
            initialValue: searchForm.sumBu,
          },
          tag: <Input placeholder="费用归属BU编号/名称" />,
        },
        {
          title: '申请状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="申请状态" />,
        },
        {
          title: '申请日期区间',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
      ],
      columns: [
        {
          title: '申请单号',
          dataIndex: 'applyNo',
          sorter: true,
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/expense/spec/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '申请单名称',
          dataIndex: 'applyName',
          align: 'left',
        },
        {
          title: '申请人',
          dataIndex: 'applyResName',
          align: 'center',
        },
        {
          title: '申请状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '用途类型',
          dataIndex: 'usageTypeName',
          align: 'center',
        },
        {
          title: '申请费用',
          dataIndex: 'applyAmt',
          align: 'right',
        },
        {
          title: '相关项目',
          dataIndex: 'reasonName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          align: 'center',
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuName',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'left',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            if (
              selectedRows[0].apprStatus === 'NOTSUBMIT' ||
              selectedRows[0].apprStatus === 'WITHDRAW'
            ) {
              router.push(`/plat/expense/spec/specedit?id=${selectedRowKeys[0]}`);
            } else {
              createMessage({ type: 'warn', description: '该状态不能修改' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            // 仅未提交的资源可删除(可多条删除)
            !(
              selectedRows.length > 0 &&
              selectedRows.filter(v => v.apprStatus !== 'NOTSUBMIT').length <= 0
            ),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 可以删除的 apprStatus 状态有  1. NOTSUBMIT 2. REJECTED 3. 不存在 4. WITHDRAW
            // 过滤掉之后还有值，说明选中了不可删除的行
            const unlegalRows = selectedRows
              .map(({ apprStatus }) => apprStatus)
              .filter(
                apprStatus =>
                  !!apprStatus && !['NOTSUBMIT', 'REJECTED', 'WITHDRAW'].includes(apprStatus)
              );
            if (unlegalRows.length) {
              createMessage({ type: 'warn', description: '只有未提交或被退回的申请单可以被删除' });
            } else {
              dispatch({
                type: `${DOMAIN}/delete`,
                payload: { ids: selectedRowKeys, queryParams },
              });
            }
          },
        },
      ],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    return (
      <PageHeaderWrapper title="费用申请">
        <DataTable {...this.getTableProps()} />
      </PageHeaderWrapper>
    );
  }
}

export default FeeApplyList;
