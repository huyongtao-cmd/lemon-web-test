import {
  abstractChangeDetailByIdUri,
  abstractChangeDetailByProjIdUri,
} from '@/services/user/project/project';

function groupBy(arr) {
  const map = {};
  const dest = [];
  arr.forEach((item, index) => {
    const ai = arr[index];
    if (!map[ai.viewGroup]) {
      dest.push({
        viewGroup: ai.viewGroup,
        viewGroupName: ai.viewGroupName,
        data: [ai],
      });
      map[ai.viewGroup] = ai;
    } else {
      dest.forEach((itm, index1) => {
        const dj = dest[index1];
        if (dj.viewGroup === ai.viewGroup) {
          dj.data.push(ai);
        }
      });
    }
  });
  return dest;
}

export default {
  namespace: 'abstractChangesDetail',
  state: {
    formData: {},
  },
  effects: {
    *queryDetailByProjId({ payload }, { call, put }) {
      const { status, response } = yield call(abstractChangeDetailByProjIdUri, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          const { businessChangeDetailViews } = response.datum;
          let newList = [];
          if (Array.isArray(businessChangeDetailViews)) {
            newList = groupBy(businessChangeDetailViews).sort();
          }
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
              newList,
            },
          });
        }
        return response;
      }
      return {};
    },
    *queryDetailById({ payload }, { call, put }) {
      const { status, response } = yield call(abstractChangeDetailByIdUri, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          const { businessChangeDetailViews } = response;

          let newList = [];
          if (Array.isArray(businessChangeDetailViews)) {
            newList = groupBy(businessChangeDetailViews).sort();
          }
          yield put({
            type: 'updateForm',
            payload: {
              ...response,
              newList,
            },
          });
        }
        return response;
      }
      return {};
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
  },
};
