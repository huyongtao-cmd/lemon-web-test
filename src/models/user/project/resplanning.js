import router from 'umi/router';
import { pickAll } from 'ramda';
import { closeThenGoto } from '@/layouts/routerControl';

import {
  findProjectResPlanningBy,
  createResPlanning,
  createResPlanningHistory,
  findProjectShListByProjId,
  businessResPlanningDetailUri,
} from '@/services/user/project/project';
import { selectCapasetLevel, selectUsersWithBu } from '@/services/gen/list';

import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';

const defaultFormData = {
  id: null,
  projId: null, // 项目id
  planTypeDesc: null, // 计划类型
  objName: null, // 计划对象
  startDate: null, // 开始周
  durationWeek: undefined, // 持续周数
  salePhase: null, // 销售阶段
  probability: null, // 承担概率
  remark: null, // 备注
};

export default {
  namespace: 'userResPlanning',

  state: {
    formData: {
      ...defaultFormData,
    },
    dataSource: [],

    dataList: [],

    abilityList: [],
    selectSorceList: [],

    importStatus: false,
  },

  effects: {
    // 资源规划
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findProjectResPlanningBy, {
        planType: payload.planType, // 计划类型此处默认为“2”，表示“项目”
        objid: payload.objid,
      });
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: (response.datum || {}).planningTitle,
              dataSource: Array.isArray((response.datum || {}).details)
                ? (response.datum || {}).details
                : [],
            },
          });
          return (response.datum || {}).planningTitle;
        }
        createMessage({ type: 'error', description: response.reason || '获取资源规划详情失败' });
        return null;
      }
      createMessage({ type: 'error', description: response.reason || '获取资源规划详情失败' });
      return null;
    },
    // 保存资源规划
    *save(payload, { call, select, put }) {
      const { dataSource, formData } = yield select(({ userResPlanning }) => userResPlanning);
      const newDataSource = dataSource.map(item => {
        const { startDate, endDate, distributeRate } = item;
        let start;
        let end;
        let $distributeRate = distributeRate;
        if (startDate && typeof startDate !== 'string') {
          start = startDate.format('YYYY-MM-DD');
        } else {
          start = startDate;
        }
        if (endDate && typeof endDate !== 'string') {
          end = endDate.format('YYYY-MM-DD');
        } else {
          end = endDate;
        }

        if (distributeRate && typeof distributeRate !== 'string') {
          $distributeRate = distributeRate + '';
        }

        return {
          ...item,
          startDate: start,
          endDate: end,
          distributeRate: $distributeRate,
        };
      });

      // return;
      // 入职日期
      if (formData.startDate && typeof formData.startDate !== 'string') {
        formData.startDate = formData.startDate.format('YYYY-MM-DD');
      }
      const { status, response } = yield call(createResPlanning, {
        projId: payload.projId,
        planningTitle: { ...formData },
        details: newDataSource,
      });
      const { objid, planType } = payload.payload;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // closeThenGoto(`/sale/management/opps?_refresh=0`);
        yield put({
          type: 'query',
          payload: { objid, planType },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
      // eslint-disable-next-line
      return response;
    },
    // 保存资源规划历史版本
    *saveHistory({ payload }, { call, select, put }) {
      const { id, versionNo, changeReason } = payload;
      let flag = true;
      const { status, response } = yield call(createResPlanningHistory, {
        id,
        versionNo,
        changeReason,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        flag = false;
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
      return flag;
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userResPlanning }) => userResPlanning);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },

    //  请求项目成员接口
    *projectShList({ payload }, { call, put, select }) {
      const { dataSource, formData } = yield select(({ userResPlanning }) => userResPlanning);
      const { durationWeek } = formData;
      const { response } = yield call(findProjectShListByProjId, payload);
      if (response) {
        const rows = Array.isArray(response.datum) ? response.datum : [];
        const $rows = rows.map(item => {
          // eslint-disable-next-line
          item.distributeRate = '0';
          // eslint-disable-next-line
          item.endDate = item.planEndDate;
          // eslint-disable-next-line
          item.startDate = item.planStartDate;
          // eslint-disable-next-line
          item.id = genFakeId(-1) + '';
          // eslint-disable-next-line
          item.totalEqva = '0';
          const yearWeek = [];

          if (durationWeek !== '' && durationWeek !== undefined) {
            for (let i = 0; i < Number(durationWeek); i += 1) {
              yearWeek.push(`yearWeek_${i}`);
              Object.assign(item, { [`yearWeek_${i}`]: 0 });
            }
          }

          const $item = pickAll(
            [
              'distributeRate',
              'endDate',
              'startDate',
              'id',
              'totalDays',
              'totalEqva',
              'capasetLevelId',
              'resId',
              'resName',
              'role',
              ...yearWeek,
            ],
            item
          );
          return { ...$item };
        });

        yield put({
          type: 'updateState',
          payload: {
            dataSource: dataSource.concat($rows),
            importStatus: true,
          },
        });
      }

      return response;
    },

    //  获取符合能力列表数据
    *fetchSelectCapasetLevel({ payload }, { call, put, select }) {
      const { response, status } = yield call(selectCapasetLevel);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            abilityList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    //  获取资源下拉列表
    *fetchSourceSelectList({ payload }, { call, put, select }) {
      const { response, status } = yield call(selectUsersWithBu);

      if (status === 200) {
        // response.forEach(item => {
        //   // eslint-disable-next-line
        //   item.key = item.id;
        //   // eslint-disable-next-line
        //   item.code = item.code;
        // });
        yield put({
          type: 'updateState',
          payload: {
            selectSorceList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    // 从商机导入（项目）
    *getBusinessData({ payload }, { call, put }) {
      const { status, response } = yield call(businessResPlanningDetailUri, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          return response;
        }
      }
      return {};
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === '/user/project/projectResPlanning') {
          dispatch({
            type: `fetchSelectCapasetLevel`,
          });
          dispatch({
            type: `fetchSourceSelectList`,
          });
        }
      });
    },
  },
};
