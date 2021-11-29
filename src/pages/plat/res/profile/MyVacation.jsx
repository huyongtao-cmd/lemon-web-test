import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DatePicker } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import { Selection, YearPicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { isNil } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userMyVacation';

@connect(({ loading, userMyVacation, user }) => ({
  user,
  userMyVacation,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class MyVacation extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ vacationYear: moment().year() });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { vacationYear } = params || {};
    const { id } = fromQs();
    if (isNil(vacationYear)) {
      createMessage({ type: 'warn', description: '请选择年度后再查询' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        resId: id,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userMyVacation: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'ASC',
      enableSelection: false,
      // searchForm,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          options: {
            initialValue: isNil(searchForm.vacationYear) ? undefined : searchForm.vacationYear,
          },
          tag: <YearPicker className="x-fill-100" mode="year" format="YYYY" />,
        },
        {
          title: '假期类型',
          dataIndex: 'vacationType',
          options: {
            initialValue: isNil(searchForm.vacationType) ? undefined : searchForm.vacationType,
          },
          tag: <Selection.UDC code="COM:VACATION_TYPE" placeholder="请选择假期类型" />,
        },
      ],
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          align: 'center',
        },
        {
          title: '起始',
          dataIndex: 'startDate',
          align: 'center',
          render: v => v.substring(0, 10),
        },
        {
          title: '截止',
          dataIndex: 'endDate',
          align: 'center',
          render: v => v.substring(0, 10),
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          align: 'center',
          render: v => v.substring(0, 10),
        },
        {
          title: '总数',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '已用',
          dataIndex: 'usedDays',
          align: 'center',
        },
        {
          title: '可用',
          dataIndex: 'availableDays',
          align: 'center',
          render: v => (+v > 0 ? <span style={{ color: '#284488' }}>{v}</span> : v),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MyVacation;
