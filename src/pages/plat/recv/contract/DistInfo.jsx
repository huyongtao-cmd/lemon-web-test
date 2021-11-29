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
const DOMAIN = 'distInfoPlat';

@connect(({ distInfoPlat, loading }) => ({ distInfoPlat, loading }))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class DistInfoPlat extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { ids, date } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: ids,
    }).then(res => {
      !isNil(date) &&
        !isEmpty(date) &&
        date !== 'null' &&
        dispatch({
          type: `${DOMAIN}/getPeriodInfoByDate`,
          payload: date,
        });
    });
  }

  handleSave = () => {
    const {
      dispatch,
      form: { validateFields },
      distInfoPlat: { dataSource, formData },
    } = this.props;
    const { ids } = fromQs();
    validateFields((err, values) => {
      if (!err) {
        const { batchDistRecvedAmtCache } = values;
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            ...formData,
            ...values,
            batchDistRecvedAmt: batchDistRecvedAmtCache,
            profitdistResults: dataSource,
            recvId: ids,
          },
        });
      }
    });
  };

  tableProps = () => {
    const {
      dispatch,
      loading,
      distInfoPlat: { total, dataSource },
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
          title: '利益分配角色',
          dataIndex: 'groupRoleDesc',
        },
        {
          title: '收益BU',
          dataIndex: 'gainerBuName',
        },
        {
          title: '实际合同收益分配比例',
          dataIndex: 'gainerInallPercent',
          render: value => (value || value === 0) && <span>{value}%</span>,
        },
        {
          title: '利益分配基于',
          dataIndex: 'groupBaseTypeDesc',
        },
        // {
        //   title: '累计已确认收入',
        //   dataIndex: 'contractName',
        //   align: 'right',
        // },
        // {
        //   title: '累计已分配收入',
        //   dataIndex: 'userdefinedNo',
        //   align: 'right',
        // },
        // {
        //   title: '本期可分配收入',
        //   dataIndex: 'recvStatus',
        //   align: 'right',
        // },
        {
          title: '收款分得金额',
          dataIndex: 'receivedGainAmt',
          align: 'right',
        },
      ],
    };
    return tableProps;
  };

  render() {
    const {
      distInfoPlat: { formData, dataSource },
      form: { getFieldDecorator },
      dispatch,
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button className="tw-btn-primary" size="large" onClick={() => this.handleSave()}>
            生成收益分配单
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { sourceUrl } = fromQs();
              sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/saleRece/contract/list');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="合同信息"
            hasSeparator
          >
            <Field
              name="contractInfo"
              label="相关子合同"
              decorator={{
                initialValue: formData.contractInfo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="camt"
              label="合同金额"
              decorator={{
                initialValue: formData.camt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taxRate"
              label="税率"
              decorator={{
                initialValue: formData.taxRate + '%',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="effectiveAmt"
              label="有效销售额"
              decorator={{
                initialValue: formData.effectiveAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="grossProfit"
              label="毛利"
              decorator={{
                initialValue: formData.grossProfit,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="收款及分配信息"
            hasSeparator
          >
            <Field
              name="recvedAmt"
              label="当期应收金额"
              decorator={{
                initialValue: formData.recvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="actualRecvedAmt"
              label="已收款金额"
              decorator={{
                initialValue: formData.actualRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="prevDistRecvedAmt"
              label="往期已分配金额"
              decorator={{
                initialValue: formData.prevDistRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="batchDistRecvedAmt"
              label="剩余可分配金额"
              decorator={{
                initialValue: formData.batchDistRecvedAmt,
              }}
            >
              <Input disabled />
            </Field>
            {/* <Field
              name="settleNo"
              label="合同已分配收入"
              decorator={{
                initialValue: formData.prevDistRecvedAmt,
              }}
            >
              <Input disabled />
            </Field> */}
            <Field
              name="finPeriodId"
              label="收入核算期间"
              decorator={{
                initialValue: formData.finPeriodId,
                rules: [{ required: true, message: '请选择收入核算期间' }],
              }}
            >
              <Selection source={() => selectFinperiod()} placeholder="请选择收入核算期间" />
            </Field>
            <Field
              name="batchDistRecvedAmtCache"
              label="本期实际分配收入"
              decorator={{
                initialValue: formData.batchDistRecvedAmtCache,
                rules: [
                  { required: true, message: '请输入本期实际分配收入' },
                  {
                    validator: (rule, value, callback) => {
                      if (isNil(value) || isEmpty(value)) return callback();
                      const numberValue = isNil(value) || isEmpty(value) ? 0 : +value;
                      if (sub(formData.batchDistRecvedAmt || 0, numberValue) < 0) {
                        return callback(['不能大于剩余可分配金额']);
                      }
                      return callback();
                    },
                  },
                ],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="请输入本期实际分配收入"
                onChange={value => {
                  const convertValue = isNil(value) || isEmpty(value) ? 0 : value;
                  if (!checkIfNumber(convertValue)) return; // 如果不是数字类型，就不计算了
                  const numberValue = +convertValue;
                  let currentBatchDistRecvedAmt = numberValue;
                  if (sub(formData.batchDistRecvedAmt || 0, numberValue) < 0) {
                    currentBatchDistRecvedAmt = formData.batchDistRecvedAmt;
                  }

                  let noTypeObject;
                  let sumReceivedGainAmt = 0;
                  // 1. 基于签单额(不含税)分配时，公式：本期分配金额 / (1+税率) * 实际分配比例
                  // 2. 基于有效销售额分配时，公式：本期分配金额* (合同有效销售额 / 合同含税总金额) * 实际利益分配比例
                  // 3. 基于毛利分配时，公式：本期分配金额* (合同毛利 / 合同含税总金额) * 实际利益分配比例
                  // 4. 交付BU时不出现在利益分配规则里的，公式：本期分配金额 - 其他利益分配角色所分得金额之和
                  const newList = dataSource
                    .map(item => {
                      const { groupBaseType, gainerInallPercent } = item;
                      if (isNil(groupBaseType)) {
                        noTypeObject = item;
                        return undefined;
                      }
                      const receivedGainAmt =
                        currentBatchDistRecvedAmt === 0
                          ? 0
                          : cond([
                              // 毛利
                              [
                                equals('MARGIN'),
                                () =>
                                  div(
                                    mul(
                                      div(
                                        mul(
                                          currentBatchDistRecvedAmt || 0,
                                          formData.grossProfit || 0
                                        ),
                                        formData.camt || 0
                                      ),
                                      gainerInallPercent || 0
                                    ),
                                    100
                                  ),
                              ],
                              // 签单额(不含税)
                              [
                                equals('NETSALE'),
                                () =>
                                  div(
                                    div(
                                      mul(
                                        mul(currentBatchDistRecvedAmt, gainerInallPercent || 0),
                                        100
                                      ),
                                      add(100, formData.taxRate || 0)
                                    ),
                                    100
                                  ),
                              ],
                              // 有效销售额
                              [
                                equals('EFFSALE'),
                                () =>
                                  div(
                                    div(
                                      mul(
                                        mul(currentBatchDistRecvedAmt, gainerInallPercent || 0),
                                        formData.effectiveAmt || 0
                                      ),
                                      formData.camt || 0
                                    ),
                                    100
                                  ),
                              ],
                              [T, () => currentBatchDistRecvedAmt],
                            ])(groupBaseType);
                      sumReceivedGainAmt = add(
                        sumReceivedGainAmt,
                        +receivedGainAmt.toFixed(2) || 0
                      );
                      return {
                        ...item,
                        receivedGainAmt: +receivedGainAmt.toFixed(2),
                      };
                    })
                    .filter(Boolean);
                  const lastList = isNil(noTypeObject)
                    ? newList
                    : [
                        ...newList,
                        {
                          ...noTypeObject,
                          receivedGainAmt: +sub(
                            currentBatchDistRecvedAmt || 0,
                            sumReceivedGainAmt
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
          <FieldList size="large" title="合同收益分配信息" />
          <DataTable {...this.tableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DistInfoPlat;
