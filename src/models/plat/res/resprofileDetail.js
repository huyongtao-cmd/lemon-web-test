import router from 'umi/router';
import {
  create,
  update,
  findResById,
  updateCenter,
  updatePlatByStatus,
  getResHrLabel,
  saveResHrLabel,
} from '@/services/plat/res/resprofile';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { createNotify } from '@/components/core/Notify';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto, markAsTab, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { delParam } from '@/utils/urlUtils';

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

const platFormDataModel = {
  id: null,
  baseBuId: null, // 所属组织
  baseBuName: null, // 所属组织名称
  baseCity: null, // 主服务地
  busitripFlag: null, // 能否出差
  serviceType: null, // 服务方式
  serviceClockFrom: null, // 服务开始时间
  serviceClockTo: null, // 服务结束时间
  ouId: null, // 所属公司
  empNo: null, // 工号
  enrollDate: null, // 入职日期
  regularDate: null, // 转正日期
  contractSignDate: null, // 合同签订日期
  contractExpireDate: null, // 合同到期日期
  probationBeginDate: null, // 试用期开始日期
  probationEndDate: null, // 试用期结束日期
  accessLevel: null, // 安全级别
  telfeeQuota: null, // 话费额度
  hrStatus: null, // 人事状态
  jobGrade: null, // 职级
  needUseraccFlag: null, // 是否需要用户账号
};
const personnelFormDataModel = {
  id: null,
  resId: null,
  label1: '',
  label2: '',
  label3: '',
  label4: '',
  label5: '',
  label6: '',
  label7: '',
  label8: '',
  label9: '',
  label10: '',
};
const selfEvaluationDataDefault = {
  selfEvaluation: '',
  selfTagging: '',
};
export default {
  namespace: 'platResDetail',

  state: {
    formData: {
      ...formDataModel,
    },
    platFormData: {
      ...platFormDataModel,
    },
    personnelData: {
      ...personnelFormDataModel,
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
    pageConfig: {},
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResById, payload.id);
      const responseHrLable = yield call(getResHrLabel, payload.id);
      const responseHrLableData = responseHrLable.response || '';
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
            mode: payload.mode,
            platFormData: datum || {},
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
      }
      if (responseHrLableData && responseHrLableData.ok) {
        const personnelData = responseHrLableData.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            personnelData,
          },
        });
      }
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
      const { formData, platFormData, personnelData } = yield select(
        ({ platResDetail }) => platResDetail
      );
      const newFormData = Object.assign({}, formData);
      const newPlatFormData = Object.assign({}, platFormData);
      const newPersonnelData = Object.assign({}, personnelData);
      newFormData[key] = value;
      newPlatFormData[key] = value;
      newPersonnelData[key] = value;
      yield put({
        type: 'updateState',
        payload: {
          formData: newFormData,
          platFormData: newPlatFormData,
          personnelData: newPersonnelData,
        },
      });
    },
    // 保存
    *save(_, { call, select }) {
      const { formData, mode, selfEvaluationData, tagBox } = yield select(
        ({ platResDetail }) => platResDetail
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
          return {};
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { from } = fromQs();
          if (from) {
            return response;
          }
          closeThenGoto(`/hr/res/profile/list/background?id=${response.datum.id}`);
          return {};
        }
        createMessage({ type: 'warn', description: response.reason || '保存失败' });
        return {};
        // eslint-disable-next-line no-else-return
      } else {
        // 新增的保存方法
        if (formData.resType1 === 'EXTERNAL_RES' && !formData.resType2) {
          createMessage({ type: 'warn', description: '请选择资源类型二' });
          return {};
        }
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { from } = fromQs();
          if (from) {
            return response;
          }
          closeThenGoto(`/hr/res/profile/list/background?id=${response.datum.id}`);
          return {};
        }
        createMessage({ type: 'warn', description: response.reason || '保存失败' });
        return {};
      }
    },

    // 保存并跳转列表页面
    *saveAndJump(_, { call, select }) {
      const { formData, mode, selfEvaluationData, tagBox } = yield select(
        ({ platResDetail }) => platResDetail
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
          return {};
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { from } = fromQs();
          if (from) {
            return response;
          }
          closeThenGoto(`/hr/res/profile/list`);
          return {};
        }
        createMessage({ type: 'warn', description: response.reason || '保存失败' });
        return {};
        // eslint-disable-next-line no-else-return
      } else {
        // 新增的保存方法
        if (formData.resType1 === 'EXTERNAL_RES' && !formData.resType2) {
          createMessage({ type: 'warn', description: '请选择资源类型二' });
          return {};
        }
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { from } = fromQs();
          if (from) {
            return response;
          }
          closeThenGoto(`/hr/res/profile/list`);
          return {};
        }
        createMessage({ type: 'warn', description: response.reason || '保存失败' });
        return {};
      }
    },
    // 编辑页tab信息保存
    *tabSave({ payload }, { call, select }) {
      const {
        formData,
        mode,
        platFormData,
        personnelData,
        selfEvaluationData,
        tagBox,
      } = yield select(({ platResDetail }) => platResDetail);
      const { birthday, idValid, passportValid, internDate: internDateParmars } = formData;
      const {
        accessLevel,
        serviceClockFrom,
        serviceClockTo,
        enrollDate,
        regularDate,
        contractSignDate,
        contractExpireDate,
        probationBeginDate,
        probationEndDate,
        internDate,
      } = platFormData;
      // ----------------基础信息日期处理-----------------
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
      if (internDateParmars && typeof internDateParmars !== 'string') {
        formData.internDate = internDateParmars.format('YYYY-MM-DD');
      }

      // -----------------平台信息日期处理------------------------
      // 服务开始时间
      if (serviceClockFrom && typeof serviceClockFrom !== 'string') {
        platFormData.serviceClockFrom = serviceClockFrom.format('HH:mm');
      }
      // 服务结束时间
      if (serviceClockTo && typeof serviceClockTo !== 'string') {
        platFormData.serviceClockTo = serviceClockTo.format('HH:mm');
      }
      // 入职日期
      if (enrollDate && typeof enrollDate !== 'string') {
        platFormData.enrollDate = enrollDate.format('YYYY-MM-DD');
      }
      if (regularDate && typeof regularDate !== 'string') {
        platFormData.regularDate = regularDate.format('YYYY-MM-DD');
      }
      if (contractSignDate && typeof contractSignDate !== 'string') {
        platFormData.contractSignDate = contractSignDate.format('YYYY-MM-DD');
      }
      if (contractExpireDate && typeof contractExpireDate !== 'string') {
        platFormData.contractExpireDate = contractExpireDate.format('YYYY-MM-DD');
      }
      if (probationBeginDate && typeof probationBeginDate !== 'string') {
        platFormData.probationBeginDate = probationBeginDate.format('YYYY-MM-DD');
      }
      if (probationEndDate && typeof probationEndDate !== 'string') {
        platFormData.probationEndDate = probationEndDate.format('YYYY-MM-DD');
      }
      if (internDate && typeof internDate !== 'string') {
        platFormData.internDate = internDate.format('YYYY-MM-DD');
      }

      if (platFormData.busitripFlag === null) {
        platFormData.busitripFlag = 0;
      }
      if (platFormData.needUseraccFlag === null) {
        platFormData.needUseraccFlag = 1;
      }
      const { selfEvaluation } = selfEvaluationData;
      const tagBoxArr = tagBox
        .filter(item => item.value && item.value.trim(), [])
        .map(item => item.value.trim());
      formData.selfEvaluation = selfEvaluation;
      formData.selfTagging = tagBoxArr.join(',');
      if (formData.id) {
        // 基础信息保存
        const { response, status } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        // 平台信息保存
        const { response: platResponse, status: platStatus } = yield call(updatePlatByStatus, {
          ...platFormData,
          id: payload.id,
        });
        if (platStatus === 100) {
          // 主动取消请求
          return;
        }
        const newPersonnelData = {
          label1: personnelData.label1,
          label2: personnelData.label2,
          label3: personnelData.label3,
          label4: personnelData.label4,
          label5: personnelData.label5,
          label6: personnelData.label6,
          label7: personnelData.label7,
          label8: personnelData.label8,
          label9: personnelData.label9,
          label10: personnelData.label10,
          resId: payload.id,
          id: personnelData.id,
        };

        const { response: personnelResponse, status: personnelStatus } = yield call(
          saveResHrLabel,
          newPersonnelData
        );
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok && platResponse.ok && personnelResponse.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          closeThenGoto(`/hr/res/profile/list`);
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
          personnelData: {
            ...personnelFormDataModel,
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
  },

  // subscriptions: {
  //   setup({ dispatch, history }) {
  //     return history.listen(({ pathname, search }) => {
  //       console.log(pathname);
  //       // dispatch({ type: 'clean' });
  //     });
  //   },
  // },
};
