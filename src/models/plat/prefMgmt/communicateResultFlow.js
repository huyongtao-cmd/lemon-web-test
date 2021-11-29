import {
  assessedSaveRq,
  assessorSaveRq,
  checkassessedRq,
  hrSaveRq,
  preexamContentDetailRq,
  communicateInfoRq,
} from '@/services/plat/communicate';
import { businessPageDetailByNo, businessPageDetailByNos } from '@/services/sys/system/pageConfig';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

export default {
  namespace: 'communicateResultFlow',
  state: {
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    checkAssessedData: {},
    fieldsConfig: {},
    assPersonList: [],
    assessorList: [],
    pageConfig: {},
    assessedPageConfig: {},
    pageConfigs: {},
    communicateInfo: {}, // 沟通信息
    communicateView: {},
    communicateResView: {},
  },
  effects: {
    // 在考核人页面查看被考核人填写内容
    *queryAssessedList({ payload }, { call, put }) {
      const { status, response } = yield call(checkassessedRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateCheckAssessedData',
            payload: {
              ...response.datum,
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      return {};
    },
    *assessedSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(assessedSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *assessorSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(assessorSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *hrSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(hrSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 在hr填写内容页面查看考核人和被考核人填写信息
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(preexamContentDetailRq, payload);
      if (status === 200) {
        if (response) {
          const { rows } = response;
          const assPersonList = [];
          const assessorList = [];
          if (rows.length > 0) {
            rows.map(item => {
              if (item.communicateType === 'ASSESSED') {
                assPersonList.push(item);
              } else if (item.communicateType === 'ASSESSOR') {
                assessorList.push(item);
              }
              return true;
            });
            yield put({
              type: 'updateState',
              payload: {
                assPersonList,
                assessorList,
              },
            });
          } else {
            createMessage({ type: 'error', description: response.reason });
          }
        }
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    // 在考核页面的弹窗获获取被考核人的可配置化字段
    *getAssessedPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            assessedPageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    *getPageConfigs({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNos, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfigs: response.configInfos,
          },
        });
        return response;
      }
      return {};
    },
    *queryCommunicate({ payload }, { call, put }) {
      const { status, response } = yield call(communicateInfoRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              communicateView: response.datum.communicateView,
              communicateResView: response.datum.communicateResView,
            },
          });
        }
        return response;
      }
      return {};
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateFormInfo(state, { payload }) {
      const { communicateInfo } = state;
      const newFormData = { ...communicateInfo, ...payload };
      return {
        ...state,
        communicateInfo: newFormData,
      };
    },
    updateCheckAssessedData(state, { payload }) {
      const { checkAssessedData } = state;
      const newFormData = { ...checkAssessedData, ...payload };
      return {
        ...state,
        checkAssessedData: newFormData,
      };
    },
  },
};
