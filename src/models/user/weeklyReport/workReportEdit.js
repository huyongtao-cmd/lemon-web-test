import {
  workReportDetail,
  workReportSave,
  queryStartTime,
} from '@/services/user/weeklyReport/weeklyReport';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

export default {
  namespace: 'workReportEdit',
  state: {
    formData: {},
    dataSource: [],
    resDataSource: [],
    workReportLog: {
      workDate: null,
      workLogPeriodType: null,
      workReportLogList: [],
    },
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(workReportDetail, payload);
      const { datum } = response;
      if (status === 200) {
        // console.log('response.datum', response.datum);
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...datum,
              // eslint-disable-next-line radix
              reportToResId: datum.reportToResId
                ? // eslint-disable-next-line radix
                  datum.reportToResId.split(',').map(id => Number.parseInt(id))
                : undefined,
            },
            dataSource: response.datum.logListViewList || [],
          },
        });
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
    *queryDetail({ payload }, { select, call, put }) {
      const { response } = yield call(queryStartTime, payload);
      if (response) {
        // console.log('aaaaaaaaaaaaaaa', response);
        let newDataSource = Array.isArray(response.datum) ? response.datum : [];
        newDataSource = newDataSource.map(data => ({
          timeSheetId: data.id,
          workSummary: data.workDesc,
          helpWork: data.remark,
          workDate: data.workDate,
          workPlan: data.workPlanId,
          workPlanName: data.workPlanName,
        }));
        yield put({
          type: 'updateState',
          payload: {
            dataSource: newDataSource,
          },
        });
      }
    },
    *modalSaveReport({ payload }, { put, call }) {
      const { response } = yield call(workReportSave, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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
    updateForm(state, action) {
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    },
  },
};
