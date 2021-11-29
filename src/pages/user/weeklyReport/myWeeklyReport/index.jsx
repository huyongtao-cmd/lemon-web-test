import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form, Radio, Switch, Checkbox } from 'antd';
import { isNil, mapObjIndexed } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import SyntheticField from '@/components/common/SyntheticField';
import CityTrigger from '@/pages/gen/field/CityTrigger';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { queryReasonList } from '@/services/user/timesheet/timesheet';

const RadioGroup = Radio.Group;
const { Field } = FieldList;

const DOMAIN = 'weeklyReportCheck';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, weeklyReportCheck }) => ({
  weeklyReportCheck,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class MyWeeklyReport extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    const { saveEdit, mode } = fromQs();
    !saveEdit && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    saveEdit &&
      this.fetchData({
        sortBy: 'id',
        sortDirection: 'DESC',
        offset: 0,
        limit: 10,
        title: '',
      });
    if (saveEdit) {
      const url = getUrl().replace('?saveEdit=true', '');
      closeThenGoto(url);
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      weeklyReportCheck: { list, total, searchForm, resDataSource, baseBuData },
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
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
          title: '期间',
          dataIndex: 'dates',
          options: {
            initialValue: searchForm.dates,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '填报人',
          dataIndex: 'reportResName',
          width: 150,
        },
        {
          title: '周报开始日(周一)',
          dataIndex: 'weekStartDate',
          align: 'center',
          width: 100,
        },
        {
          title: '年周',
          dataIndex: 'yearWeek',
          className: 'text-center',
          width: 100,
        },
        {
          title: '汇报对象',
          dataIndex: 'reportedResId',
          className: 'text-center',
          width: 100,
        },
        {
          title: 'BaseBu',
          dataIndex: 'buName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '资源负责人',
          dataIndex: 'pResName',
          className: 'text-center',
          width: 100,
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper title="周报查看">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MyWeeklyReport;
