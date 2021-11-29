import { getTodo, getBack, getMessage, getMessageCount } from '@/services/gen/center';
import {
  objectiveListRq,
  userHomeBaseDataRq,
  userHomeMyShortCutRq,
  userHomeTodoTasksRq,
  userHomeObjectiveListRq,
} from '@/services/okr/okrMgmt';
import createMessage from '@/components/core/AlertMessage';
import { getNotify } from '@/services/user/flow/flow';

/**
 * OKR个人中心用户信息状态
 */

const defaultSearchForm = {};
const defaultFormData = { activeTab: '1' };

export default {
  namespace: 'okrUserCenter',

  state: {
    myShortCut: [],
    sysShortCuts: [],
    newSortNo: null,
    todoList: [],
    doneList: [],
    notifyList: [],
    myInfo: {},
    recentWork: [],
    activeTabKey: '1',
    messageList: [],
    formData: defaultFormData,
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    twOkrObjectiveView: {}, // 目标
    findOkrResWorkPlanByList: {}, // 工作计划
    findOkrObjectByList: [], // 目标进度
    findOkrObjectScoreByList: [], // 评分
    userHomeTodoTasksList: [], // 代办 - 提醒部分
    backList: [], // 我的退回
    backTotalCount: 0,
    msgTotalCount: 0, // 消息通知
    msgList: [],
  },

  effects: {
    // 工时等提醒类代办，流程代办还是以前接口
    *userHomeTodoTasks({ payload }, { call, put }) {
      const { status, response } = yield call(userHomeTodoTasksRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            userHomeTodoTasksList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *userHomeBaseData(_, { call, put }) {
      const { status, response } = yield call(userHomeBaseDataRq);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: response.datum,
          });
          yield put({
            type: 'updateState',
            payload: {
              twOkrObjectiveView: response.datum.twOkrObjectiveView || {},
              findOkrObjectByList: response.datum.findOkrObjectByList || [],
              findOkrObjectScoreByList: response.datum.findOkrObjectScoreByList || [],
              findOkrResWorkPlanByList: response.datum.findOkrResWorkPlanByList || [],
            },
          });
        } else {
          createMessage({ type: 'error', description: '查询失败' });
        }
      } else {
        createMessage({ type: 'error', description: '查询失败' });
      }
    },
    *userHomeMyShortCut({ payload }, { call, put }) {
      const { response } = yield call(userHomeMyShortCutRq);
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

    *message({ payload }, { call, put }) {
      const { response } = yield call(getMessage, payload);
      if (response && response.ok) {
        const messageList = Array.isArray(response.datum) ? response.datum : [];
        yield put({
          type: 'updateState',
          payload: {
            msgList: messageList,
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
            msgTotalCount: count,
          },
        });
      }
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
