import React, { PureComponent } from 'react';
import { connect } from 'dva';
import update from 'immutability-helper';
import { Card, Button, Tooltip, Row, Form, Input, DatePicker, Cascader } from 'antd';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, isNil, clone } from 'ramda';
import moment from 'moment';
import api from '@/api';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import { genFakeId, add } from '@/utils/mathUtils';
import { createConfirm } from '@/components/core/Confirm';
import { flatten } from '@/utils/arrayUtils';
import { request } from '@/utils/networkUtils';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { mountToTab, markAsTab, closeThenGoto } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import FieldList from '@/components/layout/FieldList';

const DOMAIN = 'invBatchDetail';
const TASK_FLOW_POINT = 'ACC_A05_01_CONTRACT_INV_SUBMIT_i';
const TASK_FLOW_CONFIRM = 'ACC_A05_02_FIN_CONFIRM';
const TASK_FLOW_CONFIRM_B = 'ACC_A05_03_INITOR_CONFIRM_b';
const { doTask } = api.bpm;
const { approveRetTicket } = api.user.contract;
const { Description } = DescriptionList;
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 10 },
};

@connect(({ loading, dispatch, invBatchDetail }) => ({
  loading,
  dispatch,
  invBatchDetail,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;
      // antD 时间组件返回的是moment对象 转成字符串提交
      if (typeof value === 'object' && name !== 'invoiceItem') {
        val = formatDT(value);
      } else {
        val = value;
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class InvBatchDetail extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      invBatchDetail: { formData, recvPlanList },
    } = this.props;
    const { id, taskId } = fromQs();
    taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id },
    });
    dispatch({
      type: `${DOMAIN}/getInvoiceItemList`,
    });
    let invAmt = 0;
    recvPlanList.map(v => {
      invAmt = add(invAmt, v.unRecvAmt || 0);
      return void 0;
    });
    formData.invAmt = invAmt;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          invAmt,
        },
      },
    });
  }

  handleConfirm = () => {
    // TO DO
  };
  handleFinish = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll, getFieldValue },
      invBatchDetail: {
        dtlList,
        recvPlanList,
        formData: { invAmt },
      },
    } = this.props;
    let total = 0;
    let totalAmt = 0;
    recvPlanList.map(v => {
      // total += v.recvAmt;
      total = add(total, v.recvAmt || 0);
      return void 0;
    });
    dtlList.map(v => {
      // totalAmt += +v.invAmt;
      totalAmt = add(totalAmt, v.invAmt || 0);
      return void 0;
    });

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (totalAmt === invAmt) {
          const { taskId, remark, ids } = fromQs();
          const isEdit = isNil(ids);
          //  当合同开票申请被拒绝时 申请人的入口只能从首页 我的待办 入口进入 因此会带上taskId isReEdit 用来标示  false  带上id url上的id true 忽略
          const isReEdit = isNil(taskId);
          dispatch({
            type: `${DOMAIN}/save1`,
            payload: {
              invAmt: getFieldValue('invAmt'),
              submitted: false,
              isEdit,
              isReEdit,
            },
          }).then(resp => {
            if (resp.success) {
              dispatch({
                type: `${DOMAIN}/finish`,
              });
            } else if (!resp.success) {
              createMessage({ type: 'error', description: resp.message });
            }
          });
        } else {
          createMessage({ type: 'warn', description: '开票金额的总额必须等于批次开票金额' });
        }
      }
    });
  };

  handleCancel = () => {
    const { from } = fromQs();
    from ? closeThenGoto(from) : closeThenGoto('/plat/saleRece/invBatch/list');
  };

  handleChange = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      invBatchDetail: { dtlList, formData },
    } = this.props;
    let value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'deliveryDate') {
      value = formatDT(rowFieldValue);
    } else if (rowField === 'invAmt') {
      // 开票金额
      dtlList[rowIndex].invAmt = value;
      // 净额
      dtlList[rowIndex].netAmt = (value / (1 + +formData.taxRate / 100)).toFixed(2);
      // 税金
      dtlList[rowIndex].taxAmt = (
        value - (value / (1 + +formData.taxRate / 100)).toFixed(2)
      ).toFixed(2);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dtlList },
      });
      return;
    }
    const newDataList = update(dtlList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dtlList: newDataList } });
  };

  render() {
    const {
      invBatchDetail: {
        formData,
        recvPlanList,
        dtlList,
        delList,
        flowForm,
        fieldsConfig: config,
        invoiceItemChildrenList,
        invoiceItemList,
      },
      dispatch,
      loading,
      form: { getFieldDecorator },
    } = this.props;

    const { id, taskId, from, mode } = fromQs();
    let fieldsConfig = {};
    const { taskKey } = config;
    const enableSelectionFlag =
      taskKey === 'ACC_A34_02_FIN_CONFIRM' && formData.apprStatus === 'APPROVING';
    const A05disabled = taskKey === 'ACC_A05_03_INVOICE_CONFIRM';
    const procNosFlag =
      !isEmpty(formData.procNos) &&
      !isNil(formData.procNos) &&
      formData.procNos.some(item => item.slice(0, 3) === 'A34');

    if (!isEmpty(config)) {
      if (
        taskKey === TASK_FLOW_POINT &&
        (formData.apprStatus === 'NOTSUBMIT' ||
          formData.apprStatus === 'REJECTED' ||
          formData.apprStatus === 'WITHDRAW')
      ) {
        fieldsConfig = config;
      }
      if (
        taskKey === TASK_FLOW_CONFIRM &&
        (formData.apprStatus === 'APPROVING' || formData.apprStatus === 'REJECTED')
      ) {
        fieldsConfig = config;
      }
      if (taskKey === TASK_FLOW_CONFIRM_B && formData.apprStatus === 'APPROVING') {
        fieldsConfig = config;
      }
      // 退票审批节点
      if (taskKey === 'ACC_A34_02_FIN_CONFIRM' && formData.apprStatus === 'APPROVING') {
        fieldsConfig = config;
      }

      if (taskKey === 'ACC_A34_01_CONTRACT_INV_SUBMIT_i') {
        fieldsConfig = config;
      }

      if (taskKey === 'ACC_A05_03_INVOICE_CONFIRM' || taskKey === 'ACC_A05_04_INITOR_CONFIRM_b') {
        fieldsConfig = config;
      }
    }
    console.warn(formData);
    const btnHideFlag = isEmpty(fieldsConfig);
    const recvPlanTableProps = {
      columnsCache: `${DOMAIN}-recvPlanTableProps`,
      dispatch,
      rowKey: 'id',
      showSearch: false,
      enableSelection: false,
      pagination: false,
      scroll: { x: '150%' },
      dataSource: recvPlanList,
      columns: [
        {
          title: '客户名',
          dataIndex: 'custName',
          render: (value, row, index) => (
            <Link className="tw-link" to={`/plat/addr/view?no=${row.abNo}&from=${getUrl()}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
        },
        {
          title: '子合同号',
          dataIndex: 'contractNo',
          align: 'center',
        },
        {
          title: '子合同名称',
          dataIndex: 'contractName',
          align: 'center',
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          align: 'center',
        },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          align: 'center',
          sorter: true,
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          align: 'center',
        },
        {
          title: '当期收款金额',
          dataIndex: 'recvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '当期收款比例 %',
          dataIndex: 'recvRatio',
          align: 'center',
          sorter: true,
          render: value => `${value * 100}`,
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatusDesc',
          align: 'center',
          sorter: true,
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          align: 'center',
          sorter: true,
        },
        {
          title: '开票日期',
          dataIndex: 'invDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '未开票金额',
          dataIndex: 'unInvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          align: 'center',
        },
      ],
    };
    // const { taskKey } = config;
    const invBatchTableProps = {
      columnsCache: `${DOMAIN}-invBatchTableProps`,
      dispatch,
      rowKey: 'id',
      showSearch: false,
      enableSelection: !enableSelectionFlag,
      dataSource: dtlList,
      pagination: false,
      leftButtons: [
        {
          key: 'add',
          title: '添加',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden:
            btnHideFlag ||
            taskKey === 'ACC_A05_02_FIN_CONFIRM' ||
            taskKey === 'ACC_A05_01_CONTRACT_INV_SUBMIT_i' ||
            taskKey === 'ACC_A05_04_INITOR_CONFIRM_b',
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dtlList: update(dtlList, {
                  $push: [
                    {
                      id: genFakeId(-1),
                      invNo: null,
                      deliveryNo: null,
                      deliveryDate: new Date(),
                      invAmt: null,
                      netAmt: null,
                      taxAmt: null,
                    },
                  ],
                }),
              },
            });
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'form',
          loading: false,
          hidden:
            btnHideFlag ||
            taskKey === 'ACC_A05_02_FIN_CONFIRM' ||
            taskKey === 'ACC_A05_01_CONTRACT_INV_SUBMIT_i' ||
            taskKey === 'ACC_A05_04_INITOR_CONFIRM_b',
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确定要删除这些发票吗?',
              onOk: () => {
                const delArr = [];
                selectedRowKeys.map(v => v > 0 && delArr.push(v));
                const newDataList = dtlList.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    dtlList: newDataList,
                    delList: delArr,
                  },
                });
              },
            });
          },
        },
      ],
      columns: [
        {
          title: '发票状态类型',
          dataIndex: 'invStatus',
          align: 'center',
          required: true,
          width: '140px',
          render: (value, row, index) => (
            <Selection.UDC
              className="tw-field-group-field"
              code="ACC:INV_STATUS"
              style={{ width: 140 }}
              value={value}
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              onChange={this.handleChange(index, 'invStatus')}
            />
          ),
        },

        {
          title: '发票号',
          dataIndex: 'invNo',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              onChange={this.handleChange(index, 'invNo')}
            />
          ),
        },
        {
          title: '快递号',
          dataIndex: 'deliveryNo',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              onChange={this.handleChange(index, 'deliveryNo')}
            />
          ),
        },
        {
          title: '快递时间',
          dataIndex: 'deliveryDate',
          align: 'center',
          render: (value, row, index) => (
            <DatePicker
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value ? moment(value) : null}
              onChange={this.handleChange(index, 'deliveryDate')}
            />
          ),
        },
        {
          title: '开票金额',
          dataIndex: 'invAmt',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              onChange={this.handleChange(index, 'invAmt')}
            />
          ),
        },
        {
          title: '净额',
          dataIndex: 'netAmt',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              value={value}
              onChange={this.handleChange(index, 'netAmt')}
            />
          ),
        },
        {
          title: '税金',
          dataIndex: 'taxAmt',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              value={value}
              onChange={this.handleChange(index, 'taxAmt')}
            />
          ),
        },
        {
          title: '下载链接',
          dataIndex: 'downloadUrl',
          align: 'center',
          render: (value, row, index) => (
            <Input
              disabled={
                (btnHideFlag || !enableSelectionFlag) && taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'
              }
              defaultValue={value}
              value={value}
              onChange={this.handleChange(index, 'downloadUrl')}
            />
          ),
        },
      ],
    };
    const buttonLoading =
      loading.effects[`${DOMAIN}/save`] ||
      loading.effects[`${DOMAIN}/reSubmit`] ||
      loading.effects[`${DOMAIN}/rollbackItems`] ||
      loading.effects[`${DOMAIN}/query`];
    return (
      <PageHeaderWrapper title="合同开票详情">
        <BpmWrapper
          buttonLoading={buttonLoading}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { key } = operation;
            // const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            // console.warn(operation);
            // 合同开票的第一个节点
            // return;
            if (taskKey === TASK_FLOW_POINT) {
              const currentUrl = getUrl();
              currentUrl.includes('invBatches')
                ? closeThenGoto(
                    `/sale/contract/invBatches/edit?id=${id}&taskId=${taskId}&remark=${remark}&from=/sale/contract/invBatches`
                  )
                : closeThenGoto(
                    `/plat/saleRece/invBatch/edit?id=${id}&taskId=${taskId}&remark=${remark}&from=/plat/saleRece/invBatch/list`
                  );
              return Promise.resolve(false);
            }

            // 第二节点对商品信息做必填检查
            if (taskKey === TASK_FLOW_CONFIRM) {
              const { invoiceItem } = formData;
              if (!invoiceItem || isEmpty(invoiceItem)) {
                createMessage({ type: 'warn', description: '商品信息必填！' });
                return Promise.resolve(false);
              }
              dispatch({
                type: `${DOMAIN}/save`,
                payload: {
                  submitted: false,
                  isReEdit: true,
                },
              }).then(resp => {
                if (resp.success) {
                  dispatch({
                    type: `${DOMAIN}/reSubmit`,
                    payload: { taskId, remark, result: key },
                  });
                } else createMessage({ type: 'warn', description: '开票申请失败' });
              });
              return Promise.resolve(false);
            }

            // 拒绝统一走架构
            if (operation.key === 'REJECTED') {
              return Promise.resolve(true);
            }
            // 合同开票的通过

            if (
              taskKey !== 'ACC_A34_01_CONTRACT_INV_SUBMIT_i' &&
              taskKey !== 'ACC_A34_02_FIN_CONFIRM' &&
              operation.key !== 'REJECTED'
            ) {
              if (taskKey === 'ACC_A05_03_INVOICE_CONFIRM') {
                const {
                  dispatch,
                  form: { validateFieldsAndScroll, getFieldValue },
                  invBatchDetail: {
                    dtlList,
                    recvPlanList,
                    formData: { invAmt },
                  },
                } = this.props;
                let total = 0;
                let totalAmt = 0;
                recvPlanList.map(v => {
                  // total += v.recvAmt;
                  total = add(total, v.recvAmt || 0);
                  return void 0;
                });
                dtlList.map(v => {
                  // totalAmt += +v.invAmt;
                  totalAmt = add(totalAmt, v.invAmt || 0);
                  return void 0;
                });

                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    if (totalAmt === invAmt) {
                      const { taskId, remark, ids } = fromQs();
                      const isEdit = isNil(ids);
                      //  当合同开票申请被拒绝时 申请人的入口只能从首页 我的待办 入口进入 因此会带上taskId isReEdit 用来标示  false  带上id url上的id true 忽略
                      const isReEdit = isNil(taskId);
                      dispatch({
                        type: `${DOMAIN}/save2`,
                        payload: {
                          invAmt: getFieldValue('invAmt'),
                          submitted: false,
                          isEdit,
                          isReEdit,
                        },
                      }).then(resp => {
                        if (resp.success) {
                          dispatch({
                            type: `${DOMAIN}/finish`,
                          }).then(res => {
                            console.warn('finish');

                            if (res && res.ok) {
                              console.warn('res');
                              const { branches } = operation;
                              const $obj = {};

                              if (isEmpty(branches) || isNil(branches)) {
                                $obj.remark = bpmForm.remark;
                                $obj.result = operation.key;
                              } else {
                                $obj.remark = bpmForm.remark;
                                $obj.result = operation.key;
                                $obj.branch = branches[0].code;
                              }
                              console.warn('request');

                              request
                                .post(toUrl(doTask, { id: taskId }), {
                                  body: {
                                    ...$obj,
                                  },
                                })
                                .then(({ status, response }) => {
                                  const { ok } = response;
                                  if (ok) {
                                    // change fileds status
                                    createMessage({
                                      type: 'success',
                                      description: formatMessage({
                                        id: `${operation.title}.sms`,
                                        desc: 'who care',
                                      }),
                                    });

                                    const url = getUrl().replace('edit', 'view');
                                    closeThenGoto(url);
                                  } else if (status === 100) {
                                    // 主动取消请求，不做操作
                                  } else {
                                    createMessage({ type: 'error', description: '流程审批失败' });
                                  }
                                });
                              return Promise.resolve(false);
                            }
                          });
                        } else if (!resp.success) {
                          createMessage({ type: 'error', description: resp.message });
                        }
                      });
                    } else {
                      createMessage({
                        type: 'warn',
                        description: '开票金额的总额必须等于批次开票金额',
                      });
                    }
                  }
                });
              } else {
                const { branches } = operation;
                const $obj = {};

                if (isEmpty(branches) || isNil(branches)) {
                  $obj.remark = bpmForm.remark;
                  $obj.result = operation.key;
                } else {
                  $obj.remark = bpmForm.remark;
                  $obj.result = operation.key;
                  $obj.branch = branches[0].code;
                }

                request
                  .post(toUrl(doTask, { id: taskId }), {
                    body: {
                      ...$obj,
                    },
                  })
                  .then(({ status, response }) => {
                    const { ok } = response;
                    if (ok) {
                      // change fileds status
                      createMessage({
                        type: 'success',
                        description: formatMessage({
                          id: `${operation.title}.sms`,
                          desc: 'who care',
                        }),
                      });
                      const currentUrl = getUrl();

                      if (currentUrl.includes('invBatches')) {
                        // isEmpty(branches) 区分是否是确认节点  true 审批节点  false  确认节点
                        if (isEmpty(branches) || isNil(branches)) {
                          closeThenGoto(
                            `/sale/contract/invBatches/edit?status=3&id=${id}&from=/sale/contract/invBatches`
                          );
                        } else {
                          closeThenGoto(
                            `/sale/contract/invBatches/detail?id=${id}&from=/sale/contract/invBatches`
                          );
                        }
                      } else {
                        // eslint-disable-next-line no-lonely-if
                        if (isEmpty(branches) || isNil(branches)) {
                          const url = getUrl().replace('edit', 'view');
                          closeThenGoto(url);
                        } else {
                          closeThenGoto(
                            `/plat/saleRece/invBatch/detail?id=${id}&from=/plat/saleRece/invBatch/list`
                          );
                        }
                      }
                    } else if (status === 100) {
                      // 主动取消请求，不做操作
                    } else {
                      createMessage({ type: 'error', description: '流程审批失败' });
                    }
                  });
                return Promise.resolve(false);
              }
            }
            // 合同退票的流程
            if (taskKey === 'ACC_A34_02_FIN_CONFIRM' && operation.key === 'APPROVED') {
              // 此处走 退票的审批流程
              const { prcId } = fromQs();
              const newFormData = clone(formData);

              // 处理商品信息字段
              if (
                Array.isArray(newFormData.invoiceItem) &&
                !isEmpty(newFormData.invoiceItem.filter(v => v))
              ) {
                const tt = flatten(invoiceItemList.map(v => v.children)).filter(
                  v =>
                    v.twGoodsCode === newFormData.invoiceItem[0] && v.id === formData.invoiceItem[1]
                );
                // eslint-disable-next-line prefer-destructuring
                newFormData.invoiceItem = tt[0];
              } else {
                newFormData.invoiceItem = null;
              }

              request
                .post(approveRetTicket, {
                  body: {
                    branch: undefined,
                    remark: bpmForm.remark,
                    result: operation.key,
                    invBatchEntity: { ...newFormData },
                    invdtlSaveEntity: {
                      entities: dtlList,
                      delList,
                    },
                    submitted: true,
                    taskId,
                    prcId,
                  },
                })
                .then(({ status, response }) => {
                  const { ok } = response;
                  if (ok) {
                    createMessage({
                      type: 'success',
                      description: formatMessage({
                        id: `${operation.title}.sms`,
                        desc: 'who care',
                      }),
                    });
                    // const currentUrl = getUrl();
                    closeThenGoto(`/user/flow/process`);
                  } else if (status === 100) {
                    // 主动取消请求，不做操作
                  } else {
                    createMessage({ type: 'error', description: '流程审批失败' });
                  }
                });
              return Promise.resolve(false);
            }

            if (taskKey === 'ACC_A34_01_CONTRACT_INV_SUBMIT_i' && operation.key === 'EDIT') {
              const currentUrl = getUrl();
              currentUrl.includes('invBatches')
                ? closeThenGoto(
                    `/sale/contract/invBatches/edit?id=${id}&taskId=${taskId}&remark=${remark}&from=/sale/contract/invBatches`
                  )
                : closeThenGoto(
                    `/plat/saleRece/invBatch/edit?id=${id}&taskId=${taskId}&remark=${remark}&from=/plat/saleRece/invBatch/list`
                  );
              return Promise.resolve(false);
            }

            return bpmForm;
          }}
        >
          <Card className="tw-card-rightLine">
            {formData.batchStatus + '' === '4' && (
              <Button
                className="tw-btn-primary stand"
                type="primary"
                // icon="complete"
                size="large"
                onClick={() => {
                  dispatch({
                    type: `${DOMAIN}/rollbackItems`,
                    payload: fromQs().id,
                  });
                }}
              >
                退回
              </Button>
            )}
            {fromQs().id && (
              <a
                href={`/print?scope=printInv&id=${fromQs().id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 'auto', marginRight: 8 }}
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
            <Button
              className={classnames(fromQs().id ? '' : 'separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          {procNosFlag && (
            <Row style={{ background: '#fff' }}>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} hasSeparator={1}>
                <Field
                  name="disDisc"
                  label="退票原因说明"
                  fieldCol={1}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  decorator={{
                    initialValue: formData && formData.disDisc,
                    rules: [
                      {
                        required: true,
                        message: '请输入退票原因',
                      },
                    ],
                  }}
                >
                  <Input disabled placeholder="请输入退票原因" rows={3} />
                </Field>
              </FieldList>
            </Row>
          )}

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title icon="profile" id="plat.recv.menu.invInfo" defaultMessage="开票基本信息" />
            }
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="开票批次号">{formData.batchNo}</Description>
              <Description term="批次状态">{formData.batchStatusDesc}</Description>
              <Description term="参考合同号/合同名">
                {formData.userdefinedNo}/{formData.contractName}
              </Description>
              <Description term="项目号/项目名">
                {formData.projNo}/{formData.projName}
              </Description>
              <Description term="批次开票金额">{formData.invAmt}</Description>
              <Description term="付款方式">{formData.payMethodDesc}</Description>
              <Description term="预计到账日期">{formData.antiRecvDate}</Description>
            </DescriptionList>
            <FieldList
              layout="horizontal"
              getFieldDecorator={getFieldDecorator}
              col={2}
              hasSeparator={1}
              marginLeft={5}
            >
              <Field
                name="batchDate"
                label="开票日期"
                decorator={{
                  initialValue: formData.batchDate ? moment(formData.batchDate) : null,
                  rules: [
                    {
                      required: true,
                      message: '请选择开票日期',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker
                  placeholder="请选择开票日期"
                  format="YYYY-MM-DD"
                  className="x-fill-100"
                  required={true}
                  disabled={taskKey !== 'ACC_A05_03_INVOICE_CONFIRM'}
                />
              </Field>
            </FieldList>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title icon="profile" id="plat.recv.menu.invContent" defaultMessage="发票内容" />
            }
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="客户名称">{formData.custName}</Description>
              <Description term="开票信息">{formData.invInfo}</Description>
              <Description term="发票抬头">{formData.invTitle}</Description>
              <Description term="税号">{formData.taxNo}</Description>
              <Description term="地址">{formData.addr}</Description>
              <Description term="电话">{formData.invTelAb}</Description>
              <Description term="账户">{formData.accountNo}</Description>
              <Description term="开户行">{formData.bankName}</Description>
              <Description term="发票类型/税率">
                {formData.invTypeDesc}/{formData.taxRate + '%'}
              </Description>
              <Description term="币种">{formData.currCode}</Description>
              {mode === 'view' && <Description term="开票内容">{formData.invContent}</Description>}
              {/* <Description term="保存开票信息到地址簿">{formData.saveAbFlagDesc}</Description> */}
              {taskKey === TASK_FLOW_CONFIRM ? (
                <Description term={<span className="ant-form-item-required">商品信息</span>}>
                  <Cascader
                    style={{ width: '100%' }}
                    options={invoiceItemList}
                    showSearch
                    placeholder="请选择商品信息"
                    value={formData?.invoiceItem || []}
                    onChange={(value, selectedOptions) => {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: { invoiceItem: value },
                      });
                    }}
                  />
                </Description>
              ) : (
                <Description term="商品信息">
                  {`${formData?.invoiceItem1?.twGoodsCodeName || ''}/${formData?.invoiceItem1
                    ?.goodsName || ''}`}
                </Description>
              )}
            </DescriptionList>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title icon="profile" id="plat.recv.menu.invOtherInfo" defaultMessage="其他信息" />
            }
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="收件人">{formData.contactPerson}</Description>
              <Description term="收件人地址">{formData.invAddr}</Description>
              <Description term="递送方式">{formData.deliMethodDesc}</Description>
              <Description term="收件人邮箱">{formData.invEmail}</Description>
              <Description term="收件人联系电话">{formData.invTel}</Description>
              <Description term="开票主体">{formData.ouName}</Description>
              <Description term="附件">
                <FileManagerEnhance
                  api="/api/worth/v1/invBatchs/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled
                  preview
                />
              </Description>
              <Description term="开票说明">{formData.invDesc}</Description>
              <Description term="创建人">{formData.createUserName}</Description>
              <Description term="创建日期">
                {formData.createTime ? formatDT(formData.createTime) : null}
              </Description>
            </DescriptionList>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="user.contract.menu.invContract"
                defaultMessage="开票相关合同"
              />
            }
            style={{ marginTop: 6 }}
          >
            <DataTable {...recvPlanTableProps} />
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="user.contract.menu.detailInvInfoDetail"
                defaultMessage="具体发票信息"
              />
            }
            style={{ marginTop: 6 }}
          >
            <DataTable {...invBatchTableProps} />
          </Card>

          {!taskId && (
            <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A05', title: '合同开票流程' }]} />
          )}

          {!taskId &&
            procNosFlag && (
              <BpmConnection
                source={[{ docId: id, procDefKey: 'ACC_A34', title: '合同退票流程' }]}
              />
            )}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default InvBatchDetail;
