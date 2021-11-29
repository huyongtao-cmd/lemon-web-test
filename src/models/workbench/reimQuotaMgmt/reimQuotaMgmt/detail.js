import { expenseQuotaDetailRq } from '@/services/workbench/reimQuotaMgmt';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';

const defaultState = {
  formData: {
    quotaStatus: true,
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  dataList: [],
  modalformdata: {},
  visible: false,
  relatedDimensionsList: [],
  dimension1List: [],
  dimension2List: [],
};
export default {
  namespace: 'reimQuotaMgmtDetail',

  state: defaultState,

  effects: {
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

    *expenseQuotaDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(expenseQuotaDetailRq, payload);

      const { detailView, ...parmars } = data;

      yield put({
        type: 'updateForm',
        payload: {
          ...data,
        },
      });
      yield put({
        type: 'updateState',
        payload: {
          dataList: detailView,
        },
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),
  },
};
