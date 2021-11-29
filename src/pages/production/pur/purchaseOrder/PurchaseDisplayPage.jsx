import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit } from 'ramda';
import { Form, Input } from 'antd';
import moment from 'moment';
import { add } from '@/utils/mathUtils';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
import { systemLocaleListPaging, systemLocaleLogicalDelete } from '@/services/production/system';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import EditTable from '@/components/production/business/EditTable.tsx';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import DataTable from '@/components/production/business/DataTable.tsx';
import { closeThenGoto } from '@/layouts/routerControl';
import message from '@/components/production/layout/Message.tsx';
import { getUrl } from '@/utils/flowToRouter';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { remindString } from '@/components/production/basic/Remind.tsx';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import styles from './index.less';

// namespace声明
const DOMAIN = 'purchaseDisplayPage';
const TOTAL_ROW_ID = 'TOTAL';
const expenseDocType = 'PURCHASE_ORDER';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, purchaseDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  adjustLoading: loading.effects[`${DOMAIN}/check`],
  dispatch,
  ...purchaseDisplayPage,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const { formData } = props;
    const name = Object.keys(changedValues)[0];
    let value = changedValues[name];
    switch (name) {
      case 'relatedBudgetId':
        if (formData.chargeClassification !== 'DAILY' && !formData.chargeProjectId) {
          createMessage({
            type: 'error',
            description: '请先选择相关项目',
          });
          value = '';
        } else if (formData.chargeClassification === 'DAILY' && !formData.chargeBuId) {
          createMessage({
            type: 'error',
            description: '请先选择费用承担部门',
          });
          value = '';
        }
        break;
      default:
        break;
    }
    const newFieldData = { [name]: value };
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class PurchaseDisplayPage extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId, flag } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const checked = flag === 'CHECK';
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId, checked });
    this.callModelEffects('updateForm', { id, chargeBuId: extInfo.baseBuId });
    // this.callModelEffects('init');
    this.callModelEffects('init').then(data =>
      this.callModelEffects('fetchBusinessAccItem', {
        docType: expenseDocType,
        buId: data.chargeBuId || extInfo.baseBuId,
        projType: data.chargeClassification,
      })
    );
    this.callModelEffects('fetchBudgetType');
    taskId === undefined && this.callModelEffects('fetchInternalOuList');
    taskId === undefined && this.callModelEffects('fetchBudgetList');
    taskId === undefined && this.callModelEffects('fetchFinancialAccSubjList');
    // taskId === undefined &&
    //   this.callModelEffects('fetchBusinessAccItem', {
    //     docType: formData.expenseDocType,
    //     buId: extInfo.baseBuId,
    //   });
    taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { response } = await systemLocaleListPaging(params);
    return response.data;
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData } = this.props;
    const { paymentPlanDetails = [], purchaseOrderDetails = [] } = formData;
    if (paymentPlanDetails.length === 0 || purchaseOrderDetails.length === 0) {
      message({ type: 'error', content: '采购单计划和付款明细必填！' });
      return;
    }
    let planAllAmt = 0;
    let entityAllAmt = 0;
    paymentPlanDetails.map(item => {
      planAllAmt = add(planAllAmt, item.paymentAmt);
      return null;
    });
    purchaseOrderDetails.map(item => {
      entityAllAmt = add(entityAllAmt, item.amt);
      return null;
    });
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (planAllAmt.toFixed(2) !== entityAllAmt.toFixed(2)) {
          message({
            type: 'error',
            content: remindString({
              remindCode: 'PUR:E:AMT_CONSISTENCY_CHECK',
              defaultMessage: '商品明细的金额之和与付款计划的金额之和必须相等！',
            }),
          });
          return;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['purchaseOrderDetails', 'paymentPlanDetails'], values),
            ...param,
            submit: true,
          },
          cb,
        });
      }
    });
  };

  /**
   * 保存
   */
  handleSave = (param, cb) => {
    const { form, formData } = this.props;
    const { paymentPlanDetails = [], purchaseOrderDetails = [] } = formData;
    if (paymentPlanDetails.length === 0 || purchaseOrderDetails.length === 0) {
      message({ type: 'error', content: '采购单计划和付款明细必填！' });
      return;
    }
    let planAllAmt = 0;
    let entityAllAmt = 0;
    paymentPlanDetails.map(item => {
      planAllAmt = add(planAllAmt, item.paymentAmt);
      return null;
    });
    purchaseOrderDetails.map(item => {
      entityAllAmt = add(entityAllAmt, item.amt);
      return null;
    });
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (planAllAmt.toFixed(2) !== entityAllAmt.toFixed(2)) {
          message({
            type: 'error',
            content: remindString({
              remindCode: 'PUR:E:AMT_CONSISTENCY_CHECK',
              defaultMessage: '商品明细的金额之和与付款计划的金额之和必须相等！',
            }),
          });
          return;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['purchaseOrderDetails', 'paymentPlanDetails'], values),
          },
          cb,
        });
      }
    });
  };

  /**
   * 调整
   */
  checkEdit = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('check', {
          formData: {
            ...formData,
            ...omit(['purchaseOrderDetails', 'paymentPlanDetails'], values),
            ...param,
            submit: true,
          },
          cb,
        });
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  /**
   * 时间设置为null
   */
  // setTimeNull = () => {
  //   const {
  //     formData: { id },
  //   } = this.props;
  //   this.callModelEffects('setTimeNull', { id, nullFields: ['testTime'] });
  // };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      saveLoading,
      adjustLoading,
      purTypeList,
      dispatch,
      fieldsConfig,
      flowForm,
      taskId,
      checked,
      changeFlag,
      deleteOrderKeys,
      deletePaylanKeys,
      internalOuList,
      budgetList,
      financialAccSubjList,
      businessAccItemList,
      accountList,
      user: { extInfo = {} }, // 取当前登陆人的resId
      attachments,
    } = this.props;
    // 其他流程1
    // const allBpm = [{ docId: formData.id, procDefKey: 'PUR_G01', title: '采购流程' }];

    let allBpm;
    if (formData.poClass1 === 'OTHER') {
      allBpm = [{ docId: formData.id, procDefKey: 'PUR04', title: '采购流程' }];
    } else {
      allBpm = [{ docId: formData.id, procDefKey: 'PUR_G01', title: '采购流程' }];
    }

    const editColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '0px',
        className: `${styles.button}`,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`purchaseOrderDetails[${index}].id`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
      {
        title: '商品名称',
        dataIndex: 'itemName',
        required: true,
        width: '250px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`purchaseOrderDetails[${index}].itemName`}
            required
          />
        ),
      },
      {
        title: '数量',
        dataIndex: 'qty',
        width: '150px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`purchaseOrderDetails[${index}].qty`}
            onChange={value => {
              const { unitPrice } = formData.purchaseOrderDetails[index];
              if (value && unitPrice) {
                const arr = [];
                arr[index] = { amt: value * unitPrice };
                dispatch({
                  type: `${DOMAIN}/updateFormForEditTable`,
                  payload: {
                    purchaseOrderDetails: arr,
                  },
                });
              } else {
                const arr = [];
                arr[index] = { amt: 0 };
                dispatch({
                  type: `${DOMAIN}/updateFormForEditTable`,
                  payload: {
                    purchaseOrderDetails: arr,
                  },
                });
              }
            }}
          />
        ),
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        width: '150px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`purchaseOrderDetails[${index}].unitPrice`}
            onChange={value => {
              const { qty } = formData.purchaseOrderDetails[index];
              let tempQty = 1;
              if (value && qty) {
                tempQty = qty;
                const arr = [];
                arr[index] = { amt: value * tempQty };
                dispatch({
                  type: `${DOMAIN}/updateFormForEditTable`,
                  payload: {
                    purchaseOrderDetails: arr,
                  },
                });
              } else {
                const arr = [];
                arr[index] = { amt: 0 };
                dispatch({
                  type: `${DOMAIN}/updateFormForEditTable`,
                  payload: {
                    purchaseOrderDetails: arr,
                  },
                });
              }
            }}
          />
        ),
      },
      {
        title: '金额',
        dataIndex: 'amt',
        width: '150px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`purchaseOrderDetails[${index}].amt`}
            disabled
          />
        ),
      },
      {
        title: '交付日期',
        dataIndex: 'deliveryDate',
        width: '200px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`purchaseOrderDetails[${index}].deliveryDate`}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`purchaseOrderDetails[${index}].remark`}
          />
        ),
      },
    ];

    const editDescColumns = [
      {
        title: '商品名称',
        dataIndex: 'itemName',
        width: '250px',
      },
      {
        title: '数量',
        dataIndex: 'qty',
        width: '150px',
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        width: '150px',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        width: '150px',
      },
      {
        title: '交付日期',
        dataIndex: 'deliveryDate',
        width: '200px',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    const { purchaseOrderDetails, paymentPlanDetails } = formData;

    const busAccItemClearWarnFlag = paymentPlanDetails.length > 0;

    const paymentColumns = [
      {
        title: '付款状态',
        dataIndex: 'paymentStatus',
        width: '100px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseSelect"
            fieldKey={`paymentPlanDetails[${index}].paymentStatus`}
            parentKey="PUR:PAYMENT_STATUS"
            disabled
            // initialValue="UNPAID"
            descList={[{ value: 'UNPAID', title: '未付款' }]}
          />
        ),
      },
      {
        title: '付款申请单号',
        dataIndex: 'paymentOrderNo',
        width: '180px',
        visible: checked,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].paymentOrderNo`}
            visible={checked}
            disabled
          />
        ),
      },
      {
        title: '付款计划编号',
        dataIndex: 'paymentPlanNo',
        width: 180,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].paymentPlanNo`}
            disabled
          />
        ),
      },
      {
        title: '付款阶段',
        dataIndex: 'paymentStage',
        width: '180px',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].paymentStage`}
            required
            disabled={record.paymentRequestId !== null && checked}
          />
        ),
      },
      {
        title: '预计付款日期',
        dataIndex: 'expectedPaymentDate',
        width: '160px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`paymentPlanDetails[${index}].expectedPaymentDate`}
            disabled={record.paymentRequestId !== null && checked}
          />
        ),
      },
      {
        title: '付款金额',
        dataIndex: 'paymentAmt',
        width: '80px',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`paymentPlanDetails[${index}].paymentAmt`}
            required
            disabled={record.paymentRequestId !== null && checked}
            onChange={value => {
              const changeAmt = value - (record.paymentAmt || 0);
              if (!Number.isNaN(changeAmt)) {
                const originalCurrencyAmt = (formData.originalCurrencyAmt || 0) + changeAmt;
                const baseCurrencyAmt =
                  originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate);
                this.callModelEffects('updateForm', {
                  originalCurrencyAmt,
                  baseCurrencyAmt,
                });
              }
            }}
          />
        ),
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemId',
        width: '200px',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
            fieldKey={`paymentPlanDetails[${index}].busAccItemId`}
            required
            parentSelectAble={false}
            options={businessAccItemList}
            optionsKeyField="busAccItemId"
            disabled={record.paymentRequestId !== null && checked}
            onChange={(value, option) => {
              if (option.length > 0) {
                const arr = [];
                arr[index] = {
                  budgetItemId: option[0].budgetItemId,
                  finAccSubjId: option[0].finAccSubjId,
                  deductTaxRate: option[0].configurableField1,
                };
                this.callModelEffects('updateFormForEditTable', { paymentPlanDetails: arr });
              }
            }}
          />
        ),
      },
      {
        title: '预算项目',
        dataIndex: 'budgetItemId',
        required: true,
        width: '200px',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseTreeSelect"
              parentSelectAble={false}
              required
              fieldKey={`paymentPlanDetails[${index}].budgetItemId`}
              options={budgetList}
              disabled={record.paymentRequestId !== null && checked}
            />
          ),
      },
      // {
      //   title: '会计科目',
      //   dataIndex: 'finAccSubjId',
      //   visible: false,
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseTreeSelect"
      //       disabled
      //       fieldKey={`details[${index}].finAccSubjId`}
      //       options={financialAccSubjList}
      //     />
      //   ),
      // },
      // {
      //   title: '规则检查说明',
      //   dataIndex: 'rulesCheckDesc',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInput"
      //       fieldKey={`paymentPlanDetails[${index}].rulesCheckDesc`}
      //       disabled
      //       // initialValue="P01-预算项目与模板不符"
      //     />
      //   ),
      // },
      // {
      //   title: '关联发票',
      //   dataIndex: 'relatedInvoice',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="ResObjectSelect"
      //       fieldKey={`paymentPlanDetails[${index}].relatedInvoice`}
      //       disabled
      //     />
      //   ),
      // },
      // {
      //   title: '含税金额',
      //   dataIndex: 'amtIncludingTax',
      //   width: '100px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].amtIncludingTax`}
      //       disabled={record.paymentRequestId !== null && checked}
      //     />
      //   ),
      // },
      // {
      //   title: '不含税金额',
      //   dataIndex: 'amtExcludingTax',
      //   width: '100px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].amtExcludingTax`}
      //       disabled={record.paymentRequestId !== null && checked}
      //       onChange={value => {
      //         const { taxAmt } = formData.paymentPlanDetails[index];
      //         const arr = [];
      //         const rowAmt = (isNil(value) ? 0 : value) + (isNil(taxAmt) ? 0 : taxAmt);
      //         arr[index] = { amtIncludingTax: rowAmt, paymentAmt: rowAmt };

      //         dispatch({
      //           type: `${DOMAIN}/updateFormForEditTable`,
      //           payload: {
      //             paymentPlanDetails: arr,
      //           },
      //         });

      //         let paymentPlanDetailsTemp = [];
      //         arr.forEach((ele, arrIndex) => {
      //           if (!isNil(ele)) {
      //             paymentPlanDetailsTemp = update(formData.paymentPlanDetails, {
      //               [arrIndex]: { $merge: ele },
      //             });
      //           }
      //         });

      //         const amtSumTemp = paymentPlanDetailsTemp
      //           .map(item => item.paymentAmt || 0)
      //           .reduce((a, b) => a + b, 0);

      //         dispatch({
      //           type: `${DOMAIN}/updateForm`,
      //           payload: {
      //             originalCurrencyAmt: amtSumTemp,
      //             baseCurrencyAmt:
      //               amtSumTemp * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate),
      //           },
      //         });
      //       }}
      //     />
      //   ),
      // },
      // {
      //   title: '税额',
      //   dataIndex: 'taxAmt',
      //   width: '100px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].taxAmt`}
      //       disabled={record.paymentRequestId !== null && checked}
      //       onChange={value => {
      //         const { amtExcludingTax } = formData.paymentPlanDetails[index];
      //         const arr = [];
      //         const rowAmt =
      //           (isNil(value) ? 0 : value) + (isNil(amtExcludingTax) ? 0 : amtExcludingTax);
      //         arr[index] = { amtIncludingTax: rowAmt, paymentAmt: rowAmt };
      //         dispatch({
      //           type: `${DOMAIN}/updateFormForEditTable`,
      //           payload: {
      //             paymentPlanDetails: arr,
      //           },
      //         });

      //         let paymentPlanDetailsTemp = [];
      //         arr.forEach((ele, arrIndex) => {
      //           if (!isNil(ele)) {
      //             paymentPlanDetailsTemp = update(formData.paymentPlanDetails, {
      //               [arrIndex]: { $merge: ele },
      //             });
      //           }
      //         });

      //         const amtSumTemp = paymentPlanDetailsTemp
      //           .map(item => item.paymentAmt || 0)
      //           .reduce((a, b) => a + b, 0);

      //         dispatch({
      //           type: `${DOMAIN}/updateForm`,
      //           payload: {
      //             originalCurrencyAmt: amtSumTemp,
      //             baseCurrencyAmt:
      //               amtSumTemp * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate),
      //           },
      //         });
      //       }}
      //     />
      //   ),
      // },
      // {
      //   title: '可抵扣税率',
      //   dataIndex: 'deductTaxRate',
      //   width: '100px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseCustomSelect"
      //       fieldKey={`paymentPlanDetails[${index}].deductTaxRate`}
      //       parentKey="CUS:DEDUCT_TAX_RATE"
      //       disabled={record.paymentRequestId !== null && checked}
      //       onChange={value => {
      //         const { amtIncludingTax } = formData.paymentPlanDetails[index];
      //         let deductTaxAmt = 0;
      //         if (value) {
      //           const percentage = 0.01;
      //           const rate = value.replace('%', '') * percentage;
      //           deductTaxAmt = (amtIncludingTax / (1 + rate)) * rate;
      //         }
      //         const arr = [];
      //         arr[index] = { deductTaxAmt };
      //         dispatch({
      //           type: `${DOMAIN}/updateFormForEditTable`,
      //           payload: {
      //             paymentPlanDetails: arr,
      //           },
      //         });
      //       }}
      //     />
      //   ),
      // },
      // {
      //   title: '可抵扣税额',
      //   dataIndex: 'deductTaxAmt',
      //   width: '100px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].deductTaxAmt`}
      //       disabled={record.paymentRequestId !== null && checked}
      //     />
      //   ),
      // },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '200px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].remark`}
            disabled={record.paymentRequestId !== null && checked}
          />
        ),
      },
      {
        title: 'ID',
        dataIndex: 'id',
        width: '0px',
        className: `${styles.button}`,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].id`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
    ].filter(e => e.visible !== false);

    const paymentDescColumns = [
      {
        title: '付款状态',
        dataIndex: 'paymentStatusDesc',
        width: '100px',
      },
      {
        title: '付款计划编号',
        dataIndex: 'paymentPlanNo',
        width: '150px',
      },
      {
        title: '付款阶段',
        dataIndex: 'paymentStage',
        width: '150px',
        required: true,
      },
      {
        title: '预计付款日期',
        dataIndex: 'expectedPaymentDate',
        width: '150px',
      },
      {
        title: '付款金额',
        dataIndex: 'paymentAmt',
        width: '100px',
        required: true,
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemName',
        width: '250px',
        required: true,
      },
      {
        title: '预算项目',
        dataIndex: 'budgetItemName',
        width: '250px',
        required: true,
      },
      // {
      //   title: '会计科目',
      //   dataIndex: 'finAccSubjName',
      //   visible: false,
      // },
      // {
      //   title: '规则检查说明',
      //   dataIndex: 'rulesCheckDesc',
      // },
      // {
      //   title: '关联发票',
      //   dataIndex: 'relatedInvoice',
      // },
      // {
      //   title: '含税金额',
      //   dataIndex: 'amtIncludingTax',
      // },
      // {
      //   title: '不含税金额',
      //   dataIndex: 'amtExcludingTax',
      // },
      // {
      //   title: '税额',
      //   dataIndex: 'taxAmt',
      // },
      // {
      //   title: '可抵扣税率',
      //   dataIndex: 'deductTaxRate',
      // },
      // {
      //   title: '可抵扣税额',
      //   dataIndex: 'deductTaxAmt',
      // },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    const purchaseOrderdetailOperation = checked
      ? {
          onDeleteConfirm: keys => {
            const newDataSource = purchaseOrderDetails.filter(row => keys.indexOf(row.id) < 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                purchaseOrderDetails: newDataSource,
                delPurchaseOrderIds: [...deleteOrderKeys, ...keys],
              },
            });
            this.updateModelState({ deleteOrderKeys: [...deleteOrderKeys, ...keys] });
          },
        }
      : {
          onAddClick: () => {
            // 预算有值可以新增
            if (formData.relatedBudgetId) {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  purchaseOrderDetails: update(purchaseOrderDetails, {
                    $push: [
                      {
                        id: genFakeId(-1),
                        amt: 0,
                      },
                    ],
                  }),
                },
              });
            } else {
              createMessage({
                type: 'error',
                description: '请确认费用归属、费用承担部门、相关预算等信息已正确填写',
              });
            }
          },
          onDeleteConfirm: keys => {
            const newDataSource = purchaseOrderDetails.filter(row => keys.indexOf(row.id) < 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                delPurchaseOrderIds: [...deleteOrderKeys, ...keys],
                purchaseOrderDetails: newDataSource,
              },
            });
            this.updateModelState({ deleteOrderKeys: [...deleteOrderKeys, ...keys] });
          },
        };
    const detailOperation = checked
      ? {
          onDeleteConfirm: keys => {
            const newDataSource = paymentPlanDetails.filter(row => keys.indexOf(row.id) < 0);

            const originalCurrencyAmt = newDataSource
              .map(item => (isNil(item.paymentAmt) ? 0 : item.paymentAmt))
              .reduce((a, b) => (isNil(a) ? 0 : a) + (isNil(b) ? 0 : b), 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                paymentPlanDetails: newDataSource,
                originalCurrencyAmt,
                delPaymentPlanIds: [...deletePaylanKeys, ...keys],
                baseCurrencyAmt:
                  originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate),
              },
            });
            this.updateModelState({ deletePaylanKeys: [...deletePaylanKeys, ...keys] });
          },
        }
      : {
          onAddClick: () => {
            // 预算有值可以新增
            if (formData.relatedBudgetId) {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  paymentPlanDetails: update(paymentPlanDetails, {
                    $push: [
                      {
                        id: genFakeId(-1),
                        paymentStatus: 'UNPAID',
                        paymentAmt: 0,
                        amtIncludingTax: 0,
                      },
                    ],
                  }),
                },
              });
            } else {
              createMessage({
                type: 'error',
                description: '请确认费用归属、费用承担部门、相关预算等信息已正确填写',
              });
            }
          },
          onDeleteConfirm: keys => {
            const newDataSource = paymentPlanDetails.filter(row => keys.indexOf(row.id) < 0);

            const originalCurrencyAmt = newDataSource
              .map(item => (isNil(item.paymentAmt) ? 0 : item.paymentAmt))
              .reduce((a, b) => (isNil(a) ? 0 : a) + (isNil(b) ? 0 : b), 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                paymentPlanDetails: newDataSource,
                originalCurrencyAmt,
                delPaymentPlanIds: [...deletePaylanKeys, ...keys],
                baseCurrencyAmt:
                  originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate),
              },
            });
            this.updateModelState({ deletePaylanKeys: [...deletePaylanKeys, ...keys] });
          },
        };

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'PUR_G01_01_SUBMIT_i' || taskKey === 'PUR04_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.handleSubmit(
                  {
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            } else {
              if (key === 'FLOW_RETURN') {
                createConfirm({
                  content: '确定要拒绝该流程吗？',
                  onOk: () =>
                    pushFlowTask(taskId, {
                      remark,
                      result: 'REJECTED',
                      branch,
                    }).then(({ status, response }) => {
                      if (status === 200) {
                        createMessage({ type: 'success', description: '操作成功' });
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      }
                      return Promise.resolve(false);
                    }),
                });
              }
              if (key === 'FLOW_PASS') {
                this.handleSubmit(
                  {
                    result: 'APPROVED',
                    procTaskId: taskId,
                    procRemark: remark,
                    branch,
                    dryRunFlag: true,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' &&
              !checked && [
                <Button
                  size="large"
                  type="primary"
                  onClick={() => {
                    this.handleSave({ submit: false }, output => {
                      message({ type: 'success' });
                      this.callModelEffects('updateForm', { id: output.data.id });
                      this.callModelEffects('init', { id: output.data.id });
                    });
                  }}
                  loading={saveLoading}
                >
                  保存
                </Button>,
                <Button
                  size="large"
                  type="primary"
                  loading={saveLoading}
                  onClick={() => {
                    const { poClass1 } = formData;
                    this.handleSubmit({ result: 'APPROVED' }, () => {
                      if (poClass1 === 'TEMPORARY') {
                        //临时采购单提交后，自动创建付款申请单，需要跳转到付款申请单页面，补录发票
                        closeThenGoto(
                          `/workTable/pur/paymentRequestList?refresh=${new Date().getTime()}`
                        );
                      } else {
                        closeThenGoto(`/user/flow/process?type=procs`);
                      }
                    });
                  }}
                >
                  提交
                </Button>,
              ]}
            {formMode === 'DESCRIPTION' &&
              formData.budgetStatus === 'CREATE' &&
              !checked && (
                <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
                  编辑
                </Button>
              )}

            {formMode === 'EDIT' &&
              checked && (
                <Button
                  key="edit"
                  size="large"
                  type="primary"
                  loading={adjustLoading}
                  onClick={() =>
                    this.checkEdit({ result: 'APPROVED' }, () => {
                      closeThenGoto(`/user/flow/process?type=procs`);
                    })
                  }
                >
                  调整
                </Button>
              )}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem fieldType="BaseInput" label="采购单名称" fieldKey="poName" required />

            <FormItem
              fieldType="Group"
              label="采购类型"
              question="采购单创建后不能修改采购类型，如果采购类型选择错误，请删除本单据后，新增新的采购单"
            >
              <FormItem
                fieldType="BaseCustomSelect"
                parentKey="CUS:PO_CLASS1"
                fieldKey="poClass1"
                descriptionField="poClass1Desc"
                required
                disabled={checked || changeFlag}
              />
              <FormItem
                fieldType="BaseCustomSelect"
                parentKey="CUS:PO_CLASS2"
                fieldKey="poClass2"
                descriptionField="poClass2Desc"
                disabled={checked || changeFlag}
              />
            </FormItem>

            <FormItem fieldType="BaseInput" label="采购单号" fieldKey="poNo" disabled />

            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              descriptionField="chargeClassificationDesc"
              options={purTypeList}
              required
              onChange={(value, option, allOptions) => {
                if (value === 'DAILY') {
                  this.callModelEffects('updateForm', {
                    relatedContractId: undefined,
                    relatedProductId: undefined,
                    chargeProjectId: undefined,
                  });
                  this.callModelEffects('updateState', {
                    disableFlag: 'false',
                  });
                  this.callModelEffects('setBudget', {
                    chargeBuId: formData.chargeBuId,
                    chargeProjectId: formData.chargeProjectId,
                    budgetStatus: 'ACTIVE',
                    chargeClassification: value,
                  });
                }
                this.callModelEffects('updateForm', {
                  relatedBudgetId: undefined,
                });
                this.callModelEffects('fetchBusinessAccItem', {
                  docType: expenseDocType,
                  buId: formData.chargeBuId,
                  projType: value,
                });
                this.callModelEffects('clearAllBusAccItem');
              }}
            />

            <FormItem
              fieldType="ContractSimpleSelect"
              label="相关合同"
              fieldKey="relatedContractId"
              descriptionField="relatedContractName"
              required
              queryParam={{
                myContractResId: extInfo.resId,
                myContractUserId: extInfo.userId,
                contractStatus: 'ACTIVE',
                orContractNos: 'PC000000002', // 采购虚拟合   额外查询该合同
              }}
              // disabled={formData.chargeClassification === 'DAILY'}
              onChange={(value, option, allOptions) => {
                if (value) {
                  //产品、项目、部门、公司禁用
                  this.callModelEffects('updateState', {
                    disableFlag: 'true',
                  });
                  //产品、项目、部门、公司的值存起来
                  this.callModelEffects('updateForm', {
                    relatedProductId: option[0].relatedProduct,
                    chargeProjectId: option[0].relatedProject,
                    chargeBuId: option[0].inchargeBuId,
                    chargeCompany: option[0].signingCompany,
                    contractNo: option[0].contractNo,
                  });
                  if (
                    formData.relatedProductId &&
                    option[0].relatedProjectProductId !== option[0].relatedProduct &&
                    option[0].contractNo !== 'PC000000002'
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '相关合同、项目所对应的产品信息不一致，请注意检查相关产品字段是否正确',
                    });
                    return;
                  }

                  //核算项目相关
                  const buTypeTemp = option[0].inchargeBuType;
                  if (formData.chargeBuType !== buTypeTemp) {
                    // buType 切换
                    // eslint-disable-next-line no-lonely-if
                    if (busAccItemClearWarnFlag) {
                      createConfirm({
                        content: '该操作将清空所有核算项目,确认继续吗?',
                        onOk: () => {
                          this.callModelEffects('updateForm', {
                            chargeBuType: option[0].inchargeBuType,
                          });
                          this.callModelEffects('clearAllBusAccItem');
                          this.callModelEffects('fetchBusinessAccItem', {
                            docType: expenseDocType,
                            butmplType: buTypeTemp,
                            projType: formData.chargeClassification,
                            contractNo: option[0].contractNo,
                          });
                        },
                        onCancel: () => {
                          this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                        },
                      });
                    } else {
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: expenseDocType,
                        butmplType: buTypeTemp,
                        projType: formData.chargeClassification,
                        contractNo: option[0].contractNo,
                      });
                    }
                  }
                } else {
                  this.callModelEffects('updateState', {
                    disableFlag: 'false',
                  });
                  // 清空相关产品
                  this.callModelEffects('updateForm', {
                    relatedProductId: undefined,
                  });
                  if (busAccItemClearWarnFlag) {
                    createConfirm({
                      content: '该操作将清空所有核算项目,确认继续吗?',
                      onOk: () => {
                        this.callModelEffects('updateForm', {
                          chargeBuType: undefined,
                        });
                        this.callModelEffects('clearAllBusAccItem');
                        this.updateModelState({ businessAccItemList: [] });
                      },
                      onCancel: () => {
                        this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                      },
                    });
                  }
                }
              }}
            />

            <FormItem
              fieldType="ResSimpleSelect"
              label="采购负责人"
              fieldKey="inchargeResId"
              descriptionField="inchargeResName"
              initialValue={extInfo.resId}
              required
            />

            <FormItem
              fieldType="ProjectSimpleSelect"
              label="费用承担项目"
              fieldKey="chargeProjectId"
              descriptionField="chargeProjectName"
              initialValue={fromQs().chargeProjectId}
              disabled={formData.chargeClassification === 'DAILY'}
              required={
                formData.chargeClassification === 'PROJECT' ||
                formData.chargeClassification === 'SPECIAL'
              }
              queryParam={{
                myProjectResId: extInfo.resId,
                myProjectUserId: extInfo.userId,
                projectClass1:
                  formData.chargeClassification === 'DAILY' ? null : formData.chargeClassification,
                projectStatus: 'ACTIVE',
              }}
              onChange={(value, option, allOptions) => {
                if (value) {
                  this.callModelEffects('updateForm', {
                    relatedProductId: option[0].relatedProductId,
                    chargeBuId: option[0].inchargeBuId,
                    chargeCompany: option[0].inchargeCompany,
                  });
                  this.callModelEffects('setBudget', {
                    chargeProjectId: option[0].id,
                    chargeBuId: option[0].inchargeBuId,
                    budgetStatus: 'ACTIVE',
                    chargeClassification: formData.chargeClassification,
                  });

                  if (
                    formData.relatedProductId &&
                    formData.relatedProductId !== option[0].relatedProductId &&
                    formData.contractNo !== 'PC000000002'
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '项目修改默认带出项目的相关产品字段,请注意检查相关产品字段是否正确',
                    });
                    // return;
                  }

                  const buTypeTemp = option[0].inchargeBuType;
                  if (formData.chargeBuType !== buTypeTemp) {
                    // buType 切换
                    // eslint-disable-next-line no-lonely-if
                    if (busAccItemClearWarnFlag) {
                      createConfirm({
                        content: '该操作将清空所有核算项目,确认继续吗?',
                        onOk: () => {
                          this.callModelEffects('updateForm', {
                            chargeBuType: option[0].inchargeBuType,
                          });
                          this.callModelEffects('clearAllBusAccItem');
                          this.callModelEffects('fetchBusinessAccItem', {
                            docType: expenseDocType,
                            butmplType: buTypeTemp,
                            projType: formData.chargeClassification,
                          });
                        },
                        onCancel: () => {
                          this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                        },
                      });
                    } else {
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: expenseDocType,
                        butmplType: buTypeTemp,
                        projType: formData.chargeClassification,
                      });
                    }
                  }
                } else {
                  // 清空相关产品
                  this.callModelEffects('updateForm', {
                    relatedProductId: undefined,
                  });
                  // 清空部门
                  // eslint-disable-next-line no-lonely-if
                  if (busAccItemClearWarnFlag) {
                    createConfirm({
                      content: '该操作将清空所有核算项目,确认继续吗?',
                      onOk: () => {
                        this.callModelEffects('updateForm', {
                          chargeBuType: undefined,
                        });
                        this.callModelEffects('clearAllBusAccItem');
                        this.updateModelState({ businessAccItemList: [] });
                      },
                      onCancel: () => {
                        this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                      },
                    });
                  }
                }
              }}
            />

            <FormItem
              fieldType="BuSimpleSelect"
              label="费用承担部门"
              fieldKey="chargeBuId"
              descriptionField="chargeBuName"
              required
              // disabled={
              //   disableFlag === 'true' ||
              //   formData.chargeClassification === 'PROJECT' ||
              //   formData.chargeClassification === 'SPECIAL'
              // }
              initialValue={fromQs().chargeBuId ? fromQs().chargeBuId : extInfo.baseBuId}
              onChange={(value, option, allOptions) => {
                if (value) {
                  this.callModelEffects('setBudget', {
                    chargeProjectId: formData.chargeProjectId,
                    chargeBuId: option[0].id,
                    budgetStatus: 'ACTIVE',
                    chargeClassification: formData.chargeClassification,
                  });
                  const ouList = internalOuList.filter(
                    item => item.extVarchar1 === option[0].ouAbNo
                  );
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
                  this.callModelEffects('updateForm', {
                    chargeCompany,
                  });
                  const buTypeTemp = option[0].buType;
                  if (formData.chargeBuType !== buTypeTemp) {
                    // buType 切换
                    // eslint-disable-next-line no-lonely-if
                    if (busAccItemClearWarnFlag) {
                      createConfirm({
                        content: '该操作将清空所有核算项目,确认继续吗?',
                        onOk: () => {
                          this.callModelEffects('updateForm', {
                            chargeBuType: option[0].buType,
                          });
                          this.callModelEffects('clearAllBusAccItem');
                          this.callModelEffects('fetchBusinessAccItem', {
                            docType: expenseDocType,
                            butmplType: buTypeTemp,
                            projType: formData.chargeClassification,
                          });
                        },
                        onCancel: () => {
                          this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                        },
                      });
                    } else {
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: expenseDocType,
                        butmplType: buTypeTemp,
                        projType: formData.chargeClassification,
                      });
                    }
                  }
                } else {
                  // 清空部门
                  // eslint-disable-next-line no-lonely-if
                  if (busAccItemClearWarnFlag) {
                    createConfirm({
                      content: '该操作将清空所有核算项目,确认继续吗?',
                      onOk: () => {
                        this.callModelEffects('updateForm', {
                          chargeBuType: undefined,
                        });
                        this.callModelEffects('clearAllBusAccItem');
                        this.updateModelState({ businessAccItemList: [] });
                      },
                      onCancel: () => {
                        this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                      },
                    });
                  }
                }
              }}
            />

            <FormItem
              fieldType="BaseInputHidden"
              label="费用承担部门类型"
              fieldKey="chargeBuType"
            />

            <FormItem
              fieldType="BaseSelect"
              label="费用承担公司"
              fieldKey="chargeCompany"
              initialValue={fromQs().chargeCompany}
              required
              // disabled={disableFlag === 'true'}
              descList={internalOuList}
            />

            <FormItem
              fieldType="BudgetSimpleSelect"
              label="相关预算"
              fieldKey="relatedBudgetId"
              descriptionField="relatedBudgetName"
              queryParam={{
                chargeBuId: formData.chargeBuId ? formData.chargeBuId : extInfo.baseBuId,
                chargeProjectId: formData.chargeProjectId,
                budgetStatus: 'ACTIVE',
                chargeClassification: formData.chargeClassification,
              }}
              required
              //部门为空时点击触发
            />

            <FormItem
              fieldType="SupplierSimpleSelect"
              label="供应商"
              fieldKey="supplierId"
              descriptionField="supplierName"
              onChange={(value, option, allOptions) => {
                if (value) {
                  this.callModelEffects('fetchAccountList', {
                    abNo: option[0].supplierNo,
                    accStatus: 'ACTIVE',
                  });
                }
              }}
              required
            />

            <FormItem
              fieldType="ProductSimpleSelect"
              label="相关产品"
              fieldKey="relatedProductId"
              descriptionField="relatedProductName"
              initialValue={fromQs().relatedProductId}
              required
              queryParam={{
                orProjectId: formData.chargeProjectId,
                orContractId: formData.relatedContractId,
                productClass1s: ['PRODUCT_CLASS1:004', 'PRODUCT_CLASS1:003'].join(','),
                productStatus: 'ACTIVE',
              }}
              // disabled={disableFlag === 'true' || formData.chargeClassification === 'DAILY'}
            />

            <FormItem
              fieldType="BaseSwitch"
              label="外币业务"
              fieldKey="foreignCurrencyFlag"
              descriptionField="foreignCurrencyFlagDesc"
              initialValue={false}
              required
              onChange={e => {
                if (!e) {
                  // 税率设置为1  重新计算本币金额、原币金额
                  // const {details} = formData;
                  // const {paymentPlanDetails} = formData;
                  const tt1 = paymentPlanDetails
                    .map(v => v.paymentAmt || 0)
                    .reduce((x = 0, y = 0) => add(x, y), 0);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      baseCurrencyAmt: tt1,
                      originalCurrencyAmt: tt1,
                      exchangeRate: 1,
                    },
                  });
                }
              }}
            />

            <FormItem
              fieldType="Group"
              label="原币/汇率"
              fieldKey="originalCurrencyAndExchangeRate"
              visible={formData.foreignCurrencyFlag}
              required={formData.foreignCurrencyFlag}
            >
              <FormItem
                fieldType="BaseSelect"
                fieldKey="originalCurrency"
                parentKey="COMMON_CURRENCY"
                required={formData.foreignCurrencyFlag}
              />
              <FormItem
                fieldType="BaseInputAmt"
                fieldKey="exchangeRate"
                placeholder="请输入汇率"
                scale={6}
                required={formData.foreignCurrencyFlag}
                onChange={(value, option, allOptions) => {
                  if (value && formData.originalCurrencyAmt) {
                    const baseAmt = value * formData.originalCurrencyAmt;
                    this.callModelEffects('updateForm', { baseCurrencyAmt: baseAmt });
                  } else {
                    this.callModelEffects('updateForm', { baseCurrencyAmt: '' });
                  }
                }}
              />
            </FormItem>

            <FormItem
              fieldType="BaseInputAmt"
              label="原币金额"
              fieldKey="originalCurrencyAmt"
              visible={formData.foreignCurrencyFlag}
              disabled
              onChange={(value, option, allOptions) => {
                let tempexchangeRage = 1;
                if (value && formData.exchangeRate) {
                  tempexchangeRage = formData.exchangeRate;
                  const baseAmt = value * tempexchangeRage;
                  this.callModelEffects('updateForm', { baseCurrencyAmt: baseAmt });
                } else {
                  this.callModelEffects('updateForm', { baseCurrencyAmt: '' });
                }
              }}
            />

            <FormItem
              fieldType="BaseInputAmt"
              label="本币金额"
              fieldKey="baseCurrencyAmt"
              disabled
            />

            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="attachment"
              api="/api/production/pur/purchase/sfs/token"
              dataKey={formData.id}
            /> */}

            <FormItem
              fieldType="FileUpload"
              fieldKey="attachment"
              label="附件"
              fileList={attachments}
              multiple
            />
            <FormItem
              fieldType="BaseSelect"
              label="采购单状态"
              fieldKey="poStatus"
              descriptionField="poStatusDesc"
              parentKey="COM:DOC_STATUS"
              initialValue="CREATE"
              disabled
            />

            <FormItem
              fieldType="UserSimpleSelect"
              label="创建人"
              fieldKey="createUserId"
              descriptionField="createUserName"
              disabled
              initialValue={formData.id ? formData.createUserId : extInfo.userId}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="创建日期"
              initialValue={moment().format('YYYY-MM-DD')}
              fieldKey="createDate"
              descriptionField="createTime"
              disabled
            />

            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />

            <FormItem
              fieldType="BaseInputTextArea"
              label="调整说明"
              fieldKey="purchaseAdjustDesc"
              required={checked}
              visible={checked}
            />
          </BusinessForm>

          {formData.poClass1 === 'TEMPORARY' && (
            <BusinessForm title="支付信息" form={form} formData={formData} defaultColumnStyle={8}>
              <FormItem
                fieldType="BaseCustomSelect"
                label="支付方式"
                fieldKey="paymentMethod"
                descriptionField="paymentMethodDesc"
                parentKey="CUS:PAYMENT_METHOD"
                disabled={formMode === 'DESCRIPTION'}
                required
              />

              <FormItem
                fieldType="BaseDatePicker"
                label="期望付款日期"
                initialValue={moment().format('YYYY-MM-DD')}
                // initialValue={minExpectedPayment}
                fieldKey="expectedPaymentDate"
                descriptionField="expectedPaymentDate"
                disabled={formMode === 'DESCRIPTION'}
                required
              />

              {/*<FormItem*/}
              {/*  fieldType="BaseDatePicker"*/}
              {/*  label="实际付款日期"*/}
              {/*  // visible={formMode === 'DESCRIPTION' || actualPaymentDateVisible}*/}
              {/*  fieldKey="actualPaymentDate"*/}
              {/*  disabled={formMode === 'DESCRIPTION'}*/}
              {/*/>*/}

              <FormItem
                fieldType="BaseSelect"
                label="收款账号"
                fieldKey="accountNo"
                descriptionField="accountNo"
                descList={accountList}
                disabled={formMode === 'DESCRIPTION'}
                onChange={(value, option, allOptions) => {
                  const { bankName, holderName, bankBranch } = option[0];
                  this.callModelEffects('updateForm', { bankName, holderName, bankBranch });
                }}
              />

              <FormItem
                fieldType="BaseInput"
                label="户名"
                fieldKey="holderName"
                disabled={formMode === 'DESCRIPTION'}
              />

              <FormItem
                fieldType="BaseInput"
                label="收款银行"
                fieldKey="bankName"
                disabled={formMode === 'DESCRIPTION'}
              />

              <FormItem
                fieldType="BaseInput"
                label="收款银行网点"
                fieldKey="bankBranch"
                disabled={formMode === 'DESCRIPTION'}
              />
            </BusinessForm>
          )}

          {formMode === 'EDIT' && (
            <EditTable
              title="采购单明细"
              form={form}
              columns={editColumns}
              dataSource={purchaseOrderDetails}
              {...purchaseOrderdetailOperation}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="采购单明细"
              columns={editDescColumns}
              dataSource={purchaseOrderDetails}
              prodSelection={false}
            />
          )}

          {formMode === 'EDIT' && (
            <EditTable
              title="付款计划"
              form={form}
              columns={paymentColumns}
              dataSource={paymentPlanDetails}
              getCheckboxProps={record => ({
                disabled: checked && record.paymentRequestId !== null,
              })}
              scroll={{ x: 2400 }}
              {...detailOperation}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="付款计划"
              columns={paymentDescColumns}
              dataSource={paymentPlanDetails}
              prodSelection={false}
              scroll={{ x: 2400 }}
            />
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default PurchaseDisplayPage;
