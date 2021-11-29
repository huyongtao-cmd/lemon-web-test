import {
  peopTemplateIncreaseRq,
  peopTemplateOverallRq,
  peopTemplateDetailRq,
} from '@/services/workbench/project';
import moment from 'moment';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';

const defaultState = {
  formData: {
    enableFlag: true,
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  tableInternalState: {},
};
export default {
  namespace: 'peopTemplateEdit',

  state: defaultState,

  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(peopTemplateDetailRq, payload);
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
        },
      });
    },

    *edit({ payload }, { call, put, select }) {
      console.log(payload);
      const { flag } = payload;
      const { ...params } = payload;
      const {
        tableInternalState: { refreshData },
      } = yield select(({ peopTemplateEdit }) => peopTemplateEdit);
      let data = {};
      if (params.id) {
        const { data: datum } = yield outputHandle(
          peopTemplateOverallRq,
          params,
          'peopTemplateEdit/success'
        );
        data = datum;
      } else {
        const { data: datum } = yield outputHandle(
          peopTemplateIncreaseRq,
          params,
          'peopTemplateEdit/success'
        );
        data = datum;
      }

      message({ type: 'success' });

      // 此操作致死，增加页面五秒空白时长，暂未找到原因
      // yield put({
      //   type: 'updateForm',
      //   payload: data,
      // });
      // const {flag} = payload
      if (!flag) {
        closeThenGoto(
          `/workTable/projectMgmt/peopTemplate?projectTemplateId=${
            payload.projectTemplateId
          }&refresh=1`
        );
      } else {
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
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

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(peopTemplateDetailRq, { id });
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

      // 页面变为详情模式，更新数据
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });

      // 赋值
      yield put({
        type: 'init',
        payload,
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

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
