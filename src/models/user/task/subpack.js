import router from 'umi/router';
import { findUserTaskById, selectBuByResIdUri } from '@/services/user/task/task';
import { submitSubpack, processSubpack, querySubpackDetail } from '@/services/user/task/received';
import { fromQs } from '@/utils/stringUtils';
import routerConfig from '../../../../config/router.config';
import { closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTaskSubpack',

  state: {
    formData: {
      id: null,
      disterResId: null,
      receiverResId: null,
      taskName: null,
      capasetLevelId: null,
      pid: null,
      planStartDate: null,
      planEndDate: null,
      remark: null,
      subcontractEqva: null,
      eqvaQty: null,
      amt: null,
      receiverBuId: null,
    },
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(findUserTaskById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            // dataSource: response.datum || {},
            formData: {
              disterResId: response.datum.receiverResId,
              capasetLevelId: response.datum.capasetLeveldId,
              pid: response.datum.id,
              // 用于显示字段
              pname: response.datum.taskName,
              jobType1Desc: response.datum.jobType1Name,
              jobType2Desc: response.datum.jobType2Name,
              leveldName: response.datum.capasetLeveldName,
              eqvaQty: response.datum.eqvaQty,
              amt: response.datum.amt,
            },
          },
        });
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
    },
    // 根据选择的资源获取对应的资源bu
    *queryBu({ payload }, { call, put }) {
      const { status, response } = yield call(selectBuByResIdUri, payload);
      if (response) {
        yield put({
          type: 'updateForm',
          payload: {
            receiverBuId: Array.isArray(response) ? response[0].id : null,
          },
        });
      }
    },
    *edit({ payload }, { call, put }) {
      const { response } = yield call(querySubpackDetail, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      const { status, response } = yield call(submitSubpack, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        if (payload.apprId) {
          // 再次推动流程
          const { status: sts } = yield call(pushFlowTask, payload.apprId, {
            result: 'APPROVED',
            remark: payload.remark,
          });
          if (sts === 100) {
            // 主动取消请求
            return;
          }
          if (sts === 200) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          }
        } else {
          // 第一次提交流程
          const process = yield call(processSubpack, response.datum);
          if (process.response.ok) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          } else {
            createMessage({ type: 'error', description: response.reason || '流程创建失败' });
          }
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
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
  },
};
