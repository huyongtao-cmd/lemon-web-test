import {
  resCapaPostRq,
  resCapaReviewRq,
  capaAbilityRq,
  waitCapaAbilityRq,
  saveResTrainingProgRq,
} from '@/services/user/center/myAbility';
import { queryTaskCapa } from '@/services/plat/capa/course';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';
import { flatten } from '@/utils/arrayUtils';
import { isEmpty, isNil } from 'ramda';

export default {
  namespace: 'checkAbility',

  state: {
    formData: {
      visible: false,
    },
    checkoutList: [],
    checkoutTotal: 0,
    waitList: [],
    waitTotal: 0,
  },

  effects: {
    *saveResTrainingProg({ payload }, { call, put }) {
      const { status, response } = yield call(saveResTrainingProgRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (payload.capaType) {
          yield put({
            type: 'capaAbility',
            payload: {
              abilityId: payload.id,
              capaType: payload.capaType,
            },
          });
        } else {
          yield put({
            type: 'waitCapaAbility',
            payload: {
              abilityId: payload.id,
              capaType: payload.renewType,
            },
          });
        }
        createMessage({ type: 'success', description: response.reason || '添加成功' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '添加失败' });
      return {};
    },
    *queryResCapaReviewList({ payload }, { call, put }) {
      const { status, response } = yield call(resCapaReviewRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            waitList: Array.isArray(response.rows) ? response.rows : [],
            waitTotal: response.total,
          },
        });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '待复核列表获取失败' });
      return {};
    },
    *queryResTaskCapaList({ payload }, { call, put }) {
      const { status, response } = yield call(queryTaskCapa, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            taskCapaList: Array.isArray(response.datum) ? response.datum : [],
            taskCapaTotal: Array.isArray(response.datum) ? response.datum.length : 0,
          },
        });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '待复核列表获取失败' });
      return {};
    },
    *queryResCapaPostList({ payload }, { call, put }) {
      const { status, response } = yield call(resCapaPostRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            checkoutList: Array.isArray(response.rows) ? response.rows : [],
            checkoutTotal: response.total,
          },
        });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '试岗考核中列表获取失败' });
      return {};
    },

    *capaAbility({ payload }, { call, put }) {
      const { response } = yield call(capaAbilityRq, payload);
      if (response.ok) {
        const { twAbilityView = [] } = response.datum;
        yield put({
          type: 'updateForm',
          payload: {
            ...response.datum,
            twAbilityView,
          },
        });
        return response;
      }
      createMessage({
        type: 'error',
        description: response.reason || '获取适岗考核能力考核点失败',
      });
      return {};
    },

    *waitCapaAbility({ payload }, { call, put }) {
      const { status, response } = yield call(waitCapaAbilityRq, payload);
      if (response.ok) {
        const { twAbilityView = [] } = response.datum;
        const tt = flatten(
          twAbilityView.map(v =>
            v?.trainingProgCourseViewList?.map(item => ({
              ...v,
              ...item,
              trainingProgCourseViewList: null,
              ids: genFakeId(-1),
            }))
          )
        );
        yield put({
          type: 'updateForm',
          payload: {
            ...response.datum,
            twAbilityView: tt,
          },
        });
        return response;
      }
      createMessage({
        type: 'error',
        description: response.reason || '获取待复核能力考核点失败',
      });
      return {};
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            visible: false,
          },
          checkoutList: [],
          checkoutTotal: 0,
          waitList: [],
          waitTotal: 0,
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
