import React, { PureComponent } from 'react';
import { Input, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { DatePicker, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'buWithdrawPayList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, buWithdrawPayList, dispatch, user }) => ({
  loading,
  ...buWithdrawPayList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class BuWithdrawPayList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];
    return {
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
          title: '单据号',
          dataIndex: 'withdrawPayNo',
          options: {
            initialValue: searchForm.withdrawPayNo,
          },
          tag: <Input placeholder="请输入单据号" />,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '申请人',
          dataIndex: 'resName',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
        },
        {
          title: 'BU名称',
          dataIndex: 'buName',
        },
        {
          title: '金额',
          dataIndex: 'amt',
        },
        {
          title: '查看',
          dataIndex: 'faker',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/hr/salary/buWithDrawPayDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                详情
              </Link>
            );
          },
        },
      ],
      leftButtons: [],
    };
  };

  render() {
    return (
      <PageHeaderWrapper title="BU提现付款列表">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default BuWithdrawPayList;
