// 工时审批(按周)
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Modal } from 'antd';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';
import { injectUdc, mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { add } from '@/utils/mathUtils';
import { createConfirm } from '@/components/core/Confirm';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'userTimesheetApproval';
@connect(({ loading, userTimesheetApproval }) => ({
  userTimesheetApproval,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@injectUdc(
  {
    tsStatus: 'TSK:TIMESHEET_STATUS', // 状态
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
    const {
      dispatch,
      userTimesheetApproval: { searchForm },
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
      userTimesheetApproval: {
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
    const { tsStatus } = _udcMap;

    const tableProps = {
      rowKey: 'groupIds',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      // rowSelection: {
      //   type: 'radio',
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
          tag: <AsyncSelect source={tsStatus || []} />,
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
      ],
      columns: [
        {
          title: '年周',
          dataIndex: 'showYearWeek',
          align: 'center',
          sorter: true,
          render: (value, row) => `${value}(${row.weekStartDate})`,
        },
        {
          title: '填报人',
          dataIndex: 'tsResName',
          sorter: true,
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
          sorter: true,
        },
        {
          title: '项目',
          dataIndex: 'projName',
          sorter: true,
        },
        {
          title: '理论支出当量',
          dataIndex: 'theoryGetEqva',
          align: 'right',
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          align: 'right',
        },
        {
          title: '人天',
          dataIndex: 'showMandays',
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
            let flag = true;
            selectedRows.forEach(v => {
              if (v.tsStatus !== 'APPROVING' && v.tsStatus !== 'REJECTED') {
                flag = false;
              }
            });
            if (!flag) {
              createMessage({ type: 'warn', description: '此状态无法审批!' });
              return;
            }
            const theoryGetEqvaTotal = selectedRows
              .map(l => l.theoryGetEqva)
              .reduce((prev, curr) => add(prev || 0, curr || 0), 0);

            createConfirm({
              content: `理论支出当量值的合计: ${theoryGetEqvaTotal} 是否确认通过?`,
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/approvedTimesheets`,
                  payload: { ids: selectedRowKeys.join(','), queryParams },
                }),
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
            let flag = true;
            selectedRows.forEach(v => {
              if (v.tsStatus !== 'APPROVING' && v.tsStatus !== 'REJECTED') {
                flag = false;
              }
            });
            if (!flag) {
              createMessage({ type: 'warn', description: '此状态无法退回!' });
              return;
            }
            this.setState({
              visible: true,
              selectedRowKeys,
              queryParams,
            });
          },
        },
        {
          key: 'subApproval',
          className: 'tw-btn-info',
          title: '明细审批',
          // icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/timesheet/sub-approval?ids=${selectedRowKeys.join(',')}&tsStatus=${
                selectedRows[0].tsStatus
              }`
            );
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
            // 已结算和新增的无法取消
            let flag = true;
            selectedRows.forEach(v => {
              if (
                v.tsStatus !== 'APPROVING' &&
                v.tsStatus !== 'APPROVED' &&
                v.tsStatus !== 'REJECTED'
              ) {
                flag = false;
              }
            });
            if (!flag) {
              createMessage({ type: 'warn', description: '此状态无法取消审批!' });
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
        <DataTable {...tableProps} />
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
