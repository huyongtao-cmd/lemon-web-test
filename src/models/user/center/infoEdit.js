import router from 'umi/router';
import {
  create,
  update,
  findResById,
  resMessageUpdateRq,
  findResEdubgList,
  findResWorkbgList,
  findResProExp,
} from '@/services/plat/res/resprofile';
import { saveSelf } from '@/services/user/center/selfEvaluation';
import { findAbAccList } from '@/services/sys/baseinfo/abacc';
import { queryUserPrincipal } from '@/services/gen/user';
import { createNotify } from '@/components/core/Notify';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { isNil, isEmpty } from 'ramda';
import moment from 'moment';

const formDataModel = {
  id: null,
  abNo: null,
  resName: null, // 姓名
  englishName: null, // 英文名
  resGender: null, // 性别
  birthday: null, // 出生日期（生日）
  idType: null, // 证件类型
  idNo: null, // 证件号码
  idValidFrom: null, // 证件有效期从
  idValidTo: null, // 证件有效期到
  nationality: null, // 国籍
  birthplace: null, // 籍贯
  nation: null, // 民族
  marital: null, // 婚姻状况
  passportNo: null, // 护照号码
  passportValidFrom: null, // 护照有效期从
  passportValidTo: null, // 护照有效期到
  passportIssueplace: null, // 护照发放地
  mobile: null, // 移动电话
  telNo: null, // 固定电话
  emailAddr: null, // 平台邮箱
  personalEmail: null, // 个人邮箱
  snsType: null, // 社交类型
  snsNo: null, // 社交号码
  contactCountry: null, // 联系国家
  contactProvince: null, // 联系省
  contactCity: null, // 联系市
  contactAddress: null, // 详细地址
  emContactName: null, // 紧急联系人姓名
  emContactMobile: null, // 紧急联系人移动电话
  emContactTel: null, // 紧急联系人固定电话
  emContactRelation: null, // 紧急联系人关系
  resType1: null, // 资源类型一
  resType2: null, // 资源类型二
};
const selfEvaluationDataDefault = {
  selfEvaluation: '',
  selfTagging: '',
};

