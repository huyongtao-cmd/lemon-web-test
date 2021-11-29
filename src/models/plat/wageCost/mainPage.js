import {
  queryWageCostList,
  delWageCostItem,
  saveWageCost,
  updateWageCost,
  submitWageCost,
  createPayObj,
  savePayObj,
  updatePayObj,
  createBU,
  saveBU,
  updateBU,
  selectReason,
  getViewItem,
  flowPush,
  JdeExport,
} from '@/services/plat/wageCost';
import { generateByCostById } from '@/services/sale/purchaseContract/salaryAccount';
import createMessage from '@/components/core/AlertMessage';
import update from 'immutability-helper';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { launchFlowFn, pushFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'wageCostMainPage',
  state: {
    mainDataId: '', // 主数据id
    detailForm: {}, // 明细页面的form表单
    detailList: [], // 单据明细列表
    payObjList: [], // 付款对象列表
    payObjTotal: 0, // 付款对象列表总数
    payObjIsSave: false, // 付款对象保存
    BUList: [], // BU成本列表
    BUTotal: 0, // BU成本列表总数
    BUIsSave: false, // BU成本保存
    reasonObj: {}, // 付款依据对象
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },

  effects: {
    // 修改跳转获取原数据
    *getViewItem({ payload }, { put, call, select }) {
      const rep = yield call(getViewItem, payload);
      if (rep && rep.response && rep.response.ok) {
        rep.response.datum.salPaymentView.forEach((item, index) => {
          const items = item;
          items.mytempId = index;
        });
        rep.response.datum.salCostBuView.forEach((item, index) => {
          const items = item;
          items.mytempId = index;
        });
        yield put({
          type: 'updateState',
          payload: {
            mainDataId: rep.response.datum.salCostView.masterView.id,
            detailForm: rep.response.datum.salCostView.masterView,
            detailList: rep.response.datum.salCostView.detailView,
            payObjList: rep.response.datum.salPaymentView,
            payObjTotal: rep.response.datum.salPaymentView.length,
            payObjIsSave: rep.response.datum.salPaymentView.length > 0,
            BUList: rep.response.datum.salCostBuView,
            BUTotal: rep.response.datum.salCostBuView.length,
            BUIsSave: rep.response.datum.salCostBuView.length > 0,
          },
        });
        yield put({
          type: 'selectReason',
        });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // 更新 详情列表
    *updateDetailList({ payload }, { put, call, select }) {
      yield put({
        type: 'updateState',
        payload: {
          ...payload,
        },
      });
    },
    // 详情保存
    *detailSave({ payload }, { put, call, select }) {
      const rep = yield call(saveWageCost, payload);
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'updateState',
          payload: {
            mainDataId: rep.response.datum,
          },
        });
        yield put({
          type: 'getViewItem',
          payload: {
            id: rep.response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // 详情更新
    *detailUpdate({ payload }, { put, call, select }) {
      const rep = yield call(updateWageCost, payload);
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功,请重新生成数据' });
        yield put({
          type: 'getViewItem',
          payload: {
            id: rep.response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
        });
      }
    },
    // 提交
    *submit({ Payload }, { put, call, select }) {
      const { mainDataId } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      const rep = yield call(submitWageCost, { id: mainDataId });
      if (rep && rep.response && rep.response.ok) {
        // createMessage({ type: 'success', description: '操作成功' });
        // yield put({
        //   type: 'updateState',
        //   payload: {
        //     mainDataId: rep.response.datum,
        //   },
        // });
        // 出发流程
        const reps = yield call(launchFlowFn, {
          defkey: 'ACC_A68',
          value: {
            id: mainDataId,
          },
        });
        if (reps && reps.response && reps.response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process?type=procs`);
        } else {
          createMessage({ type: 'error', description: rep.response.reason });
        }
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // 流程
    *fetchFlow({ payload }, { put, call, select }) {
      const { id } = payload;
      const reps = yield call(launchFlowFn, {
        defkey: 'ACC_A68',
        value: {
          id,
        },
      });
    },
    // 生成数据payObj
    *payObjCreateData({ payload }, { put, call, select }) {
      const { mainDataId } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      const res = yield call(createPayObj, { id: mainDataId });
      if (res && res.response && res.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        res.response.datum.forEach((item, index) => {
          const items = item;
          items.mytempId = index;
        });
        yield put({
          type: 'updateState',
          payload: {
            payObjList: res.response.datum,
            payObjTotal: res.response.datum.length,
            // payObjIsSave: false,
          },
        });
        yield put({
          type: 'selectReason',
        });
      } else {
        createMessage({ type: 'error', description: res.response.reason });
      }
    },
    // payObj保存
    *payObjSave({ payload }, { put, call, select }) {
      const { mainDataId, payObjList } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      if (!payObjList.length > 0) {
        createMessage({ type: 'warn', description: '没有生成的数据' });
        return;
      }
      const rep = yield call(savePayObj, { id: mainDataId, viewList: payObjList });
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        // yield put({
        //   type: 'updateState',
        //   payload: {
        //     payObjIsSave: true,
        //   },
        // });
        yield put({
          type: 'getViewItem',
          payload: {
            id: mainDataId,
          },
        });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // payObj更新
    *payObjUpdate({ payload }, { put, call, select }) {
      const { mainDataId, payObjList } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      if (!payObjList.length > 0) {
        createMessage({ type: 'warn', description: '没有生成的数据' });
        return;
      }
      const rep = yield call(updatePayObj, { viewList: payObjList });
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // 生成数据BU
    *BUCreateData({ payload }, { put, call, select }) {
      const { mainDataId } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      const res = yield call(createBU, { id: mainDataId });
      if (res && res.response && res.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        res.response.datum.forEach((item, index) => {
          const items = item;
          items.mytempId = index;
        });
        yield put({
          type: 'updateState',
          payload: {
            BUList: res.response.datum,
            BUTotal: res.response.datum.length,
            // BUIsSave: false,
          },
        });
      } else {
        createMessage({ type: 'error', description: res.response.reason });
      }
    },
    // BU保存
    *BUSave({ payload }, { put, call, select }) {
      const { mainDataId, BUList } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      if (!BUList.length > 0) {
        createMessage({ type: 'warn', description: '没有生成的数据' });
        return;
      }
      const rep = yield call(saveBU, { id: mainDataId, viewList: BUList });
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        // yield put({
        //   type: 'updateState',
        //   payload: {
        //     BUIsSave: true,
        //   },
        // });
        yield put({
          type: 'getViewItem',
          payload: {
            id: mainDataId,
          },
        });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    // BUUpdate
    *BUUpdate({ payload }, { put, call, select }) {
      const { mainDataId, BUList } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      if (mainDataId === '') {
        createMessage({ type: 'error', description: '未获取到主数据ID,请先保存导入的数据' });
        return;
      }
      if (!BUList.length > 0) {
        createMessage({ type: 'warn', description: '没有生成的数据' });
        return;
      }
      const rep = yield call(updateBU, { viewList: BUList });
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
      }
    },
    //
    *selectReason({ payload }, { put, call, select }) {
      const { reasonObj, payObjList } = yield select(({ wageCostMainPage }) => wageCostMainPage);
      const { ...obj } = reasonObj;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < payObjList.length; i++) {
        if (payObjList[i].abNo && obj[payObjList[i].abNo] === undefined) {
          const rep = yield call(selectReason, { abNo: payObjList[i].abNo });
          if (rep && rep.response && rep.response.ok) {
            obj[payObjList[i].abNo] = rep.response.datum;
            yield put({
              type: 'updateState',
              payload: {
                reasonObj: obj,
              },
            });
          } else {
            createMessage({ type: 'error', description: rep.response.reason });
          }
        }
      }
    },
    // 驳回后再提交
    *retryFlowPush({ payload }, { call, put, select }) {
      const res = yield call(flowPush, { ...payload });
      if (res && res.response && res.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({ type: 'error', description: res.response.datum });
      }
    },
    // JdeExport
    *JdeExport({ payload }, { call, put, select }) {
      const res = yield call(JdeExport, { ...payload });
      createMessage({ type: 'error', description: res.response.reason });
    },
    // 清空缓存
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          mainDataId: '', // 主数据id
          detailForm: {}, // 明细页面的form表单
          detailList: [], // 单据明细列表
          payObjList: [], // 付款对象列表
          payObjTotal: 0, // 付款对象列表总数
          payObjIsSave: false, // 付款对象保存
          BUList: [], // BU成本列表
          BUTotal: 0, // BU成本列表总数
          BUIsSave: false, // BU成本保存
          reasonObj: {}, // 付款依据对象
        },
      });
    },
    // 通过薪资成本生成付款申请单
    *generateByCostHandle({ payload }, { call, put }) {
      const { status, response } = yield call(generateByCostById, payload);
      if (status === 200) {
        const { datum, ok, reason } = response;
        if (ok) {
          createMessage({ type: 'success', description: '操作成功' });
        } else {
          createMessage({ type: 'error', description: reason || '操作失败' });
        }
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
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
