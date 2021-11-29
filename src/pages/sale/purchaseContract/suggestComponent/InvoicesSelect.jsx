/* eslint-disable arrow-body-style */
/* eslint-disable import/named */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import BasicSuggestSelect from './BasicSuggestSelect';
import {
  getPaymentApplyInvoices,
  getInvoicesDetail,
} from '@/services/sale/purchaseContract/paymentApplyList';

// 城市联想下拉,showTitle多列时是否展示title
class InvoicesSelect extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      selectProps,
      defaultSource = [],
      value,
      onChange,
      valueKey = 'code',
      labelKey,
      allowClear = true,
      disabled = false,
      columns,
      invoiceNo,
      placeholder = disabled ? '未选择' : '请输入编号/名称',
      showTitle,
    } = this.props;
    const props = {
      defaultSource,
      valueKey,
      columns,
      disabled,
      value,
      onChange,
      labelKey,
      selectProps: {
        ...selectProps,
        placeholder,
        dropdownMatchSelectWidth: false,
        allowClear,
      },
      showTitle,
    };
    return (
      <BasicSuggestSelect
        {...props}
        source={key =>
          getPaymentApplyInvoices({ type: 2, invoiceNo: key || '2' }).then(res => {
            return res.response.datum;
          })
        }
      />
    );
  }
}

export default InvoicesSelect;
