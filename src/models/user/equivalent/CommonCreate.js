import { pickAll } from 'ramda';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { mul, div, add } from '@/utils/mathUtils';
import { getInfo, putCommon, startProc } from '@/services/user/equivalent/equivalent';
import {
  selectUserProj,
  selectActiveBu,
  selectTaskByProjIdInEqua,
  selectCapasetLevelBy,
} from '@/services/gen/list';
import { selectUsers } from '@/services/sys/user';
import { queryCascaderUdc } from '@/services/gen/app';
import { queryTaskSettle } from '@/services/user/task/task';

export default {
  namespace: 'CommonCreate',
  state: {
    formData: {
      settlePriceFlag: 0,
    },
    projectList: [],
    taskList: [],
    resList: [],
    buList: [],
    // 查询
    jobType2List: [], // 工种子类UDC联动数据
    capasetLeveldList: [], // 复合能力列表
  },
  effects: {
    *queryList({ payload }, { call, put, all }) {
      const { projectData, resData, buData } = yield all({
        projectData: call(selectUserProj),
        resData: call(selectUsers),
        buData: call(selectActiveBu),
      });
      yield put({
        type: 'updateState',
        payload: {
          projectList: Array.isArray(projectData.response) ? projectData.response : [],
          resList: Array.isArray(resData.response) ? resData.response : [],
          buList: Array.isArray(buData.response) ? buData.response : [],
        },
      });
    },
    *fetchTaskInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getInfo, { taskId: payload });
      if (status === 200) {
        const { resList, formData } = yield select(({ CommonCreate }) => CommonCreate);
        const resBuId = resList.find(res => res.id === response.datum.incomeResId).valSphd1;
        const taskInfo = pickAll(['settlePrice', 'eqvaSalary', 'incomeResId'], response.datum);
        const { settlePrice, eqvaSalary } = taskInfo;
        const { applySettleEqva } = formData;
        const applySettleAmt = mul(applySettleEqva || 0, settlePrice || 0);
        const resAmt = mul(applySettleEqva || 0, eqvaSalary || 0);
        yield put({
          type: 'updateForm',
          payload: {
            ...taskInfo,
            resBuId,
            taskId: payload,
            applySettleAmt,
            resAmt,
          },
        });
        return true;
      }
      return false;
    },
    *fetchTaskListByProjectId({ payload }, { call, put }) {
      const { status, response } = yield call(selectTaskByProjIdInEqua, payload);
      if (status === 200 && response) {
        yield put({
          type: 'updateState',
          payload: {
            taskList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    *saveData({ payload }, { call, put }) {
      const { status, response } = yield call(putCommon, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    *submitData({ payload }, { call, put }) {
      const { status, response } = yield call(putCommon, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
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

    *queryTaskSettleByCondition({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTaskSettle, payload);
      if (status === 200) {
        const { formData } = yield select(({ CommonCreate }) => CommonCreate);
        const { settlePriceFlag, buSettlePrice, applySettleEqva } = formData;
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
        newForm.applySettleAmt =
          applySettleEqva && newForm.settlePrice
            ? mul(applySettleEqva, newForm.settlePrice).toFixed(2)
            : 0;
        // 总收入
        newForm.resAmt =
          applySettleEqva && newForm.eqvaSalary
            ? mul(applySettleEqva, newForm.eqvaSalary).toFixed(2)
            : 0;
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
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
    clean(state, action) {
      return {
        formData: {
          settlePriceFlag: 0,
        },
        projectList: [],
        taskList: [],
        resList: [],
        buList: [],
        jobType2List: [], // 工种子类UDC联动数据
        capasetLeveldList: [], // 复合能力列表
      };
    },
  },
};
