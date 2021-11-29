import { queryTicketList, saveTicketList } from '@/services/plat/admin/ticket';
import { findTravelById } from '@/services/user/center/travel';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'userTravelTicket',

  state: {
    // 查询系列
    dataList: [],
    // 待删除数据
    delList: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { datum, total },
      } = yield call(queryTicketList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(datum) ? datum : [],
          total,
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { dataList, delList } = yield select(({ userTravelTicket }) => userTravelTicket);
      const { applyId } = fromQs();
      const travelDetailRes = yield call(findTravelById, { id: applyId });
      const extraObject = {};
      const travelDetail = Array.isArray(travelDetailRes.response.datum)
        ? travelDetailRes.response.datum[0] || {}
        : {};
      if (travelDetail.apprStatus === 'APPROVED') {
        extraObject.useStatus = 'BOOKED';
      }
      const { status, response } = yield call(saveTicketList, {
        // eslint-disable-next-line
        entities: dataList.map(data => {
          return { ...data, applyId, ...extraObject };
        }),
        delList,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return true;
      }
      createMessage({ type: 'error', description: '保存失败' });
      return false;
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
