import {
  queryResEnrollInfo,
  submitResEnroll,
  flowResEnroll,
  offerAndResRq,
  notSubmitListRq,
} from '@/services/plat/res/resprofile';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
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
  namespace: 'resExternalApply',

  state: {
    formData: {},
    type2Data: [],
    resData: [],
    resDataSource: [],
    baseBuData: [],
    baseBuDataSource: [],
    roleData: [],
    notSubmitResApplyList: [],
    defaultFormData: {
      apprStatus: 'NOTSUBMIT',
      pResData: {},
      baseBuObj: {},
    },
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resId, resName, jobGrade, baseBuName } = response.extInfo || {};
      const defaultFormData = {
        applyResId: isNil(resId) ? undefined : resId + '',
        applyResName: resName,
        applyDate: moment().format('YYYY-MM-DD'),
        apprStatus: 'NOTSUBMIT',
        resType: 'GENERAL',
        submit: 'true',
        ceoApprFlag: 'no',
      };
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     formData: defaultFormData,
      //   },
      // });
      const { status: sts, response: resp } = yield call(queryResEnrollInfo, payload);
      if (sts === 100) {
        // 主动取消请求
        return;
      }
      if (resp.ok) {
        const data = resp.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...defaultFormData,
              ...data,
              roleCode: data.roleCode ? data.roleCode.split(',') : [],
            },
          },
        });
      }
    },

    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ offerAndRes }) => offerAndRes);
      const { preEnrollDate, apprStatus, baseBuId: baseObj } = formData;
      const { id: resIds } = fromQs();
      const { id, ...newFormData } = formData;

      if (preEnrollDate && typeof preEnrollDate !== 'string') {
        formData.preEnrollDate = preEnrollDate.format('YYYY-MM-DD');
      }
      const { status, response } = yield call(offerAndResRq, {
        resId: resIds,
        ...newFormData,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        // 判断流程状态
        if (apprStatus && apprStatus !== 'NOTSUBMIT') {
          // 再次提交流程
          const { taskId, remark } = fromQs();
          let remarkVal = null;
          if (remark === 'undefined') {
            remarkVal = null;
          } else {
            remarkVal = remark;
          }
          const { status: sts } = yield call(pushFlowTask, taskId, {
            result: 'APPLIED',
            remark: remarkVal,
          });
          if (sts === 200) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto('/plat/res/profile/list');
          } else {
            createMessage({ type: 'warn', description: '提交失败' });
          }
        } else {
          // 发起新流程
          const { response: flow } = yield call(flowResEnroll, id);
          if (flow.ok) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto('/plat/res/profile/list');
            // router.push('/user/flow/process?type=procs');
          } else {
            createMessage({ type: 'error', description: flow.reason || '流程创建失败' });
          }
        }
      } else {
        createMessage({ type: 'warn', description: response.reason || '提交失败' });
      }
    },
    *noSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(notSubmitListRq);
      const list = Array.isArray(response.datum) ? response.datum : [];
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

    // 根据资源类型一获取资源类型二下拉数据
    *updateListType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2Data: Array.isArray(response) ? response : [] },
        });
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
