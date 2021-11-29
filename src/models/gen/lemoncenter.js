import {
  queryMyInfo,
  queryShortCut,
  foundShortCut,
  changeShortCut,
  getTodo,
  getBack,
  getDone,
  queryWillApproveCount,
  queryRecentWork,
  queryNotice,
  changeTicketInfo,
  getMessage,
  getMessageCount,
  selectTrainingAllRq,
  updateNewPushFlagRq,
  updateShowFlagRq,
  queryCustomShortCut,
  customShortCutGetNavs,
  customShortCutsaveNavs,
  getNoticeLength,
  uploadUserPhotoFn,
  queryUserPhotoFn,
} from '@/services/gen/center';
import { getElSoundListRq } from '@/services/sys/market/elSound';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import { plainToTree, treeToPlain } from '@/components/common/TreeTransfer';
import createMessage from '@/components/core/AlertMessage';
import { getNotify } from '@/services/user/flow/flow';
import { recentworkExtrwork } from '@/services/user/project/project';
import { isNil } from 'ramda';

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checkFlag',
};
/**
 * 系统用户信息状态
 */
export default {
  namespace: 'workTableHome',

  state: {
    customSettingMode: 'display', //display、edit
    noticeList: [],
    navCheckedKeys: [], //新数据
    navOldCheckedKeys: [], //原数据
    navTree: [],
    custShortCut: [],
    myShortCut: [],
    sysShortCuts: [],
    newSortNo: null,
    todoList: [],
    backList: [],
    doneList: [],
    notifyList: [],
    myInfo: {},
    recentWork: [],
    activeTabKey: '1',
    messageList: [],
    pop1: {},
    pop2: [],
    pop3: [],
    visible1: false,
    visible2: false,
    visible3: false,
    headImg: undefined, // 用户头像
  },

  effects: {
    *selectTrainingAll({ payload }, { call, put }) {
      const { status, response } = yield call(selectTrainingAllRq);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          const { pop1, pop2, pop3 } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              pop1: pop1 || {},
              pop2: pop2 || [],
              pop3: pop3 || [],
            },
          });
          if (!isNil(pop1)) {
            yield put({
              type: 'updateState',
              payload: {
                visible1: true,
              },
            });
          } else if (!isNil(pop2)) {
            yield put({
              type: 'updateState',
              payload: {
                visible2: true,
              },
            });
          } else if (!isNil(pop3)) {
            yield put({
              type: 'updateState',
              payload: {
                visible3: true,
              },
            });
          }

          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取入职培训信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取入职培训信息失败' });
      return {};
    },

    *updateNewPushFlag({ payload }, { call, put }) {
      const { status, response } = yield call(updateNewPushFlagRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          return response.datum;
        }
        createMessage({
          type: 'error',
          description: response.reason || '更新不再提示入职培训信息标志失败',
        });
        return {};
      }
      createMessage({
        type: 'error',
        description: response.reason || '更新不再提示入职培训信息标志失败',
      });
      return {};
    },

    *updateShowFlag({ payload }, { call, put }) {
      const { status, response } = yield call(updateShowFlagRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200) {
        if (response && response.ok) {
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取逾期培训提醒失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取逾期培训提醒失败' });
      return {};
    },

    *queryMyInfo(_, { call, put }) {
      const { response } = yield call(queryMyInfo);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: { myInfo: response.datum || {} },
        });
        // } else {
        //   createMessage({ type: 'error', description: '查询失败' });
      }
    },
    *queryShortCut({ payload }, { call, put }) {
      const { response } = yield call(queryShortCut);
      const sliceArray = (array, size) => {
        const result = [];
        for (let i = 0; i < Math.ceil(array.length / size); i += 1) {
          const start = i * size;
          const end = start + size;
          result.push(array.slice(start, end));
        }
        return result;
      };

      const { myShortCuts = [], sysShortCuts = [] } = response.datum || {};
      const sliceNum = 8;
      const newSortNo =
        myShortCuts.length === 0 ? 1 : myShortCuts[myShortCuts.length - 1].sortNo + 1;
      yield put({
        type: 'updateState',
        payload: {
          myShortCut: sliceArray(myShortCuts, sliceNum),
          sysShortCuts: Array.isArray(sysShortCuts) ? sysShortCuts : [],
          newSortNo,
        },
      });
      return response;
    },
    *queryCustomShortCut({ payload }, { call, put }) {
      const { response } = yield call(queryCustomShortCut, payload);
      yield put({
        type: 'updateState',
        payload: {
          custShortCut: response.rows,
        },
      });
      return response;
    },
    *queryNoticeLength({ payload }, { call, put }) {
      const { response } = yield call(getNoticeLength, payload);
      return response;
    },
    *queryNoticeList({ payload, id }, { call, put }) {
      const { status, response } = yield call(getElSoundListRq, payload, id);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            noticeList: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *foundShortCut({ payload }, { call, put }) {
      const { response } = yield call(foundShortCut, payload);
      if (response.ok) {
        yield put({
          type: 'queryShortCut',
        });
      }
    },
    *changeShortCut({ payload }, { call, put }) {
      const { response } = yield call(changeShortCut, payload);
      if (response.ok) {
        yield put({
          type: 'queryShortCut',
        });
      }
    },
    *todo({ payload }, { call, put }) {
      const { response } = yield call(getTodo, payload);
      yield put({
        type: 'updateState',
        payload: {
          todoList: Array.isArray(response.rows) ? response.rows : [],
          todoTotalCount: response.total,
        },
      });
    },

    *back({ payload }, { call, put }) {
      const { response } = yield call(getBack, payload);
      yield put({
        type: 'updateState',
        payload: {
          backList: Array.isArray(response.rows) ? response.rows : [],
          backTotalCount: response.total,
        },
      });
    },

    *done({ payload }, { call, put }) {
      const { response } = yield call(getDone, payload);
      yield put({
        type: 'updateState',
        payload: {
          doneList: Array.isArray(response.rows) ? response.rows : [],
          doneTotalCount: response.total,
        },
      });
    },

    *message({ payload }, { call, put }) {
      const { response } = yield call(getMessage, payload);
      if (response && response.ok) {
        const messageList = Array.isArray(response.datum) ? response.datum : [];
        messageList.map((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.messageTagName = item.messageTagName ? item.messageTagName.split(',') : [];
          if (item.releaseLevel && item.releaseLevel !== 'NORMAL') {
            item.messageTagName.push(item.releaseLevelName);
          }
          return true;
        });
        yield put({
          type: 'updateState',
          payload: {
            messageList,
          },
        });
      }
    },
    *messageCount({ payload }, { call, put }) {
      const { response } = yield call(getMessageCount, payload);
      if (response && response.ok) {
        const count = response.datum && response.datum > 99 ? '99+' : response.datum;
        yield put({
          type: 'updateState',
          payload: {
            messageTotalCount: count,
          },
        });
      }
    },

    *notify({ payload }, { call, put }) {
      const { response } = yield call(getNotify, payload);
      yield put({
        type: 'updateState',
        payload: {
          notifyList: Array.isArray(response.rows) ? response.rows : [],
          notifyTotalCount: response.total,
        },
      });
    },

    *recentWork({ payload }, { call, put }) {
      const { response } = yield call(queryRecentWork);
      yield put({
        type: 'updateState',
        payload: {
          recentWork: response.datum || [],
        },
      });
    },

    *changeTicketInfo({ payload }, { call, put }) {
      const { response } = yield call(changeTicketInfo, payload);
      yield put({ type: 'recentWork' });
    },

    *extrwork({ payload }, { call, put }) {
      const { response } = yield call(recentworkExtrwork, payload);
      yield put({ type: 'recentWork' });
    },

    *getNavs({ payload }, { call, put }) {
      const { response } = yield call(customShortCutGetNavs);
      if (response) {
        const navList = Array.isArray(response) ? response : [];
        const navTree = treeToPlain(navList, defaultStructure).plain;
        const navListSorted = sortPropAscByNumber('tcode')(navTree);
        const navOldCheckedKeys = navListSorted.filter(nav => nav.checkFlag).map(nav => nav.code);
        const navCheckedKeys = [...navOldCheckedKeys];
        yield put({
          type: 'updateState',
          payload: {
            navTree: navList,
            navOldCheckedKeys,
            navCheckedKeys,
          },
        });
      }
    },
    *saveNavs({ payload }, { call, put }) {
      // const { saveNavCodes, delNavCodes } = payload;
      const data = yield call(customShortCutsaveNavs, payload);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    // 上传头像
    *uploadUserPhoto({ payload }, { call, put }) {
      const resp = yield call(uploadUserPhotoFn, payload);
      if (resp.status === 200 && resp.response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            headImg: resp.response.data,
          },
        });
      } else {
        createMessage({ type: 'error', description: '上传失败' });
      }
    },
    //查询用户头像
    *queryUserPhoto({ payload }, { call, put }) {
      const resp = yield call(queryUserPhotoFn, payload);
      if (resp.status === 200 && resp.response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            headImg: resp.response.data,
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
