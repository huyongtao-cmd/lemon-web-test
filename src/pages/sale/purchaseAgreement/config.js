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

export function purchaseTableProps(DOMAIN, dispatch, salePurchaseAgreementsEdit, form) {
  const {
    agreementDetailsEntities,
    agreementDetailsDeletedKeys,
    productClassrArr,
    pageConfig,
  } = salePurchaseAgreementsEdit;

  const currentBlockConfig = pageConfig.pageBlockViews.find(
    item => item.blockKey === 'PUR_AGREEMENT_DETAILS'
  );
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
            mul(
              mul(parseFloat(agreementDetailsEntities[rowIndex].taxPrice || 0, 10), rowFieldValue),
              100
            )
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementDetailsEntities: update(agreementDetailsEntities, {
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
                          mathAdd(
                            div(
                              parseFloat(agreementDetailsEntities[rowIndex].taxRate || 0, 10),
                              100
                            ),
                            1
                          )
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
        agreementDetailsEntities.forEach((item, index) => {
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
            mul(
              mul(parseFloat(agreementDetailsEntities[rowIndex].quantity || 0, 10), rowFieldValue),
              100
            )
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementDetailsEntities: update(agreementDetailsEntities, {
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
                          mathAdd(
                            div(
                              parseFloat(agreementDetailsEntities[rowIndex].taxRate || 0, 10),
                              100
                            ),
                            1
                          )
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
        agreementDetailsEntities.forEach((item, index) => {
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
                parseFloat(agreementDetailsEntities[rowIndex].quantity || 0, 10),
                parseFloat(agreementDetailsEntities[rowIndex].taxPrice || 0, 10)
              ),
              100
            )
          ),
          100
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementDetailsEntities: update(agreementDetailsEntities, {
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
        agreementDetailsEntities.forEach((item, index) => {
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
          agreementDetailsEntities: update(agreementDetailsEntities, {
            [rowIndex]: {
              classId: {
                $set: relatedProduct ? relatedProduct.classId : null,
              },
              classDesc: {
                $set: relatedProduct ? relatedProduct.className : null,
              },
              subClassId: {
                $set: relatedProduct ? relatedProduct.subClassId : null,
              },
              subClassDesc: {
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
          agreementDetailsEntities: update(agreementDetailsEntities, {
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
          agreementDetailsEntities: update(agreementDetailsEntities, {
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
      dataIndex: 'classDesc',
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
      dataIndex: 'subClassDesc',
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
      width: 150,
      required: !!pageFieldJson.taxAmt.requiredFlag,
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
      width: 150,
      required: !!pageFieldJson.taxNotAmt.requiredFlag,
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
    dataSource: agreementDetailsEntities,
    // rowSelection: {
    //   getCheckboxProps: record => ({
    //     disabled: record.lineNo === -1,
    //   }),
    // },
    onAdd: newRow => {
      const newList = [
        ...agreementDetailsEntities,
        {
          ...newRow,
          id: genFakeId(-1),
          relatedProductId: null,
          relatedProductName: null,
          classId: null,
          classDesc: null,
          subClassId: null,
          subClassDesc: null,
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
          agreementDetailsEntities: newList,
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
      const newList = agreementDetailsEntities.filter(({ id }) => !deleteIds.includes(id));
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          agreementDetailsDeletedKeys: [...agreementDetailsDeletedKeys, ...deleteIds].filter(
            v => !(v <= 0)
          ),
          agreementDetailsEntities: newList,
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
