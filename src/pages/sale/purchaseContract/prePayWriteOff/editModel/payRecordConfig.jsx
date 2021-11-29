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
import { selectAbOus, selectAllAbOu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import {
  getPaymentApplyTempds,
  selectAccountByNo,
} from '@/services/sale/purchaseContract/paymentApplyList';

import { AccountSelect } from '../../suggestComponent';

export function payRecordTableProps(DOMAIN, dispatch, loading, form, mode, prePayWriteOffEdit) {
  const { payRecordList, formData, fieldsConfig, pageConfig } = prePayWriteOffEdit;
  const pageFieldJson = {};
  if (pageConfig) {
    if (pageConfig.pageBlockViews && pageConfig.pageBlockViews.length > 1) {
      const currentBlockConfig =
        pageConfig.pageBlockViews &&
        pageConfig.pageBlockViews.filter(item => item.blockKey === 'RECORD')[0];
      const { pageFieldViews } = currentBlockConfig;
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
  }
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

  const columnsList = [
    {
      title: '序号',
      dataIndex: 'id',
      className: 'text-center',
      width: 100,
      render: (value, record, index) => index + 1,
    },
    {
      title: pageFieldJson.psubjecteCompany.displayName,
      dataIndex: 'psubjecteCompany',
      key: 'psubjecteCompany',
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
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'psubjecteCompany')}
          placeholder={`请选择${pageFieldJson.psubjecteCompany.displayName}`}
        />
      ),
    },
    {
      title: pageFieldJson.paymentAccount.displayName,
      dataIndex: 'paymentAccount',
      key: 'paymentAccount',
      className: 'text-right',
      width: 200,
      render: (value, row, index) => {
        return (
          <AccountSelect
            abNo={row.psubjecteCompany || '0'}
            value={value}
            disabled={mode === 'view'}
            onChange={onCellChanged(index, 'paymentAccount')}
          />
        );
      },
    },
    {
      title: pageFieldJson.psubjecteBank.displayName,
      dataIndex: 'psubjecteBank',
      key: 'psubjecteBank',
      className: 'text-center',
      width: 200,
    },
    {
      title: pageFieldJson.paymentAmt.displayName,
      dataIndex: 'paymentAmt',
      key: 'paymentAmt',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Input
          placeholder={`请选择${pageFieldJson.paymentAmt.displayName}`}
          value={value}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'paymentAmt')}
        />
      ),
    },
    {
      title: pageFieldJson.psubjecteThat.displayName,
      dataIndex: 'psubjecteThat',
      key: 'psubjecteThat',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <AsyncSelect
          source={() => getPaymentApplyTempds(20001).then(resp => resp.response.datum)}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={mode === 'view'}
          value={value}
          onChange={onCellChanged(index, 'psubjecteThat')}
          placeholder={`请选择${pageFieldJson.psubjecteThat.displayName}`}
        />
      ),
    },
    {
      title: pageFieldJson.payMethod.displayName,
      dataIndex: 'payMethod',
      key: 'payMethod',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <UdcSelect
          code="ACC:PAY_METHOD"
          value={value}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'payMethod')}
          placeholder={`请选择${pageFieldJson.payMethod.displayName}`}
        />
      ),
    },
    {
      title: pageFieldJson.purchaseDate.displayName,
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <DatePicker
          placeholder={`请选择${pageFieldJson.purchaseDate.displayName}`}
          format="YYYY-MM-DD"
          value={value ? moment(value) : ''}
          className="x-fill-100"
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'purchaseDate')}
        />
      ),
    },
    {
      title: pageFieldJson.collectionCompany.displayName,
      dataIndex: 'collectionCompany',
      key: 'collectionCompany',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <AsyncSelect
          source={() => selectAllAbOu().then(resp => resp.response)}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={mode === 'view'}
          value={value}
          onChange={onCellChanged(index, 'collectionCompany')}
          placeholder={`请选择${pageFieldJson.collectionCompany.displayName}`}
        />
      ),
    },
    {
      title: pageFieldJson.collectionAccount.displayName,
      dataIndex: 'collectionAccount',
      key: 'collectionAccount',
      className: 'text-center',

      width: 200,
      render: (value, row, index) => {
        return (
          <AccountSelect
            abNo={row.collectionCompany || '0'}
            value={value}
            disabled={mode === 'view'}
            onChange={onCellChanged(index, 'collectionAccount')}
          />
        );
      },
    },
    {
      title: pageFieldJson.collectionBank.displayName,
      dataIndex: 'collectionBank',
      key: 'collectionBank',
      className: 'text-center',
      width: 200,
    },
    {
      title: pageFieldJson.state.displayName,
      dataIndex: 'state',
      key: 'state',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <UdcSelect
          code="ACC:WITHDRAW_STATUS"
          value={value}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'state')}
          placeholder={`请选择${pageFieldJson.state.displayName}`}
        />
      ),
    },
    {
      title: pageFieldJson.note.displayName,
      dataIndex: 'note',
      key: 'note',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Input
          placeholder={`请选择${pageFieldJson.note.displayName}`}
          value={value}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'note')}
        />
      ),
    },
  ];
  const columnsFilterList = columnsList.filter(
    field => !field.key || pageFieldJson[field.key].visibleFlag === 1
  );

  const tableProps = {
    readOnly: mode === 'view',
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
    // buttons: [
    //   {
    //     key: 'submit',
    //     title: '提交',
    //     loading: false,
    //     minSelections: 1, // 最少需要选中多少行，按钮才显示
    //     cb: (selectedRowKeys, selectedRows) => {
    //       if (selectedRows[0].state === 'NEW') {
    //         const newSelectedRows = selectedRows.map(item => {
    //           return Object.assign({}, item, {
    //             paymentApplyId: formData.id,
    //           });
    //         });
    //         dispatch({
    //           type: `${DOMAIN}/payRecordSave`,
    //           payload: {
    //             newPayRecordList: newSelectedRows,
    //           },
    //         }).then(res => {
    //           if (res) {
    //             const { id } = res;
    //             dispatch({
    //               type: `${DOMAIN}/payRecordSubmit`,
    //               payload: {
    //                 id: res,
    //               },
    //             });
    //           }
    //         });
    //       } else {
    //         createMessage({ type: 'warn', description: '该付款记录已发起审批流' });
    //       }
    //     },
    //   },
    // ],
    columns: columnsFilterList,
  };
  return tableProps;
}
