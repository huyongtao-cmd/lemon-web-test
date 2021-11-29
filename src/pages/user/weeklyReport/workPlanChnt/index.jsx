import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, Form, Radio, Switch, Tooltip, Rate } from 'antd';
import Link from 'umi/link';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
// import { selectIamUsers } from '@/services/gen/list';
import { stringify } from 'qs';
import { isNil } from 'ramda';
import { selectUsersWithBu } from '@/services/gen/list';

const RadioGroup = Radio.Group;

const DOMAIN = 'workPlanChnt';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, workPlanChnt, dispatch, user }) => ({
  workPlanChnt,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@Form.create({})
@mountToTab()
class WorkPlanChnt extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: { extInfo },
      },
    } = this.props;

    // 从OKR首页点击跳转过来默认查找对应数据
    const { workPlanStatus: workPlanParams } = fromQs();
    if (workPlanParams) {
      this.fetchData({ workPlanStatus: workPlanParams, planResId: extInfo.resId || null });
    }

    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'WORK_PLAN_LIST' },
    });
    if (!isNil(extInfo)) {
      const { resId } = extInfo;
      dispatch({ type: `${DOMAIN}/taskAll`, payload: { resId } });
    } else {
      createMessage({
        type: 'warn',
        description: '当前账号为管理员账号，不能选择任务包和相关活动',
      });
    }
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanTableFrom` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      workPlanChnt: {
        list,
        total,
        searchForm,
        pageConfig,
        resDataSource,
        baseBuDataSource,
        pointDataSource,
        taskAllList,
        activityList,
      },
      form: { setFieldsValue },
      dispatch,
      loading,
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig = [];
    let currentQueryConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'WORK_PLAN_LIST') {
        // 工作计划列表
        currentListConfig = view; // 主区域
      } else if (view.blockKey === 'WORK_PLAN_QUERY') {
        currentQueryConfig = view; // 查询区域
      }
    });
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonQuery = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    const {
      taskName = {},
      planNo = {},
      priority = {},
      dateFrom = {},
      dateTo = {},
      planStatus = {},
      taskId = {},
      activityId = {},
      planResId = {},
      reportedResId = {},
      relevantResId = {},
      planType = {},
      remark1 = {},
      remark2 = {},
      objectiveId = {},
      projectNature = {},
      majorWorkItems = {},
      completionCriteria = {},
      completionTime = {},
      responsibilityBuId = {},
      responsibilityResId = {},
      cooperateResId = {},
      checkResId = {},
      developmentSituation = {},
      developmentStatus = {},
      existingProblem = {},
      resultsEvaluation = {},
      emphasisAttention = {},
    } = pageFieldJsonList;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      // scroll: { x: 2500 },
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
        pageFieldJsonQuery.taskName.visibleFlag && {
          title: `${pageFieldJsonQuery.taskName.displayName}`,
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName || '',
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.taskName.displayName}`} />,
          sortNo: `${pageFieldJsonQuery.taskName.sortNo}`,
        },
        pageFieldJsonQuery.dateFrom.visibleFlag && {
          title: `${pageFieldJsonQuery.dateFrom.displayName}`,
          dataIndex: 'dateRange',
          options: {
            initialValue: searchForm.dateRange,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
          sortNo: `${pageFieldJsonQuery.dateFrom.sortNo}`,
        },
        pageFieldJsonQuery.planStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.planStatus.displayName}`,
          dataIndex: 'planStatus',
          options: {
            initialValue: searchForm.planStatus || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="PLAN">计划中</Radio>
              <Radio value="FINISHED">已完成</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
          sortNo: `${pageFieldJsonQuery.planStatus.sortNo}`,
        },
        pageFieldJsonQuery.planResId.visibleFlag && {
          title: `${pageFieldJsonQuery.planResId.displayName}`,
          dataIndex: 'planResId',
          options: {
            initialValue: searchForm.planResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.planResId.displayName}`}
              limit={20}
            />
          ),
          sortNo: `${pageFieldJsonQuery.planResId.sortNo}`,
        },
        pageFieldJsonQuery.relevantResId.visibleFlag && {
          title: `${pageFieldJsonQuery.relevantResId.displayName}`,
          dataIndex: 'relevantResId',
          options: {
            initialValue: searchForm.relevantResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.relevantResId.displayName}`}
              limit={20}
              mode="multiple"
            />
          ),
          sortNo: `${pageFieldJsonQuery.relevantResId.sortNo}`,
        },
        pageFieldJsonQuery.projectNature.visibleFlag && {
          title: `${pageFieldJsonQuery.projectNature.displayName}`,
          dataIndex: 'projectNature',
          options: {
            initialValue: searchForm.projectNature || undefined,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.projectNature.displayName}`} />,
          sortNo: `${pageFieldJsonQuery.projectNature.sortNo}`,
        },
        pageFieldJsonQuery.completionTime.visibleFlag && {
          title: `${pageFieldJsonQuery.completionTime.displayName}`,
          dataIndex: 'completionRange',
          options: {
            initialValue: searchForm.completionRange || undefined,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
          sortNo: `${pageFieldJsonQuery.completionTime.sortNo}`,
        },
        pageFieldJsonQuery.responsibilityBuId.visibleFlag && {
          title: `${pageFieldJsonQuery.responsibilityBuId.displayName}`,
          dataIndex: 'responsibilityBuId',
          options: {
            initialValue: searchForm.responsibilityBuId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
          sortNo: `${pageFieldJsonQuery.responsibilityBuId.sortNo}`,
        },
        pageFieldJsonQuery.responsibilityResId.visibleFlag && {
          title: `${pageFieldJsonQuery.responsibilityResId.displayName}`,
          dataIndex: 'responsibilityResId',
          options: {
            initialValue: searchForm.responsibilityResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.responsibilityResId.displayName}`}
              limit={20}
            />
          ),
          sortNo: `${pageFieldJsonQuery.responsibilityResId.sortNo}`,
        },
        pageFieldJsonQuery.developmentStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.developmentStatus.displayName}`,
          dataIndex: 'developmentStatus',
          options: {
            initialValue: searchForm.developmentStatus || '',
          },
          tag: (
            <Selection.UDC
              code="ACC:DEVELOPMENT_STATUS"
              placeholder={`请选择${pageFieldJsonQuery.developmentStatus.displayName}`}
            />
          ),
          sortNo: `${pageFieldJsonQuery.developmentStatus.sortNo}`,
        },
        pageFieldJsonQuery.resultsEvaluation.visibleFlag && {
          title: `${pageFieldJsonQuery.resultsEvaluation.displayName}`,
          dataIndex: 'resultsEvaluation',
          options: {
            initialValue: searchForm.resultsEvaluation || undefined,
          },
          tag: (
            <Selection.UDC
              code="ACC:RESULTS_EVALUATION"
              placeholder={`请选择${pageFieldJsonQuery.resultsEvaluation.displayName}`}
            />
          ),
          sortNo: `${pageFieldJsonQuery.resultsEvaluation.sortNo}`,
        },
        pageFieldJsonQuery.emphasisAttention.visibleFlag && {
          title: `${pageFieldJsonQuery.emphasisAttention.displayName}`,
          dataIndex: 'emphasisAttention',
          options: {
            initialValue: searchForm.emphasisAttention || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={pointDataSource}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
          sortNo: `${pageFieldJsonQuery.emphasisAttention.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        emphasisAttention.visibleFlag && {
          title: `${emphasisAttention.displayName}`,
          dataIndex: 'emphasisAttention',
          align: 'center',
          width: 50,
          sortNo: `${emphasisAttention.sortNo}`,
          render: (val, row, index) => (
            <Rate
              count={1}
              value={row.emphasisAttention}
              onChange={(bool, e) => {
                const params = bool;
                dispatch({
                  type: `${DOMAIN}/changePoint`,
                  payload: { ids: row.id, planStatus: params },
                }).then(res => {
                  list[index].emphasisAttention = params;
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: list,
                  });
                });
              }}
            />
          ),
        },
        planNo.visibleFlag && {
          title: `${planNo.displayName}`,
          dataIndex: 'planNo',
          width: 50,
          sortNo: `${planNo.sortNo}`,
        },
        priority.visibleFlag && {
          title: `${priority.displayName}`,
          dataIndex: 'priority',
          width: 50,
          sortNo: `${priority.sortNo}`,
        },
        taskName.visibleFlag && {
          title: `${taskName.displayName}`,
          dataIndex: 'taskName',
          width: 180,
          sortNo: `${taskName.sortNo}`,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/workPlanChnt/detail?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        planResId.visibleFlag && {
          title: `${planResId.displayName}`,
          dataIndex: 'planResName',
          className: 'text-center',
          width: 50,
          sortNo: `${planResId.sortNo}`,
        },
        dateFrom.visibleFlag && {
          title: `${dateFrom.displayName}`,
          dataIndex: 'date',
          width: 100,
          sortNo: `${dateFrom.sortNo}`,
          render: (value, row, index) => `${row.dateFrom} ~ ${row.dateTo}`,
        },
        planStatus.visibleFlag && {
          title: `${planStatus.displayName}`,
          dataIndex: 'planStatusName',
          width: 50,
          align: 'center',
          sortNo: `${planStatus.sortNo}`,
        },
        taskId.visibleFlag && {
          title: `${taskId.displayName}`,
          dataIndex: 'taskIdName',
          width: 50,
          align: 'center',
          sortNo: `${taskId.sortNo}`,
        },
        activityId.visibleFlag && {
          title: `${activityId.displayName}`,
          dataIndex: 'activityName',
          width: 50,
          align: 'center',
          sortNo: `${activityId.sortNo}`,
        },
        objectiveId.visibleFlag && {
          title: `${objectiveId.displayName}`,
          dataIndex: 'objectiveName',
          className: 'text-center',
          width: 200,
          sortNo: `${objectiveId.sortNo}`,
        },
        reportedResId.visibleFlag && {
          title: `${reportedResId.displayName}`,
          dataIndex: 'reportedResName',
          className: 'text-center',
          width: 200,
          sortNo: `${reportedResId.sortNo}`,
        },
        relevantResId.visibleFlag && {
          title: `${relevantResId.displayName}`,
          width: 50,
          dataIndex: 'relevantResName',
          className: 'text-center',
          sortNo: `${relevantResId.sortNo}`,
        },
        planType.visibleFlag && {
          title: `${planType.displayName}`,
          dataIndex: 'planType',
          align: 'center',
          width: 50,
          sortNo: `${planType.sortNo}`,
        },
        remark1.visibleFlag && {
          title: `${remark1.displayName}`,
          dataIndex: 'remark1',
          align: 'center',
          width: 200,
          sortNo: `${remark1.sortNo}`,
        },
        remark2.visibleFlag && {
          title: `${remark2.displayName}`,
          dataIndex: 'remark2',
          align: 'center',
          width: 200,
          sortNo: `${remark2.sortNo}`,
        },
        projectNature.visibleFlag && {
          title: `${projectNature.displayName}`,
          dataIndex: 'projectNature',
          align: 'center',
          width: 50,
          sortNo: `${projectNature.sortNo}`,
        },
        majorWorkItems.visibleFlag && {
          title: `${majorWorkItems.displayName}`,
          dataIndex: 'majorWorkItems',
          align: 'center',
          width: 200,
          sortNo: `${majorWorkItems.sortNo}`,
        },
        completionCriteria.visibleFlag && {
          title: `${completionCriteria.displayName}`,
          dataIndex: 'completionCriteria',
          align: 'center',
          width: 200,
          sortNo: `${completionCriteria.sortNo}`,
        },
        completionTime.visibleFlag && {
          title: `${completionTime.displayName}`,
          dataIndex: 'completionTime',
          align: 'center',
          width: 50,
          sortNo: `${completionTime.sortNo}`,
        },
        responsibilityBuId.visibleFlag && {
          title: `${responsibilityBuId.displayName}`,
          dataIndex: 'responsibilityBuName',
          align: 'center',
          width: 50,
          sortNo: `${responsibilityBuId.sortNo}`,
        },
        responsibilityResId.visibleFlag && {
          title: `${responsibilityResId.displayName}`,
          dataIndex: 'responsibilityResName',
          align: 'center',
          width: 50,
          sortNo: `${responsibilityResId.sortNo}`,
        },
        cooperateResId.visibleFlag && {
          title: `${cooperateResId.displayName}`,
          dataIndex: 'cooperateResName',
          align: 'center',
          width: 50,
          sortNo: `${cooperateResId.sortNo}`,
        },
        checkResId.visibleFlag && {
          title: `${checkResId.displayName}`,
          dataIndex: 'checkResName',
          align: 'center',
          width: 50,
          sortNo: `${checkResId.sortNo}`,
        },
        developmentSituation.visibleFlag && {
          title: `${developmentSituation.displayName}`,
          dataIndex: 'developmentSituation',
          align: 'center',
          width: 200,
          sortNo: `${developmentSituation.sortNo}`,
        },
        developmentStatus.visibleFlag && {
          title: `${developmentStatus.displayName}`,
          dataIndex: 'developmentStatusName',
          align: 'center',
          width: 50,
          sortNo: `${developmentStatus.sortNo}`,
        },
        existingProblem.visibleFlag && {
          title: `${existingProblem.displayName}`,
          dataIndex: 'existingProblem',
          align: 'center',
          width: 200,
          sortNo: `${existingProblem.sortNo}`,
        },
        resultsEvaluation.visibleFlag && {
          title: `${resultsEvaluation.displayName}`,
          dataIndex: 'resultsEvaluationName',
          align: 'center',
          width: 50,
          sortNo: `${resultsEvaluation.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/okr/okrMgmt/workPlanChnt/edit?${from}&fromFlag=WORK`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/okr/okrMgmt/workPlanChnt/edit?id=${id}&${from}&fromFlag=WORK`);
          },
        },
        {
          key: 'finish',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.finish`, desc: '结束' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/finish`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        {
          key: 'copy',
          icon: 'form',
          className: 'tw-btn-info',
          title: '复制',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/okr/okrMgmt/workPlanChnt/edit?id=${id}&${from}&fromFlag=WORK&copy=true`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="工作计划列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default WorkPlanChnt;
