import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DatePicker, Tooltip, Input } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { BuVersion } from '@/pages/gen/field';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const { RangePicker } = DatePicker;

const DOMAIN = 'userTimesheet';
@connect(({ loading, userTimesheet, user }) => ({
  userTimesheet,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@injectUdc(
  {
    tsStatus: 'TSK:TIMESHEET_STATUS', // 状态
    vacationUdc: 'TSK:TIMESHEET_VACATION', // 休假的活动
    notaskUdc: 'TSK:TIMESHEET_NOTASK', // 无任务的活动
  },
  DOMAIN
)
@mountToTab()
class UserTimesheet extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      userTimesheet: { searchForm },
    } = this.props;
    this.fetchData(searchForm);
    dispatch({ type: `${DOMAIN}/queryResList` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    dispatch({ type: `${DOMAIN}/selectBus` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      user,
      userTimesheet: {
        searchForm,
        dataSource,
        total,
        projSource,
        projList,
        resList,
        resSource,
        buList,
        buSource,
      },
    } = this.props;
    const { _udcMap = {} } = this.state;
    const { tsStatus = [], vacationUdc = [], notaskUdc = [] } = _udcMap;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      // rowSelection: {
      //   // type: 'radio',
      //   selectedRowKeys: searchForm.selectedRowKeys,
      // },
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
          title: '项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId || undefined,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={projSource}
              onChange={() => {}}
              placeholder="请选择项目"
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      projSource: projList.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '填报人',
          dataIndex: 'tsResId',
          options: {
            initialValue: searchForm.tsResId || undefined,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={resSource}
              onChange={() => {}}
              placeholder="请选择填报人"
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      resSource: resList.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: 'BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId || undefined,
          },
          tag: <BuVersion />,
        },
        {
          title: '任务包/活动',
          dataIndex: 'taskActivity',
          options: {
            initialValue: searchForm.taskActivity || '',
          },
          tag: <Input placeholder="请输入任务包/活动" />,
        },
        {
          title: '状态',
          dataIndex: 'tsStatus',
          options: {
            initialValue: searchForm.tsStatus || undefined,
          },
          tag: <AsyncSelect source={tsStatus || []} allowClear={false} placeholder="请选择状态" />,
        },
        {
          title: '日期范围',
          dataIndex: 'dateRange',
          options: {
            initialValue: searchForm.dateRange,
          },
          tag: <RangePicker />,
        },
      ],
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
        },
        {
          title: '状态',
          dataIndex: 'tsStatusDesc',
          align: 'center',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          // align: 'center',
        },
        {
          title: '填报人',
          dataIndex: 'tsResName',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '任务包',
          dataIndex: 'taskId',
          render: (value, row, index) => {
            if (value) {
              const timesheetViews = !isEmpty(row.timesheetViews)
                ? row.timesheetViews.filter(item => item.id === row.taskId)
                : [];
              const { taskName = null } = timesheetViews[0] || {};
              return taskName;
            }
            return row.tsTaskIdenDesc;
          },
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
        },
        {
          title: '活动',
          dataIndex: 'actId',
          render: (value, row, index) => {
            if (value) {
              // const timesheetViews = !isEmpty(row.timesheetViews)
              //   ? row.timesheetViews.filter(item => item.id === row.taskId)
              //   : [];
              // const { resActivities = [] } = timesheetViews[0] || {};
              // const { actName = null } = resActivities[0] || {};
              // return actName;
              return row.actName;
            }
            if (row.tsActIden && row.tsTaskIden === 'VACATION') {
              const { name = null } = !isEmpty(vacationUdc)
                ? vacationUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            if (row.tsActIden && row.tsTaskIden === 'NOTASK') {
              const { name = null } = !isEmpty(notaskUdc)
                ? notaskUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            return row.tsActIdenDesc;
          },
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          align: 'right',
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          render: (value, row, index) =>
            value && value.length > 30 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 30)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '审批结果',
          dataIndex: 'apprResult',
          render: (value, row, index) => {
            if (row.tsStatus === 'REJECTED') {
              const val = value && value.replace(/^"|"$/g, '');
              if (val && val.length > 30) {
                return (
                  <Tooltip placement="left" title={val}>
                    <pre>{`${val.substr(0, 30)}...`}</pre>
                  </Tooltip>
                );
              }
              return <pre>{val}</pre>;
            }
            return <pre />;
          },
        },
        {
          title: '审批人',
          dataIndex: 'apprResName',
        },
        {
          title: '审批时间',
          dataIndex: 'approvalTime',
        },
      ],
      leftButtons: [
        {
          key: 'adminApproval',
          className: 'tw-btn-primary',
          title: '高级审批',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(
              v => v.tsStatus !== 'APPROVING' && v.tsStatus !== 'CREATE'
            );
            if (tt.length) {
              createMessage({
                type: 'warn',
                description: '只有新建和审批中状态的工时可以进行高级审批',
              });
              return;
            }
            if (!user.user.admin) {
              createMessage({ type: 'warn', description: '只有管理员可以操作' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/adminApproval`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        // {
        //   key: 'edit',
        //   className: 'tw-btn-primary',
        //   title: '通过',
        //   // icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     if (
        //       selectedRows[0].tsStatus !== 'APPROVING' &&
        //       selectedRows[0].tsStatus !== 'REJECTED'
        //     ) {
        //       createMessage({ type: 'warn', description: '此状态无法审批!' });
        //       return;
        //     }
        //     dispatch({
        //       type: `${DOMAIN}/approvedTimesheets`,
        //       payload: { ids: selectedRowKeys[0], queryParams },
        //     });
        //   },
        // },
        // {
        //   key: 'return',
        //   className: 'tw-btn-primary',
        //   title: '退回',
        //   // icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     if (
        //       selectedRows[0].tsStatus !== 'APPROVING' &&
        //       selectedRows[0].tsStatus !== 'REJECTED'
        //     ) {
        //       createMessage({ type: 'warn', description: '此状态无法退回!' });
        //       return;
        //     }
        //     dispatch({
        //       type: `${DOMAIN}/rejectedTimesheets`,
        //       payload: { ids: selectedRowKeys[0], queryParams },
        //     });
        //   },
        // },
        // {
        //   key: 'subApproval',
        //   className: 'tw-btn-info',
        //   title: '明细审批',
        //   // icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     closeThenGoto(
        //       `/user/timesheet/sub-approval?ids=${selectedRowKeys.join(',')}&tsStatus=${
        //         selectedRows[0].tsStatus
        //       }`
        //     );
        //   },
        // },
        // {
        //   key: 'cancelApproval',
        //   className: 'tw-btn-error',
        //   title: '取消审批',
        //   // icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     // 已结算和新增的无法取消
        //     if (
        //       selectedRows[0].tsStatus !== 'APPROVING' &&
        //       selectedRows[0].tsStatus !== 'APPROVED' &&
        //       selectedRows[0].tsStatus !== 'REJECTED'
        //     ) {
        //       createMessage({ type: 'warn', description: '此状态无法取消审批!' });
        //       return;
        //     }
        //     dispatch({
        //       type: `${DOMAIN}/canceledTimesheets`,
        //       payload: { ids: selectedRowKeys[0], queryParams },
        //     });
        //   },
        // },
      ],
    };

    return (
      <PageHeaderWrapper title="工时列表">
        {!isEmpty(tsStatus) &&
          !isEmpty(vacationUdc) &&
          !isEmpty(notaskUdc) && <DataTable {...tableProps} />}
      </PageHeaderWrapper>
    );
  }
}

export default UserTimesheet;
