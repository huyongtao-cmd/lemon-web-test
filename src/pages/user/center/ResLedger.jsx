import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Input, Card, Button, Icon, Tooltip } from 'antd';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import LedgerTable from './LedgerTable';
import { MonthRangePicker, DatePicker } from '@/pages/gen/field';

const { Field } = FieldList;

const DOMAIN = 'userResLedger';

@connect(({ loading, userResLedger }) => ({
  userResLedger,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class ResLedger extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'finYear', sortDirection: 'DESC' });
  }

  fetchData = params => {
    if (!params.dateFrom) {
      createMessage({ type: 'warn', description: '请选择开始时间' });
      return;
    }
    if (!params.dateTo) {
      createMessage({ type: 'warn', description: '请选择结束时间' });
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: `user/fetchPrincipal`,
    }).then(currentUser => {
      if (!currentUser.user.extInfo) {
        createMessage({ type: 'warn', description: `当前登录人资源不存在` });
        return;
      }
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          ...params,
          dateFrom: moment(params.dateFrom).format('YYYYMM'),
          dateTo: moment(params.dateTo).format('YYYYMM'),
          // date: undefined,
          // dateFrom:
          //   params && params.date
          //     ? (params.date[0] && moment(params.date[0]).format('YYYYMM')) || params.date[0]
          //     : undefined,
          // dateTo:
          //   params && params.date
          //     ? (params.date[1] && moment(params.date[1]).format('YYYYMM')) || params.date[1]
          //     : undefined,
        },
      });
    });
  };

  colorStyle = val => {
    if (val && val > 0) {
      return { style: { cursor: 'pointer', color: '#284488' } };
    }
    return { style: { cursor: 'pointer' } };
  };

  render() {
    const {
      dispatch,
      loading,
      userResLedger: { searchForm, formData, dataSource, total },
      form: { getFieldDecorator },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      domain: DOMAIN,
      loading: false,
      enableSelection: false,
      total,
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
        // {
        //   title: '期间', // TODO: 国际化
        //   dataIndex: 'date',
        //   options: {
        //     initialValue: searchForm.date,
        //   },
        //   tag: <MonthRangePicker className="x-fill-100" />,
        // },
        {
          title: '开始时间', // TODO: 国际化
          dataIndex: 'dateFrom',
          options: {
            initialValue: searchForm.dateFrom,
          },
          tag: <DatePicker.MonthPicker className="x-fill-100" />,
        },
        {
          title: '结束时间', // TODO: 国际化
          dataIndex: 'dateTo',
          options: {
            initialValue: searchForm.dateTo,
          },
          tag: <DatePicker.MonthPicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '年度', // TODO: 国际化
          dataIndex: 'finYear',
          sorter: true,
          align: 'right',
          defaultSortOrder: 'descend',
          render: (value, record, index) => (value === -1 ? '合计' : value),
        },
        {
          title: '期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计收入当量', // TODO: 国际化
          dataIndex: 'iqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计收入金额', // TODO: 国际化
          dataIndex: 'iamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计支出当量', // TODO: 国际化
          dataIndex: 'oqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计支出金额', // TODO: 国际化
          dataIndex: 'oamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" title="账户信息" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="ledgerNo"
              label="账号"
              decorator={{
                initialValue: formData && formData.ledgerNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="personName"
              label="账户名称"
              decorator={{
                initialValue: formData && formData.personName,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
        <Card className="tw-card-adjust" title="账户余额" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="avalQty"
              label="可用当量"
              decorator={{
                initialValue: formData && formData.avalQty,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="frozenQty"
              label="冻结当量"
              decorator={{
                initialValue: formData && formData.frozenQty,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="avalAmt"
              label="可用现金"
              decorator={{
                initialValue: formData && formData.avalAmt,
              }}
            >
              <Input
                disabled
                addonAfter={
                  <Tooltip placement="topLeft" title="提现">
                    <Icon
                      type="money-collect"
                      {...this.colorStyle(formData.avalAmt)}
                      onClick={() => router.push('/user/center/withdraw')}
                    />
                    {formData.avalAmt > 0 ? (
                      <span style={{ color: 'red', cursor: 'pointer' }}>提现</span>
                    ) : (
                      ''
                    )}
                  </Tooltip>
                }
              />
            </Field>
            <Field
              name="frozenAmt"
              label="冻结现金"
              decorator={{
                initialValue: formData && formData.frozenAmt,
              }}
            >
              <Input
                disabled
                addonAfter={
                  <Tooltip placement="topLeft" title="解冻">
                    <Icon
                      type="unlock"
                      {...this.colorStyle(formData.frozenAmt)}
                      onClick={() => router.push('/user/center/unfreeze')}
                    />
                    {formData.frozenAmt > 0 ? (
                      <span style={{ color: 'red', cursor: 'pointer' }}>解冻</span>
                    ) : (
                      ''
                    )}
                  </Tooltip>
                }
              />
            </Field>
          </FieldList>
        </Card>
        <Card className="tw-card-adjust" title="账户经营状况" bordered={false}>
          <LedgerTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResLedger;
