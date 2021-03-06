/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import moment from 'moment';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { getPaymentApplyTempds } from '@/services/sale/purchaseContract/paymentApplyList';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import { selectBus } from '@/services/org/bu/bu';

export function bearDepInfoTableProps(DOMAIN, dispatch, loading, mode, prePayWriteOffDetail) {
  const { bearDepList, formData, pageConfig, fieldsConfig } = prePayWriteOffDetail;

  const readOnly =
    mode === 'view'
      ? true
      : fieldsConfig.taskKey !== 'ACC_A82_01_SUBMIT_i' &&
        (fieldsConfig.taskKey && fieldsConfig.taskKey.indexOf('ACCOUNTANCY') === -1);
  const pageFieldJson = {};
  if (pageConfig) {
    if (pageConfig.pageBlockViews && pageConfig.pageBlockViews.length > 1) {
      const currentBlockConfig =
        pageConfig.pageBlockViews &&
        pageConfig.pageBlockViews.filter(item => item.blockKey === 'DEPARTMENT')[0];
      const { pageFieldViews } = currentBlockConfig;
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
  }

  const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'paymentAmt') {
      let sumAmt = 0;
      bearDepList.map((item, index) => {
        if (index !== rowIndex) {
          sumAmt = add(sumAmt, item.paymentAmt);
        }
      });
      // const newVal = typeof val === 'number' ? val : 0;
      const newVal = val;

      if (typeof newVal === 'number') {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            restAmt: sub(formData.taxAmountAmt, newVal),
            depAmt: add(sumAmt, newVal),
          },
        });
      }
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        bearDepList: update(bearDepList, {
          [rowIndex]: {
            [rowField]: {
              $set: val,
            },
          },
        }),
      },
    });
  };

  const columnsList = [
    {
      title: '??????',
      dataIndex: 'id',
      className: 'text-center',
      width: 20,
      render: (value, record, index) => index + 1,
    },
    {
      title: pageFieldJson.paymentStage.displayName,
      dataIndex: 'paymentStage',
      key: 'paymentStage',
      width: 200,
      options: {
        rules: [
          {
            required: true,
            message: `?????????${pageFieldJson.paymentStage.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Selection
          value={value}
          source={() => selectBus()}
          disabled={readOnly}
          onChange={onCellChanged(index, 'paymentStage')}
        />
      ),
    },
    {
      title: pageFieldJson.paymentAmt.displayName,
      dataIndex: 'paymentAmt',
      key: 'paymentAmt',
      className: 'text-right',
      width: 200,
      render: (value, row, index) => (
        <InputNumber
          min={0}
          precision={2}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={v => v.replace(/\$\s?|(,*)/g, '')}
          className="number-left x-fill-100"
          value={value}
          disabled={readOnly}
          onChange={onCellChanged(index, 'paymentAmt')}
        />
      ),
    },
    {
      title: pageFieldJson.psubjecteThat.displayName,
      dataIndex: 'psubjecteThat',
      key: 'psubjecteThat',
      className: 'text-right',
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
  ];
  const columnsFilterList = columnsList.filter(
    field => !field.key || pageFieldJson[field.key].visibleFlag === 1
  );

  const tableProps = {
    readOnly,
    rowKey: 'id',
    showCopy: false,
    // loading: loading.effects[`${DOMAIN}/queryPurchase`],
    pagination: false,
    scroll: {
      x: 1000,
    },
    dataSource: bearDepList,
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    onAdd: newRow => {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          bearDepList: [
            ...bearDepList,
            {
              ...newRow,
              paymentAmt: 0,
              id: genFakeId(-1),
            },
          ],
        },
      });
    },
    onDeleteItems: (_, selectedRows) => {
      const deleteIds = selectedRows.map(row => row.id);
      const newList = bearDepList.filter(({ id }) => !deleteIds.includes(id));
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          bearDepList: newList,
        },
      });
    },
    columns: columnsFilterList,
  };
  return tableProps;
}
