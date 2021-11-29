import router from 'umi/router';
import {
  create,
  update,
  findResById,
  findResListById,
  findResEqva,
  updateCenter,
} from '@/services/plat/res/resprofile';
import { queryPersonVideo } from '@/services/user/center/selfEvaluation';
import { createNotify } from '@/components/core/Notify';
import { queryMyList } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

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

export default {
  namespace: 'userCenterInfo',

  state: {
    formData: {
      ...formDataModel,
    },
    resList: [], // 组织信息列表
    adjustList: [], // 调整记录列表
    mode: 'create',
    dataSource: [],
    c2Data: [], // 省
    c3Data: [], // 市
    type2Data: [], // 资源类型二
    total: 0,
    computerDataSource: [],
    pageConfig: {},
    videoUrl: '',
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { formData: datum || {}, mode: payload.mode },
        });
      }
    },
    // 查询列表数据内容
    *queryList({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResListById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { resList: datum || {} },
        });
      }
    },
    // 查询调整记录
    *queryAdjustList({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResEqva, payload);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { adjustList: datum || {} },
        });
      }
    },
    // 查询电脑自购申请表
    *queryComputerApply({ payload }, { call, put }) {
      const {
        response: { rows },
      } = yield call(queryMyList);
      yield put({
        type: 'updateState',
        payload: {
          computerDataSource: Array.isArray(rows) ? rows : [],
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
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userCenterInfo }) => userCenterInfo);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 个人中心-个人信息修改保存
    *centerSave(_, { call, select }) {
      let flag = true; // 默认保存成功
      const { formData, mode } = yield select(({ userCenterInfo }) => userCenterInfo);

      if (formData.id) {
        const { status, response } = yield call(updateCenter, formData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { offerFrom } = fromQs();
          if (offerFrom && offerFrom.includes('OfferAndResDetails')) {
            closeThenGoto(`${offerFrom}`);
          } else {
            router.push(`/user/center/info`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
          router.go();
          flag = false; // 保存失败
        }
      }
      return flag;
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

    // 获取视频地址
    *fetchVideoUrl({ payload }, { call, put }) {
      const res = yield call(queryPersonVideo, payload);
      if (res.response) {
        yield put({
          type: 'updateState',
          payload: {
            videoUrl: res.response,
          },
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