export default {
  namespace: 'userCenterInfoEdit',

  state: {
    formData: {
      ...formDataModel,
    },
    applyMsg: {},
    dataSource: [],
    c2Data: [], // 省
    c3Data: [], // 市
    type2Data: [], // 资源类型二
    total: 0,
    twResEdubgTemporaryEntity: [], // 教育经历
    eddelId: [],
    edubgTotal: 0,
    twResWorkbgTemporaryEntity: [], // 工作经历
    workbgdelId: [],
    workbgTotal: 0,
    twResProjLogTemporaryEntity: [], // 资源项目履历
    projlogdelId: [],
    projlogTotal: 0,
    twAbAccTemporaryEntity: [], // 财务信息
    abAccdelId: [],
    abAccTotal: 0,
    selfEvaluationData: selfEvaluationDataDefault,
    tagBox: [],
    tagNum: 0,
    edubgSofarFlag: false,
    workbgSofarFlag: false,
    proExpSofarFlag: false,
  },

  effects: {
    // 提交
    *submit({ payload }, { call, select, put }) {
      const {
        formData,
        applyMsg,
        twResEdubgTemporaryEntity,
        eddelId,
        twResWorkbgTemporaryEntity,
        workbgdelId,
        twResProjLogTemporaryEntity,
        projlogdelId,
        twAbAccTemporaryEntity,
        abAccdelId,
        selfEvaluationData,
        tagBox,
      } = yield select(({ userCenterInfoEdit }) => userCenterInfoEdit);
      const { birthday, idValid = [], passportValid = [] } = formData;
      if (birthday && typeof birthday !== 'string') {
        formData.birthday = birthday.format('YYYY-MM-DD');
      }

      if (Array.isArray(idValid) && idValid[0] && idValid[1]) {
        // eslint-disable-next-line
        formData.idValidFrom = idValid[0].format('YYYY-MM-DD');
        // eslint-disable-next-line
        formData.idValidTo = idValid[1].format('YYYY-MM-DD');
      }

      if (Array.isArray(passportValid) && passportValid[0] && passportValid[1]) {
        // eslint-disable-next-line
        formData.passportValidFrom = passportValid[0].format('YYYY-MM-DD');
        // eslint-disable-next-line
        formData.passportValidTo = passportValid[1].format('YYYY-MM-DD');
      }

      const { ...newFormData } = formData;
      const { selfEvaluation, selfTagging } = selfEvaluationData;
      const tagBoxArr = tagBox
        .filter(item => item.value && item.value.trim(), [])
        .map(item => item.value.trim());
      newFormData.selfEvaluation = selfEvaluation;
      newFormData.selfTagging = tagBoxArr.join(',');

      const params = {
        ...applyMsg,
        createTime: moment().format('YYYY-MM-DD'),
        twResBasicsTemporaryEntity: newFormData,
        twResEdubgTemporaryEntity,
        eddelId,
        twResWorkbgTemporaryEntity,
        workbgdelId,
        twResProjLogTemporaryEntity,
        projlogdelId,
        twAbAccTemporaryEntity,
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
      };

      // 编辑的保存方法
      const { status, response } = yield call(resMessageUpdateRq, { ...params, ...payload });
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
      yield put({
        type: 'selfEvaluationSave',
      });
    },

    *saveSelfEvaluation({ payload }, { call, put, select }) {
      const { formData, applyMsg, selfEvaluationData, tagBox } = yield select(
        ({ userCenterInfoEdit }) => userCenterInfoEdit
      );
      const { ...newFormData } = formData;
      const { selfEvaluation, selfTagging } = selfEvaluationData;
      const tagBoxArr = tagBox
        .filter(item => item.value && item.value.trim(), [])
        .map(item => item.value.trim());
      newFormData.selfEvaluation = selfEvaluation;
      newFormData.selfTagging = tagBoxArr.join(',');
      newFormData.resId = applyMsg.resId;
      const params = {
        ...applyMsg,
        twResBasicsTemporaryEntity: newFormData,
      };
      // 编辑的保存方法
      const { status, response } = yield call(saveSelf, { ...params, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/center/info`);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    // 获取当前登录人信息
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        const { resId, resName, ouId, baseBuId } = response.extInfo || {};
        yield put({
          type: 'queryResDetail',
          payload: { resId },
        });
        yield put({
          type: 'updateState',
          payload: {
            applyMsg: {
              createUserId: isNil(resId) ? undefined : resId + '',
              resId,
              resName,
              submit: 'true',
            },
          },
        });
        return response.extInfo;
      }
      createMessage({ type: 'error', description: '获取资源信息失败' });
      return {};
    },
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResById, payload.id);
      if (ok) {
        let tagNum = 0;
        const tagBox =
          datum && datum.selfTagging && datum.selfTagging.length > 0
            ? datum.selfTagging.split(',').map(item => {
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
            formData: datum || {},
            selfEvaluationData: datum
              ? {
                  selfEvaluation: datum.selfEvaluation || '',
                  selfTagging: datum.selfTagging || '',
                }
              : selfEvaluationDataDefault,
            tagBox,
            tagNum,
          },
        });
        // 获取信息后 调出省市区数据
        yield put({
          type: 'updateListC2',
          payload: datum.contactCountry,
        });
        yield put({
          type: 'updateListC3',
          payload: datum.contactProvince,
        });
      }
    },
    *queryFinance({ payload }, { call, put }) {
      const { response } = yield call(findAbAccList, payload);

      yield put({
        type: 'updateState',
        payload: {
          twAbAccTemporaryEntity: Array.isArray(response.rows) ? response.rows : [],
          abAccTotal: response.total,
        },
      });
    },
    *queryProExp({ payload }, { call, put }) {
      const { response } = yield call(findResProExp, payload);
      yield put({
        type: 'updateState',
        payload: {
          twResProjLogTemporaryEntity: Array.isArray(response.rows) ? response.rows : [],
          projlogTotal: response.total,
        },
      });
    },
    // 工作经历查询
    *queryWorkbg({ payload }, { call, put }) {
      const { response: workbgResponse } = yield call(findResWorkbgList, payload);

      yield put({
        type: 'updateState',
        payload: {
          twResWorkbgTemporaryEntity: Array.isArray(workbgResponse.rows) ? workbgResponse.rows : [],
          workbgTotal: workbgResponse.total,
        },
      });
    },
    // 教育经历查询
    *queryEdubg({ payload }, { call, put }) {
      const { response: edubgResponse } = yield call(findResEdubgList, payload);

      yield put({
        type: 'updateState',
        payload: {
          twResEdubgTemporaryEntity: Array.isArray(edubgResponse.rows) ? edubgResponse.rows : [],
          edubgTotal: edubgResponse.total,
        },
      });
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
      } else {
        yield put({
          type: 'updateState',
          payload: { type2Data: [] },
        });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userCenterInfoEdit }) => userCenterInfoEdit);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 保存
    *save(_, { call, select, put }) {
      const { formData, selfEvaluationData, tagBox } = yield select(
        ({ userCenterInfoEdit }) => userCenterInfoEdit
      );
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
      const { selfEvaluation } = selfEvaluationData;
      const tagBoxArr = tagBox
        .filter(item => item.value && item.value.trim(), [])
        .map(item => item.value.trim());
      formData.selfEvaluation = selfEvaluation;
      formData.selfTagging = tagBoxArr.join(',');
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          const { offerFrom } = fromQs();
          if (offerFrom) {
            closeThenGoto(`${offerFrom}`);
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/user/center/info`);
          }
        } else {
          createMessage({ type: 'warn', description: response.reason || '保存失败' });
        }
      }
    },

    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formDataModel,
          },
          mode: 'create',
          dataSource: [],
          c2Data: [], // 省
          c3Data: [], // 市
          type2Data: [], // 资源类型二
          total: 0,
          selfEvaluationData: selfEvaluationDataDefault,
          tagBox: [],
          tagNum: 0,
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
