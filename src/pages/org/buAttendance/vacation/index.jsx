import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Tooltip } from 'antd';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, YearPicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { sub } from '@/utils/mathUtils';
import { selectbuMemberList } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'orgVacation';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, orgVacation, user }) => ({
  // loading,
  user,
  orgVacation,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class VacationMgmt extends PureComponent {
  state = {
    visible: false,
    failedList: [],
    uploading: false,
  };

  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;
    const { roles = [] } = user;

    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      orgVacation: { list, total, searchForm, resDataSource },
      user: { user },
    } = this.props;
    const { roles = [] } = user;
    const { visible, failedList, uploading } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1450 },
      loading,
      total,
      dataSource: list,
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
          title: '年度',
          className: 'x-fill-100',
          dataIndex: 'vacationYear',
          tag: <YearPicker className="x-fill-100" format="YYYY" />,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={selectbuMemberList}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源"
            />
          ),
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
          title: '有效期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          width: 100,
          align: 'center',
        },
        {
          title: '资源',
          dataIndex: 'redId',
          align: 'center',
          width: 200,
          render: (value, rowData) => {
            const { resNo, resName } = rowData;
            return `${resNo || ''}${resNo ? '-' : ''}${resName || ''}`;
          },
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          width: 100,
          align: 'center',
        },
        {
          title: '起始日期',
          dataIndex: 'startDate',
          width: 150,
          align: 'center',
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          width: 150,
          align: 'center',
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          width: 150,
          align: 'center',
        },
        {
          title: '总天数',
          dataIndex: 'totalDays',
          width: 100,
          align: 'center',
        },
        {
          title: '已用天数',
          dataIndex: 'usedDays',
          width: 150,
          align: 'center',
        },
        {
          title: '可用天数',
          dataIndex: 'canUsedDays',
          width: 100,
          align: 'center',
          render: (value, row, index) =>
            sub(sub(row.totalDays, row.usedDays), row.frozenDay).toFixed(1),
        },
        {
          title: '未开放天数',
          dataIndex: 'frozenDay',
          width: 100,
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 150,
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/org/buAttendance/vacation/edit');
          },
        },

        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            if (selectedRows.length !== 1) return true;
            const { vacationType } = selectedRows[0];
            if (vacationType === 'IN_LIEU') {
              return false;
            }
            return true;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/org/buAttendance/vacation/edit?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            if (selectedRows.length !== 1) return true;
            const { vacationType } = selectedRows[0];
            if (vacationType === 'IN_LIEU') {
              return false;
            }
            return true;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="假期管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default VacationMgmt;
