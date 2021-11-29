import {
  queryCourseList,
  changeCourseStatusFn,
  addCourseFn,
  editCourseFn,
  deleteCourseFn,
  uploadCourseFn,
} from '@/services/plat/capa/course';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

const emptyFormData = {
  id: null,
  levelNo: '',
  levelName: '',
  levelStatus: 'ACTIVE',
  defFlag: 0,
};

export default {
  namespace: 'platCapaCourse',

  state: {
    // 查询系列
    searchForm: { courseStatus: 'IN_USE' },
    dataSource: [],
    total: 0,
    formData: {
      courseStatus: 'IN_USE',
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const parmas = payload || {};
      if (!payload.courseStatus) {
        delete parmas.courseStatus;
      }
      const {
        response: { rows, total },
      } = yield call(queryCourseList, parmas);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },

    *changeCourseState({ payload }, { call, put, select }) {
      const { response } = yield call(changeCourseStatusFn, payload);
      return response.ok;
    },

    *save({ payload }, { call, put }) {
      const { id } = payload;
      const api = id ? editCourseFn : addCourseFn;
      const { response } = yield call(api, payload);
      if (response && response.ok) {
        yield put({
          type: 'query',
          payload: {
            offset: 0,
            limit: 10,
          },
        });
        createMessage({ type: 'success', description: '操作成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return false;
    },

    *deleteHandle({ payload }, { call, put }) {
      const { status, response } = yield call(deleteCourseFn, payload);
      if (response && response.ok) {
        yield put({
          type: 'query',
          payload: {
            offset: 0,
            limit: 10,
          },
        });
        createMessage({ type: 'success', description: '删除成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
      return false;
    },

    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(uploadCourseFn, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (!response.ok) {
          createMessage({ type: 'error', description: response.reason || '上传失败' });
          return response;
        }
        yield put({
          type: 'query',
          payload: {
            offset: 0,
            limit: 10,
          },
        });
        createMessage({ type: 'success', description: '上传成功' });
        return response;
      }
      return {};
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

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: { courseStatus: 'IN_USE' },
          dataSource: [],
          total: 0,
          formData: {
            courseStatus: 'IN_USE',
          },
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

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {});
    },
  },
};
