import { isNil, cond, equals, T, isEmpty } from 'ramda';
import { mul, add, div, sub } from '@/utils/mathUtils';
import { getDistInfoByBriefId, saveDistInfo } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'distInfoProject',
  state: {
    formData: {},
    dataSource: [],
    total: 0,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(getDistInfoByBriefId, payload);
      if (response.ok) {
        const resForm = response.datum || {};
        const { profitdistResults = [], ...restFormData } = resForm;
        const dataSource = Array.isArray(profitdistResults) ? profitdistResults : [];
        const formData = {
          ...(restFormData || {}),
          batchDistConfirmedAmtCache: (restFormData || {}).batchDistConfirmedAmt,
        };
        const numberValue = +(formData.batchDistConfirmedAmtCache || 0);
        let noTypeObject;
        let sumConfirmedGainAmt = 0;
        const calcDataSource = dataSource
          .map(item => {
            const { groupBaseType, gainerInallPercent } = item;
            if (isNil(groupBaseType)) {
              noTypeObject = item;
              return undefined;
            }
            const confirmedGainAmt =
              numberValue === 0
                ? 0
                : cond([
                    // 毛利
                    [
                      equals('MARGIN'),
                      () =>
                        div(
                          mul(
                            div(
                              mul(numberValue || 0, formData.grossProfit || 0),
                              formData.camt || 0
                            ),
                            gainerInallPercent || 0
                          ),
                          100
                        ),
                    ],
                    // 签单额(不含税)
                    [
                      equals('NETSALE'),
                      () =>
                        div(
                          div(
                            mul(mul(numberValue, gainerInallPercent || 0), 100),
                            add(100, formData.taxRate || 0)
                          ),
                          100
                        ),
                    ],
                    // 有效销售额
                    [
                      equals('EFFSALE'),
                      () =>
                        div(
                          div(
                            mul(
                              mul(numberValue, gainerInallPercent || 0),
                              formData.effectiveAmt || 0
                            ),
                            formData.camt || 0
                          ),
                          100
                        ),
                    ],
                    [T, () => numberValue],
                  ])(groupBaseType);
            sumConfirmedGainAmt = add(sumConfirmedGainAmt, +confirmedGainAmt.toFixed(2) || 0);
            return {
              ...item,
              confirmedGainAmt: +confirmedGainAmt.toFixed(2),
            };
          })
          .filter(Boolean);

        const lastDataSource = isNil(noTypeObject)
          ? calcDataSource
          : [
              ...calcDataSource,
              {
                ...noTypeObject,
                confirmedGainAmt: +sub(
                  formData.batchDistConfirmedAmt || 0,
                  sumConfirmedGainAmt
                ).toFixed(2),
              },
            ];
        yield put({
          type: 'updateState',
          payload: {
            dataSource: lastDataSource,
            total: dataSource.total,
            formData,
          },
        });
        const { finPeriodId } = fromQs();
        yield put({
          type: 'updateForm',
          payload: {
            finPeriodId,
          },
        });
      } else {
        createMessage({ type: 'warn', description: response.reason || '查询收益分配失败' });
        setTimeout(() => {
          closeThenGoto('/user/project/projectReportList');
        }, 300);
      }
    },
    *save({ payload }, { call, put }) {
      const { status, response } = yield call(saveDistInfo, payload);
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          closeThenGoto('/user/project/projectReportList');
        } else {
          createMessage({ type: 'warn', description: response.reason || '保存失败' });
        }
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
