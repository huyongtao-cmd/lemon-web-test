import {
  queryCapas,
  findCapaById,
  changeCapeStatus,
  queryCapaTree,
} from '@/services/plat/capa/capa';
import { getCapacityListRq } from '@/services/user/probation/probation';
import {
  tarinResultListRq,
  tarinResultCloseRq,
  updateEnddateRq,
  updateLearningProRq,
} from '@/services/hr/tarinResult/tarinResult';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'tarinResult',

  state: {
    // 查询系列
    searchForm: {
      requiredFlag: '',
      periodFlag: '',
    },
    dataSource: [],
    total: 0,
    type2: [],
    capacityList: [],
    capaTreeData: [],
    formData: {},
    selectedDate: '',
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { date, sDate, trnCurProg, resType, ...params } = payload;
      const newParams = {
        ...params,
        startDate: Array.isArray(date) ? date[0] : '',
        endDate: Array.isArray(date) ? date[2] : '',
        startLeftDate: Array.isArray(sDate) ? sDate[0] : '',
        startRightDate: Array.isArray(sDate) ? sDate[2] : '',
        trnCurProgStart: Array.isArray(trnCurProg) ? trnCurProg[0] : '',
        trnCurProgEnd: Array.isArray(trnCurProg) ? trnCurProg[2] : '',
        resType1: Array.isArray(resType) ? resType[0] : '',
        resType2: Array.isArray(resType) ? resType[1] : '',
      };
      const { response } = yield call(tarinResultListRq, newParams);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *close({ payload }, { call, put, select }) {
      const { response } = yield call(tarinResultCloseRq, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '关闭成功' });
        const { searchForm } = yield select(({ tarinResult }) => tarinResult);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'warn', description: response.reason || '关闭失败' });
      }
    },
    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);
      if (response && response.ok && Array.isArray(response.datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => ({
            title: item.text,
            key: item.id,
            value: item.id,
            children: item.children.map(cItem => ({
              title: cItem.text,
              key: cItem.id,
              value: cItem.id,
              children: null,
            })),
          }));
          return newData;
        };

        yield put({
          type: 'updateState',
          payload: {
            capaTreeData: loopTreeData(response.datum),
          },
        });
      }
    },
    *getCapacityList({ payload }, { call, put }) {
      const { status, response } = yield call(getCapacityListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              capacityList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '评价详情保存失败' });
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
    // 修改截止日期
    *updateEndDate({ payload }, { call, put, select }) {
      const { formData, selectedDate } = yield select(({ tarinResult }) => tarinResult);
      const { status, response } = yield call(updateEnddateRq, {
        endDate: formData.endDate ? formData.endDate : null,
        id: selectedDate,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 更新学习进度
    *updateLearningPro({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateLearningProRq);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
