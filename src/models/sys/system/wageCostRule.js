import { queryCostRuleCfg, saveCostRuleCfg } from '@/services/sys/system/wageCostRule';
import createMessage from '@/components/core/AlertMessage';

const defaultOutsourcingInfoList = [
  {
    id: '1',
    conSup: '外包1',
    conSupId: null,
    conSupNo: null,
    conSupName: null,
  },
  {
    id: '2',
    conSup: '外包2',
    conSupId: null,
    conSupNo: null,
    conSupName: null,
  },
  {
    id: '3',
    conSup: '外包3',
    conSupId: null,
    conSupNo: null,
    conSupName: null,
  },
  {
    id: '4',
    conSup: '外包4',
    conSupId: null,
    conSupNo: null,
    conSupName: null,
  },
  {
    id: '5',
    conSup: '外包5',
    conSupId: null,
    conSupNo: null,
    conSupName: null,
  },
];

export default {
  namespace: 'wageCostRule',
  state: {
    outsourcingInfoDataSource: defaultOutsourcingInfoList,
    JDEWageExportDataSource: [],
    _selectedRowKeys: [],
    disableSaveBtn: true,
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { outsourcingInfoDataSource } = yield select(({ wageCostRule }) => wageCostRule);
      const [...arr] = outsourcingInfoDataSource;
      const rep = yield call(queryCostRuleCfg);
      if (rep && rep.response && rep.response.ok) {
        if (rep.response.datum.outSuppViews && rep.response.datum.outSuppViews.length > 0) {
          const {
            datum: { outSuppViews },
          } = rep.response;
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < outSuppViews.length; i++) {
            arr[i].conSupId = outSuppViews[i].conSupId;
            arr[i].conSupNo = outSuppViews[i].conSupNo;
            arr[i].conSupName = outSuppViews[i].conSupName;
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            outsourcingInfoDataSource: arr,
            JDEWageExportDataSource: rep.response.datum.exportCfgViews,
            disableSaveBtn: false,
          },
        });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *save(_, { call, put, select }) {
      const { outsourcingInfoDataSource, JDEWageExportDataSource } = yield select(
        ({ wageCostRule }) => wageCostRule
      );
      const rep = yield call(saveCostRuleCfg, {
        outSuppPayloads: outsourcingInfoDataSource,
        exportCfgPayloads: JDEWageExportDataSource,
      });
      yield put({
        type: 'updateState',
        payload: {
          disableSaveBtn: true,
        },
      });
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'query',
        });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // *clean(_, { put }) {
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       outsourcingInfoDataSource: defaultOutsourcingInfoList,
    //       JDEWageExportDataSource: [],
    //       _selectedRowKeys: [],
    //     },
    //   });
    // },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
