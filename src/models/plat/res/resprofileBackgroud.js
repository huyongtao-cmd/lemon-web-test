import {
  findResEdubgList,
  edubgCreate,
  edubgUpdate,
  deleteResEdubgs,
  findResWorkbgList,
  workbgCreate,
  workbgUpdate,
  deleteResWorkbgs,
  findResCertList,
  certCreate,
  certUpdate,
  deleteResCerts,
} from '@/services/plat/res/resprofile';
import { queryUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'platResProfileBackground',

  state: {
    edubgDataSource: [], // 教育经历
    edubgTotal: 0,
    workbgDataSource: [], // 工作经历
    workbgTotal: 0,
    certDataSource: [], // 资质证书
    certTotal: 0,
    sourceType: [],
    edubgSofarFlag: false,
    workbgSofarFlag: false,
  },

  effects: {
    *getSourceType({ payload }, { call, put }) {
      const { response } = yield call(queryUdc, payload.code);

      yield put({
        type: 'updateState',
        payload: {
          sourceType: Array.isArray(response) ? response : [],
        },
      });
    },
    *query({ payload }, { call, put }) {
      const { response: edubgResponse } = yield call(findResEdubgList, payload);
      const { response: workbgResponse } = yield call(findResWorkbgList, payload);
      const { response: certResponse } = yield call(findResCertList, payload);

      yield put({
        type: 'updateState',
        payload: {
          edubgDataSource: Array.isArray(edubgResponse.rows) ? edubgResponse.rows : [],
          edubgTotal: edubgResponse.total,
          workbgDataSource: Array.isArray(workbgResponse.rows) ? workbgResponse.rows : [],
          workbgTotal: workbgResponse.total,
          certDataSource: Array.isArray(certResponse.rows) ? certResponse.rows : [],
          certTotal: certResponse.total,
        },
      });
    },
    // 教育经历查询
    *queryEdubg({ payload }, { call, put }) {
      const { response: edubgResponse } = yield call(findResEdubgList, payload);

      yield put({
        type: 'updateState',
        payload: {
          edubgDataSource: Array.isArray(edubgResponse.rows) ? edubgResponse.rows : [],
          edubgTotal: edubgResponse.total,
        },
      });
      return {
        edubgDataSource: Array.isArray(edubgResponse.rows) ? edubgResponse.rows : [],
        edubgTotal: edubgResponse.total,
      };
    },
    // 教育经历删除
    *deleteEdubg({ payload }, { put, call }) {
      yield call(deleteResEdubgs, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },
    // 教育经历保存
    *edubgSave({ payload }, { call, select }) {
      const { edubgSofarFlag } = yield select(
        ({ platResProfileBackground }) => platResProfileBackground
      );
      const { edubgFormData } = payload;
      if (edubgFormData.date && typeof edubgFormData.date[0] !== 'string') {
        edubgFormData.dateFrom = edubgFormData.date[0].format('YYYY-MM-DD');
      }
      if (edubgFormData.date && typeof edubgFormData.date[1] !== 'string') {
        edubgFormData.dateTo = edubgFormData.date[1].format('YYYY-MM-DD');
      }
      if (edubgSofarFlag) {
        edubgFormData.dateTo = null;
      }

      if (edubgFormData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(edubgUpdate, edubgFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(edubgCreate, edubgFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 工作经历查询
    *queryWorkbg({ payload }, { call, put }) {
      const { response: workbgResponse } = yield call(findResWorkbgList, payload);

      yield put({
        type: 'updateState',
        payload: {
          workbgDataSource: Array.isArray(workbgResponse.rows) ? workbgResponse.rows : [],
          workbgTotal: workbgResponse.total,
        },
      });
    },
    // 工作经历删除
    *deleteWorkbg({ payload }, { put, call }) {
      yield call(deleteResWorkbgs, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },
    // 工作经历保存
    *workbgSave({ payload }, { call, select }) {
      const { workbgFormData } = payload;
      const { workbgSofarFlag } = yield select(
        ({ platResProfileBackground }) => platResProfileBackground
      );
      if (workbgFormData.date && typeof workbgFormData.date[0] !== 'string') {
        workbgFormData.dateFrom = workbgFormData.date[0].format('YYYY-MM-DD');
      }
      if (workbgFormData.date && typeof workbgFormData.date[1] !== 'string') {
        workbgFormData.dateTo = workbgFormData.date[1].format('YYYY-MM-DD');
      }
      if (workbgSofarFlag) {
        workbgFormData.dateTo = null;
      }

      if (workbgFormData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(workbgUpdate, workbgFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(workbgCreate, workbgFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 资质证书查询
    *queryCert({ payload }, { call, put }) {
      const { response: certResponse } = yield call(findResCertList, payload);

      yield put({
        type: 'updateState',
        payload: {
          certDataSource: certResponse.rows,
          certTotal: certResponse.total,
        },
      });
    },
    // 资质证书删除
    *deleteCert({ payload }, { put, call }) {
      yield call(deleteResCerts, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },
    // 资质证书保存
    *certSave({ payload }, { call, select }) {
      const { certFormData } = payload;
      let flag = true; // 默认有效期长和上次认证时间不必填
      if (
        certFormData.validType === '1' &&
        (!certFormData.validMonths || !certFormData.lastRenewDate)
      ) {
        createMessage({ type: 'error', description: '选中定期时，有效期长和上次认证时间必填！' });
        flag = false; // 标识 有效期长和上次认证时间必填
      }
      if (certFormData.validType === '0') {
        certFormData.validMonths = null;
        certFormData.lastRenewDate = null;
      }
      if (certFormData.obtainDate && typeof certFormData.obtainDate !== 'string') {
        certFormData.obtainDate = certFormData.obtainDate.format('YYYY-MM-DD');
      }
      if (certFormData.lastRenewDate && typeof certFormData.lastRenewDate !== 'string') {
        certFormData.lastRenewDate = certFormData.lastRenewDate.format('YYYY-MM-DD');
      }

      if (certFormData.id && flag) {
        // 编辑的保存方法
        const { status, response } = yield call(certUpdate, certFormData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else if (flag) {
        // 新增的保存方法
        const { status, response } = yield call(certCreate, certFormData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
      return flag;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
