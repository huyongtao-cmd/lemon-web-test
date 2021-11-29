/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
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
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { genFakeId, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import ResType from '@/pages/gen/field/resType';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import Temp from './Temp';
import ScopeInput from '../component/ScopeInput';

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
        formData: {},
        detailExamResList: [],
        detailExamResTotal: 0,
      },
    });
    dispatch({ type: `${DOMAIN}/getYearList` }); // 获取考核年度，前端在自己生成前三年后一年
    dispatch({ type: `${DOMAIN}/getExamTmpl` }); // 获取已启用的考核模板
    // dispatch({ type: `${DOMAIN}/examRes` }); // 获取考核资源
    dispatch({ type: `${DOMAIN}/bu` }); // 获取考核资源
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
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    // 页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_INSERT' },
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
      !(_refresh === '0') &&
        this.fetchData({
          offset: 0,
          limit: 10,
          sortBy: 'id',
          sortDirection: 'DESC',
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

  fetchData = params => {
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
        gradeEntityList,
        pointEntityList,
        pageConfig,
      },
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentEvaluationConfig = [];
    let currentDetailConfig = [];
    let currentRangeConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_EVAL') {
        currentEvaluationConfig = view; // 考核评定区域
      } else if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_DETAIL') {
        currentDetailConfig = view; // 考核明细区域
      } else if (view.blockKey === 'PERFORMANCE_EXAM_INSERT_SCOPE') {
        currentRangeConfig = view; // 考核范围区域
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
        {
          title: '考核角色',
          dataIndex: 'relatedRole',
          width: '30%',
          required: true,
          render: (value, row, index) => (
            <Selection
              value={value || undefined}
              source={udcList.filter(v => v.sphd1 === 'EXAM_EVAL')}
              className="tw-field-group-field"
              placeholder="请选择考核角色"
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
        {
          title: '权重', // 初始化 填写
          dataIndex: 'weight',
          width: '40%',
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
                placeholder="请输入权重"
              />
              <span> %</span>
            </>
          ),
        },
      ].filter(Boolean),
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
        {
          title: '考核角色',
          dataIndex: 'relatedRole',
          width: '50%',
          required: true,
          render: (value, row, index) => (
            <Selection
              value={value || undefined}
              source={udcList.filter(v => v.sphd3 === 'EXAM_CHECK')}
              className="tw-field-group-field"
              placeholder="请选择考核角色"
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
      ].filter(Boolean),
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
              source={baseBuData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
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
      ].filter(Boolean),
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
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
        },
        pageFieldJsonRange.resType.visibleFlag && {
          title: `${pageFieldJsonRange.resType.displayName}`,
          dataIndex: 'resType1Name',
          align: 'center',
          sortNo: `${pageFieldJsonRange.resType.sortNo}`,
        },
        {
          title: '入职时间',
          dataIndex: 'enrollDate',
          align: 'center',
          width: 100,
        },
      ].filter(Boolean),
      leftButtons: [],
    };

    const checkRes = {
      title: () => (
        <span style={{ color: '#284488' }}>
          考核资源
          {checkResData.length}
          (人)
        </span>
      ),
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
        pageFieldJsonRange.resId.visibleFlag && {
          title: `${pageFieldJsonRange.buId.displayName}`,
          dataIndex: 'buName',
          align: 'center',
          sortNo: `${pageFieldJsonRange.buId.sortNo}`,
        },
      ].filter(Boolean),
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
      leftButtons: [],
    };

    return (
      <Card
        className="tw-card-adjust"
        style={{ marginTop: '6px' }}
        title={<Title icon="profile" text="绩效考核详情" />}
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
            style={{ marginBottom: '5px' }}
          >
            <Selection
              className="x-fill-100"
              source={examTmplList}
              transfer={{ key: 'id', code: 'id', name: 'tmplName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder="请选择考核模板"
              onChange={e => {
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
              }}
            />
          </Field>
          <FieldLine label="考核结果确认" required>
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
    );
  }
}

export default PrefCheckCreate;
