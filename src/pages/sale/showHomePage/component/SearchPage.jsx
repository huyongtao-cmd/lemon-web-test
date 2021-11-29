import React from 'react';
import { connect } from 'dva';
import { Card, Form, Spin } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import { isEmpty } from 'ramda';
import DataTable from '../DataTable';
import styles from '../style.less';

const DOMAIN = 'showHomePage';

@connect(({ loading, showHomePage, dispatch }) => ({
  loading,
  showHomePage,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateHomeForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class SearchPageList extends React.PureComponent {
  fetchData = params => {
    const {
      dispatch,
      showHomePage: {
        homeFormSearchData: { mapCon },
      },
    } = this.props;

    // 拉取数据
    dispatch({
      type: `${DOMAIN}/selectVideoCon`,
      payload: {
        ...params,
        mapCon,
      },
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      showHomePage: { homeFormList, homeFormTotal, tabLableList, homeFormSearchData },
      dispatch,
    } = this.props;

    const submitting = loading.effects[`${DOMAIN}/selectVideoCon`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      total: homeFormTotal,
      dataSource: homeFormList,
      showSearchButton: false,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {},
    };

    return (
      <div className={styles.homeSearch}>
        <div style={{ backgroundColor: '#fff', padding: '15px', marginBottom: '3px' }}>
          <span style={{ color: '#999' }}>筛选条件：</span>
          <span>{homeFormSearchData.queryCon || ''}</span>
        </div>
        <div style={{ borderBottom: '6px solid #f0f2f5' }} />
        <Card className="tw-card-adjust" bordered={false}>
          <Spin spinning={submitting}>
            <DataTable {...tableProps} />
          </Spin>
        </Card>
      </div>
    );
  }
}

export default SearchPageList;
