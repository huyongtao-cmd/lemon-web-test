import { isEmpty, isNil, omit } from 'ramda';
import router from 'umi/router';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import {
  performanceTargetListRq,
  createPerformanceTargetRq,
  performanceTargetDeleteRq,
  performanceTargetDetailRq,
  createIndexTargetSaveRq,
  indexTargetDeleteRq,
  indexHistoryRq,
  getResDetailRq,
  getPeriodListRq,
} from '@/services/plat/prefCheck/performance';

const defaultState = {
  formData: {},
  indicatorData: [],
  targetPeriodList: [],
  dataSource: [],
  fieldsConfig: {
    buttons: [],
    panels: {
      disabledOrHidden: {},
    },
  },
  flowForm: {
    remark: undefined,
    dirty: false,
  },
};

export default {
  namespace: 'performanceTarget',

  state: defaultState,

  effects: {
    // 请求列表页
    *query({ payload }, { call, put }) {
      const { response } = yield call(performanceTargetListRq, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.data.rows,
            total: response.data.total,
          },
        });
      } else {
        const message = response.errors[0].msg || '查询失败';
        createMessage({ type: 'warn', description: message });
      }
    },

    // 保存/提交
    *save({ payload }, { call, put, select }) {
      const { submit, dryRunFlag } = payload;
      const { response } = yield call(createPerformanceTargetRq, payload);
      if (response && response.ok) {
        if (submit) {
          createMessage({ type: 'success', description: '提交成功' });
          if (dryRunFlag) {
            const url = getUrl().replace('edit', 'view');
            closeThenGoto(url);
          } else {
            closeThenGoto(`/user/flow/process`);
          }
        } else {
          router.push(`/hr/prefMgmt/performanceTarget`);
          createMessage({ type: 'success', description: '保存成功' });
        }
      } else {
        const message = response.errors[0].msg || '提交失败';
        createMessage({ type: 'warn', description: message });
      }
      return response;
    },

    // 删除
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(performanceTargetDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'query',
            payload: {
              offset: 0,
              limit: 10,
              sortBy: 'id',
              sortDirection: 'DESC',
            },
          });
        } else {
          const message = response.errors[0].msg || '操作失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 详情
    *getDetail({ payload }, { call, put }) {
      const { response } = yield call(performanceTargetDetailRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response.data,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: response.errors[0].msg || '获取详情出错' });
      }
      return response;
    },

    // 获取历史版本
    *getHistory({ payload }, { call, put }) {
      const { response } = yield call(indexHistoryRq, payload);
      const indicatorData = Object.keys(response.data).map(v => response.data[v]);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            indicatorData,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.errors[0].msg || '获取历史版本失败' });
      }
      return response;
    },

    // 根据资源获取详情
    *getResDetail({ payload }, { call, put }) {
      const { response } = yield call(getResDetailRq, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            baseBuName: response.data.baseBuName,
            enrollDate: response.data.enrollDate,
            jobGrade: response.data.jobGrade,
            position: response.data.position,
            positionTakeDate: response.data.positionTakeDate,
            presName: response.data.presName,
            resName: response.data.resName,
          },
        });
      } else {
        const message = response.errors[0].msg || '获取失败';
        createMessage({ type: 'warn', description: message });
      }
    },

    // 获取目标周期列表
    *getPeriodList({ payload }, { call, put }) {
      const { response } = yield call(getPeriodListRq, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            targetPeriodList: Array.isArray(response.data)
              ? response.data.map(item => ({
                  ...item,
                  value: item.id,
                  title: item.periodName,
                }))
              : [],
          },
        });
      } else {
        const message = response.errors[0].msg || '获取失败';
        createMessage({ type: 'warn', description: message });
      }
    },

    // 获取流程配置
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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

    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element)) {
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

    cleanState(state, { payload }) {
      return {
        ...state,
        formData: {},
        indicatorData: [],
        targetPeriodList: [],
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
