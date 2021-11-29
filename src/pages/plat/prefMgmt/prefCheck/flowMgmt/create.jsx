/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import classnames from 'classnames';
import {
  Button,
  Card,
  Form,
  Input,
  Col,
  Row,
  Divider,
  InputNumber,
  Icon,
  Checkbox,
  Popconfirm,
} from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import { genFakeId, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import ResType from '@/pages/gen/field/resType';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';
import { createConfirm } from '@/components/core/Confirm';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import ScopeInput from '../../component/ScopeInput';
import Temp from './Temp';

const { Field, FieldLine } = FieldList;
const InputGroup = Input.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'prefCheckFlow';

@connect(({ loading, prefCheckFlow, dispatch }) => ({
  loading,
  prefCheckFlow,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'examTmplId') {
      return;
    }
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class PrefCheckCreate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          year: moment().format('YYYY'),
        },
        relatedEntityListExamEval: [],
        relatedEntityListExamCheck: [],
        checkResData: [],
        detailExamResList: [],
        detailExamResTotal: 0,
        checkScopeSearchForm: {},
        checkScopeList: [],
        checkScopeTotal: 0,
        gradeEntityList: [],
        pointEntityList: [],
        pageConfig: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_INSERT' },
    });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/getYearList` }); // 获取考核年度，前端在自己生成前三年后一年
    dispatch({ type: `${DOMAIN}/getExamTmpl` }); // 获取已启用的考核模板
    dispatch({ type: `${DOMAIN}/getRoleList` }); // 考核范围查询条件角色下拉
    // 获取考核资源
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    // 获取页面UDC
    dispatch({
      type: `${DOMAIN}/queryUdcList`,
      payload: {
        code: 'RES:EXAM_ROLE',
      },
    });

    const { id, copy, _refresh } = fromQs();
    if (id && copy) {
      dispatch({
        type: `${DOMAIN}/queryCopyDetail`,
        payload: {
          id,
        },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            id: null,
          },
        });
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
  }

  fetchDataCopyList = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetailExamResList`, payload: { ...params, id } });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/examRes`, payload: { ...params } });
  };

  // 行编辑触发事件
  onExamEvalChanged = (index, value, name) => {
    const {
      prefCheckFlow: { relatedEntityListExamEval },
      dispatch,
    } = this.props;

    const newDataSource = relatedEntityListExamEval;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { relatedEntityListExamEval: newDataSource },
    });
  };

  // 行编辑触发事件
  onExamCheckChanged = (index, value, name) => {
    const {
      prefCheckFlow: { relatedEntityListExamCheck },
      dispatch,
    } = this.props;

    const newDataSource = relatedEntityListExamCheck;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { relatedEntityListExamCheck: newDataSource },
    });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      prefCheckFlow: {
        searchForm,
        formData: { examCycle, year, relatedRole, resId },
        relatedEntityListExamEval,
        relatedEntityListExamCheck,
        checkResData,
        gradeEntityList,
        pointEntityList,
      },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (examCycle === 'QUARTER' || examCycle === 'HALF_YEAR') {
          if (!year) {
            createMessage({ type: 'warn', description: '请选择考核期间' });
            return;
          }
        }
        if (relatedRole === 'ASSIGN_RES' && !resId) {
          if (!year) {
            createMessage({ type: 'warn', description: '请选择指定考核资源' });
            return;
          }
        }

        // ========================考核模板信息校验====================
        // 考核点数据校验
        if (isEmpty(pointEntityList)) {
          createMessage({ type: 'warn', description: '至少要有一条考核点' });
          return;
        }
        if (!isEmpty(pointEntityList)) {
          // 考核点名称必填
          const noPointName = pointEntityList.filter(v => !v.pointName);
          if (noPointName.length) {
            createMessage({ type: 'warn', description: '请填写考核点名称' });
            return;
          }

          // 考核结果等级的等级名称不能重复
          let repeatNum = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of pointEntityList) {
            const repeatArr = pointEntityList.filter(obj => obj.pointName === item.pointName);
            if (repeatArr.length >= 2) {
              repeatNum += 1;
              break;
            }
          }
          if (repeatNum) {
            createMessage({ type: 'warn', description: '考核点名称不能重复' });
            return;
          }

          // 有多条考核点时权重必填，并且权重总和必须等于100%
          if (pointEntityList.filter(v => v.poinType !== '2' && v.poinType !== '3').length >= 2) {
            const tt = pointEntityList
              .filter(v => v.poinType !== '2' && v.poinType !== '3')
              .filter(v => isNil(v.weight));
            if (tt.length) {
              createMessage({ type: 'warn', description: '常规考核点权重必填' });
              return;
            }
            const allWeight = pointEntityList
              .filter(v => v.poinType !== '2' && v.poinType !== '3')
              .reduce((x, y) => add(x, Number(y.weight)), 0);
            if (allWeight !== 100) {
              createMessage({ type: 'warn', description: '常规考核点权重总和必须等于100%' });
              return;
            }
          }
        }

        // 考核结果等级所有得分占比综合必须等于100%
        if (!isEmpty(gradeEntityList)) {
          // 考核结果等级所有信息必填
          const tt = gradeEntityList.filter(
            v => !v.gradeName || isNil(v.ratioStart) || isNil(v.ratio)
          );
          if (tt.length) {
            createMessage({ type: 'warn', description: '请补全考核结果等级所有必填信息' });
            return;
          }

          // 考核结果等级最后一条必须到达100%
          const lastRatio = gradeEntityList[gradeEntityList.length - 1].ratio;
          if (!isEmpty(gradeEntityList) && lastRatio !== 100) {
            createMessage({ type: 'warn', description: '考核结果等级最后一条必须到达100%' });
            return;
          }

          // 考核结果等级的等级名称不能重复
          let repeatNum = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of gradeEntityList) {
            const repeatArr = gradeEntityList.filter(obj => obj.gradeName === item.gradeName);
            if (repeatArr.length >= 2) {
              repeatNum += 1;
              break;
            }
          }
          if (repeatNum) {
            createMessage({ type: 'warn', description: '考核结果等级名称不能重复' });
            return;
          }
        }

        // ==============================考核信息校验=========================
        // 考核评定：至少一人；多人时，权重必填，且总和必须为100%
        if (!relatedEntityListExamEval.length) {
          createMessage({ type: 'warn', description: '考核评定至少有一条' });
          return;
        }

        // 考核评定中考核角色不能为空
        if (relatedEntityListExamEval.filter(v => !v.relatedRole).length) {
          createMessage({ type: 'warn', description: '请填写考核评定的考核角色' });
          return;
        }

        // 指定资源时资源必填
        if (
          !isEmpty(
            relatedEntityListExamEval.filter(v => v.relatedRole === 'ASSIGN_RES' && !v.resId)
          )
        ) {
          createMessage({ type: 'warn', description: '请选择考核指定资源' });
          return;
        }

        //  考核评定等于一条时，权重默认值为100%
        if (relatedEntityListExamEval.length === 1) {
          relatedEntityListExamEval[0].weight = 100;
        }

        // 考核评定多于一条时，权重必填且和为100%
        if (relatedEntityListExamEval.length >= 2) {
          if (
            relatedEntityListExamEval
              .filter(v => v.poinType !== '2' && v.poinType !== '3')
              .filter(v => !v.weight).length
          ) {
            createMessage({ type: 'warn', description: '多条考核评定时权重必填' });
            return;
          }
          const allWeight = relatedEntityListExamEval.reduce((x, y) => add(x, Number(y.weight)), 0);
          if (allWeight !== 100) {
            createMessage({ type: 'warn', description: '多条考核评定权重总和必须等于100%' });
            return;
          }
        }
        if (isEmpty(checkResData)) {
          createMessage({ type: 'warn', description: '考核范围中考核资源不能为空' });
          return;
        }

        // 可查看考核明细选指定资源时资源必填
        // 考核评定中考核角色不能为空
        if (relatedEntityListExamCheck.filter(v => !v.relatedRole).length) {
          createMessage({ type: 'warn', description: '请填写可查看考核明细的考核角色' });
          return;
        }
        if (
          !isEmpty(
            relatedEntityListExamCheck.filter(v => v.relatedRole === 'ASSIGN_RES' && !v.resId)
          )
        ) {
          createMessage({ type: 'warn', description: '请选择考核指定资源' });
          return;
        }

        dispatch({
          type: `${DOMAIN}/createSubmit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      prefCheckFlow: {
        formData,
        yearList,
        checkTimeList,
        examTmplList,
        udcList,
        relatedEntityListExamEval, // 绩效考核相关人员考核评定
        relatedEntityListExamCheck, // 绩效考核相关人员可查看考核明细
        // examResList,
        resData,
        baseBuData,
        checkScopeSearchForm,
        checkScopeList,
        checkScopeTotal,
        selectedData,
        type2,
        checkResData,
        firstSelect,
        roleList,
        pageConfig,
      },
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryCopyDetail`] ||
      loading.effects[`${DOMAIN}/queryDetailExamResList`] ||
      loading.effects[`${DOMAIN}/createSubmit`] ||
      loading.effects[`${DOMAIN}/queryTempDetail`];

    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentEvaluationConfig = [];
    let currentDetailConfig = [];
    let currentRangeConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_EVAL') {
        // 绩效考核-评定区域
        currentEvaluationConfig = view;
      } else if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_DETAIL') {
        // 绩效考核-明细区域
        currentDetailConfig = view;
      } else if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_SCOPE') {
        // 绩效考核-范围区域
        currentRangeConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsEvaluation } = currentEvaluationConfig; // 考核评定
    const { pageFieldViews: pageFieldViewsDetail } = currentDetailConfig; // 可查看人员明细
    const { pageFieldViews: pageFieldViewsRange } = currentRangeConfig; // 考核范围

    const pageFieldJsonEvaluation = {}; // 考核评定
    const pageFieldJsonDetail = {}; // 可查看人员明细
    const pageFieldJsonRange = {}; // 考核范围
    if (pageFieldViewsEvaluation) {
      pageFieldViewsEvaluation.forEach(field => {
        pageFieldJsonEvaluation[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsDetail) {
      pageFieldViewsDetail.forEach(field => {
        pageFieldJsonDetail[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsRange) {
      pageFieldViewsRange.forEach(field => {
        pageFieldJsonRange[field.fieldKey] = field;
      });
    }
    const examEvalTableProps = {
      sortBy: 'id',
      rowKey: 'key',
      loading: false,
      dataSource: relatedEntityListExamEval,
      rowSelection: {
        selectedRowKeys: 0,
        onChange: (selectedRowKeys, selectedRows) => {},
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamEval: update(relatedEntityListExamEval, {
              $push: [
                {
                  ...newRow,
                  key: genFakeId(-1),
                  relatedType: 'EXAM_EVAL',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = relatedEntityListExamEval.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.key).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamEval: newDataSource,
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamEval: update(relatedEntityListExamEval, { $push: newDataSource }),
          },
        });
      },
      columns: [
        pageFieldJsonEvaluation.relatedRole.visibleFlag && {
          title: `${pageFieldJsonEvaluation.relatedRole.displayName}`,
          dataIndex: 'relatedRole',
          width: '30%',
          sortNo: `${pageFieldJsonEvaluation.relatedRole.sortNo}`,
          required: true,
          render: (value, row, index) => (
            <Selection
              value={value || undefined}
              source={udcList.filter(v => v.sphd1 === 'EXAM_EVAL')}
              className="tw-field-group-field"
              placeholder={`请选择${pageFieldJsonEvaluation.relatedRole.displayName}`}
              onChange={e => {
                this.onExamEvalChanged(index, e, 'relatedRole');
                this.onExamEvalChanged(index, undefined, 'resId');
              }}
            />
          ),
        },
        pageFieldJsonEvaluation.apprResId.visibleFlag && {
          title: `${pageFieldJsonEvaluation.apprResId.displayName}`,
          dataIndex: 'resId',
          width: '30%',
          sortNo: `${pageFieldJsonEvaluation.apprResId.sortNo}`,
          required: relatedEntityListExamEval.filter(v => v.relatedRole === 'ASSIGN_RES').length,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              value={value || undefined}
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={
                row.relatedRole !== 'ASSIGN_RES'
                  ? '系统自动生成'
                  : `请选择${pageFieldJsonEvaluation.apprResId.displayName}`
              }
              onChange={e => {
                this.onExamEvalChanged(index, e, 'resId');
              }}
              disabled={row.relatedRole !== 'ASSIGN_RES'}
            />
          ),
        },
        pageFieldJsonEvaluation.weight.visibleFlag && {
          title: `${pageFieldJsonEvaluation.weight.displayName}`, // 初始化 填写
          dataIndex: 'weight',
          width: '40%',
          sortNo: `${pageFieldJsonEvaluation.weight.sortNo}`,
          required:
            relatedEntityListExamEval.filter(v => v.relatedType === 'EXAM_EVAL').length >= 2,
          render: (value, row, index) => (
            <>
              <InputNumber
                value={value}
                style={{ width: '90%' }}
                onChange={e => {
                  this.onExamEvalChanged(index, e, 'weight');
                }}
                placeholder={`请输入${pageFieldJsonEvaluation.weight.displayName}`}
              />
              <span> %</span>
            </>
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const examCheckTableProps = {
      sortBy: 'id',
      rowKey: 'key',
      loading: false,
      dataSource: relatedEntityListExamCheck,
      rowSelection: {
        selectedRowKeys: 0,
        onChange: (selectedRowKeys, selectedRows) => {},
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamCheck: update(relatedEntityListExamCheck, {
              $push: [
                {
                  ...newRow,
                  key: genFakeId(-1),
                  relatedType: 'EXAM_CHECK',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = relatedEntityListExamCheck.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.key).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamCheck: newDataSource,
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            relatedEntityListExamCheck: update(relatedEntityListExamCheck, {
              $push: newDataSource,
            }),
          },
        });
      },
      columns: [
        pageFieldJsonDetail.relatedRole.visibleFlag && {
          title: `${pageFieldJsonDetail.relatedRole.displayName}`,
          dataIndex: 'relatedRole',
          width: '50%',
          sortNo: `${pageFieldJsonDetail.relatedRole.sortNo}`,
          required: true,
          render: (value, row, index) => (
            <Selection
              value={value || undefined}
              source={udcList.filter(v => v.sphd3 === 'EXAM_CHECK')}
              className="tw-field-group-field"
              placeholder={`请输入${pageFieldJsonDetail.relatedRole.displayName}`}
              onChange={e => {
                this.onExamCheckChanged(index, e, 'relatedRole');
                this.onExamCheckChanged(index, undefined, 'resId');
              }}
            />
          ),
        },
        pageFieldJsonDetail.apprResId.visibleFlag && {
          title: `${pageFieldJsonDetail.apprResId.displayName}`,
          dataIndex: 'resId',
          width: '50%',
          sortNo: `${pageFieldJsonDetail.apprResId.sortNo}`,
          required: relatedEntityListExamCheck.filter(v => v.relatedRole === 'ASSIGN_RES').length,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              value={value || undefined}
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={
                row.relatedRole !== 'ASSIGN_RES'
                  ? '系统自动生成'
                  : `请选择${pageFieldJsonDetail.apprResId.displayName}`
              }
              onChange={e => {
                this.onExamCheckChanged(index, e, 'resId');
              }}
              disabled={row.relatedRole !== 'ASSIGN_RES'}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const checkScope = {
      rowKey: 'resId',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      total: checkScopeTotal,
      dataSource: checkScopeList,
      showColumn: false,
      showExport: false,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        const { isOnly } = allValues;
        dispatch({
          type: `${DOMAIN}/updatcheckScopeSearchForm`,
          payload: {
            ...allValues,
            isOnly: isOnly ? 'TRUE' : '',
          },
        });
      },
      rowSelection: {
        onSelect: (record, selected, selectedRows, nativeEvent) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedData: selectedRows },
          });
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedData: selectedRows },
          });
        },
        getCheckboxProps: record => ({
          disabled: checkResData.filter(v => v.resId === record.resId).length > 0,
        }),
      },
      searchForm: checkScopeSearchForm,
      searchBarForm: [
        pageFieldJsonRange.buId.visibleFlag && {
          title: `${pageFieldJsonRange.buId.displayName}`,
          dataIndex: 'buId',
          sortNo: `${pageFieldJsonRange.buId.sortNo}`,
          colProps: {
            xs: 14,
            sm: 14,
            md: 14,
            lg: 14,
            xl: 14,
          },
          options: {
            initialValue: checkScopeSearchForm.buId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectBuMultiCol()}
              columns={[
                { dataIndex: 'code', title: '编号', span: 8 },
                { dataIndex: 'name', title: '名称', span: 8 },
                { dataIndex: 'valSphd1', title: '公司', span: 8 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 600 }}
              showSearch
            />
          ),
        },
        {
          // title: '合作方式',
          dataIndex: 'isOnly',
          colProps: {
            xs: 10,
            sm: 10,
            md: 10,
            lg: 10,
            xl: 10,
          },
          options: {
            initialValue: checkScopeSearchForm.isOnly || undefined,
          },
          tag: (
            <Checkbox
              checked={checkScopeSearchForm.isOnly === 'TRUE'}
              onChange={e => {
                dispatch({
                  type: `${DOMAIN}/updatcheckScopeSearchForm`,
                  payload: {
                    isOnly: e.target.checked ? 'TRUE' : '',
                  },
                });
              }}
            >
              {`包含下级${pageFieldJsonRange.buId.displayName}`},
            </Checkbox>
          ),
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          colProps: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24,
          },
          formItemLayout: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          },
          options: {
            initialValue: checkScopeSearchForm.coopType || undefined,
          },
          tag: <Selection.UDC code="COM:COOPERATION_MODE" placeholder="请选择合作方式" />,
        },
        pageFieldJsonRange.resType.visibleFlag && {
          title: `${pageFieldJsonRange.resType.displayName}`,
          dataIndex: 'resType',
          sortNo: `${pageFieldJsonRange.resType.sortNo}`,
          colProps: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24,
          },
          formItemLayout: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          },
          options: {
            initialValue: checkScopeSearchForm.resType || undefined,
          },
          tag: (
            <ResType
              type2={type2}
              code="RES:RES_TYPE1"
              onChange={this.handleChangeType}
              placeholder1={`${pageFieldJsonRange.resType.displayName}一`}
              placeholder2={`${pageFieldJsonRange.resType.displayName}二`}
            />
          ),
        },
        {
          title: '入职时间',
          dataIndex: 'enrollDate',
          colProps: {
            xs: 22,
            sm: 22,
            md: 22,
            lg: 22,
            xl: 22,
          },
          formItemLayout: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          },
          options: {
            initialValue: checkScopeSearchForm.enrollDate || undefined,
          },
          tag: <DatePicker format="YYYY-MM-DD" />,
        },
        {
          dataIndex: '之前',
          colProps: {
            xs: 2,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 2,
          },
          formItemLayout: {
            labelCol: { span: 0 },
            wrapperCol: { span: 24 },
          },
          tag: <span>之前</span>,
        },
        pageFieldJsonRange.resId.visibleFlag && {
          title: `${pageFieldJsonRange.resId.displayName}`,
          dataIndex: 'resId',
          sortNo: `${pageFieldJsonRange.resId.sortNo}`,
          colProps: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24,
          },
          formItemLayout: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          },
          options: {
            initialValue: checkScopeSearchForm.resId || undefined,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={particularColumns}
              source={() => selectUsersWithBu()}
              showSearch
              placeholder={`请选择${pageFieldJsonRange.resId.displayName}`}
            />
          ),
        },
        {
          title: '角色',
          dataIndex: 'roleCode',
          colProps: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24,
          },
          formItemLayout: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          },
          options: {
            initialValue: checkScopeSearchForm.roleCode || undefined,
          },
          tag: (
            <Selection
              transfer={{ key: 'code', code: 'code', name: 'name' }}
              source={roleList}
              showSearch
              placeholder="请选择角色"
            />
          ),
        },
      ].filter(Boolean),
      columns: [
        pageFieldJsonRange.resId.visibleFlag && {
          title: `${pageFieldJsonRange.resId.displayName}`,
          dataIndex: 'resName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.resId.sortNo}`,
          render: (value, row, index) => `${row.abNo}-${row.foreignName}-${row.resName}`,
        },
        {
          title: '角色',
          dataIndex: 'roleNames',
          align: 'center',
        },
        pageFieldJsonRange.buId.visibleFlag && {
          title: `${pageFieldJsonRange.buId.displayName}`,
          dataIndex: 'buName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.buId.sortNo}`,
        },
        pageFieldJsonRange.coopType.visibleFlag && {
          title: `${pageFieldJsonRange.coopType.displayName}`,
          dataIndex: 'coopTypeName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.coopType.sortNo}`,
        },
        pageFieldJsonRange.resType.visibleFlag && {
          title: `${pageFieldJsonRange.resType.displayName}`,
          dataIndex: 'resType',
          align: 'center',
          sortNo: `${pageFieldJsonRange.resType.sortNo}`,
        },
        pageFieldJsonRange.enrollDate.visibleFlag && {
          title: `${pageFieldJsonRange.enrollDate.displayName}`,
          dataIndex: 'enrollDate',
          align: 'center',
          width: 100,
          sortNo: `${pageFieldJsonRange.enrollDate.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const checkRes = {
      rowKey: 'resId',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: checkResData,
      showSearch: false,
      showExport: false,
      showColumn: false,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
        showTotal: total => `共 ${total} 条`,
        defaultPageSize: 10,
        defaultCurrent: 1,
        size: 'default',
      },
      // enableSelection: false,
      rowSelection: {
        onChange: (key, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: { selectedRowKeys: key },
          });
        },
        selectedRowKeys: formData.selectedRowKeys,
      },
      columns: [
        pageFieldJsonRange.resId.visibleFlag && {
          title: `${pageFieldJsonRange.resId.displayName}`,
          dataIndex: 'resName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.resId.sortNo}`,
          render: (value, row, index) => `${row.abNo}-${row.foreignName}-${row.resName}`,
        },
        pageFieldJsonRange.buId.visibleFlag && {
          title: `${pageFieldJsonRange.buId.displayName}`,
          dataIndex: 'buName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.buId.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      footer: () => {
        const deleteBtn =
          Array.isArray(formData.selectedRowKeys) && !isEmpty(formData.selectedRowKeys)
            ? !formData.selectedRowKeys.length
            : true;
        return deleteBtn ? (
          <Button disabled className="tw-btn-error" style={{ marginLeft: 8 }}>
            删除
          </Button>
        ) : (
          <Popconfirm
            key="delete"
            title="确定要删除这些记录么?"
            placement="top"
            onConfirm={() => {
              const keys = formData.selectedRowKeys;
              const tt = checkResData.filter(v => !keys.includes(v.resId));
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: { checkResData: tt },
              });
            }}
          >
            <Button disabled={deleteBtn} className="tw-btn-error" style={{ marginLeft: 8 }}>
              删除
            </Button>
          </Popconfirm>
        );
      },
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核新增" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="examName"
              label="考核名称"
              decorator={{
                initialValue: formData.examName || '',
                rules: [
                  {
                    required: true,
                    message: '请输入考核名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入考核名称" />
            </Field>
            <Field
              name="examCycle"
              label="考核周期"
              decorator={{
                initialValue: formData.examCycle || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择考核周期',
                  },
                ],
              }}
            >
              <Selection.UDC
                className="x-fill-100"
                code="RES:PERFORMANCE_EXAM_CYCLE"
                showSearch
                onChange={value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      checkTimeList: [],
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      year: undefined,
                      yearTime: undefined,
                      examDate: undefined,
                      examPeriodStart: undefined,
                      examPeriodEnd: undefined,
                    },
                  });
                }}
                placeholder="请选择考核周期"
              />
            </Field>
            <Field
              name="examDate"
              label="考核期间"
              decorator={{
                initialValue: formData.examDate || '',
                rules: [
                  {
                    required: true,
                    message: '请选择考核期间',
                  },
                ],
              }}
            >
              {!formData.examCycle ? (
                <Input disabled placeholder="请先选择考核周期" />
              ) : formData.examCycle === 'FLEXIBLE' ? (
                <DatePicker.RangePicker format="YYYY-MM-DD" />
              ) : formData.examCycle === 'MONTH' ? (
                <DatePicker.MonthPicker format="YYYY-MM" />
              ) : formData.examCycle === 'YEAR' ? (
                <DatePicker.YearPicker className="x-fill-100" format="YYYY" />
              ) : formData.examCycle === 'QUARTER' || formData.examCycle === 'HALF_YEAR' ? (
                <InputGroup>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Selection
                        name="cheakYear"
                        value={formData.year}
                        className="x-fill-100"
                        source={yearList}
                        transfer={{ key: 'id', code: 'id', name: 'name' }}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        onChange={value => {
                          if (value) {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                year: value,
                              },
                            });
                            dispatch({
                              type: `${DOMAIN}/getQuarterOrHalfYear`,
                              payload: {
                                year: value,
                                examCycle: formData.examCycle,
                              },
                            });
                          } else {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                year: undefined,
                              },
                            });
                          }
                          dispatch({
                            type: `${DOMAIN}/updateForm`,
                            payload: {
                              yearTime: undefined,
                              examPeriodStart: undefined,
                              examPeriodEnd: undefined,
                            },
                          });
                        }}
                        placeholder="请选择考核年度"
                      />
                    </Col>
                    <Col span={12}>
                      <Selection
                        name="quarterOrHalfYear"
                        value={formData.yearTime}
                        className="x-fill-100"
                        source={checkTimeList}
                        transfer={{ key: 'id', code: 'id', name: 'name' }}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        onChange={value => {
                          if (value) {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                yearTime: value,
                              },
                            });
                          } else {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                yearTime: undefined,
                              },
                            });
                          }
                        }}
                        onValueChange={value => {
                          if (value) {
                            const { examPeriodStart, examPeriodEnd } = value;
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                examPeriodStart,
                                examPeriodEnd,
                                examDate: '凑数',
                              },
                            });
                          } else {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: {
                                examPeriodStart: '',
                                examPeriodEnd: '',
                              },
                            });
                          }
                        }}
                        placeholder="请选择考核时间"
                      />
                    </Col>
                  </Row>
                </InputGroup>
              ) : (
                <Input disabled placeholder="请先选择考核周期" />
              )}
            </Field>

            <Field
              name="examTmplId"
              label="考核模板"
              decorator={{
                initialValue: formData.examTmplId || undefined,
              }}
              style={{ marginBottom: '8px' }}
            >
              <Selection
                className="x-fill-100"
                source={examTmplList}
                transfer={{ key: 'id', code: 'id', name: 'tmplName' }}
                dropdownMatchSelectWidth={false}
                showSearch
                placeholder="请选择考核模板"
                onChange={e => {
                  if (!firstSelect) {
                    if (e) {
                      dispatch({
                        type: `${DOMAIN}/queryTempDetail`,
                        payload: {
                          id: e,
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          firstSelect: 1,
                        },
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          pointEntityList: [],
                          gradeEntityList: [],
                          firstSelect: 0,
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          evalScore: [null, null],
                          examTmplId: null,
                        },
                      });
                    }
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { examTmplId: e },
                    });
                  } else {
                    createConfirm({
                      content: '分数上下限，考核点，考核结果等级将被全部替换，是否继续？',
                      onCancel: () => {
                        const { examTmplId } = formData;
                        setFieldsValue({
                          examTmplId,
                        });
                      },
                      onOk: () => {
                        if (e) {
                          dispatch({
                            type: `${DOMAIN}/queryTempDetail`,
                            payload: {
                              id: e,
                            },
                          });
                        } else {
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              pointEntityList: [],
                              gradeEntityList: [],
                              firstSelect: 0,
                            },
                          });
                          dispatch({
                            type: `${DOMAIN}/updateForm`,
                            payload: {
                              evalScore: [null, null],
                              examTmplId: null,
                            },
                          });
                        }
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { examTmplId: e },
                        });
                      },
                    });
                  }
                }}
              />
            </Field>
            <FieldLine label="考核结果审批人" required>
              <Field
                name="relatedRole"
                decorator={{
                  initialValue: formData.relatedRole || undefined,
                  rules: [{ required: true, message: '考核角色' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection
                  source={udcList.filter(v => v.sphd2 === 'EXAM_CFM')}
                  className="tw-field-group-field"
                  placeholder="考核角色"
                  onChange={e => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        resId: undefined,
                      },
                    });
                    setFieldsValue({
                      resId: undefined,
                    });
                  }}
                />
              </Field>
              <Field
                name="resId"
                decorator={{
                  initialValue: formData.resId || undefined,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={resData}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  placeholder={
                    formData.relatedRole !== 'ASSIGN_RES'
                      ? '系统自动生成'
                      : `请选择考核${pageFieldJsonRange.resId.displayName}`
                  }
                  disabled={formData.relatedRole !== 'ASSIGN_RES'}
                />
              </Field>
            </FieldLine>
            <Field
              name="evalScore"
              label="分数下限/上限"
              decorator={{
                initialValue: formData.evalScore || ['', ''],
                rules: [
                  { required: true, message: '请输入分数下限/上限' },
                  {
                    validator: (rule, value, callback) => {
                      const BEFORE = value[0];
                      const AFTER = value[1];
                      BEFORE < AFTER ? callback() : callback('分数上限必须大于分数下限');
                    },
                  },
                ],
              }}
            >
              <ScopeInput />
            </Field>
            <Field
              name="examDesc"
              label="考核说明"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.examDesc || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入考核说明" />
            </Field>
          </FieldList>

          <Divider dashed />
          <Temp form={form} />

          <Divider dashed />
          <FieldList
            name="examEval"
            legend="考核评定"
            layout="horizontal"
            // getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <EditableDataTable style={{ width: 800 }} {...examEvalTableProps} />
          </FieldList>
          <Divider dashed />
          <FieldList
            name="examCheck"
            legend="可查看考核明细"
            layout="horizontal"
            // getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <EditableDataTable style={{ width: 800 }} {...examCheckTableProps} />
          </FieldList>
          <Divider dashed />
          <FieldList
            name="examScope"
            legend="考核范围"
            layout="horizontal"
            // getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <Row gutter={8} align="middle" type="flex">
              <Col span={14}>
                <DataTable {...checkScope} />
              </Col>
              <Col span={2}>
                <Button
                  type="primary"
                  onClick={() => {
                    if (isEmpty(checkResData)) {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: { checkResData: selectedData },
                      });
                    } else {
                      selectedData.forEach(v => {
                        const tt = checkResData.filter(item => item.resId === v.resId);
                        if (!tt.length) {
                          checkResData.push(v);
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { checkResData },
                          });
                        }
                      });
                    }
                    dispatch({
                      type: `${DOMAIN}/updatcheckScopeSearchForm`,
                      payload: {
                        selectedRowKeys: [],
                      },
                    });
                  }}
                >
                  添加
                  <Icon type="double-right" />
                </Button>
              </Col>
              <Col span={8}>
                {/* <Row gutter={8} align="middle" type="flex">
                  <Col span={16} offset={2}>
                    <Selection.Columns
                      className="x-fill-100"
                      value={checkResFormData.resId || undefined}
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      placeholder="请选择考核资源"
                      onChange={value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            checkResFormData: {
                              resId: value,
                            },
                          },
                        });
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Button
                      type="primary"
                      onClick={() => {
                        if (!checkResData.filter(v => v.resId === checkResFormData.resId).length) {
                          checkResData.push(
                            checkScopeList.filter(v => v.resId === checkResFormData.resId)[0]
                          );
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              checkResData,
                              checkResFormData: {
                                resId: undefined,
                              },
                            },
                          });
                        } else {
                          createMessage({ type: 'warn', description: '该资源已添加,请勿重复添加' });
                        }
                        // dispatch({
                        //   type: `${DOMAIN}/updateState`,
                        //   payload: {
                        //     checkResData,
                        //     checkResFormData: {
                        //       addRes: {},
                        //     },
                        //     checkResSelect: checkResSelect.filter(v => !checkResData.includes(v)),
                        //   },
                        // });
                      }}
                    >
                      添加
                    </Button>
                  </Col>
                </Row> */}
                <DataTable {...checkRes} />
              </Col>
            </Row>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckCreate;
