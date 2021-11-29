import {
  leavelDetailRq,
  myVacationListRq,
  checkresultListRq,
} from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'leaveDetail',

  state: {
    formData: {},
    dataSource: [],
    myVacationList: [],
    resChkData: [],
    finChkData: [],
    offiChkData: [],
    hrChkData: [],
    ITChekData: [],
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(leavelDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
            },
          });
          return data;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      return {};
    },
    *myVacationList({ payload }, { call, put, select }) {
      const { status, response } = yield call(myVacationListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const list = Array.isArray(response) ? response : [];
        yield put({
          type: 'updateState',
          payload: {
            myVacationList: list,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取假期失败' });
      }
    },
    *checkresultList({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultListRq, payload);
      if (status === 200 && response.ok) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        yield put({
          type: 'updateState',
          payload: {
            dataSource: list,
            resChkData: list.filter(v => v.chkCalss === 'LEAVE_RES_CHK'),
            finChkData: list.filter(v => v.chkCalss === 'LEAVE_FIN_CHK'),
            offiChkData: list.filter(v => v.chkCalss === 'LEAVE_OFFI_CHK'),
            hrChkData: list.filter(v => v.chkCalss === 'LEAVE_HR_CHK'),
            ITChekData: list.filter(v => v.chkCalss === 'LEAVE_IT_CHK'),
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取办理事项列表失败' });
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
