import { salesBuRq } from '@/services/plat/res/resprofile';
import { recruitCreateRq, recruitDetailRq, recruitEditRq } from '@/services/plat/res/recruit';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { queryCascaderUdc } from '@/services/gen/app';

const defaultFormData = {
  fullPart: 'FULL',
  workStyle: 'ON_SITE',
  timeRequirement: 'FIXED',
  recruitStatus: 'RECRUITMENT',
};

export default {
  namespace: 'recruitEdit',
  state: {
    formData: defaultFormData,
    resDataSource: [],
    baseBuDataSource: [],
    jobType2: [],
  },

  effects: {
    *queryUserMessage({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId } = response.extInfo || {};
        yield put({
          type: 'updateForm',
          payload: {
            recommPicResid: resId,
            createTime: moment().format('YYYY-MM-DD'),
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取当前登录信息失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ recruitEdit }) => recruitEdit);
      const { workplace, ...newFormData } = formData;
      const params = { workplace: workplace.join(','), ...newFormData };
      const { status, response } = yield call(recruitCreateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      return {};
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(recruitDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { workplace } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                workplace: !isNil(workplace) && !isEmpty(workplace) ? workplace.split(',') : [],
              },
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ recruitEdit }) => recruitEdit);
      const { workplace, ...newFormData } = formData;
      const params = { workplace: workplace.join(','), ...newFormData };
      const { status, response } = yield call(recruitEditRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      return {};
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },

    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
    },

    // 分类一关联分类二
    *jobTypeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:JOB_TYPE2',
        parentDefId: 'RES:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { jobType2: Array.isArray(response) ? response : [] },
        });
      }
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: { formData: defaultFormData, jobType2: [] },
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
  },
};
