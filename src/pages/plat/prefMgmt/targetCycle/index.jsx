/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import { omit } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import CreateTargetModal from './CreateTargetModal';
import InformModal from './InformModal';

const DOMAIN = 'targetCycle';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, targetCycle, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  targetCycle,
  dispatch,
}))
@mountToTab()
class TargetCycleList extends PureComponent {
  state = {
    isVisible: false,
    isInform: false,
    periodId: undefined,
    mold: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    let data = { ...omit(['dates'], params) };
    if (Array.isArray(params.dates) && params.dates[0] && params.dates[1]) {
      data = {
        ...data,
        beginDate: params.dates[0],
        endDate: params.dates[1],
      };
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...data } });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  handleChangeDate = (value, type) => {
    const { dispatch } = this.props;
    if (type === 'startDate') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          startDate: value,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          endDate: value,
        },
      });
    }
  };

  // 关闭弹窗。
  periodModal = () => {
    this.setState({
      isVisible: false,
    });
  };

  // 保存按钮事件
  periodSubmitModal = () => {
    this.setState({
      isVisible: false,
    });
  };

  informOk = () => {
    this.setState({
      isInform: false,
      periodId: undefined,
      mold: undefined,
    });
  };

  informCancel = () => {
    this.setState({
      isInform: false,
      periodId: undefined,
      mold: undefined,
    });
  };

  // 绩效目标通知
  createInform = (params, type) => {
    const { dispatch } = this.props;
    if (type === 'performanceInform') {
      dispatch({
        type: `${DOMAIN}/queryResList`,
        payload: { periodId: params },
      });
      dispatch({
        type: `${DOMAIN}/queryTargetNoticedList`,
        payload: { periodId: params },
      });
    } else if (type === 'middleInform') {
      dispatch({
        type: `${DOMAIN}/queryFeedbackResList`,
        payload: { periodId: params },
      });
      dispatch({
        type: `${DOMAIN}/queryFeedbackNoticedList`,
        payload: { periodId: params },
      });
    } else if (type === 'endInform') {
      dispatch({
        type: `${DOMAIN}/querySummaryResList`,
        payload: { periodId: params },
      });
      dispatch({
        type: `${DOMAIN}/querySummaryNoticedList`,
        payload: { periodId: params },
      });
    }
    this.setState({
      isInform: true,
      periodId: params,
      mold: type,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      targetCycle: { dataSource, total, searchForm, createResList, haveNotifiedList },
    } = this.props;
    const { isVisible, isInform, periodId, mold } = this.state;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showColumn: false,
      searchForm,
      dataSource,
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                beginDate: undefined,
                endDate: undefined,
                id: undefined,
                ouId: undefined,
                ouName: undefined,
                periodDesc: undefined,
                periodName: undefined,
                publishToBuLeader: undefined,
                publishToDirectLeader: undefined,
                publishToRes: undefined,
                dates: undefined,
              },
            });
            this.setState({
              isVisible: true,
            });
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/getDetail`,
              payload: { id: selectedRowKeys[0] },
            });
            this.setState({
              isVisible: true,
            });
          },
        },
        {
          key: 'delete',
          icon: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { ids: selectedRowKeys.join(',') },
                }),
            });
          },
        },
        {
          key: 'performanceInform',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '绩效目标通知',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.createInform(selectedRowKeys[0], 'performanceInform');
          },
        },
        {
          key: 'middleInform',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '年中反馈通知',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.createInform(selectedRowKeys[0], 'middleInform');
          },
        },
        {
          key: 'endInform',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '年末报告通知',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.createInform(selectedRowKeys[0], 'endInform');
          },
        },
      ],
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: '周期名称',
          dataIndex: 'periodName',
          options: {
            initialValue: searchForm?.periodName || undefined,
          },
          formItemLayout,
          tag: <Input placeholder="请输入周期名称" />,
        },
        {
          title: '公司',
          dataIndex: 'ouId',
          formItemLayout,
          options: {
            initialValue: searchForm?.ouId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择公司名称" />,
        },
        {
          title: '开始/结束日期',
          dataIndex: 'dates',
          options: {
            initialValue: searchForm?.dates,
          },
          formItemLayout,
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: 'KPI周期名称',
          dataIndex: 'periodName',
          align: 'center',
          render: (value, row, index) => <span>{row?.periodName}</span>,
        },
        {
          title: '公司名称',
          dataIndex: 'ouName',
          align: 'center',
        },
        {
          title: '开始/结束日期',
          align: 'center',
          render: (value, row, index) => <span>{row?.beginDate + ' - ' + row?.endDate}</span>,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="KPI周期管理">
        <DataTable {...tableProps} />
        <CreateTargetModal
          formData={dataSource}
          visible={isVisible}
          handleCancel={this.periodModal}
          handleOk={this.periodSubmitModal}
        />
        <InformModal
          createResList={createResList}
          haveNotifiedList={haveNotifiedList}
          visible={isInform}
          periodId={periodId}
          mold={mold}
          handleCancel={this.informCancel}
          handleOk={this.informOk}
        />
      </PageHeaderWrapper>
    );
  }
}

export default TargetCycleList;
