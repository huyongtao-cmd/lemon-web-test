import {
  savePointFn,
  getPointFn,
  flowPointFn,
  getSelectProj,
  getSelectProjRole,
  getSelectTaskEval,
} from '@/services/user/growth';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { equals, type, isNil, isEmpty, clone } from 'ramda';

export default {
  namespace: 'growthCheckPoint',

  state: {
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    formData: {},
    aboutProject: [],
    aboutTask: [],
    projectList: [],
    taskList: [],
    taskDataSource: [],
  },

  effects: {
    *getPointFnHandle({ payload }, { call, put }) {
      const { response } = yield call(getPointFn, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },
    *savePoint({ payload }, { call, put }) {
      const { response } = yield call(savePointFn, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A55',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto('/user/flow/process');
        }
      }
    },

    *saveFlowHandle({ payload }, { call, put }) {
      const { response } = yield call(flowPointFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/user/flow/process');
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
    *getSelectProj(_, { call, put }) {
      const { response } = yield call(getSelectProj);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projectList: response,
          },
        });
      }
    },
    *getSelectProjRole({ payload }, { call, put, select }) {
      const { response } = yield call(getSelectProjRole, payload.id);
      if (response.ok) {
        const { datum } = response;
        const { aboutProject } = yield select(({ growthCheckPoint }) => growthCheckPoint);
        const obj = clone(aboutProject);
        obj[payload.index] = {
          ...obj[payload.index],
          ...datum,
        };
        yield put({
          type: 'updateState',
          payload: {
            aboutProject: obj,
          },
        });
      }
    },
    *getSelectTaskEval({ payload }, { call, put }) {
      const { response } = yield call(getSelectTaskEval);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            taskList: response.datum,
          },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          fieldsConfig: {
            buttons: [],
            panels: {
              disabledOrHidden: {},
            },
          },
          flowForm: {
            remark: undefined,
            dirty: false,
          },
          formData: {},
          aboutProject: [],
          aboutTask: [],
          projectList: [],
          taskList: [],
          taskDataSource: [],
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
};
