import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit, isNil } from 'ramda';
import { Form, Card, Input, Icon, Tooltip, List, Avatar } from 'antd';
import moment from 'moment';
import router from 'umi/router';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import EditTable from '@/components/production/business/EditTable';
import { fromQs } from '@/utils/production/stringUtil';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { getUrl } from '@/utils/flowToRouter';
import Ueditor from '@/components/common/Ueditor';
import { closeThenGoto } from '@/layouts/routerControl';
import update from 'immutability-helper';
import { pushFlowTask } from '@/services/gen/flow';
import DataTable from '@/components/production/business/DataTable.tsx';
import BpmWrapper from '../../../gen/BpmMgmt/BpmWrapper';
import { add, mul, div, genFakeId } from '@/utils/mathUtils';
import styles from './index.less';

const { TextArea } = Input;

// namespace声明
const DOMAIN = 'performanceFeedback';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, performanceFeedback, user: { user } }) => ({
  // loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  // saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...performanceFeedback,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class PerformanceFeedbackEdit extends React.PureComponent {
  state = {
    evaluate: undefined,
  };

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/getPeriodList`,
    });
    if (taskId) {
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      }).then(value => {
        this.fetchData(id);
      });
    } else {
      this.fetchData(id);
    }
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetail`,
      payload: { id: params },
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = cb => {
    this.commitFormData({ submit: false }, cb);
  };

  /**
   * 提交
   */
  handleSubmitProcess = cb => {
    this.commitFormData({ submit: true, result: 'APPROVED' }, cb);
  };

  /**
   * 提交表单数据
   */
  commitFormData = (params, cb) => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      formData,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: params,
        });
      }
    });
  };

  render() {
    // 定义渲染使用的变量
    const {
      form,
      formData,
      dispatch,
      formMode,
      targetPeriodList,
      // loading,
      // saveLoading,
      fieldsConfig,
      flowForm,
      user: {
        extInfo: { resId, userId },
      }, // 取当前登陆人的resId
    } = this.props;
    const {
      targetView = {},
      evaluateEntities = [],
      shortageAndImproveEntities = [],
      indexList = [],
      firstHalfSummary,
    } = formData;
    const { evaluate } = this.state;
    const { taskId, mode } = fromQs();
    const { taskKey } = fieldsConfig;
    // 其他流程
    // const allBpm = [{ docId: formData.id, procDefKey: 'ADM_M04', title: '我的出差申请流程' }];
    return (
      // loading={loading}
      <PageWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          // buttonLoading
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const content = this.editor?.getContent();
            if (key === 'FLOW_COMMIT') {
              this.commitFormData(
                {
                  submit: true,
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                },
                () => {
                  const url = getUrl().replace('edit', 'view');
                  closeThenGoto(url);
                }
              );
              return Promise.resolve(true);
            }
            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: 'REJECTED',
                    branch,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }
            if (key === 'FLOW_PASS') {
              if (taskKey === 'KPI_K02_01_SUBMITER') {
                dispatch({
                  type: `${DOMAIN}/feedbackCheckChanging`,
                  payload: { targetId: formData.targetId },
                }).then(res => {
                  if (res && res.ok) {
                    form.validateFieldsAndScroll((error, values) => {
                      if (!error) {
                        if (content || formData.firstHalfSummary) {
                          dispatch({
                            type: `${DOMAIN}/IndexListsave`,
                            payload: formData.indexList,
                          });
                          this.commitFormData({
                            submit: true,
                            result: 'APPROVED',
                            taskId,
                            procRemark: remark,
                            branch,
                            dryRunFlag: true,
                            taskKey,
                            targetId: formData.targetId,
                            id: formData.id,
                            firstHalfSummary: formData.firstHalfSummary || content,
                            secondHalfExpectation: formData.secondHalfExpectation,
                            shortageAndImproveEntities: formData.shortageAndImproveEntities.map(
                              v => ({
                                ...v,
                                stage: 1,
                                stageAssessmentId: formData.id,
                              })
                            ),
                          });
                        } else {
                          createMessage({
                            type: 'warn',
                            description: '请填写半年度工作总结与进度回顾！',
                          });
                        }
                      }
                    });
                  } else {
                    createMessage({
                      type: 'warn',
                      description:
                        '您已经提交了考核指标的变更申请，待变更流程完成后才可以继续年中反馈的审批！',
                    });
                  }
                });
              } else {
                return Promise.resolve(true);
              }
              return Promise.resolve(false);
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {[
              <Button
                size="large"
                key="save"
                type="primary"
                onClick={() => {
                  this.handleSave();
                }}
                // loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                size="large"
                type="primary"
                key="submit"
                onClick={() => {
                  this.handleSubmitProcess(() => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  });
                }}
                // loading={saveLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={targetView}
            // formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="年中绩效反馈名称"
              fieldKey="targetName"
              required
              disabled
            />
            <FormItem
              fieldType="ResSimpleSelect"
              label="姓名"
              placeholder="请选择员工姓名"
              required
              disabled
              fieldKey="resId"
            />
            <FormItem
              fieldType="BaseInput"
              label="部门"
              placeholder="请输入申请名称"
              fieldKey="baseBuName"
              disabled
            />
            <FormItem
              fieldType="BaseInput"
              label="职位"
              placeholder="请输入申请名称"
              fieldKey="position"
              disabled
            />
            <FormItem
              fieldType="BaseInput"
              label="职级"
              placeholder="请输入申请名称"
              fieldKey="jobGrade"
              disabled
            />
            <FormItem
              fieldType="BaseInput"
              label="直属负责人"
              placeholder="请输入申请名称"
              fieldKey="presName"
              disabled
            />
            <FormItem label="入职日期" fieldKey="enrollDate" fieldType="BaseDatePicker" disabled />
            <FormItem
              label="现岗位任职日期"
              fieldKey="positionTakeDate"
              fieldType="BaseDatePicker"
              disabled
            />
            <FormItem
              label="目标周期"
              fieldType="BaseSelect"
              fieldKey="periodId"
              placeholder="请选择目标周期"
              descList={targetPeriodList}
              required
              disabled
              onChange={(value, option) => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    periodName: option[0].periodName,
                    ouName: option[0].ouName,
                  },
                });
              }}
            />
            <FormItem
              label="创建人"
              fieldKey="createUserId"
              fieldType="UserSimpleSelect"
              initialValue={targetView?.createUserId}
              disabled
            />
            <FormItem
              fieldType="BaseSelect"
              label="审批状态"
              // descriptionField="tripApplyStatusDesc"
              parentKey="KPI:KPI_STAGE_ASSESSMENT_STATUS"
              fieldKey="statusName"
              initialValue={formData.statusName}
              disabled
            />
          </BusinessForm>
          <EditTable
            form={form}
            title={
              <div>
                <span>半年度KPI回顾</span>
                {taskKey === 'KPI_K02_01_SUBMITER' && (
                  <Icon
                    type="form"
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      router.push(
                        `/user/performance/performanceTarget/targetEdit?mode=change&id=${
                          formData.targetId
                        }`
                      );
                    }}
                  />
                )}
              </div>
            }
            dataSource={indexList}
            columns={[
              {
                title: 'KPI指标',
                align: 'center',
                dataIndex: 'indexName',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInput"
                    fieldKey={`indexList[${index}].indexName`}
                    disabled
                  />
                ),
              },
              {
                title: '评估标准',
                align: 'center',
                dataIndex: 'assessStandard',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInput"
                    fieldKey={`indexList[${index}].assessStandard`}
                    disabled
                  />
                ),
              },
              {
                title: '权重',
                align: 'center',
                dataIndex: 'indexWeight',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInputNumber"
                    max={100}
                    min={0}
                    fieldKey={`indexList[${index}].indexWeight`}
                    disabled
                    formatter={value => (value ? `${value}%` : '')}
                    parser={value => value.replace('%', '')}
                  />
                ),
              },
              {
                title: '完成进度',
                align: 'center',
                dataIndex: 'progress',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInput"
                    fieldKey={`indexList[${index}].progress`}
                    disabled={taskKey !== 'KPI_K02_01_SUBMITER'}
                    required={taskKey === 'KPI_K02_01_SUBMITER'}
                  />
                ),
              },
            ]}
          />
          {(taskKey === 'KPI_K02_01_SUBMITER' || firstHalfSummary) && (
            <Card title="半年度工作总结与进度回顾" bordered={false} style={{ marginTop: '2px' }}>
              {taskKey === 'KPI_K02_01_SUBMITER' ? (
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <Ueditor
                    id="issueEditor"
                    height="400"
                    width="100%"
                    initialContent={firstHalfSummary}
                    ref={editor => {
                      this.editor = editor;
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{ padding: '15px', overflow: 'hidden', overflowY: 'scroll' }}
                  className={styles.paper}
                  dangerouslySetInnerHTML={{ __html: firstHalfSummary }}
                />
              )}
            </Card>
          )}
          {taskKey === 'KPI_K02_01_SUBMITER' ? (
            <EditTable
              form={form}
              title={<div> 存在的不足及改进措施</div>}
              dataSource={shortageAndImproveEntities}
              columns={[
                {
                  title: '不足之处',
                  align: 'center',
                  dataIndex: 'shortage',
                  width: 500,
                  render: (text, record, index) => (
                    <FormItem
                      form={form}
                      fieldType="BaseInput"
                      fieldKey={`shortageAndImproveEntities[${index}].shortage`}
                    />
                  ),
                },
                {
                  title: '改进措施',
                  align: 'center',
                  dataIndex: 'improvement',
                  render: (text, record, index) => (
                    <FormItem
                      form={form}
                      fieldType="BaseInput"
                      fieldKey={`shortageAndImproveEntities[${index}].improvement`}
                    />
                  ),
                },
              ]}
              onAddClick={() => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    shortageAndImproveEntities: update(shortageAndImproveEntities, {
                      $push: [
                        {
                          id: genFakeId(-1),
                        },
                      ],
                    }),
                  },
                });
              }}
              onDeleteConfirm={keys => {
                const newDataSource = shortageAndImproveEntities.filter(
                  row => keys.indexOf(row.id) < 0
                );
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { shortageAndImproveEntities: newDataSource },
                });
              }}
            />
          ) : (
            <DataTable
              title={<div> 存在的不足及改进措施</div>}
              form={form}
              columns={[
                {
                  title: '不足之处',
                  align: 'center',
                  dataIndex: 'shortage',
                },
                {
                  title: '改进措施',
                  align: 'center',
                  dataIndex: 'improvement',
                },
              ]}
              dataSource={shortageAndImproveEntities}
              rowSelectAble={false}
              showExport={false}
              showColumnSwitch={false}
            />
          )}
          {(taskKey === 'KPI_K02_01_SUBMITER' || firstHalfSummary) && (
            <Card title="下半年度工作期望" bordered={false} style={{ marginTop: '2px' }}>
              <TextArea
                rows={4}
                placeholder="请输入 下半年度工作期望"
                defaultValue={formData.secondHalfExpectation}
                disabled={taskKey !== 'KPI_K02_01_SUBMITER'}
                onChange={e => {
                  formData.secondHalfExpectation = e.target.value;
                }}
              />
            </Card>
          )}
          {taskKey !== 'KPI_K02_01_SUBMITER' && (
            <Card title="领导整体评价及建议" style={{ marginTop: '2px' }}>
              <div className={styles.evaluate}>
                <div className={styles.evaluateTitle}>
                  <span className={styles.evaluateTitleInput}>
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入整体评价及建议"
                      disabled={mode === 'view' || taskKey === 'KPI_K02_04_SUBINTER_CONFIRM'}
                      value={evaluate}
                      onChange={e => {
                        this.setState({
                          evaluate: e.target.value,
                        });
                      }}
                    />
                  </span>
                  <span style={{ position: 'absolute', top: '40px', right: '10px', width: '10%' }}>
                    <Button
                      key="comment"
                      type="primary"
                      size="large"
                      disabled={mode === 'view' || taskKey === 'KPI_K02_04_SUBINTER_CONFIRM'}
                      onClick={() => {
                        dispatch({
                          type: `${DOMAIN}/stageAssesmentEvaluateSave`,
                          payload: {
                            stage: 1,
                            stageAssessmentId: formData.id,
                            comment: evaluate,
                          },
                        });
                        this.setState({
                          evaluate: undefined,
                        });
                      }}
                    >
                      评价
                    </Button>
                  </span>
                </div>
                <div className={styles.evaluateSubtitle}>全部评价及建议</div>
                <div className={styles.evaluateContent}>
                  <List
                    className="comment-list"
                    itemLayout="horizontal"
                    dataSource={evaluateEntities}
                    renderItem={item => (
                      <li style={{ marginTop: '20px' }}>
                        <Tooltip>
                          <Avatar size="small" icon="user" />
                          <span style={{ marginLeft: '10px' }}>{item.createUserName}</span>
                          <span style={{ marginLeft: '6px' }}>
                            {moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                          </span>
                        </Tooltip>
                        <p style={{ marginTop: '8px', marginLeft: '35px' }}>{item.comment}</p>
                      </li>
                    )}
                  />
                </div>
              </div>
            </Card>
          )}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default PerformanceFeedbackEdit;
