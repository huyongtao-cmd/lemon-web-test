import {
  queryReportDetail,
  saveReport,
  uploadReport,
  queryReportBaseUrl,
} from '@/services/sys/system/report';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {
  id: null,
  reportTitle: null,
  showMode: null,
  reportCode: null,
  reportStatus: '1',
  reportMark: null,
  relatedIds: [],
  parameEntities: [],
  delParameIds: [],
};

export default {
  namespace: 'reportMgtEdit',
  state: {
    formData: defaultFormData,
    selectedRowKeys: [],
    dataList: [],
  },
  effects: {
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: { formData: defaultFormData, dataList: [] },
      });
    },

    *baseUrl({ payload }, { call, put }) {
      const { response } = yield call(queryReportBaseUrl, { reportCode: 'REPORT_BASE_URL' });
      const { datum = {} } = response;
      const reportUrl = datum.reportUrl + '?op=view';
      if (response.ok) {
        yield put({
          type: 'updateForm',
          payload: { reportUrl },
        });
        yield put({
          type: 'updateState',
          payload: { reportUrl },
        });
      }
    },

    *query({ payload }, { call, put }) {
      const { response } = yield call(queryReportDetail, payload);
      const { response: urlRes } = yield call(queryReportBaseUrl, {
        reportCode: 'REPORT_BASE_URL',
      });
      if (response.ok) {
        const { datum = {} } = response;
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...defaultFormData,
              ...datum,
              relatedIds: datum.relatedIds ? datum.relatedIds.split(',').map(Number) : [],
            },
            dataList: Array.isArray(datum.parameViews) ? datum.parameViews : [],
            reportUrl: urlRes.datum.reportUrl + '?op=' + datum.showMode,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      const { formData, dataList } = payload;
      const newFormData = {
        ...formData,
        // relateds: Array.isArray(formData.relateds) ? formData.relateds.join(',') : '',
        parameEntities: dataList,
      };
      const { status, response } = yield call(saveReport, newFormData);
      if (status === 100) return;
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/sys/system/report');
        return;
      }
      createMessage({ type: 'error', description: '保存失败,请检查必填项' });
    },

    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(uploadReport, payload);
      if (status === 100) return;
      if (response.ok) {
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
