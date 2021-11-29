import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
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
};
export default {
  namespace: 'saleOrder',

  state: defaultState,

  effects: {
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
