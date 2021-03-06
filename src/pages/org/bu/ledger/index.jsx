import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Divider, Card, Tooltip, Icon } from 'antd';
import router from 'umi/router';
import { createConfirm } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { MonthRangePicker } from '@/pages/gen/field';
import LedgerTable from './LedgerTable';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'orgBuLedger';

@connect(({ loading, orgBuLedger }) => ({
  orgBuLedger,
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
class BuLedger extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'finYear', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      orgBuLedger: { searchForm, formData, dataSource, total },
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
        let searchData = { ...allValues };
        if (allValues && allValues.date && allValues.date.length > 0) {
          searchData = {
            ...searchData,
            date: null,
            dateFrom: allValues.date[0].format('YYYYMM'),
            dateTo: allValues.date[1].format('YYYYMM'),
          };
        } else {
          searchData = { ...searchData, date: null, dateFrom: null, dateTo: null };
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: searchData,
        });
      },
      searchBarForm: [
        {
          title: '??????', // TODO: ?????????
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <MonthRangePicker className="x-fill-100" />,
        },
      ],
      columns: [
        {
          title: '??????', // TODO: ?????????
          dataIndex: 'finYear',
          sorter: true,
          align: 'right',
          defaultSortOrder: 'descend',
          render: (value, record, index) => (value === -1 ? '??????' : value),
        },
        {
          title: '??????', // TODO: ?????????
          dataIndex: 'finPeriod',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '????????????????????????', // TODO: ?????????
          dataIndex: 'iqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '????????????????????????', // TODO: ?????????
          dataIndex: 'iamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '????????????????????????', // TODO: ?????????
          dataIndex: 'oqtySum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '????????????????????????', // TODO: ?????????
          dataIndex: 'oamtSum',
          align: 'right',
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" title="????????????" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="ledgerNo"
              label="??????"
              decorator={{
                initialValue: formData && formData.ledgerNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="buName"
              label="????????????"
              decorator={{
                initialValue: formData && formData.buName,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
        <Card className="tw-card-adjust" title="????????????" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="totalQty"
              label="??????????????????"
              decorator={{
                initialValue: formData && formData.totalQty,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="totalAmt"
              label="??????????????????"
              decorator={{
                initialValue: formData && formData.totalAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="avalAmt"
              label="??????????????????"
              decorator={{
                initialValue: formData && formData.avalAmt,
              }}
            >
              <Input
                disabled
                addonAfter={
                  <Tooltip placement="topLeft" title="??????">
                    <Icon
                      type="money-collect"
                      onClick={() =>
                        router.push(
                          `/org/bu/buWithdraw?ledgerId=${formData.id}&ledgerName=${formData.buName}`
                        )
                      }
                    />
                  </Tooltip>
                }
              />
            </Field>
            <Field
              name="frozenAmt"
              label="??????????????????"
              decorator={{
                initialValue: formData && formData.frozenAmt,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
        <Card className="tw-card-adjust" title="??????????????????" bordered={false}>
          <LedgerTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuLedger;
