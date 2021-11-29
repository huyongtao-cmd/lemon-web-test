import { omit } from 'ramda';
import {
  findCapaById,
  queryCapaLevelsById,
  queryCapaLevelSelNew,
  saveCapa,
  queryCapaLevelDetSelNew,
  queryCourseTree,
  queryCourseTreeDetail,
  findCourseDetailById,
} from '@/services/plat/capa/capa';
import { selectCapasetLevel } from '@/services/gen/list';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import update from 'immutability-helper';

const emptyFormData = {
  id: null,
  hasLevelFlag: 1,
};

export default {
  namespace: 'platCapaCreate',

  state: {
    // 查询系列
    formData: {
      ...emptyFormData,
    },
    dataList: [],
    dataList2: [],
    levelList: [],
    type2Data: [], // 分类二
    leveDetaillList: [],
    courseTreeData: [],
    courseTreeDataDetail: [],
    capasetLevelData: [],
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
          },
          levelList: [],
          dataList: [],
          dataList2: [],
          type2Data: [], // 分类二
          leveDetaillList: [],
        },
      });
    },

    *queryCapasetLevelData({ payload }, { call, put }) {
      const { response } = yield call(selectCapasetLevel);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            capasetLevelData: response || [],
          },
        });
      }
    },

    *queryLevelList({ payload }, { call, put }) {
      const { response } = yield call(queryCapaLevelSelNew, payload);
      yield put({
        type: 'updateState',
        payload: {
          levelList: Array.isArray(response) ? response : [],
        },
      });

      return response;
    },

    *queryLeveDetaillList({ payload }, { call, put }) {
      const { response } = yield call(queryCapaLevelDetSelNew, payload);
      yield put({
        type: 'updateState',
        payload: {
          leveDetaillList: Array.isArray(response) ? response : [],
        },
      });

      return response;
    },

    *save({ payload }, { call, put, select }) {
      const { response, status } = yield call(saveCapa, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return { status, rst: response.datum };
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
    },

    // 根据分类一获取分类二下拉数据
    *updateListType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:CAPACITY_TYPE2',
        parentDefId: 'RES:CAPACITY_TYPE1',
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
    *queryCourseTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCourseTree);

      if (response && response.ok && Array.isArray(response.datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.className;
            newItem.text = item.className;
            newItem.key = item.id + '';
            if (Array.isArray(item.child) && item.child.length > 0) {
              newItem.child = loopTreeData(item.child);
            }
            return newItem;
          });
          return newData;
        };
        yield put({
          type: 'updateState',
          payload: {
            courseTreeData: loopTreeData(response.datum),
          },
        });
      }
    },

    *queryCourseTreeDataDetail({ payload }, { call, put, select }) {
      let courseTreeDataDetailTotal = 0;
      let courseTreeDataDetail = [];
      const { id = [] } = payload;
      for (let i = 0; i < id.length; i += 1) {
        if (id) {
          const { response } = yield call(queryCourseTreeDetail, { classId: id[i] });
          const { datum = [] } = response;
          if (response.datum && Array.isArray(response.datum)) {
            courseTreeDataDetail = courseTreeDataDetail.concat(datum);
            courseTreeDataDetailTotal = courseTreeDataDetail.length;
          }
        }
      }

      const obj = {};
      courseTreeDataDetail = courseTreeDataDetail.reduce((item, next) => {
        obj[next.id] ? '' : (obj[next.id] = true && item.push(next));
        return item;
      }, []);
      courseTreeDataDetailTotal = courseTreeDataDetail.length;

      yield put({
        type: 'updateState',
        payload: {
          courseTreeDataDetail,
          courseTreeDataDetailTotal,
          fetchDataLoading: false,
          courseTreeDataDetailTmp: courseTreeDataDetail,
          courseTreeDataDetailTotalTmp: courseTreeDataDetailTotal,
        },
      });
    },
    *searchCapaTreeDataDetail({ payload }, { call, put, select }) {
      const { response } = yield call(queryCourseTreeDetail, payload);
      if (response.datum && Array.isArray(response.datum)) {
        const courseTreeDataDetail = response.datum || [];
        const courseTreeDataDetailTotal = courseTreeDataDetail.length;
        yield put({
          type: 'updateState',
          payload: {
            courseTreeDataDetail,
            courseTreeDataDetailTotal,
            fetchDataLoading: false,
            courseTreeDataDetailTmp: null,
            courseTreeDataDetailTotalTmp: 0,
          },
        });
      }
    },
    *queryCourseDetail({ payload }, { call, put, select }) {
      const { response } = yield call(findCourseDetailById, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          courseDetail: datum || {},
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
