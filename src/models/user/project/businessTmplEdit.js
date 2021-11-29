import createMessage from '@/components/core/AlertMessage';
import {
  templateResPlanningUpdateUri,
  templateResPlanningDetailUri,
} from '@/services/user/project/project';
import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';
import { selectCapasetLevel, selectUsersWithBu } from '@/services/gen/list';

export default {
  namespace: 'businessTmplEdit',
  state: {
    formData: {},
    dataSource: [],
    deleteKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(templateResPlanningDetailUri, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: (response.datum || {}).planningTitle,
              dataSource: Array.isArray((response.datum || {}).details)
                ? (response.datum || {}).details
                : [],
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return null;
    },
    // 保存资源规划
    *save(payload, { call, select, put }) {
      const { dataSource, formData } = yield select(({ businessTmplEdit }) => businessTmplEdit);
      const newDataSource = dataSource.map(item => {
        const { startDate, endDate, distributeRate } = item;
        let start;
        let end;
        let $distributeRate = distributeRate;
        if (startDate && typeof startDate !== 'string') {
          start = startDate.format('YYYY-MM-DD');
        } else {
          start = startDate;
        }
        if (endDate && typeof endDate !== 'string') {
          end = endDate.format('YYYY-MM-DD');
        } else {
          end = endDate;
        }

        if (distributeRate && typeof distributeRate !== 'string') {
          $distributeRate = distributeRate + '';
        }

        return {
          ...item,
          startDate: start,
          endDate: end,
          distributeRate: $distributeRate,
        };
      });

      // return;
      // 入职日期
      if (formData.startDate && typeof formData.startDate !== 'string') {
        formData.startDate = formData.startDate.format('YYYY-MM-DD');
      }
      // 存在说明是修改，不存在说明是新增
      let params = {};
      if (payload.id) {
        params = {
          id: payload.id,
          planningTitle: { ...formData },
          details: newDataSource,
        };
      } else {
        params = {
          planningTitle: { ...formData },
          details: newDataSource,
        };
      }
      const { status, response } = yield call(templateResPlanningUpdateUri, params);

      // const { objid, planType } = payload.payload;
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    //  获取符合能力列表数据
    *fetchSelectCapasetLevel({ payload }, { call, put, select }) {
      const { response, status } = yield call(selectCapasetLevel);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            abilityList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    //  获取资源下拉列表
    *fetchSourceSelectList({ payload }, { call, put, select }) {
      const { response, status } = yield call(selectUsersWithBu);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            selectSorceList: Array.isArray(response) ? response : [],
          },
        });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
