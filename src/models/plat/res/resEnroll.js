import { queryResEnrollInfo, submitResEnroll, flowResEnroll } from '@/services/plat/res/resprofile';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectFilterRole } from '@/services/sys/system/datapower';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';

const defaultFormData = {
  accessLevel: null,
  apprStatus: 'NOTSUBMIT',
  baseBuId: 0,
  baseBuName: '',
  baseCity: '',
  baseCityName: '',
  birthday: '',
  busitripFlag: null,
  compfeeQuota: null,
  coopType: '',
  coopTypeName: '',
  createUserId: 0,
  docId: 0,
  empNo: null,
  enrollDate: '',
  eqvaRatio: 0,
  foreignName: '',
  gender: '',
  genderName: '',
  id: 0,
  idNo: '',
  idType: '',
  idTypeName: '',
  initiator: 0,
  jobGrade: '',
  ouId: 0,
  ouName: '',
  personName: '',
  presId: 0,
  presName: '',
  resName: '',
  resNo: null,
  resType1: '',
  resType1Name: '',
  resType2: null,
  resType2Name: null,
  roleCode: [],
  roleCodeName: null,
  salaryMethod: null,
  salaryMethodName: null,
  salaryPeriod: null,
  salaryPeriodName: null,
  serviceClockFrom: null,
  serviceClockTo: null,
  serviceType: null,
  serviceTypeName: null,
  telfeeQuota: null,
  pResData: {},
  baseBuObj: {},
};

export default {
  namespace: 'platResEnroll',

  state: {
    formData: defaultFormData,
    type2Data: [],
    resData: [],
    resDataSource: [],
    baseBuData: [],
    baseBuDataSource: [],
    roleData: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
        },
      });
      const { status, response } = yield call(queryResEnrollInfo, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        const data = response.datum || {};
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

    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ platResEnroll }) => platResEnroll);
      const {
        birthday,
        enrollDate,
        serviceClockFrom,
        serviceClockTo,
        pResData,
        baseBuObj,
        apprStatus,
      } = formData;
      const { id } = fromQs();
      if (birthday && typeof birthday !== 'string') {
        formData.birthday = birthday.format('YYYY-MM-DD');
      }
      if (enrollDate && typeof enrollDate !== 'string') {
        formData.enrollDate = enrollDate.format('YYYY-MM-DD');
      }
      if (serviceClockFrom && typeof serviceClockFrom !== 'string') {
        formData.serviceClockFrom = serviceClockFrom.format('HH:mm');
      }
      if (serviceClockTo && typeof serviceClockTo !== 'string') {
        formData.serviceClockTo = serviceClockTo.format('HH:mm');
      }
      if (!isEmpty(pResData) && typeof pResData === 'object') {
        formData.presId = pResData.id;
        formData.presName = pResData.name;
      }
      if (!isEmpty(baseBuObj) && typeof baseBuObj === 'object') {
        formData.baseBuId = baseBuObj.id;
        formData.baseBuName = baseBuObj.name;
      }
      const { status, response } = yield call(submitResEnroll, formData);
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
            closeThenGoto('/hr/res/profile/list');
          } else {
            createMessage({ type: 'warn', description: '提交失败' });
          }
        } else {
          // 发起新流程
          const { response: flow } = yield call(flowResEnroll, id);
          if (flow.ok) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto('/hr/res/profile/list');
            // router.push('/user/flow/process?type=procs');
          } else {
            createMessage({ type: 'error', description: flow.reason || '流程创建失败' });
          }
        }
      } else {
        createMessage({ type: 'warn', description: response.reason || '提交失败' });
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
