import {
  procurDemandDetailRq,
  procurDemandEditRq,
} from '@/services/user/Contract/purchaseDemandDeal';
import {
  queryProdClassesTree,
  queryProdClassesTreeSub,
  queryProdList,
} from '@/services/sys/baseinfo/product';
import { selectAllAbOu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'purchaseDemandDeal',

  state: {
    formData: {
      demandStatus: 'CREATE',
      demandData: moment().format('YYYY-MM-DD'),
    },
    dataSource: [],
    delProCurD: [],
    treeData: [],
    subTreeData: [],
    prodList: [],
    abOusArr: [],
  },

  effects: {
    *selectAbOus({ payload }, { call, put }) {
      const { response } = yield call(selectAllAbOu, payload);
      yield put({
        type: 'updateState',
        payload: {
          abOusArr: response || [],
        },
      });
    },
    *queryProdListFun({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryProdList, payload);

      yield put({
        type: 'updateState',
        payload: {
          prodList: Array.isArray(rows) ? rows : [],
        },
      });
    },
    *tree({ payload }, { call, put }) {
      const mergeDeep = child =>
        Array.isArray(child)
          ? child.map(item => ({
              ...item,
              title: item.className,
              key: item.id,
              value: item.id,
              children: item.child ? mergeDeep(item.child) : [],
            }))
          : [];

      const { response } = yield call(queryProdClassesTree, payload);
      yield put({
        type: 'updateState',
        payload: {
          treeData: mergeDeep(Array.isArray(response) ? response : []),
        },
      });
    },
    *subTree({ payload }, { call, put, select }) {
      const mergeDeep = child =>
        Array.isArray(child)
          ? child.map(item => ({
              ...item,
              title: item.className,
              key: item.id,
              value: item.id,
              children: item.child ? mergeDeep(item.child) : [],
            }))
          : [];

      const { response } = yield call(queryProdClassesTreeSub, payload);
      const { pId } = payload;
      yield put({
        type: 'updateState',
        payload: {
          subTreeData: mergeDeep(Array.isArray(response) ? response : []),
        },
      });
      yield put({
        type: 'updateForm',
        payload: {
          subClassId: null,
          classId: pId,
        },
      });
      return mergeDeep(Array.isArray(response) ? response : []);
    },
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(procurDemandDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { procurDemandDViews = [], ...newFormData } = response.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            dataSource: procurDemandDViews,
          },
        });
        yield put({
          type: 'updateForm',
          payload: newFormData,
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取采购需求处理失败',
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { formData, dataSource, delProCurD } = yield select(
        ({ purchaseDemandDeal }) => purchaseDemandDeal
      );
      const { status, response } = yield call(procurDemandEditRq, {
        ...formData,
        procurDemandDViews: dataSource,
        delProCurD,
      });
      if (response && response.ok) {
        const { procurDemandDViews = [], ...newFormData } = response.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            dataSource: procurDemandDViews,
            delProCurD: [],
          },
        });
        yield put({
          type: 'updateForm',
          payload: newFormData,
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag6: 0,
          },
        });
        createMessage({ type: 'success', description: '保存成功' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
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
