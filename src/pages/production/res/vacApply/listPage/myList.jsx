import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Tooltip } from 'antd';
import { isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { fromQs } from '@/utils/stringUtils';
import { sub } from '@/utils/mathUtils';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import createMessage from '@/components/core/AlertMessage';
// import ParamConfig from './paramConfigModal';
// import BatchEditModal from './batchEditModal';
import { outputHandle } from '@/utils/production/outputUtil';
import { vacationList, vacationDeleteRq } from '@/services/production/res/vacation';

const DOMAIN = 'vacationMgmtNew';

@connect(({ loading, vacationMgmtNew, user }) => ({
  // loading,
  user,
  vacationMgmtNew,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MyVacationList extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;

    const { _refresh } = fromQs();
    // !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    if (_refresh === '0') {
      const { getInternalState } = this.state;
      const { refreshData } = getInternalState();
      refreshData();
    }
    dispatch({ type: `${DOMAIN}/baseBU` });
    dispatch({
      type: `${DOMAIN}/queryTemporaryTime`,
    });
  }

  fetchData = async payload => {
    const {
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const { vacationDate, ...params } = payload;
    if (Array.isArray(vacationDate) && vacationDate[0] && vacationDate[1]) {
      [params.expirationDateStart, params.expirationDateEnd] = vacationDate;
    }
    delete params.baseBu;
    const { response } = await vacationList({ ...params, resId });
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(vacationDeleteRq, { ids: keys.join(',') }, undefined, false);

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    // const { getInternalState } = this.state;

    const fields = [
      {
        title: '编号',
        dataIndex: 'resNo',
        align: 'center',
      },
      {
        title: '姓名',
        dataIndex: 'resName',
        align: 'center',
      },
      {
        title: '公司',
        dataIndex: 'companyDesc',
        align: 'center',
      },
      {
        title: '部门',
        dataIndex: 'buName',
        align: 'center',
      },
      {
        title: '假期类型',
        dataIndex: 'vacationTypeName',
        align: 'center',
      },
      {
        title: '年度',
        dataIndex: 'vacationYear',
        align: 'center',
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        align: 'center',
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        align: 'center',
      },
      {
        title: '有效截止日期',
        dataIndex: 'expirationDate',
        align: 'center',
      },
      {
        title: '总天数',
        dataIndex: 'totalDays',
        align: 'center',
      },
      {
        title: '已用天数',
        dataIndex: 'usedDays',
        align: 'center',
      },
      {
        title: '可用天数',
        dataIndex: 'availableDays',
        align: 'center',
      },
      {
        title: '未开放天数',
        dataIndex: 'frozenDay',
        align: 'center',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (value, row, key) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <span>{`${value.substr(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            <span>{value}</span>
          ),
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;
    const fields = [
      <SearchFormItem
        key="vacationType"
        label="假期类型"
        fieldType="BaseCustomSelect"
        fieldKey="vacationType"
        parentKey="RES:VAC_TYPE"
        defaultShow
      />,
      <SearchFormItem
        key="year"
        fieldType="BaseInputNumber"
        label="年度"
        fieldKey="vacationYear"
        defaultShow
      />,
      <SearchFormItem
        key="vacationYear"
        fieldType="BaseDateRangePicker"
        label="有效期截止日"
        fieldKey="vacationDate"
        defaultShow
      />,
    ];

    return fields;
  };

  render() {
    return (
      <PageHeaderWrapper title="假期管理">
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[]}
          tableExtraProps={{
            scroll: {
              x: 1500,
            },
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default MyVacationList;
