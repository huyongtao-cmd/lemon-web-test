import {
  videoListRq,
  videoEditRq,
  videoDeleteRq,
  videoDetailRq,
  videoCatDataRq,
  selectVideoDropRq,
  changeStatusRq,
} from '@/services/plat/videoMgmt/videoMgmt';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isNil } from 'ramda';

const defaultSearchForm = {
  showFlag: '',
};
const defaultFormData = {
  accessFlag: 'ALL',
  showFlag: 'SHOW',
};

export default {
  namespace: 'videoMgmt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    catCodeFormData: {},
    detailFormData: {},
    pageConfig: {
      pageBlockViews: [],
    },
    vCat1List: [],
    vCat2List: [],
    vCat5List: [],
    type2: [],
    videoCatDataList: [],
    videoCatDataListCopy: [],
    twVideoShowLabelEntityList: [],
    twVideoShowLabelEntityListDel: [],
  },

  effects: {
    // 列表详情页面
    *videoDetailView({ payload }, { call, put, select }) {
      const { status, response } = yield call(videoDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              detailFormData: response.datum || {},
            },
          });

          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    // 视频列表修改展示状态
    *changeStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(changeStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    // UDC查询
    *queryUdcList({ payload }, { call, put, select }) {
      const { categoryCode, id: editId } = payload;
      const { status, response } = yield call(queryUdc, categoryCode);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            twVideoShowLabelEntityList: Array.isArray(response)
              ? response.map(v => ({
                  ...v,
                  id: genFakeId(-1),
                  startDate:
                    !editId && v.sphd1
                      ? v.sphd2 && v.sphd2 === 'DEFAULT' && moment().format('YYYY-MM-DD')
                      : undefined,
                  endDate:
                    !editId && v.sphd1
                      ? v.sphd2 &&
                        v.sphd2 === 'DEFAULT' &&
                        moment(Date.now())
                          .add(Number(v.sphd1), 'day')
                          .format('YYYY-MM-DD')
                      : undefined,
                  checked: !editId && (v.sphd2 && v.sphd2 === 'DEFAULT') ? true : undefined,
                }))
              : [],
          },
        });
      }
    },
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
            type: 'updateForm',
            payload: {
              tabName: response.datum.tabName,
            },
          });
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
    // 查内部资源对应的资源类型二
    *typeChange({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
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
            vCat5List: Array.isArray(response.datum.vcat5List) ? response.datum.vcat5List : [],
          },
        });
      }
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
    // 列表查询
    *query({ payload }, { call, put }) {
      const { uploadDate, ...params } = payload;
      if (Array.isArray(uploadDate) && (uploadDate[0] || uploadDate[1])) {
        [params.startDate, params.endDate] = uploadDate;
      }
      const { response } = yield call(videoListRq, params);
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
    // 列表删除
    *videoDelete({ payload }, { call, put, select }) {
      const { status, response } = yield call(videoDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ videoMgmt }) => videoMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    // 列表详情
    *videoDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(videoDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const { twVideoShowLabelView = [], twVCatDValView = [] } = response.datum;
          const { twVideoShowLabelEntityList } = yield select(({ videoMgmt }) => videoMgmt);
          const tt = twVideoShowLabelEntityList.map(v => {
            const aa = twVideoShowLabelView.filter(item => item.vlabel === v.code);
            if (aa.length) {
              return { ...v, ...aa[0], checked: true };
            }
            return v;
          });

          yield put({
            type: 'updateForm',
            payload: response.datum || {},
          });

          let bb = {};
          twVCatDValView.forEach(v => {
            bb = { ...bb, [v.tabField]: v.multFlagId };
          });
          yield put({
            type: 'updateState',
            payload: {
              videoCatDataList: twVCatDValView,
              twVideoShowLabelEntityList: tt,
              catCodeFormData: bb,
            },
          });

          // 有查看权限资源类型资源类型二
          const { accessResType1 } = response.datum;
          if (accessResType1) {
            yield put({
              type: 'typeChange',
              payload: accessResType1,
            });
          }

          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    // 视频新增修改
    *videoEdit({ payload }, { call, put, select }) {
      const {
        catCodeFormData,
        twVideoShowLabelEntityList,
        twVideoShowLabelEntityListDel,
      } = yield select(({ videoMgmt }) => videoMgmt);

      const params = {
        twVideoShowLabelEntityList: twVideoShowLabelEntityList
          .filter(v => v.checked)
          .map(v => ({ ...v, vlabel: v.code })),
        videoShowLabId: twVideoShowLabelEntityListDel.filter(v => v > 0),
        twVCatDVal: Object.entries(catCodeFormData).map(v => ({ [v[0]]: v[1] })),
      };

      const { status, response } = yield call(videoEditRq, { ...payload, ...params });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    *clean(_, { put, select }) {
      const {
        user: { extInfo = {} },
      } = yield select(({ user }) => user);
      if (isNil(extInfo)) {
        createMessage({
          type: 'warn',
          description: '当前账号为管理员账号，可能无法获取默认申请人',
        });
        return;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            accessFlag: 'ALL',
            showFlag: 'SHOW',
            uploadResId: extInfo.resId || undefined,
            uploadDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          },
          twVideoShowLabelEntityList: [],
          twVideoShowLabelEntityListDel: [],
          videoCatDataList: [],
          catCodeFormData: {},
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
    updateCatCodeForm(state, { payload }) {
      const { catCodeFormData } = state;
      const newFormData = { ...catCodeFormData, ...payload };
      return {
        ...state,
        catCodeFormData: newFormData,
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
