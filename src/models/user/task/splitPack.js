import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { queryCascaderUdc, queryUdc } from '@/services/gen/app';
import { selectCapasetLevelBy } from '@/services/gen/list';
import { selectBuByResIdUri } from '@/services/user/task/task';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import {
  querySplitPackInfo,
  querySplitPackActivityInfo,
  querySplitPackOtherInfo,
  addSplitPack,
  querySplitPackId,
  querySplitPackEditInfo,
  queryBuSettleInfo,
  selectCapasetLevelByResIdUri,
} from '@/services/user/task/splitpack';
import { selectUsersAll } from '@/services/sys/user';
import { selectBus } from '@/services/org/bu/bu';

export default {
  namespace: 'splitPack',

  state: {
    packId: null,
    packData: {},
    pastData: [],
    updateData: [],
    formCheckRes: [],
    actCheckRes: [],
    editInfoData: {},
    actData: [],
    buSettleInfoData: {},
    isFold: [],
    jobType2Data: [],
    capasetLevelList: [],
    usersArr: [],
    busArr: [],
    jobType1Arr: [],
    offset: 0,
    limit: 10,
    total: 0,
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },

  effects: {
    *querySplitPackId({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(querySplitPackId, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            packId: response.taskId,
          },
        });
        yield put({
          type: `querySplitPackInfo`,
          payload: { id: response.taskId },
        });
        yield put({
          type: `querySplitPackActivityInfo`,
          payload: { id: response.taskId },
        });
        yield put({
          type: `querySplitPackOtherInfo`,
          payload: {
            id: response.taskId,
            splitId: payload.id,
            offset: 0,
            limit: 10,
          },
        });
        yield put({
          type: `querySplitPackEditInfo`,
          payload: {
            id: payload.id,
          },
        });
      }
    },
    // 查询任务包信息
    *querySplitPackInfo({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(querySplitPackInfo, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            packData: response,
          },
        });
      }
    },
    // 查询任务资源活动信息
    *querySplitPackActivityInfo({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(querySplitPackActivityInfo, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            actData: response.datum,
          },
        });
      }
    },
    // 查询其它转包信息
    *querySplitPackOtherInfo({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(querySplitPackOtherInfo, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            pastData: response.taskSplitOtherChangeViews,
            total: response.totalCount,
            offset: payload.offset,
            limit: payload.limit,
            isFold: response.taskSplitOtherChangeViews.map(item => true),
          },
        });
      }
    },
    *querySplitPackEditInfo({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(querySplitPackEditInfo, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            updateData: response.datum.taskSplitChangeViewList,
            editInfoData: response.datum,
          },
        });
        // eslint-disable-next-line no-plusplus
        for (let order = 0; order < response.datum.taskSplitChangeViewList.length; order++) {
          if (
            response.datum.taskSplitChangeViewList &&
            response.datum.taskSplitChangeViewList[order] &&
            response.datum.taskSplitChangeViewList[order].jobType1
          ) {
            yield put({
              type: `updateJobType2`,
              payload: { value: response.datum.taskSplitChangeViewList[order].jobType1, order },
            });
            if (
              response.datum.taskSplitChangeViewList &&
              response.datum.taskSplitChangeViewList[order] &&
              response.datum.taskSplitChangeViewList[order].jobType2
            ) {
              yield put({
                type: `updateCapasetLevelList`,
                payload: {
                  jobType1: response.datum.taskSplitChangeViewList[order].jobType1,
                  jobType2: response.datum.taskSplitChangeViewList[order].jobType2,
                  order,
                },
              });
            }
          }
        }
      }
    },
    *queryBuSettleInfo({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryBuSettleInfo, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            buSettleInfoData: response.datum,
          },
        });
      }
    },
    // 新增
    *addSplitPack({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { packData } = yield select(({ splitPack }) => splitPack);
      const { response } = yield call(addSplitPack, { taskEntities: payload, taskId: packData.id });
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'TSK_P12',
          value: {
            id: response.datum.id,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/user/flow/process?type=procs`);
        }
      } else {
        createMessage({ type: 'error', description: `提交失败,错误原因：${response.reason}` });
      }
    },
    // 修改
    *updateSplitPack({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { packData, editInfoData } = yield select(({ splitPack }) => splitPack);
      const { response } = yield call(addSplitPack, {
        taskSplitEntity: {
          ...editInfoData,
          flow: {
            result: 'APPROVED',
            remark: payload.remark,
            taskId: payload.taskId,
          },
        },
        taskEntities: payload.updateData,
        taskId: packData.id,
      });
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({ type: 'error', description: `提交失败,错误原因：${response.reason}` });
      }
    },
    //
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
        });
      }
    },
    // 根据工种获取工种子类的信息
    *updateJobType2({ payload }, { call, put, select }) {
      if (!payload || !payload.value) {
        return;
      }
      const { jobType2Data } = yield select(({ splitPack }) => splitPack);
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload.value,
      });
      Array.isArray(response) ? (jobType2Data[payload.order] = response) : null;
      yield put({
        type: 'updateState',
        payload: {
          jobType2Data,
        },
      });
    },

    // 工种 + 工种子类 -> 复合能力 注意这里是两个字段联动一个，不是直接上下级关系。
    *updateCapasetLevelList({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { capasetLevelList } = yield select(({ splitPack }) => splitPack);
      const { jobType1, jobType2, order } = payload;
      if (!jobType1 || !jobType2) {
        return;
      }
      const { response } = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      Array.isArray(response) ? (capasetLevelList[order] = response) : null;
      yield put({
        type: 'updateState',
        payload: {
          capasetLevelList,
        },
      });
    },
    *queryUsersAll({ payload }, { call, put }) {
      const { response } = yield call(selectUsersAll, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            usersArr: response,
          },
        });
      }
    },
    *queryBusAll({ payload }, { call, put }) {
      const { response } = yield call(selectBus, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            busArr: response,
          },
        });
      }
    },
    *queryUdc({ payload }, { call, put }) {
      const { response } = yield call(queryUdc, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            jobType1Arr: response,
          },
        });
      }
    },
    // 根据选择的资源获取对应的资源bu
    *queryBu({ payload }, { call, put }) {
      const { response } = yield call(selectBuByResIdUri, payload);
      if (response) {
        return Array.isArray(response) ? response[0].id : null;
      }
      return false;
    },
    *queryCapasetLevel({ payload }, { call, put }) {
      const { response } = yield call(selectCapasetLevelByResIdUri, payload);
      if (response && response.ok) {
        return response.datum;
      }
      return false;
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          packId: null,
          packData: {},
          pastData: [],
          updateData: [],
          formCheckRes: [],
          actCheckRes: [],
          editInfoData: {},
          actData: [],
          buSettleInfoData: {},
          isFold: [],
          jobType2Data: [],
          capasetLevelList: [],
          usersArr: [],
          busArr: [],
          jobType1Arr: [],
          offset: 0,
          limit: 10,
          total: 0,
          flowForm: {
            remark: undefined,
            dirty: false,
          },
          fieldsConfig: {},
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
  },
};
