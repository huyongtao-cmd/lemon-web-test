import {
  abNormalRuleDetail,
  abNormalRuleSave,
  abNormalRuleUpdate,
  getAbNormalInfo,
} from '@/services/plat/attendance/attendance';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'attendanceAbnormalRuleDetail',
  state: {
    formData: {},
    abNormalTips: '',
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(abNormalRuleDetail, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum ? response.datum : {},
          },
        });
      }
    },

    *queryTips({ payload }, { call, put }) {
      const { response } = yield call(getAbNormalInfo, payload.proType);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.datum,
            total: response.datum ? response.datum.length : 0,
          },
        });
      }
    },

    *save({ payload }, { call }) {
      const { params } = payload;
      const isSave = !params.id;
      const interfaceName = isSave ? abNormalRuleSave : abNormalRuleUpdate;
      const tipsName = isSave ? '提交' : '更新';
      const { response } = yield call(interfaceName, params);
      if (response && response.ok) {
        createMessage({ type: 'success', description: `${tipsName}成功` });
        closeThenGoto(`/hr/attendanceMgmt/attendance/AbnormalRule`);
      } else {
        createMessage({ type: 'error', description: `${tipsName}失败` });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
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
  },
};
