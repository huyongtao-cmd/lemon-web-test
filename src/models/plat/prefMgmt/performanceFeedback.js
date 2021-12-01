import { isEmpty, isNil, omit } from 'ramda';
import router from 'umi/router';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import {
  performanceFeedbackListRq,
  performanceFeedbackDetailRq,
  createFeedbackSaveRq,
  getPeriodListRq,
  stageAssesmentEvaluateSaveRq,
  createIndexTargetSaveRq,
  feedbackCheckChangingRq,
} from '@/services/plat/prefCheck/performance';

export default {
  namespace: 'performanceFeedback',

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
      const { response } = yield call(performanceFeedbackListRq, payload);
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

    // 个人修改了绩效考核指标后，如果流程没有走完，该节点的审批不能放过去
    *feedbackCheckChanging({ payload }, { call, put }) {
      const { response } = yield call(feedbackCheckChangingRq, payload);
      return response;
    },

    // 详情
    *getDetail({ payload }, { call, put }) {
      const { response } = yield call(performanceFeedbackDetailRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...omit(
                ['baseBuName', 'createUserId', 'createUserName', 'presName', 'targetName'],
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
      const { response } = yield call(createFeedbackSaveRq, payload);
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

    *IndexListsave({ payload }, { call, put, select }) {
      const { response } = yield call(createIndexTargetSaveRq, payload);
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
