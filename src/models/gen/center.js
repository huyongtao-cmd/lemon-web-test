import {
  queryMyInfo,
  queryShortCut,
  foundShortCut,
  changeShortCut,
  getTodo,
  getBack,
  getDone,
  queryWillApproveCount,
  queryRecentWork,
  changeTicketInfo,
  getMessage,
  getMessageCount,
  selectTrainingAllRq,
  updateNewPushFlagRq,
  updateShowFlagRq,
} from '@/services/gen/center';
import createMessage from '@/components/core/AlertMessage';
import { getNotify } from '@/services/user/flow/flow';
import { recentworkExtrwork } from '@/services/user/project/project';
import { isNil } from 'ramda';

/**
 * 系统用户信息状态
 */
export default {
  namespace: 'userCenter',

  state: {
    myShortCut: [],
    sysShortCuts: [],
    newSortNo: null,
    todoList: [],
    backList: [],
    doneList: [],
    notifyList: [],
    myInfo: {},
    recentWork: [],
    activeTabKey: '1',
    messageList: [],
    pop1: {},
    pop2: [],
    pop3: [],
    visible1: false,
    visible2: false,
    visible3: false,
  },

  effects: {
    *selectTrainingAll({ payload }, { call, put }) {
      const { status, response } = yield call(selectTrainingAllRq);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          const { pop1, pop2, pop3 } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              pop1: pop1 || {},
              pop2: pop2 || [],
              pop3: pop3 || [],
            },
          });
          if (!isNil(pop1)) {
            yield put({
              type: 'updateState',
              payload: {
                visible1: true,
              },
            });
          } else if (!isNil(pop2)) {
            yield put({
              type: 'updateState',
              payload: {
                visible2: true,
              },
            });
          } else if (!isNil(pop3)) {
            yield put({
              type: 'updateState',
              payload: {
                visible3: true,
              },
            });
          }

          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取入职培训信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取入职培训信息失败' });
      return {};
    },

    *updateNewPushFlag({ payload }, { call, put }) {
      const { status, response } = yield call(updateNewPushFlagRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          return response.datum;
        }
        createMessage({
          type: 'error',
          description: response.reason || '更新不再提示入职培训信息标志失败',
        });
        return {};
      }
      createMessage({
        type: 'error',
        description: response.reason || '更新不再提示入职培训信息标志失败',
      });
      return {};
    },

    *updateShowFlag({ payload }, { call, put }) {
      const { status, response } = yield call(updateShowFlagRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取逾期培训提醒失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取逾期培训提醒失败' });
      return {};
    },

    *queryMyInfo(_, { call, put }) {
      const { response } = yield call(queryMyInfo);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: { myInfo: response.datum || {} },
        });
        // } else {
        //   createMessage({ type: 'error', description: '查询失败' });
      }
    },
    *queryShortCut({ payload }, { call, put }) {
      const { response } = yield call(queryShortCut);
      const sliceArray = (array, size) => {
        const result = [];
        for (let i = 0; i < Math.ceil(array.length / size); i += 1) {
          const start = i * size;
          const end = start + size;
          result.push(array.slice(start, end));
        }
        return result;
      };

      const { myShortCuts = [], sysShortCuts = [] } = response.datum || {};
      const sliceNum = 8;
      const newSortNo =
        myShortCuts.length === 0 ? 1 : myShortCuts[myShortCuts.length - 1].sortNo + 1;
      yield put({
        type: 'updateState',
        payload: {
          myShortCut: sliceArray(myShortCuts, sliceNum),
          sysShortCuts: Array.isArray(sysShortCuts) ? sysShortCuts : [],
          newSortNo,
        },
      });
      return response;
    },
    *foundShortCut({ payload }, { call, put }) {
      const { response } = yield call(foundShortCut, payload);
      if (response.ok) {
        yield put({
          type: 'queryShortCut',
        });
      }
    },
    *changeShortCut({ payload }, { call, put }) {
      const { response } = yield call(changeShortCut, payload);
      if (response.ok) {
        yield put({
          type: 'queryShortCut',
        });
      }
    },
    *todo({ payload }, { call, put }) {
      const { response } = yield call(getTodo, payload);
      // console.warn(response.rows);
      yield put({
        type: 'updateState',
        payload: {
          todoList: Array.isArray(response.rows) ? response.rows : [],
          todoTotalCount: response.total,
        },
      });
    },

    *back({ payload }, { call, put }) {
      const { response } = yield call(getBack, payload);
      // console.warn(response.rows);
      yield put({
        type: 'updateState',
        payload: {
          backList: Array.isArray(response.rows) ? response.rows : [],
          backTotalCount: response.total,
        },
      });
    },

    *done({ payload }, { call, put }) {
      const { response } = yield call(getDone, payload);
      // console.warn(response);
      yield put({
        type: 'updateState',
        payload: {
          doneList: Array.isArray(response.rows) ? response.rows : [],
          doneTotalCount: response.total,
        },
      });
    },

    *message({ payload }, { call, put }) {
      const { response } = yield call(getMessage, payload);
      if (response && response.ok) {
        const messageList = Array.isArray(response.datum) ? response.datum : [];
        messageList.map((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.messageTagName = item.messageTagName ? item.messageTagName.split(',') : [];
          if (item.releaseLevel && item.releaseLevel !== 'NORMAL') {
            item.messageTagName.push(item.releaseLevelName);
          }
          return true;
        });
        yield put({
          type: 'updateState',
          payload: {
            messageList,
          },
        });
      }
    },
    *messageCount({ payload }, { call, put }) {
      const { response } = yield call(getMessageCount, payload);
      if (response && response.ok) {
        const count = response.datum && response.datum > 99 ? '99+' : response.datum;
        yield put({
          type: 'updateState',
          payload: {
            messageTotalCount: count,
          },
        });
      }
    },

    *notify({ payload }, { call, put }) {
      const { response } = yield call(getNotify, payload);
      // console.warn(response);
      yield put({
        type: 'updateState',
        payload: {
          notifyList: Array.isArray(response.rows) ? response.rows : [],
          notifyTotalCount: response.total,
        },
      });
    },

    *recentWork({ payload }, { call, put }) {
      const { response } = yield call(queryRecentWork);
      yield put({
        type: 'updateState',
        payload: {
          recentWork: response.datum || [],
        },
      });
    },

    *changeTicketInfo({ payload }, { call, put }) {
      const { response } = yield call(changeTicketInfo, payload);
      yield put({ type: 'recentWork' });
    },

    *extrwork({ payload }, { call, put }) {
      const { response } = yield call(recentworkExtrwork, payload);
      yield put({ type: 'recentWork' });
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
