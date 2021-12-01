import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit, isNil } from 'ramda';
import { Form, Card, Input, Tooltip, List, Avatar, Radio } from 'antd';
import moment from 'moment';
import router from 'umi/router';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import EditTable from '@/components/production/business/EditTable';
import DataTable from '@/components/production/business/DataTable.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { getUrl } from '@/utils/flowToRouter';
import Ueditor from '@/components/common/Ueditor';
import { closeThenGoto } from '@/layouts/routerControl';
import update from 'immutability-helper';
import BpmWrapper from '../../../gen/BpmMgmt/BpmWrapper';
import { genFakeId } from '@/utils/mathUtils';
import styles from './index.less';

const { TextArea } = Input;
// namespace声明
const DOMAIN = 'performanceReporting';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, performanceReporting, user: { user } }) => ({
  // loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  // saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...performanceReporting,
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
class PerformanceReportEdit extends React.PureComponent {
  state = {
    evaluate: undefined,
    radioValue: undefined,
  };

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    const { dispatch } = this.props;
    const { id, mode, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/getPeriodList`,
    });
    if (taskId) {
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      }).then(() => {
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
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetail`,
      payload: { id: params },
    }).then(value => {
      this.setState({
        radioValue: value.data?.targetView?.grade,
      });
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
    const { dispatch, formData, form } = this.props;
    const { targetView = {} } = formData;
    const { radioValue } = this.state;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 目前只有hr可以修改，submit如果是true表示和流程有关
        if (params.submit) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: params,
          });
        } else {
          // hr修改考核评分接口，只修改评分
          dispatch({
            type: `${DOMAIN}/gradeSave`,
            payload: {
              ...targetView,
              grade: radioValue,
              indexList: formData.indexList,
            },
          }).then(v => {
            if (v && v.ok) {
              createMessage({ type: 'success', description: '提交成功' });
              router.push(`/hr/prefMgmt/performanceReport?mode=hrList`);
            }
          });
        }
      }
    });
  };

  onChange = e => {
    this.setState({
      radioValue: e.target.value,
    });
  };

  render() {
    // 定义渲染使用的变量
    const {
      form,
      formData,
      dispatch,
      formMode,
      // loading,
      // saveLoading,
      fieldsConfig,
      flowForm,
      targetPeriodList,
    } = this.props;
    const { id, mode, taskId } = fromQs();
    const { taskKey } = fieldsConfig;
    const { evaluate, radioValue } = this.state;
    const {
      targetView = {},
      evaluateEntities = [],
      yearlySummary,
      shortageAndImproveEntities = [],
      indexList = [],
      expectedSupport,
    } = formData;
    // 其他流程
    // const allBpm = [{ docId: formData.id, procDefKey: 'ADM_M04', title: '我的出差申请流程' }];
    return (
      <PageWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          // buttonLoading={loading || saveLoading}
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
              return Promise.resolve(false);
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
              if (taskKey === 'KPI_K03_01_SUBMITER') {
                if (content || formData.yearlySummary) {
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
                    yearlySummary: formData.yearlySummary || content,
                    expectedSupport: formData.expectedSupport,
                    shortageAndImproveEntities: formData.shortageAndImproveEntities.map(v => ({
                      ...v,
                      stage: 2,
                      stageAssessmentId: formData.id,
                    })),
                  });
                } else {
                  createMessage({
                    type: 'warn',
                    description: '请填写年度工作总结！',
                  });
                }
              } else if (
                taskKey === 'KPI_K03_02_DIRECT_LEADER' ||
                taskKey === 'KPI_K03_03_BU_LEADER' ||
                taskKey === 'KPI_K03_04_HR_COMFIRM'
              ) {
                form.validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    if (radioValue) {
                      dispatch({
                        type: `${DOMAIN}/gradeSave`,
                        payload: {
                          ...targetView,
                          grade: radioValue,
                          indexList: formData.indexList,
                        },
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
                        yearlySummary: formData.yearlySummary || content,
                        expectedSupport: formData.expectedSupport,
                        shortageAndImproveEntities: formData.shortageAndImproveEntities.map(v => ({
                          ...v,
                          stage: 2,
                          stageAssessmentId: formData.id,
                        })),
                      });
                    } else {
                      createMessage({
                        type: 'warn',
                        description: '请选择考核等级！',
                      });
                    }
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
              // <Button
              //   size="large"
              //   type="primary"
              //   key="submit"
              //   onClick={() => {
              //     this.handleSubmitProcess(() => {
              //       closeThenGoto(`/user/flow/process?type=procs`);
              //     });
              //   }}
              // // loading={saveLoading}
              // >
              //   提交
              // </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={targetView}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="报告名称"
              placeholder="员工部门+姓名+年度+绩效目标"
              formMode={formMode}
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
              formMode={formMode}
              disabled
              fieldKey="baseBuName"
            />
            <FormItem
              fieldType="BaseInput"
              label="职位"
              placeholder="请输入申请名称"
              formMode={formMode}
              disabled
              fieldKey="position"
            />
            <FormItem
              fieldType="BaseInput"
              label="职级"
              placeholder="请输入申请名称"
              formMode={formMode}
              disabled
              fieldKey="jobGrade"
            />
            <FormItem
              fieldType="BaseInput"
              label="直属负责人"
              placeholder="请输入申请名称"
              formMode={formMode}
              disabled
              fieldKey="presName"
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
              initialValue={formData.createUserId}
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
            formMode={formMode}
            title="年终述职"
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
                title: '直属领导打分',
                align: 'center',
                dataIndex: 'score',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInput"
                    max={100}
                    min={0}
                    fieldKey={`indexList[${index}].score`}
                    disabled={taskKey !== 'KPI_K03_02_DIRECT_LEADER'}
                    required={taskKey === 'KPI_K03_02_DIRECT_LEADER'}
                  />
                ),
              },
            ]}
          />
          {(taskKey === 'KPI_K03_01_SUBMITER' || yearlySummary) && (
            <Card title="年度工作总结" bordered={false}>
              {taskKey === 'KPI_K03_01_SUBMITER' ? (
                <div
                  style={{
                    margin: '10px auto 0',
                    width: '100%',
                  }}
                >
                  <Ueditor
                    id="issueEditor"
                    height="300"
                    width="100%"
                    initialContent={yearlySummary}
                    ref={editor => {
                      this.editor = editor;
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{ padding: '15px', overflow: 'hidden', overflowY: 'scroll' }}
                  className={styles.paper}
                  dangerouslySetInnerHTML={{ __html: yearlySummary }}
                />
              )}
            </Card>
          )}
          {taskKey === 'KPI_K03_01_SUBMITER' ? (
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
          {(taskKey === 'KPI_K03_01_SUBMITER' || expectedSupport) && (
            <Card title="支持与帮助" bordered={false}>
              <TextArea
                rows={4}
                placeholder="请填写支持与帮助"
                defaultValue={expectedSupport}
                disabled={taskKey !== 'KPI_K03_01_SUBMITER'}
                onChange={e => {
                  formData.expectedSupport = e.target.value;
                }}
              />
            </Card>
          )}
          {taskKey !== 'KPI_K03_01_SUBMITER' && (
            <Card title="领导整体评价及建议" style={{ marginTop: '2px' }} bordered={false}>
              <div style={{ border: '1px solid #eee', width: '100%', height: '400px' }}>
                <div style={{ position: 'relative', margin: '15px' }}>
                  <span style={{ display: 'inline-block', width: '85%' }}>
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入整体评价及建议"
                      disabled={
                        mode === 'view' ||
                        taskKey === 'KPI_K03_04_SUBINTER_CONFIRM' ||
                        taskKey === 'KPI_K04_02_RES_CONFIRM'
                      }
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
                      disabled={
                        mode === 'view' ||
                        taskKey === 'KPI_K03_04_SUBINTER_CONFIRM' ||
                        taskKey === 'KPI_K04_02_RES_CONFIRM'
                      }
                      onClick={() => {
                        dispatch({
                          type: `${DOMAIN}/stageAssesmentEvaluateSave`,
                          payload: {
                            stage: 2,
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
                <div
                  style={{
                    marginLeft: '15px',
                    fontSize: '20px',
                    fontWeight: '700',
                    marginTop: '10px',
                  }}
                >
                  全部评价及建议
                </div>
                <div
                  style={{
                    marginLeft: '15px',
                    height: '238px',
                    overflow: 'hidden',
                    overflowY: 'scroll',
                  }}
                >
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
              <div className={styles.examineGrade}>
                <span className={styles.examineGradeLabel}>考核等级</span>
                {taskKey === 'KPI_K03_02_DIRECT_LEADER' ||
                taskKey === 'KPI_K03_03_BU_LEADER' ||
                taskKey === 'KPI_K03_04_HR_COMFIRM' ||
                mode === 'hrEdit' ? (
                  <span className={styles.examineRadio}>
                    <Radio.Group
                      onChange={e => this.onChange(e)}
                      value={radioValue}
                      style={{ display: 'inline-block', width: '100%' }}
                    >
                      <Radio style={{ display: 'inline-block', width: '15%' }} value="A">
                        A
                      </Radio>
                      <Radio style={{ display: 'inline-block', width: '15%' }} value="B">
                        B
                      </Radio>
                      <Radio style={{ display: 'inline-block', width: '15%' }} value="C">
                        C
                      </Radio>
                      <Radio style={{ display: 'inline-block', width: '15%' }} value="D">
                        D
                      </Radio>
                      <Radio style={{ display: 'inline-block', width: '15%' }} value="E">
                        E
                      </Radio>
                    </Radio.Group>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '90%',
                      textAlign: 'center',
                      fontSize: '26px',
                    }}
                  >
                    {targetView.grade}{' '}
                  </span>
                )}
              </div>
            </Card>
          )}
        </BpmWrapper>
        {/* {!taskId && <BpmConnection source={allBpm} />} */}
      </PageWrapper>
    );
  }
}

export default PerformanceReportEdit;
