/**
 * 該model为公共model只負責effects數據獲取，
 * 不負責任何reducers數據處理，
 * 获取到的数据会返回
 */

import {
  productManagementSaveRq,
  productManagementOverallRq,
  productManagementDetailRq,
} from '@/services/workbench/project';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';

const defaultState = {};
export default {
  namespace: 'productMgmt',

  state: defaultState,

  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(productManagementDetailRq, payload);
      return data;
    },

    *productManagementSave({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (params.id) {
        const { data: datum } = yield outputHandle(
          productManagementOverallRq,
          params,
          'productMgmt/success'
        );
        data = datum;
      } else {
        const { data: datum } = yield outputHandle(
          productManagementSaveRq,
          params,
          'productMgmt/success'
        );
        data = datum;
      }
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
