import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Divider, Tooltip, InputNumber, Switch, Row, Col, Radio } from 'antd';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Selection } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { add, genFakeId } from '@/utils/mathUtils';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import ViewDetail from './ViewDetail';
import TaskOne from './TaskOne';

const { Field, FieldLine } = FieldList;

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
    if (value || value === 0) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class PrefCheckFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      othersColumns: [],
      nowTitle: '绩效考核',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      prefCheckFlow: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(() => {
      id &&
        dispatch({
          type: `${DOMAIN}/queryFolwDetail`,
          payload: { id },
        }).then(res => {
          if (!isEmpty(res)) {
            // 处理多人评分数据格式-处理表头
            const { resFinallyViews = [] } = res[0];
            if (!isEmpty(resFinallyViews)) {
              const tt = [];
              resFinallyViews.forEach((v, index) => {
                tt.push({
                  title: `评分(${v.evalResIdName || ''}-${v.evalWeight || ''}%)`,
                  align: 'center',
                  dataIndex: `evalScore${index}`,
                  width: 100,
                });
              });
              resFinallyViews.forEach((v, index) => {
                tt.push({
                  title: `评语(${v.evalResIdName || ''})`,
                  dataIndex: `evalComment${index}`,
                  width: 200,
                  render: (value, row) =>
                    value && value.length > 15 ? (
                      <Tooltip placement="left" title={value}>
                        <pre>{`${value.substr(0, 15)}...`}</pre>
                      </Tooltip>
                    ) : (
                      <pre>{value}</pre>
                    ),
                });
              });
              this.setState(
                {
                  othersColumns: tt,
                },
                () => {
                  // 处理多人评分数据格式-处理表格数据
                  res.forEach((v, i) => {
                    const { resFinallyViews: resFinallyViewsList } = v;
                    resFinallyViewsList.forEach((item, index) => {
                      if (item.poinType === '2') {
                        if (item.evalScoreFlag === '1') {
                          // eslint-disable-next-line no-param-reassign
                          v[`evalScore${index}`] = '达成';
                        }
                        if (item.evalScoreFlag === '0') {
                          // eslint-disable-next-line no-param-reassign
                          v[`evalScore${index}`] = '未达成';
                        }
                        // eslint-disable-next-line no-param-reassign
                        v[`evalComment${index}`] = item.evalComment;
                      } else if (item.poinType === '3') {
                        // eslint-disable-next-line no-param-reassign
                        v[`evalScore${index}`] = `-${item.evalScore}`;
                        // eslint-disable-next-line no-param-reassign
                        v[`evalComment${index}`] = item.evalComment;
                      } else {
                        // eslint-disable-next-line no-param-reassign
                        v[`evalScore${index}`] = item.evalScore;
                        // eslint-disable-next-line no-param-reassign
                        v[`evalComment${index}`] = item.evalComment;
                      }
                    });
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      examTmplPointViewList: res,
                    },
                  });
                }
              );
            }
          }
        });
      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(res => {
            const { taskKey: value } = res;
            if (value === 'ACC_A45_02_RES_APPR_b') {
              this.setState({
                nowTitle: '绩效考核-自评',
              });
            } else if (value === 'ACC_A45_03_BU_RES_b') {
              this.setState({
                nowTitle: '绩效考核',
              });
            } else if (value === 'ACC_A45_04_BU_CFM_b') {
              this.setState({
                nowTitle: '绩效考核-考核结果确认',
              });
            }
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {
                buttons: [],
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
      dispatch({ type: `${DOMAIN}/res` });
      dispatch({ type: `${DOMAIN}/bu` });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_DETAIL' },
      });
    });
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

  // 自评表格行编辑触发事件
  onPointEvalChanged = (index, value, name) => {
    const {
      prefCheckFlow: { examTmplPointViewList },
      dispatch,
    } = this.props;

    const newDataSource = examTmplPointViewList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { examTmplPointViewList: newDataSource },
    });
  };

  renderPage = () => {
    const {
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      prefCheckFlow: { formData, pageConfig },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig1 = [];
    let currentListConfig2 = [];
    let currentListConfig3 = [];
    pageBlockViews.forEach(view => {
      if (
        view.tableName === 'T_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB1'
      ) {
        // 绩效考核结果详情
        currentListConfig1 = view;
      } else if (
        view.tableName === 'T_RES_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_MAIN'
      ) {
        currentListConfig2 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM_RANGE' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB2'
      ) {
        currentListConfig3 = view;
      }
    });
    const { pageFieldViews: pageFieldViewsList1 } = currentListConfig1;
    const { pageFieldViews: pageFieldViewsList2 } = currentListConfig2;
    const { pageFieldViews: pageFieldViewsList3 } = currentListConfig3;

    const pageFieldJsonList = {};
    if (pageFieldViewsList1) {
      pageFieldViewsList1.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList2) {
      pageFieldViewsList2.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList3) {
      pageFieldViewsList3.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldJsonList) {
      let fields = [];
      fields = [
        <Field
          name="examName"
          label={pageFieldJsonList.examName.displayName}
          decorator={{
            initialValue: formData.examName || '',
          }}
          key="examName"
          sortNo={pageFieldJsonList.examName.sortNo}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
        <Field
          name="examCycleName"
          label="考核期间"
          decorator={{
            initialValue:
              `${formData.examPeriodStart || ''}${
                formData.examPeriodStart ? '-' : ''
              }${formData.examPeriodEnd || ''}` || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,

        <Field
          name="resName"
          label="考核资源"
          decorator={{
            initialValue: formData.resName || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
        <Field
          name="typeName"
          label={pageFieldJsonList.resType.displayName}
          sortNo={pageFieldJsonList.resType.sortNo}
          key="resType"
          decorator={{
            initialValue: formData.typeName || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
        <Field
          name="buName"
          key="buId"
          label={pageFieldJsonList.buId.displayName}
          sortNo={pageFieldJsonList.buId.sortNo}
          decorator={{
            initialValue: formData.buName || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
        <Field
          name="coopType"
          label="合作方式"
          decorator={{
            initialValue: formData.coopType || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
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
          <Input.TextArea disabled rows={3} placeholder="请输入考核说明" />
        </Field>,
        <Field
          name="applyResIdName"
          label="考核发起人"
          decorator={{
            initialValue: formData.applyResIdName || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
        <Field
          name="applyDate"
          label="考核发起时间"
          decorator={{
            initialValue: formData.applyDate || '',
          }}
        >
          <Input disabled placeholder="系统自动生成" />
        </Field>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJsonList[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }
    return null;
  };

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      prefCheckFlow: { formData, flowForm, fieldsConfig, examTmplPointViewList, pageConfig },
    } = this.props;
    const { othersColumns, nowTitle } = this.state;
    const {
      panels: { disabledOrHidden },
      taskKey,
      buttons,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    const selfEvalTableProps = {
      sortBy: 'id',
      rowKey: 'did',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dataSource: examTmplPointViewList,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      readOnly: true,
      showCopy: false,
      showAdd: false,
      columns: [
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'pointUdcName',
          width: '15%',
        },
        {
          title: '评分类型',
          align: 'center',
          dataIndex: 'poinTypeName',
          width: '15%',
        },
        {
          title: '评分标准',
          align: 'left',
          dataIndex: 'standardDesc',
          width: '15%',
          render: value => <pre>{value}</pre>,
        },
        {
          title: '系统统计',
          dataIndex: 'sysExam',
          width: '30%',
        },
        {
          title: '自评说明',
          dataIndex: 'selfEval',
          width: '25%',
          required: true,
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.selfEval || ''}
              onChange={e => {
                this.onPointEvalChanged(index, e.target.value, 'selfEval', row);
              }}
            />
          ),
        },
      ],
    };

    const examDetailTableProps = {
      sortBy: 'id',
      rowKey: 'did',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dataSource: examTmplPointViewList,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      readOnly: true,
      showCopy: false,
      showAdd: false,
      columns: [
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'pointUdcName',
          width: '10%',
        },
        {
          title: '评分类型',
          align: 'center',
          dataIndex: 'poinTypeName',
          width: '10%',
        },
        {
          title: '评分标准',
          align: 'center',
          dataIndex: 'standardDesc',
          width: '10%',
        },
        {
          title: '考核点权重',
          align: 'center',
          dataIndex: 'weight',
          width: '10%',
          render: (value, row, index) =>
            row.poinType !== '2' && row.poinType !== '3' ? `${value}%` : '',
        },
        {
          title: '系统统计',
          dataIndex: 'sysExam',
          width: '15%',
        },
        {
          title: '自评说明',
          dataIndex: 'selfEval',
          width: '10%',
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: `评分(${!isNil(formData.scoreMin) ? formData.scoreMin : ''}~${
            !isNil(formData.scoreMax) ? formData.scoreMax : ''
          })`,
          dataIndex: 'evalScore',
          required: true,
          width: '15%',
          render: (value, row, index) =>
            row.poinType === '2' ? (
              <Row type="flex" align="middle">
                <Col span={12}>
                  <span>是否达标:</span>
                </Col>
                <Col span={12}>
                  <Selection.UDC
                    value={
                      // eslint-disable-next-line no-nested-ternary
                      row.evalScoreFlag === '1'
                        ? 'YES'
                        : row.evalScoreFlag === '0'
                          ? 'NO'
                          : undefined
                    }
                    code="COM:YESNO"
                    placeholder="请选择是否达标"
                    onChange={e => {
                      const parmas = e === 'YES' ? '1' : '0';
                      this.onPointEvalChanged(index, parmas, 'evalScoreFlag', row);
                    }}
                  />
                </Col>
              </Row>
            ) : (
              <InputNumber
                className="x-fill-100"
                value={value}
                min={0}
                max={formData.scoreMax}
                onChange={e => {
                  this.onPointEvalChanged(index, e, 'evalScore', row);
                }}
                {...(row.poinType === '3' && !isNil(value)
                  ? {
                      formatter: v => `-${v}`,
                      parser: v => v.replace('-', ''),
                    }
                  : {})}
              />
            ),
        },
        {
          title: '评语',
          dataIndex: 'evalComment',
          width: '20%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onPointEvalChanged(index, e.target.value, 'evalComment', row);
              }}
            />
          ),
        },
      ],
    };

    const examResultTableProps = {
      sortBy: 'id',
      rowKey: 'did',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      scroll: { x: 880 + (othersColumns.length / 2) * 300 },
      columns: [
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'pointUdcName',
          width: 150,
        },
        {
          title: '评分类型',
          align: 'center',
          dataIndex: 'poinTypeName',
          width: 150,
        },
        {
          title: '考核点权重',
          align: 'center',
          dataIndex: 'weight',
          width: 100,
          render: (value, row, index) =>
            row.poinType !== '2' && row.poinType !== '3' && row.pointUdcName !== '最终得分'
              ? `${value || ''}%`
              : '-',
        },
        {
          title: '系统统计',
          dataIndex: 'sysExam',
          width: 200,
        },
        {
          title: '自评说明',
          dataIndex: 'selfEval',
          width: 200,
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        // {
        //   title: '最终得分',
        //   dataIndex: 'finalScore',
        //   align: 'center',
        //   width: 100,
        // },
        ...othersColumns,
      ],
    };

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
                  if (taskKey === 'ACC_A45_03_BU_RES_b') {
                    dispatch({
                      type: `${DOMAIN}/examineByThreeRq`,
                      payload: {
                        taskId,
                        remark,
                        result: key,
                      },
                    });
                    return Promise.resolve(false);
                  }
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                    branch,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      if (response && response.ok) {
                        createMessage({ type: 'success', description: '操作成功' });
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      } else {
                        createMessage({
                          type: 'error',
                          description: response.reason || '流程拒绝失败',
                        });
                      }
                    }
                    return Promise.resolve(false);
                  });
                  return Promise.resolve(false);
                },
              });
            }

            if (key === 'APPROVED' || key === 'APPLIED') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (taskKey === 'ACC_A45_01_SUBMIT_i') {
                    const {
                      prefCheckFlow: {
                        formData,
                        relatedEntityListExamEval,
                        relatedEntityListExamCheck,
                        checkResData,
                        gradeEntityList,
                        pointEntityList,
                      },
                    } = this.props;
                    const { examCycle, examDate, year, relatedRole, resId, evalScore } = formData;

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
                        const repeatArr = pointEntityList.filter(
                          obj => obj.pointName === item.pointName
                        );
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
                      if (
                        pointEntityList.filter(v => v.poinType !== '2' && v.poinType !== '3')
                          .length >= 2
                      ) {
                        const tt = pointEntityList.filter(v => isNil(v.weight));
                        if (tt.length) {
                          createMessage({ type: 'warn', description: '常规考核点权重必填' });
                          return;
                        }
                        const allWeight = pointEntityList.reduce(
                          (x, y) => add(x, Number(y.weight)),
                          0
                        );
                        if (allWeight !== 100) {
                          createMessage({
                            type: 'warn',
                            description: '常规考核点权重总和必须等于100%',
                          });
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
                        createMessage({
                          type: 'warn',
                          description: '请补全考核结果等级所有必填信息',
                        });
                        return;
                      }

                      // 考核结果等级最后一条必须到达100%
                      const lastRatio = gradeEntityList[gradeEntityList.length - 1].ratio;
                      if (!isEmpty(gradeEntityList) && lastRatio !== 100) {
                        createMessage({
                          type: 'warn',
                          description: '考核结果等级最后一条必须到达100%',
                        });
                        return;
                      }

                      // 考核结果等级的等级名称不能重复
                      let repeatNum = 0;
                      // eslint-disable-next-line no-restricted-syntax
                      for (const item of gradeEntityList) {
                        const repeatArr = gradeEntityList.filter(
                          obj => obj.gradeName === item.gradeName
                        );
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
                        relatedEntityListExamEval.filter(
                          v => v.relatedRole === 'ASSIGN_RES' && !v.resId
                        )
                      )
                    ) {
                      createMessage({ type: 'warn', description: '请选择考核指定资源' });
                      return;
                    }

                    // 考核评定多于一条时，权重必填且和为100%，不包括一票否决制和扣分制
                    if (relatedEntityListExamEval.length >= 2) {
                      if (
                        relatedEntityListExamEval
                          .filter(v => v.poinType !== '2' && v.poinType !== '3')
                          .filter(v => !v.weight).length
                      ) {
                        createMessage({ type: 'warn', description: '多条考核评定时权重必填' });
                        return;
                      }
                      const allWeight = relatedEntityListExamEval.reduce(
                        (x, y) => add(x, Number(y.weight)),
                        0
                      );
                      if (allWeight !== 100) {
                        createMessage({
                          type: 'warn',
                          description: '多条考核评定权重总和必须等于100%',
                        });
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
                      createMessage({
                        type: 'warn',
                        description: '请填写可查看考核明细的考核角色',
                      });
                      return;
                    }
                    if (
                      !isEmpty(
                        relatedEntityListExamCheck.filter(
                          v => v.relatedRole === 'ASSIGN_RES' && !v.resId
                        )
                      )
                    ) {
                      createMessage({ type: 'warn', description: '请选择考核指定资源' });
                      return;
                    }

                    //  第一节点处理考核模板信息
                    if (Array.isArray(evalScore) && !isNil(evalScore[0]) && !isNil(evalScore[1])) {
                      [formData.scoreMin, formData.scoreMax] = evalScore;
                    }
                    formData.gradeEntityList = gradeEntityList;
                    formData.pointEntityList = pointEntityList;
                  }

                  const {
                    prefCheckFlow: {
                      // eslint-disable-next-line no-shadow
                      formData,
                      relatedEntityListExamEval,
                      relatedEntityListExamCheck,
                      checkResData,
                      // eslint-disable-next-line no-shadow
                      examTmplPointViewList,
                      gradeEntityList,
                      pointEntityList,
                    },
                  } = this.props;

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

                  if (taskKey === 'ACC_A45_02_RES_APPR_b') {
                    const tt = examTmplPointViewList.filter(
                      v => isNil(v.selfEval) || isEmpty(v.selfEval)
                    );
                    if (tt.length) {
                      createMessage({
                        type: 'warn',
                        description: `请补全${tt[0].pointUdcName}的自评说明项`,
                      });
                      return;
                    }
                  }

                  if (taskKey === 'ACC_A45_03_BU_RES_b') {
                    const tt = examTmplPointViewList
                      .filter(v => v.poinType !== '2')
                      .filter(v => isNil(v.evalScore) || isEmpty(v.evalScore));
                    if (tt.length) {
                      createMessage({ type: 'warn', description: '请补全考核明细的评分项' });
                      return;
                    }

                    const tt1 = examTmplPointViewList.filter(
                      v => v.poinType === '2' && !v.evalScoreFlag
                    );
                    if (tt1.length) {
                      createMessage({
                        type: 'warn',
                        description: '一票否决制评分请选择是否达标！',
                      });
                      return;
                    }

                    dispatch({
                      type: `${DOMAIN}/examineByThree`,
                      payload: {
                        taskId,
                        payload: {
                          ...formData,
                          taskId,
                          remark,
                          result: key,
                        },
                        scoreEntityList: examTmplPointViewList,
                      },
                    });
                  } else if (taskKey === 'ACC_A45_04_BU_CFM_b') {
                    dispatch({
                      type: `${DOMAIN}/examineByFour`,
                      payload: {
                        taskId,
                        payload: {
                          taskId,
                          remark,
                          result: key,
                        },
                        resPerformanceExamView: formData,
                        scoreEntityList: examTmplPointViewList,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        ...formData,
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    });
                  }
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && taskKey === 'ACC_A45_01_SUBMIT_i' && <TaskOne />}
          {mode === 'edit' &&
            taskKey !== 'ACC_A45_01_SUBMIT_i' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={<Title icon="profile" text={nowTitle} />}
                bordered={false}
              >
                {this.renderPage()}
                {/* <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="examName"
                    label="考核名称"
                    decorator={{
                      initialValue: formData.examName || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="examCycleName"
                    label="考核期间"
                    decorator={{
                      initialValue:
                        `${formData.examPeriodStart || ''}${
                          formData.examPeriodStart ? '-' : ''
                        }${formData.examPeriodEnd || ''}` || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>

                  <Field
                    name="resName"
                    label="考核资源"
                    decorator={{
                      initialValue: formData.resName || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="typeName"
                    label="资源类型"
                    decorator={{
                      initialValue: formData.typeName || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="buName"
                    label="BU"
                    decorator={{
                      initialValue: formData.buName || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="coopType"
                    label="合作方式"
                    decorator={{
                      initialValue: formData.coopType || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
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
                    <Input.TextArea disabled rows={3} placeholder="请输入考核说明" />
                  </Field>
                  <Field
                    name="applyResIdName"
                    label="考核发起人"
                    decorator={{
                      initialValue: formData.applyResIdName || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="applyDate"
                    label="考核发起时间"
                    decorator={{
                      initialValue: formData.applyDate || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                </FieldList> */}
                {hasIn('selfEvalList', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <FieldList legend="自评" getFieldDecorator={getFieldDecorator} col={2}>
                      <EditableDataTable {...selfEvalTableProps} />
                    </FieldList>
                  </>
                )}
                {hasIn('examDetail', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <FieldList
                      legend="考核明细"
                      getFieldDecorator={getFieldDecorator}
                      col={2}
                      noReactive
                    >
                      <EditableDataTable {...examDetailTableProps} />
                    </FieldList>
                  </>
                )}
                {hasIn('examResult', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <FieldList legend="考核结果" getFieldDecorator={getFieldDecorator} col={2}>
                      <Field
                        name="result"
                        label="综合得分/等级(参考)"
                        decorator={{
                          initialValue: formData.gradeExamScore || '',
                        }}
                      >
                        <Input disabled placeholder="系统自动生成" />
                      </Field>
                      {/* <Field
                        name="person"
                        label="考核评定人数"
                        decorator={{
                          initialValue: formData.countType || '',
                        }}
                      >
                        <Input disabled placeholder="系统自动生成" />
                      </Field> */}
                    </FieldList>
                    <DataTable {...examResultTableProps} dataSource={examTmplPointViewList} />
                    <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                      <FieldLine label="综合得分/等级" required>
                        <Field
                          name="gradeScoreFiy"
                          decorator={{
                            initialValue: formData.gradeScoreFiy || '',
                          }}
                          wrapperCol={{ span: 23, xxl: 23 }}
                        >
                          <InputNumber
                            className="x-fill-100"
                            onBlur={e => {
                              if (!isNil(e.target.value) && !isEmpty(e.target.value)) {
                                dispatch({
                                  type: `${DOMAIN}/gradeExam`,
                                  payload: {
                                    id: formData.eid,
                                    score: e.target.value,
                                  },
                                });
                              }
                            }}
                            min={formData.scoreMin || 0}
                            max={formData.scoreMax || 100}
                            placeholder="综合得分/等级"
                          />
                        </Field>
                        <Field
                          name="gradeExamFiy"
                          decorator={{
                            initialValue: formData.gradeExamFiy || '',
                          }}
                          wrapperCol={{ span: 23, xxl: 23 }}
                        >
                          <Input disabled placeholder="系统自动生成" />
                        </Field>
                        <Field
                          name="gradeExamFiy1"
                          decorator={{
                            initialValue: formData.gradeExamFiy || '',
                          }}
                          wrapperCol={{ span: 23, xxl: 23 }}
                        >
                          <span>{`(${formData.scoreMin || 0}~${formData.scoreMax || 100})分`}</span>
                        </Field>
                      </FieldLine>
                      <Field
                        name="gradeExplain"
                        label="最终评分说明"
                        decorator={{
                          initialValue: formData.gradeExplain || '',
                        }}
                        fieldCol={1}
                        labelCol={{ span: 4, xxl: 3 }}
                        wrapperCol={{ span: 19, xxl: 20 }}
                      >
                        <Input.TextArea rows={3} placeholder="请输入最终评分说明" />
                      </Field>
                    </FieldList>
                  </>
                )}
              </Card>
            )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlow;
