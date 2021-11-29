import {
  detailInvInfo,
  saveInvBatch,
  finishInvBatch,
  invApply,
  queryRecvplansByIds,
  selectInvInfo,
} from '@/services/plat/recv/Contract';
import { isNil, isEmpty } from 'ramda';
import { pushFlowTask } from '@/services/gen/flow';
import {
  detailInvBatch,
  contractInvBatch,
  infoInvBatch,
  custIdGet,
  rollbackContract,
  getContractInfoById,
  putSaveRefundReasonById,
  getInvoiceItemListRq,
} from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { add } from '@/utils/mathUtils';
import { flatten } from '@/utils/arrayUtils';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';

const goDetail = id => {
  const currentUrl = getUrl();
  const { from } = fromQs();

  currentUrl.includes('invBatches')
    ? closeThenGoto(`/sale/contract/invBatches/detail?id=${id}&from=/sale/contract/invBatches`)
    : closeThenGoto(`/plat/saleRece/invBatch/detail?id=${id}&from=${from}`);
};

const defaultFormData = {
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
};

export default {
  namespace: 'invBatchEdit',
  state: {
    custId: 0,
    dtlList: [], // 具体发票信息
    delList: [], // 具体发票信息删除集合
    recvPlanList: [],
    selectList: [],
    contractInfoFormData: {
      projectInfo: undefined,
      contractInfo: undefined,
      invTitle: undefined,
      abNo: undefined,
    },
    formData: defaultFormData,
    invoiceItemList: [],
  },
  effects: {
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

    *query({ payload }, { call, put, all }) {
      const {
        custIdData,
        formDataData,
        recvPlanListData,
        dtlListData,
        contractInfoData,
      } = yield all({
        custIdData: call(custIdGet, { invId: payload.id }),
        formDataData: call(detailInvBatch, payload),
        recvPlanListData: call(contractInvBatch, payload),
        dtlListData: call(infoInvBatch, payload),
        contractInfoData: call(getContractInfoById, { planId: -1, invId: payload.id }),
      });
      const custId = Array.isArray(custIdData.response.datum)
        ? custIdData.response.datum[0] || -1
        : -1;
      if (custId !== -1) {
        // 不是匹配固定id记录，不用进行多租户改造
        yield put({
          type: `fetchAsyncSelectList`,
          payload: { custId },
        });
      }

      const formData =
        {
          ...formDataData.response.datum,
          invoiceItem: [
            formDataData?.response?.datum?.invoiceItem?.twGoodsCode,
            formDataData?.response?.datum?.invoiceItem?.id,
          ],
        } || {};
      const recvPlanList = Array.isArray(recvPlanListData.response.datum)
        ? recvPlanListData.response.datum
        : [];
      const dtlList = Array.isArray(dtlListData.response.datum) ? dtlListData.response.datum : [];
      const contractInfoFormData = contractInfoData.response.datum || {};
      // formData.invTitle = contractInfoFormData.invTitle;
      yield put({
        type: 'updateState',
        payload: {
          formData,
          recvPlanList,
          dtlList,
          custId,
          contractInfoFormData,
        },
      });
      return +formData.taxRate;
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
    *queryByIds({ payload }, { call, put, select }) {
      yield put({ type: 'clean' });
      // 根据收款计划id数组  查询收款计划表
      const { response } = yield call(queryRecvplansByIds, payload);
      // planId为收款计划id；invId为合同开票表id
      const contractInfoData = yield call(getContractInfoById, { planId: payload, invId: -1 });
      if (response && response.ok && contractInfoData && contractInfoData.response.ok) {
        const recvPlanList = Array.isArray(response.datum) ? response.datum : [];

        const contractInfoFormData = contractInfoData.response.datum || {};

        yield put({
          type: 'updateState',
          payload: {
            recvPlanList,
            contractInfoFormData: contractInfoData.response.datum || {},
            custId: contractInfoData.response.datum.custId,
            formData: {
              ...defaultFormData,
              ...contractInfoFormData,
              invTitle: (contractInfoData.response.datum || {}).invTitle,
              invAmt: recvPlanList.reduce((prev, curr) => add(prev, curr.unRecvAmt || 0), 0),
            },
          },
        });

        if (contractInfoData.response.datum.custId > 0) {
          yield put({
            type: `fetchAsyncSelectList`,
            payload: { custId: contractInfoData.response.datum.custId },
          });
        }
      }
    },
    // 发票信息下拉带出数据
    *invInfoDetail({ payload }, { call, put, select }) {
      const { formData } = yield select(({ invBatchEdit }) => invBatchEdit);
      const { response } = yield call(detailInvInfo, payload);
      const { invType, invAddr, ...newRes } = response.datum || {};
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            ...newRes,
            invinfoId: payload.id,
            addr: invAddr,
          },
        },
      });

      return response;
    },
    *save({ payload }, { call, put, select }) {
      // let flag = 0;
      const { formData, dtlList, delList, recvPlanList, invoiceItemList } = yield select(
        ({ invBatchEdit }) => invBatchEdit
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
    // 完成开票
    *finish({ payload }, { call, put, select }) {
      const { formData, recvPlanList } = yield select(({ invBatchEdit }) => invBatchEdit);
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
      return !!response.ok;
    },

    *reSubmit({ payload }, { call, put, select }) {
      const res = yield call(pushFlowTask, payload.taskId, {
        result: 'APPLIED',
        remark: payload.remark,
      });
      const { status, response } = res;

      if (status === 100) {
        // 主动取消请求
        return false;
      }
      const { ok } = response;
      if (ok) {
        createMessage({ type: 'success', description: '开票申请成功' });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '开票申请失败',
        });
      }
      return response;
    },
    // 开票信息下拉列表
    *fetchAsyncSelectList({ payload }, { call, put }) {
      const { response } = yield call(selectInvInfo, payload);
      if (Array.isArray(response)) {
        yield put({
          type: 'updateState',
          payload: {
            selectList: response,
          },
        });
      }
    },

    // 退票原因的说明
    *refundBtn({ payload }, { call, put, select }) {
      const { response } = yield call(putSaveRefundReasonById, payload);
      if (response.ok) {
        // invBatchId => 当前url id
        goDetail(payload.invBatchId);
      } else {
        createMessage({ type: 'error', description: response.reason });
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
    clean(state) {
      return {
        custId: 0,
        dtlList: [], // 具体发票信息
        delList: [], // 具体发票信息删除集合
        recvPlanList: [],
        contractInfoFormData: {
          projectInfo: undefined,
          contractInfo: undefined,
          invTitle: undefined,
          abNo: undefined,
        },
        formData: defaultFormData,
      };
    },
  },
};
