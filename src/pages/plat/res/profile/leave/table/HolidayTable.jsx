import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Card, Form, Checkbox } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'leave';

@connect(({ loading, leave, dispatch }) => ({
  loading,
  leave,
  dispatch,
}))
@Form.create({
  // onFieldsChange(props, changedFields) {
  //   if (isEmpty(changedFields)) return;
  //   const { name, value } = Object.values(changedFields)[0];
  //   if (value) {
  //     props.dispatch({
  //       type: `${DOMAIN}/updateForm`,
  //       payload: { [name]: value },
  //     });
  //   }
  // },
})
@mountToTab()
class HolidayTable extends Component {
  // componentDidMount() {
  //   const {
  //     dispatch,
  //     leave: {
  //       fieldsConfig: { taskKey },
  //     },
  //   } = this.props;
  //   const { id, taskId } = fromQs();
  //   dispatch({ type: `${DOMAIN}/myVacationList`, payload: { resId: id } });
  // }

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      leave: { formData, myVacationList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/myVacationList`],
      dataSource: myVacationList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
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
          title: '起始日期',
          dataIndex: 'startDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
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
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default HolidayTable;
