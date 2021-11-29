/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import moment from 'moment';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';

export function cashOutInfoTableProps(
  DOMAIN,
  dispatch,
  loading,
  form,
  mode,
  docNo,
  paymentApplyEdit
) {
  const { cashOutList, formData } = paymentApplyEdit;
  const tableProps = {
    readOnly: mode !== 'create',
    rowKey: 'id',
    loading: false,
    pagination: false,
    showCopy: false,
    showAdd: false,
    scroll: {
      x: 1700,
    },
    dataSource: cashOutList,
    rowSelection: false,
    onDeleteItems: (_, selectedRows) => {
      const deleteIds = selectedRows.map(row => row.id);
      const newList = cashOutList.filter(({ id }) => !deleteIds.includes(id));
      let withdrawTotal = 0;
      newList.map((item, index) => {
        withdrawTotal = mathAdd(withdrawTotal, item.amt);
      });
      form.setFieldsValue({
        withdrawTotal,
      });
      dispatch({
        type: `${DOMAIN}/getPaymentApplyCalcAmt`,
        payload: {
          agreementNo: docNo,
          amt: withdrawTotal,
        },
      });

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          cashOutList: newList,
        },
      });
    },
    columns: [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 100,
        render: (value, record, index) => index + 1,
      },
      {
        title: '提现单号',
        dataIndex: 'withdrawNo',
        width: 200,
      },
      {
        title: '提现人',
        dataIndex: 'resName',
        className: 'text-center',
        width: 200,
      },
      {
        title: '申请日期',
        dataIndex: 'applyDate',
        className: 'text-center',
        width: 200,
      },
      {
        title: '合作方式',
        dataIndex: 'coopTypeName',
        className: 'text-center',
        width: 200,
      },
      {
        title: '提现当量',
        dataIndex: 'eqva',
        className: 'text-center',
        width: 200,
      },
      {
        title: '提现金额',
        dataIndex: 'amt',
        className: 'text-center',
        width: 200,
      },
      {
        title: 'HR处理批号',
        dataIndex: 'hrBatchNo',
        className: 'text-center',
        width: 200,
      },
    ],
  };
  return tableProps;
}
