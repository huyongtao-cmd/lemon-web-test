import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import update from 'immutability-helper';
import { isNil } from 'ramda';
import { excelImport } from '@/services/workbench/project';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataSource: [],
  deleteKeys: [],
  planTypeVisible: false,
};
export default {
  namespace: 'weeklyList',

  state: defaultState,

  effects: {
    *upload({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(excelImport, payload, 'planListEdit/success');

      message({ type: 'success' });

      return data;
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),
  },
};
