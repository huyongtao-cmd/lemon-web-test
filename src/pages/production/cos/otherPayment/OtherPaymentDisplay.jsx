import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit, clone } from 'ramda';
import { Form, Tooltip, Icon } from 'antd';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';

import { fromQs } from '@/utils/production/stringUtil.ts';
// service方法
import EditTable from '@/components/production/business/EditTable.tsx';
import DataTable from '@/components/production/business/DataTable.tsx';

import { listToTreePlus } from '@/utils/production/TreeUtil.ts';
import moment from 'moment';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import BaseInputAmt from '@/components/production/basic/BaseInputAmt.tsx';
import BaseInputNumber from '@/components/production/basic/BaseInputNumber.tsx';
import message from '@/components/production/layout/Message.tsx';
import InvoiceModalPro from '@/components/production/InvoiceModalPro';
import { add, mul, div } from '@/utils/mathUtils';
import { flatten } from '@/utils/arrayUtils';
import classnames from 'classnames';

// namespace声明
const DOMAIN = 'otherPaymentDisplay';
const TOTAL_ROW_ID = 'TOTAL';
const procKey = 'COS12';
const mappingType = 'OTHER_PAYMENT';
const defaultBudgetFlag = false;

/**
 * 福利费报销 综合展示页面
 */
@connect(({ loading, dispatch, otherPaymentDisplay, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...otherPaymentDisplay,
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
class OtherPaymentDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      budgetFlag: defaultBudgetFlag,
    };
  }

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, currentNode = 'create', taskId } = fromQs();

    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    // 把url的参数保存到state
    this.updateModelState({ formMode, currentNode, copy, taskId });
    this.callModelEffects('updateForm', { id, chargeBuId: extInfo.baseBuId });
    this.callModelEffects('init').then(data => {
      this.callModelEffects('fetchInternalOuList');
      this.callModelEffects('fetchBusinessAccItem', {
        docType: mappingType,
        buId: data.chargeBuId || extInfo.baseBuId,
        projType: data.chargeClassification,
      });
      taskId && this.callModelEffects('fetchConfig', taskId);
      this.callModelEffects('fetchAccountList', { abNo: extInfo.abNo, accStatus: 'ACTIVE' });
    });
    this.callModelEffects('fetchAbList');
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchOtherPaymentType');
    this.callModelEffects('fetchBudgetList');
    this.callModelEffects('fetchFinancialAccSubjList');
    this.callModelEffects('fetchCustomSetting');
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

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
   * 保存
   */
  handleSave = (param, cb) => {
    const { form, formData, deleteKeys } = this.props;
    const { details } = formData;

    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 费用明细不能为空业务检查
        if (!details || details.length < 1) {
          createMessage({ type: 'error', description: '请填写至少一条付款明细!' });
          return;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
            deleteKeys,
            ...param,
          },
          cb,
        });
      }
    });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData, deleteKeys } = this.props;
    const { details } = formData;

    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 费用明细不能为空业务检查
        if (!details || details.length < 1) {
          createMessage({ type: 'error', description: '请填写至少一条费用明细!' });
          return;
        }
        //常规报销、福利费报销、差旅报销，提交时，如果某个明细行的金额为0，进行提醒“第【XX】行报销金额为0，请检查”
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < details.length; i++) {
          if (details[i].claimAmt === 0) {
            createMessage({ type: 'error', description: `第${i + 1}行报销金额为0，请检查!` });
            return;
          }
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
            deleteKeys,
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
   * @param changeAmt 变化金额
   * 当明细行金额变化
   */
  handleChangeAmt = changeAmt => {
    const { formData } = this.props;
    if (!Number.isNaN(changeAmt)) {
      const originalCurrencyAmt = (formData.originalCurrencyAmt || 0) + changeAmt;
      const baseCurrencyAmt =
        originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate);
      this.callModelEffects('updateForm', {
        originalCurrencyAmt: parseFloat(originalCurrencyAmt.toFixed(2)),
        baseCurrencyAmt: parseFloat(baseCurrencyAmt.toFixed(2)),
        paymentAmt: parseFloat(baseCurrencyAmt.toFixed(2)),
      });
    }
  };

  render() {
    const {
      form,
      dispatch,
      formData,
      formMode,
      currentNode,
      otherPaymentList,
      budgetTypeList,
      internalOuList,
      businessAccItemList,
      budgetList,
      abList,
      financialAccSubjList,
      accountList,
      deleteKeys,
      loading,
      saveLoading,
      taskId,
      fieldsConfig,
      flowForm,
      user: { extInfo = {} }, // 取当前登陆人的resId
      attachments,
    } = this.props;

    const { budgetFlag } = this.state;

    const busAccItemClearWarnFlag = formData.details.length > 0;

    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: procKey, title: '其他付款流程' }];

    const { details } = formData;

    const editColumns = [
      {
        title: '付款内容',
        dataIndex: 'itemName',
        required: true,
        width: '350px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInput"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              fieldKey={`details[${index}].itemName`}
            />
          ),
      },
      {
        title: '金额',
        dataIndex: 'amt',
        required: true,
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].amt`}
              onChange={value => {
                const changeAmt = value - (record.amt || 0);
                this.handleChangeAmt(changeAmt);
              }}
            />
          ),
      },
      {
        title: (
          <span>
            核算项目&nbsp;
            <Tooltip title="只能选择最底级核算项目">
              <Icon type="question-circle" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'busAccItemId',
        required: true,
        width: '200px',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseTreeSelect"
              parentSelectAble={false}
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              fieldKey={`details[${index}].busAccItemId`}
              options={businessAccItemList}
              optionsKeyField="busAccItemId"
              onChange={(value, option) => {
                if (option.length > 0) {
                  const arr = [];
                  arr[index] = {
                    budgetItemId: option[0].budgetItemId,
                    finAccSubjId: option[0].finAccSubjId,
                  };
                  this.callModelEffects('updateFormForEditTable', { details: arr });
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
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'financeEdit' &&
                currentNode !== 'advanceEdit'
              }
              fieldKey={`details[${index}].budgetItemId`}
              options={budgetList}
            />
          ),
      },
      {
        title: '会计科目',
        width: '200px',
        dataIndex: 'finAccSubjId',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseTreeSelect"
              parentSelectAble={false}
              disabled={currentNode !== 'financeEdit' && currentNode !== 'advanceEdit'}
              fieldKey={`details[${index}].finAccSubjId`}
              options={financialAccSubjList}
            />
          ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseInputTextArea"
              fieldKey={`details[${index}].remark`}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            />
          ),
      },
    ];

    const descriptionColumns = [
      {
        title: '付款内容',
        dataIndex: 'itemName',
        width: '350px',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemIdDesc',
        width: '200px',
      },
      {
        title: '预算项目',
        dataIndex: 'budgetItemIdDesc',
        width: '200px',
      },
      {
        title: '会计科目',
        dataIndex: 'finAccSubjIdDesc',
        width: '200px',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];
    /* eslint-disable no-nested-ternary */
    const sumAmt = details
      .map(item => item.amt)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    /* eslint-enable no-nested-ternary */
    const sumRow = {
      id: TOTAL_ROW_ID,
      itemName: '合计',
      amt: sumAmt,
    };
    const sumWrappedDetails = details.concat(sumRow);

    const detailOperation = {
      onAddClick: () => {
        if (formData.relatedBudgetId || !budgetFlag) {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              details: update(details, {
                $push: [
                  {
                    id: genFakeId(-1),
                    amt: 0,
                    amtIncludingTax: 0,
                    amtExcludingTax: 0,
                    taxAmt: 0,
                    deductTaxAmt: 0,
                    invoiceNum: 0,
                  },
                ],
              }),
            },
          });
          console.log(details);
        } else {
          createMessage({
            type: 'error',
            description: '请确认费用归属、费用承担部门、相关预算等信息已正确填写',
          });
        }
      },
      onCopyClick: copied => {
        const newDataSource = update(details, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        const changeAmt = copied
          .map(item => item.amt)
          .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
        this.handleChangeAmt(changeAmt);
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            details: newDataSource,
          },
        });
      },
      onDeleteConfirm: keys => {
        const newDataSource = details.filter(row => keys.indexOf(row.id) < 0);
        const changeAmt = details
          .filter(row => keys.indexOf(row.id) >= 0)
          .map(item => item.amt)
          .reduce((item1, item2) => item1 - item2, 0);
        this.handleChangeAmt(changeAmt);
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            details: newDataSource,
          },
        });
        this.updateModelState({ deleteKeys: [...deleteKeys, ...keys] });
      },
    };

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={saveLoading}
          scope={procKey}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            if (key === 'COUNTERSIGN') {
              return Promise.resolve(true);
            }
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
            if (currentNode === 'create' || currentNode === 'financeEdit') {
              if (key === 'FLOW_COMMIT' || key === 'FLOW_PASS') {
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
            } else if (key === 'FLOW_PASS') {
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

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' && [
              <Button
                key="save"
                size="large"
                type="primary"
                onClick={() => {
                  this.handleSave(
                    currentNode === 'advanceEdit' ? { submit: true, advanceEditFlag: true } : {},
                    output => {
                      message({ type: 'success' });
                      this.callModelEffects('updateForm', { id: output.data.id });
                      this.callModelEffects('init', { id: output.data.id });
                    }
                  );
                }}
                loading={saveLoading}
              >
                保存
              </Button>,
            ]}
            {formMode === 'EDIT' &&
              currentNode !== 'advanceEdit' && (
                <Button
                  key="submit"
                  size="large"
                  type="primary"
                  onClick={() =>
                    this.handleSubmit({ result: 'APPROVED' }, () => {
                      closeThenGoto(`/user/flow/process?type=procs`);
                    })
                  }
                  loading={saveLoading}
                >
                  提交
                </Button>
              )}
            {formMode === 'DESCRIPTION' &&
              formData.paymentStatus === 'CREATE' && (
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
            <FormItem
              fieldType="BaseInput"
              label="付款单名称"
              fieldKey="paymentName"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            />

            <FormItem
              fieldType="BaseSelect"
              label="类型"
              fieldKey="paymentType"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              descList={otherPaymentList}
              onChange={(value, option) => {
                if (option && option.length > 0) {
                  if (option[0].extVarchar2 === '0') {
                    this.setState({ budgetFlag: true });
                  } else {
                    this.setState({ budgetFlag: false });
                  }
                } else {
                  this.setState({ budgetFlag: defaultBudgetFlag });
                }
              }}
            />

            <FormItem fieldType="BaseInput" label="付款单号" fieldKey="paymentNo" disabled />

            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              parentKey="CUS:CHARGE_CLASSIFICATION"
              options={budgetTypeList}
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              onChange={(value, option) => {
                if (value === 'DAILY' && budgetFlag) {
                  this.callModelEffects('setBudget', {
                    chargeBuId: formData.chargeBuId,
                    chargeProjectId: formData.chargeProjectId,
                    budgetStatus: 'ACTIVE',
                    chargeClassification: value,
                  });
                }
                this.callModelEffects('updateForm', {
                  chargeProjectId: undefined,
                  relatedBudgetId: undefined,
                });
                this.callModelEffects('fetchBusinessAccItem', {
                  docType: mappingType,
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
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              descList={[
                { value: formData.relatedContractId, title: formData.relatedContractIdDesc },
              ]}
              onChange={(value, option, allOptions) => {
                if (value) {
                  //产品、项目、部门、公司的值存起来
                  this.callModelEffects('updateForm', {
                    relatedProductId: option[0].relatedProduct,
                  });

                  if (
                    formData.relatedProductId &&
                    option[0].relatedProjectProductId !== option[0].relatedProductId
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '相关合同、项目所对应的产品信息不一致，请注意检查相关产品字段是否正确',
                    });
                  }
                } else {
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      relatedProductId: null,
                    },
                  });
                }
              }}
            />

            <FormItem
              fieldType="ProductSimpleSelect"
              label="相关产品"
              fieldKey="relatedProductId"
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              descList={[
                { value: formData.relatedProductId, title: formData.relatedProductIdDesc },
              ]}
              queryParam={{
                orProjectId: formData.chargeProjectId,
                orContractId: formData.relatedContractId,
                productClass1s: ['PRODUCT_CLASS1:004', 'PRODUCT_CLASS1:003'].join(','),
                productStatus: 'ACTIVE',
              }}
            />

            <FormItem
              fieldType="ProjectSimpleSelect"
              label="费用承担项目"
              fieldKey="chargeProjectId"
              required={formData.chargeClassification !== 'DAILY'}
              disabled={
                (currentNode !== 'create' &&
                  currentNode !== 'applyEdit' &&
                  currentNode !== 'advanceEdit') ||
                formData.chargeClassification === 'DAILY'
              }
              // disabled={formData.chargeClassification === 'DAILY'}
              queryParam={{
                projectClass1: formData.chargeClassification,
                projectStatus: 'ACTIVE',
              }}
              onChange={(value, option) => {
                if (option.length > 0) {
                  this.callModelEffects('updateForm', {
                    relatedProductId: option[0].relatedProductId,
                  });
                  if (budgetFlag) {
                    this.callModelEffects('setBudget', {
                      chargeProjectId: option[0].id,
                      chargeBuId: option[0].inchargeBuId,
                      budgetStatus: 'ACTIVE',
                      chargeClassification: formData.chargeClassification,
                    });
                  }
                  if (
                    formData.relatedProductId &&
                    formData.relatedProductId !== option[0].relatedProductId
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '项目修改默认带出项目的相关产品字段,请注意检查相关产品字段是否正确',
                    });
                  }
                  const buTypeTemp = option[0].inchargeBuType;
                  if (formData.chargeBuType === buTypeTemp) {
                    this.callModelEffects('updateForm', {
                      chargeBuId: option[0].inchargeBuId,
                      chargeCompany: option[0].inchargeCompany,
                    });
                  } else {
                    // buType 切换
                    // eslint-disable-next-line no-lonely-if
                    if (busAccItemClearWarnFlag) {
                      createConfirm({
                        content: '该操作将清空所有核算项目,确认继续吗?',
                        onOk: () => {
                          this.callModelEffects('updateForm', {
                            chargeBuId: option[0].inchargeBuId,
                            chargeCompany: option[0].inchargeCompany,
                          });
                          this.callModelEffects('clearAllBusAccItem');
                          this.callModelEffects('fetchBusinessAccItem', {
                            docType: mappingType,
                            butmplType: buTypeTemp,
                            projType: formData.chargeClassification,
                          });
                        },
                        onCancel: () => {
                          this.callModelEffects('updateForm', {
                            chargeProjectId: formData.chargeProjectId,
                          });
                        },
                      });
                    } else {
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: mappingType,
                        butmplType: buTypeTemp,
                        projType: formData.chargeClassification,
                      });
                      this.callModelEffects('updateForm', {
                        chargeBuId: option[0].inchargeBuId,
                        chargeCompany: option[0].inchargeCompany,
                      });
                    }
                  }
                } else {
                  this.callModelEffects('updateForm', {
                    relatedProductId: undefined,
                  });
                }
              }}
              descList={[{ value: formData.chargeProjectId, title: formData.chargeProjectName }]}
            />

            <FormItem
              fieldType="BuSimpleSelect"
              label="费用承担部门"
              fieldKey="chargeBuId"
              required
              disabled={formData.chargeProjectId || currentNode !== 'create'}
              // initialValue={extInfo.baseBuId}
              onChange={(value, option) => {
                if (option.length > 0) {
                  const buTypeTemp = option[0].buType;
                  const ouList = internalOuList.filter(
                    item => item.extVarchar1 === option[0].ouAbNo
                  );
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
                  if (budgetFlag) {
                    this.callModelEffects('setBudget', {
                      chargeProjectId: formData.chargeProjectId,
                      chargeBuId: option[0].id,
                      budgetStatus: 'ACTIVE',
                      chargeClassification: formData.chargeClassification,
                    });
                  }
                  if (formData.chargeBuType === buTypeTemp) {
                    this.callModelEffects('updateForm', {
                      chargeCompany,
                      // chargeBuType:option[0].buType,
                    });
                  } else {
                    // buType 切换
                    // eslint-disable-next-line no-lonely-if
                    if (busAccItemClearWarnFlag) {
                      createConfirm({
                        content: '该操作将清空所有核算项目,确认继续吗?',
                        onOk: () => {
                          this.callModelEffects('updateForm', {
                            chargeCompany,
                            chargeBuType: option[0].buType,
                          });
                          this.callModelEffects('clearAllBusAccItem');
                          this.callModelEffects('fetchBusinessAccItem', {
                            docType: mappingType,
                            butmplType: buTypeTemp,
                            projType: formData.chargeClassification,
                          });
                        },
                        onCancel: () => {
                          this.callModelEffects('updateForm', { chargeBuId: formData.chargeBuId });
                        },
                      });
                    } else {
                      this.callModelEffects('updateForm', {
                        chargeCompany,
                      });
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: mappingType,
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
              descList={[
                { value: extInfo.baseBuId, title: extInfo.baseBuName },
                { value: formData.chargeBuId, title: formData.chargeBuName },
              ]}
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
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              // disabled={!isNil(formData.chargeProjectId)}
              descList={internalOuList}
            />

            <FormItem
              fieldType="BudgetSimpleSelect"
              label="相关预算"
              fieldKey="relatedBudgetId"
              required={budgetFlag}
              // disabled={!budgetFlag}
              disabled={
                (currentNode !== 'create' &&
                  currentNode !== 'applyEdit' &&
                  currentNode !== 'advanceEdit') ||
                !budgetFlag
              }
              queryParam={{
                chargeBuId: formData.chargeBuId,
                chargeProjectId: formData.chargeProjectId,
                budgetStatus: 'ACTIVE',
                chargeClassification: formData.chargeClassification,
              }}
              descList={[{ value: formData.relatedBudgetId, title: formData.relatedBudgetIdDesc }]}
            />

            <FormItem
              fieldType="BaseSelect"
              label="付款对象"
              fieldKey="paymentTarget"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              descList={[
                { value: formData.relatedBudgetId, title: formData.relatedBudgetIdDesc },
                ...abList,
              ]}
              onChange={(value, option) => {
                if (option.length > 0) {
                  this.callModelEffects('fetchAccountList', {
                    abNo: option[0].abNo,
                    accStatus: 'ACTIVE',
                    flag: true,
                  });
                } else {
                  this.callModelEffects('updateForm', {
                    holderName: undefined,
                    accountNo: undefined,
                    bankName: undefined,
                    bankBranch: undefined,
                  });
                }
              }}
            />

            <FormItem
              fieldType="ResSimpleSelect"
              label="发起人"
              fieldKey="inchargeResId"
              descriptionField="inchargeResIdDesc"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              descList={[{ value: formData.inchargeResId, title: formData.inchargeResIdDesc }]}
            />

            <FormItem
              fieldType="BaseSwitch"
              label="外币业务"
              fieldKey="foreignCurrencyFlag"
              descriptionField="foreignCurrencyFlagDesc"
              // parentKey="COMMON:YES-OR-NO"
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              required
              onChange={e => {
                if (!e) {
                  // 税率设置为1  重新计算本币金额、原币金额
                  // const {details} = formData;
                  const tt1 = details.map(v => v.amt || 0).reduce((x = 0, y = 0) => add(x, y), 0);
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
              required={formData.foreignCurrencyFlag}
              visible={formData.foreignCurrencyFlag}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            >
              <FormItem
                fieldType="BaseSelect"
                fieldKey="originalCurrency"
                parentKey="COMMON_CURRENCY"
                required={formData.foreignCurrencyFlag}
                descList={[
                  { value: formData.originalCurrency, title: formData.originalCurrencyDesc },
                ]}
              />
              <FormItem
                fieldType="BaseInputAmt"
                fieldKey="exchangeRate"
                placeholder="请输入汇率"
                required={formData.foreignCurrencyFlag}
                scale={6}
                onChange={(value, option) => {
                  if (formData.originalCurrencyAmt) {
                    const baseAmt = value * formData.originalCurrencyAmt;
                    this.callModelEffects('updateForm', {
                      baseCurrencyAmt: baseAmt,
                      paymentAmt: baseAmt,
                    });
                  }
                }}
              />
            </FormItem>

            <FormItem
              fieldType="BaseInputAmt"
              label="原币金额"
              fieldKey="originalCurrencyAmt"
              disabled
              visible={formData.foreignCurrencyFlag}
              onChange={(value, option) => {
                let tempexchangeRage = 1;
                if (formData.exchangeRate) {
                  tempexchangeRage = formData.exchangeRate;
                }
                const baseAmt = value * tempexchangeRage;
                this.callModelEffects('updateForm', { baseCurrencyAmt: baseAmt });
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
              fieldKey="file"
              api="/api/production/cos/otherPayment/sfs/token"
              dataKey={formData.id}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            /> */}
            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="附件"
              fileList={attachments}
              multiple
              preview={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            />

            <FormItem
              fieldType="BaseSelect"
              label="状态"
              fieldKey="paymentStatus"
              parentKey="COS:OTHER_PAYMENT:STATUS"
              disabled
            />

            <FormItem
              fieldType="BaseSelect"
              label="创建人"
              fieldKey="createUserId"
              // descriptionField="createUserName"
              initialValue={formData.id ? formData.createUserId : extInfo.userId}
              disabled
              descList={[
                { value: extInfo.userId, title: extInfo.resName },
                { value: formData.createUserId, title: formData.createUserIdDesc },
              ]}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="创建日期"
              fieldKey="createTime"
              disabled
              initialValue={moment().format('YYYY-MM-DD')}
            />

            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="付款明细"
              form={form}
              columns={editColumns}
              dataSource={sumWrappedDetails}
              rowSelectAble={false}
              getCheckboxProps={record => ({
                disabled: record.id === TOTAL_ROW_ID,
              })}
              {...detailOperation}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="付款明细"
              columns={descriptionColumns}
              dataSource={sumWrappedDetails}
              prodSelection={false}
            />
          )}

          <BusinessForm
            title="支付信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseCustomSelect"
              label="支付方式"
              fieldKey="paymentMethod"
              parentKey="CUS:PAYMENT_METHOD"
              initialValue="BANK_TRANSFER"
              disabled={currentNode !== 'create' && currentNode !== 'applyEdit'}
              required
            />

            <FormItem
              fieldType="BaseSelect"
              label="收款账户"
              descriptionField="accountNo"
              fieldKey="accountNo"
              descList={accountList}
              disabled={currentNode !== 'create' && currentNode !== 'applyEdit'}
              required
              onChange={(value, option, allOptions) => {
                const { bankName, holderName, bankBranch } = option[0];
                this.callModelEffects('updateForm', { bankName, holderName, bankBranch });
              }}
            />

            <FormItem
              fieldType="BaseSelect"
              label="支付币种"
              fieldKey="paymentCurrency"
              parentKey="COMMON_CURRENCY"
              disabled
            />

            <FormItem fieldType="BaseInput" label="户名" fieldKey="holderName" disabled />

            <FormItem fieldType="BaseInput" label="收款银行" fieldKey="bankName" disabled />

            <FormItem fieldType="BaseInput" label="收款银行网点" fieldKey="bankBranch" disabled />
          </BusinessForm>
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default OtherPaymentDisplay;
