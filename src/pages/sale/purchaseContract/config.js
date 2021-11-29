/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import moment from 'moment';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import { getProductClass } from '@/services/gen/list';

const limitDecimals = value => {
  // eslint-disable-next-line no-useless-escape
  const reg = /^(\-)*(\d+)\.(\d\d).*$/;
  let res = '';
  if (typeof value === 'string') {
    // eslint-disable-next-line no-restricted-globals
    res = !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : '';
  } else if (typeof value === 'number') {
    // eslint-disable-next-line no-restricted-globals
    res = !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : '';
  }
  return res;
};

export function paymentTableProps(DOMAIN, dispatch, loading, salePurchaseEdit) {
  const {
    paymentList,
    formData,
    paymentDeletedKeys,
    milestoneArr,
    contractNodeArr,
    pageConfig,
  } = salePurchaseEdit;

  const currentBlockConfig = pageConfig.pageBlockViews.filter(
    item => item.blockKey === 'PURCHASE_CON_MAN_PAY_PLAN'
  )[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'estimatedPaymentDate') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          paymentList: update(paymentList, {
            [rowIndex]: {
              [rowField]: {
                $set: formatDT(val),
              },
            },
          }),
        },
      });
    } else if (rowField === 'milestone') {
      const milestone = milestoneArr.find(item => item.id + '' === val);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          paymentList: update(paymentList, {
            [rowIndex]: {
              [rowField]: {
                $set: val,
              },
              milestoneName: {
                $set: milestone ? milestone.actName : null,
              },
            },
          }),
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          paymentList: update(paymentList, {
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
      width: 50,
      render: (value, record, index) => index + 1,
    },
    {
      title: `${pageFieldJson.paymentStage.displayName}`,
      sortNo: `${pageFieldJson.paymentStage.sortNo}`,
      key: 'paymentStage',
      dataIndex: 'paymentStage',
      required: !!pageFieldJson.paymentStage.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.paymentStage.requiredFlag,
            message: `请输入${pageFieldJson.paymentStage.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          placeholder={`请输入${pageFieldJson.paymentStage.displayName}`}
          onChange={onCellChanged(index, 'paymentStage')}
          disabled={pageFieldJson.paymentStage.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentAmt.displayName}`,
      sortNo: `${pageFieldJson.paymentAmt.sortNo}`,
      dataIndex: 'paymentAmt',
      key: 'paymentAmt',
      className: 'text-right',
      required: !!pageFieldJson.paymentAmt.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.paymentAmt.requiredFlag,
            message: `请输入${pageFieldJson.paymentAmt.displayName}`,
          },
          {
            validator: (rule, value, callback) => {
              if (isNil(value)) {
                callback();
              } else {
                const error = [];
                if (!checkIfNumber(value)) error.push('输入类型不正确');
                callback(error);
              }
            },
          },
        ],
      },
      render: (value, row, index) => (
        <InputNumber
          className="x-fill-100"
          value={value}
          min={0}
          placeholder={`请输入${pageFieldJson.paymentAmt.displayName}`}
          onChange={onCellChanged(index, 'paymentAmt')}
          disabled={pageFieldJson.paymentAmt.fieldMode !== 'EDITABLE'}
          formatter={limitDecimals}
          parser={limitDecimals}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentProportion.displayName}`,
      sortNo: `${pageFieldJson.paymentProportion.sortNo}`,
      dataIndex: 'paymentProportion',
      key: 'paymentProportion',
      className: 'text-right',
      required: !!pageFieldJson.paymentProportion.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.paymentProportion.requiredFlag,
            message: `请输入${pageFieldJson.paymentProportion.displayName}`,
          },
          {
            validator: (rule, value, callback) => {
              if (isNil(value)) {
                callback();
              } else {
                const error = [];
                if (!checkIfNumber(value)) error.push('输入类型不正确');
                callback(error);
              }
            },
          },
        ],
      },
      render: (value, row, index) => (
        <InputNumber
          className="x-fill-100"
          value={value}
          min={0}
          max={100}
          placeholder={`请输入${pageFieldJson.paymentProportion.displayName}`}
          formatter={val => `${limitDecimals(val)}%`}
          parser={val => limitDecimals(val.replace('%', ''))}
          onChange={onCellChanged(index, 'paymentProportion')}
          disabled={pageFieldJson.paymentProportion.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.estimatedPaymentDate.displayName}`,
      sortNo: `${pageFieldJson.estimatedPaymentDate.sortNo}`,
      dataIndex: 'estimatedPaymentDate',
      key: 'estimatedPaymentDate',
      required: !!pageFieldJson.estimatedPaymentDate.requiredFlag,
      width: 180,
      options: {
        rules: [
          {
            required: !!pageFieldJson.estimatedPaymentDate.requiredFlag,
            message: `请选择${pageFieldJson.estimatedPaymentDate.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <DatePicker
          className="x-fill-100"
          format="YYYY-MM-DD"
          placeholder={`请选择${pageFieldJson.estimatedPaymentDate.displayName}`}
          defaultValue={typeof value === 'string' ? moment(value) : value}
          onChange={onCellChanged(index, 'estimatedPaymentDate')}
          disabled={pageFieldJson.estimatedPaymentDate.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentApplyId.displayName}`,
      sortNo: `${pageFieldJson.paymentApplyId.sortNo}`,
      dataIndex: 'paymentNo',
      key: 'paymentApplyId',
      required: !!pageFieldJson.paymentApplyId.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.paymentApplyId.requiredFlag,
            message: `请输入${pageFieldJson.paymentApplyId.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          // placeholder={`请输入${pageFieldJson.paymentApplyId.displayName}`}
          value={value}
          onChange={onCellChanged(index, 'paymentNo')}
          disabled={pageFieldJson.paymentApplyId.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.paymentStatus.displayName}`,
      sortNo: `${pageFieldJson.paymentStatus.sortNo}`,
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      className: 'text-center',
      required: !!pageFieldJson.paymentStatus.requiredFlag,
      width: 150,
      options: {
        rules: [
          {
            required: !!pageFieldJson.paymentStatus.requiredFlag,
            message: `请选择${pageFieldJson.paymentStatus.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Selection.UDC
          value={value}
          className="x-fill-100"
          code="TSK:PAYMENT_PLAN_STATUS"
          placeholder={`请选择${pageFieldJson.paymentStatus.displayName}`}
          disabled={pageFieldJson.paymentStatus.fieldMode !== 'EDITABLE'}
          onChange={onCellChanged(index, 'paymentStatus')}
        />
      ),
    },
    {
      title: `${pageFieldJson.milestone.displayName}`,
      sortNo: `${pageFieldJson.milestone.sortNo}`,
      dataIndex: 'milestone',
      key: 'milestone',
      className: 'text-center',
      required: !!pageFieldJson.milestone.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.milestone.requiredFlag,
            message: `请选择${pageFieldJson.milestone.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Selection
          className="x-fill-100"
          value={value}
          source={milestoneArr}
          transfer={{ key: 'id', code: 'id', name: 'actName' }}
          placeholder={`请选择${pageFieldJson.milestone.displayName}`}
          onChange={onCellChanged(index, 'milestone')}
          disabled={pageFieldJson.milestone.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.contractNode.displayName}`,
      sortNo: `${pageFieldJson.contractNode.sortNo}`,
      dataIndex: 'contractNode',
      key: 'contractNode',
      className: 'text-center',
      required: !!pageFieldJson.contractNode.requiredFlag,
      width: 200,
      options: {
        rules: [
          {
            required: !!pageFieldJson.contractNode.requiredFlag,
            message: `请选择${pageFieldJson.contractNode.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Selection
          className="x-fill-100"
          value={value}
          source={contractNodeArr}
          transfer={{ key: 'id', code: 'id', name: 'phaseDesc' }}
          placeholder={`请选择${pageFieldJson.contractNode.displayName}`}
          onChange={onCellChanged(index, 'contractNode')}
          disabled={pageFieldJson.contractNode.fieldMode !== 'EDITABLE'}
        />
      ),
    },
  ];

  const columnsFilterList = columnsList.filter(
    field => !field.key || pageFieldJson[field.key].visibleFlag === 1
  );

  const tableProps = {
    rowKey: 'id',
    showCopy: false,
    // loading: loading.effects[`${DOMAIN}/queryPurchase`],
    pagination: false,
    scroll: {
      x: 1700,
    },
    dataSource: paymentList,
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    onAdd: newRow => {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          paymentList: [
            ...paymentList,
            {
              ...newRow,
              id: genFakeId(-1),
              paymentStage: null,
              paymentAmt: 0,
              paymentProportion: 0,
              estimatedPaymentDate: null,
              paymentNo: null,
              paymentStatus: 'UNPAID',
              milestone: null,
              milestoneName: null,
              contractNode: null,
              contractNodeName: null,
            },
          ],
        },
      });
    },
    onDeleteItems: (_, selectedRows) => {
      const deleteIds = selectedRows.map(row => row.id);
      const newList = paymentList.filter(({ id }) => !deleteIds.includes(id));
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          paymentDeletedKeys: [...paymentDeletedKeys, ...deleteIds].filter(v => !(v <= 0)),
          paymentList: newList,
        },
      });
    },
    columns: columnsFilterList,
  };
  return tableProps;
}

