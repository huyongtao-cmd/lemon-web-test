import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  getBuListFn,
  getBuInfoFn,
  getOkrInfoFn,
  getRankInfoFn,
  getMenuFn,
  getBuMemberFn,
} from '@/services/org/bu/center';
import { implementListRq } from '@/services/okr/okrMgmt';
import moment from 'moment';
import { isEmpty } from 'ramda';

export default {
  namespace: 'orgCenter',
  state: {
    buList: [],
    buInfo: {},
    buId: null,
    formData: {},
    implementList: [],
  },

  effects: {
    *queryBuList({ payload }, { call, put, select }) {
      const { homepage } = yield select(({ global }) => global);
      const { response } = yield call(getBuListFn);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(datum) ? datum : [],
          },
        });
        if (Array.isArray(datum) && datum.length > 0) {
          const buVal = [];
          const defaultCom = datum[0];
          buVal.push(defaultCom.value);
          const defaultBu = defaultCom.children ? defaultCom.children[0] : {};
          const id = defaultBu.value;
          buVal.push(id);
          yield put({
            type: 'updateState',
            payload: {
              buId: id,
              buVal,
            },
          });
          yield put({
            type: 'updateForm',
            payload: {
              buId: id,
              selectAllBu: 'NO',
            },
          });

          yield put({
            type: 'queryBuInfo',
            payload: {
              buId: id,
              selectAllBu: 'NO',
            },
          });
          yield put({
            type: 'queryImplementList',
          });
          yield put({
            type: 'queryRankInfo',
            payload: {
              buId: id,
              selectAllBu: 'NO',
            },
          });

          yield put({
            type: 'queryBuMember',
            payload: {
              buId: id,
              selectAllBu: 'NO',
            },
          });
        } else {
          createMessage({ type: 'error', description: '仅BU负责人可查看部门首页' });
          closeThenGoto(homepage);
        }
      }
    },
    *queryMenu({ payload }, { call, put }) {
      const { response } = yield call(getMenuFn);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            menuData: datum,
          },
        });
      }
    },
    *queryBuInfo({ payload }, { call, put }) {
      const { response } = yield call(getBuInfoFn, payload);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            buInfo: datum || {},
          },
        });
      }
    },

    *queryImplementList({ payload }, { call, put }) {
      const { status, response } = yield call(implementListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            implementList: Array.isArray(rows) ? rows : [],
          },
        });

        // 计算当前日期在那个目标周期
        const tt = Array.isArray(rows)
          ? rows.filter(v => moment().isAfter(v.beginDate) && moment().isBefore(v.endDate))[0] || {}
          : {};
        yield put({
          type: 'updateForm',
          payload: {
            // eslint-disable-next-line no-nested-ternary
            periodId: !isEmpty(tt) ? tt.id : !isEmpty(rows) ? rows[0].id : undefined,
          },
        });
        yield put({
          type: 'queryOkrInfo',
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
      return {};
    },

    *queryOkrInfo({ payload }, { call, put, select }) {
      const { formData } = yield select(({ orgCenter }) => orgCenter);
      const { response } = yield call(getOkrInfoFn, formData);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            okrInfo: datum || {},
          },
        });
      }
    },
    *queryRankInfo({ payload }, { call, put }) {
      const { response } = yield call(getRankInfoFn, payload);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            rankInfo: datum || [],
          },
        });
      }
    },
    *queryBuMember({ payload }, { call, put }) {
      const { response } = yield call(getBuMemberFn, payload);
      const { ok, datum = [] } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            buMember: datum || [],
          },
        });
      }
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
  },
};
