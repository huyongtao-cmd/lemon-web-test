import { pickAll, isEmpty } from 'ramda';
import moment from 'moment';
import {
  findUserTaskById,
  queryActList,
  queryBuList,
  queryPreSaleList,
  queryReasonList,
  saveUserTask,
  queryTaskApplyById,
  queryTaskSettle,
  queryByLogIds,
  updateProjectByLogIds,
} from '@/services/user/task/task';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { querySubpackDetail } from '@/services/user/task/received';
import { selectUsersWithBu, selectCapasetLevelBy } from '@/services/gen/list';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId, add, div, mul } from '@/utils/mathUtils';

// 主表空数据
const emptyFormData = {
  applyId: null,
  id: null,
  taskNo: null,
  taskStatus: 'CREATE',
  disterResId: null,
  disterResName: '',
  jobType1: null,
  jobType2: null,
  capasetLeveldId: null,
  expenseBuId: null,
  receiverBuId: null,
  receiverResId: null,
  receiverResName: '',
  resSourceType: null,
  reasonType: '01',
  reasonNo: null,
  allowTransferFlag: 1,
  planStartDate: null,
  planEndDate: null,
  acceptMethod: null,
  pricingMethod: '',
  buSettlePrice: 0,
  eqvaRatio: null,
  eqvaQty: 0,
  rice: null,
  guaranteeRate: 0,
  cooperationType: null,
  attachuploadMethod: '',
  remark: '',
  createTime: '',
  settledEqva: null,
  settlePrice: 0,
  resActivityList: [],
  ohfeePriceFlag: 0,
  ohfeePrice: null,
  taxRate: null,
  suggestSettlePrice: 0,
  settlePriceFlag: 0,
  taskPackageType: 'CONVENTION_TASK_PACKAGE',
};

// 行新增空数据
const emptyRowData = {
  id: -1,
  actNo: null,
  actName: '',
  actStatus: '',
  actResId: null,
  projAct: '',
  planStartDate: '',
  planEndDate: '',
  actualStartDate: '',
  eqvaQty: 0,
  settledEqva: 1,
  milestoneFlag: 0,
  finishDate: '',
  finishDesc: '',
  finishRate: 0,
  requiredDocList: '',
  taskId: null,
  projActivityId: null,
};

