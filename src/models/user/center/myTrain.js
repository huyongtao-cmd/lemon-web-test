import {
  resTrainingProgSelectRq,
  resTrainingProgDelRq,
  resTrainingProgSelTrainRq,
} from '@/services/user/myTrain';
import { selectCapasetLevel, selectCapaLevel } from '@/services/gen/list';
import { launchFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import router from 'umi/router';
import { isEmpty } from 'ramda';

export default {
  namespace: 'myTrain',

  state: {
    formData: {},
    trainListTodo: [], // 培训列表待完成
    trainListDone: [], // 培训列表已完成
    courseList: [], // 课程列表
    trainListTodoChecked: {}, // 从我的赋能页面跳转过来之后待完成培训要有选中的一条记录
  },

  effects: {
    // 左侧培训课程列表
    *resTrainingProgSelTrain({ payload }, { call, put }) {
      const { status, response } = yield call(resTrainingProgSelTrainRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              courseList: Array.isArray(response?.datum)
                ? response?.datum.map((v, i) => {
                    if (i && v.isComplete === '1') {
                      const tt = response?.datum
                        .slice(0, i)
                        .filter(item => item.trnRequirement === 'REQUIRED');
                      if (
                        !isEmpty(tt) &&
                        tt[tt.length - 1].isComplete === '1' &&
                        v.sortLockedFlag !== 'N'
                      ) {
                        return { ...v, lock: true };
                      }
                    }
                    return { ...v, lock: false };
                  })
                : [],
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '获取培训详情失败' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取培训详情失败' });
      return {};
    },
    // 右侧培训列表删除
    *resTrainingProgDel({ payload }, { call, put }) {
      const { status, response } = yield call(resTrainingProgDelRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '删除失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
      return {};
    },
    // 右侧培训列表
    *resTrainingProgSelect({ payload }, { call, put }) {
      const { status, response } = yield call(resTrainingProgSelectRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { trnStatus } = payload;
          if (trnStatus === '0') {
            yield put({
              type: 'updateState',
              payload: {
                trainListTodo: Array.isArray(response?.datum)
                  ? response?.datum.map((v, index) => ({ ...v, checked: !index }))
                  : [],
              },
            });
            yield put({
              type: 'updateForm',
              payload: {
                ...response?.datum[0],
              },
            });

            if (response?.datum[0]?.trainingProgId) {
              yield put({
                type: 'resTrainingProgSelTrain',
                payload: {
                  id: response?.datum[0].trainingProgId,
                },
              });
            }
          } else {
            yield put({
              type: 'updateState',
              payload: {
                trainListDone: Array.isArray(response?.datum)
                  ? response?.datum.map((v, index) => ({ ...v, checked: !index }))
                  : [],
              },
            });
          }
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '获取培训列表失败' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取培训列表失败' });
      return {};
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          capasetData: [],
          growthTreeData: [],
          growthTreeInfo: {},
          infoLoad: false,
          selectTagIds: [],
          trainListTodoChecked: {},
        },
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
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        location.state &&
          dispatch({
            type: 'updateState',
            payload: {
              trainListTodoChecked: location.state.item,
            },
          });
      });
    },
  },
};
