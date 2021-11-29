import createMessage from '@/components/core/AlertMessage';
import { getEqvaList, saveEqva } from '@/services/org/bu/eqvaRatio/eqvaRatio';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'orgEqva',
  state: {
    dataList: [],
    delIds: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getEqvaList, payload);
      if (status === 100) {
        return;
      }
      if (!!response && response.ok) {
        yield put({
          type: 'orgEqvaRatio/updateState',
          payload: {
            eqva: {
              dataList: response.datum,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    *saveEqva({ payload }, { call, put, select }) {
      const {
        eqva: { dataList, delIds },
        pageConfig,
      } = yield select(({ orgEqvaRatio }) => orgEqvaRatio);
      if ((!dataList || dataList.length === 0) && (!delIds || delIds.length === 0)) {
        createMessage({ type: 'info', description: '额定当量数据为空,不用保存!' });
        return;
      }
      // 必填校验
      if (
        pageConfig.pageBlockViews &&
        pageConfig.pageBlockViews.length > 2 &&
        dataList &&
        dataList.length > 0
      ) {
        const { pageFieldViews } = pageConfig.pageBlockViews[2];
        // 对象数据数据处理，可以直接通过pageFieldJson.eqvaRatio取出对应字段的配置
        const requiredField = pageFieldViews.filter(
          field => field.requiredFlag && field.visibleFlag && field.fieldMode === 'EDITABLE'
        );
        if (requiredField && requiredField.length > 0) {
          const nullRequiredField = requiredField.filter(
            field =>
              dataList.filter(
                row =>
                  (!row[field.fieldKey] && row[field.fieldKey] !== 0) ||
                  row[field.fieldKey].length === 0
              ).length > 0
          );
          if (nullRequiredField && nullRequiredField.length > 0) {
            createMessage({
              type: 'warn',
              description: `【额定当量】TAB中【${nullRequiredField[0].displayName}】字段不能为空！`,
            });
            return;
          }
        }
      }

      const { status, response } = yield call(saveEqva, { dataList, delIds });
      if (status === 100) {
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '额定当量保存成功！' });
        yield put({
          type: 'orgEqvaRatio/updateState',
          payload: {
            eqva: {
              delIds: [],
            },
          },
        });
        const { buId, resId } = fromQs();
        yield put({
          type: 'query',
          payload: {
            buId,
            resId,
          },
        });
      } else {
        createMessage({ type: 'error', description: `额定当量保存失败！${response.reason}` || '' });
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
  },
};