export default {
  namespace: 'userTaskEdit',

  state: {
    // 编辑
    formData: {
      ...emptyFormData,
    },
    dataList: [],
    // 查询
    jobType2List: [], // 工种子类UDC联动数据
    capasetLeveldList: [], // 复合能力列表
    resSource: [], // 资源列表 - 下拉查询用
    resList: [], // 资源列表
    taskProjSource: [],
    taskProjList: [], // 事由号-项目列表
    buSource: [],
    buList: [], // 事由号-bu列表
    preSaleSource: [],
    preSaleList: [], // 事由号-售前列表
    // 表格
    actSource: [],
    actList: [], // 项目活动列表
    pageConfig: {},
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
          },
          dataList: [],
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findUserTaskById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { mode = null } = payload;
        // 复制的数据初始化否则保持原样
        const formData =
          response.datum && mode === 'copy'
            ? {
                ...response.datum,
                id: null,
                taskStatus: 'CREATE',
                createUserName: null,
                createTime: null,
                settledEqva: 0, // 已结算当量
                transferFlag: 0, // 是否转包任务包
              }
            : response.datum || emptyFormData;
        const dataList =
          response.datum.resActivityList && mode === 'copy'
            ? response.datum.resActivityList.map(item => ({
                ...item,
                id: genFakeId(-1),
                taskId: null,
                actStatusName: null,
                settledEqva: 0, // 已结算当量
              }))
            : response.datum.resActivityList;
        yield put({
          type: 'updateState',
          payload: { formData, dataList },
        });

        // 联动相关数据初始化
        if (response.datum && response.datum.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: response.datum.jobType1,
          });
        }
        if (response.datum && response.datum.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: response.datum.jobType1,
              jobType2: response.datum.jobType2,
            },
          });
        }
        // 事由号带项目列表
        if (response.datum && response.datum.reasonId) {
          yield put({
            type: 'queryActList',
            payload: response.datum.reasonId,
          });
        }
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
    },
    /* 转包自动带值 */
    *querySubpack({ payload }, { call, put }) {
      /* 转包任务 */
      const { response } = yield call(querySubpackDetail, payload);
      if (response && response.ok) {
        const subpack = response.datum || {};

        /* 来源任务 */
        const sourceResponse = yield call(findUserTaskById, { id: subpack.pid });

        const source = sourceResponse.response.datum || {};
        // 调取[结算价格计算]接口
        if (sourceResponse.response && sourceResponse.response.ok) {
          yield put({
            type: 'queryTaskSettleByCondition',
            payload: {
              jobType1: source.jobType1,
              expenseBuId: source.expenseBuId,
              receiverBuId: source.receiverBuId,
              receiverResId: source.receiverResId,
              settlePriceFlag: source.settlePriceFlag,
              buSettlePrice: source.buSettlePrice,
            },
          });
          if (Array.isArray(source.resActivityList)) {
            source.resActivityList.forEach(item => {
              // eslint-disable-next-line no-param-reassign
              item.eqvaQty = 0;
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              dataList: Array.isArray(source.resActivityList) ? source.resActivityList : [],
            },
          });
        }
        // 转包数据 与 来源任务包 数据合并 用于自动带值
        yield put({
          type: 'updateForm',
          payload: {
            taskName: subpack.taskName,
            jobType1: source.jobType1,
            jobType1Name: source.jobType1Name,
            jobType2: source.jobType2,
            jobType2Name: source.jobType2Name,
            capasetLeveldId: source.capasetLeveldId,
            capasetLeveldName: source.capasetLeveldName,
            receiverResId: subpack.receiverResId,
            receiverResName: subpack.receiverResName,
            receiverBuId: subpack.receiverBuId,
            receiverBuName: subpack.receiverBuName,
            resSourceType: source.resSourceType,
            sourceReasonType: source.reasonType, // 来源原事由类型(用作记录)
            reasonType: source.reasonType,
            reasonId: source.reasonId,
            reasonName: source.reasonName,
            expenseBuId: subpack.expenseBuId,
            expenseBuName: subpack.expenseBuName,
            allowTransferFlag: 0,
            planStartDate: subpack.planStartDate,
            planEndDate: subpack.planEndDate,
            taskStatus: 'CREATE',
            pid: subpack.pid,
            pname: subpack.pname,
            acceptMethod: source.acceptMethod,
            acceptMethodName: source.acceptMethodName,
            eqvaRatio: null,
            guaranteeRate: source.guaranteeRate,
            transferFlag: 1,
          },
        });

        // 任务包活动信息 --- 活动下拉数据
        if (source.reasonType === '01') {
          // 来源类型为"项目"
          yield put({
            type: 'queryActList',
            payload: source.reasonId,
          });
        }
        // 联动相关数据初始化
        if (source && source.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: source.jobType1,
          });
        }
        if (source && source.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: source.jobType1,
              jobType2: source.jobType2,
            },
          });
        }
      }
    },

    *save({ payload }, { call, put, select }) {
      const { formData, dataList } = yield select(({ userTaskEdit }) => userTaskEdit);
      const { apprId } = payload;
      formData.resActivityList = dataList;
      if (isEmpty(dataList)) {
        createMessage({ type: 'warn', description: '请添加任务包活动信息！' });
        return;
      }
      const { status, response } = yield call(saveUserTask, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        // 进入派发编辑页，再次推动流程
        if (apprId) {
          closeThenGoto(
            `/user/distribute/create?id=${formData.distId}&mode=update&apprId=${apprId}`
          );
          return;
        }
        // 进入派发新建页
        createMessage({ type: 'success', description: '保存成功，请填写派发信息' });
        closeThenGoto(`/user/distribute/create?taskId=${response.datum.id}`);
        return;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
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

    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            taskProjList: Array.isArray(response.datum) ? response.datum : [],
            taskProjSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    // 工种 + 工种子类 + 复合能力 -> 资源
    *queryResList({ payload }, { call, put }) {
      // const { jobType1, jobType2, capasetLeveldId } = payload;
      // const { response } = yield call(queryResList, {
      //   jobType1,
      //   jobType2,
      //   capasetLeveldId,
      // });
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     resList: response.datum
      //       ? response.datum.map(item => ({ code: item.id, name: item.resName }))
      //       : [],
      //   },
      // });
      const response = yield call(selectUsersWithBu);
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

    *queryBuList({ payload }, { call, put }) {
      const { response } = yield call(queryBuList);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response.datum) ? response.datum : [],
            buSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *queryProInfoByLogIds({ payload }, { call, put }) {
      const ids = payload;
      const { response } = yield call(queryByLogIds, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...emptyFormData,
              ...response.datum,
            },
            dataList: response.datum.actDetail,
          },
        });
      }
    },
    *updateProInfoByLogIds({ payload }, { call, put }) {
      const ids = payload;
      const { response } = yield call(updateProjectByLogIds, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...emptyFormData,
              ...response.datum,
            },
            dataList: response.datum.resActivityList ? response.datum.resActivityList : [],
          },
        });
      }
    },

    *queryPreSaleList({ payload }, { call, put }) {
      const { response } = yield call(queryPreSaleList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            preSaleList: Array.isArray(response.datum) ? response.datum : [],
            preSaleSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *queryActList({ payload }, { call, put }) {
      const { response } = yield call(queryActList, payload);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            actList: Array.isArray(response.datum) ? response.datum : [],
            actSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    *queryTaskApply({ payload }, { call, put }) {
      // 通过任务包申请流程来新建任务包 applyId
      const {
        response: { ok, datum },
      } = yield call(queryTaskApplyById, payload.applyId);

      if (ok) {
        let $dataList = null;

        if (datum.pricingMethod === 'SINGLE') {
          $dataList = [];
        } else {
          $dataList = [
            {
              id: genFakeId(-1),
              actNo: '0000',
              projActivityId: 0,
              actName: '任务包结算特殊活动',
              milestoneFlag: 1,
              settledEqva: 0,
              eqvaQty: (datum || {}).eqvaQty || 0,
              finishDesc: null,
              finishDate: null,
              requiredDocList: null,
              actStatus: null,
              planStartDate: moment(Date.now()),
              planEndDate: moment(Date.now()).add(1, 'days'),
            },
          ];
        }

        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...emptyFormData,
              ...(datum || {}),
              id: null,
              taskNo: null,
              capasetLeveldId: (datum || {}).capasetLevelId,
              createUserId: null,
              createTime: null,
              applyId: payload.applyId,
            },
            dataList: $dataList,
          },
        });

        // 联动相关数据初始化
        // 工种大类带工种子类
        if (datum.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: datum.jobType1,
          });
        }
        // 工种子类带能力级别
        if (datum.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: datum.jobType1,
              jobType2: datum.jobType2,
            },
          });
        }
      }
    },

    *queryTaskSettleByCondition({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTaskSettle, payload);
      if (status === 200) {
        const { formData } = yield select(({ userTaskEdit }) => userTaskEdit);
        const { settlePriceFlag, buSettlePrice, eqvaQty } = formData;
        const newForm = pickAll(
          ['buSettlePrice', 'taxRate', 'settlePrice', 'suggestSettlePrice', 'eqvaSalary'],
          response.datum || {}
        );
        // 实际BU结算价格
        newForm.buSettlePrice =
          settlePriceFlag === '1' ? buSettlePrice : newForm.suggestSettlePrice;
        newForm.taxRate = newForm.taxRate || 0;
        // 最终结算单价
        newForm.settlePrice = newForm.buSettlePrice
          ? div(mul(newForm.buSettlePrice, add(100, newForm.taxRate)), 100).toFixed(2)
          : 0;
        // 总金额
        newForm.amt =
          eqvaQty && newForm.settlePrice ? mul(eqvaQty, newForm.settlePrice).toFixed(2) : 0;
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: newForm,
          });
        } else if (response.errCode) {
          createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
        } else {
          createMessage({ type: 'error', description: '查询失败,请联系管理员' });
        }
      }
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
