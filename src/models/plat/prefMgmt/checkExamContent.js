import { preexamContentDetailRq } from '@/services/plat/communicate';
import { businessPageDetailByNos } from '@/services/sys/system/pageConfig';

import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'checkExamContent',
  state: {
    assPersonList: [],
    assessorList: [],
    hrList: [],
    pageConfigs: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(preexamContentDetailRq, payload);
      if (status === 200) {
        if (response) {
          const { rows } = response;
          const { assPersonList, assessorList, hrList } = yield select(
            ({ checkExamContent }) => checkExamContent
          );
          if (rows.length > 0) {
            rows.map(item => {
              if (item.communicateType === 'ASSESSED') {
                assPersonList.push(item);
              } else if (item.communicateType === 'ASSESSOR') {
                assessorList.push(item);
              } else if (item.communicateType === 'HR') {
                hrList.push(item);
              }
              return true;
            });
            yield put({
              type: 'updateState',
              payload: {
                assPersonList,
                assessorList,
                hrList,
              },
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '目前没有明细' });
          }
        }
      }
    },
    *getPageConfigs({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNos, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfigs: response.configInfos,
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
  },
};
