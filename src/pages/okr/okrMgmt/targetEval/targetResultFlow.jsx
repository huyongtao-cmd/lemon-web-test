/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Input,
  Form,
  Button,
  Progress,
  Card,
  Icon,
  Divider,
  Slider,
  Row,
  Col,
  Tooltip,
} from 'antd';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, hasIn } from 'ramda';
import { mul, div, add } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import ViewDetail from './ViewDetail';

import PlanAffirm from './taskOne/PlanAffirm';
import ResultSum from './taskOne/ResultSum';
import GradeTypeView from '../targetMgmt/component/GradeTypeView';

import targetSvg from './img/target.svg';
import keySvg from './img/key.svg';

import styles from './style.less';

const { Field } = FieldList;

const DOMAIN = 'targetEval';

@connect(({ loading, targetEval, gradeType, dispatch }) => ({
  targetEval,
  gradeType,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class TargetEvalFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonFilter: '1',
      nowTitle: '',
      visible: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      targetEval: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      id &&
        dispatch({
          type: `${DOMAIN}/targetResultFlowDetail`,
          payload: {
            id,
          },
        });
      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(response => {
            const { taskKey: taskKeys } = response;
            if (taskKeys === 'ACC_A49_03_RES_RESULT') {
              this.setState({
                nowTitle: '最终结果确认',
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
    });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      targetEval: { twOkrKeyresultView },
      dispatch,
    } = this.props;

    const newDataSource = twOkrKeyresultView;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { twOkrKeyresultView: newDataSource },
    });

    const supobjectiveCurProgNew = twOkrKeyresultView
      .map(v =>
        mul(
          mul(
            Number(
              v.keyresultType === 'tag'
                ? div(Number(v.curProg), 100).toFixed(2)
                : v.objValue
                  ? div(Number(v.curProg), Number(v.objValue)).toFixed(2)
                  : 0
            ),
            div(v.keyresultWeight, 100)
          ),
          100
        )
      )
      .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
    const newFinalScore = twOkrKeyresultView
      .map(v => mul(Number(v.evalScore || 0), div(v.keyresultWeight, 100)))
      .reduce((prev, curr) => add(prev || 0, curr || 0), 0);

    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        objectiveCurProg: supobjectiveCurProgNew,
        finalScore: newFinalScore,
      },
    });
  };

  nextStep = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      targetEval: {
        formData: { okrObjectiveId },
      },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/targetResultUpdate`,
          payload: {
            id: okrObjectiveId,
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            this.setState({
              buttonFilter: '2',
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
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
      form: { getFieldDecorator, setFieldsValue },
      targetEval: { formData, twOkrKeyresultView, flowForm, fieldsConfig },
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
    } = this.props;
    const { visible } = this.state;

    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { taskId, mode } = fromQs();
    const { buttonFilter, nowTitle } = this.state;

    const submitBtn =
      loading.effects[`${DOMAIN}/targetResultUpdate`] ||
      loading.effects[`${DOMAIN}/targetResultFinalEval`] ||
      loading.effects[`${DOMAIN}/targetResultSave`] ||
      loading.effects[`${DOMAIN}/targetResultEvalPass`];

    const tableProps = {
      title: () => <span>打分明细</span>,
      sortBy: 'okrKeyresultId',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/myVacationList`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      // pagination: {
      //   showSizeChanger: true,
      //   showQuickJumper: true,
      //   pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      //   showTotal: total => `共 ${total} 条`,
      //   defaultPageSize: 10,
      //   defaultCurrent: 1,
      //   size: 'default',
      // },
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '打分人',
          dataIndex: 'evalRoleName',
          align: 'center',
          width: '250px',
        },
        {
          title: '分数',
          dataIndex: 'evalScore',
          align: 'center',
          width: '150px',
          render: (value, row, index) => {
            const { evalRoleName } = row;
            if (evalRoleName === '自评') {
              return '-';
            }
            return value;
          },
        },
        {
          title: '评语',
          dataIndex: 'evalComment',
          render: (value, row, key) => {
            const { evalRoleName } = row;
            if (evalRoleName === '系统自动' || evalRoleName === '最终确认') {
              return '-';
            }
            return <pre>{value}</pre>;
            // return value && value.length > 15 ? (
            //   <Tooltip placement="left" title={value}>
            //     <pre>{`${value.substr(0, 15)}...`}</pre>
            //   </Tooltip>
            // ) : (
            //   <pre>{value}</pre>
            // );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <GradeTypeView
          onChange={v => {
            this.toggleVisible();
          }}
          visible={visible}
        />
        <BpmWrapper
          buttonLoading={submitBtn}
          fieldsConfig={
            taskKey === 'ACC_A49_01_SUBMIT_i'
              ? {
                  ...fieldsConfig,
                  buttons: fieldsConfig.buttons.filter(v => v.filter === buttonFilter),
                }
              : fieldsConfig
          }
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
                  if (taskKey === 'ACC_A49_02_RES_GRADE') {
                    dispatch({
                      type: `${DOMAIN}/targetResultEvalPass`,
                      payload: {
                        taskId,
                        procRemark: remark,
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
              if (taskKey === 'ACC_A49_01_SUBMIT_i') {
                dispatch({
                  type: `${DOMAIN}/targetResultSave`,
                  payload: {
                    ...formData,
                    taskId,
                    result: key,
                    procRemark: remark,
                    submit: 'true',
                    id: formData.id,
                  },
                });
              } else if (taskKey === 'ACC_A49_02_RES_GRADE') {
                const tt = twOkrKeyresultView.filter(v => !v.evalScore);
                if (tt.length) {
                  createConfirm({
                    content: `有${tt.length}个关键结果的打分为0，是否继续?`,
                    onOk: () =>
                      dispatch({
                        type: `${DOMAIN}/targetResultEvalPass`,
                        payload: {
                          taskId,
                          procRemark: remark,
                          result: key,
                        },
                      }),
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/targetResultEvalPass`,
                    payload: {
                      taskId,
                      procRemark: remark,
                      result: key,
                    },
                  });
                }
              } else {
                // taskKey === 'ACC_A49_03_RES_RESULT'
                const tt = twOkrKeyresultView.filter(v => !v.evalScore);
                if (tt.length) {
                  createConfirm({
                    content: `有${tt.length}个关键结果的打分为0，是否继续?`,
                    onOk: () =>
                      dispatch({
                        type: `${DOMAIN}/targetResultFinalEval`,
                        payload: {
                          taskId,
                          procRemark: remark,
                          result: key,
                        },
                      }),
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/targetResultFinalEval`,
                    payload: {
                      taskId,
                      procRemark: remark,
                      result: key,
                    },
                  });
                }
              }
            } else if (key === 'nextStep') {
              this.nextStep();
            } else {
              // key === 'upStep'
              this.setState({
                buttonFilter: '1',
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' &&
            taskKey === 'ACC_A49_01_SUBMIT_i' &&
            buttonFilter === '1' && <PlanAffirm />}
          {mode === 'edit' &&
            taskKey === 'ACC_A49_01_SUBMIT_i' &&
            buttonFilter === '2' && <ResultSum />}
          {mode === 'edit' &&
            taskKey !== 'ACC_A49_01_SUBMIT_i' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={<Title icon="profile" text={nowTitle || '目标结果打分'} />}
                bordered={false}
              >
                <Card
                  title={
                    <span style={{ color: '#000' }}>
                      <img
                        width="20px"
                        style={{ marginBottom: '9px' }}
                        src={targetSvg}
                        alt="目标"
                      />
                      &nbsp; {formData.objectiveName || ''}
                    </span>
                  }
                  headStyle={{ border: 'none', height: 'auto' }}
                  bodyStyle={{ paddingTop: 6, paddingLeft: '55px' }}
                  bordered={false}
                  className={styles.supObjective}
                >
                  <div>
                    <Icon type="home" />
                    &nbsp; 父目标：
                    {formData.supObjectveName || '无'}
                    &nbsp; &nbsp;
                    {formData.supObjectveName && (
                      <span className="supobjectiveCurProg">
                        {formData.supobjectiveCurProg
                          ? Number(formData.supobjectiveCurProg).toFixed(2)
                          : '00.00'}
                        %
                      </span>
                    )}
                  </div>
                  <div>
                    <span>
                      <Icon type="user" />
                      &nbsp;
                      {formData.objectiveResName || ''}
                    </span>
                    &nbsp; &nbsp; &nbsp; &nbsp;
                    <span>
                      目标类型：
                      {formData.objectiveTypeName || ''}
                    </span>
                    &nbsp; &nbsp; &nbsp; &nbsp;
                    <span>
                      截止日期：
                      {formData.endDate || ''}
                    </span>
                    &nbsp; &nbsp; &nbsp; &nbsp;
                    <span>
                      更新日期：
                      {formData.objectiveUpdatedate || ''}
                    </span>
                  </div>
                  <div>
                    <span>整体进度：</span>
                    <span style={{ display: 'inline-block', width: '400px' }}>
                      <Progress
                        strokeColor="#22d7bb"
                        percent={Number(formData.objectiveCurProg) || 0}
                        status="active"
                        format={percent => percent.toFixed(2) + '%'}
                      />
                    </span>
                  </div>
                </Card>
                <Card
                  title={
                    <span>
                      <img
                        width="20px"
                        style={{ marginBottom: '9px', transform: 'rotateY(180deg)' }}
                        src={keySvg}
                        alt="关键结果"
                      />
                      &nbsp; 关键结果
                    </span>
                  }
                  headStyle={{ border: 'none' }}
                  bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '70px' }}
                  bordered={false}
                >
                  {hasIn('keyResultScore', disabledOrHidden) && (
                    <>
                      <span style={{ display: 'inline-block' }}>得分</span>
                      &nbsp;
                      <span
                        style={{ fontSize: '26px', color: '#3B5493', fontFamily: 'Sans-serif' }}
                      >
                        {(formData.finalScore && Number(formData.finalScore).toFixed(2)) ||
                          '100.00'}
                      </span>
                    </>
                  )}
                </Card>
                {twOkrKeyresultView.map((item, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={index}>
                    {hasIn('topDivider', disabledOrHidden) && <Divider dashed />}
                    <Card
                      bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '120px' }}
                      bordered={false}
                      className={styles.keyResult}
                    >
                      <span style={{ position: 'absolute', left: '40px' }}>
                        <Progress
                          width={60}
                          strokeColor="#22d7bb"
                          type="circle"
                          percent={
                            item.keyresultType === 'tag'
                              ? Number(item.curProg || 0)
                              : Number(
                                  item.objValue
                                    ? mul(
                                        div(Number(item.curProg), Number(item.objValue)),
                                        100
                                      ).toFixed(1)
                                    : '0.00'
                                )
                          }
                          // format={percent => percent.toFixed(2) + '%'}
                        />
                      </span>
                      <div>
                        {item.keyresultName || ''}
                        &nbsp; &nbsp;
                        {`[权重${item.keyresultWeight || 0}%]`}
                      </div>
                      <div style={{ color: '#999' }}>
                        <span>
                          起始：
                          {item.iniValue || ''}
                          {item.keyresultType === 'PERCENT' ? '%' : ''}
                        </span>
                        &nbsp; &nbsp; &nbsp; &nbsp;
                        <span>
                          目标：
                          {item.objValue || ''}
                          {item.keyresultType === 'PERCENT' ? '%' : ''}
                        </span>
                      </div>

                      {hasIn('keyResultSysScore', disabledOrHidden) && (
                        <>
                          <br />
                          <div>
                            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                              <Field
                                label="系统打分"
                                fieldCol={1}
                                labelCol={{ span: 4, xxl: 3 }}
                                wrapperCol={{ span: 19, xxl: 20 }}
                                presentational
                              >
                                <span>
                                  <pre>
                                    {Array.isArray(
                                      item?.twOkrKeyresultScoreView?.filter(
                                        v => v.evalRole === 'SYS_EVAL'
                                      )
                                    ) &&
                                    !isEmpty(
                                      item?.twOkrKeyresultScoreView?.filter(
                                        v => v.evalRole === 'SYS_EVAL'
                                      )
                                    )
                                      ? item?.twOkrKeyresultScoreView?.filter(
                                          v => v.evalRole === 'SYS_EVAL'
                                        )[0].evalScore || ''
                                      : ''}
                                  </pre>
                                </span>
                              </Field>
                            </FieldList>
                          </div>
                        </>
                      )}

                      {hasIn('keyResultEval', disabledOrHidden) && (
                        <>
                          <div>
                            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                              <Field
                                label="结果总结(自评)"
                                fieldCol={1}
                                labelCol={{ span: 4, xxl: 3 }}
                                wrapperCol={{ span: 19, xxl: 20 }}
                                presentational
                              >
                                <span>
                                  <pre>
                                    {Array.isArray(
                                      item?.twOkrKeyresultScoreView?.filter(
                                        v => v.evalRole === 'SELF_EVAL'
                                      )
                                    ) &&
                                    !isEmpty(
                                      item?.twOkrKeyresultScoreView?.filter(
                                        v => v.evalRole === 'SELF_EVAL'
                                      )
                                    )
                                      ? item?.twOkrKeyresultScoreView?.filter(
                                          v => v.evalRole === 'SELF_EVAL'
                                        )[0].evalComment || ''
                                      : ''}
                                  </pre>
                                </span>
                              </Field>
                            </FieldList>
                          </div>
                        </>
                      )}

                      {hasIn('scoreDetail', disabledOrHidden) && (
                        <>
                          <div className={styles.dataTableBox}>
                            <DataTable {...tableProps} dataSource={item.twOkrKeyresultScoreView} />
                          </div>
                          <br />
                        </>
                      )}

                      <div className={styles.slider}>
                        <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                          <Field
                            label={<span className="ant-form-item-required">结果打分</span>}
                            fieldCol={1}
                            labelCol={{ span: 4, xxl: 3 }}
                            wrapperCol={{ span: 19, xxl: 20 }}
                            presentational
                          >
                            <Row gutter={22}>
                              <Col span={14}>
                                <Slider
                                  marks={{
                                    0: '0',
                                    10: '10',
                                    20: '20',
                                    30: '30',
                                    40: '40',
                                    50: '50',
                                    60: '60',
                                    70: '70',
                                    80: '80',
                                    90: '90',
                                    100: '100',
                                  }}
                                  value={item.evalScore || 0}
                                  tooltipVisible
                                  onChange={e => {
                                    this.onCellChanged(index, e, 'evalScore');
                                  }}
                                />
                              </Col>
                              <Col span={5}>
                                <span>{item.evalScore || 0}分</span>
                              </Col>
                              <Col span={3}>
                                <a
                                  onClick={() => {
                                    dispatch({
                                      type: `gradeType/updateGradeTypeForm`,
                                      payload: {
                                        ...item,
                                        keyresultTypeName: item.keyresultTypeName,
                                        index,
                                        gradeType:
                                          item.krGrade && !isEmpty(item.krGrade)
                                            ? item.krGrade[0].gradeType
                                            : 'LINEAR',
                                        gradeTypeName:
                                          item.krGrade && !isEmpty(item.krGrade)
                                            ? item.krGrade[0].gradeTypeName
                                            : '线性区间',
                                      },
                                    });
                                    dispatch({
                                      type: `gradeType/updateState`,
                                      payload: {
                                        gradeTypeList: item.krGrade || [],
                                      },
                                    });
                                    this.toggleVisible();
                                  }}
                                >
                                  打分规则
                                </a>
                              </Col>
                            </Row>
                          </Field>
                        </FieldList>
                      </div>
                      {hasIn('evalComment', disabledOrHidden) && (
                        <>
                          <br />
                          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                            <Field
                              label="评语"
                              fieldCol={1}
                              labelCol={{ span: 4, xxl: 3 }}
                              wrapperCol={{ span: 19, xxl: 20 }}
                              presentational
                            >
                              <Input.TextArea
                                value={item.evalComment || ''}
                                onChange={e => {
                                  this.onCellChanged(index, e.target.value, 'evalComment');
                                }}
                                rows={3}
                                placeholder="请输入评语"
                              />
                            </Field>
                          </FieldList>
                        </>
                      )}
                    </Card>
                    {index < twOkrKeyresultView.length - 1
                      ? hasIn('bottomDivider', disabledOrHidden) && <Divider dashed />
                      : ''}
                  </React.Fragment>
                ))}
              </Card>
            )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default TargetEvalFlow;
