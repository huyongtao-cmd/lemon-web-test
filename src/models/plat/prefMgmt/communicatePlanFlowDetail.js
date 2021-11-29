import { planExamByIdRq } from '@/services/plat/communicate';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'communicatePlanFlowDetail',
  state: {
    detailFormData: {},
    gradeEntityList: [],
    pointEntityList: [],
    communicateList: [],
    pageConfig: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(planExamByIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { pointentityList, gradeEntityList, relatedEntityList } = response.datum;
          // 拼接考核结果等级字段
          if (Array.isArray(gradeEntityList) && !isEmpty(gradeEntityList)) {
            gradeEntityList.forEach((v, index) => {
              if (index === 0) {
                // eslint-disable-next-line no-param-reassign
                v.gradeCheck = `<=${v.ratio}%`;
              } else {
                // eslint-disable-next-line no-param-reassign
                v.gradeCheck = `(${gradeEntityList[index - 1].ratio + 1}%~${v.ratio}%)${
                  index < gradeEntityList.length - 1 ? ' , ' : ''
                }`;
              }
            });
          }
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
                  id: 1,
                  ...item,
                  name: '上级',
                  source: '自动计算',
                  weight: item.weight,
                });
              } else if (item.relatedRole === 'BU_PIC') {
                communicateList.push({
                  id: 2,
                  ...item,
                  name: 'BU_负责人',
                  source: '自动计算',
                  weight: item.weight,
                });
              } else if (item.relatedRole === 'ASSIGN_RES') {
                communicateList.push({
                  id: 3,
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
              detailFormData: {
                ...response.datum,
              },
              pointentityList, // 分数等级
              gradeEntityList, // 考核等级
              communicateList, // 考核评定
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
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
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
