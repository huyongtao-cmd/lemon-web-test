/* eslint-disable array-callback-return */
/* eslint-disable arrow-body-style */
/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import moment from 'moment';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import { selectAbOus } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import {
  getPaymentApplyTempds,
  selectAccountByNo,
} from '@/services/sale/purchaseContract/paymentApplyList';
import { CONFIGSCENE, FLOW_NO } from '../../constConfig';
import { AccountSelect } from '../../suggestComponent';

export function payRecordTableProps(DOMAIN, dispatch, loading, mode, nameSpace) {
  const { payRecordList, formData, fieldsConfig } = nameSpace;
  const readOnly = fieldsConfig.taskKey !== `${FLOW_NO.PAYRECORD}_01_SUBMIT_i`;
  const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'psubjecteCompany') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payRecordList: update(payRecordList, {
            [rowIndex]: {
              [rowField]: {
                $set: val,
              },
              paymentAccount: {
                $set: '',
              },
              psubjecteBank: {
                $set: '',
              },
            },
          }),
        },
      });
    } else if (rowField === 'collectionCompany') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payRecordList: update(payRecordList, {
            [rowIndex]: {
              [rowField]: {
                $set: val,
              },
              collectionAccount: {
                $set: '',
              },
              collectionBank: { $set: '' },
            },
          }),
        },
      });
    } else if (rowField === 'paymentAccount') {
      dispatch({
        type: `${DOMAIN}/tableAccounts`,
        payload: { accountNo: val },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payRecordList: update(payRecordList, {
              [rowIndex]: {
                [rowField]: {
                  $set: val,
                },
                psubjecteBank: {
                  $set: res || '',
                },
              },
            }),
          },
        });
      });
    } else if (rowField === 'collectionAccount') {
      dispatch({
        type: `${DOMAIN}/tableAccounts`,
        payload: { accountNo: val },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payRecordList: update(payRecordList, {
              [rowIndex]: {
                [rowField]: {
                  $set: val,
                },
                collectionBank: {
                  $set: res || '',
                },
              },
            }),
          },
        });
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payRecordList: update(payRecordList, {
            [rowIndex]: {
              [rowField]: {
                $set: val,
              },
            },
          }),
        },
      });
    }
  };

  const tableProps = {
    readOnly: true,
    rowKey: 'id',
    showCopy: false,
    // loading: loading.effects[`${DOMAIN}/queryPurchase`],
    pagination: false,
    scroll: {
      x: 2500,
    },
    dataSource: payRecordList,
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    // showDelete: readOnly,
    // showAdd: readOnly,
    onAdd: newRow => {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payRecordList: [
            ...payRecordList,
            {
              ...newRow,
              state: 'NEW',
              id: genFakeId(-1),
            },
          ],
        },
      });
    },
    onDeleteItems: (_, selectedRows) => {
      if (selectedRows[0].state !== 'NEW') {
        const deleteIds = selectedRows.map(row => row.id);
        const newList = payRecordList.filter(({ id }) => !deleteIds.includes(id));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payRecordList: newList,
          },
        });
      } else {
        createMessage({ type: 'warn', description: '审批流程中不能删除' });
      }
    },
    buttons: [
      {
        key: 'submit',
        title: '提交',
        loading: false,
        minSelections: 1, // 最少需要选中多少行，按钮才显示
        cb: (selectedRowKeys, selectedRows) => {
          if (selectedRows[0].state === 'NEW') {
            const newSelectedRows = selectedRows.map(item => {
              return Object.assign({}, item, {
                paymentApplyId: formData.id,
              });
            });
            dispatch({
              type: `${DOMAIN}/payRecordSave`,
              payload: {
                newPayRecordList: newSelectedRows,
              },
            }).then(res => {
              if (res) {
                const { id } = res;
                dispatch({
                  type: `${DOMAIN}/payRecordSubmit`,
                  payload: {
                    id: res,
                  },
                });
              }
            });
          } else {
            createMessage({ type: 'warn', description: '该付款记录已发起审批流' });
          }
        },
      },
    ],
    columns: [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 100,
        render: (value, record, index) => index + 1,
      },
      {
        title: '项目公司',
        dataIndex: 'psubjecteCompany',
        className: 'text-right',
        width: 200,
        render: (value, row, index) => (
          <AsyncSelect
            source={() => selectAbOus().then(resp => resp.response)}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={value}
            disabled={readOnly}
            onChange={onCellChanged(index, 'psubjecteCompany')}
          />
        ),
      },
      {
        title: '付款账号',
        dataIndex: 'paymentAccount',
        className: 'text-right',
        width: 200,
        render: (value, row, index) => {
          return (
            <AccountSelect
              abNo={row.psubjecteCompany || '0'}
              value={value}
              disabled={readOnly}
              onChange={onCellChanged(index, 'paymentAccount')}
            />
          );
        },
      },
      {
        title: '付款银行',
        dataIndex: 'psubjecteBank',
        className: 'text-center',
        width: 200,
      },
      {
        title: '付款账号',
        dataIndex: 'psubjecteThat',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <AsyncSelect
            source={() => getPaymentApplyTempds(20001).then(resp => resp.response.datum)}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={value}
            disabled={readOnly}
            onChange={onCellChanged(index, 'psubjecteThat')}
          />
        ),
      },
      {
        title: '付款方式',
        dataIndex: 'payMethod',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <UdcSelect
            code="ACC:PAY_METHOD"
            value={value}
            disabled={readOnly}
            onChange={onCellChanged(index, 'payMethod')}
          />
        ),
      },
      {
        title: '付款金额',
        dataIndex: 'paymentAmt',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <Input value={value} disabled={readOnly} onChange={onCellChanged(index, 'paymentAmt')} />
        ),
      },
      {
        title: '付款日期',
        dataIndex: 'purchaseDate',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <DatePicker
            format="YYYY-MM-DD"
            value={value ? moment() : ''}
            disabled={readOnly}
            className="x-fill-100"
            onChange={onCellChanged(index, 'purchaseDate')}
          />
        ),
      },
      {
        title: '收款公司',
        dataIndex: 'collectionCompany',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <AsyncSelect
            source={() => selectAbOus().then(resp => resp.response)}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={value}
            disabled={readOnly}
            onChange={onCellChanged(index, 'collectionCompany')}
          />
        ),
      },
      {
        title: '收款账号',
        dataIndex: 'collectionAccount',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => {
          return (
            <AccountSelect
              abNo={row.collectionCompany || '0'}
              value={value}
              disabled={readOnly}
              onChange={onCellChanged(index, 'collectionAccount')}
            />
          );
        },
      },
      {
        title: '收款银行',
        dataIndex: 'collectionBank',
        className: 'text-center',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'state',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <UdcSelect
            code="TSK:PAYMENT_SLIP_STATUS"
            value={value}
            disabled={readOnly}
            onChange={onCellChanged(index, 'state')}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'note',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => (
          <Input value={value} disabled={readOnly} onChange={onCellChanged(index, 'note')} />
        ),
      },
    ],
  };
  return tableProps;
}
