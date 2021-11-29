import {
  findProjectList,
  queryProjExecutionInfo,
  vacationExtrwork,
  saveExtrwork,
  extrworkCheckHandle,
} from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { projectClosAcc } from '../../../services/user/project/project';

const defaultSearchForm = {
  projectSearchKey: null, // 项目名称/编号
  userdefinedNo: null, // 参考合同号
  deliBuId: null, // 交付BU
  pmResId: null, // 项目经理
  workType: null, // 工作类型
  projStatus: null, // 项目状态
  salesmanResId: null, // 销售负责人
  contractSearchKey: null, // 子合同编号/名称
};

export default {
  namespace: 'userProject',

  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
    jumpData: {},
    vacation: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findProjectList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 项目执行情况表
    *projExecutionInfo({ payload }, { call, put }) {
      const { response } = yield call(queryProjExecutionInfo);

      yield put({
        type: 'updateState',
        payload: {
          reportBtn: response.ok,
          jumpData: response.datum || {},
        },
      });
      return response.datum || {};
    },
    // 项目关账接口
    *projectClosingAcc({ payload }, { call, put, select }) {
      console.warn(payload);
      const { status, response } = yield call(projectClosAcc, payload.projId);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (!response.ok) {
          createMessage({ type: 'error', description: response.reason || '系统错误,请联系管理员' });
        } else {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'updateSearchForm',
            payload: { selectedRowKeys: [] },
          });
          const { searchForm } = yield select(({ userProject }) => userProject);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '系统错误,请联系管理员' });
      }
    },
    *vacation({ payload }, { call, put }) {
      const { status, response } = yield call(vacationExtrwork, payload);
      if (status === 100) return;
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            vacation: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    // 保存
    *saveExtrwork({ payload }, { call, select, put }) {
      const { formData } = payload;
      const { resId } = formData;
      const res = yield call(extrworkCheckHandle, resId);
      if (res.response.ok && res.response.datum === 1) {
        const { status, response } = yield call(saveExtrwork, formData);
        if (status === 100) return false;
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          return true;
        }
        createMessage({ type: 'error', description: response.reason || '保存失败' });
        return false;
      }
      createMessage({
        type: 'error',
        description: '加班调休人员才需要维护加班安排，该资源为加班无调休人员，不需维护',
      });
      return false;
    },
    // 项目利润报表按钮
    // *projectProfitReport({ payload }, { call, put }) {
    //   const { response } = yield call(queryProjectProfitReport);

    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       reportBtn: response.ok,
    //       jumpData: response.datum || {},
    //     },
    //   });
    //   return response.datum || {};
    // },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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

    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
