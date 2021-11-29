import { findAddrByNo } from '@/services/plat/addr/addr';
import createMessage from '@/components/core/AlertMessage';

const emptyFormData = {};
const initialState = {
  tabkey: 'basic',
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
    coopPeriod: [],
  },
  // 明细表
  connList: [], // 联系信息
  bankList: [], // 银行账户
  invoiceList: [], // 开票信息
  addressList: [], // 地址列表
  attachments: [],
  attachments1: [],
  attachments2: [],
};

export default {
  namespace: 'platAddrDet',

  state: {
    ...initialState,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(findAddrByNo, payload);
      const { datum } = response;

      if (status === 100) {
        // 主动取消请求
        return;
      }

      if (status === 200) {
        if (response && response.ok) {
          const { attachments = [], attachments1 = [], attachments2 = [] } = datum.coopView; //地址簿 没有合作伙伴时,datum.coopView是一个全元素为null的对象
          const attache = attachments && attachments.map(item => item.id); // 如果 attachments 是null，上面不会给默认空数组，本行，还是会报错
          const attache1 = attachments1 && attachments1.map(item => item.id);
          const attache2 = attachments2 && attachments2.map(item => item.id);
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
              coopData:
                {
                  ...datum.coopView,
                  attache,
                  attache1,
                  attache2,
                } || {},
              attachments,
              attachments1,
              attachments2,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      }
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
