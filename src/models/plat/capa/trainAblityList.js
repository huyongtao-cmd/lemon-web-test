import { queryCapaSetList } from '@/services/plat/capa/train';
import {
  abilityListRq,
  userTrainingProgListRq,
  getcapaSetListByResUri,
  checkSaveUri,
  cancelCheckUri,
  getTrainingListUri,
  updateCheckStatusUri,
} from '@/services/hr/fitCheck/fitCheck';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'trainAblityList',

  state: {
    // 查询系列
    searchForm: {
      requiredFlag: '',
      periodFlag: '',
    },
    dataSource: [],
    total: 0,
    type2: [],
    capaSetList: [], // 复合能力下拉
    trainingProgList: [], // 适岗培训项目下拉
    capaSetListOfRes: [],
    formData: {},
    resCapaSetList: [], // 新增窗口将选择的复合能力放在里面
    cancelKey: '',
    trainingList: [], // 列表页点击适岗考核弹窗获取适岗考核列表
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { date, completeDate, resType, ...params } = payload;
      const newParams = {
        ...params,
        enRollStartDate: Array.isArray(date) ? date[0] : '',
        enRollEndDate: Array.isArray(date) ? date[2] : '',
        examLogStartDate: Array.isArray(completeDate) ? date[0] : '',
        examLogEndDate: Array.isArray(completeDate) ? date[2] : '',
        resType1: Array.isArray(resType) ? resType[0] : '',
        resType2: Array.isArray(resType) ? resType[1] : '',
      };

      const { response } = yield call(abilityListRq, newParams);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 获取适用复合能力下拉数据来源
    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaSetList: response.datum || [],
          },
        });
      }
    },
    // 新增弹窗获取适岗培训项目
    *getTrainingProgList({ payload }, { call, put, select }) {
      const { status, response } = yield call(userTrainingProgListRq);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            trainingProgList: response.datum || [],
          },
        });
      }
    },
    // 新增弹窗获取适岗培训项目
    *getcapaSetListByRes({ payload }, { call, put, select }) {
      const { status, response } = yield call(getcapaSetListByResUri, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaSetListOfRes: response.datum || [],
          },
        });
      }
    },
    // 取消考核
    *cancelCheck({ payload }, { call, put, select }) {
      const { cancelKey } = yield select(({ trainAblityList }) => trainAblityList);
      const params = {
        ...payload,
        id: cancelKey,
      };
      const { status, response } = yield call(cancelCheckUri, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
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
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 新增适岗考核
    *checkSave({ payload }, { call, put, select }) {
      const { formData, resCapaSetList } = yield select(({ trainAblityList }) => trainAblityList);
      const { trainingProgId } = formData;
      formData.trainingProgId = trainingProgId.join(',');
      const { status, response } = yield call(checkSaveUri, { ...formData, resCapaSetList });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    //  列表页行 点击 试岗培训  获取 试岗培训列表
    *getTrainingList({ payload }, { call, put, select }) {
      const { status, response } = yield call(getTrainingListUri, payload);
      let trainingList = [];
      if (Array.isArray(response.datum)) {
        trainingList = response.datum.map(item => item.key === item.id);
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            trainingList: response.datum || [],
          },
        });
      }
    },
    // 更新考核状态
    *updateCheckStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateCheckStatusUri);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          capaSetListOfRes: [],
        },
      });
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
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
