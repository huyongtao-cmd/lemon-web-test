import {
  // selectUdc,
  detailUdc,
  listUdcDetail,
  createUdcDetail,
  deleteUdcDetail,
  editUdcDetail,
} from '@/services/sys/system/udc';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

const initData = {
  defId: null,
  lang: null,
  udcVal: null,
  word: null,
  pdefId: null,
  udcSeq: null,
  sphd1: null,
  sphd2: null,
  sphd3: null,
  sphd4: null,
  sphd5: null,
  sphd6: null,
  sphd7: null,
  sphd8: null,
  sphd9: null,
  sphd10: null,
};

export default {
  namespace: 'sysUdcDetail',

  state: {
    dataSource: [],
    total: 0,
    udcData: [],
    udcDataSource: [],
    infoData: {
      defId: null,
      defName: null,
      isBuiltIn: null,
      pDefId: null,
    },
    formData: { ...initData },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(detailUdc, payload);
      if (status === 200) {
        const res = response.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            infoData: res,
            formData: {
              ...initData,
              defId: res.defId,
            },
          },
        });
        if (res.pdefId)
          yield put({
            type: 'selectPUdc',
            payload: res.pdefId,
          });
      }
    },

    *list({ payload }, { call, put, select }) {
      const { response } = yield call(listUdcDetail, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },

    *selectPUdc({ payload }, { call, put }) {
      const { response } = yield call(listUdcDetail, payload);
      const datum = Array.isArray(response.datum) ? response.datum : [];
      const pList = datum.map(data => {
        const { udcVal, text, udcSeq } = data;
        return { id: udcSeq, code: udcVal, name: text, ...data };
      });
      yield put({
        type: 'updateState',
        payload: {
          udcData: pList,
          udcDataSource: pList,
        },
      });
    },

    *create({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysUdcDetail }) => sysUdcDetail);
      const { status, response } = yield call(createUdcDetail, formData);
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '????????????' });
        yield put({
          type: 'list',
          payload: fromQs().defId,
        });
      } else {
        createMessage({ type: 'error', description: '????????????' });
      }
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysUdcDetail }) => sysUdcDetail);
      const { status, response } = yield call(editUdcDetail, formData);
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '????????????' });
        yield put({
          type: 'list',
          payload: fromQs().defId,
        });
      } else {
        createMessage({ type: 'error', description: '????????????' });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(deleteUdcDetail, payload);
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '????????????' });
        yield put({
          type: 'list',
          payload: fromQs().defId,
        });
      } else {
        createMessage({ type: 'error', description: '????????????' });
      }
    },

    // ????????????????????????form???????????????????????????
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...initData,
          },
        },
      });
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
