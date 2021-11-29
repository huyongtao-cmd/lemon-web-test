import React, { Component } from 'react';
import { connect } from 'dva';
import { Tag } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
// import { formatMessage } from 'umi/locale';
import { omit, keys, values, isNil } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { UdcSelect } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'myTeam';

const buColumns = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, myTeam, user }) => ({
  myTeam,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MyTeamList extends Component {
  state = {
    cacheLeaderList: undefined,
    cacheResList: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/queryBuSelect` });
    this.fetchData({ sortBy: 'resNo', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const {
      loading,
      myTeam,
      dispatch,
      user: {
        user: { extInfo },
      },
    } = this.props;
    const { list, total, searchForm, buList } = myTeam;
    const { cacheLeaderList, cacheResList } = this.state;

    const modifiedMultiSelect = (changedValues = {}, allValues) => {
      const key = keys(changedValues)[0];
      const value = values(changedValues)[0] || {};
      let modifiedChanges = {};
      if (key === 'id') {
        modifiedChanges = {
          id: value.id,
          code: value.code,
          name: value.name,
          ...omit(['id'], allValues),
        };
        isNil(value) && this.setState({ cacheResList: undefined });
      } else if (key === 'leaderId') {
        modifiedChanges = {
          leaderId: value.id,
          leaderCode: value.code,
          leaderName: value.name,
          ...omit(['leaderId'], allValues),
        };
        isNil(value) && this.setState({ cacheLeaderList: undefined });
      } else modifiedChanges = allValues;
      return modifiedChanges;
    };

    const tableProps = {
      rowKey: 'id',
      sortBy: 'resNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      scroll: { x: 1000 },
      loading,
      total,
      dataSource: list,
      searchForm,
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => {
        let modifiedFilters = modifiedMultiSelect({ id: filters.id }, filters);
        modifiedFilters = modifiedMultiSelect({ leaderId: filters.leaderId }, modifiedFilters);
        const params = omit(['code', 'name', 'leaderCode', 'leaderName'], modifiedFilters);
        this.fetchData(params);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...searchForm,
            ...allValues,
          },
        });
      },
      searchBarForm: [
        {
          title: '资源负责人',
          dataIndex: 'leaderId',
          options: {
            initialValue: searchForm.leaderId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择资源负责人"
              columns={buColumns}
              dataSource={isNil(cacheLeaderList) ? buList : cacheLeaderList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheLeaderList: undefined });
                  else
                    this.setState({
                      cacheLeaderList: buList.filter(
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
          title: '资源类型',
          dataIndex: 'resType',
          options: {
            initialValue: searchForm.resType,
          },
          tag: <UdcSelect code="RES:RES_TYPE1" placeholder="请选择资源类型" />,
        },
        {
          title: '资源',
          dataIndex: 'id',
          options: {
            initialValue: searchForm.id,
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
        {
          title: '复合能力',
          dataIndex: 'capaset',
          options: {
            initialValue: searchForm.capaset,
          },
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          width: 120,
          align: 'center',
          render: (value, row, index) => {
            const url = `/hr/res/profile/list/resQuery?id=${row.id}&from=/user/center/myTeam`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '姓名',
          dataIndex: 'resName',
          width: 100,
        },
        {
          title: '资源负责人',
          dataIndex: 'leaderName',
          width: 120,
        },
        {
          title: '所属组织',
          dataIndex: 'buName',
          width: 150,
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          align: 'right',
          width: 100,
        },
        {
          title: '当量余额',
          dataIndex: 'totalQty',
          align: 'right',
          width: 100,
        },
        {
          title: '资源类型',
          dataIndex: 'resTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '复合能力',
          dataIndex: 'capaset',
          render: (value, row, index) => {
            if (isNil(value)) return null;
            return value.split(',').map(v => <Tag key={v}>{v}</Tag>);
          },
        },
      ],
      leftButtons: [
        {
          key: 'res',
          icon: '',
          className: 'tw-btn-primary',
          title: '资源计划明细',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/center/myTeam/resPlanDetail');
          },
        },
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
            router.push(`/user/center/myTeam/resPlan?resId=${selectedRows[0].id}`);
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
            router.push(`/user/center/myTeam/working?resId=${selectedRows[0].id}`);
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
            router.push(`/user/center/myTeam/timeSheet?resId=${selectedRows[0].id}`);
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
            router.push(`/user/center/myTeam/taskList?resId=${selectedRows[0].id}`);
          },
        },
        {
          key: 'equivalent',
          icon: '',
          className: 'tw-btn-primary',
          title: '当量详情',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/center/myTeam/resAccount?resId=${selectedRows[0].id}`);
          },
        },
        {
          key: 'workCalendar',
          icon: '',
          className: 'tw-btn-primary',
          title: '工作日历',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/weeklyReport/workCalendar?resId=${selectedRows[0].id}`);
          },
        },
        {
          key: 'editCat',
          className: 'tw-btn-primary',
          icon: '',
          title: '资源能力管理',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 || (extInfo.resId && extInfo.resId === selectedRows[0].id),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(
              `/hr/res/profile/list/resCapacity?id=${selectedRows[0].id}&resNo=${
                selectedRows[0].resNo
              }&resName=${selectedRows[0].resName}&${from}`
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

export default MyTeamList;
