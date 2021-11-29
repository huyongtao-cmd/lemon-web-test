// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import { getFlowDataFn, partialFn, deleteFn } from '@/services/sys/system/flowPanelcf';

import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

import { fromPairs } from 'ramda';

// 默认状态
const defaultState = {
  formData: {},
  formMode: 'EDIT',
  copy: false,
  id: undefined,
  pageConfig: {},
};

export default {
  namespace: 'flowPanelcf',

  state: defaultState,

  // 异步方法
  effects: {
    *getFlowData({ payload }, { call, select, put }) {
      const { response, status } = yield call(getFlowDataFn);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            flowDatas: response,
          },
        });
      }
      return response;
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

    *partial({ payload }, { put, select }) {
      yield outputHandle(partialFn, payload);

      yield put({ type: 'success' });
    },

    *pageQuery({ payload }, { put, select, call }) {
      // 必须用await 否则 直接掉用outputHandle方法 返回的是promise对象；await表示异步请求结束后才会走下面的代码？异步实现了类似同步的效果？
      // await 比方在async里面，否则会提示await是保留字
      // 使用await会导致 yield put 修改不了state
      const pageConfig = yield call(outputHandle, businessPageDetailByNo, {
        pageNo: 'FLOW_PANEL_LIST',
      });
      yield put({
        type: 'updateState',
        payload: {
          pageConfig,
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
