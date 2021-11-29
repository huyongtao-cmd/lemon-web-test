import React from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button, Spin } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, type } from 'ramda';
import DataTable from '../DataTable';
import styles from '../style.less';

// --------------- 需要的数据写在这里,或者由数据文件import进来 -----------------

const DOMAIN = 'showHomePage';

const { Field } = FieldList;

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
// @mountToTab()
class HomePageList extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/tabSelectLabel` }).then(res => {
      if (!isEmpty(res)) {
        dispatch({
          type: `${DOMAIN}/updateHomeForm`,
          payload: {
            code: res[0].vlabelText,
          },
        });

        this.fetchData({
          sortBy: 'id',
          sortDirection: 'DESC',
          offset: 0,
          limit: 10,
          code: res[0].vlabelText,
        });
      }
    });
  }

  fetchData = params => {
    const {
      dispatch,
      showHomePage: { homeFormSearchData },
    } = this.props;
    dispatch({ type: `${DOMAIN}/videoSearchList`, payload: { ...homeFormSearchData, ...params } });
  };

  homePageSearch = params => {
    const {
      dispatch,
      showHomePage: { homeFormSearchData },
    } = this.props;
    const { homePageSearch } = this.props;
    if (type(homePageSearch) === 'Function') {
      homePageSearch({ vnoOrVNameVDesc: homeFormSearchData.vnoOrVNameVDesc || '' });
    }
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      showHomePage: { homeFormList, homeFormTotal, tabLableList, homeFormSearchData },
      dispatch,
    } = this.props;

    const submitting = loading.effects[`${DOMAIN}/videoSearchList`];

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
        <Card
          className="tw-card-adjust"
          bordered={false}
          bodyStyle={{
            borderBottom: '10px',
            position: 'relative',
            height: '110px',
          }}
        >
          <div style={{ width: '100%', position: 'absolute', left: '30%' }}>
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="vnoOrVNameVDesc"
                label="编号/名称/简介/关键词"
                labelCol={{ span: 10, xxl: 10 }}
                wrapperCol={{ span: 13, xxl: 13 }}
              >
                <Input placeholder="请输入编号/名称/简介/关键词" />
              </Field>
              <Field name="button">
                <Button
                  className="tw-btn-primary"
                  onClick={() => {
                    // this.fetchData()
                    this.homePageSearch();
                  }}
                >
                  查询
                </Button>
              </Field>
            </FieldList>
          </div>

          <br />

          <div style={{ position: 'absolute', bottom: '10px', left: '40px' }}>
            {tabLableList.map(v => (
              <span
                className={styles.filterTag}
                key={v.vlabelText}
                onClick={() => {
                  dispatch({
                    type: `${DOMAIN}/updateHomeForm`,
                    payload: {
                      code: v.vlabelText,
                    },
                  });
                  this.fetchData({
                    code: v.vlabelText,
                    sortBy: 'id',
                    sortDirection: 'DESC',
                    offset: 0,
                    limit: 10,
                  });
                }}
                style={{ color: homeFormSearchData.code === v.vlabelText ? '#1890ff' : '#000' }}
              >
                {`${v.vlabelName}(${v.vlabelCount})`}
              </span>
            ))}
          </div>
        </Card>
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

export default HomePageList;
