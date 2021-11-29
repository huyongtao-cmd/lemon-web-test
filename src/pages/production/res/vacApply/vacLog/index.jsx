import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { isNil, isEmpty } from 'ramda';
import { Input, Form, Radio, Modal, Checkbox } from 'antd';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, YearPicker, BuVersion } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';
import { selectInternalOus } from '@/services/gen/list';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { vacationApplyList, vacationApplyDetailRq } from '@/services/production/res/vacation';

const DOMAIN = 'vacationApplyNew';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, vacationApplyNew }) => ({
  // loading,
  vacationApplyNew,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class VacationApply extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    const { vacationId, _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });

    vacationId &&
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: {
          vacationId,
        },
      });
    vacationId &&
      this.fetchData({
        offset: 0,
        limit: 10,
        sortBy: 'id',
        sortDirection: 'DESC',
        vacationId,
      });
  }

  fetchData = async payload => {
    const { vacationId } = fromQs();
    const { vacationYear, ...params } = payload;
    if (Array.isArray(vacationYear) && vacationYear[0] && vacationYear[1]) {
      [params.vdateStart, params.vdateEnd] = vacationYear;
    }
    const { response } = await vacationApplyList(params);
    return response.data;
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    // const { getInternalState } = this.state;

    const fields = [
      {
        title: '请假单号',
        dataIndex: 'applyNo',
        align: 'center',
        render: (value, row) => {
          const href = `/hr/attendanceMgmt/vacLogView?id=${row.id}`;
          return (
            <Link className="tw-link" to={href}>
              {value}
            </Link>
          );
        },
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
        dataIndex: 'vacationTypeDesc',
        align: 'center',
      },
      {
        title: '休假日期',
        dataIndex: 'dateDesc',
        align: 'center',
      },
      {
        title: '天数',
        dataIndex: 'vacationDays',
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'apprStatusDesc',
        align: 'center',
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem key="resId" fieldType="ResSimpleSelect" label="姓名" fieldKey="resId" />,
      <SearchFormItem
        key="company"
        label="所属公司"
        fieldType="BaseCustomSelect"
        fieldKey="company"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeBuId"
        label="部门"
        fieldType="BuSimpleSelect"
        fieldKey="buId"
        defaultShow
      />,
      <SearchFormItem
        key="vacationType"
        label="假期类型"
        fieldType="BaseCustomSelect"
        fieldKey="vacationType"
        parentKey="RES:VAC_TYPE"
        defaultShow
      />,
      <SearchFormItem
        key="vacationYear"
        fieldType="BaseDateRangePicker"
        label="休假日期"
        fieldKey="vacationYear"
      />,
      <SearchFormItem
        key="vacStatus"
        label="状态"
        fieldType="BaseSelect"
        fieldKey="apprStatus"
        parentKey="RES:VAC_STATUS"
        defaultShow
      />,
    ];

    return fields;
  };

  render() {
    return (
      <PageHeaderWrapper title="请假申请">
        <SearchTable
          // wrapperInternalState={internalState => {
          //   this.setState({ getInternalState: internalState });
          // }}
          defaultSortBy="id"
          rowKey="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[]}
        />
      </PageHeaderWrapper>
    );
  }
}

export default VacationApply;
