import {
  findSetById,
  queryCapaSetLevelDetSel,
  querySetLevelsById,
  saveSet,
} from '@/services/plat/capa/set';
import { queryCascaderUdc } from '@/services/gen/app';
import {
  queryCapaLevelSel,
  queryCapaLevelSelNew,
  queryCapaLevelDetSelNew,
  queryCapaTree,
  queryCapaTreeDetail,
} from '@/services/plat/capa/capa';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

export default {
  namespace: 'platCapaSetEdit',

  state: {
    // 查询系列
    formData: {},
    dataList: [],
    dataList2: [],
    levelList: [],
    type2: [],
    leveDetaillList: [],
    fetchDataLoading: false,
    capaSetAbilityIds: [],
    capaSetLevelIds: [],
    capaTreeData: [],
    capaTreeDataDetail: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findSetById, payload);

      const capasetLevelEntities = response.datum.capasetLevelEntities.map(item => {
        const { apprRes, apprType } = item;
        if (apprType === 'ASSIGN_RES') {
          // eslint-disable-next-line no-param-reassign
          item.apprRes = apprRes
            ? apprRes.split(',').map(apprResItem => parseInt(apprResItem, 10))
            : null;
        }
        return item;
      });

      const capasetCapaEntityList = response.datum.capasetCapaEntityList.map(item => {
        const { capaSetLevelReViews } = item;
        if (capaSetLevelReViews && capaSetLevelReViews.length > 0) {
          capaSetLevelReViews.forEach(levelItem => {
            if (levelItem.leveldId) {
              // eslint-disable-next-line no-param-reassign
              item[`leveldIdList-${levelItem.leveldId}`] = true;
            }
          });
        }
        return item;
      });
      const formData = {
        ...response.datum,
        apprRes:
          response.datum.apprType === 'ASSIGN_RES' && response.datum.apprRes
            ? response.datum.apprRes.split(',').map(item => parseInt(item, 10))
            : response.datum.apprRes,
      };
      yield put({
        type: 'updateState',
        payload: {
          formData,
          dataList: response.datum.hasLevelFlag ? capasetLevelEntities || [] : [],
          dataList2: capasetCapaEntityList || [],
        },
      });
      if (response.datum.hasLevelFlag) {
        yield put({
          type: 'queryLeveDetaillList',
          payload: {
            id: response.datum.levelId,
          },
        });
      }

      return response;
    },

    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);

      if (response && response.ok && Array.isArray(response.datum)) {
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
            capaTreeData: loopTreeData(response.datum),
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
      const { status, response } = yield call(saveSet, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
    },
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          dataList: [],
          dataList2: [],
          levelList: [],
          type2: [],
          leveDetaillList: [],
          fetchDataLoading: false,
          capaSetAbilityIds: [],
          capaSetLevelIds: [],
          capaTreeData: [],
          capaTreeDataDetail: [],
        },
      });
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
