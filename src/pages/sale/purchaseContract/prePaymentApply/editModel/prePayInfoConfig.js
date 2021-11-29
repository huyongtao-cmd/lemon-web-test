/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';

export function payDetailTableProps(DOMAIN, dispatch, loading, form, mode, prePaymentApplyEdit) {
  const { payDetailList, pageConfig, formData } = prePaymentApplyEdit;
  const pageFieldJson = {};
  if (pageConfig) {
    if (pageConfig.pageBlockViews && pageConfig.pageBlockViews.length > 1) {
      const currentBlockConfig =
        pageConfig.pageBlockViews &&
        pageConfig.pageBlockViews.filter(item => item.blockKey === 'PAYMENT_PLAN')[0];
      const { pageFieldViews } = currentBlockConfig;
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
  }

  const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'currentPaymentAmt') {
      // const newVal = typeof val === 'number' ? val : 0;
      const newVal = val;
      form.setFieldsValue({
        currPaymentAmt: newVal,
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payDetailList: update(payDetailList, {
            [rowIndex]: {
              [rowField]: {
                $set: newVal,
              },
            },
          }),
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payDetailList: update(payDetailList, {
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
      width: 20,
      render: (value, record, index) => index + 1,
    },
    {
      title: `${pageFieldJson.paymentStage.displayName}`,
      sortNo: `${pageFieldJson.paymentStage.sortNo}`,
      key: 'paymentStage',
      dataIndex: 'paymentStage',
      className: 'text-center',
      width: 200,
    },
    {
      title: `${pageFieldJson.currentPaymentAmt.displayName}`,
      sortNo: `${pageFieldJson.currentPaymentAmt.sortNo}`,
      key: 'currentPaymentAmt',
      dataIndex: 'currentPaymentAmt',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          className="number-left x-fill-100"
          parser={v => v.replace(/\$\s?|(,*)/g, '')}
          disabled={mode === 'view'}
          placeholder={`请输入${pageFieldJson.currentPaymentAmt.displayName}`}
          onChange={onCellChanged(index, 'currentPaymentAmt')}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentAmt.displayName}`,
      sortNo: `${pageFieldJson.paymentAmt.sortNo}`,
      key: 'paymentAmt',
      dataIndex: 'paymentAmt',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <InputNumber
          min={0}
          precision={2}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={v => v.replace(/\$\s?|(,*)/g, '')}
          className="number-left x-fill-100"
          value={value}
          disabled={mode === 'view'}
          placeholder={`请输入${pageFieldJson.paymentAmt.displayName}`}
          onChange={onCellChanged(index, 'paymentAmt')}
        />
      ),
    },
    {
      title: `${pageFieldJson.docType.displayName}`,
      sortNo: `${pageFieldJson.docType.sortNo}`,
      key: 'docType',
      dataIndex: 'docType',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Selection.UDC
          code="TSK:DOC_TYPE"
          value={value}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'docType')}
          placeholder={`请选择${pageFieldJson.docType.displayName}`}
        />
      ),
    },
    {
      title: `${pageFieldJson.docTypeName.displayName}`,
      sortNo: `${pageFieldJson.docTypeName.sortNo}`,
      key: 'docTypeName',
      dataIndex: 'docTypeName',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={mode === 'view'}
          placeholder={`请输入${pageFieldJson.docTypeName.displayName}`}
          onChange={onCellChanged(index, 'docTypeName')}
        />
      ),
    },
    {
      title: `${pageFieldJson.contractNo.displayName}`,
      sortNo: `${pageFieldJson.contractNo.sortNo}`,
      key: 'contractNo',
      dataIndex: 'contractNo',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={mode === 'view'}
          placeholder={`请输入${pageFieldJson.contractNo.displayName}`}
          onChange={onCellChanged(index, 'contractNo')}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentDate.displayName}`,
      sortNo: `${pageFieldJson.paymentDate.sortNo}`,
      key: 'paymentDate',
      dataIndex: 'paymentDate',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <DatePicker
          placeholder={`请选择${pageFieldJson.paymentDate.displayName}`}
          format="YYYY-MM-DD"
          value={value ? moment(value) : ''}
          disabled={mode === 'view'}
          onChange={onCellChanged(index, 'paymentDate')}
          className="x-fill-100"
        />
      ),
    },
    {
      title: `${pageFieldJson.milestoneName.displayName}`,
      sortNo: `${pageFieldJson.milestoneName.sortNo}`,

      dataIndex: 'milestoneName',
      key: 'milestoneName',
      className: 'text-center',
      width: 200,
    },
    {
      title: `${pageFieldJson.contractNodeName.displayName}`,
      sortNo: `${pageFieldJson.contractNodeName.sortNo}`,
      key: 'contractNodeName',

      dataIndex: 'contractNodeName',
      className: 'text-center',
      width: 200,
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={mode === 'view'}
          placeholder={`请输入${pageFieldJson.contractNodeName.displayName}`}
          onChange={onCellChanged(index, 'contractNodeName')}
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
      x: 1000,
    },
    dataSource: payDetailList || [],
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    onAdd: newRow => {
      if (payDetailList.length !== 1) {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payDetailList: [
              ...payDetailList,
              {
                ...newRow,
                paymentStage: '预付款',
                currentPaymentAmt: 0,
                id: genFakeId(-1),
                docType: formData.docType || '',
                contractNo: formData.docNo || '',
              },
            ],
          },
        });
      } else {
        createMessage({ type: 'warn', description: '预付款申请只能新增一条明细' });
      }
    },
    onDeleteItems: (_, selectedRows) => {
      const deleteIds = selectedRows.map(row => row.id);
      const newList = payDetailList.filter(({ id }) => !deleteIds.includes(id));
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          payDetailList: newList,
        },
      });
    },
    columns: columnsFilterList,
  };
  return tableProps;
}
