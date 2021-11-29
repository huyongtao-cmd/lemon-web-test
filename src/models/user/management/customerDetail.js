import { findAddrByNo } from '@/services/plat/addr/addr';

const emptyFormData = {};
const initialState = {
  tabkey: 'custDetail',
  tabModified: Array(10).fill(0), // 记录哪个tab修改过 - 这个需要放在redux中
  // 查询系列
  formData: {
    // 主数据
    ...emptyFormData,
    relateType: '',
  },
  personData: {
    // 个人
    ...emptyFormData,
  },
  ouData: {
    // 公司
    ...emptyFormData,
  },
  custData: {
    // 客户
    ...emptyFormData,
  },
  supplierData: {
    // 供应商
    ...emptyFormData,
  },
  coopData: {
    // 合作伙伴
    ...emptyFormData,
  },
  // 明细表
  connList: [], // 联系信息
  bankList: [], // 银行账户
  invoiceList: [], // 开票信息
  addressList: [], // 地址列表
};

export default {
  namespace: 'userCustDetail',

  state: {
    ...initialState,
  },

  effects: {
    *query({ payload }, { call, put }) {
      // console.log('findAddrByNo ->', payload);
      const {
        response: { datum },
      } = yield call(findAddrByNo, payload);

      yield put({
        type: 'updateState',
        payload: {
          formData: datum.abBasicDetailView || { relateType: '' },
          personData: datum.personDetailView || {},
          ouData: datum.ouDetailView || {},
          connList: datum.contactListViews || [], // 联系信息
          bankList: datum.accListViews || [], // 银行账户
          invoiceList: datum.invInfoListViews || [], // 开票信息
          addressList: datum.addressListViews || [], // 地址列表
          custData: datum.custView || {},
          supplierData: datum.supplierView || {},
          coopData: datum.coopView || {},
        },
      });
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...initialState,
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
