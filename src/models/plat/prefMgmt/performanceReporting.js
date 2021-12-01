import { isEmpty, isNil, omit } from 'ramda';
import router from 'umi/router';
import update from 'immutability-helper';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import {
  performanceSummaryListRq,
  performanceSummaryDetailRq,
  createSummarySaveRq,
  getPeriodListRq,
  stageAssesmentEvaluateSaveRq,
  createIndexTargetSaveRq,
  createPerformanceTargetRq,
  gradeBatchPublishRq,
} from '@/services/plat/prefCheck/performance';

export default {
  namespace: 'performanceReporting',

  state: {
    formData: {
      indicatorData: [],
    },
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
  },

  effects: {
    // 请求列表页
    *query({ payload }, { call, put }) {
      const { response } = yield call(performanceSummaryListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.data.rows,
            total: response.data.total,
          },
        });
      }
    },

    // 详情
    *getDetail({ payload }, { call, put }) {
      const { response } = yield call(performanceSummaryDetailRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...omit(
                [
                  'baseBuName',
                  'createUserId',
                  'createUserName',
                  'presName',
                  'targetName',
                  'resName',
                  'resId',
                  'periodId',
                  'periodName',
                ],
                response.data
              ),
              indexList: response.data.targetView.indexList,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: response.errors[0].msg || '获取详情出错' });
      }
      return response;
    },

    // 保存
    *save({ payload }, { call, put, select }) {
      const { submit, dryRunFlag } = payload;
      const { response } = yield call(createSummarySaveRq, payload);
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
          // router.push(`/hr/prefMgmt/performanceTarget`);
          createMessage({ type: 'success', description: '保存成功' });
        }
      } else {
        const message = response.errors[0].msg || '提交失败';
        createMessage({ type: 'warn', description: message });
      }
    },

    *gradeSave({ payload }, { call, put, select }) {
      const { response } = yield call(createPerformanceTargetRq, payload);
      return response;
    },

    // 提交评论
    *stageAssesmentEvaluateSave({ payload }, { call, put, select }) {
      const { response } = yield call(stageAssesmentEvaluateSaveRq, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        yield put({
          type: 'getDetail',
          payload: { id: payload.stageAssessmentId },
        });
      } else {
        const message = response.errors[0].msg || '提交失败';
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

    // 批量发起KPI打分公布流程
    *gradeBatchPublish({ payload }, { call, put, select }) {
      const { status, response } = yield call(gradeBatchPublishRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.data });
          // closeThenGoto(`/user/flow/process`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
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

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
