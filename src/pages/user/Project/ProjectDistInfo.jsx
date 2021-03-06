import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Form, Input, InputNumber } from 'antd';
import { isNil, cond, equals, T, isEmpty } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { Selection } from '@/pages/gen/field';
import { sub, mul, add, div, checkIfNumber } from '@/utils/mathUtils';
import { selectFinperiod } from '@/services/user/Contract/sales';

const { Field } = FieldList;
const DOMAIN = 'distInfoProject';

@connect(({ distInfoProject, loading }) => ({ distInfoProject, loading }))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class DistInfoProject extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { ids, finPeriodId } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: ids,
    });
  }

  handleSave = () => {
    const {
      dispatch,
      form: { validateFields },
      distInfoProject: { dataSource, formData },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const { batchDistConfirmedAmtCache } = values;
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            ...formData,
            ...values,
            batchDistConfirmedAmt: batchDistConfirmedAmtCache,
            profitdistResults: dataSource,
          },
        });
      }
    });
  };

  tableProps = () => {
    const {
      dispatch,
      loading,
      distInfoProject: { total, dataSource },
    } = this.props;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      rowKey: 'groupRole',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      enableSelection: false,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: changedValues,
        });
      },
      columns: [
        {
          title: '??????????????????',
          dataIndex: 'groupRoleDesc',
        },
        {
          title: '??????BU',
          dataIndex: 'gainerBuName',
        },
        {
          title: '????????????????????????',
          dataIndex: 'gainerInallPercent',
        },
        {
          title: '??????????????????',
          dataIndex: 'groupBaseTypeDesc',
        },
        // {
        //   title: '?????????????????????',
        //   dataIndex: 'contractName',
        //   align: 'right',
        // },
        // {
        //   title: '?????????????????????',
        //   dataIndex: 'userdefinedNo',
        //   align: 'right',
        // },
        // {
        //   title: '?????????????????????',
        //   dataIndex: 'recvStatus',
        //   align: 'right',
        // },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'receivedGainAmt',
        //   align: 'right',
        // },
        {
          title: '??????????????????????????????',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
        },
      ],
    };
    return tableProps;
  };

  render() {
    const {
      distInfoProject: { formData, dataSource },
      form: { getFieldDecorator },
      dispatch,
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button className="tw-btn-primary" size="large" onClick={() => this.handleSave()}>
            ?????????????????????
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { sourceUrl } = fromQs();
              sourceUrl
                ? closeThenGoto(sourceUrl)
                : closeThenGoto('/user/project/projectReportList');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="????????????"
            hasSeparator
          >
            <Field
              name="contractInfo"
              label="???????????????"
              decorator={{
                initialValue: formData.contractInfo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="camt"
              label="????????????"
              decorator={{
                initialValue: formData.camt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taxRate"
              label="??????"
              decorator={{
                initialValue: formData.taxRate,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="effectiveAmt"
              label="???????????????"
              decorator={{
                initialValue: formData.effectiveAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="grossProfit"
              label="??????"
              decorator={{
                initialValue: formData.grossProfit,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          {/* <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="??????????????????"
            hasSeparator
          >
            <Field
              name="recvedAmt"
              label="??????????????????"
              decorator={{
                initialValue: formData.recvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="actualRecvedAmt"
              label="???????????????"
              decorator={{
                initialValue: formData.actualRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="prevDistRecvedAmt"
              label="?????????????????????"
              decorator={{
                initialValue: formData.prevDistRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="batchDistRecvedAmt"
              label="?????????????????????"
              decorator={{
                initialValue: formData.batchDistRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="finPeriodId"
              label="??????????????????"
              decorator={{
                initialValue: formData.finPeriodId,
                rules: [{ required: true, message: '???????????????????????????' }],
              }}
            >
              <Selection source={() => selectFinperiod()} placeholder="???????????????????????????" disabled />
            </Field>
            <Field
              name="batchDistRecvedAmtCache"
              label="????????????????????????"
              decorator={{
                initialValue: formData.batchDistRecvedAmtCache,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList> */}
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="????????????????????????"
            hasSeparator
          >
            <Field
              name="confirmAmt"
              label="????????????????????????"
              decorator={{
                initialValue: formData.confirmAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="confirmedAmt"
              label="?????????????????????"
              decorator={{
                initialValue: formData.confirmedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="prevDistConfirmedAmt"
              label="?????????????????????"
              decorator={{
                initialValue: formData.prevDistConfirmedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="avalAmt"
              label="?????????????????????"
              decorator={{
                initialValue: formData.avalAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="finPeriodId"
              label="??????????????????"
              decorator={{
                initialValue: formData.finPeriodId,
                rules: [{ required: true, message: '???????????????????????????' }],
              }}
            >
              <Selection source={() => selectFinperiod()} placeholder="???????????????????????????" />
            </Field>
            <Field
              name="batchDistConfirmedAmtCache"
              label="????????????????????????"
              decorator={{
                initialValue: formData.batchDistConfirmedAmtCache,
                rules: [
                  { required: true, message: '?????????????????????????????????' },
                  {
                    validator: (rule, value, callback) => {
                      if (isNil(value) || isEmpty(value)) return callback();
                      const numberValue = isNil(value) || isEmpty(value) ? 0 : +value;
                      if (sub(formData.batchDistConfirmedAmt || 0, numberValue) < 0) {
                        return callback(['?????????????????????????????????']);
                      }
                      return callback();
                    },
                  },
                ],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="?????????????????????????????????"
                onChange={value => {
                  const convertValue = isNil(value) || isEmpty(value) ? 0 : value;
                  if (!checkIfNumber(convertValue)) return; // ??????????????????????????????????????????
                  const numberValue = +convertValue;
                  let currentBatchDistConfirmedAmt = numberValue;
                  if (sub(formData.batchDistConfirmedAmt || 0, numberValue) < 0) {
                    currentBatchDistConfirmedAmt = formData.batchDistConfirmedAmt;
                  }

                  let noTypeObject;
                  let sumConfirmedGainAmt = 0;
                  // 1. ???????????????(?????????)??????????????????????????????????????? / (1+??????) * ??????????????????
                  // 2. ????????????????????????????????????????????????????????????* (????????????????????? / ?????????????????????) * ????????????????????????
                  // 3. ???????????????????????????????????????????????????* (???????????? / ?????????????????????) * ????????????????????????
                  // 4. ??????BU????????????????????????????????????????????????????????????????????? - ?????????????????????????????????????????????
                  const newList = dataSource
                    .map(item => {
                      const { groupBaseType, gainerInallPercent } = item;
                      if (isNil(groupBaseType)) {
                        noTypeObject = item;
                        return undefined;
                      }
                      const confirmedGainAmt =
                        currentBatchDistConfirmedAmt === 0
                          ? 0
                          : cond([
                              // ??????
                              [
                                equals('MARGIN'),
                                () =>
                                  div(
                                    mul(
                                      div(
                                        mul(
                                          currentBatchDistConfirmedAmt || 0,
                                          formData.grossProfit || 0
                                        ),
                                        formData.camt || 0
                                      ),
                                      gainerInallPercent || 0
                                    ),
                                    100
                                  ),
                              ],
                              // ?????????(?????????)
                              [
                                equals('NETSALE'),
                                () =>
                                  div(
                                    div(
                                      mul(
                                        mul(currentBatchDistConfirmedAmt, gainerInallPercent || 0),
                                        100
                                      ),
                                      add(100, formData.taxRate || 0)
                                    ),
                                    100
                                  ),
                              ],
                              // ???????????????
                              [
                                equals('EFFSALE'),
                                () =>
                                  div(
                                    div(
                                      mul(
                                        mul(currentBatchDistConfirmedAmt, gainerInallPercent || 0),
                                        formData.effectiveAmt || 0
                                      ),
                                      formData.camt || 0
                                    ),
                                    100
                                  ),
                              ],
                              [T, () => currentBatchDistConfirmedAmt],
                            ])(groupBaseType);
                      sumConfirmedGainAmt = add(
                        sumConfirmedGainAmt,
                        +confirmedGainAmt.toFixed(2) || 0
                      );
                      return {
                        ...item,
                        confirmedGainAmt: +confirmedGainAmt.toFixed(2),
                      };
                    })
                    .filter(Boolean);
                  const lastList = isNil(noTypeObject)
                    ? newList
                    : [
                        ...newList,
                        {
                          ...noTypeObject,
                          confirmedGainAmt: +sub(
                            currentBatchDistConfirmedAmt || 0,
                            sumConfirmedGainAmt
                          ).toFixed(2),
                        },
                      ];
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      dataSource: lastList,
                    },
                  });
                }}
              />
            </Field>
          </FieldList>
          <FieldList size="large" title="????????????????????????" />
          <DataTable {...this.tableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DistInfoProject;
