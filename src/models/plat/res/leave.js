import {
  leavelDetailRq,
  myVacationListRq,
  checkresultListRq,
  hrcheckListRq,
  checkresultUpdateRq,
  saveEntityRq,
} from '@/services/plat/res/resprofile';
import { closeFlowRq } from '@/services/user/flow/flow';
import { getViewConf } from '@/services/gen/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';

export default {
  namespace: 'leave',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
    dataSource: [],
    myVacationList: [],
    resChkData: [],
    finChkData: [],
    offiChkData: [],
    hrChkData: [],
    ITChekData: [],
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
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
        },
      });
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
    *hrcheckList({ payload }, { call, put }) {
      const { status, response } = yield call(hrcheckListRq, payload);
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
    *checkresultUpdate({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultUpdateRq, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '处理成功' });
        const { id } = fromQs();
        yield put({
          type: 'checkresultList',
          payload: id,
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '处理失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ leave }) => leave);
      const { contractEndDate, lastJobDate } = formData;
      if (lastJobDate && typeof lastJobDate !== 'string') {
        formData.lastJobDate = lastJobDate.format('YYYY-MM-DD');
      }
      if (contractEndDate && typeof contractEndDate !== 'string') {
        formData.contractEndDate = contractEndDate.format('YYYY-MM-DD');
      }
      const parmars = { ...formData, ...payload };
      const { status, response } = yield call(saveEntityRq, parmars);
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
    *closeFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          fieldsConfig: {
            buttons: [],
            panels: {
              disabledOrHidden: {},
            },
          },
          resChkData: [],
          finChkData: [],
          offiChkData: [],
          hrChkData: [],
          ITChekData: [],
          myVacationList: [],
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
