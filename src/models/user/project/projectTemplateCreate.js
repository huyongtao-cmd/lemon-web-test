import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import {
  createProjectTemplate,
  modifyProjectTemplate,
  queryProjectTemplate,
} from '@/services/user/project/project';
import { selectFinperiod } from '@/services/user/Contract/sales';
import { closeThenGoto } from '@/layouts/routerControl';
import { doApprove, doReject } from '@/services/user/expense/flow';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'projectTemplateCreate',
  state: {
    formData: {},
    activityList: [],
    activityDeleteList: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryProjectTemplate, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.tmpl,
            activityList: response.tmplActs.slice(),
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        // 修改
        // if (payload.briefStatus !== 'CREATE') {
        //   createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
        //   return;
        // }
        response = yield call(modifyProjectTemplate, payload);
      } else {
        // 新增
        response = yield call(createProjectTemplate, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: { id: response.response.datum.tmpl.id },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
