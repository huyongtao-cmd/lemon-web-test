/* eslint-disable */
import React from 'react';
import { Button } from 'antd';
import { isEmpty, isNil } from 'ramda';
import { getPrintData } from '@/services/print';
import { getHandlebars } from '../gen/handlebars';
import { fromQs } from '@/utils/stringUtils';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import BarCode from './BarCode';
import { smallToBig, numberFormat } from '@/utils/production/mathUtils';

class PrintViewer extends React.Component {
  state = {
    data: {},
    handlebars: undefined,
  };

  componentDidMount() {
    const { scope } = fromQs();
    this.setState(
      {
        handlebars: getHandlebars(scope),
      },
      () => {
        getPrintData().then(data => {
          const { formData } = data;
          if (!isNil(formData.baseCurrencyAmt)) {
            formData.baseCurrencyAmt = `${numberFormat(
              formData.baseCurrencyAmt.toFixed(2)
            )} (${smallToBig(formData.baseCurrencyAmt)})`;
          }
          if (!isNil(formData.originalCurrencyAmt)) {
            formData.originalCurrencyAmt = `${numberFormat(
              formData.originalCurrencyAmt.toFixed(2)
            )} (${smallToBig(formData.originalCurrencyAmt)})`;
          }
          if (!isNil(formData.paymentAmt)) {
            formData.paymentAmt = `${numberFormat(formData.paymentAmt.toFixed(2))} (${smallToBig(
              formData.paymentAmt
            )})`;
          }
          if (!isNil(formData.baseCurrencyClaimAmt)) {
            formData.baseCurrencyClaimAmt = `${numberFormat(
              formData.baseCurrencyClaimAmt.toFixed(2)
            )} (${smallToBig(formData.baseCurrencyClaimAmt)})`;
          }
          if (scope === 'PUR_G02' || scope === 'PUR05') {
            if (!isNil(formData.invDocList) && !isEmpty(formData.invDocList)) {
              const { invDocList } = formData;
              const totalAmountTax = invDocList
                .map(item => item.amountTax)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalCurrWrittenAmt = invDocList
                .map(item => item.currWrittenAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalWrittenOffAmt = invDocList
                .map(item => item.writtenOffAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalAmtIncludingTax = invDocList
                .map(item => item.amtIncludingTax)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalAmtExcludingTax = invDocList
                .map(item => item.amtExcludingTax)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalTaxAmt = invDocList
                .map(item => item.taxAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const sumRow = {
                totalAmountTax: numberFormat(totalAmountTax.toFixed(2)),
                totalCurrWrittenAmt: numberFormat(totalCurrWrittenAmt.toFixed(2)),
                totalWrittenOffAmt: numberFormat(totalWrittenOffAmt.toFixed(2)),
                totalAmtIncludingTax: numberFormat(totalAmtIncludingTax.toFixed(2)),
                totalAmtExcludingTax: numberFormat(totalAmtExcludingTax.toFixed(2)),
                totalTaxAmt: numberFormat(totalTaxAmt.toFixed(2)),
              };
              data['sumRow'] = sumRow;
            }
            if (!isNil(formData.paymentPlanDetails) && !isEmpty(formData.paymentPlanDetails)) {
              const { paymentPlanDetails } = formData;
              const totalPaymentAmt = paymentPlanDetails
                .map(item => item.paymentAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const totalRow = {
                totalPaymentAmt: numberFormat(totalPaymentAmt.toFixed(2)),
              };
              data['totalRow'] = totalRow;
            }
          } else if (!isNil(formData.details) && !isEmpty(formData.details)) {
            const { details } = formData;
            if (scope === 'COS11' || scope === 'COS12' || scope === 'ADM_M07') {
              const totalAmt = details
                .map(item => item.amt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const expenseAccount = {
                totalAmt: numberFormat(totalAmt.toFixed(2)),
              };
              data['expenseAccount'] = expenseAccount;
            } else {
              const totalClaimAmt = details
                .map(item => item.claimAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const expenseAccount = {
                totalClaimAmt: numberFormat(totalClaimAmt.toFixed(2)),
              };
              data['expenseAccount'] = expenseAccount;
            }
          }
          this.setState({ data });
        });
      }
    );
  }

  render() {
    const { data, handlebars } = this.state;
    if (isEmpty(data) || isNil(data)) return null;
    const result = handlebars(data);

    // 渲染loading，同时拉取数据并渲染模版
    return (
      <div
        style={{
          background: '#eee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <DocumentTitle title="单据打印" />
        <div>
          <div style={{ display: 'flex', margin: '10px 0' }}>
            <Button
              className={classnames('separate', 'tw-btn-primary')}
              icon="printer"
              // size="large"
              onClick={() => {
                const content = document.getElementById('print-frame');
                const pri = document.getElementById('fake-window').contentWindow;
                pri.document.open();
                pri.document.write(content.innerHTML);
                pri.document.close();
                pri.focus();
                pri.print();
              }}
            >
              打印
            </Button>
            <div style={{ width: 20 }} />
            <Button
              className={classnames('separate', 'tw-btn-error')}
              icon="close"
              // size="large"
              onClick={() => {
                window.opener = null;
                window.open('', '_self');
                window.close();
              }}
            >
              关闭
            </Button>
          </div>
        </div>

        <div
          id="print-frame"
          style={{
            background: '#FFF',
            padding: 24,
            width: '80%',
            border: '1px solid black',
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.45)',
            position: 'relative',
          }}
        >
          <BarCode content={data.formData.reimNo} style={{ position: 'absolute', right: '50px' }} />
          <div dangerouslySetInnerHTML={{ __html: result || '' }} />
        </div>
        <br />
        <iframe id="fake-window" style={{ display: 'none' }} />
      </div>
    );
  }
}

export default PrintViewer;