export function purchaseTableProps(DOMAIN, dispatch, loading, salePurchaseEdit, form) {
  const {
    purchaseList,
    formData,
    udcType1,
    udcType2,
    purchaseDeleteKeys,
    payStatusUDC,
    productClassrArr,
    pageConfig,
  } = salePurchaseEdit;

  const currentBlockConfig = pageConfig.pageBlockViews.filter(
    item => item.blockKey === 'PURCHASE_CON_MAN_DETAILS'
  )[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'quantity') {
      if (checkIfNumber(rowFieldValue)) {
        const taxAmt = div(
          Math.round(
            mul(mul(parseFloat(purchaseList[rowIndex].taxPrice || 0, 10), rowFieldValue), 100)
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            purchaseList: update(purchaseList, {
              [rowIndex]: {
                taxAmt: {
                  $set: taxAmt,
                },
                taxNotAmt: {
                  $set: div(
                    Math.round(
                      mul(
                        div(
                          taxAmt,
                          mathAdd(div(parseFloat(purchaseList[rowIndex].taxRate || 0, 10), 100), 1)
                        ),
                        100
                      )
                    ),
                    100
                  ),
                },
                quantity: {
                  $set: val,
                },
              },
            }),
          },
        });
        let amt = 0;
        let taxAmtSum = 0;
        purchaseList.forEach((item, index) => {
          if (index === rowIndex) {
            amt = mathAdd(amt, taxAmt);
            taxAmtSum = mathAdd(
              taxAmtSum,
              div(
                Math.round(
                  mul(
                    sub(
                      taxAmt,
                      div(taxAmt, mathAdd(div(parseFloat(item.taxRate || 0, 10), 100), 1))
                    ),
                    100
                  )
                ),
                100
              )
            );
          } else {
            amt = mathAdd(amt, item.taxAmt);
            taxAmtSum = mathAdd(taxAmtSum, sub(item.taxAmt, item.taxNotAmt));
          }
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt,
            taxAmt: taxAmtSum,
          },
        });
        form.setFieldsValue({
          amt,
          taxAmt: taxAmtSum,
        });
      }
    } else if (rowField === 'taxPrice') {
      if (checkIfNumber(rowFieldValue)) {
        const taxAmt = div(
          Math.round(
            mul(mul(parseFloat(purchaseList[rowIndex].quantity || 0, 10), rowFieldValue), 100)
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            purchaseList: update(purchaseList, {
              [rowIndex]: {
                taxAmt: {
                  $set: taxAmt,
                },
                taxNotAmt: {
                  $set: div(
                    Math.round(
                      mul(
                        div(
                          taxAmt,
                          mathAdd(div(parseFloat(purchaseList[rowIndex].taxRate || 0, 10), 100), 1)
                        ),
                        100
                      )
                    ),
                    100
                  ),
                },
                taxPrice: {
                  $set: val,
                },
              },
            }),
          },
        });
        let amt = 0;
        let taxAmtSum = 0;
        purchaseList.forEach((item, index) => {
          if (index === rowIndex) {
            amt = mathAdd(amt, taxAmt);
            taxAmtSum = mathAdd(
              taxAmtSum,
              div(
                Math.round(
                  mul(
                    sub(
                      taxAmt,
                      div(taxAmt, mathAdd(div(parseFloat(item.taxRate || 0, 10), 100), 1))
                    ),
                    100
                  )
                ),
                100
              )
            );
          } else {
            amt = mathAdd(amt, item.taxAmt);
            taxAmtSum = mathAdd(taxAmtSum, sub(item.taxAmt, item.taxNotAmt));
          }
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt,
            taxAmt: taxAmtSum,
          },
        });
        form.setFieldsValue({
          amt,
          taxAmt: taxAmtSum,
        });
      }
    } else if (rowField === 'taxRate') {
      if (checkIfNumber(rowFieldValue)) {
        const taxAmt = div(
          Math.round(
            mul(
              mul(
                parseFloat(purchaseList[rowIndex].quantity || 0, 10),
                parseFloat(purchaseList[rowIndex].taxPrice || 0, 10)
              ),
              100
            )
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            purchaseList: update(purchaseList, {
              [rowIndex]: {
                taxNotAmt: {
                  $set: div(
                    Math.round(
                      mul(
                        div(taxAmt, mathAdd(div(parseFloat(rowFieldValue || 0, 10), 100), 1)),
                        100
                      )
                    ),
                    100
                  ),
                },
                taxRate: {
                  $set: val,
                },
              },
            }),
          },
        });
        let taxAmtSum = 0;
        let minTaxRate = rowFieldValue;
        let maxTaxRate = rowFieldValue;
        purchaseList.forEach((item, index) => {
          if (index === rowIndex) {
            taxAmtSum = mathAdd(
              taxAmtSum,
              div(
                Math.round(
                  mul(
                    sub(
                      item.taxAmt,
                      div(item.taxAmt, mathAdd(div(parseFloat(rowFieldValue || 0, 10), 100), 1))
                    ),
                    100
                  )
                ),
                100
              )
            );
            rowFieldValue < minTaxRate ? (minTaxRate = rowFieldValue) : null;
            rowFieldValue > maxTaxRate ? (maxTaxRate = rowFieldValue) : null;
          } else {
            taxAmtSum = mathAdd(taxAmtSum, sub(item.taxAmt, item.taxNotAmt));
            item.taxRate < minTaxRate ? (minTaxRate = item.taxRate) : null;
            item.taxRate > maxTaxRate ? (maxTaxRate = item.taxRate) : null;
          }
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            taxAmt: taxAmtSum,
            taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
          },
        });
        form.setFieldsValue({
          taxAmt: taxAmtSum,
          taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
        });
      }
    } else if (rowField === 'relatedProductId') {
      const relatedProduct = productClassrArr.find(item => val === item.valCode);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          purchaseList: update(purchaseList, {
            [rowIndex]: {
              classId: {
                $set: relatedProduct ? relatedProduct.classId : null,
              },
              classIdName: {
                $set: relatedProduct ? relatedProduct.className : null,
              },
              subClassId: {
                $set: relatedProduct ? relatedProduct.subClassId : null,
              },
              subClassIdName: {
                $set: relatedProduct ? relatedProduct.subClassName : null,
              },
              relatedProductId: {
                $set: val,
              },
              relatedProductName: {
                $set: relatedProduct ? relatedProduct.valDesc : null,
              },
            },
          }),
        },
      });
    } else if (rowField === 'deliveryDate') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          purchaseList: update(purchaseList, {
            [rowIndex]: {
              [rowField]: {
                $set: formatDT(val),
              },
            },
          }),
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          purchaseList: update(purchaseList, {
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
      width: 50,
      render: (value, record, index) => index + 1,
    },
    {
      title: `${pageFieldJson.relatedProductId.displayName}`,
      sortNo: `${pageFieldJson.relatedProductId.sortNo}`,
      dataIndex: 'relatedProductId',
      key: 'relatedProductId',
      width: 200,
      required: !!pageFieldJson.relatedProductId.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.relatedProductId.requiredFlag,
            message: `请选择${pageFieldJson.relatedProductId.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Selection
          className="x-fill-100"
          value={value}
          source={productClassrArr}
          transfer={{ key: 'id', code: 'id', name: 'valDesc' }}
          placeholder={`请选择${pageFieldJson.relatedProductId.displayName}`}
          onChange={onCellChanged(index, 'relatedProductId')}
          disabled={pageFieldJson.relatedProductId.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.note.displayName}`,
      sortNo: `${pageFieldJson.note.sortNo}`,
      dataIndex: 'note',
      key: 'note',
      width: 200,
      required: !!pageFieldJson.note.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.note.requiredFlag,
            message: `请输入${pageFieldJson.note.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input.TextArea
          className="x-fill-100"
          autosize={{ minRows: 1, maxRows: 3 }}
          defaultValue={value}
          placeholder={`请输入${pageFieldJson.note.displayName}`}
          onBlur={onCellChanged(index, 'note')}
          disabled={pageFieldJson.note.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.classId.displayName}`,
      sortNo: `${pageFieldJson.classId.sortNo}`,
      dataIndex: 'classIdName',
      key: 'classId',
      className: 'text-right',
      width: 200,
      required: !!pageFieldJson.classId.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.classId.requiredFlag,
            message: `请输入${pageFieldJson.classId.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={pageFieldJson.classId.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.subClassId.displayName}`,
      sortNo: `${pageFieldJson.subClassId.sortNo}`,
      dataIndex: 'subClassIdName',
      key: 'subClassId',
      className: 'text-right',
      width: 200,
      required: !!pageFieldJson.subClassId.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.subClassId.requiredFlag,
            message: `请输入${pageFieldJson.subClassId.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={pageFieldJson.subClassId.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.quantity.displayName}`,
      sortNo: `${pageFieldJson.quantity.sortNo}`,
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      required: !!pageFieldJson.quantity.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.quantity.requiredFlag,
            message: `请输入${pageFieldJson.quantity.displayName}`,
          },
          {
            validator: (rule, value, callback) => {
              if (isNil(value)) {
                callback();
              } else {
                const error = [];
                if (!checkIfNumber(value)) error.push('输入类型不正确');
                callback(error);
              }
            },
          },
        ],
      },
      render: (value, row, index) => (
        <InputNumber
          className="x-fill-100"
          value={value}
          min={0}
          onChange={onCellChanged(index, 'quantity')}
          placeholder={`请输入${pageFieldJson.quantity.displayName}`}
          disabled={pageFieldJson.quantity.fieldMode !== 'EDITABLE'}
          formatter={limitDecimals}
          parser={limitDecimals}
        />
      ),
    },
    {
      title: `${pageFieldJson.taxPrice.displayName}`,
      sortNo: `${pageFieldJson.taxPrice.sortNo}`,
      dataIndex: 'taxPrice',
      key: 'taxPrice',
      className: 'text-center',
      width: 150,
      required: !!pageFieldJson.taxPrice.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.taxPrice.requiredFlag,
            message: `请输入${pageFieldJson.taxPrice.displayName}`,
          },
          {
            validator: (rule, value, callback) => {
              if (isNil(value)) {
                callback();
              } else {
                const error = [];
                if (!checkIfNumber(value)) error.push('输入类型不正确');
                callback(error);
              }
            },
          },
        ],
      },
      render: (value, row, index) => (
        <InputNumber
          className="x-fill-100"
          value={value}
          min={0}
          onChange={onCellChanged(index, 'taxPrice')}
          placeholder={`请输入${pageFieldJson.taxPrice.displayName}`}
          disabled={pageFieldJson.taxPrice.fieldMode !== 'EDITABLE'}
          formatter={limitDecimals}
          parser={limitDecimals}
        />
      ),
    },
    {
      title: `${pageFieldJson.taxRate.displayName}`,
      sortNo: `${pageFieldJson.taxRate.sortNo}`,
      dataIndex: 'taxRate',
      key: 'taxRate',
      className: 'text-center',
      width: 100,
      required: !!pageFieldJson.taxRate.requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson.taxRate.requiredFlag,
            message: `请输入${pageFieldJson.taxRate.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <InputNumber
          className="x-fill-100"
          value={value}
          min={0}
          max={100}
          placeholder={`请输入${pageFieldJson.taxRate.displayName}`}
          formatter={val => `${limitDecimals(val)}%`}
          parser={val => limitDecimals(val.replace('%', ''))}
          onChange={onCellChanged(index, 'taxRate')}
          disabled={pageFieldJson.taxRate.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.taxAmt.displayName}`,
      sortNo: `${pageFieldJson.taxAmt.sortNo}`,
      dataIndex: 'taxAmt',
      key: 'taxAmt',
      className: 'text-center',
      required: !!pageFieldJson.taxAmt.requiredFlag,
      width: 150,
      options: {
        rules: [
          {
            required: !!pageFieldJson.taxAmt.requiredFlag,
            message: `请输入${pageFieldJson.taxAmt.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={pageFieldJson.taxAmt.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.taxNotAmt.displayName}`,
      sortNo: `${pageFieldJson.taxNotAmt.sortNo}`,
      dataIndex: 'taxNotAmt',
      key: 'taxNotAmt',
      className: 'text-center',
      required: !!pageFieldJson.taxNotAmt.requiredFlag,
      width: 150,
      options: {
        rules: [
          {
            required: !!pageFieldJson.taxNotAmt.requiredFlag,
            message: `请输入${pageFieldJson.taxNotAmt.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <Input
          className="x-fill-100"
          value={value}
          disabled={pageFieldJson.taxNotAmt.fieldMode !== 'EDITABLE'}
        />
      ),
    },
    {
      title: `${pageFieldJson.deliveryDate.displayName}`,
      sortNo: `${pageFieldJson.deliveryDate.sortNo}`,
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      required: !!pageFieldJson.deliveryDate.requiredFlag,
      width: 150,
      options: {
        rules: [
          {
            required: !!pageFieldJson.deliveryDate.requiredFlag,
            message: `请选择${pageFieldJson.deliveryDate.displayName}`,
          },
        ],
      },
      render: (value, row, index) => (
        <DatePicker
          className="x-fill-100"
          format="YYYY-MM-DD"
          defaultValue={typeof value === 'string' ? moment(value) : value}
          onChange={onCellChanged(index, 'deliveryDate')}
          placeholder={`请选择${pageFieldJson.deliveryDate.displayName}`}
          disabled={pageFieldJson.deliveryDate.fieldMode !== 'EDITABLE'}
        />
      ),
    },
  ];

  const columnsFilterList = columnsList.filter(
    field => !field.key || pageFieldJson[field.key].visibleFlag === 1
  );

  const tableProps = {
    rowKey: 'id',
    showCopy: false,
    // loading: loading.effects[`${DOMAIN}/queryPurchase`],
    pagination: false,
    scroll: {
      x: 1700,
    },
    dataSource: purchaseList,
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    onAdd: newRow => {
      const newList = [
        ...purchaseList,
        {
          ...newRow,
          id: genFakeId(-1),
          relatedProductId: null,
          relatedProductName: null,
          classId: null,
          classIdName: null,
          subClassId: null,
          subClassIdName: null,
          quantity: 0,
          taxPrice: 0,
          taxRate: 0,
          taxAmt: 0,
          taxNotAmt: 0,
          deliveryDate: null,
          note: null,
        },
      ];
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          purchaseList: newList,
        },
      });
      let amt = 0;
      let taxAmtSum = 0;
      let minTaxRate = newList.length !== 0 ? newList[0].taxRate : null;
      let maxTaxRate = newList.length !== 0 ? newList[0].taxRate : null;
      newList.forEach((item, index) => {
        amt = mathAdd(amt, item.taxAmt);
        taxAmtSum = mathAdd(taxAmtSum, sub(item.taxAmt, item.taxNotAmt));
        item.taxRate < minTaxRate ? (minTaxRate = item.taxRate) : null;
        item.taxRate > maxTaxRate ? (maxTaxRate = item.taxRate) : null;
      });
      if (newList.length !== 0) {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt: newList.length !== 0 ? amt : null,
            taxAmt: newList.length !== 0 ? taxAmtSum : null,
            taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
          },
        });
        form.setFieldsValue({
          amt: newList.length !== 0 ? amt : null,
          taxAmt: newList.length !== 0 ? taxAmtSum : null,
          taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt: newList.length !== 0 ? amt : null,
            taxAmt: newList.length !== 0 ? taxAmtSum : null,
            taxRate: null,
          },
        });
        form.setFieldsValue({
          amt: newList.length !== 0 ? amt : null,
          taxAmt: newList.length !== 0 ? taxAmtSum : null,
          taxRate: null,
        });
      }
    },
    onDeleteItems: (_, selectedRows) => {
      const deleteIds = selectedRows.map(row => row.id);
      const newList = purchaseList.filter(({ id }) => !deleteIds.includes(id));
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          purchaseDeleteKeys: [...purchaseDeleteKeys, ...deleteIds].filter(v => !(v <= 0)),
          purchaseList: newList,
        },
      });
      let amt = 0;
      let taxAmtSum = 0;
      let minTaxRate = newList.length !== 0 ? newList[0].taxRate : null;
      let maxTaxRate = newList.length !== 0 ? newList[0].taxRate : null;
      newList.forEach((item, index) => {
        amt = mathAdd(amt, item.taxAmt);
        taxAmtSum = mathAdd(taxAmtSum, sub(item.taxAmt, item.taxNotAmt));
        item.taxRate < minTaxRate ? (minTaxRate = item.taxRate) : null;
        item.taxRate > maxTaxRate ? (maxTaxRate = item.taxRate) : null;
      });
      if (newList.length !== 0) {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt: newList.length !== 0 ? amt : null,
            taxAmt: newList.length !== 0 ? taxAmtSum : null,
            taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
          },
        });
        form.setFieldsValue({
          amt: newList.length !== 0 ? amt : null,
          taxAmt: newList.length !== 0 ? taxAmtSum : null,
          taxRate: minTaxRate !== maxTaxRate ? `${minTaxRate}%~${maxTaxRate}%` : `${maxTaxRate}%`,
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            amt: newList.length !== 0 ? amt : null,
            taxAmt: newList.length !== 0 ? taxAmtSum : null,
            taxRate: null,
          },
        });
        form.setFieldsValue({
          amt: newList.length !== 0 ? amt : null,
          taxAmt: newList.length !== 0 ? taxAmtSum : null,
          taxRate: null,
        });
      }
    },
    columns: columnsFilterList,
  };
  return tableProps;
}
