import { queryAddrSup, deleteAddrById, saveAddrSup, findAddrByNo } from '@/services/plat/addr/addr';
import { selectAbOus } from '@/services/gen/list';
import { selectOus } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';
import router from 'umi/router';

const emptyFormData = {};

const initialState = {
  tabkey: 'basic',
  tabModified: Array(10).fill(0), // 记录哪个tab修改过 - 这个需要放在redux中
  // 查询系列
  formData: {
    // 主数据
    ...emptyFormData,
    relateType: '',
  },
  // 下拉
  abOuSel: [],
  addrSel: [],

  personData: {
    // 个人
    ...emptyFormData,
  },
  ouData: {
    // 公司
    ...emptyFormData,
  },
};

export default {
  namespace: 'platAddrSup',

  state: {
    ...initialState,
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
    selectAbType: '',
  },

  effects: {
    // 供应商查询
    *querySup({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryAddrSup, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },

    // 删除地址簿
    *deleteRow({ payload }, { call, put }) {
      const { response, status } = yield call(deleteAddrById, payload);
      return {
        success: response.ok,
        status,
      };
    },

    // -------- 数据查询 法人公司--------
    *queryAbOuSel(_, { call, put }) {
      const { response } = yield call(selectAbOus);
      yield put({
        type: 'updateState',
        payload: {
          abOuSel: Array.isArray(response) ? response : [],
        },
      });
    },

    // -------- 数据查询 母地址--------
    *queryAddrSel(_, { call, put }) {
      const { response } = yield call(selectOus);
      yield put({
        type: 'updateState',
        payload: {
          addrSel: Array.isArray(response) ? response : [],
        },
      });
    },

    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...initialState,
        },
      });
    },

    // 保存供应商数据
    *supSave({ payload }, { call, put, select }) {
      const { formData, personData, ouData } = yield select(({ platAddrSup }) => platAddrSup);
      const preparedData = { ...personData, ...ouData, ...formData };
      // 默认是公司 02
      if (!preparedData.abType) {
        preparedData.abType = '02';
      }
      const getParam = () => {
        let res;
        if (preparedData.abType === '01') {
          // 根据不同的类型封装成三个对象{entity：{}, personEntity{},  nouEntity{}}传给后端
          res = {
            entity: {
              abName: preparedData.abName,
              abNo: preparedData.abNo,
              abType: preparedData.abType,
              idenNo: preparedData.idenNo,
              relateType: preparedData.relateType || '02', // 默认供应商
              legalAbNo: preparedData.legalAbNo,
            },
            personEntity: {
              ...personData,
              personName: preparedData.personName,
              foreignName: preparedData.foreignName,
              idType: preparedData.idType,
              idNo: preparedData.idNo,
              gender: preparedData.gender,
              birthday: preparedData.birthday,
              nationality: preparedData.nationality,
              birthplace: preparedData.birthplace,
              nation: preparedData.nation,
              marital: preparedData.marital,
              idValidFrom: preparedData.idValidFrom,
              idValidTo: preparedData.idValidTo,
            },
          };
        } else if (preparedData.abType === '02') {
          res = {
            entity: {
              abName: preparedData.abName,
              abNo: preparedData.abNo,
              abType: preparedData.abType,
              idenNo: preparedData.idenNo,
              relateType: preparedData.relateType || '02', // 默认供应商
              legalAbNo: preparedData.legalAbNo,
            },
            nouEntity: {
              ...ouData,
              ouName: preparedData.ouName,
              ouType: preparedData.ouType,
              ouStatus: preparedData.ouStatus,
              taxRegNo: preparedData.taxRegNo,
              taxRate: preparedData.taxRate,
              innerType: preparedData.innerType,
              ouProp: preparedData.ouProp,
              regionCode: preparedData.regionCode,
              pid: preparedData.pid,
              website: preparedData.website,
              industry: preparedData.industry,
              scaleType: preparedData.scaleType,
              currCode: preparedData.currCode,
              langCode: preparedData.langCode,
            },
          };
        } else {
          res = {
            entity: {
              abName: preparedData.abName,
              abNo: preparedData.abNo,
              abType: preparedData.abType,
              idenNo: preparedData.idenNo,
              relateType: preparedData.relateType,
              legalAbNo: preparedData.legalAbNo,
            },
          };
        }
        return res;
      };
      const param = getParam();
      if (formData.relateType) {
        param.entity.relateType = Array.isArray(formData.relateType)
          ? formData.relateType.join(',')
          : formData.relateType;
      }
      const { response, status } = yield call(saveAddrSup, param);
      if (status === 100) {
        // 主动取消请求
        return null;
      }
      // 注意！主数据保存的逻辑与其他模块不一样
      if (response && response.ok) {
        createMessage({
          type: 'success',
          description: formData.abNo ? '修改保存成功！' : '保存成功',
        });
        router.push(`/plat/addr/sup?refresh=${new Date().getTime()}`);
        return response.datum;
      }
      if (response.reason) {
        createMessage({ type: 'error', description: response.reason });
        return null;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return null;
    },

    // 查询供应商信息
    *queryInfo({ payload }, { call, put }) {
      const { response, status } = yield call(findAddrByNo, payload);
      const { datum } = response;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: datum.abBasicDetailView || { relateType: '' },
              personData: datum.personDetailView || {},
              ouData: datum.ouDetailView || {},
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
    clearForm(state, { payload }) {
      return {
        ...state,
        ...initialState,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
