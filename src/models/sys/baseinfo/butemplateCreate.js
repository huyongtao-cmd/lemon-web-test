import {
  findButemplateById,
  create,
  update,
  findAccTmplSelect,
} from '@/services/sys/baseinfo/butemplate';

import { findSubjtemplateDetails } from '@/services/sys/baseinfo/subjtemplate';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
// import router from 'umi/router';

const formDataModel = {
  id: 0,
  remark: null,
  tmplName: null,
  tmplNo: null,
  tmplTypeName: null,
  accTmplId: null,
  accTmplName: null,
  currCodeName: null,
  finCalendarId: null,
};

export default {
  namespace: 'sysButempCreate',

  state: {
    formData: {
      ...formDataModel,
    },
    mode: 'create',
    subjtempList: [],
    financeList: [],
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findButemplateById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { formData: datum || {}, mode: payload.mode },
        });
      }
    },
    // 查询科目下拉
    *queryAccTmplSelect({ payload }, { call, put, select }) {
      const response = yield call(findAccTmplSelect, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { subjtempList: Array.isArray(response.response) ? response.response : [] },
        });
      }
    },
    // 查询财务科目信息
    // *queryFinanceList({ payload }, { call, put }) {
    //   const { response } = yield call(findSubjtemplateDetails, { tmplId: payload.accTmplId });
    //   if (response && response.ok) {
    //     const { datum = [] } = response;
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         financeList: datum,
    //       },
    //     });
    //   }
    // },
    // 查询结算当量
    *queryEqvaList({ payload }, { call, put }) {
      // TODO: 查询结算当量
    },
    *basicSave(_, { call, select, put }) {
      const { formData } = yield select(({ sysButempCreate }) => sysButempCreate);
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            yield put({
              type: 'query',
              payload: { id: formData.id, mode: 'update' },
            });
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/plat/buMgmt/butempedit?id=${response.datum.id}&mode=update&tab=basic`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    *financeSave(_, { put, call, select }) {
      const { formData } = yield select(({ sysButempCreate }) => sysButempCreate);
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          yield put({ type: 'queryFinanceList', payload: { accTmplId: formData.accTmplId } });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          // router.push(`/plat/buMgmt/butempedit?id=${response.datum.id}&mode=update&tab=finance`);
          // router.go();
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formDataModel,
          },
          mode: 'create',
          subjtempList: [],
          financeList: [],
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
    // 修改form表单字段内容，将数据保存到state
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
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
