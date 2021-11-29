import {
  noContractListRq,
  noContractDetailRq,
  noContractFlowRq,
} from '@/services/user/project/project';
import { fromQs } from '@/utils/stringUtils';
import { getViewConf } from '@/services/gen/flow';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';
import moment from 'moment';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'noContractProjCreate',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    formData: {},
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
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ noContractProjCreate }) => noContractProjCreate);
      const { status, response } = yield call(noContractFlowRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (!response.extInfo) {
          createMessage({ type: 'warn', description: '未获得账号资源ID,请联系系统管理员！' });
          return;
        }
        const { resId, resName } = response.extInfo || {};
        yield put({
          type: 'updateForm',
          payload: {
            applyResId: isNil(resId) ? undefined : resId + '',
            applyResName: resName,
            applyDate: moment().format('YYYY-MM-DD'),
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
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
  },
};
