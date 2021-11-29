import { salesBuRq } from '@/services/plat/res/resprofile';
import {
  vacationCreateRq,
  vacationEditRq,
  vacationDetailRq,
} from '@/services/production/res/vacation';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { selectUserProj } from '@/services/gen/list';
import { queryExtrworkByResId } from '@/services/user/project/project';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { customSelectionListByKey } from '@/services/production/system';
import { outputHandle } from '@/utils/production/outputUtil';

const defaultFormData = {};

export default {
  namespace: 'vacationEditNew',
  state: {
    formData: defaultFormData,
    resDataSource: [],
    baseBuDataSource: [],
    projSource: [], // 项目列表 - 下拉查询用
    projList: [], // 项目列表
    extrWorkSource: [], // 加班计划列表 - 下拉查询用
    extrWorkList: [], // 加班计划列表
    pageConfig: {},
  },

  effects: {
    *fetchInternalOuList({ payload }, { put, select }) {
      console.log(payload);
      // const {
      //   user: { extInfo = {} },
      //   formData: { chargeCompany, id },
      // } = yield select(({ user, vacationFlowCreateNew }) => ({
      //   ...user,
      //   ...vacationFlowCreateNew,
      // }));
      const { ouAbNo } = payload;
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:INTERNAL_COMPANY',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
      let chargeCompany2;
      const chargeCompanyList = list.filter(item => item.extVarchar1 === ouAbNo);
      console.log(chargeCompanyList);
      if (chargeCompanyList && chargeCompanyList.length > 0) {
        chargeCompany2 = chargeCompanyList[0].value;
      }
      yield put({
        type: 'updateForm',
        payload: {
          company: chargeCompany2,
        },
      });
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ vacationEditNew }) => vacationEditNew);
      const { dates, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.startDate, params.endDate] = dates;
      }
      const { status, response } = yield call(vacationCreateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { startDate, endDate } = response.data;
          yield put({
            type: 'updateForm',
            payload: {
              ...response.data,
              dates: [startDate, endDate],
            },
          });
          yield put({
            type: 'queryProjList',
            payload: { limit: 0, resId: response.data.resId },
          });
          yield put({
            type: 'queryExtrWork',
            payload: { limit: 0, resId: response.data.resId },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取当前登录信息失败' });
        }
        // eslint-disable-next-line consistent-return
        return response.data;
      }
      // eslint-disable-next-line consistent-return
      return {};
    },
    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ vacationEditNew }) => vacationEditNew);
      const { dates, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.startDate, params.endDate] = dates;
      }
      const { status, response } = yield call(vacationEditRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
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
          baseBuDataSource: list,
        },
      });
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: { formData: defaultFormData },
      });
    },

    // 项目列表
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(selectUserProj, payload);
      yield put({
        type: 'updateState',
        payload: {
          projList: Array.isArray(response) ? response : [],
          projSource: Array.isArray(response) ? response : [],
        },
      });
      return response;
    },

    // 加班计划列表
    *queryExtrWork({ payload }, { call, put }) {
      const { response } = yield call(queryExtrworkByResId, payload);
      const data = Array.isArray(response.rows) ? response.rows : [];
      let newdata = [];
      if (data.length > 0) {
        newdata = data.map(item =>
          Object.assign({}, item, {
            name: item.workBegDate + '~' + item.workEndDate,
            code: item.id + '',
          })
        );
      }
      yield put({
        type: 'updateState',
        payload: {
          extrWorkList: newdata,
          extrWorkSource: newdata,
        },
      });
      return response;
    },
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
