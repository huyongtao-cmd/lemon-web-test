import { prefexamDetailRq, preexamPlanListRq } from '@/services/plat/communicate';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'communicateDetail',
  state: {
    detailFormData: {},
    detailExamPlanList: [],
    detailExamPlanTotal: 0,
    communicateList: [],
    pageConfig: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(prefexamDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response) {
          const { relatedEntityList } = response;
          const communicateList = [];
          if (Array.isArray(relatedEntityList) && !isEmpty(relatedEntityList)) {
            const obj = {};
            const list = relatedEntityList.reduce((item, next) => {
              obj[next.relatedRole] ? '' : (obj[next.relatedRole] = true && item.push(next));
              return item;
            }, []);
            list.map((item, key) => {
              if (item.relatedRole === 'P_RES') {
                communicateList.push({
                  ...item,
                  name: '上级',
                  source: '自动计算',
                  weight: item.weight,
                });
              } else if (item.relatedRole === 'BU_PIC') {
                communicateList.push({
                  ...item,
                  name: 'BU_负责人',
                  source: '自动计算',
                  weight: item.weight,
                });
              } else if (item.relatedRole === 'ASSIGN_RES') {
                communicateList.push({
                  ...item,
                  name: '指定资源',
                  source: item.apprResName,
                  weight: item.weight,
                });
              }
              return true;
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              detailFormData: response,
              communicateList,
            },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *queryDetailExamPlanList({ payload }, { call, put }) {
      const { status, response } = yield call(preexamPlanListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            detailExamPlanList: Array.isArray(rows) ? rows : [],
            detailExamPlanTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
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
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
