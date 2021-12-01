import { informationImport } from '@/services/production/user';
import {
  personAdd,
  getPersonInfo,
  getPersonBaseInfo,
  getProvince,
  getCity,
  getEducation,
} from '@/services/hr/information/information';
import { commonModelReducers } from '@/utils/production/modelUtils';

const defaultState = {
  formData: {},
  modifyFormData: {},
  workList: [0],
  eduList: [0],
  familyList: [0],
  formMode: 'EDIT',
  provinceList: [],
};
export default {
  namespace: 'information',
  state: defaultState,
  effects: {
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(informationImport, payload);
      if (status === 200) {
        // console.log(addPersonInfo, 'addPersonInfo');
        return response;
      }
      return {};
    },

    // 新增员工录入信息
    *addPersonInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(personAdd, payload);
      if (status === 200) {
        return response;
      }
      return {};
    },

    // resId获取员工录入信息
    *getExInfo({ payload }, { call, put, select }) {
      // console.log('getExInfo', payload);
      const { status, response } = yield call(getPersonInfo, payload);
      // console.log(response, 'resId获取员工录入信息');
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            personInfo: response?.data,
          },
        });
        return response?.data;
      }
      return {};
    },

    // resId获取员工基本信息
    *getBaseInfo({ payload }, { call, put, select }) {
      // console.log('getBaseInfo', payload);
      const { status, response } = yield call(getPersonBaseInfo, payload);
      // console.log(response, 'resId获取员工基本信息');
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            baseInfo: response?.data,
          },
        });
        return response;
      }
      return {};
    },

    // 省份
    *queryProvince({ payload }, { call, put, select }) {
      // console.log('getBaseInfo', payload);
      const { status, response } = yield call(getProvince, payload);
      // console.log(response, 'resId获取员工基本信息');
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            provinceList: response,
          },
        });
        return response;
      }
      return [];
    },
    // 城市
    *queryCity({ payload }, { call, put, select }) {
      // console.log('getBaseInfo', payload);
      const { status, response } = yield call(getCity, payload);
      // console.log(response, 'resId获取员工基本信息');
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            cityList: response,
          },
        });
        return response;
      }
      return [];
    },
    // 学历
    *queryEducation({ payload }, { call, put, select }) {
      // console.log('getBaseInfo', payload);
      const { status, response } = yield call(getEducation, payload);
      // console.log(response, 'resId获取员工基本信息');
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationList: response,
          },
        });
        return response;
      }
      return [];
    },
  },
  reducers: {
    ...commonModelReducers(defaultState),
    updateFormForEditTable(state, { payload }) {
      const { formData, modifyFormData } = state;
      const newFormData = { ...formData, ...payload };
      const modifyData = { ...modifyFormData, ...payload };
      return {
        ...state,
        formData: newFormData,
        modifyFormData: modifyData,
      };
    },
  },
};
