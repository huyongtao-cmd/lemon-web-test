import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit, clone } from 'ramda';
import { Form, Tooltip, Icon, Table } from 'antd';
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
const DOMAIN = 'welfareExpenseDisplay';
const TOTAL_ROW_ID = 'TOTAL';
const procKey = 'COS03';

/**
 * 福利费报销 综合展示页面
 */
@connect(({ loading, dispatch, welfareExpenseDisplay, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...welfareExpenseDisplay,
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
        if (formData.chargeClassification === 'DAILY' && !formData.chargeBuId) {
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
class WelfareExpenseDisplay extends React.PureComponent {
  state = {
    visible: false,
  };

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

    // 根据客户要求 :默认绑定人事部,先应急解决初始化设置为空,方式用户填的比较快 输入错误.
    // this.callModelEffects('updateForm', { id, chargeBuId: extInfo.baseBuId });
    this.callModelEffects('updateForm', { id, chargeBuId: undefined });
    this.callModelEffects('init').then(data => {
      if (data.id) {
        this.callModelEffects('fetchBusinessAccItem', {
          docType: data.expenseDocType || formData.expenseDocType,
          buId: data.chargeBuId || extInfo.baseBuId,
          projType: data.chargeClassification || formData.chargeClassification,
        });
      }
      taskId &&
        this.callModelEffects('fetchConfig', taskId).then(res => {
          this.callModelEffects('fetchFinancialAccSubjListLow').then(listRes => {
            const tt = listRes.filter(v => v.accCode === '224103')[0] || {};
            const { taskKey } = res;
            if (taskKey === 'COS03_03_AUDITING') {
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
      this.callModelEffects('fetchInternalOuList');
      // 根据用户需求，不要一点福利费报销就提示“科目模板不存在，请联系管理员”，所以此处调整为，默认不查询科目模板，选择费用承担部门后在查询科目模板；
      // this.callModelEffects('fetchBusinessAccItem', {
      //   docType: data.expenseDocType || formData.expenseDocType,
      //   buId: data.chargeBuId || extInfo.baseBuId,
      //   projType: data.chargeClassification || formData.chargeClassification,
      // });
      taskId && this.callModelEffects('fetchConfig', taskId);
      this.callModelEffects('fetchAccountList', { abNo: extInfo.abNo, accStatus: 'ACTIVE' });
    });
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchBudgetList');
    this.callModelEffects('fetchFinancialAccSubjList');
    this.callModelEffects('fetchFinancialAccSubjListLow');
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

    // if (details.length > 1) {
    //   const fristRow = details[0];
    //   const { busAccItemId, expenseDate } = fristRow;
    //   const month = expenseDate.slice(0, 6);
    //   // eslint-disable-next-line no-plusplus
    //   for (let i = 1; i < details.length; i++) {
    //     const OtherMonth = details[i].expenseDate.slice(0, 6);
    //     if (details[i].busAccItemId === busAccItemId && OtherMonth === month) {
    //       createMessage({
    //         type: 'error',
    //         description: '福利费报销每人每月每个核算项目只能报销一次!',
    //       });
    //       return;
    //     }
    //   }
    // }

    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 费用明细不能为空业务检查
        if (!details || details.length < 1) {
          createMessage({ type: 'error', description: '请填写至少一条费用明细!' });
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

    // if (details.length > 1) {
    //   const fristRow = details[0];
    //   const { busAccItemId, expenseDate } = fristRow;
    //   const month = expenseDate.slice(0, 6);
    //   // eslint-disable-next-line no-plusplus
    //   for (let i = 1; i < details.length; i++) {
    //     const OtherMonth = details[i].expenseDate.slice(0, 6);
    //     if (details[i].busAccItemId === busAccItemId && OtherMonth === month) {
    //       createMessage({
    //         type: 'error',
    //         description: '福利费报销每人每月每个核算项目只能报销一次!',
    //       });
    //       return;
    //     }
    //   }
    // }

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

  // bu或者单据类型变化
  // onBuOrDocTypeChange = (docType,buId) => {
  //   const {expenseDocType,chargeProjectId} = this.props;
  //   if(docType !== expenseDocType || buId !== chargeProjectId){
  //     this.callModelEffects('fetchBusinessAccItem',{docType,buId});
  //   }
  // };

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
        // originalCurrencyAmt,
        // baseCurrencyAmt,
        // paymentAmt: baseCurrencyAmt,
        originalCurrencyAmt: parseFloat(originalCurrencyAmt.toFixed(2)),
        baseCurrencyAmt: parseFloat(baseCurrencyAmt.toFixed(2)),
        paymentAmt: parseFloat(baseCurrencyAmt.toFixed(2)),
      });
    }
  };

  handleModelOk = (selectedInvos = []) => {
    const { dispatch, formData } = this.props;
    const { details = [], exchangeRate = 0 } = formData;

    const { detailsIndex } = this.state;
    const arr = new Array(detailsIndex + 1);
    arr[detailsIndex] = {
      invoiceList: selectedInvos, // 發票列表
      invIdList: selectedInvos.map(v => v.id), // 發票列表ID
      // claimAmt: selectedInvos.map(v => v.amountTax || 0).reduce((x, y) => add(x, y), 0), // 报销金额默认等于发票总金额
      finAccSubjId2: selectedInvos.map(v => v.invoiceNo).join(','), // 发票号
      invoiceNum: selectedInvos.length || 0, // 发票张数
      amtExcludingTax: selectedInvos.map(v => v.totalAmount || 0).reduce((x, y) => add(x, y), 0), // 不含税金额
      taxAmt: selectedInvos.map(v => v.totalTax || 0).reduce((x, y) => add(x, y), 0), // 税额
      amtIncludingTax: selectedInvos.map(v => v.amountTax || 0).reduce((x, y) => add(x, y), 0), // 含税金额
      deductTaxAmt: selectedInvos.map(v => v.deductTax || 0).reduce((x, y) => add(x, y), 0), //可抵扣稅額
      detailAppropriationAmt: Array.from(
        new Set(
          selectedInvos
            .map(v => v.errRules)
            .join(', ')
            .split(', ')
        )
      ),
    };

    dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: {
        details: arr,
      },
    });

    // 更新原币金额和本币金额
    // const othersDetails = details.filter((v, i) => i !== detailsIndex);
    // const tt = add(
    //   flatten(othersDetails.map(v => (Array.isArray(v.invoiceList) ? v.invoiceList : [])))
    //     .map(v => v.amountTax || 0)
    //     .reduce((x, y) => add(x, y), 0),
    //   selectedInvos.map(v => v.amountTax || 0).reduce((x, y) => add(x, y), 0)
    // );
    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     originalCurrencyAmt: tt, // 更新原币金额
    //     baseCurrencyAmt: mul(tt, exchangeRate), // 更新本币金额
    //   },
    // });
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
        details: arr,
      },
    });
  };

  toggleVisible = () => {
    this.setState({
      visible: false,
    });
  };

  detailEntityTable = (record, index, indent, expanded) => {
    const { invoiceList } = record;
    // 合计行不展开内容
    if (record.id === TOTAL_ROW_ID || !Array.isArray(invoiceList) || isEmpty(invoiceList)) {
      return null;
    }
    const columns = [
      {
        title: '发票号码',
        dataIndex: 'invoiceNo',
        align: 'center',
      },
      {
        title: '开票日期',
        dataIndex: 'invoiceDate',
        align: 'center',
      },
      {
        title: '发票类型',
        dataIndex: 'invTypeDesc',
        align: 'center',
        render: (value, row, i) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={value}>
              <pre>{`${value.substr(0, 15)}...`}</pre>
            </Tooltip>
          ) : (
            <pre>{value}</pre>
          ),
      },
      {
        title: '发票金额',
        key: 'amountTax',
        dataIndex: 'amountTax',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '已核销金额',
        key: 'writtenOffAmt',
        dataIndex: 'writtenOffAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '归属人',
        dataIndex: 'invOwnerName',
        align: 'center',
      },
    ];

    return (
      <Table
        rowKey="id"
        style={{ marginLeft: '-8px' }}
        columns={columns}
        dataSource={record.invoiceList}
        pagination={false}
        // rowSelection={rowSelection}
      />
    );
  };

  render() {
    const {
      form,
      dispatch,
      formData,
      formMode,
      currentNode,
      budgetTypeList,
      internalOuList,
      businessAccItemList,
      budgetList,
      financialAccSubjList,
      financialAccSubjListLow,
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
    const { userId, resName } = extInfo;

    const { visible, selectedInvos = [], detailsId } = this.state;
    const { taskKey } = fieldsConfig;
    const diabledView = taskKey === 'COS03_03_AUDITING';

    // 处理申请人修改节点的按钮
    let wrappedFieldsConfig = fieldsConfig;
    if (fieldsConfig && fieldsConfig.taskKey === 'COS03_03_AUDITING') {
      wrappedFieldsConfig = clone(fieldsConfig);
      wrappedFieldsConfig.buttons.push({
        type: 'button',
        key: 'FLOW_PASS',
        title: '申请人修改',
        className: 'tw-btn-primary',
        branches: [
          {
            id: 1,
            code: 'APPLY_RES_UPDATE',
            name: '申请人修改',
          },
        ],
      });
    }
    const busAccItemClearWarnFlag = formData.details.length > 0;

    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: procKey, title: '福利费报销流程' }];

    const { details } = formData;

    const editColumns = [
      {
        title: '日期',
        dataIndex: 'expenseDate',
        required: true,
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            text
          ) : (
            <FormItem
              form={form}
              fieldType="BaseDatePicker"
              required
              fieldKey={`details[${index}].expenseDate`}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
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
                    deductTaxRate: option[0].configurableField1,
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
              required
              parentSelectAble={false}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
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
        title: '报销说明',
        dataIndex: 'expenseRemark',
        required: true,
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseInputTextArea"
              required
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
              fieldKey={`details[${index}].expenseRemark`}
            />
          ),
      },
      {
        title: '报销金额',
        dataIndex: 'claimAmt',
        required: true,
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              required
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].claimAmt`}
              disabled={currentNode !== 'create' && currentNode !== 'advanceEdit'}
              // onChange={value => {
              //   const changeAmt = value - (record.claimAmt || 0);
              //   this.handleChangeAmt(changeAmt);
              // }}
            />
          ),
      },
      {
        title: '规则检查说明',
        dataIndex: 'detailAppropriationAmt',
      },
      {
        title: '关联发票',
        dataIndex: 'finAccSubjId2',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseInput"
              fieldKey={`details[${index}].finAccSubjId2`}
              // disabled={
              //   currentNode !== 'create' &&
              //   currentNode !== 'applyEdit' &&
              //   currentNode !== 'advanceEdit'
              // }
              disabled
              descList={[]}
              addonAfter={
                <a
                  className="tw-link-primary"
                  onClick={() => {
                    const { invoiceList = [] } = record;
                    this.setState(
                      {
                        detailsIndex: index,
                        selectedInvos: Array.isArray(invoiceList) ? invoiceList : [],
                        detailsId: record.id,
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
        title: '含税金额',
        dataIndex: 'amtIncludingTax',
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].amtIncludingTax`}
              disabled={
                (currentNode !== 'create' &&
                  currentNode !== 'applyEdit' &&
                  currentNode !== 'advanceEdit') ||
                (Array.isArray(record.invoiceList) && !!record.invoiceList.length)
              }
            />
          ),
      },
      {
        title: '不含税金额',
        dataIndex: 'amtExcludingTax',
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].amtExcludingTax`}
              disabled={
                (currentNode !== 'create' &&
                  currentNode !== 'applyEdit' &&
                  currentNode !== 'advanceEdit') ||
                (Array.isArray(record.invoiceList) && !!record.invoiceList.length)
              }
            />
          ),
      },
      {
        title: '税额',
        dataIndex: 'taxAmt',
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].taxAmt`}
              disabled={
                (currentNode !== 'create' &&
                  currentNode !== 'applyEdit' &&
                  currentNode !== 'advanceEdit') ||
                (Array.isArray(record.invoiceList) && !!record.invoiceList.length)
              }
            />
          ),
      },
      {
        title: '可抵扣税率',
        dataIndex: 'deductTaxRate',
        render: (text, record, index) =>
          record.id !== TOTAL_ROW_ID && (
            <FormItem
              form={form}
              fieldType="BaseCustomSelect"
              parentKey="CUS:DEDUCT_TAX_RATE"
              fieldKey={`details[${index}].deductTaxRate`}
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
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
        width: '150px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputAmt value={text} disabled />
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputAmt"
              fieldKey={`details[${index}].deductTaxAmt`}
              // disabled={
              //   currentNode !== 'create' &&
              //   currentNode !== 'applyEdit' &&
              //   currentNode !== 'advanceEdit'
              // }
              disabled
            />
          ),
      },
      {
        title: '发票张数',
        dataIndex: 'invoiceNum',
        width: '120px',
        render: (text, record, index) =>
          record.id === TOTAL_ROW_ID ? (
            <BaseInputNumber value={text} disabled />
          ) : (
            <FormItem
              form={form}
              fieldType="BaseInputNumber"
              fieldKey={`details[${index}].invoiceNum`}
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
        title: '日期',
        dataIndex: 'expenseDate',
        width: '150px',
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
        title: '报销说明',
        dataIndex: 'expenseRemark',
      },
      {
        title: '报销金额',
        dataIndex: 'claimAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '规则检查说明',
        dataIndex: 'detailAppropriationAmt',
      },
      {
        title: '关联发票',
        dataIndex: 'finAccSubjId2',
      },
      {
        title: '含税金额',
        dataIndex: 'amtIncludingTax',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '不含税金额',
        dataIndex: 'amtExcludingTax',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '税额',
        dataIndex: 'taxAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '可抵扣税率',
        dataIndex: 'deductTaxRate',
      },
      {
        title: '可抵扣税额',
        dataIndex: 'deductTaxAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '发票张数',
        dataIndex: 'invoiceNum',
      },
    ];
    /* eslint-disable no-nested-ternary */
    const sumClaimAmt = details
      .map(item => item.claimAmt)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    const sumAmtIncludingTax = details
      .map(item => item.amtIncludingTax)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    const sumAmtExcludingTax = details
      .map(item => item.amtExcludingTax)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    const sumTaxAmt = details
      .map(item => item.taxAmt)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    const sumDeductTaxAmt = details
      .map(item => item.deductTaxAmt)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    const sumInvoiceNum = details
      .map(item => item.invoiceNum)
      .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
    /* eslint-enable no-nested-ternary */
    const sumRow = {
      id: TOTAL_ROW_ID,
      expenseDate: '合计',
      claimAmt: sumClaimAmt,
      amtIncludingTax: sumAmtIncludingTax,
      amtExcludingTax: sumAmtExcludingTax,
      taxAmt: sumTaxAmt,
      deductTaxAmt: sumDeductTaxAmt,
      invoiceNum: sumInvoiceNum,
    };
    const sumWrappedDetails = details.concat(sumRow);

    const detailOperation =
      currentNode !== 'create' && currentNode !== 'advanceEdit'
        ? {}
        : {
            onAddClick: () => {
              if (formData.relatedBudgetId) {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    details: update(details, {
                      $push: [
                        {
                          id: genFakeId(-1),
                          claimAmt: 0,
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
                .map(item => item.claimAmt)
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
                .map(item => item.claimAmt)
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
        <InvoiceModalPro
          title="选择发票"
          visible={visible} // 控制显示和关闭
          onOk={this.handleModelOk} // 点击确认回调,返回选中的发票信息
          onCancel={this.toggleVisible} // 点击返回关闭
          selectedInvos={selectedInvos} // 本条数据已经选择的发票(用于展开弹窗回显)
          reimUserId={formData.expenseClaimUserId || userId} // 报销人userId
          reimDetailId={detailsId} // 当前明细关联的发票也要查出来
          extraAlreadySelectedIds={flatten(
            sumWrappedDetails
              .filter(v => !isEmpty(v) && v.id !== TOTAL_ROW_ID)
              .map(v => (Array.isArray(v.invoiceList) ? v.invoiceList : []))
          )
            .map(v => v.id)
            .filter(v => !selectedInvos.map(item => item.id).includes(v))} // 其他数据已经选择的发票，本条数据弹窗不显示
          extraQuery={{}} // 其他筛选条件(前提是后端支持)
          docType="1" // 1 報銷，2采購
          disabled={
            currentNode !== 'create' && currentNode !== 'applyEdit' && currentNode !== 'advanceEdit' // 发票弹窗内不可选择发票的条件
          }
          checkedParmars={formData.chargeCompanyDesc || resName} // 费用承担公司/报销主体->用于规则校验
        />
        <BpmWrapper
          fieldsConfig={wrappedFieldsConfig}
          flowForm={flowForm}
          buttonLoading={saveLoading}
          scope={procKey}
          // extraButtons={
          //   <Tooltip title="打印">
          //     <Button
          //       className={classnames('tw-btn-default', 'stand')}
          //       type="dashed"
          //       icon="printer"
          //       size="large"
          //     />
          //   </Tooltip>
          // }
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            //const { taskKey } = fieldsConfig;
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
            if (key === 'APPLY_RES_UPDATE') {
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
            if (
              currentNode === 'create' ||
              currentNode === 'financeEdit' ||
              currentNode === 'applyEdit'
            ) {
              if (taskKey === 'COS03_03_AUDITING' && key === 'FLOW_PASS') {
                if (!formData.finAccSubjId) {
                  createMessage({ type: 'error', description: '请编辑会计科目！' });
                  return Promise.resolve(false);
                }
              }
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
              formData.expenseClaimCtatus === 'CREATE' && (
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
            <FormItem fieldType="BaseInput" label="报销单号" fieldKey="expenseNo" disabled />

            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              parentKey="CUS:CHARGE_CLASSIFICATION"
              options={budgetTypeList}
              required
              disabled
              onChange={(value, option) => {
                this.callModelEffects('updateForm', {
                  chargeProjectId: undefined,
                });
                this.callModelEffects('fetchBusinessAccItem', {
                  docType: formData.expenseDocType,
                  buId: formData.chargeBuId,
                  projType: value,
                });
                this.callModelEffects('clearAllBusAccItem');
              }}
            />

            <FormItem
              fieldType="ResSimpleSelect"
              label="报销人"
              fieldKey="expenseClaimResId"
              descriptionField="expenseClaimResName"
              initialValue={extInfo.resId}
              required
              disabled={currentNode !== 'create'}
              descList={[{ value: extInfo.resId, title: extInfo.resName }]}
              onChange={(value, option) => {
                if (option.length > 0) {
                  this.callModelEffects('updateForm', {
                    expenseClaimResBuId: option[0].baseBuId,
                    expenseClaimResGrade: option[0].jobGrade,
                    expenseClaimUserId: option[0].userId,
                  });
                  this.callModelEffects('fetchAccountList', {
                    abNo: option[0].abNo,
                    accStatus: 'ACTIVE',
                    flag: true,
                  });
                } else {
                  this.callModelEffects('updateForm', {
                    expenseClaimResBuId: undefined,
                    expenseClaimResGrade: undefined,
                    expenseClaimUserId: undefined,
                    holderName: undefined,
                    accountNo: undefined,
                    bankName: undefined,
                    bankBranch: undefined,
                  });
                }
              }}
            />

            <FormItem
              fieldType="BuSimpleSelect"
              label="报销人部门"
              fieldKey="expenseClaimResBuId"
              descriptionField="expenseClaimResBuName"
              disabled
              initialValue={extInfo.baseBuId}
              descList={[{ value: extInfo.baseBuId, title: extInfo.baseBuName }]}
            />

            <FormItem
              fieldType="BaseCustomSelect"
              label="单据类型"
              fieldKey="expenseDocType"
              parentKey="CUS:EXPENSE_DOC_TYPE"
              disabled
              required
            />

            <FormItem
              fieldType="BaseSelect"
              label="相关申请单"
              fieldKey="relatedDocId"
              required={formData.expenseDocType === 'TRIP'}
              disabled={formData.expenseDocType !== 'TRIP' || currentNode !== 'create'}
              descList={[{ value: formData.relatedDocId, title: formData.relatedDocName }]}
            />

            <FormItem
              fieldType="ProjectSimpleSelect"
              label="费用承担项目"
              fieldKey="chargeProjectId"
              queryParam={{
                myProjectResId: formData.expenseClaimResId,
                myProjectUserId: formData.expenseClaimUserId,
                projectClass1: formData.chargeClassification,
                projectStatus: 'ACTIVE',
              }}
              required={formData.chargeClassification !== 'DAILY'}
              disabled={formData.chargeClassification === 'DAILY' || currentNode !== 'create'}
              onChange={(value, option) => {
                if (option.length > 0) {
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
                            docType: formData.expenseDocType,
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
                        docType: formData.expenseDocType,
                        butmplType: buTypeTemp,
                        projType: formData.chargeClassification,
                      });
                      this.callModelEffects('updateForm', {
                        chargeBuId: option[0].inchargeBuId,
                        chargeCompany: option[0].inchargeCompany,
                      });
                    }
                  }
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
                  this.callModelEffects('setBudget', {
                    chargeProjectId: formData.chargeProjectId,
                    chargeBuId: option[0].id,
                    budgetStatus: 'ACTIVE',
                    chargeClassification: formData.chargeClassification,
                  });
                  const buTypeTemp = option[0].buType;
                  const ouList = internalOuList.filter(
                    item => item.extVarchar1 === option[0].ouAbNo
                  );
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
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
                            docType: formData.expenseDocType,
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
                        relatedBudgetId: undefined,
                      });
                      this.callModelEffects('fetchBusinessAccItem', {
                        docType: formData.expenseDocType,
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
              descList={internalOuList}
              onChange={(value, option) => {
                if (value) {
                  const { title } = option[0];
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      chargeCompanyDesc: title,
                    },
                  });
                  if (!isEmpty(details)) {
                    details.forEach((key, index) => {
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
                        v.detailAppropriationAmt = Array.from(
                          new Set(
                            v.invoiceList
                              .map(i => i.errRules)
                              .join(', ')
                              .split(', ')
                          )
                        );
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
              fieldType="BudgetSimpleSelect"
              label="相关预算"
              fieldKey="relatedBudgetId"
              required
              queryParam={{
                chargeBuId: formData.chargeBuId,
                chargeProjectId: formData.chargeProjectId,
                budgetStatus: 'ACTIVE',
                chargeClassification: formData.chargeClassification,
              }}
              disabled={currentNode !== 'create'}
              descList={[{ value: formData.relatedBudgetId, title: formData.relatedBudgetIdDesc }]}
            />

            <FormItem
              fieldType="BaseSwitch"
              label="外币业务"
              fieldKey="foreignCurrencyFlag"
              descriptionField="foreignCurrencyFlagDesc"
              // parentKey="COMMON:YES-OR-NO"
              required
              disabled={currentNode !== 'create'}
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
              disabled={currentNode !== 'create'}
            >
              <FormItem
                fieldType="BaseSelect"
                fieldKey="originalCurrency"
                parentKey="COMMON_CURRENCY"
                required={formData.foreignCurrencyFlag}
                disabled={currentNode !== 'create'}
                descList={[
                  { value: formData.originalCurrency, title: formData.originalCurrencyDesc },
                ]}
              />
              <FormItem
                fieldType="BaseInputAmt"
                fieldKey="exchangeRate"
                placeholder="请输入汇率"
                required={formData.foreignCurrencyFlag}
                disabled={currentNode !== 'create'}
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
              api="/api/production/cos/expenseClaim/sfs/token"
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
              fieldType="BaseDatePicker"
              label="记账日期"
              fieldKey="accountingDate"
              required={currentNode === 'financeEdit'}
              disabled={currentNode !== 'financeEdit'}
            />

            <FormItem
              fieldType="BaseSelect"
              label="状态"
              fieldKey="expenseClaimStatus"
              parentKey="COS:EXPENSE_CLAIM_STATUS"
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
              fieldType="BaseSelect"
              label="创建人"
              fieldKey="createUserId"
              descriptionField="createUserName"
              initialValue={formData.id ? formData.createUserId : extInfo.userId}
              disabled
              descList={[
                { value: extInfo.userId, title: extInfo.resName },
                { value: formData.createUserId, title: formData.createUserName },
              ]}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="创建日期"
              fieldKey="createTime"
              disabled
              initialValue={moment().format('YYYY-MM-DD')}
            />

            <FormItem
              fieldType="BaseInput"
              label="报销人职级"
              fieldKey="expenseClaimResGrade"
              disabled
              initialValue={extInfo.jobGrade}
              style={{ display: 'none' }}
            />

            <FormItem
              fieldType="BaseInputTextArea"
              label="报销说明"
              fieldKey="remark"
              disabled={
                currentNode !== 'create' &&
                currentNode !== 'applyEdit' &&
                currentNode !== 'advanceEdit'
              }
            />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="费用明细"
              form={form}
              columns={editColumns}
              dataSource={sumWrappedDetails}
              rowSelectAble={false}
              getCheckboxProps={record => ({
                disabled: record.id === TOTAL_ROW_ID,
              })}
              scroll={{ x: 2400 }}
              {...detailOperation}
              expandedRowRender={this.detailEntityTable}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="费用明细"
              columns={descriptionColumns}
              dataSource={sumWrappedDetails}
              prodSelection={false}
              onExpand={this.onExpand}
              expandedRowRender={this.detailEntityTable}
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
              required
              disabled={currentNode !== 'create' && currentNode !== 'applyEdit'}
            />

            <FormItem
              fieldType="BaseSelect"
              label="收款账户"
              descriptionField="accountNo"
              fieldKey="accountNo"
              descList={accountList}
              required
              disabled={currentNode !== 'create' && currentNode !== 'applyEdit'}
              onChange={(value, option, allOptions) => {
                const { bankName, holderName, bankBranch } = option[0];
                this.callModelEffects('updateForm', { bankName, holderName, bankBranch });
              }}
            />

            <FormItem label="支付金额" fieldType="Group">
              <FormItem fieldType="BaseInputAmt" label="支付金额" fieldKey="paymentAmt" disabled />

              <FormItem
                fieldType="BaseSelect"
                label="支付币种"
                fieldKey="paymentCurrency"
                parentKey="COMMON_CURRENCY"
                disabled
              />
            </FormItem>

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

export default WelfareExpenseDisplay;
