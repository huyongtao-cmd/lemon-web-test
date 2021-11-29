import {
  resPortrayalRq,
  resPortrayalCapacityRq,
  resPortrayalCertificateRq,
  resPortrayalWorkRq,
  resPortrayalEvaluationAllRq,
  resPortrayalEvaluationGoodRq,
  resPortrayalEvaluationMiddleRq,
  resPortrayalEvaluationBadRq,
  resPortrayalEvaluationNewRq,
  resPortrayalProjectRq,
  resPortrayalTaskRq,
  findResCapaList,
} from '@/services/plat/res/resprofile';
import { queryPersonVideo } from '@/services/user/center/selfEvaluation';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'resPortrayal',
  state: {
    userInfo: {},
    capacity: [],
    certificate: [],
    work: [],
    allEval: [],
    goodEval: [],
    middleEval: [],
    badEval: [],
    newEval: [],
    project: [],
    task: [],
    certInput: '',
    workInput: '',
    capaDataSource: [],
    userInfoVisible: true, // 基本信息
    abilityVisible: false, // 能力
    evaluationVisible: false, // 评价
    qualificationVisible: false, // 资质证书
    workVisible: false, // 工作经历
    projectVisible: false, // 项目经验
    taskVisible: false, // 任务履历
    recentVisible: false, // 近期规划
    workLimit: 10,
    workTotal: 0,
    projectLimit: 10,
    projectTotal: 0,
    taskLimit: 10,
    taskTotal: 0,
    newLimit: 10,
    newTotal: 0,
    goodLimit: 10,
    goodTotal: 0,
    middleLimit: 10,
    middleTotal: 0,
    badLimit: 10,
    badTotal: 0,
    allLimit: 10,
    allTotal: 0,
  },

  effects: {
    *resPortrayal({ payload }, { call, put, select }) {
      const { status, response } = yield call(resPortrayalRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: { userInfo: response.datum },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getCapacity({ payload }, { call, put, select }) {
      const { status, response } = yield call(resPortrayalCapacityRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: { capacity: response.datum },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getCertificate({ payload }, { call, put, select }) {
      const { status, response } = yield call(
        resPortrayalCertificateRq,
        payload.id,
        payload.certName
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: { certificate: response.rows },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getWork({ payload }, { call, put, select }) {
      const { status, response } = yield call(resPortrayalWorkRq, payload.id, payload.inBoxName);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              work: response.rows,
              workTotal: response.total,
            },
          });
          if (payload.inBoxName.limit) {
            yield put({
              type: 'updateState',
              payload: {
                workLimit: payload.inBoxName.limit,
              },
            });
          }
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getNewEval({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalEvaluationNewRq,
        payload.id,
        payload.portEvalSelect
      );
      if (status === 200) {
        if (payload.portEvalSelect.limit) {
          yield put({
            type: 'updateState',
            payload: { newLimit: payload.portEvalSelect.limit },
          });
        }
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              newEval: response.datum,
              goodTotal:
                response.datum.twProjTaskComView[0] &&
                response.datum.twProjTaskComView[0].goodComSum,
              middleTotal:
                response.datum.twProjTaskComView[1] &&
                response.datum.twProjTaskComView[1].centreComSum,
              badTotal:
                response.datum.twProjTaskComView[2] &&
                response.datum.twProjTaskComView[2].shortComSum,
              allTotal:
                response.datum.twProjTaskComView[3] &&
                response.datum.twProjTaskComView[3].allComSum,
              newTotal:
                response.datum.twProjTaskComView[4] &&
                response.datum.twProjTaskComView[4].newComSum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      }
      return {};
    },
    *getAllEval({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalEvaluationAllRq,
        payload.id,
        payload.portEvalSelect
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: { allEval: response.datum },
          });
        }
        if (payload.portEvalSelect.limit) {
          yield put({
            type: 'updateState',
            payload: { allLimit: payload.portEvalSelect.limit },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getGoodEval({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalEvaluationGoodRq,
        payload.id,
        payload.portEvalSelect
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: { goodEval: response.datum },
          });
        }
        if (payload.portEvalSelect.limit) {
          yield put({
            type: 'updateState',
            payload: { goodLimit: payload.portEvalSelect.limit },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getMiddleEval({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalEvaluationMiddleRq,
        payload.id,
        payload.portEvalSelect
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: { middleEval: response.datum },
          });
        }
        if (payload.portEvalSelect.limit) {
          yield put({
            type: 'updateState',
            payload: { middleLimit: payload.portEvalSelect.limit },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getBadEval({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalEvaluationBadRq,
        payload.id,
        payload.portEvalSelect
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: { badEval: response.datum },
          });
        }
        if (payload.portEvalSelect.limit) {
          yield put({
            type: 'updateState',
            payload: { badLimit: payload.portEvalSelect.limit },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getProject({ payload }, { call, put }) {
      const { status, response } = yield call(
        resPortrayalProjectRq,
        payload.id,
        payload.portProjSelect
      );
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              project: response.rows,
              projectTotal: response.total,
            },
          });
          if (payload.portProjSelect.limit) {
            yield put({
              type: 'updateState',
              payload: {
                projectLimit: payload.portProjSelect.limit,
              },
            });
          }
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *getTask({ payload }, { call, put }) {
      const { status, response } = yield call(resPortrayalTaskRq, payload.id, payload.taskSelect);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              task: response.rows,
              taskTotal: response.total,
            },
          });
          if (payload.taskSelect.limit) {
            yield put({
              type: 'updateState',
              payload: {
                taskLimit: payload.taskSelect.limit,
              },
            });
          }
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *querySingleAbility({ payload }, { call, put }) {
      const { response: capaResponse } = yield call(findResCapaList, payload);
      yield put({
        type: 'updateState',
        payload: {
          capaDataSource: Array.isArray(capaResponse) ? capaResponse : [],
        },
      });
    },
    // 获取视频地址
    *fetchVideoUrl({ payload }, { call, put }) {
      const res = yield call(queryPersonVideo, payload);
      if (res.response) {
        yield put({
          type: 'updateState',
          payload: {
            videoUrl: res.response,
          },
        });
      }
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          userInfoVisible: true, // 基本信息
          abilityVisible: false, // 能力
          evaluationVisible: false, // 评价
          qualificationVisible: false, // 资质证书
          workVisible: false, // 工作经历
          projectVisible: false, // 项目经验
          taskVisible: false, // 任务履历
          recentVisible: false, // 近期规划
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
