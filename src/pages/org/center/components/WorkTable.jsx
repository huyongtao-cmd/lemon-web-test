import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { stringify } from 'qs';
import { Progress } from 'antd';
import DataTable from '@/components/common/DataTable';
import { getUrl } from '@/utils/flowToRouter';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'orgCenterWorkTable';
@connect(({ orgCenterWorkTable, loading }) => ({
  orgCenterWorkTable,
  loading,
}))
@mountToTab()
class WorkTable extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchDataAll();
    dispatch({
      type: 'orgCenterWorkTable/getPageConfig',
      payload: { pageNo: 'WORK_PLAN_LIST', type: 'kr' },
    });
    dispatch({
      type: 'orgCenterWorkTable/getPageConfig',
      payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_LIST', type: 'exam' },
    });
  }

  fetchDataAll = () => {
    const { dispatch, buId, selectAllBu, resId, readStatus } = this.props;
    dispatch({
      type: 'orgCenterWorkTable/queryOkrList',
      payload: {
        buId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        resId,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryWorkPlanList',
      payload: {
        buId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        resId,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        resId,
        readStatus,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryExamListList',
      payload: {
        buId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        resId,
      },
    });
  };

  fetchReportData = () => {
    const { dispatch, buId, selectAllBu, resId } = this.props;
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        resId,
      },
    });
  };

  fetchData = (params, tab) => {
    const { dispatch, buId, selectAllBu, resId } = this.props;

    const paramsAll = {
      ...params,
      buId,
      resId,
      selectAllBu: selectAllBu ? 'YES' : 'NO',
    };
    const callFn = [
      'orgCenterWorkTable/queryOkrList',
      'orgCenterWorkTable/queryWorkPlanList',
      'orgCenterWorkTable/queryReportList',
      'orgCenterWorkTable/queryExamListList',
    ];

    dispatch({
      type: callFn[tab],
      payload: paramsAll,
    });
  };

  render() {
    const {
      orgCenterWorkTable: {
        okrList = [],
        okrTotal = 0,
        workPlanList = [],
        workPlanTotal = 0,
        reportList = [],
        reportTotal = 0,
        examtList = [],
        examTotal = 0,
        krPageConfig = {},
        examPageConfig = {},
      },
      tab,
      buId,
    } = this.props;

    // tab : 0 :okr 1:???????????? 2:???????????? 3:????????????
    const tableConfig = [
      {
        dataSource: okrList,
        total: okrTotal,
        columns: [
          {
            title: '????????????',
            dataIndex: 'objectiveName',
            align: 'center',
            render: (value, row) => {
              const urls = getUrl();
              const from = stringify({ from: urls });
              const href = `/okr/okrMgmt/targetMgmt/view?id=${row.id}&${from}`;
              return (
                <Link className="tw-link" to={href}>
                  {value}
                </Link>
              );
            },
          },
          {
            title: '????????????',
            dataIndex: 'objectiveTypeName',
            align: 'center',
          },
          {
            title: '????????????',
            dataIndex: 'objectiveStatusName',
            align: 'center',
          },
          {
            title: '????????????',
            dataIndex: 'objectiveSubjectName',
            align: 'center',
          },
          {
            title: '?????????',
            dataIndex: 'objectiveResName',
            align: 'center',
          },
          {
            title: '????????????',
            dataIndex: 'periodName',
            align: 'center',
          },
          {
            title: '????????????',
            dataIndex: 'objectiveCurProg',
            align: 'center',
            render: value => (
              <Progress
                style={{ width: '80%' }}
                strokeColor="#54A4ED"
                percent={Number(value) || 0}
                status="active"
              />
            ),
          },
          {
            title: '?????????',
            dataIndex: 'objTotalSon',
            align: 'center',
            render: value => (
              <span
                style={{
                  display: 'inline-block',
                  width: '40px',
                  backgroundColor: '#54A4ED',
                  color: '#fff',
                  borderRadius: '4px',
                }}
              >
                {value}
              </span>
            ),
          },
          {
            title: '????????????',
            dataIndex: 'approvalStatusName',
            align: 'center',
          },
          {
            title: '?????????',
            dataIndex: 'createUserName',
            align: 'center',
          },
          {
            title: '??????????????????',
            dataIndex: 'modifyTime',
            align: 'center',
          },
          {
            title: '?????????1',
            dataIndex: 'objectiveCat1',
            align: 'center',
          },
        ],
      },
      {
        dataSource: workPlanList,
        total: workPlanTotal,
        columns: [],
      },
      {
        dataSource: reportList,
        total: reportTotal,
        columns: [
          {
            title: '?????????',
            dataIndex: 'reportResIdName',
            align: 'center',
            width: '20%',
          },
          {
            title: '??????',
            dataIndex: 'dateStart',
            align: 'center',
            width: '20%',
            render: (value, row, index) => (value ? `${row.dateStart} ~ ${row.dateEnd}` : ''),
          },
          {
            title: '????????????',
            dataIndex: 'reportTypeName',
            align: 'center',
            width: '10%',
          },
          {
            title: '????????????',
            dataIndex: 'workSummary',
            width: '30%',
          },
          {
            title: '????????????',
            dataIndex: 'readStatus',
            align: 'center',
            width: '10%',
          },
          {
            title: '??????',
            dataIndex: 'multiDetail',
            align: 'center',
            render: (value, rowData) => {
              const { id } = rowData;
              // const reportSource = false;
              const href = `/user/weeklyReport/workReportDetail?id=${id}&reportSource=${true}`;
              return (
                <div
                  style={{
                    color: '#008FDB',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    setTimeout(() => {
                      this.fetchReportData();
                    }, 2000);
                    router.push(href);
                  }}
                >
                  ??????
                </div>
              );
            },
          },
        ],
      },
      {
        dataSource: examtList,
        total: examTotal,
        columns: [],
      },
    ];
    const { pageBlockViews: krPageBlockViews } = krPageConfig;
    const { pageBlockViews: examPageBlockViews } = examPageConfig;
    if (krPageBlockViews && krPageBlockViews.length > 0) {
      const krCurrentListConfig =
        krPageBlockViews.find(view => view.blockPageName === '?????????') || [];
      const { pageFieldViews: krPageFieldViews } = krCurrentListConfig;
      tableConfig[1].columns =
        krPageFieldViews &&
        krPageFieldViews.filter(item => item.visibleFlag === 1).map(item => {
          const objMap = {
            planResId: 'planResName',
            planStatus: 'planStatusName',
            objectiveId: 'objectiveName',
            relevantResId: 'relevantResName',
            taskId: 'taskIdName',
            activityId: 'activityName',
            reportedResId: 'reportedResName',
            createUserId: 'createUserName',
          };
          const column = {
            title: item.displayName,
            dataIndex: objMap[item.fieldKey] ? objMap[item.fieldKey] : item.fieldKey,
            align: 'center',
            sortNo: item.sortNo,
          };
          if (item.fieldKey === 'taskName') {
            column.render = (value, row, key) => {
              const urls = getUrl();
              const from = stringify({ from: urls });
              const href = `/okr/okrMgmt/workPlanChnt/detail?id=${row.id}&${from}`;
              return (
                <Link className="tw-link" to={href}>
                  {value}
                </Link>
              );
            };
          }
          return column;
        });
    }
    if (examPageBlockViews && examPageBlockViews.length > 0) {
      const examCurrentListConfig =
        examPageBlockViews.find(view => view.blockPageName === '?????????') || [];
      const { pageFieldViews: examPageFieldViews } = examCurrentListConfig;
      tableConfig[3].columns =
        examPageFieldViews &&
        examPageFieldViews.filter(item => item.visibleFlag === 1).map(item => {
          const objMap = {
            apprStatus: 'apprStatusName',
            resId: 'resName',
          };
          const column = {
            title: item.displayName,
            dataIndex: objMap[item.fieldKey] ? objMap[item.fieldKey] : item.fieldKey,
            align: 'center',
            sortNo: item.sortNo,
          };
          return column;
        });
    }
    const tableProps = {
      rowKey: tab !== 3 ? 'id' : 'eid',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      total: tableConfig[tab].total,
      dataSource: tableConfig[tab].dataSource,
      columns: tableConfig[tab].columns,
      onChange: filters => this.fetchData(filters, tab),
    };

    return <DataTable {...tableProps} />;
  }
}

export default WorkTable;
