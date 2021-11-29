import {
  selectVideoSynListRq,
  selectVideoDropRq,
  queryProductionVideo,
  homePageTabRq,
  tabSelectLabelRq,
  videoSearchListRq,
  menuListLeftRq,
  selectVideoConRq,
} from '@/services/sale/showHomePage/showHomePage';
import { videoCatDataRq } from '@/services/plat/videoMgmt/videoMgmt';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';

const defaultSearchForm = {};
const defaultFormData = {
  accessFlag: 'ALL',
  showFlag: 'SHOW',
};

export default {
  namespace: 'showHomePage',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    searchCompForm: {},
    formData: defaultFormData,
    detailFormData: {},
    showFlagForm: {
      showFlag: false, // 控制是否展示 展示厅首页 Tab
      showQueryResult: false, // 是否点过查询条件标志
    },
    videoUrl: undefined,
    videoCatDataList: [],
    videoCatDataListCopy: [],
    vCat1List: [],
    vCat2List: [],
    vCat3List: [],
    vCat4List: [],
    vCat5List: [],
    pageConfig: {
      pageBlockViews: [],
    },
    // 产品展示厅首页
    homePageTabList: [],
    homePageFormData: {},
    tabLableList: [],
    // 菜单
    menuList: [],
    hoverList: [],
    // 展示厅首页数据
    homeFormSearchData: { code: '' },
    homeFormList: [],
    homeFormTotal: 0,
  },

  effects: {
    // 视频类别数据
    *videoCatData({ payload }, { call, put, select }) {
      const { status, response } = yield call(videoCatDataRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              videoCatDataList: Array.isArray(response.datum.twVCatDValView)
                ? response.datum.twVCatDValView
                : [],
              videoCatDataListCopy: Array.isArray(response.datum.twVCatDValView)
                ? response.datum.twVCatDValView
                : [],
            },
          });
        }
      }
    },
    //  筛选条件菜单查询
    *selectVideoCon({ payload }, { call, put }) {
      const { response } = yield call(selectVideoConRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            homeFormList: Array.isArray(rows) ? rows : [],
            homeFormTotal: total,
          },
        });
      }
    },

    // 筛选条件菜单查询
    *menuListLeft({ payload }, { call, put }) {
      const { response } = yield call(menuListLeftRq, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            menuList:
              response.datum && Array.isArray(response.datum.menuList)
                ? response.datum.menuList.map((v, i) => ({ ...v, collapsed: false }))
                : [],
            hoverList:
              response.datum && Array.isArray(response.datum.hoverList)
                ? response.datum.hoverList
                : [],
          },
        });
      }
    },
    // 首页列表查询
    *videoSearchList({ payload }, { call, put }) {
      const { response } = yield call(videoSearchListRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            homeFormList: Array.isArray(rows) ? rows : [],
            homeFormTotal: total,
          },
        });
      }
    },
    *tabSelectLabel({ payload }, { call, put }) {
      const { status, response } = yield call(tabSelectLabelRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              tabLableList:
                response.datum && Array.isArray(response.datum.twUdcVideoShowLabelView)
                  ? response.datum.twUdcVideoShowLabelView
                  : [],
            },
          });
          return response.datum && Array.isArray(response.datum.twUdcVideoShowLabelView)
            ? response.datum.twUdcVideoShowLabelView
            : [];
        }
        createMessage({ type: 'error', description: response.reason || '获取Tab信息失败' });
        return [];
      }
      createMessage({ type: 'error', description: response.reason || '获取Tab信息失败' });
      return [];
    },
    *homePageTab({ payload }, { call, put }) {
      const { status, response } = yield call(homePageTabRq, payload);
      if (status === 100) {
        // 主动取消请求
        return null;
      }
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateState',
            payload: {
              homePageTabList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
          yield put({
            type: 'updatehomePageForm',
            payload: {
              // eslint-disable-next-line no-nested-ternary
              defaultTabId:
                // eslint-disable-next-line no-nested-ternary
                Array.isArray(response.datum) &&
                !isEmpty(response.datum) &&
                response.datum.filter(v => v.dfltFlag === 'YES').length
                  ? response.datum.filter(v => v.dfltFlag === 'YES')[0].id
                  : !isEmpty(response.datum)
                    ? response.datum[0].id
                    : 'comp',
            },
          });
          // eslint-disable-next-line no-nested-ternary
          return Array.isArray(response.datum) &&
            !isEmpty(response.datum) &&
            response.datum.filter(v => v.dfltFlag === 'YES').length
            ? response.datum.filter(v => v.dfltFlag === 'YES')[0].id
            : !isEmpty(response.datum)
              ? response.datum[0].id
              : null;
        }
        createMessage({ type: 'error', description: response.reason || '获取Tab信息失败' });
        return null;
      }
      createMessage({ type: 'error', description: response.reason || '获取Tab信息失败' });
      return null;
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },
    *fetchVideoUrl({ payload }, { call, put }) {
      const res = yield call(queryProductionVideo, payload);
      if (res.response) {
        yield put({
          type: 'updateState',
          payload: {
            videoUrl: res.response,
          },
        });
      }
    },
    // 列表详情页面
    *videoDetailView({ payload }, { call, put, select }) {
      const { status, response } = yield call(selectVideoSynListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response) {
          const { rows } = response;
          yield put({
            type: 'updateState',
            payload: {
              detailFormData: Array.isArray(rows) && !isEmpty(rows) ? rows[0] : {},
            },
          });
          return {};
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    // 列表查询
    *query({ payload }, { call, put }) {
      const { response } = yield call(selectVideoSynListRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    // 视频大类、视频小类、服务属性
    *selectVideoDrop({ payload }, { call, put }) {
      const { response } = yield call(selectVideoDropRq, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            vCat1List: Array.isArray(response.datum.vcat1List) ? response.datum.vcat1List : [],
            vCat2List: Array.isArray(response.datum.vcat2List) ? response.datum.vcat2List : [],
            vCat3List: Array.isArray(response.datum.vcat3List) ? response.datum.vcat3List : [],
            vCat4List: Array.isArray(response.datum.vcat4List) ? response.datum.vcat4List : [],
            vCat5List: Array.isArray(response.datum.vcat5List) ? response.datum.vcat5List : [],
          },
        });
      }
    },

    *clean(_, { put, select }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
        },
      });
    },
    *cleanDetailForm(_, { put, select }) {
      yield put({
        type: 'updateState',
        payload: {
          detailFormData: {},
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
    updatehomePageForm(state, { payload }) {
      const { homePageFormData } = state;
      const newFormData = { ...homePageFormData, ...payload };
      return {
        ...state,
        homePageFormData: newFormData,
      };
    },
    updateCatCodeForm(state, { payload }) {
      const { catCodeFormData } = state;
      const newFormData = { ...catCodeFormData, ...payload };
      return {
        ...state,
        catCodeFormData: newFormData,
      };
    },
    updateHomeForm(state, { payload }) {
      const { homeFormSearchData } = state;
      const newFormData = { ...homeFormSearchData, ...payload };
      return {
        ...state,
        homeFormSearchData: newFormData,
      };
    },
    updateShowFlagForm(state, { payload }) {
      const { showFlagForm } = state;
      const newFormData = { ...showFlagForm, ...payload };
      return {
        ...state,
        showFlagForm: newFormData,
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
    updateCompSearchForm(state, { payload }) {
      const { searchCompForm } = state;
      const newFormData = { ...searchCompForm, ...payload };
      return {
        ...state,
        searchCompForm: newFormData,
      };
    },
    cleanHomeFormSearchData(state, action) {
      return {
        ...state,
        homeFormSearchData: {},
        homeFormList: [],
        homeFormTotal: 0,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
