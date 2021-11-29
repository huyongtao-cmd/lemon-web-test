import {
  getMyMessageList,
  getMessageInfo,
  deleteMessageHandle,
  messageReadFn,
} from '@/services/plat/message';
import { selectIamUsers } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'userMessageInfo',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    detailFormData: {},
    userList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = payload;
      if (params) {
        const { releaseTime = '' } = params;
        if (Array.isArray(releaseTime) && releaseTime[0] && releaseTime[1]) {
          const [startTime, endTime] = releaseTime;
          params.releaseStartTime = startTime;
          params.releaseEndTime = endTime;
        }
        delete params.releaseTime;
        if (!params.releaseTitle) {
          delete params.releaseTitle;
        }
      }

      const { response } = yield call(getMyMessageList, params);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },

    *del({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ messageInfo }) => messageInfo);
      const { response } = yield call(deleteMessageHandle, payload);
      if (response.ok) {
        yield put({ type: 'query', payload: searchForm });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },
    // 直接调用阅读接口
    *queryMessageDetailInfo({ payload }, { call, put }) {
      const { response } = yield call(messageReadFn, payload.id);
      if (response && response.ok) {
        const { messageTagName } = response.datum;
        yield put({
          type: 'updateState',
          payload: {
            detailFormData:
              {
                ...response.datum,
                messageTagName: messageTagName
                  ? messageTagName.replace(/null/g, '标签已删除')
                  : messageTagName,
              } || {},
          },
        });
        // yield put({
        //   type: 'readMessage',
        //   payload: {
        //     id: payload.id,
        //   },
        // });
      }
    },
    // *readMessage({ payload }, { call, put }) {
    //   const { response } = yield call(messageReadFn, payload.id);
    // },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {},
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
