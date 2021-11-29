import {
  queryCourseTree,
  queryCourseList,
  queryCapaListUdcTree,
  queryCapaList,
  queryCapaSetList,
  courseStateHandle,
  deleteCourseHandle,
  getPushCourseCapa,
  getPushCourseCapaSet,
} from '@/services/plat/capa/train';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';

const defaultTreeData = [
  {
    title: '全部',
    text: '全部',
    key: -999,
    id: -999,
    sort: 1,
    child: [],
  },
];
export default {
  namespace: 'platTrain',
  state: {
    treeData: defaultTreeData,
    pageConfig: {},
    dataSource: [],
    total: 0,
    searchForm: {
      progStatus: 'IN_USE',
    },
    capaDataSource: [],
    capaTotal: 0,
    capaSetDataSource: [],
    capaSetTotal: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryCourseTree, { entryClass: 'TRAINING' });
      if (response) {
        const cleanTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.className;
            newItem.text = item.className;
            newItem.key = item.id;
            newItem.sort = item.sortNo;
            newItem.disabled = item.classStatus === 'NOT_USED';
            if (newItem.disabled) {
              newItem.title = item.className + '    已停用';
              newItem.text = item.className + '    已停用';
            }
            if (item.child && item.child.length > 0) {
              newItem.child = cleanTreeData(item.child);
            }
            return newItem;
          });
          return newData;
        };
        const treeData = [
          {
            title: '全部',
            text: '全部',
            key: -999,
            id: -999,
            sort: 1,
            child: cleanTreeData(response),
          },
        ];
        yield put({
          type: 'updateState',
          payload: {
            treeData,
          },
        });
      }
    },

    *queryList({ payload }, { call, put }) {
      const { jobClass } = payload;
      const parmas = payload;
      if (jobClass) {
        [parmas.jobClass1, parmas.jobClass2] = jobClass;
        delete parmas.jobClass;
      }
      const {
        response: { rows, total },
      } = yield call(queryCourseList, parmas);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },

    // 获取单项能力
    *queryCapaList({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(getPushCourseCapa, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaDataSource: Array.isArray(rows) ? rows : [],
          capaTotal: total,
        },
      });
    },

    // 获取复合能力
    *queryCapaSetList({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(getPushCourseCapaSet, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaSetDataSource: Array.isArray(rows) ? rows : [],
          capaSetTotal: total,
        },
      });
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

    *getCapaUdcTree({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaListUdcTree, payload);
      const capaUdcDataClean = (data, pid) => {
        const newData = data.map(item => {
          const newItem = Object.assign({}, item);
          newItem.title = item.catName;
          newItem.value = item.catCode;
          newItem.key = item.catCode;
          if (pid) {
            newItem.value = item.catCode + '-' + pid;
          }
          if (item.children && item.children.length > 0) {
            newItem.children = capaUdcDataClean(item.children, item.catCode);
          }
          return newItem;
        });
        return newData;
      };
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaUdcTree: capaUdcDataClean(response.datum, false) || [],
          },
        });
      }
    },

    *getCapaList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaList, payload);
      const { datum = [] } = response;
      if (status === 200) {
        const capaList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.code = item.id;
          newItem.name = item.capaName;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            capaList,
          },
        });
      }
    },

    // 获取适用复合能力下拉数据来源
    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaSetList: response.datum || [],
          },
        });
      }
    },

    // 更改培训项目状态
    *changeCourseState({ payload }, { call, put, select }) {
      const { response } = yield call(courseStateHandle, payload);
      return response.ok;
    },

    // 删除培训项目
    *deleteClass({ payload }, { call, put, select }) {
      const { response } = yield call(deleteCourseHandle, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({
          type: 'queryList',
          payload: {
            offset: 0,
            limit: 10,
            progStatus: 'IN_USE',
          },
        });
      } else {
        createMessage({ type: 'error', description: response.datum });
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
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          treeData: defaultTreeData,
          pageConfig: {},
          dataSource: [],
          total: 0,
          searchForm: {
            progStatus: 'IN_USE',
          },
        },
      });
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
