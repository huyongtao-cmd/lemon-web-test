import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import Link from 'umi/link';

const DOMAIN = 'communicate';

@connect(({ loading, communicate, dispatch }) => ({
  communicate,
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class PrefExamList extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanTableFrom` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      communicate: { list, total, searchForm, resDataSource },
      form: { setFieldsValue },
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
      enableSelection: false,
      searchForm,
      searchBarForm: [
        {
          title: '沟通类型',
          dataIndex: 'communicateType',
          options: {
            initialValue: searchForm.communicateType || undefined,
          },
          tag: <Selection.UDC code="ACC:COMMUNICATE_TYPE" placeholder="沟通类型" />,
        },
        {
          title: '发起日期范围',
          dataIndex: 'applyRange',
          options: {
            initialValue: searchForm.applyRange,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '发起人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={resDataSource}
              dropdownMatchSelectWidth={false}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              placeholder="请选择发起人"
              onColumnsChange={value => {}}
            />
          ),
        },
      ],
      columns: [
        {
          title: '绩效考核名称',
          dataIndex: 'performanceExamName',
          align: 'center',
          width: 200,
        },
        {
          title: '沟通类型',
          dataIndex: 'communicateTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '发起人',
          dataIndex: 'applyResName',
          align: 'center',
          width: 150,
        },
        {
          title: '发起日期',
          dataIndex: 'applyDate',
          className: 'text-center',
          width: 150,
        },
        {
          title: '沟通状态',
          dataIndex: 'communicateStatusName',
          className: 'text-center',
          width: 150,
        },
        {
          title: '详情',
          className: 'text-center',
          width: 100,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/prefMgmt/communicate/detail?id=${row.id}&communicateType=${
              row.communicateType
            }&${from}`;
            return (
              <Link className="tw-link" to={href}>
                查看详情
              </Link>
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="绩效考核沟通列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrefExamList;
