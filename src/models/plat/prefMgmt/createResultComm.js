import {
  examByIdRq,
  createPlanCommRq,
  assessorByIdRq,
} from '@/services/plat/prefCheck/prefCheckFlow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'createResultComm',
  state: {
    formData: {},
    communicateList: [],
    pageConfig: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examByIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                assessedVisible: '1',
              },
            },
          });
        }
      }
    },
    *queryrelatedRoleDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(assessorByIdRq, payload);
      const { communicateList } = yield select(({ createResultComm }) => createResultComm);
      if (status === 200) {
        if (response && response.ok) {
          const list = response.datum;
          list.map((item, key) => {
            if (item.relatedRole === 'P_RES') {
              communicateList.push({
                id: 1,
                apprResId: item.apprResId,
                name: '上级',
                source: '自动计算',
                relatedRole: item.relatedRole,
              });
            } else if (item.relatedRole === 'BU_PIC') {
              communicateList.push({
                id: 2,
                apprResId: item.apprResId,
                name: 'BU_负责人',
                source: '自动计算',
                relatedRole: item.relatedRole,
              });
            } else if (item.relatedRole === 'ASSIGN_RES') {
              communicateList.push({
                id: 3,
                apprResId: item.apprResId,
                name: '指定资源',
                source: item.apprResIdName,
                relatedRole: item.relatedRole,
              });
            }
            return true;
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            communicateList,
          },
        });
      }
    },
    *submit({ payload }, { call, put }) {
      const { status, response } = yield call(createPlanCommRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process?type=procs`);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
