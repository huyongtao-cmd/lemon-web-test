import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
// import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { DatePicker, Alert } from 'antd';
import { omit, keys, values, isNil, isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { UdcSelect, YearPicker } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'resWork';
const STANDARD_MESSAGE =
  '工时按8.0小时=1天换算，不统计“无任务”和“法定假/休假”工时； 利用率=年度工时合计/截止到当前日期的工作天数；  产出率=年度当量合计/截止到当前日期的额定当量';

const buColumns = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, resWork }) => ({
  resWork,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ResWorkList extends Component {
  state = {
    cacheResList: undefined,
    cacheOrgList: undefined,
    cacheUpResList: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      year: moment().year(),
    };
    const initialState = {
      searchForm: defaultSearchForm,
      list: [],
      total: 0,
    };
    dispatch({ type: `${DOMAIN}/updateState`, payload: initialState });
    dispatch({ type: `${DOMAIN}/queryBuSelect` });
    dispatch({ type: `${DOMAIN}/queryOrgSelect` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { year } = params || {};
    if (isNil(year)) {
      createMessage({ type: 'warn', description: '请选择年份后再查询' });
      return;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, resWork, dispatch } = this.props;
    const { list, total, searchForm, orgList, buList } = resWork;
    const { cacheResList, cacheUpResList, cacheOrgList } = this.state;

    const modifiedMultiSelect = (changedValues = {}, allValues) => {
      const key = keys(changedValues)[0];
      const value = values(changedValues)[0] || {};
      let modifiedChanges = {};
      if (key === 'baseBuId') {
        modifiedChanges = {
          baseBuId: value.id,
          baseBuCode: value.code,
          baseBuName: value.name,
          ...omit(['baseBuId'], allValues),
        };
        isNil(value) && this.setState({ cacheOrgList: undefined });
      } else if (key === 'upResId') {
        modifiedChanges = {
          upResId: value.id,
          upResCode: value.code,
          upResName: value.name,
          ...omit(['upResId'], allValues),
        };
        isNil(value) && this.setState({ cacheUpResList: undefined });
      } else if (key === 'resId') {
        modifiedChanges = {
          resId: value.id,
          resCode: value.code,
          resName: value.name,
          ...omit(['resId'], allValues),
        };
        isNil(value) && this.setState({ cacheResList: undefined });
      } else modifiedChanges = allValues;
      return modifiedChanges;
    };

    const tableProps = {
      title: () => <span style={{ color: 'red' }}>{STANDARD_MESSAGE}</span>,
      // rowKey: 'resNo',
      rowKey: record => `${record.resNo}${record.baseBuName}${record.userRate}`,
      sortBy: 'resNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      scroll: { x: 4000 },
      loading,
      total,
      dataSource: list,
      searchForm,
      // enableSelection: false,
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => {
        let modifiedFilters = modifiedMultiSelect({ baseBuId: filters.baseBuId }, filters);
        modifiedFilters = modifiedMultiSelect({ upResId: filters.upResId }, modifiedFilters);
        modifiedFilters = modifiedMultiSelect({ resId: filters.resId }, modifiedFilters);
        const params = omit(
          ['baseBuCode', 'baseBuName', 'upResCode', 'upResName', 'resCode', 'resName'],
          modifiedFilters
        );
        this.fetchData(params);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            searchForm,
            ...allValues,
          },
        });
      },
      searchBarForm: [
        {
          title: '年份',
          dataIndex: 'year',
          options: {
            initialValue: isNil(searchForm.year) ? undefined : searchForm.year,
            // rules: [
            //   {
            //     validator: (rule, value, callback) => {
            //       if (isNil(value)) {
            //         createMessage({ type: 'warn', description: '请选择年份后再查询' });
            //       }
            //       callback()
            //     },
            //   },
            // ],
          },
          tag: <YearPicker className="x-fill-100" mode="year" format="YYYY" />,
        },
        {
          title: '所属组织',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择所属组织"
              columns={buColumns}
              dataSource={isNil(cacheOrgList) ? orgList : cacheOrgList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheOrgList: undefined });
                  else
                    this.setState({
                      cacheOrgList: orgList.filter(
                        d =>
                          d.code.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '资源负责人',
          dataIndex: 'upResId',
          options: {
            initialValue: searchForm.upResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择资源负责人"
              columns={buColumns}
              dataSource={isNil(cacheUpResList) ? buList : cacheUpResList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheUpResList: undefined });
                  else
                    this.setState({
                      cacheUpResList: buList.filter(
                        d =>
                          d.code.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          options: {
            initialValue: searchForm.coopType,
          },
          tag: <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择资源"
              columns={buColumns}
              dataSource={isNil(cacheResList) ? buList : cacheResList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheResList: undefined });
                  else
                    this.setState({
                      cacheResList: buList.filter(
                        d =>
                          d.code.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
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
          title: '资源编号',
          dataIndex: 'resNo',
          fixed: 'left',
          width: 100,
        },
        {
          title: '姓名',
          dataIndex: 'personName',
          fixed: 'left',
          width: 80,
        },
        {
          title: '所属组织',
          dataIndex: 'baseBuName',
          fixed: 'left',
          width: 100,
        },
        {
          title: '资源负责人',
          dataIndex: 'upResName',
          fixed: 'left',
          width: 100,
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
        },
        {
          title: '利用率',
          dataIndex: 'userRate',
          align: 'right',
          // render: value => (isNil(value) ? '' : `${value}%`),
        },
        {
          title: '产出率',
          dataIndex: 'outputRate',
          align: 'right',
          // render: value => (isNil(value) ? '' : `${value}%`),
        },
        {
          title: '额定工时(天)',
          dataIndex: 'timeSheetRated',
          align: 'right',
        },
        {
          title: '实际工时(天)',
          align: 'right',
          dataIndex: 'timeSheetActual',
        },
        {
          title: '额定当量',
          align: 'right',
          dataIndex: 'eqvaRated',
        },
        {
          title: '实际当量',
          dataIndex: 'eqvaActual',
          align: 'right',
        },
        // {
        //   title: '当量系数',
        //   dataIndex: 'eqvaRatio',
        //   align: 'right',
        // },
        {
          title: '加入时间',
          dataIndex: 'dateFrom',
          render: value => formatDT(value),
        },
        {
          title: '退出时间',
          dataIndex: 'dateTo',
          render: value => formatDT(value),
        },

        {
          title: '1月工时(天)',
          dataIndex: 'timeSheet1',
          align: 'right',
        },
        {
          title: '1月当量',
          dataIndex: 'eqva1',
          align: 'right',
        },
        {
          title: '2月工时(天)',
          dataIndex: 'timeSheet2',
          align: 'right',
        },
        {
          title: '2月当量',
          dataIndex: 'eqva2',
          align: 'right',
        },
        {
          title: '3月工时(天)',
          dataIndex: 'timeSheet3',
          align: 'right',
        },
        {
          title: '3月当量',
          dataIndex: 'eqva3',
          align: 'right',
        },
        {
          title: '4月工时(天)',
          dataIndex: 'timeSheet4',
          align: 'right',
        },
        {
          title: '4月当量',
          dataIndex: 'eqva4',
          align: 'right',
        },
        {
          title: '5月工时(天)',
          dataIndex: 'timeSheet5',
          align: 'right',
        },
        {
          title: '5月当量',
          dataIndex: 'eqva5',
          align: 'right',
        },
        {
          title: '6月工时(天)',
          dataIndex: 'timeSheet6',
          align: 'right',
        },
        {
          title: '6月当量',
          dataIndex: 'eqva6',
          align: 'right',
        },
        {
          title: '7月工时(天)',
          dataIndex: 'timeSheet7',
          align: 'right',
        },
        {
          title: '7月当量',
          dataIndex: 'eqva7',
          align: 'right',
        },
        {
          title: '8月工时(天)',
          dataIndex: 'timeSheet8',
          align: 'right',
        },
        {
          title: '8月当量',
          dataIndex: 'eqva8',
          align: 'right',
        },
        {
          title: '9月工时(天)',
          dataIndex: 'timeSheet9',
          align: 'right',
        },
        {
          title: '9月当量',
          dataIndex: 'eqva9',
          align: 'right',
        },
        {
          title: '10月工时(天)',
          dataIndex: 'timeSheet10',
          align: 'right',
        },
        {
          title: '10月当量',
          dataIndex: 'eqva10',
          align: 'right',
        },
        {
          title: '11月工时(天)',
          dataIndex: 'timeSheet11',
          align: 'right',
        },
        {
          title: '11月当量',
          dataIndex: 'eqva11',
          align: 'right',
        },
        {
          title: '12月工时(天)',
          dataIndex: 'timeSheet12',
          align: 'right',
        },
        {
          title: '12月当量',
          dataIndex: 'eqva12',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'res',
          icon: '',
          className: 'tw-btn-primary',
          title: '资源计划',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/center/myTeam/resPlan?resId=${
                selectedRows[0].resId
              }&from=/plat/reportMgmt/resWork`
            );
          },
        },
        {
          key: 'work',
          icon: '',
          className: 'tw-btn-primary',
          title: '工作报表',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/center/myTeam/working?resId=${
                selectedRows[0].resId
              }&from=/plat/reportMgmt/resWork`
            );
          },
        },
        {
          key: 'timeSheet',
          icon: '',
          className: 'tw-btn-primary',
          title: '工时填报明细',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/center/myTeam/timeSheet?resId=${
                selectedRows[0].resId
              }&from=/plat/reportMgmt/resWork`
            );
          },
        },
        {
          key: 'task',
          icon: '',
          className: 'tw-btn-primary',
          title: '任务明细',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/center/myTeam/taskList?resId=${
                selectedRows[0].resId
              }&from=/plat/reportMgmt/resWork`
            );
          },
        },
        {
          key: 'equivalent',
          icon: '',
          className: 'tw-btn-primary',
          title: '当量详情',
          loading: false,
          hidden: false,
          //
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/user/center/myTeam/resAccount?resId=${
                selectedRows[0].resId
              }&from=/plat/reportMgmt/resWork`
            );
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default ResWorkList;
