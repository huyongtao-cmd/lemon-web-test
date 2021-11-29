import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Form, Tooltip } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import moment from 'moment';

const DOMAIN = 'financialPeriod';

@connect(({ loading, financialPeriod, dispatch }) => ({
  financialPeriod,
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class FinancialPeriod extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/queryFinYearAll` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      financialPeriod: { list, total, searchForm, finYearAllData },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
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
          title: '财务年度',
          dataIndex: 'finYearId',
          options: {
            initialValue: searchForm.finYearId || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={finYearAllData}
              transfer={{ key: 'id', code: 'id', name: 'code' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onValueChange={e => {
                dispatch({
                  type: `${DOMAIN}/updateSearchForm`,
                  payload: { finYear: undefined },
                });
                if (e) {
                  dispatch({
                    type: `${DOMAIN}/updateSearchForm`,
                    payload: { finYear: e.code },
                  });
                }
              }}
              placeholder="请选择财务年度"
            />
          ),
        },
        {
          title: '期间名称',
          dataIndex: 'periodName',
          options: {
            initialValue: searchForm.periodName || undefined,
          },
          tag: (
            <DatePicker.MonthPicker
              format="YYYY-MM"
              disabledDate={current =>
                searchForm.finYear
                  ? moment(current).year() !==
                    moment()
                      .year(searchForm.finYear)
                      .year()
                  : false
              }
              placeholder="请选择期间名称"
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'periodStatus',
          options: {
            initialValue: searchForm.periodStatus || undefined,
          },
          tag: <Selection.UDC code="ACC:PERIOD_STATUS" placeholder="请选择状态" />,
        },
      ],
      columns: [
        {
          title: '期间名称',
          dataIndex: 'periodName',
          align: 'center',
          width: '15%',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            const href = `/plat/finAccout/financePeriod/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '财务年度',
          dataIndex: 'finYear',
          align: 'center',
          width: '10%',
        },
        {
          title: '财务期间',
          dataIndex: 'finPeriod',
          align: 'center',
          width: '10%',
        },
        {
          title: '期间状态',
          dataIndex: 'periodStatusName',
          align: 'center',
          width: '15%',
        },
        {
          title: '开始/结束日期',
          dataIndex: 'date',
          align: 'center',
          width: '25%',
          render: (value, row) => `${row.beginDate} ~ ${row.endDate}`,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'create',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/plat/finAccout/financePeriod/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/plat/finAccout/financePeriod/edit?id=${id}&${from}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="财务期间列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default FinancialPeriod;
