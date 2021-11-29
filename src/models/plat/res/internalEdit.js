import { salesBuRq } from '@/services/plat/res/resprofile';
import { internalCreateRq } from '@/services/plat/res/internal';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';

const defaultFormData = {
  submit: true,
};

export default {
  namespace: 'internalEdit',
  state: {
    formData: defaultFormData,
    resDataSource: [],
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
            resId,
            recommDate: moment().format('YYYY-MM-DD'),
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取当前登录信息失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ internalEdit }) => internalEdit);
      const { id } = fromQs();
      const parmars = {
        jobId: Number(id),
        ...formData,
      };
      const { status, response } = yield call(internalCreateRq, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '推荐成功' });
          closeThenGoto(`/user/flow/process?type=procs`);
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
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

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: { formData: defaultFormData },
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
