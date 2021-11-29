import {
  queryCourseTree,
  queryCourseHandle,
  getCourseDetail,
  saveCourseHandle,
  queryCapaSetList, // todo delete
} from '@/services/plat/capa/train';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'platTrainEdit',

  state: {
    treeData: [],
    rangeData: [],
    courseListData: [],
    courseDetail: {},
    formData: {
      progStatus: 'IN_USE',
      sortLockedFlag: 'N',
    },
    selectedKeys: [],
    capaSetList: [],
    jobCapaSetIds: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCourseDetail, payload);
      const { ok, datum = {} } = response;
      const {
        trainingProgListView = {},
        trainingProgCourseViewList = [],
        trainingResScopeViewList = [],
      } = datum;
      const { jobCapaSetIds } = trainingProgListView;
      const idsList = jobCapaSetIds ? jobCapaSetIds.split(',') : [];
      const selectedKeys = trainingProgCourseViewList.map(item => item.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: trainingProgListView,
            courseListData: trainingProgCourseViewList || [],
            rangeData: trainingResScopeViewList || [],
            selectedKeys,
            jobCapaSetIds: idsList.map(id => Number(id)),
          },
        });
        yield put({
          type: 'getJob2',
          payload: trainingProgListView.jobClass1,
        });
      }
    },

    *queryTypeTree({ payload }, { call, put }) {
      const { response } = yield call(queryCourseTree, {
        entryClass: 'TRAINING',
        classStatus: 'IN_USE',
      });
      if (response) {
        const cleanTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.className;
            newItem.value = item.id;
            if (item.child && item.child.length > 0) {
              newItem.children = cleanTreeData(item.child);
            }
            return newItem;
          });
          return newData;
        };

        yield put({
          type: 'updateState',
          payload: {
            treeData: cleanTreeData(response) || [],
          },
        });
      }
    },

    *queryCourseList({ payload }, { call, put }) {
      const { response } = yield call(queryCourseHandle, payload);
      if (response && response.ok) {
        const { datum = [] } = response;
        const courseList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.id;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            courseList: courseList || [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      const { response } = yield call(saveCourseHandle, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/hr/capacity/train?refresh=1591886505722');
      } else {
        createMessage({ type: 'success', description: response.datum });
      }
    },

    *clean({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          treeData: [],
          rangeData: [],
          courseListData: [],
          courseDetail: {},
          formData: {
            progStatus: 'IN_USE',
            sortLockedFlag: 'N',
          },
          selectedKeys: [],
          jobCapaSetIds: [],
        },
      });
    },

    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      if (status === 200) {
        const capaSetList = response.datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.id;
          newItem.title = item.name;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            capaSetList,
          },
        });
      }
    },

    *getJob2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:JOB_TYPE2',
        parentDefId: 'RES:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            jobType2Data: Array.isArray(response) ? response : [],
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { jobType2Data: [] },
        });
      }
    },
    *getResType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        if (payload === 'INTERNAL_RES') {
          yield put({
            type: 'updateState',
            payload: {
              resType2InternalData: Array.isArray(response) ? response : [],
            },
          });
        }

        if (payload === 'EXTERNAL_RES') {
          yield put({
            type: 'updateState',
            payload: {
              resType2ExternalData: Array.isArray(response) ? response : [],
            },
          });
        }
      } else {
        yield put({
          type: 'updateState',
          payload: { resType2Data: [] },
        });
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
