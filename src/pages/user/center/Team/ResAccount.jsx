import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Form, Input, Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import { isEmpty, isNil, omit } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { MonthRangePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import LedgerTable from '../LedgerTable';

const { Field } = FieldList;

const DOMAIN = 'resAccount';

@connect(({ loading, resAccount }) => ({
  resAccount,
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
@mountToTab()
class ResAccount extends PureComponent {
  componentDidMount() {
    const { resId } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/queryResInfo`, payload: resId });
    this.fetchData({ sortBy: 'finYear', sortDirection: 'DESC', id: resId });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { date = [] } = params || {};
    const noDate = isEmpty(date) || isNil(date) || isNil(date[0]);
    const dateParam = noDate
      ? {}
      : {
          dateFrom: formatDT(date[0], 'YYYYMM'),
          dateTo: formatDT(date[1], 'YYYYMM'),
        };
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...dateParam,
        ...omit(['date'], params),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      resAccount: { searchForm, resInfo, dataSource, total },
      form: { getFieldDecorator },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      domain: DOMAIN,
      loading,
      enableSelection: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData({ ...filters, id: fromQs().resId });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '期间',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <MonthRangePicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '年度期间',
          dataIndex: 'finYear',
          sorter: true,
          align: 'right',
          defaultSortOrder: 'descend',
          render: (value, record, index) => {
            if (value === -1) return '合计';
            const date = formatDT(`${record.finYear}-${record.finPeriod}-01`, 'YYYYMM');
            const link = `/user/center/myTeam/resAccount/equivalent?date=${date}&resId=${
              fromQs().resId
            }`;
            return <Link to={link}>{date}</Link>;
          },
        },
        {
          title: '当月累计收入当量',
          dataIndex: 'iqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计收入金额',
          dataIndex: 'iamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计支出当量',
          dataIndex: 'oqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当月累计支出金额',
          dataIndex: 'oamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
      ],
      leftButtons: [
        {
          key: 'go-detail',
          title: '显示明细',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { from } = fromQs();
            const url = from
              ? `/user/center/myTeam/resAccount/equivalent?resId=${fromQs().resId}&from=${from}`
              : `/user/center/myTeam/resAccount/equivalent?resId=${fromQs().resId}`;
            router.push(url);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              from ? closeThenGoto(from) : closeThenGoto(`/user/center/myTeam`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" title="账户信息" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="ledgerNo"
              label="账号"
              decorator={{
                initialValue: resInfo.ledgerNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="personName"
              label="账户名称"
              decorator={{
                initialValue: resInfo.personName,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
        <Card className="tw-card-adjust" title="账户余额" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="totalQty"
              label="账户当量余额"
              decorator={{
                initialValue: resInfo.totalQty,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="totalAmt"
              label="账户现金余额"
              decorator={{
                initialValue: resInfo.totalAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="avalAmt"
              label="账户可用余额"
              decorator={{
                initialValue: resInfo.avalAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="frozenAmt"
              label="账户冻结余额"
              decorator={{
                initialValue: resInfo.frozenAmt,
              }}
            >
              <Input disabled />
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

export default ResAccount;
