import {
  queryExpenses,
  approved,
  rejected,
  deleteExpenses,
  getProcConf,
} from '@/services/user/expense/expense';
import {
  getBuReimbursementList,
  checkReimbursementById,
} from '@/services/org/bu/buReimbursementList';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'buReimbursementList',

  state: {
    // 查询系列
    searchForm: {
      allocationFlag: 0,
    },
    dataSource: [],
    total: 0,
    config: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        allocationFlag: payload && payload.allocationFlag ? 1 : 0,
        applyDate: undefined,
        applyDateStart:
          payload && payload.applyDate && payload.applyDate[0]
            ? payload.applyDate[0].format('YYYY-MM-DD')
            : undefined,
        applyDateEnd:
          payload && payload.applyDate && payload.applyDate[1]
            ? payload.applyDate[1].format('YYYY-MM-DD')
            : undefined,
        reimApproveTime: undefined,
        reimApproveTimeStart:
          payload && payload.reimApproveTime && payload.reimApproveTime[0]
            ? payload.reimApproveTime[0].format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        reimApproveTimeEnd:
          payload && payload.reimApproveTime && payload.reimApproveTime[1]
            ? payload.reimApproveTime[1].format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        reimAccountTime: undefined,
        reimAccountTimeStart:
          payload && payload.reimAccountTime && payload.reimAccountTime[0]
            ? payload.reimAccountTime[0].format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        reimAccountTimeEnd:
          payload && payload.reimAccountTime && payload.reimAccountTime[1]
            ? payload.reimAccountTime[1].format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        sortBy: (payload && payload.sortBy) || 'id',
        sortDirection: (payload && payload.sortDirection) || 'DESC',
      };

      const {
        response: { rows, total },
      } = yield call(getBuReimbursementList, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
      yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
    },
    // 根据费用报销单id校验 该报销单是否可以发起过费用分摊
    *checkReimbursement({ payload }, { call, put }) {
      const { response } = yield call(checkReimbursementById, payload);
      return response;
    },
    // 拉取流程代码
    *queryConfig({ payload }, { call, put }) {
      const { response } = yield call(getProcConf);
      yield put({
        type: 'updateState',
        payload: {
          config: Array.isArray(response) ? response : [],
        },
      });
    },
    *delete({ payload }, { call, put }) {
      const ids = payload.join(',');
      const { status, response } = yield call(deleteExpenses, ids);
      if (response && response.ok) {
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
        return {
          status,
          result: true,
        };
      }
      return {
        status,
        result: false,
      };
    },
    *approvedExpense({ payload }, { call, put }) {
      const { status, response } = yield call(approved, { ids: payload.ids, type: payload.type });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        response.reason
          ? response.reason
              .split(';')
              .filter(Boolean)
              .map(msg => createMessage({ type: 'warn', description: msg }))
          : createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        const { datum } = response;
        if (datum === -88) {
          createMessage({ type: 'warn', description: response.reason.desc || '保存失败' });
        } else if (datum === -99) {
          createMessage({ type: 'warn', description: response.reason || '保存失败' });
        } else {
          response.reason
            ? response.reason
                .split(';')
                .filter(Boolean)
                .map(msg => createMessage({ type: 'warn', description: msg }))
            : createMessage({ type: 'warn', description: '保存失败' });
        }
      }
    },
    *rejectedExpense({ payload }, { call, put }) {
      const { status, response } = yield call(rejected, {
        ids: payload.ids,
        type: payload.type,
        branch: payload.branch,
      });

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        response.reason
          ? response.reason
              .split(';')
              .filter(Boolean)
              .map(msg => createMessage({ type: 'warn', description: msg }))
          : createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        const { datum } = response;
        if (datum === -88) {
          createMessage({ type: 'warn', description: response.reason.desc || '保存失败' });
        } else if (datum === -99) {
          createMessage({ type: 'warn', description: response.reason || '保存失败' });
        } else {
          response.reason
            ? response.reason
                .split(';')
                .filter(Boolean)
                .map(msg => createMessage({ type: 'warn', description: msg }))
            : createMessage({ type: 'warn', description: '保存失败' });
        }
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
          allocationFlag: 0,
          selectedRowKeys: [],
        },
      };
    },
  },
};
