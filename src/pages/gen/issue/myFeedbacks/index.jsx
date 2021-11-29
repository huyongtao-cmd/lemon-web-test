import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Form, Button } from 'antd';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
// import styles from './index.less';

const DOMAIN = 'issueMyFeedbacks';

@connect(({ loading, issueMyFeedbacks, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  issueMyFeedbacks,
  dispatch,
}))
@mountToTab()
class myFeedbacks extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'problemTime',
      solveState: 'SOLVING',
      sortDirection: 'DESC',
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'FEEDBACK_LIST',
      },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const obj = {
      ...params,
      problemStartTime:
        params.problemTime && params.problemTime[0] ? params.problemTime[0] : void 0,
      problemEndTime: params.problemTime && params.problemTime[1] ? params.problemTime[1] : void 0,
      problemTime: void 0,
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const key in params) {
      if (params[key] === '') {
        obj[key] = void 0;
      }
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: obj,
    });
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const {
      issueMyFeedbacks: { dataSource, total, pageConfig = {}, queryParams = {} },
      dispatch,
      loading,
    } = this.props;
    const { pageBlockViews = [] } = pageConfig;
    let columns = [];
    let searchKeyBox = [];
    let searchBarForms = [];
    if (pageBlockViews && pageBlockViews.length > 1) {
      const { pageFieldViews = [] } = pageBlockViews[1];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'title') {
            columnsItem.render = (value, rowData, key) => (
              <Link to={`/sys/maintMgmt/feedback/detail?id=${rowData.id}&isUser=YES`}>{value}</Link>
            );
          }
          return columnsItem;
        });
    }
    if (pageBlockViews && pageBlockViews.length > 2) {
      searchKeyBox = pageBlockViews[2].pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj);

      searchBarForms = searchKeyBox.map(item => {
        const { displayName, fieldKey } = item;
        const searchBar = {
          title: displayName,
          dataIndex: fieldKey,
          options: {
            initialValue: queryParams[fieldKey],
          },
        };

        if (fieldKey === 'problemTime') {
          searchBar.dataIndex = 'problemTime';
          searchBar.options = {
            initialValue: queryParams.problemTime,
          };
          searchBar.tag = <DatePicker.RangePicker format="YYYY-MM-DD" />;
        }

        if (fieldKey === 'problemTypeName') {
          searchBar.dataIndex = 'problemType';
          searchBar.options = {
            initialValue: queryParams.problemType,
          };
          searchBar.tag = <Selection.UDC code="APM:PROBLEM_TYPE" placeholder="请选择反馈分类" />;
        }

        if (fieldKey === 'solveStateName') {
          searchBar.dataIndex = 'solveState';
          searchBar.options = {
            initialValue: queryParams.solveState,
          };
          searchBar.tag = <Selection.UDC code="APM:SOLVE_STATE" placeholder="请选择处理状态" />;
        }
        return searchBar;
      });
    }

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'problemTime',
      sortDirection: 'DESC',
      dataSource,
      total,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // dispatch({
        //   type: `${DOMAIN}/updateSearchForm`,
        //   payload: allValues,
        // });
      },
      searchBarForm: [...searchBarForms],
      columns: [...columns],
      leftButtons: [
        {
          key: 'shielding',
          className: 'tw-btn-primary',
          title: '关闭问题',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams2) => {
            if (!selectedRowKeys.length) {
              createMessage({ type: 'warn', description: '请选择要关闭的问题' });
            } else {
              dispatch({
                type: `${DOMAIN}/close`,
                payload: { ids: selectedRowKeys },
              });
            }
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper title="我的反馈">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="我的反馈" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default myFeedbacks;
