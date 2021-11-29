import router from 'umi/router';
import { findResById, updatePlatByStatus } from '@/services/plat/res/resprofile';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const formDataModel = {
  id: null,
  baseBuId: null, // 所属组织
  baseBuName: null, // 所属组织名称
  baseCity: null, // 主服务地
  busitripFlag: null, // 能否出差
  serviceType: null, // 服务方式
  serviceClockFrom: null, // 服务开始时间
  serviceClockTo: null, // 服务结束时间
  ouId: null, // 所属公司
  empNo: null, // 工号
  enrollDate: null, // 入职日期
  regularDate: null, // 转正日期
  contractSignDate: null, // 合同签订日期
  contractExpireDate: null, // 合同到期日期
  probationBeginDate: null, // 试用期开始日期
  probationEndDate: null, // 试用期结束日期
  accessLevel: null, // 安全级别
  telfeeQuota: null, // 话费额度
  hrStatus: null, // 人事状态
  jobGrade: null, // 职级
  needUseraccFlag: null, // 是否需要用户账号
};

export default {
  namespace: 'platResProfilePlat',

  state: {
    platFormData: {
      ...formDataModel,
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { platFormData: datum || {} },
        });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { platFormData } = yield select(({ platResProfilePlat }) => platResProfilePlat);
      const newFormData = Object.assign({}, platFormData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { platFormData: newFormData },
      });
    },
    // 保存
    *save({ payload }, { call, select }) {
      let flag = false; // 默认保存失败
      const { platFormData } = yield select(({ platResProfilePlat }) => platResProfilePlat);
      const {
        accessLevel,
        serviceClockFrom,
        serviceClockTo,
        enrollDate,
        regularDate,
        contractSignDate,
        contractExpireDate,
        probationBeginDate,
        probationEndDate,
      } = platFormData;
      // 服务开始时间
      if (serviceClockFrom && typeof serviceClockFrom !== 'string') {
        platFormData.serviceClockFrom = serviceClockFrom.format('HH:mm');
      }
      // 服务结束时间
      if (serviceClockTo && typeof serviceClockTo !== 'string') {
        platFormData.serviceClockTo = serviceClockTo.format('HH:mm');
      }
      // 入职日期
      if (enrollDate && typeof enrollDate !== 'string') {
        platFormData.enrollDate = enrollDate.format('YYYY-MM-DD');
      }
      if (regularDate && typeof regularDate !== 'string') {
        platFormData.regularDate = regularDate.format('YYYY-MM-DD');
      }
      if (contractSignDate && typeof contractSignDate !== 'string') {
        platFormData.contractSignDate = contractSignDate.format('YYYY-MM-DD');
      }
      if (contractExpireDate && typeof contractExpireDate !== 'string') {
        platFormData.contractExpireDate = contractExpireDate.format('YYYY-MM-DD');
      }
      if (probationBeginDate && typeof probationBeginDate !== 'string') {
        platFormData.probationBeginDate = probationBeginDate.format('YYYY-MM-DD');
      }
      if (probationEndDate && typeof probationEndDate !== 'string') {
        platFormData.probationEndDate = probationEndDate.format('YYYY-MM-DD');
      }
      if (platFormData.busitripFlag === null) {
        platFormData.busitripFlag = 0;
      }
      if (platFormData.needUseraccFlag === null) {
        platFormData.needUseraccFlag = 1;
      }

      // 编辑的保存方法
      const { status, response } = yield call(updatePlatByStatus, {
        ...platFormData,
        id: payload.id,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '平台信息保存成功' });
        if (payload.editTabFlag) {
          // editTabFlag:true表示有tab页的编辑
          flag = true;
        } else {
          closeThenGoto(`/hr/res/profile/list/finance?id=${payload.id}`);
        }
      } else {
        createMessage({ type: 'error', description: '保存失败' });
        router.go();
      }

      return flag;
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          platFormData: {
            ...formDataModel,
          },
          dataSource: [],
          total: 0,
        },
      });
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
