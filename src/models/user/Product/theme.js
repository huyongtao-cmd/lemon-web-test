/* eslint-disable array-callback-return */
import createMessage from '@/components/core/AlertMessage';
import {
  createTheme,
  queryTheme,
  deleteTheme,
  getThemeById,
  updateTheme,
} from '@/services/user/Product/theme';

export default {
  namespace: 'productTheme',
  state: {
    themeList: [],
    themeItem: {},
    selectedItem: {},
  },

  effects: {
    *create({ payload }, { call, put }) {
      const { response } = yield call(createTheme, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'query' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *query({ payload }, { call, put }) {
      const { response } = yield call(queryTheme);
      const { rows } = response;
      yield put({
        type: 'updateState',
        payload: {
          themeList: rows,
        },
      });
    },

    // 获取主题
    // eslint-disable-next-line consistent-return
    *getThemeById({ payload }, { call, put }) {
      const { id } = payload;
      const { response } = yield call(getThemeById, id);
      if (response.ok) {
        const { datum } = response;
        const newPanelTitle = datum.panelTitle.split(',');
        yield put({
          type: 'updateState',
          payload: {
            themeItem: { ...datum, newPanelTitle },
          },
        });
      }
      return response;
    },

    *updateTheme({ payload }, { call, put }) {
      const { response } = yield call(updateTheme, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '修改成功' });
        yield put({
          type: 'query',
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '修改失败' });
      }
    },

    *deleteTheme({ payload }, { call, put, select }) {
      const { themeList } = yield select(({ productTheme }) => productTheme);
      const { id } = payload;
      const { response } = yield call(deleteTheme, id);
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const newThemeList = [];
        themeList.map(item => {
          if (item.id !== id) {
            newThemeList.push(item);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            themeList: newThemeList,
            selectedItem: {},
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
      return false;
    },
  },

  reducers: {
    cleanState(state, { payload }) {
      return {
        ...state,
        themeItem: {},
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    selectedItem(state, { payload }) {
      return {
        ...state,
        selectedItem: payload,
      };
    },
  },
};
