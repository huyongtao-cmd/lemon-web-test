import {
  objectiveListRq,
  objectiveEditRq,
  targetEvalDetailRq,
  targetResultUpdateRq,
  saveCommentRq,
  targetResultFlowDetailRq,
  targetResultSaveRq,
  targetResultEvalPassRq,
  targetResultFinalEvalRq,
} from '@/services/okr/okrMgmt';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty, clone } from 'ramda';

const defaultFormData = {};

export default {
  namespace: 'targetEval',
  state: {
    formData: defaultFormData,
    twOkrKeyresultView: [],
    // 流程相关
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
  },

  effects: {
    *targetResultFlowDetail({ payload }, { call, put }) {
      const { status, response } = yield call(targetResultFlowDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: { ...response.datum, twOkrKeyresultView: null },
              twOkrKeyresultView: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      }
    },
    *targetResultFinalEval({ payload }, { call, put, select }) {
      const { formData, twOkrKeyresultView } = yield select(({ targetEval }) => targetEval);

      const newDormData = clone(formData);
      formData.twOkrObjectiveEnetity = newDormData;
      formData.twOkrKeyresultScoreEnetity = twOkrKeyresultView;
      formData.twOkrKeyresultEnetity = twOkrKeyresultView;

      const { status, response } = yield call(targetResultFinalEvalRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
    },
    *targetResultEvalPass({ payload }, { call, put, select }) {
      const { formData, twOkrKeyresultView } = yield select(({ targetEval }) => targetEval);

      const newDormData = clone(formData);
      formData.twOkrObjectiveEnetity = newDormData;
      formData.twOkrKeyresultScoreEnetity = twOkrKeyresultView;
      formData.twOkrKeyresultEnetity = twOkrKeyresultView;

      const { status, response } = yield call(targetResultEvalPassRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
    },
    *targetResultSave({ payload }, { call, put, select }) {
      const { formData, twOkrKeyresultView } = yield select(({ targetEval }) => targetEval);

      const newDormData = clone(formData);
      formData.twOkrObjectiveEnetity = newDormData;
      formData.twOkrKeyresultScoreEnetity = twOkrKeyresultView;
      formData.twOkrKeyresultEnetity = twOkrKeyresultView;

      const { status, response } = yield call(targetResultSaveRq, {
        ...formData,
        objectId: formData.id,
        id: null,
        ...payload,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process?type=procs`);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
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
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(targetEvalDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: { ...response.datum, twOkrKeyresultView: null, updDesc: null },
              twOkrKeyresultView: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      }
    },
    *saveComment({ payload }, { call, put, select }) {
      const { formData, twOkrKeyresultView } = yield select(({ targetEval }) => targetEval);

      formData.twOkrKeyresultEnetity = twOkrKeyresultView;
      formData.twOkrKeyresultScoreEnetity = twOkrKeyresultView;

      const { status, response } = yield call(saveCommentRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *targetResultUpdate({ payload }, { call, put, select }) {
      const { formData, twOkrKeyresultView } = yield select(({ targetEval }) => targetEval);
      formData.twOkrKeyresultEnetity = twOkrKeyresultView;
      const { status, response } = yield call(targetResultUpdateRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *submit({ payload }, { call, put, select }) {
      const { formData, keyresultList } = yield select(({ targetEval }) => targetEval);
      formData.twOkrKeyresultEnetity = keyresultList;
      const { status, response } = yield call(objectiveEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          keyresultList: [],
        },
      });
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
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
