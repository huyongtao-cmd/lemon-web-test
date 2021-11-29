// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  systemRemindDetail,
  systemRemindCreate,
  systemRemindOverallModify,
  systemRemindPartialModify,
} from '@/services/production/system';

// 默认状态
const defaultState = {
  formData: {},
  formMode: 'EDIT',
  copy: false,
  id: undefined,
};

export default {
  namespace: 'remindDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const { id, copy = false } = yield select(({ remindDisplayPage }) => remindDisplayPage);
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(systemRemindDetail, { id });
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
          systemRemindOverallModify,
          formData,
          'remindDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(systemRemindCreate, formData, 'remindDisplayPage/success');
      }
      yield put({ type: 'success' });
    },

    *setTimeNull({ payload }, { put, select }) {
      const output = yield outputHandle(systemRemindPartialModify, payload);

      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });
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
  },

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
