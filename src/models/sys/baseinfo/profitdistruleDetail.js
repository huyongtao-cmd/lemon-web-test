import router from 'umi/router';
import {
  create,
  update,
  findProfitdistRuleById,
  updateCenter,
} from '@/services/sys/baseinfo/profitdistrule';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {
  id: null,
  busifieldType: null, // 平台编号
  buId: null, // BUID
  buFactor2: null, // BU小类
  buFactor1: null, // BU类别
  custId: null, // 客户id
  custFactor2: null, // 客户小类
  custFactor3: null, // 客户属性类型
  custFactor1: null, // 客户类别
  prodId: null, // 销售品项id
  prodFactor2: null, // 品项小类
  prodFactor3: null, // 品项属性类型
  prodFactor1: null, // 品项类别
  projFactor1: null, // 项目属性
  cooperationType: null, // 合作类型
  channelType: null, // 渠道类型
  promotionType: null, // 促销码
  ruleNo: null, // 利益分配规则码
  platSharePercent: null, // 平台BU抽成比例
  platShareBase: null, // 平台BU抽成比例基于
  signSharePercent: null, // 签单BU抽成比例
  signShareBase: null, // 签单BU抽成比例基于
  deliSharePercent: null, // 交付BU抽成比例
  deliShareBase: null, // 交付BU抽成比例基于
  leadsSharePercent: null, // LEADS抽成比例
  leadsShareBase: null, // LEADS抽成基于
};

export default {
  namespace: 'sysBasicProfitdistRuleDetail',

  state: {
    formData: {
      ...defaultFormData,
    },
    mode: 'create',
    dataSource: [],
    total: 0,
    buFactor2Data: [], // BU小类
    custFactor2Data: [], // 客户小类
    prodFactor2Data: [], // 品项小类
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum = {} },
      } = yield call(findProfitdistRuleById, payload.id);
      if (ok) {
        yield put({
          type: 'updateListBuFactor2',
          payload: datum.buFactor1,
        });
        yield put({
          type: 'updateListCustFactor2',
          payload: datum.custFactor1,
        });
        yield put({
          type: 'updateListProdFactor2',
          payload: datum.prodFactor1,
        });
        yield put({
          type: 'updateState',
          payload: { formData: datum || {}, mode: payload.mode },
        });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(
        ({ sysBasicProfitdistRuleDetail }) => sysBasicProfitdistRuleDetail
      );
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 保存
    *save(_, { call, select }) {
      const { formData, mode } = yield select(
        ({ sysBasicProfitdistRuleDetail }) => sysBasicProfitdistRuleDetail
      );
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/plat/distInfoMgmt/profitdistRule`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
          router.go();
        }
      } else {
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/plat/distInfoMgmt/profitdistRule`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 根据BU类别获取BU小类下拉数据
    *updateListBuFactor2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'ORG:BU_CAT2',
        parentDefId: 'ORG:BU_CAT1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { buFactor2Data: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { buFactor2Data: [] },
        });
      }
    },
    // 根据客户类别获取客户小类下拉数据
    *updateListCustFactor2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'TSK:CUST_CAT2',
        parentDefId: 'TSK:CUST_CAT1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { custFactor2Data: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { custFactor2Data: [] },
        });
      }
    },
    // 根据品项类别获取品项小类下拉数据
    *updateListProdFactor2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'TSK:SALE_TYPE2',
        parentDefId: 'TSK:SALE_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { prodFactor2Data: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { prodFactor2Data: [] },
        });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...defaultFormData,
          },
          mode: 'create',
          dataSource: [],
          total: 0,
          buFactor2Data: [], // BU小类
          custFactor2Data: [], // 客户小类
          prodFactor2Data: [], // 品项小类
        },
      });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
