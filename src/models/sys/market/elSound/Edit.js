import { addElSoundRq, getElSoundDetailsRq } from '@/services/sys/market/elSound';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { allOuSelectPaging, buSelectPaging } from '@/services/production/common/select';

export default {
  namespace: 'sysMarketElSoundEdit',
  state: {
    formData: {},
    attachments: [],
    objList: [],
  },

  effects: {
    *save({ payload }, { call, put }) {
      const { status, response } = yield call(addElSoundRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/plat/contentMgmt/elSound`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *getDetails({ payload }, { call, put, select }) {
      const { status, response } = yield call(getElSoundDetailsRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          const { attachments = [] } = detail;
          const attach = attachments.map(item => item.id);
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
              attach,
            },
          });
          yield put({
            type: 'updateState',
            payload: { attachments },
          });
        } else {
          const message = response.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *queryObjList({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysMarketElSoundEdit }) => sysMarketElSoundEdit);
      if (formData.noticeScope === 'ALL') {
      } else if (formData.noticeScope === 'OU') {
        const { status, response } = yield call(allOuSelectPaging, { limit: 0 });
        if (status === 200) {
          if (response && response.ok) {
            let objlistTemp = [];
            response.data.rows.forEach(vo => {
              let objlistUnit = {
                id: vo.valCode,
                value: vo.id,
                title: vo.valName,
              };
              objlistTemp.push(objlistUnit);
            });
            console.log(objlistTemp);
            yield put({
              type: 'updateState',
              payload: {
                objList: objlistTemp,
              },
            });
          } else {
            const message = response.reason || '提交失败';
            createMessage({ type: 'warn', description: message });
          }
        }
      } else if (formData.noticeScope === 'BU') {
        const { status, response } = yield call(buSelectPaging, { limit: 0 });
        if (status === 200) {
          if (response && response.ok) {
            let objlistTemp = [];
            response.data.rows.forEach(vo => {
              let objlistUnit = {
                id: vo.id,
                value: vo.id,
                title: vo.buName,
              };
              objlistTemp.push(objlistUnit);
            });
            yield put({
              type: 'updateState',
              payload: {
                objList: objlistTemp,
              },
            });
          } else {
            const message = response.reason || '提交失败';
            createMessage({ type: 'warn', description: message });
          }
        }
      }
    },
    *queryOuList({ payload }, { call, put }) {
      const { status, response } = yield call(allOuSelectPaging, { limit: 0 });
      if (status === 200) {
        if (response && response.ok) {
          let objlistTemp = [];
          response.data.rows.forEach(vo => {
            let objlistUnit = {
              id: vo.valCode,
              value: vo.id,
              title: vo.valName,
            };
            objlistTemp.push(objlistUnit);
          });
          console.log(objlistTemp);
          yield put({
            type: 'updateState',
            payload: {
              objList: objlistTemp,
            },
          });
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *queryBuList({ payload }, { call, put }) {
      const { status, response } = yield call(buSelectPaging, { limit: 0 });
      if (status === 200) {
        if (response && response.ok) {
          let objlistTemp = [];
          response.data.rows.forEach(vo => {
            let objlistUnit = {
              id: vo.id,
              value: vo.id,
              title: vo.buName,
            };
            objlistTemp.push(objlistUnit);
          });
          yield put({
            type: 'updateState',
            payload: {
              objList: objlistTemp,
            },
          });
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
