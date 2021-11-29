import { queryContractDetail } from '@/services/user/Contract/sales';
import {
  queryChildContractDetailRq,
  startChildContractProcRq,
} from '@/services/user/Contract/profitSharing';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { genFakeId } from '@/utils/mathUtils';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'userContractEditDetails',

  state: {
    formData: {},
    ruleList: [],
    pageConfig: {},
  },

  effects: {
    /* 获取子合同详情 */
    *querySub({ payload }, { call, put, select }) {
      const { ruleList } = yield select(({ userContractSharing }) => userContractSharing);
      yield put({
        type: 'updateState',
        payload: {
          ruleList,
        },
      });

      // const { response } = yield call(queryContractDetail, payload);
      const { status, response } = yield call(queryChildContractDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },
    // 提交发起流程
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ userContractEditDetails }) => userContractEditDetails);
      const { ruleList } = yield select(({ userContractSharing }) => userContractSharing);

      // eslint-disable-next-line
      ruleList.map(v => (v.id = genFakeId()));

      const { resetFlag } = formData;
      const parmars = { ...payload, resetFlag, profitAgreeAfts: ruleList };

      const { status, response } = yield call(startChildContractProcRq, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
  },
};
