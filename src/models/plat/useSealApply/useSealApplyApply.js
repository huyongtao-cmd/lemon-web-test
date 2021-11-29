import { sealApplyPost } from '@/services/plat/useSealApply/useSealApply';
import { queryUserPrincipal } from '@/services/gen/user';
import { findResById } from '@/services/plat/businessCard/businessCard';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle } from '@/utils/production/outputUtil';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  sealList: [],
  sealPurposeList: [],
  currentSealPurpose: undefined,
  attachments: [],
};
export default {
  namespace: 'useSealApplyApply',

  state: defaultState,

  effects: {
    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(findResById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const { id, resName, baseBuId, baseBuName, ouId, ouName, mobile, emailAddr } =
            response.datum || {};
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
              email: emailAddr,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },
    *createSubmit({ payload }, { call, put, select }) {
      const { status, response } = yield call(sealApplyPost, { entity: payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      createMessage({ type: 'error', description: response.errors[0].msg || '保存失败' });
      return {};
    },
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId, resName, baseBuId, baseBuName, ouId, ouName } = response.extInfo || {};
        const { phone, email } = response.info || {};
        yield put({
          type: 'updateForm',
          payload: {
            applyResId: isNil(resId) ? undefined : resId + '',
            applyResName: resName,
            applyDate: moment().format('YYYY-MM-DD'),
            baseBuId,
            baseBuName,
            ouId,
            ouName,
            contactNo: phone,
            submit: 'true',
            email,
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
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

    *fetchSealPurposeList({ payload }, { put, select }) {
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
