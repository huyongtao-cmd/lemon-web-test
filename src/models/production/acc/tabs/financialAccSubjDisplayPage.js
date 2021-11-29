// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  financialAccSubjDetail,
  financialAccSubjCreate,
  financialAccSubjOverallModify,
  financialAccSubjPartialModify,
} from '@/services/production/acc';

// 默认状态
const defaultState = {
  formData: {},
  formMode: 'EDIT',
  copy: false,
};

export default {
  namespace: 'financialAccSubjDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ financialAccSubjDisplayPage }) => financialAccSubjDisplayPage);
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(financialAccSubjDetail, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });
      yield put({
        type: 'updateForm',
        payload: {
          id: payload.data.id,
        },
      });
      yield put({
        type: 'init',
      });
      // 页面变为详情模式
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(
          financialAccSubjOverallModify,
          formData,
          'financialAccSubjDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(
          financialAccSubjCreate,
          formData,
          'financialAccSubjDisplayPage/success'
        );
      }
      yield put({ type: 'success', payload: output });
    },
  },

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
