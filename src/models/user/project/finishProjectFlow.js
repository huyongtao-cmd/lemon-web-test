import {
  projClosureApplySaveRq,
  projClosureApplyDetailsRq,
  getResultsByProjRq,
  checkresultSaveRq,
  checkresultRq,
  evalInfoRq,
  evalSaveRq,
  getPointRq,
} from '@/services/user/project/project';
import { closeFlowRq } from '@/services/user/flow/flow';
import { getViewConf } from '@/services/gen/flow';
import { queryReasonList } from '@/services/user/timesheet/timesheet';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {};

export default {
  namespace: 'finishProjectFlow',
  state: {
    resDataSource: [],
    baseBuDataSource: [],
    projList: [],
    formData: {},
    resultChkList: [], // 结项检查事项
    evalInfoList: [], // 项目成员评价
    getPointList: [], // 销售、领导对项目经理评价信息获取评价主题信息
    getPointItemList: [], // 销售、领导对项目经理评价信息获取评价点信息
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      chkClass: null,
      evalType: null,
      panels: {
        disabledOrHidden: {},
      },
    },
  },

  effects: {
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ finishProjectFlow }) => finishProjectFlow);
      const { status, response } = yield call(projClosureApplySaveRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *projClosureApplyDetails({ payload }, { call, put }) {
      const { status, response } = yield call(projClosureApplyDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },
    *checkresult({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultRq, payload);
      if (status === 200 && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            resultChkList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取办理事项列表失败' });
      }
    },
    *evalInfo({ payload }, { call, put }) {
      const { status, response } = yield call(evalInfoRq, payload);
      if (status === 200 && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            evalInfoList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取项目成员评审列表失败',
        });
      }
    },
    *getPoint({ payload }, { call, put }) {
      const { status, response } = yield call(getPointRq, payload);
      if (status === 200 && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            getPointList: Array.isArray(response.datum) ? response.datum : [],
            getPointItemList: Array.isArray(response.datum[0].itemList)
              ? response.datum[0].itemList
              : [],
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取项目成员评审列表失败',
        });
      }
    },
    *evalSave({ payload }, { call, put }) {
      const { status, response } = yield call(evalSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (!response.ok) {
          createMessage({ type: 'error', description: response.reason || '评价详情保存失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '评价详情保存失败' });
      }
    },
    *checkresultUpdate({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (!response.ok) {
          createMessage({ type: 'error', description: response.reason || '结项检查事项处理失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '结项检查事项处理失败' });
      }
    },
    *getResultsByProj({ payload }, { call, put }) {
      const { status, response } = yield call(getResultsByProjRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              resultChkList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取检查事项失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取检查事项失败' });
      }
    },
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
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },
    // 获得项目下拉数据
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    *closeFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
        },
      });
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
