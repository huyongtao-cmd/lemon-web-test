import {
  findResById,
  saveBusinessCardRq,
  selectFlowDetailRq,
  detailRq,
} from '@/services/plat/businessCard/businessCard';
import {
  queryCapaTree,
  queryCapaTreeDetail,
  queryCapaTreeDetailWithText,
} from '@/services/plat/capa/capa';
import { getViewConf } from '@/services/gen/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'bussinessCard',

  state: {
    formData: {
      mailFlag: 'COMPANY',
    },
    resData: [],
    baseBuData: [],
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
    pageConfig: {
      pageBlockViews: [],
    },
  },

  effects: {
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
    *flowDetail({ payload }, { call, put }) {
      console.warn('payload', payload);
      const { status, response } = yield call(selectFlowDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.data,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },

    *createSubmit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ bussinessCard }) => bussinessCard);
      const { id, ...newParams } = formData;

      const { status, response } = yield call(saveBusinessCardRq, {
        ...newParams,
        ...payload,
        submit: true,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      createMessage({ type: 'error', description: response.errors[0].defaultMsg || '保存失败' });
      return {};
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ bussinessCard }) => bussinessCard);

      const { status, response } = yield call(saveBusinessCardRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return {};
    },
    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(findResById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          //  const { apprStatus,englishName:ename,emailAddr:email, ...data } = response.datum || {};
          const {
            apprStatus,
            englishName: ename,
            emailAddr: email,
            mobile,
            ouId,
            baseBuName,
            ...data
          } = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
              ename,
              email,
              mailFlag: 'COMPANY',
              remark: null, // remark是流程里的意见
              mobile,
              baseBuName,
              ouId,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },
    // 默认获取当前登录人的资源信息
    // *queryUserPrincipal({ payload }, { call, put, select }) {
    //   const { status, response } = yield call(queryUserPrincipal);
    //   if (status === 100) {
    //     // 主动取消请求
    //     return;
    //   }
    //   if (status === 200) {
    //     const { resId, resName } = response.extInfo || {};
    //     yield put({
    //       type: 'queryResDetail',
    //       payload: resId
    //     });
    //     yield put({
    //       type: 'updateForm',
    //       payload: {
    //         applyResId:resId
    //         // applyResId: isNil(resId) ? undefined : resId + '',
    //         // applyResName: resName,
    //         // applyDate: moment().format('YYYY-MM-DD'),
    //         // submit: 'true',
    //       },
    //     });
    //   } else {
    //     createMessage({ type: 'error', description: '获取申请人信息失败' });
    //   }
    // },
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
    // 获取流程配置
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      let senceNo = '';

      if (response.taskKey === 'RES_R01_02_BU_CHARGRE_CHK') {
        senceNo = ':BU_APPR';
      }
      if (response.taskKey === 'RES_R01_03_AT_CHARGRE_CHK') {
        senceNo = ':ADM_PRO_APPR';
      }
      if (response.taskKey === 'RES_R01_04_AD_CHARGRE_CHK') {
        senceNo = ':ADM_DEL_APPR';
      }
      if (response.taskKey === 'RES_R01_05_CON') {
        senceNo = ':APPLY_RES_APPR';
      }
      // console.log("aaaa",response)

      if (status === 200) {
        yield put({
          type: 'getPageConfig',
          payload: { pageNo: 'CARD_APPLY' + senceNo },
        });
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
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { mailFlag: 'COMPANY' },
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
