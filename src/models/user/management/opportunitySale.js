import { findOppoSales, saveOppoSales, selectSupp } from '@/services/user/management/opportunity';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import {
  deleteProdPord,
  doInspect,
  doPutaway,
  doSoldOut,
  finishInspect,
  queryProdList,
  queryProdClassesTree,
  queryProdClassesTreeSub,
} from '@/services/sys/baseinfo/product';

export default {
  namespace: 'userOppsDetailsale',

  state: {
    saleList: [],
    saleDels: [],
    saleTotal: 0,
    suppList: [],
    saleType1Source: [],
    saleType2Source: [],
    salePageConfig: {},
    prodList: [],
    treeData: [],
    subTreeData: [],
  },

  effects: {
    *subTree({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysProductDetail }) => sysProductDetail);
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
          formData: {
            ...formData,
            subClassId: null,
            classId: pId,
          },
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
    *query({ payload }, { call, put }) {
      const { response } = yield call(findOppoSales, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      yield put({
        type: 'updateState',
        payload: {
          saleList: list,
          saleTotal: response.total,
          saleDels: list.map(v => v.id),
        },
      });
    },
    // 查询供应商多列数据
    *querySelectSupp(_, { call, put }) {
      const { response } = yield call(selectSupp);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            suppList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    *queryUdcSaleType1(_, { call, put }) {
      const { response } = yield call(queryUdc, 'TSK.SALE_TYPE1');
      if (response) {
        yield put({
          type: 'updateState',
          payload: { saleType1Source: Array.isArray(response) ? response : [] },
        });
      }
    },
    *queryUdcSaleType2(_, { call, put }) {
      const { response } = yield call(queryUdc, 'TSK.SALE_TYPE2');
      if (response) {
        yield put({
          type: 'updateState',
          payload: { saleType2Source: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 在列表里 根据销售大类获取销售小类
    *updateSaleType2({ payload }, { call, put, select }) {
      const { index, value } = payload;
      const { saleList } = yield select(({ userOppsDetailsale }) => userOppsDetailsale);
      const { response } = yield call(queryCascaderUdc, {
        defId: 'TSK:SALE_TYPE2',
        parentDefId: 'TSK:SALE_TYPE1',
        parentVal: value,
      });
      if (response) {
        saleList[index].saleType2Data = Array.isArray(response) ? response : [];
        saleList[index].saleType1 = value;
        saleList[index].saleType2 = undefined;
        yield put({
          type: 'updateState',
          payload: { saleList },
        });
      }
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { saleDels, saleList } = yield select(({ userOppsDetailsale }) => userOppsDetailsale);
      // // 把原始数据里被删掉的id找出来
      // const list = saleList.filter(v => !!v.prodName);
      const list = saleList;
      const ids = saleDels.filter(d => !list.map(i => i.id).filter(v => v > 0 && d === v).length);

      const { status, response } = yield call(saveOppoSales, { entityList: list, delIds: ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'query', payload });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            salePageConfig: response.configInfo,
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
};
