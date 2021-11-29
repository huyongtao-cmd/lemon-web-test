import {
  selectInvInfo,
  detailInvInfo,
  saveInvBatch,
  saveInvBatchInfo,
  finishInvBatch,
} from '@/services/plat/recv/Contract';
import { getViewConf, pushFlowTask } from '@/services/gen/flow';
import {
  detailInvBatch,
  contractInvBatch,
  infoInvBatch,
  rollbackContract,
  getContractInfoById,
  getInvoiceItemListRq,
} from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { isNil, isEmpty, clone } from 'ramda';
import { flatten } from '@/utils/arrayUtils';
import { getUrl } from '@/utils/flowToRouter';

export default {
  namespace: 'invBatchDetail',
  state: {
    dtlList: [], // 具体发票信息
    delList: [], // 具体发票信息删除集合
    recvPlanList: [],
    searchForm: {
      // 批次号
      batchNo: null,
      // 批次状态
      batchStatus: null,
      // 发票号
      invNo: null,
      // 客户名称
      custId: null,
      custName: null,
      // 主合同名称
      contractName: null,
      // 子合同号
      subContractNo: null,
      // 子合同名称
      subContractName: null,
      // 开票日期
      batchDateStart: null,
      batchDateEnd: null,
      // 发票抬头
      invTitle: null,
      // 预计收款日期
      expectRecvDateStart: null,
      expectRecvDateEnd: null,
      // 逾期天数
      overDays: null,
    },
    formData: {
      // 开票基本信息
      // id - T_INV_BATCH.ID
      id: null,
      //  批次号 - T_INV_BATCH.BATCH_NO
      batchNo: null,
      //  批次状态 已申请/待开票/已开票/已取消 - T_INV_BATCH.BATCH_STATUS
      batchStatus: '1',
      batchStatusDesc: '新建',
      //  发票信息ID - T_INV_BATCH.INVINFO_ID
      invinfoId: null,
      //  发票抬头 - T_INV_BATCH.INV_TITLE
      invTitle: null,
      //  发票类型 - T_INV_BATCH.INV_TYPE
      invType: null,
      invTypeDesc: null,
      //  税率 - T_INV_BATCH.TAX_RATE
      taxRate: null,
      //  递送方式 - T_INV_BATCH.DELI_METHOD
      deliMethod: null,
      deliMethodDesc: null,
      //  收件人 - T_INV_BATCH.CONTACT_PERSON
      contactPerson: null,
      //  收件人地址 - T_INV_BATCH.INV_ADDR
      invAddr: null,
      //  收件人电话 - T_INV_BATCH.INV_TEL
      invTel: null,
      //  开户行 - T_INV_BATCH.BANK_NAME
      bankName: null,
      //  收款账号 - T_INV_BATCH.ACCOUNT_NO
      accountNo: null,
      //  开票日期 - T_INV_BATCH.BATCH_DATE
      batchDate: null,
      //  发票内容 - T_INV_BATCH.INV_CONTENT
      invContent: null,
      //  付款方式 - T_INV_BATCH.PAY_METHOD
      payMethod: null,
      payMethodDesc: null,
      //  开票说明 - T_INV_BATCH.INV_DESC
      invDesc: null,
      //  备注 - T_INV_BATCH.REMARK
      remark: null,
      // 创建人
      createUserName: null,
      // 创建时间
      createTime: null,
      // 批次开票金额 （只读，始终等于“开票相关合同”中各行“未开票金额”合计）
      invAmt: null,
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    invoiceItemList: [],
  },
  effects: {
    *reSubmit({ payload }, { call, put, select }) {
      const res = yield call(pushFlowTask, payload.taskId, {
        result: payload.result,
        remark: payload.remark,
      });
      const { status, response } = res;

      if (status === 100) {
        // 主动取消请求
        return false;
      }
      const { ok } = response;
      if (ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '流程节点推送失败！',
        });
      }
      return response;
    },
    *save({ payload }, { call, put, select }) {
      const { formData, dtlList, delList, recvPlanList, invoiceItemList } = yield select(
        ({ invBatchDetail }) => invBatchDetail
      );
      const arr = [];
      recvPlanList.map(v => arr.push(v.id));

      const newFormData = clone(formData);

      const { id, from, taskId } = fromQs();
      // isReEdit true  表示taskId 不存在 false taskId 存在 为 false formData.id = url.id
      if (!payload.isReEdit && id) {
        newFormData.id = id;
      }

      if (isNil(newFormData.addr)) {
        newFormData.addr = newFormData.invAddr;
      }

      if (isNil(newFormData.saveAbFlag)) {
        newFormData.saveAbFlag = 1;
      }

      // 处理商品信息字段
      if (
        Array.isArray(newFormData.invoiceItem) &&
        !isEmpty(newFormData.invoiceItem.filter(v => v))
      ) {
        const tt = flatten(invoiceItemList.map(v => v.children)).filter(
          v => v.twGoodsCode === newFormData.invoiceItem[0] && v.id === formData.invoiceItem[1]
        );
        // eslint-disable-next-line prefer-destructuring
        newFormData.invoiceItem = tt[0];
      } else {
        newFormData.invoiceItem = null;
      }

      const { status, response } = yield call(saveInvBatch, {
        invBatchEntity: {
          contractRecvPlanIds: arr,
          ...newFormData,
          invAmt: payload.invAmt,
          // sendEmail: 'ok',
        },
        invdtlSaveEntity: { entities: dtlList, delList },
        submitted: payload.submitted,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        // createMessage({ type: 'success', description: '保存成功' });
        return { id: response.datum, success: true };
      }
      // createMessage({ type: 'error', description: response.reason || '保存失败' });
      return { id: response.datum, success: false, message: response.reason || '保存失败' };
    },
    *save1({ payload }, { call, put, select }) {
      // let flag = 0;
      const { formData, dtlList, delList, recvPlanList, invoiceItemList } = yield select(
        ({ invBatchDetail }) => invBatchDetail
      );
      const arr = [];
      recvPlanList.map(v => arr.push(v.id));
      if (!payload.isEdit) {
        formData.id = null;
      }

      const { id, from, taskId } = fromQs();
      // isReEdit true  表示taskId 不存在 false taskId 存在 为 false formData.id = url.id
      if (!payload.isReEdit && id) {
        formData.id = id;
      }

      if (isNil(formData.addr)) {
        formData.addr = formData.invAddr;
      }

      if (isNil(formData.saveAbFlag)) {
        formData.saveAbFlag = 0;
      }

      // 处理商品信息字段
      if (Array.isArray(formData.invoiceItem) && !isEmpty(formData.invoiceItem)) {
        const tt = flatten(invoiceItemList.map(v => v.children)).filter(
          v => v.twGoodsCode === formData.invoiceItem[0] && v.id === formData.invoiceItem[1]
        );
        // eslint-disable-next-line prefer-destructuring
        formData.invoiceItem = tt[0];
      }

      const { status, response } = yield call(saveInvBatch, {
        invBatchEntity: {
          contractRecvPlanIds: arr,
          ...formData,
          invAmt: payload.invAmt,
          // sendEmail: 'ok',
        },
        invdtlSaveEntity: { entities: dtlList, delList },
        submitted: payload.submitted,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        // createMessage({ type: 'success', description: '保存成功' });
        return { id: response.datum, success: true };
      }
      // createMessage({ type: 'error', description: response.reason || '保存失败' });
      return { id: response.datum, success: false, message: response.reason || '保存失败' };
    },
    *save2({ payload }, { call, put, select }) {
      // let flag = 0;
      const { formData, dtlList, delList, recvPlanList, invoiceItemList } = yield select(
        ({ invBatchDetail }) => invBatchDetail
      );
      const arr = [];
      recvPlanList.map(v => arr.push(v.id));
      if (!payload.isEdit) {
        formData.id = null;
      }

      const { id, from, taskId } = fromQs();
      // isReEdit true  表示taskId 不存在 false taskId 存在 为 false formData.id = url.id
      if (!payload.isReEdit && id) {
        formData.id = id;
      }

      if (isNil(formData.addr)) {
        formData.addr = formData.invAddr;
      }

      if (isNil(formData.saveAbFlag)) {
        formData.saveAbFlag = 0;
      }

      // 处理商品信息字段
      if (Array.isArray(formData.invoiceItem) && !isEmpty(formData.invoiceItem)) {
        const tt = flatten(invoiceItemList.map(v => v.children)).filter(
          v => v.twGoodsCode === formData.invoiceItem[0] && v.id === formData.invoiceItem[1]
        );
        // eslint-disable-next-line prefer-destructuring
        formData.invoiceItem = tt[0];
      }

      const { status, response } = yield call(saveInvBatch, {
        invBatchEntity: {
          contractRecvPlanIds: arr,
          ...formData,
          invAmt: payload.invAmt,
          sendEmail: 'ok',
        },
        invdtlSaveEntity: { entities: dtlList, delList },
        submitted: payload.submitted,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        // createMessage({ type: 'success', description: '保存成功' });
        return { id: response.datum, success: true };
      }
      // createMessage({ type: 'error', description: response.reason || '保存失败' });
      return { id: response.datum, success: false, message: response.reason || '保存失败' };
    },
    // 完成开票
    *finish({ payload }, { call, put, select }) {
      const { formData, recvPlanList } = yield select(({ invBatchDetail }) => invBatchDetail);
      const arr = [];
      recvPlanList.map(v => arr.push(v.id));
      const { status, response } = yield call(finishInvBatch, {
        contractRecvPlanIds: arr,
        ...formData,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      // if (!payload.isEdit) {
      //   formData.id = null;
      // }

      if (response.ok) {
        createMessage({ type: 'success', description: '完成开票成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '完成开票失败' });
      }
      return response;
    },

    // 商品信息下拉带出数据
    *getInvoiceItemList({ payload }, { call, put, select }) {
      const { response } = yield call(getInvoiceItemListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceItemList: response.datum
              .map(v => ({
                ...v,
                label: v.twGoodsCodeName,
                value: v.twGoodsCode,
              }))
              .map(v => ({
                ...v,
                children: v.children.map(item => ({
                  ...item,
                  label: item.goodsName,
                  value: item.id,
                })),
              })),
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取商品信息列表失败' });
      }
    },
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(detailInvBatch, payload);
      const recvPlanListData = yield call(contractInvBatch, payload);
      const dtlListData = yield call(infoInvBatch, payload);
      const contractInfoData = yield call(getContractInfoById, { planId: -1, invId: payload.id });
      const { projectInfo, contractInfo, abNo } = contractInfoData.response.datum || {};
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...(response.datum || {}),
            ...{ projectInfo, contractInfo, abNo },
            invoiceItem1: response?.datum?.invoiceItem,
            invoiceItem: [
              response?.datum?.invoiceItem?.twGoodsCode,
              response?.datum?.invoiceItem?.id,
            ],
          },
          recvPlanList: Array.isArray(recvPlanListData.response.datum)
            ? recvPlanListData.response.datum
            : [],
          dtlList: Array.isArray(dtlListData.response.datum) ? dtlListData.response.datum : [],
        },
      });
    },
    // 发票信息下拉带出数据
    *invInfoDetail({ payload }, { call, put, select }) {
      const { formData } = yield select(({ invBatchDetail }) => invBatchDetail);
      const { response } = yield call(detailInvInfo, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            ...(response.datum || {}),
          },
        },
      });
    },
    *rollbackItems({ payload }, { call, put, select }) {
      const { status, response } = yield call(rollbackContract, payload);
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '退回成功' });
          // 虽然个人工作台下的列表页没有退回功能，还是加一下判断吧。。。
          const { from } = fromQs();
          from ? closeThenGoto(from) : closeThenGoto('/plat/saleRece/invBatch/list');
        } else {
          createMessage({ type: 'error', description: response.reason });
        }
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
