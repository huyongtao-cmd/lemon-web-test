import moment from 'moment';
import {
  findProjectShTreeByProjId,
  deleteProjectShs,
  projectShCreate,
  projectShUpdate,
  selectProjRes,
  queryAllExtrwork,
  queryExtrworkDetail,
  saveExtrwork,
  delExtrwork,
  vacationExtrwork,
  canEditExtrwork,
  extrworkCheckHandle,
  addVacationHandle,
} from '@/services/user/project/project';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectCapasetLevelBy } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userProjectSh',

  state: {
    dataSource: [],
    total: 0,
    jobType2List: [], // 工种子类UDC联动数据
    capasetLevelList: [], // 复合能力级别列表
    searchForm: {
      date: [],
    },
    projResDataSource: [],
    extrworkDataSource: [],
    extrworkTotal: 0,
    vacation: [],
    queryExtrworkParams: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findProjectShTreeByProjId, payload);
      if (response) {
        const rows = Array.isArray(response.rows) ? response.rows : [];
        yield put({
          type: 'updateState',
          payload: {
            dataSource: rows.map(item => {
              // 解决 children 的 id 跟父级重复的问题
              const children =
                item.children && item.children.length > 0
                  ? item.children.map(value => ({ ...value, id: item.id + '-' + value.id }))
                  : undefined;
              return { ...item, children };
            }),
            total: response.total,
          },
        });
      }
    },

    // 删除
    *delete({ payload }, { put, call }) {
      yield call(deleteProjectShs, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },

    // 保存
    *projectshSave({ payload }, { call, select, put }) {
      const { formData } = payload;
      let flag = true;
      if (formData.planEndDate && moment(formData.planEndDate).isBefore(formData.planStartDate)) {
        createMessage({ type: 'error', description: '预计结束日期不应该早于`预计开始日期`' });
        return false;
      }
      if (formData.workbenchFlag !== 0) {
        formData.workbenchFlag = 1;
      }
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(projectShUpdate, formData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
          flag = false;
        }
      } else {
        // 新增/复制的保存方法
        const { status, response } = yield call(projectShCreate, formData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
          flag = false;
        }
      }
      return flag;
    },

    // 根据工种获取工种子类的信息
    *updateJobType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload,
      });
      yield put({
        type: 'updateState',
        payload: {
          jobType2List: Array.isArray(response) ? response : [],
        },
      });
    },

    // 工种 + 工种子类 -> 复合能力 注意这里是两个字段联动一个，不是直接上下级关系。
    *updateCapasetLevelList({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { jobType1, jobType2 } = payload;
      const { response } = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      yield put({
        type: 'updateState',
        payload: {
          capasetLevelList: Array.isArray(response) ? response : [],
        },
      });
    },

    /**
     * 成员加班
     */

    *selectProjRes({ payload }, { call, put }) {
      const { status, response } = yield call(selectProjRes, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            projResDataSource: response,
          },
        });
      }
    },

    *queryExtrwork({ payload }, { call, put }) {
      let parm = {};
      if (payload.date && payload.date.length) {
        const {
          date: [startDate, endDate],
        } = payload;
        parm = {
          ...payload,
          startDate,
          endDate,
        };
      } else {
        parm = payload;
      }
      const { response } = yield call(queryAllExtrwork, parm);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extrworkDataSource: Array.isArray(response.rows) ? response.rows : [],
            extrworkTotal: response.total,
            queryExtrworkParams: parm,
          },
        });
      }
    },

    *vacation({ payload }, { call, put }) {
      const { status, response } = yield call(vacationExtrwork, payload);
      if (status === 100) return;
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            vacation: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    *canEdit({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(canEditExtrwork, payload);
      return !datum;
    },

    // 安排调休
    *handleRest({ payload }, { call, put, select }) {
      const data = payload.map(item => ({
        id: item.id,
        resId: item.resId,
        startDate: item.workBegDate,
        endDate: item.workEndDate,
        timeLeft: item.timeLeft,
      }));
      const arr = data.filter(item => item.timeLeft === '0.0');
      if (arr.length) {
        createMessage({ type: 'warn', description: '所选资源中存在无剩余可调休天数人员' });
      } else {
        const res = yield call(addVacationHandle, { entityList: data });
        if (res.response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { queryExtrworkParams } = yield select(({ userProjectSh }) => userProjectSh);
          yield put({
            type: 'queryExtrwork',
            payload: queryExtrworkParams,
          });
        } else {
          createMessage({ type: 'error', description: res.response.reason || '操作失败' });
        }
      }
    },

    // 保存
    *saveExtrwork({ payload }, { call, select, put }) {
      const { formData } = payload;
      const { resId } = formData;
      const res = yield call(extrworkCheckHandle, resId);
      if (res.response.ok && res.response.datum === 1) {
        const { status, response } = yield call(saveExtrwork, formData);
        if (status === 100) return false;
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          return true;
        }
        createMessage({ type: 'error', description: response.reason || '保存失败' });
        return false;
      }
      createMessage({
        type: 'error',
        description: '加班调休人员才需要维护加班安排，该资源为加班无调休人员，不需维护',
      });
      return false;
    },

    // 删除
    *deleteExtrwork({ payload }, { put, call }) {
      const { ids, searchForm } = payload;
      const { status, response } = yield call(delExtrwork, ids);
      if (status === 100) return;
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({
          type: 'queryExtrwork',
          payload: searchForm,
        });
        return;
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
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
    // updateForm(state, { payload }) {
    //   const { formData } = state;
    //   const newFormData = { ...formData, ...payload };
    //   return {
    //     ...state,
    //     formData: newFormData,
    //   };
    // },
  },
};
