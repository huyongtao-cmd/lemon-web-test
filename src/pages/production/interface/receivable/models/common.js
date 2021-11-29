/**
 * 該model为公共model只負責effects數據獲取，
 * 不負責任何reducers任何數據處理，
 * 获取到的数据会返回
 */

import { willCollectionSaveRq, willCollectionDetailRq } from '@/services/production/interface';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';

const defaultState = {};
export default {
  namespace: 'receivableCommon',

  state: defaultState,

  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(willCollectionDetailRq, payload);
      return data;
    },

    *edit({ payload }, { call, put, select }) {
      const { ...params } = payload;
      const { data } = yield outputHandle(
        willCollectionSaveRq,
        [params],
        'receivableCommon/success'
      );
      message({ type: 'success' });
      return data;
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
  },

  reducers: {},
};
