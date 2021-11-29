/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Input,
  Form,
  Button,
  Progress,
  Switch,
  Card,
  Icon,
  InputNumber,
  Table,
  Divider,
  Tabs,
} from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, isNil } from 'ramda';
import { selectUsersWithBu, selectInternalOus } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { genFakeId, mul, div, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import GradeType from './component/GradeType';
import GradeTypeView from './component/GradeTypeView';

const { Field, FieldLine } = FieldList;
const { TabPane } = Tabs;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const activityColumns = [
  { dataIndex: 'actNo', title: '编号', span: 8 },
  { dataIndex: 'actName', title: '名称', span: 16 },
];

const DOMAIN = 'targetMgmtReview';

@connect(({ loading, targetMgmtReview, user, gradeType, dispatch }) => ({
  targetMgmtReview,
  user,
  gradeType,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { keyresultName, keyresultWeight, keyresultDesc } = changedValues;
    if (!isNil(keyresultName) || !isNil(keyresultWeight) || !isNil(keyresultDesc)) {
      return;
    }

    const { publicTag } = changedValues;
    if (!isNil(publicTag)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          publicTag: publicTag ? 'true' : 'false',
        },
      });
      return;
    }

    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class TargetMgmtReview extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    taskId && dispatch({ type: `${DOMAIN}/fetchConfig`, payload: taskId });
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryImplementList`,
        payload: {
          limit: 0,
          sortBy: 'id',
          sortDirection: 'DESC',
        },
      });
      dispatch({
        type: `${DOMAIN}/queryObjectiveSupList`,
      });
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: {
            id,
          },
        }).then(ress => {
          const {
            targetMgmtReview: {
              objectiveProgList,
              formData: { supObjectiveId },
            },
          } = this.props;
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              supObjectiveMsg: !isEmpty(objectiveProgList.filter(v => v.id === supObjectiveId))
                ? objectiveProgList.filter(v => v.id === supObjectiveId)[0]
                : {},
            },
          });
          // dispatch({
          //   type: `${DOMAIN}/isPre`,
          //   payload: {
          //     resId: ress.objectiveResId,
          //   },
          // });
        });
    });
  }

  // 如果有关键结果KR，内容必填，而且权重之和等于100%
  keyresultListMustFill = () => {
    const {
      targetMgmtReview: { keyresultList },
    } = this.props;

    // 关键结果KR所有信息必填
    const tt = keyresultList.filter(
      v =>
        isNil(v.keyresultName) ||
        isNil(v.keyresultWeight) ||
        isNil(v.keyresultDesc) ||
        isNil(v.keyresultType) ||
        isNil(v.curProg) ||
        ((v.keyresultType !== 'tag' && isNil(v.iniValue)) ||
          (v.keyresultType !== 'tag' && isNil(v.objValue)))
    );
    if (tt.length) {
      createMessage({ type: 'warn', description: '请填写关键结果KR的所有信息' });
      return false;
    }

    if (!isEmpty(keyresultList)) {
      // 关键结果KR权重总和必须等于100%
      const allWeight = keyresultList.reduce((x, y) => add(x, Number(y.keyresultWeight)), 0);
      if (allWeight !== 100) {
        createMessage({ type: 'warn', description: '关键结果KR权重总和必须等于100%' });
        return false;
      }
    }

    const noKrGrade = keyresultList.filter(v => !v.gradeType && (isEmpty(v.krGrade) || !v.krGrade));
    if (!isEmpty(keyresultList) && noKrGrade.length) {
      // 关键结果KR必须设置打分规则
      createMessage({
        type: 'warn',
        description: `请设置关键结果KR${noKrGrade[0].keyresultName}的打分规则`,
      });
      return false;
    }

    return true;
  };

  // 关键行动KA必填信息校验
  keyresultWorkPlanListMustFill = () => {
    const {
      targetMgmtReview: { keyresultWorkPlanList },
    } = this.props;

    // 关键结果所有信息必填
    const tt = keyresultWorkPlanList.filter(
      v => isNil(v.workPlanName) || isNil(v.startDate) || isNil(v.endDate) || isNil(v.relevantResId)
    );
    if (tt.length) {
      createMessage({ type: 'warn', description: '请填写关键行动KA的必填信息' });
      return false;
    }
    return true;
  };

  // 行编辑触发事件 - 关键结果KR
  onCellChanged = (index, value, name) => {
    const {
      targetMgmtReview: { keyresultList },
      dispatch,
    } = this.props;

    const newDataSource = keyresultList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { keyresultList: newDataSource },
    });
  };

  // 行编辑触发事件 - 关键行动KA
  onWorkPlanCellChanged = (index, value, name) => {
    const {
      targetMgmtReview: { keyresultWorkPlanList },
      dispatch,
    } = this.props;

    const newDataSource = keyresultWorkPlanList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { keyresultWorkPlanList: newDataSource },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue, validateFieldsAndScroll, getFieldValue },
      targetMgmtReview: {
        fieldsConfig,
        flowForm,
        formData,
        implementList,
        objectiveProgList,
        keyresultList,
        keyresultListDel,
        keyresultWorkPlanList,
        keyresultWorkPlanListDel,
      },
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
      user: {
        user: { extInfo },
      },
    } = this.props;
    const { visible } = this.state;

    const submitBtn = loading.effects[`${DOMAIN}/submit`];

    const setGradeTypeFlag = !(
      (!isNil(extInfo) && extInfo.resId === Number(formData.supObjectiveMsg.objectiveResId)) ||
      formData.isPres
    );

    const { mode } = fromQs();
    return (
      <PageHeaderWrapper>
        {// ((!isNil(extInfo) && extInfo.resId === Number(formData.supObjecttveResId)) ||
        //   formData.isPres) &&
        mode === 'edit' ? (
          <GradeType
            onChange={v => {
              if (v) {
                this.onCellChanged(gradeTypeFormData.index, gradeTypeList, 'krGrade');
                this.onCellChanged(
                  gradeTypeFormData.index,
                  gradeTypeFormData.gradeType,
                  'gradeType'
                );
                this.onCellChanged(gradeTypeFormData.index, gradeTypeListDel, 'deleteGradeKeys');
                if (gradeTypeFormData.gradeType === 'LINEAR') {
                  this.onCellChanged(gradeTypeFormData.index, [{ gradeType: 'LINEAR' }], 'krGrade');
                }
              }
              this.toggleVisible();
            }}
            visible={visible}
          />
        ) : (
          <GradeTypeView
            onChange={v => {
              this.toggleVisible();
            }}
            visible={visible}
          />
        )}

        <BpmWrapper
          fieldsConfig={fieldsConfig} // 获取json文件配置信息
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          // eslint-disable-next-line consistent-return
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, cc, branch } = bpmForm;
            const { taskKey } = fieldsConfig;
            const { key } = operation;
            const { id, taskId, prcId, from } = fromQs();
            const flow = {};
            flow.taskId = taskId;
            flow.branch = branch;
            flow.remark = remark;
            flow.ccCrowd = cc;
            flow.worker = '';
            flow.result = 'APPROVED';
            if (key === 'FLOW_PASS' || key === 'FLOW_COMMIT') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  const obj = {
                    ...formData,
                    flow,
                    twOkrKeyresultEnetity: keyresultList,
                    deleteGradeKeys: keyresultListDel.join(','),
                    isPublish: 'publish',
                    rangeBu: formData.rangeBu && formData.rangeBu.join(','),
                    rangeRes: formData.rangeRes && formData.rangeRes.join(','),
                    twOkrWorkPlanEnetity: keyresultWorkPlanList,
                  };

                  if (formData.objectiveType === 'PERSON' && taskKey === 'ORG_G01_01_SUBMIT_i') {
                    // 关键结果KR不能为空
                    if (isEmpty(keyresultList)) {
                      createMessage({ type: 'warn', description: '个人目标关键结果KR不能为空' });
                      return Promise.resolve(false);
                    }
                  }

                  if (taskKey === 'ORG_G01_02_CHECK') {
                    // 关键结果KR不能为空
                    if (isEmpty(keyresultList)) {
                      createMessage({ type: 'warn', description: '关键结果KR不能为空' });
                      return Promise.resolve(false);
                    }
                  }

                  // 关键结果KR所有信息必填，权重之和必须等于100%
                  const flag = this.keyresultListMustFill();
                  if (!flag) {
                    return Promise.resolve(false);
                  }

                  // 关键行动KA所有必填信息校验
                  const keyresultFlag = this.keyresultWorkPlanListMustFill();
                  if (!keyresultFlag) {
                    return Promise.resolve(false);
                  }

                  dispatch({
                    type: `${DOMAIN}/pass`,
                    payload: obj,
                  }).then(res => {
                    if (res.ok) {
                      closeThenGoto(
                        `/okr/okrMgmt/targetMgmt/review?id=${id}&prcId=${prcId}&taskId=${taskId}&mode=view&from=${from}`
                      );
                    }
                  });
                  return Promise.resolve(false);
                }
                return Promise.resolve(false);
              });
              return Promise.resolve(false);
            }
            if (key === 'FLOW_RETURN') {
              return Promise.resolve(true);
            }
          }}
        >
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="目标维护" />}
            bordered={false}
          >
            <FieldList
              legend="目标"
              layout="horizontal"
              getFieldDecorator={getFieldDecorator}
              col={2}
            >
              <Field
                name="objectiveName"
                label="目标名称"
                decorator={{
                  initialValue: formData.objectiveName || undefined,
                  rules: [
                    {
                      required: mode !== 'view',
                      message: '请输入目标名称',
                    },
                  ],
                }}
              >
                <Input disabled={mode === 'view'} placeholder="请输入目标名称" />
              </Field>
              <Field
                name="objectiveType"
                label="目标层次"
                decorator={{
                  initialValue: formData.objectiveType || undefined,
                  rules: [
                    {
                      required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                      message: '请选择目标层次',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  disabled={
                    mode === 'view' ||
                    (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                  }
                  code="OKR:OBJ_TYPE"
                  onChange={e => {
                    // 每次切换目标层次，清除上级目标
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        supObjectiveId: undefined,
                        supObjectiveMsg: {},
                      },
                    });
                    setFieldsValue({
                      supObjectiveId: undefined,
                    });

                    if (e === 'PERSON' && !isNil(extInfo)) {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          objectiveSubject: extInfo.resId,
                          objectiveResId: extInfo.resId,
                        },
                      });
                      setFieldsValue({
                        objectiveResId: extInfo.resId,
                        objectiveSubject: extInfo.resId,
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          objectiveSubject: undefined,
                        },
                      });
                      setFieldsValue({
                        objectiveSubject: undefined,
                      });
                    }
                  }}
                  placeholder="请选择目标层次"
                />
              </Field>
              <Field
                name="objectiveSubject"
                label="目标主体"
                decorator={{
                  initialValue: Number(formData.objectiveSubject) || undefined,
                  rules: [
                    {
                      required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                      message: '请选择目标主体',
                    },
                  ],
                }}
              >
                {formData.objectiveType === 'BU' ? (
                  <Selection.ColumnsForBu
                    key={formData.objectiveType}
                    columnsCode={['code', 'name', 'ouName']}
                    resTransform={list => list.filter(v => v.inchargeResId === extInfo.resId)}
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                  />
                ) : formData.objectiveType === 'PERSON' ? (
                  <Selection.Columns
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                    key={getFieldValue('objectiveType') && formData.objectiveSubject}
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择目标主体"
                  />
                ) : formData.objectiveType === 'COMPANY' ? (
                  <Selection
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                    key="COMPANY"
                    className="x-fill-100"
                    source={() => selectInternalOus()}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择目标主体"
                  />
                ) : (
                  <Input
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                    placeholder="请先选择目标主体"
                  />
                )}
              </Field>
              <Field
                name="objectiveResId"
                label="负责人"
                decorator={{
                  initialValue: Number(formData.objectiveResId) || undefined,
                  rules: [
                    {
                      required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                      message: '请选择负责人',
                    },
                  ],
                }}
              >
                <Selection.Columns
                  disabled={
                    mode === 'view' ||
                    (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                  }
                  key={getFieldValue('objectiveType')}
                  className="x-fill-100"
                  source={() => selectUsersWithBu()}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onColumnsChange={value => {}}
                  placeholder="请选择负责人"
                  onChange={e => {
                    dispatch({
                      type: `${DOMAIN}/isPre`,
                      payload: {
                        resId: e,
                      },
                    });
                  }}
                />
              </Field>
              <Field
                name="publicTag"
                label="公开查看权限"
                decorator={{
                  initialValue: formData.publicTag === 'true',
                  rules: [
                    {
                      required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                      message: '请选择公开查看权限',
                    },
                  ],
                }}
                labelCol={{ span: 6, xxl: 6 }}
                wrapperCol={{ span: 16, xxl: 16 }}
              >
                <Switch
                  disabled={
                    mode === 'view' ||
                    (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                  }
                  checked={formData.publicTag === 'true'}
                />
              </Field>
              {formData.publicTag === 'true' ? (
                <Field
                  name="objRange"
                  label="公开范围"
                  decorator={{
                    initialValue: formData.objRange || undefined,
                    rules: [
                      {
                        required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                        message: '请选择公开范围',
                      },
                    ],
                  }}
                >
                  <Selection.UDC
                    code="OKR:OBJ_RANGE"
                    onChange={e => {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          rangeRes: [],
                          rangeBu: [],
                        },
                      });
                    }}
                    placeholder="请选择公开范围"
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                  />
                </Field>
              ) : null}
              {formData.publicTag === 'true' && formData.objRange === 'BU' ? (
                <Field
                  name="rangeBu"
                  label="公开BU"
                  decorator={{
                    initialValue: formData.rangeBu || undefined,
                    rules: [
                      {
                        required:
                          mode !== 'view' &&
                          formData.objRange === 'BU' &&
                          fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                        message: '请选择公开BU',
                      },
                    ],
                  }}
                >
                  <Selection.ColumnsForBu
                    mode="multiple"
                    columnsCode={['code', 'name', 'ouName']}
                  />
                </Field>
              ) : null}
              {formData.publicTag === 'true' && formData.objRange === 'RES' ? (
                <Field
                  name="rangeRes"
                  label="公开人员"
                  decorator={{
                    initialValue: formData.rangeRes || undefined,
                    rules: [
                      {
                        required:
                          mode !== 'view' &&
                          formData.objRange === 'RES' &&
                          fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                        message: '请选择公开人员',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    key={getFieldValue('objRange')}
                    mode="multiple"
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    limit={20}
                    placeholder="请选择公开人员"
                    disabled={
                      mode === 'view' ||
                      (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                    }
                  />
                </Field>
              ) : null}
              <Field
                name="objectiveCurProj"
                label="当前进度"
                decorator={{
                  initialValue: 0 || undefined,
                }}
              >
                <Progress
                  // 当选择数字型时，要自行算百分比
                  percent={keyresultList
                    .reduce(
                      (x, y) =>
                        x +
                        mul(
                          mul(
                            div(Number(y.keyresultWeight || 0), 100),
                            div(
                              y.keyresultType !== 'NUMBER'
                                ? Number(y.curProg || 0)
                                : mul(div(Number(y.curProg || 0), Number(y.objValue || 0)), 100),
                              100
                            )
                          ),
                          100
                        ),
                      0
                    )
                    .toFixed(2)}
                  status="active"
                  format={(percent, successPercent) => `${Math.round(percent)}%`}
                />
              </Field>
              <Field
                name="okrPeriodId"
                label="目标周期"
                decorator={{
                  initialValue: (formData.okrPeriodId && Number(formData.okrPeriodId)) || undefined,
                  rules: [
                    {
                      required: mode !== 'view',
                      message: '请选择目标周期',
                    },
                  ],
                }}
              >
                <Selection
                  className="x-fill-100"
                  source={implementList}
                  transfer={{ key: 'id', code: 'id', name: 'periodName' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onColumnsChange={value => {}}
                  placeholder="请选择目标周期"
                  disabled={mode === 'view'}
                />
              </Field>
              <Field
                name="objectiveStatus"
                label="状态"
                decorator={{
                  initialValue: formData.objectiveStatus || undefined,
                  rules: [
                    {
                      required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i',
                      message: '请选择状态',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  disabled={
                    mode === 'view' ||
                    (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i')
                  }
                  code="OKR:OB_STATUS"
                  placeholder="请选择状态"
                />
              </Field>
              {/* <Field */}
              {/* name="objectiveClass1" */}
              {/* label="目标类别" */}
              {/* decorator={{ */}
              {/* initialValue: formData.objectiveClass1 || undefined, */}
              {/* rules: [ */}
              {/* { */}
              {/* required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i', */}
              {/* message: '请选择目标类别', */}
              {/* }, */}
              {/* ], */}
              {/* }} */}
              {/* > */}
              {/* <Selection.UDC */}
              {/* disabled={ */}
              {/* mode === 'view' || */}
              {/* (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i') */}
              {/* } */}
              {/* code="OKR:OBJECTIVE_CLASS1" */}
              {/* placeholder="请选择目标类别" */}
              {/* /> */}
              {/* </Field> */}
              {/* <Field */}
              {/* name="objectiveClass2" */}
              {/* label="目标子类" */}
              {/* decorator={{ */}
              {/* initialValue: formData.objectiveClass2 || undefined, */}
              {/* rules: [ */}
              {/* { */}
              {/* required: mode !== 'view' && fieldsConfig.taskKey === 'ORG_G01_01_SUBMIT_i', */}
              {/* message: '请选择目标子类', */}
              {/* }, */}
              {/* ], */}
              {/* }} */}
              {/* > */}
              {/* <Selection.UDC */}
              {/* disabled={ */}
              {/* mode === 'view' || */}
              {/* (mode === 'edit' && fieldsConfig.taskKey !== 'ORG_G01_01_SUBMIT_i') */}
              {/* } */}
              {/* code="OKR:OBJECTIVE_CLASS2" */}
              {/* placeholder="请选择目标子类" */}
              {/* /> */}
              {/* </Field> */}
              <Field
                name="supObjectiveId"
                label="上级目标"
                decorator={{
                  initialValue: Number(formData.supObjectiveId) || undefined,
                }}
              >
                {formData.objectiveType ? (
                  <Selection
                    className="x-fill-100"
                    source={
                      formData.objectiveType === 'COMPANY'
                        ? objectiveProgList.filter(v => v.objectiveType === 'COMPANY')
                        : formData.objectiveType === 'BU'
                          ? objectiveProgList.filter(
                              v => v.objectiveType === 'COMPANY' || v.objectiveType === 'BU'
                            )
                          : formData.objectiveType === 'PERSON'
                            ? objectiveProgList
                            : []
                    }
                    transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onValueChange={value => {
                      if (value) {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            supObjectiveMsg: { ...value },
                            okrPeriodId: value.okrPeriodId,
                          },
                        });
                        setFieldsValue({
                          okrPeriodId: value.okrPeriodId,
                        });
                      } else {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { supObjectiveMsg: {}, okrPeriodId: null },
                        });
                        setFieldsValue({
                          okrPeriodId: null,
                        });
                      }
                    }}
                    placeholder="请选择上级目标"
                  />
                ) : (
                  <Input disabled placeholder="请先选择目标层次" />
                )}
              </Field>
              <Field
                key={formData.createUserId}
                name="createUserId"
                label="创建人"
                decorator={{
                  initialValue: Number(formData.createUserId) || undefined,
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectUsersWithBu()}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onColumnsChange={value => {}}
                  limit={20}
                  onChange={e => {}}
                  placeholder="请选择创建人"
                  disabled
                />
              </Field>
              {!isEmpty(formData.supObjectiveMsg) ? (
                <Field
                  name="supObjectiveMsg"
                  label="上级目标信息"
                  decorator={{
                    initialValue: Number(formData.supObjectiveMsg) || undefined,
                  }}
                  presentational
                >
                  <Card bodyStyle={{ padding: 10 }} style={{ padding: '5px' }}>
                    <div>
                      目标名称：
                      {(formData.supObjectiveMsg && formData.supObjectiveMsg.objectiveName) || ''}
                    </div>
                    <div>
                      目标主体：
                      {(formData.supObjectiveMsg &&
                        formData.supObjectiveMsg.objectiveSubjectName) ||
                        ''}
                    </div>
                    <div>
                      负责人：
                      {(formData.supObjectiveMsg && formData.supObjectiveMsg.objectiveResName) ||
                        ''}
                    </div>
                  </Card>
                </Field>
              ) : null}
            </FieldList>
          </Card>

          <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
            <Tabs onChange={() => {}} type="card">
              <TabPane tab="关键结果KR" key="1">
                <>
                  <FieldList
                    legend="关键结果KR"
                    layout="horizontal"
                    getFieldDecorator={() => void 0}
                    // getFieldDecorator={getFieldDecorator}
                    col={2}
                  />
                  {keyresultList.map((item, index) => {
                    const tableColumns = [
                      {
                        title: (
                          <span className={mode !== 'view' && 'ant-form-item-required'}>
                            结果衡量类型
                          </span>
                        ),
                        dataIndex: 'keyresultType',
                        key: 'keyresultType',
                        render: value => (
                          <Selection.UDC
                            disabled={mode === 'view'}
                            value={value}
                            code="OKR:RESULTE_TYPE"
                            placeholder="请选择状态"
                            onChange={e => {
                              this.onCellChanged(index, e, 'keyresultType'); // 更新值
                              this.onCellChanged(index, 0, 'curProg'); // 每次切换清空当前进度
                              if (e === 'PERCENT') {
                                // 结果衡量类型是百分比时，起始值和目标值自动赋值为0和100
                                this.onCellChanged(index, 0, 'iniValue');
                                this.onCellChanged(index, 100, 'objValue');
                              } else if (e === 'tag') {
                                // 结果衡量类型是是否型时，结果达成置为true，当前进度置为100%
                                this.onCellChanged(index, 'false', 'acheiveTag');
                                this.onCellChanged(index, 0, 'curProg');
                                this.onCellChanged(index, '', 'iniValue');
                                this.onCellChanged(index, '', 'objValue');
                              } else {
                                // 结果衡量类型是数字变化型时，清空起始值和目标值
                                this.onCellChanged(index, null, 'iniValue');
                                this.onCellChanged(index, null, 'objValue');
                              }
                              // 切换结果衡量类型时，清楚所有打分规则相关信息
                              this.onCellChanged(index, [{ gradeType: 'LINEAR' }], 'krGrade');
                              this.onCellChanged(index, [], 'deleteGradeKeys');
                              // this.onCellChanged(index, 'LINEAR', 'gradeType');
                            }}
                            onValueChange={e => {
                              this.onCellChanged(index, e.name, 'keyresultTypeName'); // 更新值
                            }}
                          />
                        ),
                      },
                      {
                        title: <span className="ant-form-item-required">打分规则</span>,
                        dataIndex: 'gradeType',
                        key: 'gradeType',
                        align: 'center',
                        render: value => (
                          <Button
                            onClick={() => {
                              dispatch({
                                type: `gradeType/updateGradeTypeForm`,
                                payload: {
                                  ...item,
                                  index,
                                  gradeType:
                                    item.krGrade && !isEmpty(item.krGrade)
                                      ? item.krGrade[0].gradeType
                                      : undefined,
                                },
                              });
                              dispatch({
                                type: `gradeType/updateState`,
                                payload: {
                                  gradeTypeList: item.krGrade,
                                  deleteGradeKeys: item.gradeTypeListDel,
                                },
                              });
                              this.toggleVisible();
                            }}
                            // disabled={isNil(item.keyresultType) || setGradeTypeFlag}
                            disabled={isNil(item.keyresultType)}
                          >
                            {mode === 'edit'
                              ? // &&
                                // ((!isNil(extInfo) &&
                                //   extInfo.resId === Number(formData.supObjecttveResId)) ||
                                //   formData.isPres)
                                '设置打分规则'
                              : '打分规则'}
                          </Button>
                        ),
                      },
                      {
                        title: (
                          <span className={mode !== 'view' && 'ant-form-item-required'}>
                            起始值
                          </span>
                        ),
                        dataIndex: 'iniValue',
                        key: 'iniValue',
                        hidden: 'tag',
                        render: value => (
                          <InputNumber
                            min={0}
                            max={item.keyresultType === 'PERCENT' && 100}
                            // disabled={item.keyresultType === 'PERCENT' || mode === 'view'}
                            disabled={mode === 'view'}
                            value={value}
                            className="x-fill-100"
                            placeholder="请输入起始值"
                            onChange={e => {
                              this.onCellChanged(index, e || 0, 'iniValue');
                            }}
                          />
                        ),
                      },
                      {
                        title: (
                          <span className={mode !== 'view' && 'ant-form-item-required'}>
                            目标值
                          </span>
                        ),
                        dataIndex: 'objValue',
                        key: 'objValue',
                        hidden: 'tag',
                        render: value => (
                          <InputNumber
                            precision={0}
                            min={0}
                            max={item.keyresultType === 'PERCENT' && 100}
                            // disabled={item.keyresultType === 'PERCENT' || mode === 'view'}
                            disabled={mode === 'view'}
                            value={value}
                            className="x-fill-100"
                            placeholder="请输入起始值"
                            onChange={e => {
                              this.onCellChanged(index, e || 0, 'objValue');
                            }}
                          />
                        ),
                      },
                      {
                        title: (
                          <span className={mode !== 'view' && 'ant-form-item-required'}>
                            结果达成
                          </span>
                        ),
                        dataIndex: 'acheiveTag',
                        key: 'acheiveTag',
                        align: 'center',
                        hidden: 'NUMBER,PERCENT',
                        render: value => (
                          <Switch
                            checked={value === 'true'}
                            onChange={e => {
                              this.onCellChanged(index, e ? 'true' : 'false', 'acheiveTag');
                              if (!e) {
                                this.onCellChanged(index, 0, 'curProg');
                              } else {
                                this.onCellChanged(index, 100, 'curProg');
                              }
                            }}
                            disabled={mode === 'view'}
                          />
                        ),
                      },
                      {
                        title: (
                          <span className={mode !== 'view' && 'ant-form-item-required'}>
                            当前进度
                          </span>
                        ),
                        dataIndex: 'curProg',
                        key: 'curProg',
                        render: value =>
                          item.keyresultType !== 'NUMBER' ? (
                            <>
                              <InputNumber
                                precision={0}
                                disabled={item.keyresultType === 'tag' || mode === 'view'}
                                value={value}
                                min={0}
                                max={100}
                                style={{ width: '80%' }}
                                onChange={e => {
                                  this.onCellChanged(index, e || 0, 'curProg');
                                }}
                                placeholder="请输入当前进度"
                              />
                              <span> %</span>
                            </>
                          ) : (
                            <>
                              <InputNumber
                                precision={0}
                                style={{ width: '80%' }}
                                value={value || 0}
                                min={0}
                                max={item.objValue || 100}
                                onChange={e => {
                                  this.onCellChanged(index, e || 0, 'curProg');
                                }}
                                placeholder="请输入当前进度"
                                disabled={mode === 'view'}
                              />
                              &nbsp;
                              <span>
                                {Math.round(
                                  item.objValue
                                    ? mul(div(Number(value || 0), Number(item.objValue || 0)), 100)
                                    : 0
                                )}
                                %
                              </span>
                            </>
                          ),
                      },
                    ];

                    return (
                      <Card
                        key={item.id || item.okrKeyresultId}
                        style={{ borderRadius: '6px', marginBottom: '10px', width: '80%' }}
                      >
                        {mode === 'edit' ? (
                          <Icon
                            type="close-circle"
                            theme="filled"
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              right: '-10px',
                              fontSize: '20px',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const { okrKeyresultId } = item;
                              const newDataSource = keyresultList.filter(
                                row => row.okrKeyresultId !== okrKeyresultId
                              );
                              dispatch({
                                type: `${DOMAIN}/updateState`,
                                payload: {
                                  keyresultList: newDataSource,
                                  keyresultListDel: [...keyresultListDel, okrKeyresultId].filter(
                                    v => v > 0
                                  ),
                                },
                              });
                            }}
                          />
                        ) : null}
                        <FieldList
                          key={item.id}
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={2}
                        >
                          <Field
                            name="keyresultName"
                            label={
                              <span className={mode !== 'view' && 'ant-form-item-required'}>
                                关键结果KR名称
                              </span>
                            }
                            labelCol={{ span: 8, xxl: 8 }}
                            wrapperCol={{ span: 16, xxl: 16 }}
                            presentational
                          >
                            <Input
                              value={item.keyresultName}
                              placeholder="请输入关键结果KR名称"
                              disabled={mode === 'view'}
                              onChange={e => {
                                this.onCellChanged(index, e.target.value, 'keyresultName');
                              }}
                            />
                          </Field>
                          <Field
                            name="keyresultWeight"
                            label={
                              <span className={mode !== 'view' && 'ant-form-item-required'}>
                                权重
                              </span>
                            }
                            labelCol={{ span: 8, xxl: 8 }}
                            wrapperCol={{ span: 16, xxl: 16 }}
                            presentational
                          >
                            <>
                              <InputNumber
                                precision={0}
                                value={item.keyresultWeight}
                                style={{ width: '80%' }}
                                disabled={mode === 'view'}
                                min={0}
                                max={100}
                                onChange={e => {
                                  this.onCellChanged(index, e || 0, 'keyresultWeight');
                                }}
                                placeholder="请输入权重"
                              />
                              <span> %</span>
                            </>
                          </Field>
                          <Field
                            name="keyresultDesc"
                            label={
                              <span className={mode !== 'view' && 'ant-form-item-required'}>
                                关键结果KR描述
                              </span>
                            }
                            fieldCol={1}
                            labelCol={{ span: 4, xxl: 4 }}
                            wrapperCol={{ span: 20, xxl: 20 }}
                            presentational
                          >
                            <Input.TextArea
                              value={item.keyresultDesc}
                              rows={3}
                              disabled={mode === 'view'}
                              placeholder="请输入关键结果KR描述"
                              onChange={e => {
                                this.onCellChanged(index, e.target.value, 'keyresultDesc');
                              }}
                            />
                          </Field>
                        </FieldList>
                        <Divider dashed />
                        <Table
                          rowKey={item.id}
                          width={800}
                          dataSource={[{ ...item }]}
                          pagination={false}
                          columns={tableColumns.filter(
                            v => !v.hidden || (v.hidden && !v.hidden.includes(item.keyresultType))
                          )}
                        />
                      </Card>
                    );
                  })}
                  {mode === 'edit' ? (
                    <a
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            keyresultList: update(keyresultList, {
                              $push: [
                                {
                                  okrKeyresultId: genFakeId(-1),
                                  keyresultName: null,
                                  keyresultWeight: null,
                                  keyresultDesc: null,
                                  keyresultType: null,
                                  iniValue: null,
                                  objValue: null,
                                  acheiveTag: null,
                                  curProg: null,
                                  krGrade: [{ gradeType: 'LINEAR' }],
                                },
                              ],
                            }),
                          },
                        });
                      }}
                    >
                      <Icon type="plus-circle" />
                      &nbsp; 新建关键结果KR
                    </a>
                  ) : null}
                </>
              </TabPane>
              <TabPane tab="关键行动KA" key="2">
                <>
                  <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={2} />
                  {keyresultWorkPlanList.map((item, index) => (
                    <Card
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      style={{
                        borderRadius: '6px',
                        marginBottom: '10px',
                        width: '95%',
                      }}
                    >
                      {mode === 'edit' ? (
                        <Icon
                          type="close-circle"
                          theme="filled"
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            fontSize: '20px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            const { id } = item;
                            const newDataSource = keyresultWorkPlanList.filter(
                              row => row.id !== id
                            );
                            dispatch({
                              type: `${DOMAIN}/updateState`,
                              payload: {
                                keyresultWorkPlanList: newDataSource,
                                keyresultWorkPlanListDel: [...keyresultWorkPlanListDel, id].filter(
                                  v => v > 0
                                ),
                              },
                            });
                          }}
                        />
                      ) : null}
                      <FieldList
                        key={item.id}
                        layout="horizontal"
                        getFieldDecorator={getFieldDecorator}
                        col={2}
                      >
                        <Field
                          name="workPlanName"
                          label={
                            <span className={mode === 'view' ? null : 'ant-form-item-required'}>
                              关键行动KA名称
                            </span>
                          }
                          labelCol={{ span: 8, xxl: 8 }}
                          wrapperCol={{ span: 16, xxl: 16 }}
                          presentational
                        >
                          <Input
                            value={item.workPlanName}
                            placeholder="请输入关键行动KA名称"
                            onChange={e => {
                              this.onWorkPlanCellChanged(index, e.target.value, 'workPlanName');
                            }}
                            disabled={mode === 'view'}
                          />
                        </Field>
                        <FieldLine
                          label="编号/优先级"
                          key="priority"
                          labelCol={{ span: 8, xxl: 8 }}
                          wrapperCol={{ span: 16, xxl: 16 }}
                        >
                          <Field name="planNo" wrapperCol={{ span: 23, xxl: 23 }} presentational>
                            <Input
                              value={item.planNo}
                              placeholder="请输入编号"
                              onChange={e => {
                                this.onWorkPlanCellChanged(index, e.target.value, 'planNo');
                              }}
                              disabled={mode === 'view'}
                            />
                          </Field>
                          <Field name="priority" wrapperCol={{ span: 23, xxl: 23 }} presentational>
                            <InputNumber
                              value={item.priority}
                              min={0}
                              placeholder="请输入优先级"
                              className="x-fill-100"
                              onChange={e => {
                                this.onWorkPlanCellChanged(index, e, 'priority');
                              }}
                              disabled={mode === 'view'}
                            />
                          </Field>
                        </FieldLine>
                        <Field
                          name="dates"
                          label={
                            <span className={mode === 'view' ? null : 'ant-form-item-required'}>
                              日期范围
                            </span>
                          }
                          labelCol={{ span: 8, xxl: 8 }}
                          wrapperCol={{ span: 16, xxl: 16 }}
                          presentational
                        >
                          <DatePicker.RangePicker
                            value={[item.startDate || undefined, item.endDate || undefined]}
                            onChange={e => {
                              this.onWorkPlanCellChanged(index, e[0], 'startDate');
                              this.onWorkPlanCellChanged(index, e[1], 'endDate');
                            }}
                            className="x-fill-100"
                            format="YYYY-MM-DD"
                            disabled={mode === 'view'}
                          />
                        </Field>
                        <Field
                          name="relevantResId"
                          label={
                            <span className={mode === 'view' ? null : 'ant-form-item-required'}>
                              相关人
                            </span>
                          }
                          labelCol={{ span: 8, xxl: 8 }}
                          wrapperCol={{ span: 16, xxl: 16 }}
                          presentational
                        >
                          <Selection.Columns
                            value={
                              item.relevantResId
                                ? item.relevantResId.split(',').map(v => Number(v))
                                : undefined
                            }
                            className="x-fill-100"
                            source={() => selectUsersWithBu()}
                            columns={particularColumns}
                            transfer={{ key: 'id', code: 'id', name: 'name' }}
                            dropdownMatchSelectWidth={false}
                            showSearch
                            onColumnsChange={value => {}}
                            placeholder="请选择相关人"
                            mode="multiple"
                            limit={20}
                            onChange={e => {
                              this.onWorkPlanCellChanged(index, e.join(','), 'relevantResId');
                            }}
                            disabled={mode === 'view'}
                          />
                        </Field>
                        <Field
                          name="remark"
                          label="描述详情"
                          fieldCol={1}
                          labelCol={{ span: 4, xxl: 4 }}
                          wrapperCol={{ span: 20, xxl: 20 }}
                          presentational
                        >
                          <Input.TextArea
                            value={item.remark || ''}
                            onChange={e => {
                              this.onWorkPlanCellChanged(index, e.target.value, 'remark');
                            }}
                            rows={3}
                            placeholder="请输入描述详情"
                            disabled={mode === 'view'}
                          />
                        </Field>
                      </FieldList>
                    </Card>
                  ))}

                  {mode === 'edit' ? (
                    <a
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            keyresultWorkPlanList: update(keyresultWorkPlanList, {
                              $push: [
                                {
                                  id: genFakeId(-1),
                                  workPlanName: undefined,
                                  planNo: undefined,
                                  priority: undefined,
                                  startDate: undefined,
                                  endDate: undefined,
                                  relevantResId: undefined,
                                  remark: undefined,
                                },
                              ],
                            }),
                          },
                        });
                      }}
                    >
                      <Icon type="plus-circle" />
                      &nbsp; 新建关键行动KA
                    </a>
                  ) : null}
                </>
              </TabPane>
            </Tabs>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmtReview;
