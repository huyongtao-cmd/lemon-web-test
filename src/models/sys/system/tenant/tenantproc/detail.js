// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import { insert, overall, partial, detail } from '@/services/sys/system/tenantProc';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

// 默认状态
const defaultState = {
  formData: {},
  formMode: 'EDIT',
  copy: false,
  id: undefined,
  pageConfig: {},
};

export default {
  namespace: 'tenantProcDetail',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const { id, copy = false } = yield select(({ tenantProcDetail }) => tenantProcDetail);
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(detail, { id });
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
        output = yield outputHandle(overall, formData, 'tenantProcDetail/success');
      } else {
        // 新增
        output = yield outputHandle(insert, formData, 'tenantProcDetail/success');
      }
      yield put({ type: 'success' });
      yield put({
        type: 'updateState',
        payload: {
          formData: output.data,
          id: output.data.id,
        },
      });
    },

    *setEffect({ payload }, { put, select }) {
      // 有效、无效
      yield outputHandle(partial, payload);

      yield put({ type: 'success' });
    },

    *pageQuery({ payload }, { put, call }) {
      const pageConfig = yield call(outputHandle, businessPageDetailByNo, {
        pageNo: 'TENANT_PROC_FORM',
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
