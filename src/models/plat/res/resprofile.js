import {
  findResList,
  deleteResList,
  addResBlackList,
  resLeaveUpdateRq,
  initLeaveChecksRq,
  sync2ELP,
} from '@/services/plat/res/resprofile';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultSearchForm = {
  searchKey: null, // 资源编号/姓名
  empNo: null, // 工号
  resType1: null, // 资源类型一
  resType2: null, // 资源类型二
  resStatus: null, // 资源状态
  baseBuId: null, // 所属组织
};

export default {
  namespace: 'platResProfile',

  state: {
    queryParams: {}, // 查询条件
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
    type2Data: [], // 资源类型二
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = payload;
      if (Array.isArray(params.enrollDate) && params.enrollDate[0] && params.enrollDate[1]) {
        params.enrollDateStart = moment(params.enrollDate[0]).format('YYYY-MM-DD');
        params.enrollDateEnd = moment(params.enrollDate[1]).format('YYYY-MM-DD');
      }
      if (
        Array.isArray(params.contractExpireDate) &&
        params.contractExpireDate[0] &&
        params.contractExpireDate[1]
      ) {
        params.contractExpireDateStart = moment(params.contractExpireDate[0]).format('YYYY-MM-DD');
        params.contractExpireDateEnd = moment(params.contractExpireDate[1]).format('YYYY-MM-DD');
      }
      delete params.enrollDate;
      delete params.contractExpireDate;
      const { response } = yield call(findResList, {
        ...params,
        inBlackList: 0, // 是否在黑名单 （0 不在黑名单，1 在黑名单）
      });
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
          queryParams: params,
        },
      });
    },
    // 删除
    *delete({ payload }, { put, call }) {
      yield call(deleteResList, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
      yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
    },
    // 加入黑名单
    *addResBlackList({ payload }, { put, call }) {
      yield call(addResBlackList, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
      yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
    },
    // 根据资源类型一获取资源类型二下拉数据
    *updateListType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2Data: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { type2Data: [] },
        });
      }
    },
    *snyc({ payload }, { call, select, put }) {
      const { response, status } = yield call(sync2ELP, payload);
      if (status === 100) return;
      if (response.ok) {
        createMessage({ type: 'success', description: '同步成功' });
      } else {
        createMessage({ type: 'warn', description: response.reason || '同步失败' });
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
    *rescheckList({ payload }, { call, put }) {
      const { status, response } = yield call(initLeaveChecksRq, payload);
      if (status === 200 && response.ok) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        return list.filter(v => v.chkCalss === 'LEAVE_RES_CHK' && v.finishStatus === '未处理');
      }
      createMessage({ type: 'error', description: response.reason || '生成资源离职信息失败' });
      return [];
    },
    // 资源列表 离职确认（继续）
    *resLeaveUpdate({ payload }, { put, call }) {
      const { response } = yield call(resLeaveUpdateRq, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      }
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
