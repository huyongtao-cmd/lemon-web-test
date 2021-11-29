import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import { createConfirm } from '@/components/core/Confirm';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import { dailyPagingRq, dailyDeleteRq } from '@/services/workbench/project';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'noticeList';

@connect(({ loading, dispatch, noticeList }) => ({
  loading,
  dispatch,
  ...noticeList,
}))
class index extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'DAILY_PLAN_LIST:MOTICE_LIST' },
    });
    const { projectId, phaseId } = fromQs();
    this.setState({
      projectId,
      phaseId,
    });
    if (projectId) {
      // 阶段列表 - 根据项目ID拉取阶段
      dispatch({
        type: `${DOMAIN}/projectPhaseList`,
        payload: { limit: 0, projectId },
      });
    }
  }

  fetchData = async params => {
    if (fromQs().projectId && fromQs().phaseId) {
      const { date, ...restparams } = params;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [restparams.startDate, restparams.endDate] = date;
      }

      const { response } = await dailyPagingRq({
        ...restparams,
        projectId: params.projectId,
        phaseId: params.phaseId,
      });
      return response.data;
    }

    if (!params.projectId || !params.phaseId) {
      createMessage({ type: 'warn', description: '请先选择项目和阶段，再进行操作！' });
      return { rows: [], total: 0 };
    }

    const { date, ...restparams } = params;
    if (Array.isArray(date) && (date[0] || date[1])) {
      [restparams.startDate, restparams.endDate] = date;
    }

    const { response } = await dailyPagingRq(restparams);
    return response.data;
  };

  deleteData = async keys => outputHandle(dailyDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const {
      pageConfig,
      match: { url },
    } = this.props;
    const { getInternalState } = this.state;

    const fields = [
      {
        title: '编号',
        key: 'dailyNo',
        dataIndex: 'dailyNo',
        align: 'center',
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/projectMgmt/noticeList/detail?id=${row.id}&projectId=${
                  row.projectId
                }&phaseId=${row.phaseId}&sourceType=SCHEDULE&scene=DAILY_PLAN&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '名称',
        key: 'dailyName',
        dataIndex: 'dailyName',
        align: 'center',
      },
      {
        title: '日报表',
        // key: 'link',
        dataIndex: 'link',
        align: 'center',
        render: (value, row) => {
          if (row.dailyStatus === 'REPORTED') {
            return (
              <Link
                onClick={() =>
                  router.push(
                    `/workTable/projectMgmt/noticeList/reportDetail?id=${row.id}&projectId=${
                      row.projectId
                    }&phaseId=${row.phaseId}&sourceType=REPORT&scene=DAILY_REPORT&mode=DESCRIPTION`
                  )
                }
              >
                查看
              </Link>
            );
          }
          return <Link>--</Link>;
        },
      },
      {
        title: '状态',
        key: 'dailyStatus',
        dataIndex: 'dailyStatusDesc',
        align: 'center',
      },
      {
        title: '日期',
        key: 'dailyDate',
        dataIndex: 'dailyDate',
        align: 'center',
      },
      {
        title: '计划场次',
        key: 'scheduleStatisticsField1',
        dataIndex: 'scheduleStatisticsField1',
        align: 'center',
      },
      {
        title: '完成场次',
        key: 'reportStatisticsField1',
        dataIndex: 'reportStatisticsField1',
        align: 'center',
      },
      {
        title: '计划页数',
        key: 'scheduleStatisticsField2',
        dataIndex: 'scheduleStatisticsField2',
        align: 'center',
      },
      {
        title: '完成页数',
        key: 'reportStatisticsField2',
        dataIndex: 'reportStatisticsField2',
        align: 'center',
      },
      {
        title: '所属阶段',
        key: 'phaseId',
        dataIndex: 'phaseIdDesc',
        align: 'center',
      },
      {
        title: '类型',
        key: 'dailyType',
        dataIndex: 'dailyTypeDesc',
        align: 'center',
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'TABLE_LIST_NORMAL',
      fields
    );

    return fieldsConfig;
  };

  renderSearchForm = () => {
    const { dispatch, pageConfig, phaseList } = this.props;
    const { projectId, phaseId } = fromQs();

    const fields = [
      <SearchFormItem
        label="项目"
        key="projectId"
        fieldKey="projectId"
        fieldType="ProjectSimpleSelect"
        defaultShow
        initialValue={projectId}
        onChange={e => {
          this.setState(
            {
              projectId: e,
            },
            () => {
              // 阶段列表 - 根据项目ID拉取阶段
              dispatch({
                type: `${DOMAIN}/projectPhaseList`,
                payload: { limit: 0, projectId: e },
              });
            }
          );
        }}
      />,
      <SearchFormItem
        label="编号/名称"
        key="dailyNoOrName"
        fieldKey="dailyNoOrName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="日期"
        key="date"
        fieldKey="date"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="所属阶段"
        fieldKey="phaseId"
        key="phaseId"
        fieldType="BaseSelect"
        initialValue={phaseId}
        descList={phaseList}
        defaultShow
        onChange={e => {
          this.setState({
            phaseId: e,
          });
        }}
      />,
      <SearchFormItem
        label="类型"
        fieldKey="dailyType"
        key="dailyType"
        fieldType="BaseCustomSelect"
        parentKey="CUS:DAILY_TYPE"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  render() {
    const { dispatch } = this.props;

    const { projectId, phaseId } = this.state;

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{
            projectId,
            phaseId,
          }}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[
            {
              key: 'increased',
              title: '新增',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                router.push(
                  `/workTable/projectMgmt/noticeList/edit?projectId=${projectId}&phaseId=${phaseId}&sourceType=SCHEDULE&scene=DAILY_PLAN&dailyType=CALLSHEET&mode=EDIT`
                );
              },
              disabled: internalState => !projectId || !phaseId,
            },
            {
              key: 'update',
              title: '修改',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return (
                  selectedRows.length !== 1 ||
                  !projectId ||
                  !phaseId ||
                  selectedRows[0].dailyStatus === 'REPORTED' //已报告
                );
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/workTable/projectMgmt/noticeList/edit?id=${
                    selectedRows[0].id
                  }&projectId=${projectId}&phaseId=${phaseId}&sourceType=SCHEDULE&scene=DAILY_PLAN&dailyType=CALLSHEET&mode=EDIT`
                );
              },
            },
            {
              key: 'delete',
              title: '删除',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return (
                  selectedRows.length <= 0 ||
                  selectedRows[0].dailyStatus === 'ISSUED' || //已下发
                  selectedRows[0].dailyStatus === 'REPORTING' || //报告中
                  selectedRows[0].dailyStatus === 'REPORTED' //已报告
                );
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData(selectedRowKeys).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
            {
              key: 'noticeIssue',
              title: '通告下发',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return (
                  selectedRows.length !== 1 ||
                  !projectId ||
                  !phaseId ||
                  selectedRows[0].dailyStatus !== 'PREPARING'
                );
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                const { from } = fromQs();
                router.push(
                  `/workTable/projectMgmt/noticeList/edit?id=${
                    selectedRows[0].id
                  }&projectId=${projectId}&phaseId=${phaseId}&sourceType=SCHEDULE&scene=DAILY_PLAN&mode=EDIT`
                );
              },
            },
            {
              key: 'reportSubmit',
              title: '报告提交',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return (
                  selectedRows.length !== 1 ||
                  !projectId ||
                  !phaseId ||
                  (selectedRows[0].dailyStatus !== 'ISSUED' &&
                    selectedRows[0].dailyStatus !== 'REPORTING')
                );
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/workTable/projectMgmt/noticeList/reportEdit?id=${
                    selectedRows[0].id
                  }&projectId=${projectId}&phaseId=${phaseId}&sourceType=REPORT&scene=DAILY_REPORT&mode=EDIT`
                );
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default index;
