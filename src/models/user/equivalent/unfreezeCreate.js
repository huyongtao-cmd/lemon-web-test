import createMessage from '@/components/core/AlertMessage';

import {
  findFreezeList,
  createInchargeUnfreeze,
  modifyUnfreeze,
} from '@/services/user/equivalent/equivalent';
import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

// 处理空属性,可以处理list,{},字符串
const handleEmptyProps = param => {
  if (param === undefined || param === null) {
    return undefined;
  }
  if (typeof param === 'object') {
    let newObject;
    if (Array.isArray(param)) {
      newObject = Object.assign([], param);
      for (let index = 0; index < newObject.length; index += 1) {
        const val = param[index];
        if (val === undefined || val === null) {
          newObject.splice(index, 1);
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[index] = val.trim();
          } else {
            newObject.splice(index, 1);
          }
        }
      }
    } else {
      // 是一个对象
      newObject = Object.assign({}, param);
      Object.keys(newObject).forEach(key => {
        const val = param[key];
        if (val === undefined || val === null) {
          delete newObject[key];
          return;
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[key] = val.trim();
          } else {
            delete newObject[key];
          }
        }
      });
    }
    return newObject;
  }
  if (typeof param === 'string') {
    return param.trim();
  }
  return param;
};

export default {
  namespace: 'unfreezeCreate',
  state: {
    formData: {},
    dataSource: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const param = handleEmptyProps(payload);
      if (param.inTime) {
        param.inTimeStart = param.inTime[0]; // eslint-disable-line
        param.inTimeEnd = param.inTime[1]; // eslint-disable-line
        delete param.inTime;
      }
      if (param.avalDate) {
        param.avalDateStart = param.avalDate[0]; // eslint-disable-line
        param.avalDateEnd = param.avalDate[1]; // eslint-disable-line
        delete param.avalDate;
      }
      const { status, response } = yield call(findFreezeList, param);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(modifyUnfreeze, payload);
      } else {
        // 新增
        response = yield call(createInchargeUnfreeze, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/user/equivalent/unfreezeList`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
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
