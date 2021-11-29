import {
  queryGrowthInfo,
  queryCapaInfo,
  capaAttentionCancelFn,
  capaAttentionFn,
  getLeveldInfo,
  leveldDiffFn,
  courseApplyFn,
  saveCertFn,
  checkPointFn,
  saveCapaGrowthFn,
} from '@/services/user/growth';
import {
  queryCapaTree,
  queryCapaTreeDetail,
  queryCapaTreeDetailWithText,
} from '@/services/plat/capa/capa';
import {
  saveMyResCapaRq,
  cancelMyResCapaRq,
  myFocusResCapaRq,
  myResCapaRq,
  resCapaTypeRq,
  mycapaSetCheckedRq,
  mycapaSetListRq,
  capaAbilityRq,
} from '@/services/user/center/myAbility';
import { selectCapasetLevel, selectCapaLevel } from '@/services/gen/list';
import { launchFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';

export default {
  namespace: 'myAbilityGrowthIndividualAbility',

  state: {
    capasetData: [],
    growthTreeData: [],
    growthTreeDataPagination: [],
    growthTreeInfo: {},
    infoLoad: false,
    selectTagIds: [],

    // 赋能能力树
    capaTreeDataDetail: [],
    capaTreeDataDetailTotal: 0,
    capaTreeData: [],
    dataList: [],
    dataListDel: [],
    capacityList: [],
    capacityListSelected: [],
    capacityListSelectedDelId: [],

    formData: {}, // 单项能力考点信息
    myCapaTrees: [], // 我的单项能力分类
    myCapaTreesCheckedList: [], // 我的单项能力
    myCapaTreesCheckedForm: {}, // 我的单项能力
    myResCapaForm: {}, // 我的单项能力弹窗考点
    myFocusCapat: [], // 我关注的单项能力分类
    myFocusCapatCheckedList: [], // 我关注的单项能力列表
    myFocusCapatCheckedForm: {}, // 我关注的单项能力
    myFocusResCapaForm: {}, // 我关注的单项能力弹窗考点
  },

  effects: {
    // 考核点
    *capaAbility({ payload }, { call, put }) {
      const { response } = yield call(capaAbilityRq, payload);
      if (response.ok) {
        const { twAbilityView = [] } = response.datum;
        yield put({
          type: 'updateForm',
          payload: {
            ...response.datum,
            twAbilityView,
          },
        });
        return response;
      }
      createMessage({
        type: 'error',
        description: response.reason || '获取考核点失败',
      });
      return {};
    },
    // 添加关注
    *saveMyResCapa({ payload }, { call, put, select }) {
      const { response } = yield call(saveMyResCapaRq, payload);
      if (response.ok) {
        // const { myCapaTrees = [], myFocusCapat = [] } = response.datum
        // yield put({
        //   type: 'updateState',
        //   payload: {
        //     myCapaTrees: myCapaTrees.map((v, i) => ({ ...v, checked: !i })),
        //     myFocusCapat: myFocusCapat.map((v, i) => ({ ...v, checked: !i })),
        //   },
        // });
        return response;
      }
      createMessage({ type: 'warn', description: response.reason || '添加关注失败' });
      return {};
    },
    // 取消关注
    *cancelMyResCapa({ payload }, { call, put, select }) {
      const { response } = yield call(cancelMyResCapaRq, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '取消成功' });
        return response;
      }
      createMessage({ type: 'warn', description: response.reason || '取消关注失败' });
      return {};
    },
    // 我关注的单项能力对应的考点
    *myFocusResCapa({ payload }, { call, put, select }) {
      const { response } = yield call(myFocusResCapaRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            myFocusCapatCheckedList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    // 我的单项能力
    *myResCapaRq({ payload }, { call, put, select }) {
      const { response } = yield call(myResCapaRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            myCapaTreesCheckedList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    // 我获得的单项能力、我关注的单项能力
    *resCapaType({ payload }, { call, put, select }) {
      const { response } = yield call(resCapaTypeRq);
      if (response.ok) {
        const { myCapaTrees = [], myFocusCapat = [] } = response.datum;
        yield put({
          type: 'updateState',
          payload: {
            myCapaTrees: myCapaTrees.map((v, i) => ({ ...v, checked: !i })),
            myFocusCapat: myFocusCapat.map((v, i) => ({ ...v, checked: !i })),
          },
        });
        // 默认查询我获得的第一条大类对应的单项能力
        if (!isEmpty(myResCapaRq)) {
          yield put({
            type: 'myResCapaRq',
            payload: {
              upperId: myCapaTrees[0].upperId,
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            myCapaTreesCheckedForm: myCapaTrees[0],
          },
        });
        // 默认查询我关注的第一条大类对应的单项能力
        if (!isEmpty(myFocusCapat)) {
          yield put({
            type: 'myFocusResCapa',
            payload: {
              upperId: myFocusCapat[0].upperId,
            },
          });
          yield put({
            type: 'updateState',
            payload: {
              myFocusCapatCheckedForm: {
                ...myFocusCapat[0],
                upperId: myFocusCapat[0].upperId,
              },
            },
          });
        }
      }
    },
    *queryCapaTreeDataDetail({ payload }, { call, put, select }) {
      let { capaTreeDataDetailTotal, capaTreeDataDetail } = yield select(
        ({ platCapaSetCreate }) => platCapaSetCreate
      );
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

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
        },
      });
    },

    *queryCapaTreeDataDetailWithText({ payload }, { call, put, select }) {
      let { capaTreeDataDetailTotal, capaTreeDataDetail } = yield select(
        ({ platCapaSetCreate }) => platCapaSetCreate
      );
      const { id = [], text } = payload;
      if (id.length === 0) {
        const { response } = yield call(queryCapaTreeDetailWithText, { text });
        if (response.datum && Array.isArray(response.datum)) {
          const capaTreeDataDetailItem = response.datum.map(item => {
            // eslint-disable-next-line no-param-reassign
            item.children = undefined;
            return item;
          });
          capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);
          capaTreeDataDetailTotal = capaTreeDataDetail.length;
        }
      } else {
        for (let i = 0; i < id.length; i += 1) {
          const idLength = id[i] ? id[i].split('-').length : 0;
          if (idLength > 2) {
            const { response } = yield call(queryCapaTreeDetailWithText, { id: id[i], text });
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
      }

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
        },
      });
    },
    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);

      if (response && response.ok && Array.isArray(response.datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => {
            // eslint-disable-next-line no-param-reassign
            item.title = item.text;
            // eslint-disable-next-line no-param-reassign
            item.key = item.id;
            if (Array.isArray(item.children) && item.children.length > 0) {
              // eslint-disable-next-line no-param-reassign
              item.child = item.children.map(cItem => {
                // eslint-disable-next-line no-param-reassign
                cItem.title = cItem.text;
                // eslint-disable-next-line no-param-reassign
                cItem.key = cItem.id;
                return cItem;
              });
            }
            return item;
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

    *saveCertFnHandle({ payload }, { call, put }) {
      const { response } = yield call(saveCertFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/certificate/edit?id=${response.datum}`);
      }
    },
    *checkPointFnHandle({ payload }, { call, put }) {
      const { response } = yield call(checkPointFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/checkPoint/edit?id=${response.datum}`);
      }
    },
    *saveCapaGrowthFnHandle({ payload }, { call, put }) {
      const { response } = yield call(saveCapaGrowthFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/compoundAbility/edit?id=${response.datum}`);
      }
    },
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryGrowthInfo);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeData: Array.isArray(response.datum) ? response.datum : [],
          growthTreeDataPagination: Array.isArray(response.datum) ? response.datum.slice(0, 9) : [],
        },
      });
    },

    *queryCapaset({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaInfo);
      yield put({
        type: 'updateState',
        payload: {
          capasetData: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *attendance({ payload }, { call, put }) {
      const { response } = yield call(capaAttentionFn, payload);
      if (response && response.ok) {
        yield put({
          type: 'query',
        });
        createMessage({ type: 'success', description: '关注成功' });
      } else {
        createMessage({ type: 'warn', description: response.reason });
      }
    },

    *attendanceCancal({ payload }, { call, put }) {
      const { response } = yield call(capaAttentionCancelFn, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'query',
        });
        createMessage({ type: 'success', description: '取消关注成功' });
      } else {
        createMessage({ type: 'warn', description: response.reason });
      }
    },

    *queryLeveldInfo({ payload }, { call, put }) {
      const { response } = yield call(getLeveldInfo, payload);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeInfo: response.datum ? response.datum : {},
          infoLoad: false,
        },
      });
    },

    *queryLeveldDiffFn({ payload }, { call, put }) {
      const { response } = yield call(leveldDiffFn, payload);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeInfo: response.datum ? response.datum : {},
          infoLoad: false,
        },
      });
    },

    *courseApply({ payload }, { call, put }) {
      const { response } = yield call(courseApplyFn, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A53',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '申请提交成功' });
          return true;
        }
        return false;
      }
      return false;
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          capasetData: [],
          growthTreeData: [],
          growthTreeInfo: {},
          infoLoad: false,
          selectTagIds: [],
        },
      });
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
