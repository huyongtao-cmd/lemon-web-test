import {
  getBusConfigHandle,
  saveBusConfigHandle,
  getResolveFieldFn,
  getBusinessEventFn,
  saveEventInfoHandle,
  getSingleEventHandle,
  deleteEventHandle,
} from '@/services/sys/flowUpgrade';
import { getCmsInfo } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'flowUpgradeBusinessConfig',
  state: {
    formData: {},
    dataSource: [],
    dataSourceEvent: [],
    eventFormData: {},
  },

  effects: {
    *save({ payload }, { call, put }) {
      const params = payload;
      const { backPageParams } = params;
      delete params.backPageParams;
      const { response } = yield call(saveBusConfigHandle, params);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { id = '', flowid = '' } = backPageParams;
        closeThenGoto(
          `/sys/flowMen/UpgradeFlow/UpgradeFlowConfig?id=${id}&flowid=${flowid}&_refresh=0`
        );
      } else {
        const message = response.reason || '保存失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *getDetails({ payload }, { call, put }) {
      const { id = '' } = payload;
      const { status, response } = yield call(getBusConfigHandle, id);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
            },
          });
        }
      }
    },
    *getFlowTemInfo({ payload }, { call, put }) {
      const response = yield call(getCmsInfo, 'FLOW_TEMP_CODE');
      const responseCms = response.response;
      if (responseCms && responseCms.ok) {
        yield put({
          type: 'updateState',
          payload: {
            cmsInfo: responseCms.datum ? responseCms.datum.contents : '',
          },
        });
      }
    },
    *getResolveField({ payload }, { call, put }) {
      const { status, response } = yield call(getResolveFieldFn, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              dataSource: response.datum ? response.datum : [],
            },
          });
        }
      }
    },
    *getBusinessEvent({ payload }, { call, put }) {
      const { status, response } = yield call(getBusinessEventFn, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              dataSourceEvent: response.datum ? response.datum : [],
            },
          });
        }
      }
    },

    *getSingleEvent({ payload }, { call, put }) {
      const { status, response } = yield call(getSingleEventHandle, payload.id);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              eventFormData: response.datum ? response.datum : {},
            },
          });
        }
      }
    },

    *deleteEvent({ payload }, { call, put }) {
      const { status, response } = yield call(deleteEventHandle, payload.ids);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'error', description: '删除成功' });
          yield put({
            type: 'getBusinessEvent',
            payload: {
              defKey: payload.defKey,
            },
          });
        }
      }
    },

    *saveSingleEvent({ payload }, { call, put }) {
      const { status, response } = yield call(saveEventInfoHandle, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          yield put({
            type: 'getBusinessEvent',
            payload: {
              defKey: payload.defKey,
            },
          });
        }
      }
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
        dataSource: [],
      };
    },
    clearEventFormData(state, { payload }) {
      return {
        ...state,
        eventFormData: {},
      };
    },
  },
};
