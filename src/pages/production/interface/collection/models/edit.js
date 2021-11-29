import { collectionSaveRq, collectionDetailRq } from '@/services/production/interface';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { isNil, type } from 'ramda';
import update from 'immutability-helper';

// 默认状态
const defaultState = {
  formData: {
    detailEntities: [],
    prepay: false,
  },
  delIds: [],
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
};

export default {
  namespace: 'collectionEdit',

  state: defaultState,

  // 影响->请求会产生影响。影响到state数据了
  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(collectionDetailRq, payload);
      const { detailViews, ...restRes } = data;
      yield put({
        type: 'updateForm',
        payload: {
          ...restRes,
          detailEntities: detailViews,
        },
      });
      return data;
    },

    *interfaceCollectionAdd({ payload }, { call, put, select }) {
      const { ...params } = payload;

      const { data } = yield outputHandle(collectionSaveRq, [params], 'collectionEdit/success');
      message({ type: 'success' });

      if (!fromQs().id) {
        router.push(`/plat/interface/collection/edit?id=${data[0].id}`);
      } else {
        yield put({
          type: 'queryDetails',
          payload: {
            id: fromQs().id,
          },
        });
      }

      return data;
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      // 页面变为详情模式，更新数据
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },
  },

  // 负责更新state
  reducers: {
    ...commonModelReducers(defaultState),

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }
      return {
        ...state,
        formData: newFormData,
      };
    },

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
