import router from 'umi/router';
import {
  findResById,
  findResEdubgList,
  findResWorkbgList,
  findResProExp,
  resTemporaryDetailsRq,
  resMessageUpdateRq,
} from '@/services/plat/res/resprofile';
import { getViewConf } from '@/services/gen/flow';
import { createNotify } from '@/components/core/Notify';
import { queryMyList } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { findAbAccList } from '@/services/sys/baseinfo/abacc';
import { isEmpty } from 'ramda';

const defaultFormData = {};
const selfEvaluationDataDefault = {
  selfEvaluation: '',
  selfTagging: '',
};

export default {
  namespace: 'userCenterInfoDetail',

  state: {
    formData: {
      ...defaultFormData,
    },
    twResTemporaryEntity: {},
    c2Data: [], // 省
    c3Data: [], // 市
    basicsBefore: {}, // 基本信息修改前
    basicsAfter: {}, // 基本信息修改后
    twResEdubgTemporaryEntity: [], // 教育经历
    twResEdubgTemporaryEntityAfter: [], // 教育经历
    eddelId: [],
    twResWorkbgTemporaryEntity: [], // 工作经历
    twResWorkbgTemporaryEntityAfter: [], // 工作经历
    workbgdelId: [],
    twResProjLogTemporaryEntity: [], // 资源项目履历
    twResProjLogTemporaryEntityAfter: [], // 资源项目履历
    projlogdelId: [],
    twAbAccTemporaryEntity: [], // 财务信息
    twAbAccTemporaryEntityAfter: [], // 财务信息
    abAccdelId: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    selfEvaluationData: selfEvaluationDataDefault,
    tagBox: [],
    tagNum: 0,
  },

  effects: {
    // 提交
    *submit({ payload }, { call, select }) {
      const {
        formData,
        twResTemporaryEntity,
        twResEdubgTemporaryEntityAfter,
        eddelId,
        twResWorkbgTemporaryEntityAfter,
        workbgdelId,
        twResProjLogTemporaryEntityAfter,
        projlogdelId,
        twAbAccTemporaryEntityAfter,
        abAccdelId,
        selfEvaluationData,
        tagBox,
      } = yield select(({ userCenterInfoDetail }) => userCenterInfoDetail);
      const { birthday, idValid, passportValid } = formData;
      if (birthday && typeof birthday !== 'string') {
        formData.birthday = birthday.format('YYYY-MM-DD');
      }
      if (idValid && idValid[0] !== null && typeof idValid[0] !== 'string') {
        formData.idValidFrom = idValid[0].format('YYYY-MM-DD');
      }
      if (idValid && idValid[1] !== null && typeof idValid[1] !== 'string') {
        formData.idValidTo = idValid[1].format('YYYY-MM-DD');
      }
      if (passportValid && passportValid[0] !== null && typeof passportValid[0] !== 'string') {
        formData.passportValidFrom = passportValid[0].format('YYYY-MM-DD');
      }
      if (passportValid && passportValid[1] !== null && typeof passportValid[1] !== 'string') {
        formData.passportValidTo = passportValid[1].format('YYYY-MM-DD');
      }

      const { ...newFormData } = formData;
      const { selfEvaluation } = selfEvaluationData;
      const tagBoxArr = tagBox
        .filter(item => item.value && item.value.trim(), [])
        .map(item => item.value.trim());
      newFormData.selfEvaluation = selfEvaluation;
      newFormData.selfTagging = tagBoxArr.join(',');

      const params = {
        twResBasicsTemporaryEntity: newFormData,
        twResEdubgTemporaryEntity: twResEdubgTemporaryEntityAfter,
        eddelId,
        twResWorkbgTemporaryEntity: twResWorkbgTemporaryEntityAfter,
        workbgdelId,
        twResProjLogTemporaryEntity: twResProjLogTemporaryEntityAfter,
        projlogdelId,
        twAbAccTemporaryEntity: twAbAccTemporaryEntityAfter,
        abAccdelId,
        twAbContactTemporaryEntity: {
          mobile: newFormData.mobile,
          snsType: newFormData.snsType,
          snsNo: newFormData.snsNo,
          telNo: newFormData.telNo,
          personalEmail: newFormData.personalEmail,
          emailAddr: newFormData.emailAddr,
          emContactRelation: newFormData.emContactRelation,
          emContactName: newFormData.emContactName,
          emContactMobile: newFormData.emContactMobile,
          emContactTel: newFormData.emContactTel,
        },
        ...payload,
        ...twResTemporaryEntity,
      };

      // 编辑的保存方法
      const { status, response } = yield call(resMessageUpdateRq, params);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程提交失败' });
      }
    },
    // 查询流程详情
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(resTemporaryDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const {
            twResBasicsTemporaryView,
            twAbContactTemporaryView,
            twAbAccDetailTemporaryView,
            twResEdubgDetailTemporaryView,
            twResProjLogTemporaryView,
            twResWorkbgDetailTemporaryView,
            ...twResTemporaryEntity
          } = response.datum;

          // 获取信息后 调出省市区数据
          yield put({
            type: 'updateListC2',
            payload: twResBasicsTemporaryView[1].contactCountry,
          });
          yield put({
            type: 'updateListC3',
            payload: twResBasicsTemporaryView[1].contactProvince,
          });

          // 修改前个人
          const updateBeforeMyself = twAbContactTemporaryView.filter(
            v => v.tempType === '0' && v.contactType === '0101'
          )[0];
          const {
            mobile = '',
            telNo = '',
            snsType = '',
            snsNo = '',
            personalEmail = '',
          } = updateBeforeMyself;
          // 修改前紧急
          const updateBeforeEm = twAbContactTemporaryView.filter(
            v => v.tempType === '0' && v.contactType === '0102'
          )[0];
          const {
            emContactName,
            mobile: emContactMobile,
            telNo: emContactTel,
            emContactRelation,
          } = updateBeforeEm;

          // 修改后个人
          const updateAfterMyself = twAbContactTemporaryView.filter(
            v => v.tempType === '1' && v.contactType === '0101'
          )[0];
          const {
            mobile: mobile1,
            telNo: telNo1,
            snsType: snsType1,
            snsNo: snsNo1,
            personalEmail: personalEmail1,
          } = updateAfterMyself;

          // 修改后紧急
          const updateAfterEm = twAbContactTemporaryView.filter(
            v => v.tempType === '1' && v.contactType === '0102'
          )[0];
          const {
            emContactName: emContactName1,
            mobile: emContactMobile1,
            telNo: emContactTel1,
            emContactRelation: emContactRelation1,
          } = updateAfterEm;

          let tagNum = 0;
          const tagBox =
            twResBasicsTemporaryView[1] &&
            twResBasicsTemporaryView[1].selfTagging &&
            twResBasicsTemporaryView[1].selfTagging.length > 0
              ? twResBasicsTemporaryView[1].selfTagging.split(',').map(item => {
                  tagNum += 1;
                  return {
                    id: tagNum,
                    value: item,
                  };
                })
              : [];

          yield put({
            type: 'updateState',
            payload: {
              twResEdubgTemporaryEntity: twResEdubgDetailTemporaryView.filter(
                v => v.tempType === '0'
              ),
              twResEdubgTemporaryEntityAfter: twResEdubgDetailTemporaryView.filter(
                v => v.tempType === '1'
              ),
              twResWorkbgTemporaryEntity: twResWorkbgDetailTemporaryView.filter(
                v => v.tempType === '0'
              ),
              twResWorkbgTemporaryEntityAfter: twResWorkbgDetailTemporaryView.filter(
                v => v.tempType === '1'
              ),
              twResProjLogTemporaryEntity: twResProjLogTemporaryView.filter(
                v => v.tempType === '0'
              ),
              twResProjLogTemporaryEntityAfter: twResProjLogTemporaryView.filter(
                v => v.tempType === '1'
              ),
              twAbAccTemporaryEntity: twAbAccDetailTemporaryView.filter(v => v.tempType === '0'),
              twAbAccTemporaryEntityAfter: twAbAccDetailTemporaryView.filter(
                v => v.tempType === '1'
              ),
              basicsBefore:
                Array.isArray(twResBasicsTemporaryView) && twResBasicsTemporaryView[0]
                  ? {
                      ...twResBasicsTemporaryView[0],
                      emContactName,
                      emContactMobile,
                      emContactTel,
                      emContactRelation,
                      mobile,
                      telNo,
                      snsType,
                      snsNo,
                      personalEmail,
                    }
                  : {},
              basicsAfter:
                Array.isArray(twResBasicsTemporaryView) && twResBasicsTemporaryView[1]
                  ? {
                      ...twResBasicsTemporaryView[1],
                      emContactName: emContactName1,
                      emContactMobile: emContactMobile1,
                      emContactTel: emContactTel1,
                      emContactRelation: emContactRelation1,
                      mobile: mobile1,
                      telNo: telNo1,
                      snsType: snsType1,
                      snsNo: snsNo1,
                      personalEmail: personalEmail1,
                    }
                  : {},
              formData:
                Array.isArray(twResBasicsTemporaryView) && twResBasicsTemporaryView[1]
                  ? {
                      ...twResBasicsTemporaryView[1],
                      emContactName: emContactName1,
                      emContactMobile: emContactMobile1,
                      emContactTel: emContactTel1,
                      emContactRelation: emContactRelation1,
                      mobile: mobile1,
                      telNo: telNo1,
                      snsType: snsType1,
                      snsNo: snsNo1,
                      personalEmail: personalEmail1,
                    }
                  : {},
              twResTemporaryEntity,
              mode: payload.mode,
              selfEvaluationData: twResBasicsTemporaryView[1]
                ? {
                    selfEvaluation: twResBasicsTemporaryView[1].selfEvaluation || '',
                    selfTagging: twResBasicsTemporaryView[1].selfTagging || '',
                  }
                : selfEvaluationDataDefault,
              tagBox,
              tagNum,
            },
          });
          return response.datum;
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
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
                  panels: {},
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

    // 根据国家获取省的信息
    *updateListC2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:PROVINCE',
        parentDefId: 'COM:COUNTRY',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            c2Data: Array.isArray(response) ? response : [],
            c3Data: [],
          },
        });
      }
    },
    // 根据省获取市
    *updateListC3({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { c3Data: Array.isArray(response) ? response : [] },
        });
      }
    },

    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userCenterInfoDetail }) => userCenterInfoDetail);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },

    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...defaultFormData,
          },
          selfEvaluationData: selfEvaluationDataDefault,
          tagBox: [],
          tagNum: 0,
        },
      });
    },
    // 在刷新页面之前将form表单里的数据置为空
    *cleanFlow(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          twResEdubgTemporaryEntity: [], // 教育经历
          twResEdubgTemporaryEntityAfter: [], // 教育经历
          twResWorkbgTemporaryEntity: [], // 工作经历
          twResWorkbgTemporaryEntityAfter: [], // 工作经历
          twResProjLogTemporaryEntity: [], // 资源项目履历
          twResProjLogTemporaryEntityAfter: [], // 资源项目履历
          twAbAccTemporaryEntity: [], // 财务信息
          twAbAccTemporaryEntityAfter: [], // 财务信息
          basicsBefore: {}, // 基本信息修改前
          basicsAfter: {}, // 基本信息修改后
          fieldsConfig: {},
          flowForm: {
            remark: undefined,
            dirty: false,
          },
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
