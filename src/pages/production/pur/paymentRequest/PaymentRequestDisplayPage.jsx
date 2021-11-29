import React from 'react';
import { connect } from 'dva';
import { isNil, isEmpty, omit, type } from 'ramda';
import { Form, Icon, Tooltip } from 'antd';
import moment from 'moment';
import Link from 'umi/link';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';

import { fromQs } from '@/utils/production/stringUtil.ts';
import { systemLocaleListPaging } from '@/services/production/system';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import DataTable from '@/components/production/business/DataTable.tsx';
import { closeThenGoto } from '@/layouts/routerControl';
import message from '@/components/production/layout/Message.tsx';
import { getUrl } from '@/utils/flowToRouter';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import EditTable from '@/components/production/business/EditTable.tsx';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import classnames from 'classnames';
import styles from './index.less';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { add, mul, div } from '@/utils/mathUtils';
import InvoiceModalPro from '@/components/production/InvoiceModalPro';
import { flatten } from '@/utils/arrayUtils';

// namespace声明
const DOMAIN = 'paymentRequestDisplayPage';
const expenseDocType = 'PURCHASE_ORDER';
let allFlag = true;

/**
 *  综合展示页面
 */
@connect(({ loading, dispatch, paymentRequestDisplayPage, paymentPlanList, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...paymentRequestDisplayPage,
  ...paymentPlanList,
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
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`, // updateFormForEditTable updateForm
      payload: newFieldData,
    });
  },
})
class PaymentRequestDisplayPage extends React.PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { selectedRows, paymentTotalAmt } = this.props;
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    const { id, mode, taskId, from, flag } = fromQs();
    if (flag === 'OTHER') {
      allFlag = false;
    }
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId, from });
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init').then(data => {
      const { accountingDate } = data;
      taskId &&
        this.callModelEffects('fetchConfig', { taskId, accountingDate }).then(res => {
          this.callModelEffects('fetchFinancialAccSubjListLow').then(listRes => {
            const tt = listRes.filter(v => v.accCode === '224103')[0] || {};
            const { taskKey } = res;
            if (
              taskKey === 'PUR_G02_06_FIN_ACCOUNTING_APPROVAL' ||
              taskKey === 'PUR_G02_06_FIN_AUDIT_APPROVAL' ||
              taskKey === 'PUR05_04_FIN_AUDIT_APPROVAL'
            ) {
              const { chargeClassification, finAccSubjId } = data;
              if (
                (chargeClassification === 'DAILY' || chargeClassification === 'SPECIAL') &&
                !finAccSubjId
              ) {
                this.callModelEffects('updateForm', {
                  finAccSubjId: tt.id,
                  finAccSubjIdDesc: '其他应付款-日常',
                });
              }
            }
          });
        });

      this.callModelEffects('fetchBusinessAccItem', {
        docType: expenseDocType,
        buId: data.chargeBuId || extInfo.baseBuId,
        projType: !formData.chargeProjectId ? 'DAILY' : 'PROJECT',
      });
    });
    // this.callModelEffects('fetchBudgetType');
    if (from === 'paymentPlayList') {
      this.callModelEffects('updateForm', {
        paymentPlanDetails: selectedRows,
        originalCurrencyAmt: paymentTotalAmt,
        baseCurrencyAmt: paymentTotalAmt,
      });
      selectedRows[0].abNo &&
        this.callModelEffects('fetchAccountList', {
          abNo: selectedRows[0].abNo,
          accStatus: 'ACTIVE',
        });
    }

    this.callModelEffects('fetchInternalOuList');
    this.callModelEffects('fetchBudgetList');
    this.callModelEffects('finAccSubjIdListPaging');
    this.callModelEffects('fetchFinancialAccSubjList');
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
   * 指定更新
   */
  handleUpdate = (param, cb) => {
    this.callModelEffects('update', { formData: { ...param, submit: true }, cb });
  };

  /**
   * 完成
   */
  handleComplete = (param, cb) => {
    this.callModelEffects('complete', { formData: { ...param, submit: true }, cb });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData, selectedRows } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      const { invDocList, paymentPlanDetails, purchaseOrderDetails, ...restValues } = values;
      const { invDocList: newInvDocList } = formData;
      // if (isEmpty(newInvDocList)) {
      //   createMessage({ type: 'warn', description: '发票明细不能为空！' });
      //   return;
      // }

      const { buttonClick } = param; //加个标识 提交按钮的时候才检查发票

      if (!error) {
        const tt = newInvDocList.map(v => v.currWrittenAmt).reduce((a, b) => add(a, b), 0);
        const { originalCurrencyAmt } = formData;
        if (buttonClick && tt > originalCurrencyAmt) {
          createConfirm({
            content: '发票本次核销金额大于付款申请单原币金额，是否继续？',
            onOk: () => {
              // console.log(this);
              this.callModelEffects('save', {
                formData: { ...formData, ...restValues, ...param, submit: true },
                cb,
              });
            },
          });
          return;
        }

        this.callModelEffects('save', {
          formData: { ...formData, ...restValues, ...param, submit: true },
          cb,
        });
      } else {
        message({ type: 'error', content: '存在必填项未填写！' });
      }
    });
  };

  /**
   * 保存
   */
  handleSave = (param, cb) => {
    const { form, formData, selectedRows } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      const { invDocList, paymentPlanDetails, purchaseOrderDetails, ...restValues } = values;
      const { invDocList: newInvDocList } = formData;

      // if (isEmpty(newInvDocList)) {
      //   createMessage({ type: 'warn', description: '发票明细不能为空！' });
      //   return;
      // }

      if (!error) {
        const arr = newInvDocList.map(v => v.currWrittenAmt);
        const arr1 = arr.pop();
        if (arr1 < 0) {
          createMessage({ type: 'error', description: '本次核销金额不能为负数！' });
          return;
        }
      }

      if (!error) {
        const tt = newInvDocList.map(v => v.currWrittenAmt).reduce((a, b) => add(a, b), 0);
        const { originalCurrencyAmt } = formData;
        if (tt > originalCurrencyAmt) {
          createConfirm({
            content: '发票本次核销金额大于付款申请单原币金额，是否继续？',
            onOk: () => {
              this.callModelEffects('save', {
                formData: { ...formData, ...restValues, ...param },
                cb,
              });
            },
          });
          return;
        }

        this.callModelEffects('save', { formData: { ...formData, ...restValues, ...param }, cb });
      } else {
        message({ type: 'error', content: '存在必填项未填写！' });
      }
    });
  };

  /**
   * 删除
   */
  handleDelete = (param, cb) => {
    const { form, formData, selectedRows } = this.props;
    const { id } = formData;
    const formDataParam = {};
    // const ids = [];
    // ids.push(id);
    formDataParam.keys = id;
    createConfirm({
      content: '确定要删除吗？',
      onOk: () => {
        // console.log(this);
        this.callModelEffects('delete', { formData: { ...formDataParam }, cb });
      },
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

  handleModelOk = selectedInvos => {
    if (Array.isArray(selectedInvos) && selectedInvos.length > 1) {
      createMessage({ type: 'warn', description: '每条明细只能选择一张发票' });
      return;
    }

    const { dispatch } = this.props;
    const { detailsIndex } = this.state;
    const arr = new Array(detailsIndex + 1);
    const {
      id,
      invoiceNo,
      amountTax,
      writtenOffAmt,
      totalAmount,
      totalTax,
      deductTax,
      errRules,
    } = selectedInvos[0];
    arr[detailsIndex] = {
      invId: id,
      invoiceList: selectedInvos, // 发票所有信息，用于弹窗回显
      invoiceNo, // 发票号
      amountTax, // 发票金额
      writtenOffAmt, // 已核销金额
      amtIncludingTax: amountTax, // 含税金额
      amtExcludingTax: totalAmount, // 不含税金额
      taxAmt: totalTax, // 不含税金额
      deductTaxAmt: deductTax, // 可抵扣税额
      detailAppropriationAmt: errRules,
    };

    dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: {
        invDocList: arr,
      },
    });
    this.toggleVisible();
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const { dispatch } = this.props;
    const arr = new Array(index + 1);
    arr[index] = {
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: {
        invDocList: arr,
      },
    });
  };

  toggleVisible = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      dispatch,
      id,
      form,
      formData,
      finAccSubjId,
      formMode,
      loading,
      saveLoading,
      fieldsConfig,
      flowForm,
      taskId,
      from,
      selectedRows,
      minExpectedPayment,
      paymentTotalAmt,
      paymentRequestName,
      budgetList,
      businessAccItemList,
      financialAccSubjList,
      financialAccSubjListLow,
      accountList,
      user: { extInfo = {} }, // 取当前登陆人的resId
      invoiceDelIds = [],
      attachments,
    } = this.props;
    const {
      supplierId,
      chargeProjectId,
      chargeBuId,
      chargeCompany,
      chargeCompanyDesc,
      originalCurrency,
      relatedContractId,
      relatedContractName,
    } = selectedRows[0];
    const { userId } = extInfo;
    const { paymentPlanDetails, purchaseOrderDetails, invDocList = [] } = formData;
    const { visible, selectedInvos = [] } = this.state;
    const { mode } = fromQs();
    const { taskKey } = fieldsConfig;
    const diabledView =
      taskKey === 'PUR_G02_06_FIN_ACCOUNTING_APPROVAL' ||
      taskKey === 'PUR_G02_06_FIN_AUDIT_APPROVAL' ||
      taskKey === 'PUR05_04_FIN_AUDIT_APPROVAL';

    const isDisabled =
      taskKey === 'PUR_G02_06_FIN_ACCOUNTING_APPROVAL' || //   财务会计审批
      taskKey === 'PUR_G02_06_FIN_AUDIT_APPROVAL' || //   财务稽核审批
      taskKey === 'PUR_G02_07_FIN_MANAGER_APPROVAL' || //  财务经理审批
      taskKey === 'PUR_G02_08_FIN_HEAD_APPROVAL' || //   财务负责人审批
      taskKey === 'PUR05_04_FIN_AUDIT_APPROVAL' || //   其他采购财务稽核审批
      taskKey === 'PUR05_05_FIN_MANAGER_APPROVAL' || //   其他采购财务经理审批
      taskKey === 'PUR05_06_FIN_HEAD_APPROVAL'; //   其他采购财务负责人审批

    // 其他流程1
    let allBpm;
    let procKey;
    if (allFlag) {
      procKey = 'PUR_G02';
      allBpm = [{ docId: formData.id, procDefKey: 'PUR_G02', title: '采购付款流程' }];
    } else {
      procKey = 'PUR05';
      allBpm = [{ docId: formData.id, procDefKey: 'PUR05', title: '其他采购付款流程' }];
    }
    //const allBpm = [{ docId: formData.id, procDefKey: 'PUR_G02', title: '采购付款流程' }];

    // 页面没有关闭的时候 重新进入页面不会调用生命周期方法重新渲染数据 临时写法改变下面表格
    // if (from === 'paymentPlayList' && selectedRows.length !== paymentPlanDetails.length) {
    //   this.callModelEffects('updateForm', {
    //     paymentPlanDetails: selectedRows,
    //     originalCurrencyAmt: paymentTotalAmt,
    //     baseCurrencyAmt: paymentTotalAmt,
    //   });
    // }

    const finAccSubjIdVisible =
      fieldsConfig.taskKey === 'PUR_G02_06_FIN_ACCOUNTING_APPROVAL' ||
      fieldsConfig.taskKey === 'PUR_G02_06_FIN_AUDIT_APPROVAL' ||
      fieldsConfig.taskKey === 'PUR05_04_FIN_AUDIT_APPROVAL';

    const actualPaymentDateVisible =
      fieldsConfig.taskKey === 'PUR_G02_09_CASHIER_PAYMENT' ||
      fieldsConfig.taskKey === 'PUR05_07_CASHIER_PAYMENT';

    const paymentColumns = [
      {
        title: '采购单号',
        dataIndex: 'poNo',
        width: '100px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].poNo`}
            disabled
          />
        ),
      },
      {
        title: '付款计划编号',
        dataIndex: 'paymentPlanNo',
        width: '180px',
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
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].paymentStage`}
            disabled
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
            disabled
          />
        ),
      },
      {
        title: '付款金额',
        dataIndex: 'paymentAmt',
        width: '120px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`paymentPlanDetails[${index}].paymentAmt`}
            disabled
          />
        ),
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemName',
        width: '280px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].busAccItemName`}
            parentSelectAble={false}
            // options={businessAccItemList}
            // optionsKeyField="busAccItemId"
            disabled
          />
        ),
      },
      {
        title: '预算项目',
        dataIndex: 'budgetItemId',
        width: '280px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
            fieldKey={`paymentPlanDetails[${index}].budgetItemId`}
            parentSelectAble={false}
            options={budgetList}
            disabled
          />
        ),
      },
      {
        title: '会计科目',
        width: '200px',
        // visible: fieldsConfig.taskKey && fieldsConfig.taskKey === 'PUR_G02_04_BU_APPROVAL2',
        visible: finAccSubjIdVisible || formMode === 'DESCRIPTION',
        dataIndex: 'finAccSubjId',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
            fieldKey={`paymentPlanDetails[${index}].finAccSubjId`}
            options={financialAccSubjList}
            disabled={!finAccSubjIdVisible}
            parentSelectAble={false}
            initialValue={null}
          />
        ),
      },
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
      //       fieldType="BaseInput"
      //       fieldKey={`paymentPlanDetails[${index}].relatedInvoice`}
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      // {
      //   title: '含税金额',
      //   dataIndex: 'amtIncludingTax',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].amtIncludingTax`}
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      // {
      //   title: '不含税金额',
      //   dataIndex: 'amtExcludingTax',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].amtExcludingTax`}
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      // {
      //   title: '税额',
      //   dataIndex: 'taxAmt',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].taxAmt`}
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      // {
      //   title: '可抵扣税率',
      //   dataIndex: 'deductTaxRate',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseCustomSelect"
      //       fieldKey={`paymentPlanDetails[${index}].deductTaxRate`}
      //       parentKey="CUS:DEDUCT_TAX_RATE"
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      // {
      //   title: '可抵扣税额',
      //   dataIndex: 'deductTaxAmt',
      //   width: '150px',
      //   render: (text, record, index) => (
      //     <FormItem
      //       form={form}
      //       fieldType="BaseInputAmt"
      //       fieldKey={`paymentPlanDetails[${index}].deductTaxAmt`}
      //       disabled={formMode === 'DESCRIPTION'}
      //     />
      //   ),
      // },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '150px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`paymentPlanDetails[${index}].remark`}
            disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
          />
        ),
      },
      {
        title: '付款计划ID',
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

    const editColumns = [
      {
        title: '关联发票',
        dataIndex: 'invoiceNo',
        required: true,
        render: (text, record, index) =>
          from === 'RELATED_INVOICE' && record.id > 0 ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInput"
              fieldKey={`invDocList[${index}].invoiceNo`}
              disabled
              required
              addonAfter={
                <a
                  className="tw-link-primary"
                  onClick={() => {
                    const { invoiceList = [] } = record;
                    this.setState(
                      {
                        detailsIndex: index,
                        selectedInvos: Array.isArray(invoiceList) ? invoiceList : [],
                      },
                      () => {
                        this.setState({
                          visible: true,
                        });
                      }
                    );
                  }}
                >
                  <Icon type="search" />
                </a>
              }
            />
          ),
      },
      {
        title: '发票金额',
        dataIndex: 'amountTax',
        align: 'right',
      },
      {
        title: '本次核销金额',
        dataIndex: 'currWrittenAmt',
        align: 'right',
        required: true,
        render: (text, record, index) =>
          from === 'RELATED_INVOICE' && record.id > 0 ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              required
              fieldKey={`invDocList[${index}].currWrittenAmt`}
              disabled={diabledView}
            />
          ),
      },
      {
        title: '已核销金额',
        dataIndex: 'writtenOffAmt',
        align: 'right',
      },
      {
        title: '含税金额',
        dataIndex: 'amtIncludingTax',
        align: 'right',
      },
      {
        title: '不含税金额',
        dataIndex: 'amtExcludingTax',
        align: 'right',
      },
      {
        title: '税额',
        dataIndex: 'taxAmt',
        align: 'right',
      },
      {
        title: '可抵扣税率',
        dataIndex: 'deductTaxRate',
        align: 'right',
        render: (text, record, index) =>
          from === 'RELATED_INVOICE' && record.id > 0 ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseCustomSelect"
              parentKey="CUS:DEDUCT_TAX_RATE"
              disabled={diabledView}
              fieldKey={`invDocList[${index}].deductTaxRate`}
              onChange={(value, option) => {
                const { amtIncludingTax = 0 } = record;
                if (value && amtIncludingTax) {
                  const { extVarchar1 = 0 } = option[0];
                  this.onCellChanged(
                    index,
                    mul(div(amtIncludingTax, add(1, extVarchar1)), extVarchar1),
                    'deductTaxAmt'
                  );
                } else {
                  this.onCellChanged(index, 0, 'deductTaxAmt');
                }
              }}
            />
          ),
      },
      {
        title: '可抵扣税额',
        dataIndex: 'deductTaxAmt',
        align: 'right',
        render: (text, record, index) =>
          from === 'RELATED_INVOICE' && record.id > 0 ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              disabled={diabledView}
              fieldKey={`invDocList[${index}].deductTaxAmt`}
            />
          ),
      },
      {
        title: '规则检查说明',
        dataIndex: 'detailAppropriationAmt',
        align: 'left',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        align: 'left',
        render: (text, record, index) =>
          from === 'RELATED_INVOICE' && record.id > 0 ? (
            text
          ) : (
            <FormItem
              form={form}
              disabled={diabledView || isDisabled}
              fieldType="BaseInputTextArea"
              fieldKey={`invDocList[${index}].remark`}
              row={1}
            />
          ),
      },
    ];

    const editColumnsView = [
      {
        title: '关联发票',
        dataIndex: 'invoiceNo',
      },
      {
        title: '发票金额',
        dataIndex: 'amountTax',
        align: 'right',
      },
      {
        title: '本次核销金额',
        dataIndex: 'currWrittenAmt',
        align: 'right',
      },
      {
        title: '已核销金额',
        dataIndex: 'writtenOffAmt',
        align: 'right',
      },
      {
        title: '含税金额',
        dataIndex: 'amtIncludingTax',
        align: 'right',
      },
      {
        title: '不含税金额',
        dataIndex: 'amtExcludingTax',
        align: 'right',
      },
      {
        title: '税额',
        dataIndex: 'taxAmt',
        align: 'right',
      },
      {
        title: '可抵扣税率',
        dataIndex: 'deductTaxRate',
        align: 'right',
      },
      {
        title: '可抵扣税额',
        dataIndex: 'deductTaxAmt',
        align: 'right',
      },
      {
        title: '规则检查说明',
        dataIndex: 'detailAppropriationAmt',
        align: 'left',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        align: 'left',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <InvoiceModalPro
          title="选择发票"
          visible={visible} // 控制显示和关闭
          onOk={this.handleModelOk} // 点击确认回调,返回选中的发票信息
          onCancel={this.toggleVisible} // 点击返回关闭
          selectedInvos={selectedInvos} // 本条数据已经选择的发票(用于展开弹窗回显)
          reimUserId={userId} // 发票的创建人/归属人 = 当前用户
          // reimDetailId={detailsId} // 当前明细关联的发票也要查出来
          extraAlreadySelectedIds={flatten(
            invDocList.map(v => (Array.isArray(v.invoiceList) ? v.invoiceList : []))
          )
            .map(v => v.id)
            .filter(v => !selectedInvos.map(item => item.id).includes(v))} // 其他数据已经选择的发票，本条数据弹窗不显示
          extraQuery={{}} // 其他筛选条件(前提是后端支持)
          docType="0" // 1 報銷，0采購
          checkedParmars={formData.chargeCompanyDesc || chargeCompanyDesc} // 费用承担公司->用于规则校验
          disabled={
            from === 'RELATED_INVOICE'
              ? false
              : !(formMode === 'EDIT' || fieldsConfig.taskKey === 'PUR_G02_01_SUBMIT_i') // 发票弹窗内不可选择发票的条件
          }
        />

        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          scope={procKey}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'PUR_G02_01_SUBMIT_i' || taskKey === 'PUR05_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.handleSubmit(
                  {
                    result: 'APPROVED',
                    taskId,
                    procTaskId: taskId,
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
                      procTaskId: taskId,
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
                //1、财务经理可以编辑“会计科目”字段
                if (isDisabled) {
                  if (!formData.accountingDate) {
                    createMessage({ type: 'error', description: '请编辑记账日期！' });
                    return false;
                  }
                }
                if (
                  taskKey === 'PUR_G02_06_FIN_ACCOUNTING_APPROVAL' ||
                  taskKey === 'PUR_G02_06_FIN_AUDIT_APPROVAL' ||
                  taskKey === 'PUR05_04_FIN_AUDIT_APPROVAL'
                ) {
                  const params = [];
                  let financialAccSubjExist = true;

                  paymentPlanDetails.forEach(item => {
                    if (!item.finAccSubjId) {
                      financialAccSubjExist = false;
                      createMessage({ type: 'error', description: '请编辑会计科目！' });
                      return;
                    }
                    const param = {};
                    param.id = item.id;
                    param.finAccSubjId = item.finAccSubjId;
                    param.poNo = item.poNo;
                    params.push(param);
                  });
                  const formDataParam = {};

                  if (!formData.finAccSubjId) {
                    financialAccSubjExist = false;
                    createMessage({ type: 'error', description: '请编辑会计科目！' });
                  }

                  formDataParam.paymentPlanDetails = params;
                  formDataParam.paymentRequestId = formData.id;
                  formDataParam.finAccSubjId = formData.finAccSubjId;
                  formDataParam.accountingDate = formData.accountingDate;
                  formDataParam.procTaskId = taskId;
                  financialAccSubjExist &&
                    this.handleUpdate(formDataParam, () => {
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    });
                }
                //“财务负责人”审批节点通过后，付款申请单状态变更成“已批准待付款（WAITING_TO_PAY）”
                else if (
                  taskKey === 'PUR_G02_08_FIN_HEAD_APPROVAL' ||
                  taskKey === 'PUR05_06_FIN_HEAD_APPROVAL'
                ) {
                  const params = [];
                  const param = {};
                  param.poNo = formData.paymentPlanDetails[0].poNo;
                  params.push(param);

                  this.handleUpdate(
                    {
                      paymentRequestId: formData.id,
                      paymentRequestStatus: 'WAITING_TO_PAY',
                      paymentPlanDetails: params,
                      accountingDate: formData.accountingDate,
                    },
                    () => {
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                  );
                }
                //1、出纳可以编辑“实际付款日期”字段，且必填，其余项目和其他审批节点相同
                else if (
                  taskKey === 'PUR_G02_09_CASHIER_PAYMENT' ||
                  taskKey === 'PUR05_07_CASHIER_PAYMENT'
                ) {
                  if (!formData.actualPaymentDate) {
                    createMessage({ type: 'error', description: '请选择实际付款日期！' });
                  } else {
                    const params = [];
                    const param = {};
                    param.poNo = formData.paymentPlanDetails[0].poNo;
                    params.push(param);
                    this.handleComplete(
                      {
                        paymentRequestId: formData.id,
                        actualPaymentDate: formData.actualPaymentDate,
                        paymentPlanDetails: params,
                      },
                      () => {
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      }
                    );
                  }
                } else {
                  this.handleSubmit(
                    {
                      result: 'APPROVED',
                      taskId,
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
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' &&
              from !== 'RELATED_INVOICE' && [
                <Button
                  size="large"
                  type="primary"
                  onClick={() => {
                    this.handleSave({}, output => {
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
                  onClick={() =>
                    this.handleSubmit({ result: 'APPROVED', buttonClick: true }, () => {
                      closeThenGoto(`/user/flow/process?type=procs`);
                    })
                  }
                >
                  提交
                </Button>,
              ]}
            {from === 'RELATED_INVOICE' && (
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  this.handleSave({}, output => {
                    message({ type: 'success' });
                    this.callModelEffects('updateForm', { id: output.data.id });
                    this.callModelEffects('init', { id: output.data.id });
                  });
                }}
                loading={saveLoading}
              >
                保存
              </Button>
            )}
            {formMode === 'EDIT' &&
              formData.id && (
                <Button
                  key="edit"
                  size="large"
                  type="danger"
                  onClick={() =>
                    this.handleDelete({}, () => {
                      closeThenGoto(`/workTable/pur/paymentRequestList`);
                    })
                  }
                >
                  删除
                </Button>
              )}
            {formMode === 'DESCRIPTION' &&
              formData.budgetStatus === 'CREATE' && (
                <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
                  编辑
                </Button>
              )}
            {formData.id &&
              formData.id > 0 && (
                <a
                  href={`/print?scope=${procKey}&id=${fromQs().id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', marginRight: 8, float: 'right' }}
                >
                  <Tooltip title="打印单据">
                    <Button
                      className={classnames('tw-btn-default')}
                      type="dashed"
                      icon="printer"
                      size="large"
                    />
                  </Tooltip>
                </a>
              )}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem fieldType="BaseInput" label="付款单编号" fieldKey="paymentOrderNo" disabled />
            <FormItem
              fieldType="BaseInput"
              label="付款单名称"
              fieldKey="paymentOrderName"
              required
              initialValue={paymentRequestName}
              disabled={diabledView || isDisabled}
            />
            <FormItem
              fieldType="SupplierSimpleSelect"
              label="供应商"
              fieldKey="supplierId"
              descriptionField="supplierName"
              disabled
              initialValue={supplierId}
            />
            <FormItem
              fieldType="ProjectSimpleSelect"
              label="费用承担项目"
              fieldKey="chargeProjectId"
              descriptionField="chargeProjectName"
              initialValue={chargeProjectId}
              disabled
            />
            <FormItem
              fieldType="BuSimpleSelect"
              label="费用承担部门"
              fieldKey="chargeBuId"
              descriptionField="chargeBuName"
              initialValue={chargeBuId}
              disabled
            />
            <FormItem
              fieldType="BaseCustomSelect"
              label="费用承担公司"
              fieldKey="chargeCompany"
              descriptionField="chargeCompanyDesc"
              parentKey="CUS:INTERNAL_COMPANY"
              initialValue={chargeCompany}
              disabled={diabledView || isDisabled}
              onChange={(value, option) => {
                if (value) {
                  const { title } = option[0];
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      chargeCompanyDesc: title,
                    },
                  });
                  if (!isEmpty(invDocList)) {
                    invDocList.forEach((key, index) => {
                      const v = key;
                      if (!isNil(v.invoiceList) && !isEmpty(v.invoiceList)) {
                        v.invoiceList.forEach(item => {
                          const tt = [];
                          if (item.inspectionStatus !== 1 && item.inspectionStatus !== 5) {
                            tt.push('查验状态不符');
                          }
                          if (item.purchaserName && item.purchaserName !== title) {
                            tt.push('抬头不一致');
                          }
                          // eslint-disable-next-line no-param-reassign
                          item.errRules = tt.join(', ');
                        });
                        v.detailAppropriationAmt = v.invoiceList.map(i => i.errRules).join(', ');
                      }
                    });
                  }
                } else {
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      chargeCompanyDesc: null,
                    },
                  });
                }
              }}
            />
            <FormItem
              fieldType="BaseSwitch"
              label="外币业务"
              fieldKey="foreignCurrencyFlag"
              descriptionField="foreignCurrencyFlagDesc"
              // parentKey="COMMON:YES-OR-NO"
              required
              disabled={diabledView}
              initialValue={false}
              onChange={e => {
                if (!e) {
                  // 税率设置为1  重新计算本币金额、原币金额
                  // const {details} = formData;
                  const { originalCurrencyAmt } = formData;
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      baseCurrencyAmt: originalCurrencyAmt,
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
            >
              <FormItem
                fieldType="BaseSelect"
                fieldKey="originalCurrency"
                parentKey="COMMON_CURRENCY"
                initialValue={originalCurrency}
              />
              <FormItem
                fieldType="BaseInputAmt"
                fieldKey="exchangeRate"
                placeholder="请输入汇率"
                scale={6}
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
              api="/api/production/pur/paymentRequest/sfs/token"
              dataKey={formData.id}
              disabled={diabledView}
            /> */}
            <FormItem
              fieldType="FileUpload"
              fieldKey="attachment"
              label="附件"
              fileList={attachments}
              multiple
              preview={diabledView || isDisabled}
            />
            <FormItem
              fieldType="BaseDatePicker"
              label="记账日期"
              fieldKey="accountingDate"
              descriptionField="accountingDate"
              disabled={!isDisabled}
              required={isDisabled}
            />
            <FormItem
              fieldType="BaseSelect"
              label="付款申请状态"
              fieldKey="paymentRequestStatus"
              descriptionField="paymentRequestStatusDesc"
              parentKey="PUR:PAYMENT_REQUEST_STATUS"
              initialValue="CREATE"
              disabled
            />

            <FormItem
              form={form}
              fieldType="BaseTreeSelect"
              label="会计科目"
              required={diabledView}
              fieldKey="finAccSubjId"
              options={financialAccSubjListLow}
              disabled={!diabledView}
            />
            <FormItem
              fieldType="UserSimpleSelect"
              label="创建人"
              fieldKey="createUser"
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
            <FormItem
              fieldType="ContractSimpleSelect"
              label="相关合同"
              fieldKey="relatedContractId"
              initialValue={relatedContractId}
              descriptionField={relatedContractName}
              disabled
              fieldMode={from === 'paymentPlayList' ? 'EDIT' : 'LINK'}
              descriptionRender={
                <Link
                  className="tw-link"
                  to={`/workTable/contractMgmt/contractList/detail?id=${
                    formData.relatedContractId
                  }&mode=DESCRIPTION`}
                >
                  {formData.relatedContractName}
                </Link>
              }
            />

            <FormItem
              fieldType="BaseInputTextArea"
              label="备注"
              fieldKey="remark"
              disabled={diabledView || isDisabled}
            />
          </BusinessForm>

          <BusinessForm
            title="支付信息"
            form={form}
            formData={formData}
            // formMode={formMode}  重要！！！ 不要用formMode 会影响付款审批流程
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseCustomSelect"
              label="支付方式"
              fieldKey="paymentMethod"
              descriptionField="paymentMethodDesc"
              parentKey="CUS:PAYMENT_METHOD"
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
              required
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="期望付款日期"
              // initialValue={moment().format('YYYY-MM-DD')}
              initialValue={minExpectedPayment}
              fieldKey="expectedPaymentDate"
              descriptionField="expectedPaymentDate"
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
              required
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="实际付款日期"
              visible={formMode === 'DESCRIPTION' || actualPaymentDateVisible}
              fieldKey="actualPaymentDate"
              required={actualPaymentDateVisible}
              disabled={!actualPaymentDateVisible || diabledView || isDisabled}
            />

            <FormItem
              fieldType="BaseSelect"
              label="收款账号"
              fieldKey="accountNo"
              descriptionField="accountNo"
              descList={accountList}
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
              onChange={(value, option, allOptions) => {
                const { bankName, holderName, bankBranch } = option[0];
                this.callModelEffects('updateForm', { bankName, holderName, bankBranch });
              }}
              required
            />

            <FormItem
              fieldType="BaseInput"
              label="户名"
              fieldKey="holderName"
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
            />

            <FormItem
              fieldType="BaseInput"
              label="收款银行"
              fieldKey="bankName"
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
            />

            <FormItem
              fieldType="BaseInput"
              label="收款银行网点"
              fieldKey="bankBranch"
              disabled={formMode === 'DESCRIPTION' || diabledView || isDisabled}
            />
          </BusinessForm>

          {formData.poClass1 === 'TEMPORARY' && (
            <DataTable
              title="采购单明细"
              columns={editDescColumns}
              dataSource={purchaseOrderDetails}
              prodSelection={false}
            />
          )}

          <EditTable
            title="关联付款计划区域"
            form={form}
            columns={paymentColumns}
            dataSource={paymentPlanDetails}
            scroll={{ x: 2400 }}
          />

          {(formMode === 'EDIT' && !isDisabled) ||
          fieldsConfig.taskKey === 'PUR_G02_01_SUBMIT_i' ||
          from === 'RELATED_INVOICE' ? (
            <EditTable
              title="发票明细"
              form={form}
              columns={editColumns}
              dataSource={invDocList}
              rowSelectAble={false}
              scroll={{ x: 1800 }}
              rowSelection={{
                getCheckboxProps: record => ({
                  disabled: formData.paymentRequestStatus === 'CREATE' ? false : record.id > 0, // Column configuration not to be checked
                }),
              }}
              onAddClick={
                diabledView
                  ? null
                  : () => {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          invDocList: update(invDocList, {
                            $push: [
                              {
                                id: genFakeId(-1),
                              },
                            ],
                          }),
                        },
                      });
                    }
              }
              onDeleteConfirm={
                diabledView
                  ? null
                  : keys => {
                      const newDataSource = invDocList.filter(row => keys.indexOf(row.id) < 0);
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          invDocList: newDataSource,
                        },
                      });
                      this.updateModelState({ invoiceDelIds: [...invoiceDelIds, ...keys] });
                    }
              }
            />
          ) : (
            <DataTable
              title="发票明细"
              form={form}
              columns={editColumnsView}
              dataSource={invDocList}
              rowSelectAble={false}
              scroll={{ x: 2400 }}
            />
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default PaymentRequestDisplayPage;
