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
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'vacationApply';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, vacationApply }) => ({
  // loading,
  vacationApply,
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

  fetchData = params => {
    const { dispatch } = this.props;
    const { vacationId } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        vacationId,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      vacationApply: { list, total, searchForm, baseBuDataSource, resDataSource },
    } = this.props;

    const tableProps = {
      rowKey: 'detailId',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1350 },
      loading,
      total,
      dataSource: list,
      enableSelection: false,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '请假单号',
          dataIndex: 'applyNo',
          options: {
            initialValue: searchForm.applyNo || '',
          },
          tag: <Input placeholder="请输入请假单号" />,
        },
        {
          title: '休假日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '假期类型',
          dataIndex: 'vacationType',
          options: {
            initialValue: searchForm.vacationType,
          },
          tag: <Selection.UDC code="COM:VACATION_TYPE" placeholder="请选择假期类型" />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <BuVersion />,
        },
        {
          title: '直属领导',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId,
          },
          tag: (
            <Selection.ResFilterDimission
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择直属领导"
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源"
            />
          ),
        },
      ],
      columns: [
        {
          title: '请假单号',
          dataIndex: 'applyNo',
          width: 150,
          align: 'center',
          render: (value, row) => {
            const href = `/hr/attendanceMgmt/vacationApply/view?id=${row.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '资源',
          dataIndex: 'redId',
          width: 150,
          align: 'center',
          render: (value, rowData) => {
            const { resNo, resName } = rowData;
            return `${resNo || ''}${resNo ? '-' : ''}${resName || ''}`;
          },
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          width: 200,
        },
        {
          title: '直属领导',
          dataIndex: 'presName',
          align: 'center',
          width: 100,
        },
        {
          title: '休假日期',
          dataIndex: 'detailVDate',
          align: 'center',
          width: 100,
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '休假天数',
          dataIndex: 'detailVDays',
          align: 'center',
          width: 100,
        },
        {
          title: '状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '申请人',
          dataIndex: 'apprResName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请日期',
          dataIndex: 'apprDate',
          align: 'center',
          width: 150,
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper title="请假申请">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default VacationApply;
