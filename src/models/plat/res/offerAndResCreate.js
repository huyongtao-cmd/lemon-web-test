import {
  queryResEnrollInfo,
  submitResEnroll,
  flowResEnroll,
  offerAndResRq,
  notSubmitListRq,
  getOfferAndResDetailsRq,
  salesBuRq,
  findJobIsUsedRq,
  getOldSaleBuRq,
} from '@/services/plat/res/resprofile';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectUsers, selectUsersAll } from '@/services/sys/user';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectFilterRole } from '@/services/sys/system/datapower';
import { pushFlowTask } from '@/services/gen/flow';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';

export default {
  namespace: 'offerAndResCreate',

  state: {
    formData: {},
    type2Data: [],
    resData: [],
    resDataSource: [],
    baseBuData: [],
    baseBuDataSource: [],
    oldSaleBuBuDataSource: [],
    roleData: [],
    notSubmitList: [],
    findJobIsUsedList: [],
    defaultFormData: {
      apprStatus: 'NOTSUBMIT',
      pResData: {},
      baseBuObj: {},
    },
    pageConfig: {},
    type2: [],
  },

  effects: {
    // 查内部资源对应的资源类型二
    *typeChange({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: 'INTERNAL_RES',
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    *findJobIsUsed({ payload }, { call, put }) {
      const { response } = yield call(findJobIsUsedRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          findJobIsUsedList: list,
        },
      });
    },
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resId, resName } = response.extInfo || {};
      const defaultFormData = {
        applyResId: isNil(resId) ? undefined : resId + '',
        applyResName: resName,
        applyDate: moment().format('YYYY-MM-DD'),
        apprStatus: 'NOTSUBMIT',
        resType: 'GENERAL',
        submit: 'true',
        ceoApprFlag: 'no',
        periodFlag: 'LONG',
      };
      const { status: sts, response: resp } = yield call(queryResEnrollInfo, payload);
      if (sts === 100) {
        // 主动取消请求
        return;
      }
      if (sts === 200) {
        if (resp && resp.ok) {
          const data = resp.datum || {};
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...defaultFormData,
                ...data,
                roleCode: data.roleCode ? data.roleCode.split(',') : [],
                resType1: 'INTERNAL_RES',
                resType2: data.resType1 === 'EXTERNAL_RES' ? undefined : data.resType2,
                entryType: data.resStatus === 1 ? 'FIRST_INDUCTION' : '',
              },
            },
          });
        } else {
          const message = resp.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ offerAndResCreate }) => offerAndResCreate);
      const { preEnrollDate, apprStatus, baseBuId: baseObj, birthday, internDate } = formData;
      const { id: resIds } = fromQs();
      if (preEnrollDate && typeof preEnrollDate !== 'string') {
        formData.preEnrollDate = preEnrollDate.format('YYYY-MM-DD');
      }
      if (internDate && typeof internDate !== 'string') {
        formData.internDate = internDate.format('YYYY-MM-DD');
      }
      if (birthday) {
        formData.birthday = moment(birthday).format('YYYY-MM-DD');
      }
      const { id, ...newFormData } = formData;
      const { status, response } = yield call(offerAndResRq, {
        resId: resIds,
        ...newFormData,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/hr/res/profile/list');
      } else {
        createMessage({ type: 'error', description: response.reason || '流程创建失败' });
      }
    },
    *noSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(selectUsersAll);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          notSubmitList: list,
        },
      });
    },

    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
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
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },

    *salesBu({ payload }, { call, put }) {
      const { response } = yield call(salesBuRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },
    *oldSaleBu({ payload }, { call, put }) {
      const { response } = yield call(getOldSaleBuRq, payload);
      const list = Array.isArray(response.datum) ? response.datum : [];
      yield put({
        type: 'updateState',
        payload: {
          oldSaleBuBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { oldSaleBu: '', oldSaleBuName: '' },
      });
    },

    *role({ payload }, { call, put }) {
      const { response } = yield call(selectFilterRole, payload);
      yield put({
        type: 'updateState',
        payload: {
          roleData: Array.isArray(response) ? response : [],
        },
      });
    },
    // 获取配置字段
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
