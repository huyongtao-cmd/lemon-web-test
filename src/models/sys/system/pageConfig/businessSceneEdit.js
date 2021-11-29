import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import {
  businessPageCreate,
  businessPageModify,
  businessSceneDetail,
  businessPagePermissionDelete,
} from '@/services/sys/system/pageConfig';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'businessSceneEdit',
  state: {
    formData: {},
    pageBlockEntities: [],
    pageButtonEntities: [],
    pageTabEntities: [],
    scenePageBlockEntities: [],
    scenePageButtonEntities: [],
    scenePageTabEntities: [],
    pageButtons: [],
    businessPageBlockModalVisible: false,
    businessPageMainModalVisible: false,
    businessPageBlockButtonVisible: false,
    businessPageTabVisible: false,
    businessPageBlockPermissionVisible: false,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessSceneDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
            pageBlockEntities: response.pageBlockViews,
            pageButtonEntities: response.pageButtonViews,
            pageTabEntities: response.pageTabViews,
            scenePageBlockEntities: response.scenePageBlockViews,
            scenePageButtonEntities: response.scenePageButtonViews,
            scenePageTabEntities: response.scenePageTabViews,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(businessPageModify, payload);
      } else {
        // 新增
        response = yield call(businessPageCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
          },
        });
        closeThenGoto(`/sys/system/function`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    *deletePermission({ payload }, { call, put }) {
      const response = yield call(businessPagePermissionDelete, payload);
      if (response.response && response.response.ok) {
        const param = fromQs();
        // 保存成功
        yield put({
          type: 'query',
          payload: {
            sceneId: param.id,
          },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '操作失败' });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
