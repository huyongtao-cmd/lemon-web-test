import { omit } from 'ramda';
import { findSetById, querySetLevelsById, saveSet } from '@/services/plat/capa/set';
import {
  queryCapaLevelSelNew,
  queryCapaLevelDetSelNew,
  queryCapaTree,
  queryCapaTreeDetail,
} from '@/services/plat/capa/capa';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

const emptyFormData = {
  id: null,
  hasLevelFlag: 1,
};

export default {
  namespace: 'platCapaSetCreate',

  state: {
    // 查询系列
    formData: {
      ...emptyFormData,
    },
    dataList: [],
    dataList2: [],
    levelList: [],
    leveDetaillList: [],
    capaTreeData: [],
    capaTreeDataDetail: [],
    fetchDataLoading: false,
    capaTreeDataDetailTmp: [],
    capaTreeDataDetailTotalTmp: 0,
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
          },
          dataList: [],
          dataList2: [],
          levelList: [],
          leveDetaillList: [],
          capaTreeData: [],
          capaTreeDataDetail: [],
          fetchDataLoading: false,
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { response } = yield call(findSetById, payload);

      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
        },
      });

      return response;
    },

    *queryAlias({ payload }, { call, put }) {
      const { response } = yield call(querySetLevelsById, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
        },
      });

      return response;
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

    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);
      const { ok, datum = [] } = response;
      if (response && ok && Array.isArray(datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.text;
            newItem.key = item.id;
            if (Array.isArray(item.children) && item.children.length > 0) {
              newItem.child = loopTreeData(item.children);
            }
            return newItem;
          });
          return newData;
        };
        yield put({
          type: 'updateState',
          payload: {
            capaTreeData: loopTreeData(datum),
          },
        });
      }
    },

    *queryCapaTreeDataDetail({ payload }, { call, put, select }) {
      let capaTreeDataDetailTotal = 0;
      let capaTreeDataDetail = [];
      const { id = [] } = payload;

      for (let i = 0; i < id.length; i += 1) {
        const idLength = id[i] ? id[i].split('-').length : 0;
        if (idLength > 2) {
          const { response } = yield call(queryCapaTreeDetail, { id: id[i] });
          if (response.datum && Array.isArray(response.datum)) {
            const capaTreeDataDetailItem = response.datum.map(item => {
              // eslint-disable-next-line no-param-reassign
              item.children = undefined;
              return item;
            });
            capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);

            capaTreeDataDetailTotal = capaTreeDataDetail.length;
          }
        }
      }

      const obj = {};
      capaTreeDataDetail = capaTreeDataDetail.reduce((item, next) => {
        obj[next.capaLevelId] ? '' : (obj[next.capaLevelId] = true && item.push(next));
        return item;
      }, []);
      capaTreeDataDetailTotal = capaTreeDataDetail.length;

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
          fetchDataLoading: false,
          capaTreeDataDetailTmp: capaTreeDataDetail,
          capaTreeDataDetailTotalTmp: capaTreeDataDetailTotal,
        },
      });
    },
    *searchCapaTreeDataDetail({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaTreeDetail, payload);
      if (response.datum && Array.isArray(response.datum)) {
        const capaTreeDataDetailItem = response.datum.map(item => {
          // eslint-disable-next-line no-param-reassign
          item.children = undefined;
          return item;
        });
        const capaTreeDataDetail = capaTreeDataDetailItem || [];
        const capaTreeDataDetailTotal = capaTreeDataDetail.length;
        yield put({
          type: 'updateState',
          payload: {
            capaTreeDataDetail,
            capaTreeDataDetailTotal,
            fetchDataLoading: false,
            capaTreeDataDetailTmp: null,
            capaTreeDataDetailTotalTmp: 0,
          },
        });
      }
    },
    // 根据工种获取工种子类的信息
    *updateJobType2({ payload }, { call, select, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload.parentVal,
      });
      // 更新字段名称
      const { formData } = yield select(({ platCapaSetCreate }) => platCapaSetCreate);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formData, jobType1Name: payload.jobType1Name },
          jobType2Data: Array.isArray(response) ? response : [],
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveSet, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/hr/capacity/set');
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '保存失败',
        });
      }
    },
    *queryRes({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
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
