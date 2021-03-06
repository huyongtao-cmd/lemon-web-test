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
        title: '??????',
        dataIndex: 'resNo',
        align: 'center',
      },
      {
        title: '??????',
        dataIndex: 'resName',
        align: 'center',
      },
      {
        title: '??????',
        dataIndex: 'companyDesc',
        align: 'center',
      },
      {
        title: '??????',
        dataIndex: 'buName',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'vacationTypeName',
        align: 'center',
      },
      {
        title: '??????',
        dataIndex: 'vacationYear',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'startDate',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'endDate',
        align: 'center',
      },
      {
        title: '??????????????????',
        dataIndex: 'expirationDate',
        align: 'center',
      },
      {
        title: '?????????',
        dataIndex: 'totalDays',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'usedDays',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'availableDays',
        align: 'center',
      },
      {
        title: '???????????????',
        dataIndex: 'frozenDay',
        align: 'center',
      },
      {
        title: '??????',
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
        label="????????????"
        fieldType="BaseCustomSelect"
        fieldKey="vacationType"
        parentKey="RES:VAC_TYPE"
        defaultShow
      />,
      <SearchFormItem
        key="year"
        fieldType="BaseInputNumber"
        label="??????"
        fieldKey="vacationYear"
        defaultShow
      />,
      <SearchFormItem
        key="vacationYear"
        fieldType="BaseDateRangePicker"
        label="??????????????????"
        fieldKey="vacationDate"
        defaultShow
      />,
    ];

    return fields;
  };

  render() {
    return (
      <PageHeaderWrapper title="????????????">
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
