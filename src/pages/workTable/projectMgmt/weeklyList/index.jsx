import React from 'react';
import { connect } from 'dva';
import { Switch, Modal } from 'antd';
import router from 'umi/router';
import { isEmpty, isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import moment from 'moment';
import { remindString } from '@/components/production/basic/Remind';
import { createConfirm } from '@/components/core/Confirm';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import { weeklyPgingRq, weeklyDeleteRq } from '@/services/workbench/project';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'weeklyList';

@connect(({ loading, dispatch, weeklyList }) => ({
  loading,
  dispatch,
  ...weeklyList,
}))
class index extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { projectId } = fromQs();
    this.setState({
      projectId,
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'WEEKLY_REPORT_LIST' },
    });
  }

  fetchData = async params => {
    const { date, ...restparams } = params;
    if (Array.isArray(date) && (date[0] || date[1])) {
      [restparams.reportDateFrom, restparams.reportDateTo] = date;
    }

    const { response } = await weeklyPgingRq({ ...restparams });
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(weeklyDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '周报开始日(周一)',
        key: 'weekStartDate',
        dataIndex: 'weekStartDate',
        align: 'center',
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(`/workTable/projectMgmt/weeklyList/detail?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '年周',
        key: 'yearWeek',
        dataIndex: 'yearWeek',
        align: 'center',
        render: (val, row) =>
          `${moment(row.weekStartDate).year()}${moment(row.weekStartDate).weeks()}` || '',
      },
      // {
      //   title: '汇报日期',
      //   key: 'createTime',
      //   dataIndex: 'createTime',
      //   align: 'center',
      //   render: val => moment(val).format('YYYY-MM-DD'),
      // },
      {
        title: '项目名称',
        key: 'projectName',
        dataIndex: 'projectIdDesc',
        align: 'center',
      },
      {
        title: '项目编号',
        key: 'projectNo',
        dataIndex: 'projectNo',
        align: 'center',
      },
      {
        title: '汇报人',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '完成场数',
        key: 'weeklyReportStatisticsField1',
        dataIndex: 'weeklyReportStatisticsField1',
        align: 'center',
      },
      {
        title: '完成页数',
        key: 'weeklyReportStatisticsField2',
        dataIndex: 'weeklyReportStatisticsField2',
        align: 'center',
      },
      {
        title: '完成素材时长',
        key: 'progressReferenceField1',
        dataIndex: 'progressReferenceField1',
        align: 'center',
      },
      {
        title: '状态',
        key: 'weeklyStatus',
        dataIndex: 'weeklyStatusDesc',
        align: 'center',
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'WEEKLY_REPORT_LIST_TABLE_COLUMNS',
      fields
    );

    return fieldsConfig;
  };

  renderSearchForm = () => {
    // const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        label="项目编号/名称"
        key="projectNoName"
        fieldKey="projectNoName"
        fieldType="BaseInput"
        defaultShow
        initialValue={fromQs().projectNo}
      />,
      <SearchFormItem
        label="周报开始日"
        key="date"
        fieldKey="date"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        key="weeklyStatus"
        fieldKey="weeklyStatus"
        fieldType="BaseSelect"
        parentKey="PRO:WEEKLY_STATUS"
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
    const { getInternalState, projectId } = this.state;

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
          }}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          onAddClick={() => {
            if (!isNil(projectId)) {
              router.push(
                `/workTable/projectMgmt/weeklyList/edit?projectId=${projectId}&mode=EDIT`
              );
            } else {
              router.push(`/workTable/projectMgmt/weeklyList/edit?mode=EDIT`);
            }
          }}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.weeklyStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `仅“新建”状态允许修改！`,
              });
              return;
            }

            router.push(`/workTable/projectMgmt/weeklyList/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.weeklyStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `仅“新建”状态的周报表允许删除！`,
                }),
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          extraButtons={[]}
        />
      </PageWrapper>
    );
  }
}

export default index;
