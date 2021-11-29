import {
  findSubjtemplateById,
  create,
  update,
  findSubjtemplateDetails,
  queryAccMasTree,
} from '@/services/sys/baseinfo/subjtemplate';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import router from 'umi/router';
import { closeThenGoto } from '@/layouts/routerControl';

const formDataModel = {
  id: 0,
  tmplNo: '',
  tmplName: null,
  tmplIndustry: null,
  tmplStatus: null,
  tmplClass: null,
  tmplType: null,
  remark: null,
};

export default {
  namespace: 'sysSubjtempCreate',

  state: {
    formData: {
      ...formDataModel,
    },
    mode: 'create',
    dataSource: [],
    total: 0,
    modalTreeData: [],
    deleteList: [],
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      yield put({ type: 'clean' });
      const {
        response: { ok, datum },
      } = yield call(findSubjtemplateById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { formData: datum || {}, mode: payload.mode },
        });
      }
    },

    // *queryDetails({ payload }, { call, put }) {
    //   const { response } = yield call(findSubjtemplateDetails, payload);
    //   if (response) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         dataSource: response.rows,
    //         total: response.total,
    //         deleteList: response.rows.map(v => v.id),
    //       },
    //     });
    //   }
    // },

    *queryAccMasTree({ payload }, { call, put, select }) {
      const response = yield call(queryAccMasTree, { accIndustry: payload.accIndustry });
      yield put({
        type: 'updateState',
        payload: { modalTreeData: Array.isArray(response.response) ? response.response : [] },
      });
    },
    *save(_, { call, select }) {
      const { formData, dataSource, deleteList } = yield select(
        ({ sysSubjtempCreate }) => sysSubjtempCreate
      );

      if (formData.id) {
        // 编辑的保存方法
        const accTemplateDs = dataSource.filter(v => !!v.accId);
        const del = deleteList.filter(
          d => !accTemplateDs.map(i => i.id).filter(v => !!v && d === v).length
        );
        formData.accTemplateDs = accTemplateDs;
        formData.deleteIds = del;

        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/plat/finAccout/subjtemplate`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        formData.accTemplateDs = [];
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(`/plat/finAccout/subjtempedit?id=${response.datum.id}&mode=update`);
            // 刷新当前页面。这么用的原因是目前框架没有托管跳转页面并刷新。
            // router.go();
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 保存树的数据到列表
    *saveAccMasTree({ payload }, { put, select }) {
      const { checkedKeys, modalTreeData } = payload;
      const { dataSource, formData } = yield select(({ sysSubjtempCreate }) => sysSubjtempCreate);
      // modalData重构列表数据
      const modalData = dataSource.filter(item => !!item.accCode);
      // 把勾选的树节点的code找出来(不包含列表已存在的code)
      const code = checkedKeys.filter(
        dataKey => !modalData.map(v => v.accCode).filter(item => item === dataKey).length
      );

      const row = {
        tmplId: formData.id,
        includeFlag: 0,
        procStatus: 'NEWADDED',
        procStatusName: '新加',
      };
      // 遍历树结构数据(从最深的节点找到最表层的节点)
      const treeToList = data => {
        data.forEach(v => {
          if (v.children) {
            treeToList(v.children);
          }
          if (code.includes(v.accCode)) {
            // id>0时后台做update操作,id<0时后台做insert操作
            modalData.push({ ...v, ...row, accId: v.id, id: genFakeId(-1), children: null });
          }
        });
      };
      treeToList(modalTreeData);

      yield put({
        type: 'updateState',
        payload: { dataSource: modalData, total: modalData.length },
      });
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formDataModel,
          },
          mode: 'create',
          dataSource: [],
          total: 0,
          modalTreeData: [],
          deleteList: [],
        },
      });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    // 修改form表单字段内容，将数据保存到state
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
