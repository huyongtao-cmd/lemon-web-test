import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import router from 'umi/router';
import Link from 'umi/link';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'feedbackInfo';

@connect(({ loading, dispatch, feedbackInfo }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  feedbackInfo,
}))
@mountToTab()
class FeedbackList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
      solveState: 'SOLVING',
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
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
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
      dispatch,
      loading,
      feedbackInfo: { dataSource, total, searchForm, pageConfig = {} },
    } = this.props;
    const { pageBlockViews = [] } = pageConfig;
    let columns = [];
    let searchKeyBox = [];
    let searchBarForms = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'problemTitle') {
            columnsItem.render = (value, rowData, key) => (
              <Link to={`/sys/maintMgmt/feedback/detail?id=${rowData.id}&isUser=NO`}>{value}</Link>
            );
          }
          if (item.fieldKey === 'remark') {
            columnsItem.render = (value, rowData, key) => (
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: value }}
              />
            );
          }

          return columnsItem;
        });
    }
    const hadTurned = {
      title: '已转项目日志',
      align: 'center',
      dataIndex: 'isProjLog',
      key: 'isProjLog',
      width: 100,
    };
    columns.push(hadTurned);

    if (pageBlockViews && pageBlockViews.length > 0) {
      searchKeyBox = pageBlockViews[0].pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj);

      searchBarForms = searchKeyBox.filter(v => v.fieldKey !== 'remark').map(item => {
        const { displayName, fieldKey } = item;
        const searchBar = {
          title: displayName,
          dataIndex: fieldKey,
          options: {
            initialValue: searchForm[fieldKey],
          },
        };
        if (fieldKey === 'name') {
          searchBar.dataIndex = 'feedBackUserId';
          searchBar.options = {
            initialValue: searchForm.feedBackUserId,
          };
          searchBar.tag = (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择反馈人"
              showSearch
            />
          );
        }

        if (fieldKey === 'problemTime') {
          searchBar.dataIndex = 'feedbackTime';
          searchBar.options = {
            initialValue: searchForm.feedbackTime,
          };
          searchBar.tag = <DatePicker.RangePicker format="YYYY-MM-DD" />;
        }

        if (fieldKey === 'problemTypeName') {
          searchBar.dataIndex = 'problemType';
          searchBar.options = {
            initialValue: searchForm.problemType,
          };
          searchBar.tag = <Selection.UDC code="APM:PROBLEM_TYPE" placeholder="请选择反馈分类" />;
        }

        if (fieldKey === 'solveStateName') {
          searchBar.dataIndex = 'solveState';
          searchBar.options = {
            initialValue: searchForm.solveState,
          };
          searchBar.tag = <Selection.UDC code="APM:SOLVE_STATE" placeholder="请选择处理状态" />;
        }

        if (fieldKey === 'resultName') {
          searchBar.dataIndex = 'result';
          searchBar.options = {
            initialValue: searchForm.result,
          };
          searchBar.tag = <Selection.UDC code="APM:SOLVE_RESULT" placeholder="请选择处理结果" />;
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
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      total,
      onChange: filters => {
        console.error('filters', filters);
        this.fetchData({ ...searchForm, ...filters });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...searchForm,
            ...changedValues,
          },
        });
      },
      searchBarForm: [...searchBarForms],
      columns: [...columns],
      leftButtons: [
        {
          key: 'close',
          className: 'tw-btn-primary',
          title: '关闭问题',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const havaClose = selectedRowKeys.find(value => value.solveState === 'CLOSE');
            return selectedRowKeys.length === 0 || havaClose;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/close`,
              payload: {
                ids: selectedRowKeys,
                content: '',
              },
            });
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/del`,
              payload: selectedRowKeys.join(','),
            });
          },
        },
        {
          key: 'turnProjectLog',
          className: 'tw-btn-primary',
          title: '转入项目日志',
          icon: 'arrow-right',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { isProjLog } = selectedRows[0];
            if (isProjLog === '是') {
              createMessage({ type: 'error', description: '已转过项目日志的不允许再次转入' });
              return;
            }
            const { id } = selectedRows[0];
            router.push(`/user/project/logTurned?mode=turned&problemId=${id}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="问题反馈列表">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="问题反馈列表" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FeedbackList;
