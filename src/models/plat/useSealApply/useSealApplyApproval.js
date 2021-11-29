import { sealApplyGet, sealApplyPut } from '@/services/plat/useSealApply/useSealApply';
import { findResById } from '@/services/plat/businessCard/businessCard';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle } from '@/utils/production/outputUtil';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';

const defaultState = {
  formData: {},
  formMode: 'EDIT',
  pageConfig: {
    pageBlockViews: [],
  },
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  sealList: [],
  sealPurposeList: [],
  currentSealPurpose: undefined,
  attachments: [],
};

export default {
  namespace: 'useSealApplyApproval',

  state: defaultState,

  effects: {
    *fetchSealPurposeList({ payload }, { put, select }) {
      const {
        formData: { sealPurpose },
      } = yield select(({ useSealApplyApproval }) => useSealApplyApproval);

      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:SEAL_APPLY:SEAL_PURPOSE',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));

      yield put({
        type: 'updateState',
        payload: {
          sealPurposeList: list,
          currentSealPurpose: list.filter(item => item.value === sealPurpose),
        },
      });
    },

    *fetchSealList({ payload }, { put, select }) {
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:SEAL_APPLY:COPORATE_SEAL',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));

      yield put({
        type: 'updateState',
        payload: {
          sealList: list,
        },
      });
    },

    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(findResById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const { id, resName, baseBuId, baseBuName, ouId, ouName, mobile } = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              applyResId: isNil(id) ? undefined : id,
              applyResName: resName,
              baseBuId,
              baseBuName,
              ouId,
              ouName,
              contactNo: mobile,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(sealApplyPut, {
        entity: payload,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      // createMessage({ type: 'error', description: response.reason || '保存失败' });
      createMessage({ type: 'error', description: response.errors[0].msg || '保存失败' });
      return {};
    },
    *flowDetail({ payload }, { call, put }) {
      const { status, response } = yield call(sealApplyGet, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { seal, attachments = [], ...newData } = response.data;
          const enclosureSealApply = attachments.map(item => item.id);
          yield put({
            type: 'updateForm',
            payload: {
              ...newData,
              seal: seal.split(','),
              enclosureSealApply,
            },
          });
          yield put({
            type: 'fetchSealPurposeList',
            payload: {},
          });
          yield put({
            type: 'updateState',
            payload: { attachments },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
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
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
        });
        return response || {};
      }
      return {};
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

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
