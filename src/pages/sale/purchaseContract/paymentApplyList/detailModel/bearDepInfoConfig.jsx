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
import { ARRY_NO, CONFIGSCENE, FLOW_NO } from '../../constConfig';

let sceneval = '';
export function bearDepInfoTableProps(DOMAIN, dispatch, loading, form, mode, paymentApplyDetail) {
  const { bearDepList, formData, pageConfig, fieldsConfig } = paymentApplyDetail;
  const { scene } = formData;
  sceneval = formData.paymentApplicationType;
  console.info('bearDepInfoTableProps' + scene + '' + FLOW_NO[scene]);
  if (ARRY_NO.includes(scene)) {
    sceneval = scene;
  } else {
    sceneval = formData.paymentApplicationType;
  }
  const readOnly =
    mode === 'view'
      ? true
      : fieldsConfig.taskKey !== `${FLOW_NO[sceneval]}_01_SUBMIT_i` &&
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
            restAmt: sub(formData.taxAmountAmt || 0, newVal),
            depAmt: add(sumAmt, newVal),
          },
        });
      }

      // form.setFieldsValue({
      //   restAmt: sub(formData.invoiceAmt || 0, val),
      //   depAmt: add(sumAmt, val),
      // });
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

  // 表单是否可填控制
  const pageFieldMode = fieldMode => {
    const isEdit =
      fieldsConfig.taskKey !== `${FLOW_NO[sceneval]}_01_SUBMIT_i`
        ? true
        : fieldMode === 'UNEDITABLE';
    return isEdit;
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
      title: pageFieldJson.paymentStage.displayName,
      dataIndex: 'paymentStage',
      width: 200,
      options: {
        rules: [
          {
            required: true,
            message: `请选择${pageFieldJson.paymentStage.displayName}`,
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
      className: 'text-right',
      width: 200,
      options: {
        rules: [
          {
            required: true,
            message: `请选择${pageFieldJson.paymentAmt.displayName}`,
          },
        ],
      },
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
      className: 'text-right',
      width: 200,
      render: (value, row, index) => (
        <AsyncSelect
          source={() => getPaymentApplyTempds(20001).then(resp => resp.response.datum)}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={readOnly}
          value={value}
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
