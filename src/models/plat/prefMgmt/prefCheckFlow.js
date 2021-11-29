import { resDetailRq, saveEntityRq } from '@/services/plat/res/resprofile';
import {
  getExamTmplRq,
  examResRq,
  examRq,
  examlistRq,
  examByIdRq,
  examByIdResListRq,
  roleListRq,
  examListChangeStatusRq,
  examCopyDetailsRq,
  flowDetailRq,
  examineByThreeRq,
  examineByFourRq,
  gradeExamRq,
  examCreateReviewRq,
  checkIsPerformanceExamRq,
} from '@/services/plat/prefCheck/prefCheckFlow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { examTmplDetailsRq } from '@/services/plat/prefCheck/prefCheckMgmt';
import { getViewConf } from '@/services/gen/flow';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { genFakeId } from '@/utils/mathUtils';

const defaultFormData = {
  evalScore: ['', ''],
};
const defaultSearchForm = {
  examStatus: '',
};

export default {
  namespace: 'prefCheckFlow',
  state: {
    formData: {
      ...defaultFormData,
    },
    resData: [],
    baseBuData: [],
    type2: [],
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    // 绩效考核新增相关
    yearList: [], // 年份下拉框
    checkTimeList: [], // 季度或者上下半年
    examTmplList: [], // 绩效考核模板
    udcList: [], // UDC列表
    relatedEntityListExamEval: [], // 绩效考核相关人员考核评定
    relatedEntityListExamCheck: [], // 绩效考核相关人员可查看考核明细
    checkScopeSearchForm: {}, // 考核范围列表查询条件
    checkScopeList: [], // 考核范围列表
    checkScopeTotal: [], // 考核范围列表总数
    selectedData: [], // 被选中的考核范围资源
    checkResData: [], // 考核资源列表
    checkResSelect: [], // 考核资源列表下拉
    checkResFormData: {}, // 考核资源列表上快捷添加
    roleList: [], // 考核范围查询条件角色下拉
    // 详情相关
    detailFormData: {},
    detailExamResList: [],
    detailExamResTotal: 0,
    // 流程相关
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
    examTmplPointViewList: [],

    // 考核模板相关
    gradeEntityList: [],
    pointEntityList: [],
    firstSelect: 0,
    pageConfig: {},
  },

  effects: {
    *queryTempDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examTmplDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { gradeViewList, pointViewList } = response.datum;
          let gradeCheck = '';
          if (Array.isArray(gradeViewList) && !isEmpty(gradeViewList)) {
            gradeViewList.forEach((v, index) => {
              if (index === 0) {
                gradeCheck = `${gradeCheck + v.gradeName}(<=${v.ratio}%) , `;
              } else {
                gradeCheck = ` ${gradeCheck + v.gradeName}(${gradeViewList[index - 1].ratio + 1}%~${
                  v.ratio
                }%)${index < gradeViewList.length - 1 ? ' , ' : ''}`;
              }
            });
          }

          // 计算得分占比初始值,第一行初始值为0
          gradeViewList.map((v, index) => {
            if (index > 0) {
              // eslint-disable-next-line
              return (v.ratioStart = gradeViewList[index - 1].ratio + 1);
            }
            // eslint-disable-next-line
            return (v.ratioStart = 0);
          });

          yield put({
            type: 'updateForm',
            payload: {
              evalScore: [response.datum.scoreMin, response.datum.scoreMax],
            },
          });

          yield put({
            type: 'updateState',
            payload: {
              pointEntityList: Array.isArray(pointViewList) ? pointViewList : [],
              gradeEntityList: Array.isArray(gradeViewList) ? gradeViewList : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
    *gradeExam({ payload }, { call, put, select }) {
      const { status, response } = yield call(gradeExamRq, payload);

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateForm',
          payload: {
            gradeExamFiy: datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取等级失败' });
      }
    },
    *examineByFour({ payload }, { call, put, select }) {
      const { status, response } = yield call(examineByFourRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
    },
    *examineByThree({ payload }, { call, put, select }) {
      const { status, response } = yield call(examineByThreeRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
    },
    *createSubmit({ payload }, { call, put, select }) {
      const {
        formData,
        relatedEntityListExamEval,
        relatedEntityListExamCheck,
        checkResData,
        examTmplPointViewList,
        gradeEntityList,
        pointEntityList,
      } = yield select(({ prefCheckFlow }) => prefCheckFlow);
      const { examCycle, examDate, relatedRole, resId, evalScore } = formData;
      // 考核周期任意时间时时间处理
      if (examCycle === 'FLEXIBLE') {
        if (Array.isArray(examDate) && examDate[0] && examDate[1]) {
          // eslint-disable-next-line
          formData.examPeriodStart = examDate[0];
          // eslint-disable-next-line
          formData.examPeriodEnd = examDate[1];
        }
      }
      // 考核周期月度时时间处理
      if (examCycle === 'MONTH') {
        // eslint-disable-next-line
        formData.examPeriodStart = moment(examDate)
          .startOf('month')
          .format('YYYY-MM-DD');
        // eslint-disable-next-line
        formData.examPeriodEnd = moment(examDate)
          .endOf('month')
          .format('YYYY-MM-DD');
      }
      // 考核周期年度时时间处理
      if (examCycle === 'YEAR') {
        // eslint-disable-next-line
        formData.examPeriodStart = moment(String(examDate))
          .startOf('year')
          .format('YYYY-MM-DD');
        // eslint-disable-next-line
        formData.examPeriodEnd = moment(String(examDate))
          .endOf('year')
          .format('YYYY-MM-DD');
      }
      formData.relatedEntityList = []
        .concat(relatedEntityListExamEval)
        .concat(relatedEntityListExamCheck);
      formData.relatedEntityList.push({
        relatedRole,
        resId,
        relatedType: 'EXAM_CFM',
        id: genFakeId(-1),
      });
      formData.resBuNoViewList = checkResData;
      formData.examTmplPointViewList = examTmplPointViewList;

      // 处理考核模板信息
      if (Array.isArray(evalScore) && !isNil(evalScore[0]) && !isNil(evalScore[1])) {
        [formData.scoreMin, formData.scoreMax] = evalScore;
      }
      formData.gradeEntityList = gradeEntityList;
      formData.pointEntityList = pointEntityList;
      const { status, response } = yield call(examRq, { ...formData, ...formData });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200 && response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto('/hr/prefMgmt/prefCheck/flowMgmt?_refresh=0');
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(examRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *queryFolwDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(flowDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        if (response && response.ok) {
          const {
            relatedEntityList,
            resBuNoViewList,
            examCycle,
            examPeriodStart,
            examPeriodEnd,
            gradeScore,
            gradeExam,
            examTmplPointViewList,
            gradeEntityList,
            pointEntityList,
          } = response.datum;

          const examTmplPointViewListNew = examTmplPointViewList.map(v => ({
            ...v,
            evalScore: null,
            evalComment: null,
            evalScoreFlag: undefined,
          }));

          // 计算得分占比初始值,第一行初始值为0
          gradeEntityList.map((v, index) => {
            if (index > 0) {
              // eslint-disable-next-line
              return (v.ratioStart = gradeEntityList[index - 1].ratio + 1);
            }
            // eslint-disable-next-line
            return (v.ratioStart = 0);
          });

          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                relatedRole: !isEmpty(relatedEntityList)
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].relatedRole
                  : '',
                resId: !isEmpty(relatedEntityList)
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].resId
                  : undefined,
                // countType: !isEmpty(examTmplPointViewList)
                //   ? examTmplPointViewList[0].countType
                //   : '',
                gradeScoreFiy: gradeScore,
                gradeExamFiy: gradeExam,
                evalScore: [response.datum.scoreMin, response.datum.scoreMax],
              },
              relatedEntityListExamEval: relatedEntityList.filter(
                v => v.relatedType === 'EXAM_EVAL'
              ),
              checkResData: resBuNoViewList,
              relatedEntityListExamCheck: Array.isArray(relatedEntityList)
                ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CHECK')
                : [],
              examTmplPointViewList: examTmplPointViewListNew,
              gradeEntityList,
              pointEntityList,
            },
          });
          if (examCycle === 'FLEXIBLE') {
            yield put({
              type: 'updateForm',
              payload: {
                examDate: [examPeriodStart, examPeriodEnd],
              },
            });
          }
          if (examCycle === 'MONTH') {
            yield put({
              type: 'updateForm',
              payload: {
                examDate: moment(examPeriodStart).format('YYYY-MM'),
              },
            });
          }
          if (examCycle === 'QUARTER') {
            yield put({
              type: 'updateForm',
              payload: {
                year: moment(examPeriodStart).format('YYYY'),
                examDate: moment(examPeriodStart).format('YYYY-MM'),
                yearTime: moment(examPeriodStart).quarter(),
              },
            });
          }
          if (examCycle === 'HALF_YEAR') {
            yield put({
              type: 'updateForm',
              payload: {
                year: moment(examPeriodStart).format('YYYY'),
                yearTime: moment(examPeriodStart).month() + 1 >= 6 ? 1 : 0,
                examDate: '凑数',
              },
            });
          }
          // 如果考核周期为季度和半年，生成半年和季度下拉框
          if (examCycle === 'QUARTER' || examCycle === 'HALF_YEAR') {
            yield put({
              type: 'getQuarterOrHalfYear',
              payload: {
                year: moment(examPeriodStart).format('YYYY'),
                examCycle,
              },
            });
          }
          return examTmplPointViewListNew;
        }
        createMessage({
          type: 'error',
          description: response.reason || '获取详细信息失败',
        });
        return [];
      }
      createMessage({
        type: 'error',
        description: response.reason || '获取详细信息失败',
      });
      return [];
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
    *queryCopyDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examCopyDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const {
            relatedEntityList,
            resBuNoViewList,
            examCycle,
            examPeriodStart,
            examPeriodEnd,
            pointEntityList,
            gradeEntityList,
          } = response.datum;

          // 计算得分占比初始值,第一行初始值为0
          gradeEntityList.map((v, index) => {
            if (index > 0) {
              // eslint-disable-next-line
              return (v.ratioStart = gradeEntityList[index - 1].ratio + 1);
            }
            // eslint-disable-next-line
            return (v.ratioStart = 0);
          });

          // 复制功能时，将除了指定资源的resId清空
          const relatedEntityListNew = relatedEntityList.map(v => {
            if (v.relatedRole === 'ASSIGN_RES') {
              return v;
            }
            return { ...v, resId: null };
          });

          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                relatedRole: !isEmpty(relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM'))
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].relatedRole
                  : null,
                resId: !isEmpty(relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM'))
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].resId
                  : null,
                examName: '',
                examDesc: '',
                evalScore: [response.datum.scoreMin, response.datum.scoreMax],
              },
              relatedEntityListExamEval: relatedEntityListNew.filter(
                v => v.relatedType === 'EXAM_EVAL'
              ),
              checkResData: resBuNoViewList,
              relatedEntityListExamCheck: relatedEntityListNew.filter(
                v => v.relatedType === 'EXAM_CHECK'
              ),
              pointEntityList,
              gradeEntityList,
            },
          });
          // if (examCycle === 'FLEXIBLE') {
          //   yield put({
          //     type: 'updateForm',
          //     payload: {
          //       examDate: [examPeriodStart, examPeriodEnd],
          //     },
          //   });
          // }
          // if (examCycle === 'MONTH') {
          //   yield put({
          //     type: 'updateForm',
          //     payload: {
          //       examDate: moment(examPeriodStart).format('YYYY-MM'),
          //     },
          //   });
          // }
          // if (examCycle === 'QUARTER') {
          //   yield put({
          //     type: 'updateForm',
          //     payload: {
          //       year: moment(examPeriodStart).format('YYYY'),
          //       examDate: moment(examPeriodStart).format('YYYY-MM'),
          //       yearTime: moment(examPeriodStart).quarter(),
          //     },
          //   });
          // }
          // if (examCycle === 'HALF_YEAR') {
          //   yield put({
          //     type: 'updateForm',
          //     payload: {
          //       year: moment(examPeriodStart).format('YYYY'),
          //       yearTime: moment(examPeriodStart).month() + 1 >= 6 ? 1 : 0,
          //       examDate: '凑数',
          //     },
          //   });
          // }
          // 如果考核周期为季度和半年，生成半年和季度下拉框
          if (examCycle === 'QUARTER' || examCycle === 'HALF_YEAR') {
            yield put({
              type: 'getQuarterOrHalfYear',
              payload: {
                year: moment(examPeriodStart).format('YYYY'),
                examCycle,
              },
            });
          }
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
    *queryDetailExamResList({ payload }, { call, put, select }) {
      const { status, response } = yield call(examByIdResListRq, payload);

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            detailExamResList: Array.isArray(rows) ? rows : [],
            detailExamResTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      }
    },
    *getRoleList({ payload }, { call, put, select }) {
      const { status, response } = yield call(roleListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            roleList: Array.isArray(response) ? response : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examByIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { pointentityList, grandViewList } = response.datum;
          // 拼接考核结果等级字段
          let gradeCheck = '';
          if (Array.isArray(grandViewList) && !isEmpty(grandViewList)) {
            grandViewList.forEach((v, index) => {
              if (index === 0) {
                gradeCheck = `${gradeCheck + v.gradeName}(<=${v.ratio}%) , `;
              } else {
                gradeCheck = ` ${gradeCheck + v.gradeName}(${grandViewList[index - 1].ratio + 1}%~${
                  v.ratio
                }%)${index < grandViewList.length - 1 ? ' , ' : ''}`;
              }
            });
          }

          // 计算得分占比初始值,第一行初始值为0
          grandViewList.map((v, index) => {
            if (index > 0) {
              // eslint-disable-next-line
              return (v.ratioStart = grandViewList[index - 1].ratio + 1);
            }
            // eslint-disable-next-line
            return (v.ratioStart = 0);
          });

          yield put({
            type: 'updateState',
            payload: {
              detailFormData: {
                ...response.datum,
                gradeCheck,
              },
              pointentityList, // 分数等级
              grandViewList, // 考核点
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(examlistRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *ChangeStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(examListChangeStatusRq, payload);
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
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
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
    *queryUdcList({ payload }, { call, put }) {
      const { response } = yield call(queryUdc, payload.code);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          udcList: list,
        },
      });
    },
    *getYearList({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          yearList: [
            {
              id: moment()
                .subtract(3, 'years')
                .format('YYYY'),
              name: moment()
                .subtract(3, 'years')
                .format('YYYY'),
              examPeriodStart: moment()
                .subtract(3, 'years')
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
              examPeriodEnd: moment()
                .subtract(3, 'years')
                .set('month', 0)
                .endOf('month')
                .format('YYYY-MM-DD'),
            },
            {
              id: moment()
                .subtract(2, 'years')
                .format('YYYY'),
              name: moment()
                .subtract(2, 'years')
                .format('YYYY'),
              examPeriodStart: moment()
                .subtract(2, 'years')
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
              examPeriodEnd: moment()
                .subtract(2, 'years')
                .set('month', 0)
                .endOf('month')
                .format('YYYY-MM-DD'),
            },
            {
              id: moment()
                .subtract(1, 'years')
                .format('YYYY'),
              name: moment()
                .subtract(1, 'years')
                .format('YYYY'),
              examPeriodStart: moment()
                .subtract(1, 'years')
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
              examPeriodEnd: moment()
                .subtract(1, 'years')
                .set('month', 0)
                .endOf('month')
                .format('YYYY-MM-DD'),
            },
            {
              id: moment().format('YYYY'),
              name: moment().format('YYYY'),
              examPeriodStart: moment()
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
              examPeriodEnd: moment()
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
            },
            {
              id: moment()
                .add(1, 'years')
                .format('YYYY'),
              name: moment()
                .add(1, 'years')
                .format('YYYY'),
              examPeriodStart: moment()
                .add(1, 'years')
                .set('month', 0)
                .startOf('month')
                .format('YYYY-MM-DD'),
              examPeriodEnd: moment()
                .add(1, 'years')
                .set('month', 0)
                .endOf('month')
                .format('YYYY-MM-DD'),
            },
          ],
        },
      });
    },
    *getQuarterOrHalfYear({ payload }, { call, put }) {
      const { year = moment().format('YYYY'), examCycle = 'QUARTER' } = payload;
      if (examCycle === 'QUARTER') {
        yield put({
          type: 'updateState',
          payload: {
            checkTimeList: [
              {
                id: 1,
                name: '第一季度',
                examPeriodStart: moment(year)
                  .set('quarter', 1)
                  .startOf('quarter')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('quarter', 1)
                  .endOf('quarter')
                  .format('YYYY-MM-DD'),
              },
              {
                id: 2,
                name: '第二季度',
                examPeriodStart: moment(year)
                  .set('quarter', 2)
                  .startOf('quarter')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('quarter', 2)
                  .endOf('quarter')
                  .format('YYYY-MM-DD'),
              },
              {
                id: 3,
                name: '第三季度',
                examPeriodStart: moment(year)
                  .set('quarter', 3)
                  .startOf('quarter')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('quarter', 3)
                  .endOf('quarter')
                  .format('YYYY-MM-DD'),
              },
              {
                id: 4,
                name: '第四季度',
                examPeriodStart: moment(year)
                  .set('quarter', 4)
                  .startOf('quarter')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('quarter', 4)
                  .endOf('quarter')
                  .format('YYYY-MM-DD'),
              },
            ],
          },
        });
      } else if (examCycle === 'HALF_YEAR') {
        yield put({
          type: 'updateState',
          payload: {
            checkTimeList: [
              {
                id: 0,
                name: '上半年',
                examPeriodStart: moment(year)
                  .set('month', 0)
                  .startOf('month')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('month', 5)
                  .endOf('month')
                  .format('YYYY-MM-DD'),
              },
              {
                id: 1,
                name: '下半年',
                examPeriodStart: moment(year)
                  .set('month', 6)
                  .startOf('month')
                  .format('YYYY-MM-DD'),
                examPeriodEnd: moment(year)
                  .set('month', 11)
                  .endOf('month')
                  .format('YYYY-MM-DD'),
              },
            ],
          },
        });
      }
    },
    *getExamTmpl({ payload }, { call, put }) {
      const { response } = yield call(getExamTmplRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          examTmplList: list,
        },
      });
    },
    *examRes({ payload }, { select, call, put }) {
      const { resType } = payload;
      if (Array.isArray(resType) && !isEmpty(resType)) {
        // eslint-disable-next-line
        payload.resType1 = resType[0];
        // eslint-disable-next-line
        payload.resType2 = resType[1];
      }
      const { response } = yield call(examResRq, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      yield put({
        type: 'updateState',
        payload: {
          checkScopeList: list,
          checkScopeTotal: response.total,
        },
      });
    },
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId, resName } = response.extInfo || {};
        yield put({
          type: 'queryResDetail',
          payload: resId,
        });
        yield put({
          type: 'updateForm',
          payload: {
            resId,
            applyResId: isNil(resId) ? undefined : resId + '',
            applyResName: resName,
            applyDate: moment().format('YYYY-MM-DD'),
            submit: 'true',
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
      }
    },
    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(resDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
        },
      });
    },
    *cleanFormData({ payload }, { call, put }) {
      yield put({
        type: 'updateForm',
        payload: {},
      });
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          gradeEntityList: [],
          pointEntityList: [],
          examTmplPointViewList: [],
        },
      });
    },
    *createReview({ payload }, { call, put }) {
      const { status, response } = yield call(examCreateReviewRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *checkIsPerformanceExam({ payload }, { call, put }) {
      const { status, response } = yield call(checkIsPerformanceExamRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
    updatcheckScopeSearchForm(state, { payload }) {
      const { checkScopeSearchForm } = state;
      const newFormData = { ...checkScopeSearchForm, ...payload };
      return {
        ...state,
        checkScopeSearchForm: newFormData,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // console.log('-----------');
        // console.log(pathname);
        if (pathname === '/hr/prefMgmt/prefCheck/flowMgmt/view') {
          dispatch({
            type: 'getPageConfig',
            payload: { pageNo: 'PERFORMANCE_EXAM_DETAIL' },
          });
        } else if (pathname === '/hr/prefMgmt/prefCheck/flowMgmt/create') {
          dispatch({
            type: 'getPageConfig',
            payload: { pageNo: 'PERFORMANCE_EXAM_INSERT' },
          });
        }
        // else if (pathname === '/hr/prefMgmt/prefCheckFlow/index'){
        //   dispatch({
        //     type: 'getPageConfig',
        //     payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_DETAIL' },
        //   });
        // }
      });
    },
  },
};
