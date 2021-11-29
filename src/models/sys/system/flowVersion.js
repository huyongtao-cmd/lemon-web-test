import {
  getFlowVersionList,
  getVersionItemByVersionTag,
  putSaveExplain,
} from '@/services/sys/system/flowVersion';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'flowVersion',
  state: {
    list: [],
    info: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status, ok } = yield call(getFlowVersionList, payload);
      if (response.ok) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(datum) ? datum : [],
          },
        });
      }
    },
    *queryVersionItemByVersionTag({ payload }, { call, put }) {
      const { response, status, ok } = yield call(getVersionItemByVersionTag, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            info: response.datum,
          },
        });
      }

      return response;
    },
    *savePutSaveExplain({ payload }, { call, put }) {
      const { response, status, ok } = yield call(putSaveExplain, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功！' });
        const param = fromQs();
        const { key } = param;
        yield put({
          type: 'query',
          payload: {
            key,
          },
        });
      }

      return response.ok;
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
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (pathname === `/sys/flowMen/Flow/flowVersion`) {
          // dispatch({
          //   type: 'query',
          //   payload: {
          //     key,
          //   },
          // });
        }
      });
    },
  },
};
