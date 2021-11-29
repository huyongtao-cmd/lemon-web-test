import { isEmpty } from 'ramda';
import {
  findDistribute,
  selectUsers,
  selectValidUsers,
  queryDistResponse,
  saveDistribute,
  submitDistribute,
  doTaskDistribute,
  delectDistribute,
  saveDistBroadcast,
  cancelDistBroadcast,
  setDistReceiverRes,
  rejectDistResponse,
  distributeTask,
} from '@/services/user/distribute/distribute';
import { queryCapaTree, queryCapaTreeDetail } from '@/services/plat/capa/capa';
import { queryResCapaSet, queryResCapaStatus, saveTaskCapaFn } from '@/services/plat/capa/course';

import { findUserTaskById } from '@/services/user/task/task';
import { findProjectById } from '@/services/user/project/project';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectCapasetLevelBy } from '@/services/gen/list';
import { findResList } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { getFlowInfoByTaskInfo, pushFlowTask } from '@/services/gen/flow';

const formDataModal = {
  reasonType: null, // 派发对象[事由id，事由类型],
  reasonId: null, // 事由id
  disterResId: null, // 派发人
  distTime: null, // 派发时间
  // distNo: null, // 派发编号
  distMethod: 'DESIGNATE', // 派发方式
  receiverResId: null, // 接收资源
  receiverResName: null, // 接收资源名称
  distDesc: null, // 派发说明
  distStatus: 'create', // 派发状态

  // 应答人数（上限）,广播天数/剩余天数,
  respNumber: null,
  broadcastDays: null,
  remainingDays: null,

  capabilitySet: null,
  capabilityJudge: null, // 复合能力
  languageRequirement: null, // 语言能力要求
  workStyle: null, // 现场|远程
  otherCapability: null, // 其他能力要求
  timeRequirement: null, // 时间要求
  resBase: null, // 资源所在地
  workMethod: null, // 兼职|全职
  resType: null, // 资源类型
  workCountry: null,
  workProvince: null,
  workPlace: null,
  workDetailadd: null, // 工作地
  planStartDate: null, // 预计开始时间
  minCreditPoint: null, // 最低信用积分
  planEndDate: null, // 预计结束时间
  minSecurityLevel: 1, // 最低安全级别
  remark: null, // 备注
  apprStatus: 'NOTSUBMIT',
  capaTreeData: [],
  capaTreeDataDetail: [],
  fetchDataLoading: false,
  capaTreeDataDetailTmp: [],
  capaTreeDataDetailTotalTmp: 0,
};
export default {
  namespace: 'userDistCreate',

  state: {
    formData: { ...formDataModal },
    resSource: [],
    resList: [],
    jobType2List: [],
    capasetLeveldList: [],
    c2Data: [],
    c3Data: [],
    responseList: [],
    modalList: [],
    modalTotal: 0,
    mode: 'create',
    flowInfo: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findDistribute, payload.id);
      const datum = response.datum || {};
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum,
            mode: payload.mode || 'create',
          },
        });

        // 联动相关数据初始化
        // 工种大类带工种子类
        if (response.datum.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: datum.jobType1,
          });
        }
        // 工种子类带能力级别
        if (response.datum.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: datum.jobType1,
              jobType2: datum.jobType2,
            },
          });
        }
        // 国家带出省
        if (datum.workCountry) {
          yield put({
            type: 'updateListC2',
            payload: datum.workCountry,
          });
        }
        // 省带出城市
        if (datum.workProvince) {
          yield put({
            type: 'updateListC2',
            payload: datum.workProvince,
          });
        }
        if (datum.distMethod === 'DESIGNATE' && datum.receiverResId) {
          yield put({
            type: 'queryResCapaSetHandle',
            payload: {
              resId: parseInt(datum.receiverResId, 10),
              limit: 0,
            },
          });
        }
        if (datum.capaLevelIds) {
          yield put({
            type: 'queryResCapaStatusHandle',
            payload: {
              capaLevelIds: datum.capaLevelIds,
              resId: parseInt(datum.receiverResId, 10),
            },
          });
        }
      }
      return response;
    },

    // 根据任务带任务相关信息过来
    *queryTask({ payload }, { call, put, select }) {
      const { status, response } = yield call(findUserTaskById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const {
          taskName,
          receiverResId = null,
          receiverResName = null,
          resSourceType = null,
          capasetLeveldId = null,
          jobType2 = null,
          jobType1 = null,
          distId,
          capaLevelIds,
        } = response.datum || {};
        const {
          user: { extInfo },
        } = yield select(({ user: { user } }) => ({ user }));
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...formDataModal,
              reasonType: 'TASK', // 事由类型
              reasonId: payload.id, // 事由id
              reasonName: taskName, // 派发对象
              receiverResId, // 接收资源
              receiverResName,
              disterResId: extInfo && extInfo.resId, // 派发人(当前登录人)
              disterResName: extInfo && extInfo.resName,
              resType: resSourceType, // 资源类型(合作类型)
              capabilitySet: capasetLeveldId,
              jobType2,
              jobType1,
              distId,
            },
            mode: payload.mode || 'create',
          },
        });

        // 联动相关数据初始化
        // 工种大类带工种子类
        if (jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: jobType1,
          });
        }
        // 工种子类带能力级别
        if (jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: { jobType1, jobType2 },
          });
        }
        if (receiverResId) {
          yield put({
            type: 'queryResCapaSetHandle',
            payload: {
              resId: parseInt(receiverResId, 10),
              limit: 0,
            },
          });
        }
        if (capaLevelIds) {
          yield put({
            type: 'queryResCapaStatusHandle',
            payload: {
              capaLevelIds,
              resId: parseInt(receiverResId, 10),
            },
          });
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
      // return response;
    },

    // 根据项目带项目相关信息过来
    *queryProject({ payload }, { call, put, select }) {
      const { status, response } = yield call(findProjectById, payload.id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { projName, pmResId = null, pmResName = null, distId, capaLevelIds } = response.datum;
        const {
          user: { extInfo },
        } = yield select(({ user: { user } }) => ({ user }));
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...formDataModal,
              reasonType: 'PROJECT', // 事由类型
              reasonId: payload.id, // 事由id
              reasonName: projName, // 派发对象
              receiverResId: pmResId, // 接收资源(项目经理)
              receiverResName: pmResName,
              disterResId: extInfo && extInfo.resId, // 派发人(当前登录人)
              disterResName: extInfo && extInfo.resName,
              distId,
            },
            mode: payload.mode || 'create',
          },
        });

        if (pmResId) {
          yield put({
            type: 'queryResCapaSetHandle',
            payload: {
              resId: parseInt(pmResId, 10),
              limit: 0,
            },
          });
        }
        if (capaLevelIds) {
          yield put({
            type: 'queryResCapaStatusHandle',
            payload: {
              capaLevelIds,
              resId: parseInt(pmResId, 10),
            },
          });
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
      // return response;
    },

    // 响应列表
    *queryDistResponse({ payload }, { call, put }) {
      const { response } = yield call(queryDistResponse, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            responseList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    // 模态框 资源列表数据
    *queryModalList({ payload }, { call, put }) {
      const { response } = yield call(findResList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            modalList: Array.isArray(response.rows) ? response.rows : [],
            modalTotal: response.total,
          },
        });
      }
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
    *updateCapasetLeveldList({ payload }, { call, put }) {
      const { jobType1, jobType2 } = payload;
      if (!jobType1 || !jobType2) {
        return;
      }
      // console.log('jobType1 jobType2 ->', jobType1, jobType2);
      const { response } = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      yield put({
        type: 'updateState',
        payload: {
          capasetLeveldList: Array.isArray(response) ? response : [],
        },
      });
    },

    // 获得资源下拉数据
    *queryResList({ payload }, { call, put }) {
      const response = yield call(selectValidUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resList: Array.isArray(response.response) ? response.response : [],
            resSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },

    // 获取资源复合能力
    *queryResCapaSetHandle({ payload }, { call, put }) {
      const { response } = yield call(queryResCapaSet, { ...payload, obtainStatus: 1 });
      const { rows = [] } = response;
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resCapaSetData: Array.isArray(rows) ? rows : [],
          },
        });
      }
    },

    // 资源能力获得状态
    *queryResCapaStatusHandle({ payload }, { call, put, select }) {
      const { capaDataListTmp = [] } = yield select(({ userDistCreate }) => userDistCreate);
      const { response } = yield call(queryResCapaStatus, payload);
      const { datum = [], ok } = response;
      let newCapaDataList = datum.map(item => {
        const newItem = Object.assign({}, item);
        newItem.capaTypeName = item.capaType1Name + '-' + item.capaType2Name;
        return newItem;
      });
      newCapaDataList = capaDataListTmp.concat(newCapaDataList);
      const groupByType = (arr, param) => {
        const map = {};
        const dest = [];
        for (let i = 0; i < arr.length; i += 1) {
          const ai = {
            ...arr[i],
            key: arr[i].capaNo,
          };

          if (ai[param] && !map[ai[param]]) {
            dest.push({
              capaName: ai[param],
              key: i,
              children: [ai],
            });
            map[ai[param]] = ai;
          } else {
            for (let j = 0; j < dest.length; j += 1) {
              const dj = dest[j];
              if (dj.capaName === ai[param]) {
                dj.children.push(ai);
                break;
              }
            }
          }
        }
        return dest;
      };
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            capaDataList: groupByType(newCapaDataList, 'capaTypeName') || [],
            capaDataListTmp: newCapaDataList || [],
          },
        });
      }
      return ok;
    },

    // 保存派发需要的单项能力
    *saveTaskCapaHandle({ payload }, { call, put }) {
      const { response } = yield call(saveTaskCapaFn, payload);
      const { datum = [], ok } = response;
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resCapaStatusData: Array.isArray(datum) ? datum : [],
          },
        });
      }
      return ok;
    },

    // 根据国家获取省的信息
    *updateListC2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:PROVINCE',
        parentDefId: 'COM:COUNTRY',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            c2Data: Array.isArray(response) ? response : [],
            c3Data: [],
          },
        });
      }
    },

    // 根据省获取市
    *updateListC3({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { c3Data: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 保存并派发 新建、编辑、推流程集于一体
    *saveDistribute({ payload }, { call, put, select }) {
      const { capaDataListTmp = [] } = yield select(({ userDistCreate }) => userDistCreate);
      const capaLevelIds = capaDataListTmp.map(item => item.capaNo) || [];
      const { status, response } = yield call(saveDistribute, payload.formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { formData = {} } = payload;
        const { distMethod } = formData;
        if (distMethod === 'DESIGNATE') {
          yield put({
            type: 'saveTaskCapaHandle',
            payload: { distId: response.datum, capaLevelIds },
          });
        }

        if (payload.apprId) {
          // 再次提交流程
          const result = yield call(doTaskDistribute, payload);
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process`);
          return;
        }
        // 提起流程
        const result = yield call(submitDistribute, response.datum);
        if (result.status === 200) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/distribute/list`);
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 保存并广播
    *saveDistBroadcastFn({ payload }, { call }) {
      const { formData, responseList } = payload;
      if (payload.procId) {
        // 删除流程
        const result = yield call(delectDistribute, payload);
        if (result.response && result.response.ok) {
          const row = {
            distId: formData.id,
            respNumber: formData.respNumber,
            broadcastDays: formData.broadcastDays,
          };

          const { status, response } = yield call(saveDistBroadcast, {
            distEntity: formData,
            distRespondEntities: responseList,
            distBroadcastEntity: row,
          });
          if (status === 100) {
            // 主动取消请求
            return;
          }
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/distribute/list`);
        } else {
          createMessage({ type: 'error', description: '操作失败' });
        }
      } else {
        const row = {
          distId: formData.id,
          respNumber: formData.respNumber,
          broadcastDays: formData.broadcastDays,
        };

        const { status, response } = yield call(saveDistBroadcast, {
          distEntity: formData,
          distRespondEntities: responseList,
          distBroadcastEntity: row,
        });
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto('/user/distribute/list');
        } else if (response.errCode) {
          createMessage({ type: 'warn', description: response.reason });
        } else {
          createMessage({ type: 'error', description: '操作失败' });
        }
      }
    },
    // 取消广播
    *cancelDistBroadcast({ payload }, { call }) {
      const { status, response } = yield call(cancelDistBroadcast, payload.distId);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/distribute/list`);
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 设为派发资源接收人 distId resId
    *setDistReceiverRes({ payload }, { call, put }) {
      const { status, response } = yield call(setDistReceiverRes, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: { id: payload.distId } });
        yield put({ type: 'queryDistResponse', payload: payload.distId });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 谢绝响应 rejectDistResponse distId ids
    *rejectDistResponse({ payload }, { call, put }) {
      const { status, response } = yield call(rejectDistResponse, payload.ids);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        // yield put({ type: 'query', payload: { id: payload.distId } })
        yield put({ type: 'queryDistResponse', payload: payload.distId });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formDataModal },
          resSource: [],
          resList: [],
          jobType2List: [],
          capasetLeveldList: [],
          c2Data: [],
          c3Data: [],
          responseList: [],
          modalList: [],
          modalTotal: 0,
          mode: 'create',
          resCapaSetData: [],
        },
      });
    },
    *queryFlow({ payload }, { call, put }) {
      const { status, response } = yield call(getFlowInfoByTaskInfo, {
        docId: payload,
        procDefKey: 'TSK_P01',
      });
      if (status === 200 && !isEmpty(response)) {
        // const { NO, docName, id, isTodo, taskId } = response;
        yield put({
          type: 'updateState',
          payload: {
            flowInfo: response || {},
          },
        });
      }
    },
    *pushFlow({ payload }, { call, put }) {
      const { taskId, ...params } = payload;
      const { status } = yield call(pushFlowTask, taskId, params);
      if (status === 200) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/distribute/list`);
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else createMessage({ type: 'error', description: '操作失败' });
    },

    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);

      if (response && response.ok && Array.isArray(response.datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.text;
            newItem.key = item.id;
            if (Array.isArray(item.children) && item.children.length > 0) {
              newItem.child = loopTreeData(item.children);
            }
            return newItem;
          });
          return newData;
        };

        yield put({
          type: 'updateState',
          payload: {
            capaTreeData: loopTreeData(response.datum),
          },
        });
      }
    },

    *queryCapaTreeDataDetail({ payload }, { call, put, select }) {
      let capaTreeDataDetailTotal = 0;
      let capaTreeDataDetail = [];
      const { id = [] } = payload;

      for (let i = 0; i < id.length; i += 1) {
        const idLength = id[i] ? id[i].split('-').length : 0;
        if (idLength > 2) {
          const { response } = yield call(queryCapaTreeDetail, { id: id[i] });
          if (response.datum && Array.isArray(response.datum)) {
            const capaTreeDataDetailItem = response.datum.map(item => {
              // eslint-disable-next-line no-param-reassign
              item.children = undefined;
              return item;
            });
            capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);
            capaTreeDataDetailTotal = capaTreeDataDetail.length;
          }
        }
      }

      const obj = {};
      capaTreeDataDetail = capaTreeDataDetail.reduce((item, next) => {
        obj[next.capaLevelId] ? '' : (obj[next.capaLevelId] = true && item.push(next));
        return item;
      }, []);
      capaTreeDataDetailTotal = capaTreeDataDetail.length;

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
          fetchDataLoading: false,
          capaTreeDataDetailTmp: capaTreeDataDetail,
          capaTreeDataDetailTotalTmp: capaTreeDataDetailTotal,
        },
      });
    },

    *searchCapaTreeDataDetail({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaTreeDetail, payload);
      if (response.datum && Array.isArray(response.datum)) {
        const capaTreeDataDetailItem = response.datum.map(item => {
          // eslint-disable-next-line no-param-reassign
          item.children = undefined;
          return item;
        });
        const capaTreeDataDetail = capaTreeDataDetailItem || [];
        const capaTreeDataDetailTotal = capaTreeDataDetail.length;
        yield put({
          type: 'updateState',
          payload: {
            capaTreeDataDetail,
            capaTreeDataDetailTotal,
            fetchDataLoading: false,
            capaTreeDataDetailTmp: null,
            capaTreeDataDetailTotalTmp: 0,
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
    // 修改form表单字段内容，将数据保存到state
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
