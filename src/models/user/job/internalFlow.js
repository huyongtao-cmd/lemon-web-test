import { internalCreateRq, internalDetailRq, internalEditRq } from '@/services/plat/res/internal';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';

const defaultFormData = {};

export default {
  namespace: 'internalFlow',
  state: {
    formData: defaultFormData,
    resDataSource: [],
    baseBuDataSource: [],
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
      const { formData } = yield select(({ internalFlow }) => internalFlow);
      const { status, response } = yield call(internalEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(internalDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
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
    *create({ payload }, { call, put, select }) {
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
