import {
  queryProdCase,
  queryProdClassesTree,
  queryProdClassesTreeSub,
  queryProduct,
  saveProd,
  saveProdCate,
  saveProdCase,
  uploadPic,
} from '@/services/sys/baseinfo/product';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';

const formDataModel = {
  id: 0,
  prodNo: null,
  prodName: null,
  classId: 0,
  className: null,
  sortNo: null,
  prodProp: null,
  buId: 0,
  buName: null,
  coopName: null,
  picResId: null,
  picResName: null,
  prodStatus: null,
  industry: null,
  refEqva: null,
  inspectFlag: null,
  refPrice: null,
  inspectReason: null,
  tagDesc: null,
  prodCat1: null,
  prodCat2: null,
  prodCat3: null,
  prodCat4: null,
  prodCat5: null,
  prodCat6: null,
  prodCat7: null,
  prodCat8: null,
  prodCat9: null,
  prodCat10: null,
  subClassId: null,
  subClassName: null,
  taxRate: null,
};

export default {
  namespace: 'sysProductDetail',

  state: {
    tabModified: [0, 0, 0], // 记录哪个tab修改过 - 这个需要放在redux中
    checkedItem: [],
    caseList: [],
    treeData: [],
    subTreeData: [],
    formData: {
      ...formDataModel,
    },
    pageConfig: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(queryProduct, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { formData: datum || {} },
        });
      }
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
          // formData: {
          //   ...formData,
          //   subClassId: 333333,
          //   // classId: pId,
          // },
        },
      });
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formDataModel },
        },
      });
    },
    *save({ payload }, { call, select, put }) {
      const { formData } = yield select(({ sysProductDetail }) => sysProductDetail);
      if (!formData.inspectFlag || formData.inspectFlag === false) {
        formData.inspectFlag = 0;
      } else {
        formData.inspectFlag = 1;
      }
      const { status, response } = yield call(saveProd, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存产品成功。' });
        // router.push(
        //   `/plat/market/productdetail?canEdit=1&id=${response.datum}&from=${payload.from}`
        // );
        // 刷新页面
        const { id } = fromQs();
        if (id) {
          yield put({
            type: 'fetch',
            payload: {
              id: response.datum,
            },
          });
        } else {
          closeThenGoto(`/plat/market/product`);
        }
        // router.go();
      } else {
        createMessage({ type: 'error', description: '保存产品失败。' });
      }
    },
    *queryCaseList({ payload }, { call, put }) {
      const { response } = yield call(queryProdCase, payload);
      yield put({
        type: 'updateState',
        payload: { caseList: Array.isArray(response) ? response : [] },
      });
    },
    *saveCate(_, { call, select }) {
      const { formData } = yield select(({ sysProductDetail }) => sysProductDetail);
      const {
        status,
        response: { reason },
      } = yield call(saveProdCate, formData);

      return { status, reason };
    },
    *saveProdCase({ payload }, { call, put }) {
      const flag = payload.prodCaseList.filter(v => !v.caseName);
      if (flag.length) {
        return 'NG_CASE_NAME';
      } // 产品名称必填校验。
      const {
        status,
        response: { reason },
      } = yield call(saveProdCase, payload);
      return { status, reason };
    },
    *uploadPic({ payload }, { call, put }) {
      yield call(uploadPic, payload);
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
      history.listen(location => {});
    },
  },
};
