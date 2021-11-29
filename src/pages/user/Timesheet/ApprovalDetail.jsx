// 工时审批(明细)
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip, Modal, Input } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userTimesheetSubApproval';
@connect(({ loading, userTimesheetSubApproval }) => ({
  userTimesheetSubApproval,
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
class UserApproval extends PureComponent {
  state = {
    visible: false,
    selectedRowKeys: [],
    queryParams: {},
    apprResult: '',
  };

  componentDidMount() {
    const param = fromQs();
    const {
      dispatch,
      userTimesheetSubApproval: { searchForm },
    } = this.props;
    // 从（按周审批列表进入）
    if (param.ids && param.tsStatus) {
      dispatch({
        type: `${DOMAIN}/cleanSearchForm`,
        payload: { ids: param.ids, tsStatus: param.tsStatus },
      });
      this.fetchData({ ids: param.ids, tsStatus: param.tsStatus });
    } else {
      this.fetchData({ ...searchForm, ids: undefined });
    }
    dispatch({ type: `${DOMAIN}/queryResList` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    dispatch({ type: `${DOMAIN}/selectBus` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  modalOk = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, queryParams, apprResult } = this.state;
    dispatch({
      type: `${DOMAIN}/rejectedTimesheets`,
      payload: {
        ids: selectedRowKeys.join(','),
        apprResult,
        queryParams,
      },
    }).then(() => {
      this.setState({
        visible: false,
        selectedRowKeys: [],
        queryParams: {},
        apprResult: '',
      });
    });
  };

  modalCancel = () => {
    this.setState({
      visible: false,
      selectedRowKeys: [],
      queryParams: {},
      apprResult: '',
    });
  };

  handlechange = e => {
    this.setState({
      apprResult: e.target.value,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userTimesheetSubApproval: {
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
    const { _udcMap = {}, visible } = this.state;
    const { tsStatus = [], vacationUdc = [], notaskUdc = [] } = _udcMap;
    const { ids } = fromQs();

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData({ ...filters, ids });
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
            initialValue: searchForm.projId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={projSource}
              onChange={() => {}}
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
            initialValue: searchForm.tsResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={resSource}
              onChange={() => {}}
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
          title: '状态',
          dataIndex: 'tsStatus',
          options: {
            initialValue: searchForm.tsStatus,
          },
          tag: <AsyncSelect source={tsStatus} />,
        },
        {
          title: 'BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={buSource}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      buSource: buList.filter(
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
          title: '任务包',
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
        },
        {
          title: '活动',
          dataIndex: 'actName',
          options: {
            initialValue: searchForm.actName,
          },
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
          // align: 'center',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '任务包',
          dataIndex: 'taskName',
        },
        {
          title: '活动',
          dataIndex: 'actName',
        },
        // {
        //   title: '任务包',
        //   dataIndex: 'taskId',
        //   render: (value, row, index) => {
        //     if (value) {
        //       const timesheetViews = !isEmpty(row.timesheetViews)
        //         ? row.timesheetViews.filter(item => item.id === row.taskId)
        //         : [];
        //       const { taskName = null } = timesheetViews[0] || {};
        //       return taskName;
        //     }
        //     return row.tsTaskIdenDesc;
        //   },
        // },
        // {
        //   title: '活动',
        //   dataIndex: 'actId',
        //   render: (value, row, index) => {
        //     if (value) {
        //       const timesheetViews = !isEmpty(row.timesheetViews)
        //         ? row.timesheetViews.filter(item => item.id === row.taskId)
        //         : [];
        //       const { resActivities = [] } = timesheetViews[0] || {};
        //       const { actName = null } = resActivities[0] || {};
        //       return actName;
        //     }
        //     if (row.tsActIden && row.tsTaskIden === 'VACATION') {
        //       const { name = null } = !isEmpty(vacationUdc)
        //         ? vacationUdc.filter(i => i.code === row.tsActIden)[0] || {}
        //         : {};
        //       return name;
        //     }
        //     if (row.tsActIden && row.tsTaskIden === 'NOTASK') {
        //       const { name = null } = !isEmpty(notaskUdc)
        //         ? notaskUdc.filter(i => i.code === row.tsActIden)[0] || {}
        //         : {};
        //       return name;
        //     }
        //     return row.tsActIdenDesc;
        //   },
        // },
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
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '通过',
          // icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(
              i => i.tsStatus !== 'APPROVING' && i.tsStatus !== 'REJECTED'
            ).length;
            if (flag > 0) {
              createMessage({ type: 'warn', description: '选项中有状态不符合审批的条件!' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/approvedTimesheets`,
              payload: { ids: selectedRowKeys.join(','), queryParams },
            });
          },
        },
        {
          key: 'return',
          className: 'tw-btn-primary',
          title: '退回',
          // icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(
              i => i.tsStatus !== 'APPROVING' && i.tsStatus !== 'REJECTED'
            ).length;
            if (flag > 0) {
              createMessage({ type: 'warn', description: '选项中有状态不符合退回的条件!' });
              return;
            }
            this.setState({
              visible: true,
              selectedRowKeys,
              queryParams,
            });
            // dispatch({
            //   type: `${DOMAIN}/rejectedTimesheets`,
            //   payload: { ids: selectedRowKeys.join(','), queryParams },
            // });
          },
        },
        {
          key: 'cancelApproval',
          className: 'tw-btn-error',
          title: '取消审批',
          // icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(
              i =>
                i.tsStatus !== 'APPROVING' && i.tsStatus !== 'REJECTED' && i.tsStatus !== 'APPROVED'
            ).length;
            if (flag > 0) {
              createMessage({ type: 'warn', description: '选项中有状态不符合取消审批的条件!' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/canceledTimesheets`,
              payload: {
                ids: selectedRowKeys.join(','),
                queryParams,
              },
              callback: () => {
                dispatch({
                  type: `${DOMAIN}/query`,
                  payload: { ...searchForm },
                });
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="工时审批">
        {!isEmpty(tsStatus) &&
          !isEmpty(vacationUdc) &&
          !isEmpty(notaskUdc) && <DataTable {...tableProps} />}

        <Modal
          destroyOnClose
          title="退回意见"
          visible={visible}
          onOk={this.modalOk}
          onCancel={this.modalCancel}
        >
          <Input.TextArea placeholder="请输入退回意见" rows={3} onChange={this.handlechange} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default UserApproval;
