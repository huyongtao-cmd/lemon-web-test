import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { getBankInfoRq, saveCollectionDataRq } from '@/services/production/salesInvoice';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { selectCust } from '@/services/user/Contract/sales';
import { commonModelReducers } from '@/utils/production/modelUtils';
import createMessage from '@/components/core/AlertMessage';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  customerList: [],
  bankList: [],
};
export default {
  namespace: 'salesInvoice',

  state: defaultState,

  effects: {
    // 收款录入
    *saveCollectionData({ payload }, { call, put, select }) {
      const { ...params } = payload;
      const { ok } = yield outputHandle(saveCollectionDataRq, params);
      if (ok) {
        return ok;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return false;
    },

    // 银行账户列表
    *getBankInfo({ payload }, { call, put, select }) {
      const { status, response = [] } = yield call(getBankInfoRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            bankList: response.map(item => ({
              ...item,
              value: item.valCode,
              title: item.valDesc,
            })),
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取客户列表失败' });
      return [];
    },

    // 客户列表
    *getCustomerList({ payload }, { call, put, select }) {
      const { status, response = [] } = yield call(selectCust, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            customerList: response.map(item => ({
              ...item,
              value: item.id,
              title: item.name,
            })),
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取客户列表失败' });
      return [];
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),
  },
};
