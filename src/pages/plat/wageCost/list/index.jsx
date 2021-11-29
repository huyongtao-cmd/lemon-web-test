import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { connect } from 'dva';
import tableConf from './tableConf';

const DOMAIN = 'wageCostModels';
@connect(({ loading, wageCostModels }) => ({
  loading,
  ...wageCostModels,
}))
class WageCostList extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        offset: 0,
        limit: 10,
        finPeriodIds: [],
      },
    });
  }

  render() {
    const { dispatch, list, loading, searchForm, total, resDataSource } = this.props;
    return (
      <PageHeaderWrapper title="薪资成本列表">
        <DataTable {...tableConf(dispatch, list, loading, searchForm, total, resDataSource)} />
      </PageHeaderWrapper>
    );
  }
}
export default WageCostList;
