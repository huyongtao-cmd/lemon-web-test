import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Form, Input, Radio, Divider, InputNumber, Modal } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectProjectTmpl, selectProject } from '@/services/user/project/project';
import { selectUsers } from '@/services/sys/user';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import moment from 'moment';
import ApplyDetail from './Detail';
import TaskSettlement from './component/taskSettlement';
import UniversalSettlement from './component/universalSettlement';
import SettlementModal from './component/settlementModal';
import EquivalentCreate from './Create';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'equivalentCreateFlow';

@connect(({ loading, equivalentCreateFlow, dispatch, equivalentCreate }) => ({
  loading: loading.effects[`${DOMAIN}/queryDetail`] || loading.effects[`${DOMAIN}/queryTaskDetail`],
  equivalentCreateFlow,
  dispatch,
  equivalentCreate,
}))
@Form.create({
  onValuesChange(props, changedFields, state) {
    if (!isEmpty(changedFields)) {
      const key = Object.keys(changedFields)[0];
      if (key === 'settlementType') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: changedFields,
        });
      } else if (key === 'reasonId') {
        props.dispatch({
          type: `${DOMAIN}/updateTaskForm`,
          payload: {
            reasonId: changedFields[key] ? changedFields[key].id : null,
            reasonName: changedFields[key] ? changedFields[key].name : null,
          },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateTaskForm`,
          payload: changedFields,
        });
      }
    }
  },
})
@mountToTab()
class EquivalentCreateFlow extends PureComponent {
  state = {
    close: false,
    // buttonFilter: '1',
    settlementVisible: false,
    params: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    const param = fromQs();
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        }).then(response => {
          if (Object.keys(response).length !== 0) {
            const { taskKey } = response;
            // 查询当量审批页面详情
            dispatch({
              type: `${DOMAIN}/queryDetail`,
              payload: {
                id: param.id,
              },
            });
          }
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  closeModal = flag => {
    const { settlementVisible, close } = this.state;
    this.setState({
      settlementVisible: !settlementVisible,
    });
    if (flag) {
      this.setState({
        close: true,
      });
    }
  };

  handleApply = () => {
    const { params } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/submit`,
      payload: params,
    });
  };

  nextStep = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      equivalentCreateFlow: { formData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) {
        createMessage({ type: 'warn', description: '请填写必填项' });
      } else {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            buttonFilter: '2',
          },
        });
        // this.setState({
        //   buttonFilter: '2',
        // });
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      equivalentCreateFlow: {
        fieldsConfig,
        flowForm,
        formData,
        taskFormData,
        jobType2List,
        capasetLeveldList,
        buttonFilter,
      },
      equivalentCreate: { formData: createFormData },
      form: { getFieldDecorator, validateFieldsAndScroll },
      form,
    } = this.props;
    const { taskKey, buttons } = fieldsConfig;
    const { id, taskId, from, mode } = fromQs();
    // const { buttonFilter, settlementVisible, params, close } = this.state;
    const { settlementVisible, params, close } = this.state;
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={
            taskKey === 'ACC_A70_02_EMPLOYER_CONFIRM_b'
              ? {
                  ...fieldsConfig,
                  buttons: buttons.filter(v => v.filter === buttonFilter),
                }
              : fieldsConfig
          }
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key } = operation;

            const resultParams = {
              FLOW_PASS: 'APPROVED',
              FLOW_COMMIT: 'APPLIED',
              FLOW_RETURN: 'REJECTED',
            };
            this.setState({
              params: {
                ...formData,
                ...taskFormData,
                flow: {
                  // branch,
                  remark,
                  result: resultParams[key],
                  taskId,
                },
              },
            });
            if (key === 'FLOW_RETURN') {
              return Promise.resolve(true);
            }
            if (key === 'FLOW_PASS') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  this.closeModal();
                }
              });
            } else if (key === 'FLOW_COMMIT') {
              dispatch({
                type: `${DOMAIN}/againSumit`,
                payload: {
                  ...createFormData,
                  flow: {
                    // branch,
                    remark,
                    result: resultParams[key],
                    taskId,
                  },
                },
              });
            } else if (key === 'nextStep') {
              this.nextStep();
            } else if (key === 'upStep') {
              const { receiverResId } = taskFormData;
              if (!receiverResId) {
                createMessage({ type: 'error', description: '收入资源不能为空' });
                // eslint-disable-next-line consistent-return
                return;
              }
              dispatch({ type: `${DOMAIN}/clean` }).then(() => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    buttonFilter: '1',
                  },
                });
                this.setState({
                  // buttonFilter: '1',
                  close: false,
                });
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' &&
            taskKey === 'ACC_A70_02_EMPLOYER_CONFIRM_b' &&
            buttonFilter === '1' && (
              <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
                <FieldList
                  layout="horizontal"
                  getFieldDecorator={getFieldDecorator}
                  col={2}
                  legend="任务包基本信息"
                >
                  <Field
                    name="settlementType"
                    label="结算类型"
                    decorator={{
                      initialValue: formData.settlementType,
                      rules: [
                        {
                          required: true,
                          message: '请选择结算类型',
                        },
                      ],
                    }}
                  >
                    <RadioGroup
                      onChange={e => {
                        formData.settlementType = e.target.value;
                        formData.settlementTypeName =
                          e.target.value === 'TASK_PACKAGE_SETTLE'
                            ? '新建任务包结算'
                            : '直接从BU账户结算';
                      }}
                    >
                      <Radio value="TASK_PACKAGE_SETTLE">新建任务包结算</Radio>
                      <Radio value="BU_ACCOUNT_SETTLE">直接从BU账户结算</Radio>
                    </RadioGroup>
                  </Field>
                  <Field
                    name="applyforEqva"
                    label="申请当量数"
                    decorator={{
                      initialValue: formData.applyforEqva,
                      rules: [
                        {
                          required: true,
                          message: '请输入申请当量数',
                        },
                      ],
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <FieldLine label="验收/计价方式" fieldCol={2}>
                    <Field
                      name="acceptMethod"
                      decorator={{
                        initialValue: formData.acceptMethod,
                      }}
                      wrapperCol={{ span: 23, xxl: 24 }}
                    >
                      <UdcSelect code="TSK.ACCEPT_METHOD" placeholder="请选择验收方式" disabled />
                    </Field>
                    <Field
                      name="pricingMethod"
                      decorator={{
                        initialValue: formData.pricingMethod,
                      }}
                      wrapperCol={{ span: 24, xxl: 24 }}
                    >
                      <UdcSelect code="TSK:PRICING_METHOD" placeholder="请选择计价方式" disabled />
                    </Field>
                  </FieldLine>
                  <Field
                    name="disterResId"
                    label="发包人"
                    decorator={{
                      initialValue: formData.disterResId || undefined,
                      rules: [
                        {
                          required: true,
                          message: '请选择发包人',
                        },
                      ],
                    }}
                    // labelCol={{ span: 8, xxl: 8 }}
                  >
                    <Selection.Columns
                      key="disterResId"
                      className="x-fill-100"
                      source={() => selectUsersWithBu()}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="请选择发包人"
                      disabled
                    />
                  </Field>
                  <FieldLine label="复合能力" fieldCol={2} required>
                    <Field
                      name="jobType1Desc"
                      decorator={{
                        initialValue: formData.jobType1Desc,
                        rules: [{ required: true, message: '请选择工种' }],
                      }}
                      wrapperCol={{ span: 23 }}
                    >
                      <Input disabled />
                    </Field>
                    <Field
                      name="jobType2Desc"
                      decorator={{
                        initialValue: formData.jobType2Desc,
                        rules: [{ required: true, message: '请选择工种子类' }],
                      }}
                      wrapperCol={{ span: 23 }}
                    >
                      <Input disabled />
                    </Field>
                    <Field
                      name="capasetLevelName"
                      decorator={{
                        initialValue: formData.capasetLevelName,
                        rules: [{ required: true, message: '请选择级别' }],
                      }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Input disabled />
                    </Field>
                  </FieldLine>
                  <Field label="" presentational>
                    &nbsp;
                  </Field>
                  <Field
                    name="receiverResId"
                    label="接包人"
                    decorator={{
                      initialValue: formData.receiverResId || undefined,
                      rules: [
                        {
                          required: false,
                          message: '请选择接包人',
                        },
                      ],
                    }}
                    // labelCol={{ span: 8, xxl: 8 }}
                  >
                    <Selection.Columns
                      key="receiverResId"
                      className="x-fill-100"
                      source={() => selectUsersWithBu()}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="请选择接包人"
                      disabled
                    />
                  </Field>
                  <Field
                    name="reasonType"
                    label="事由类型"
                    decorator={{
                      initialValue: formData.reasonType || undefined,
                      rules: [
                        {
                          required: false,
                          message: '请选择事由类型',
                        },
                      ],
                    }}
                    // labelCol={{ span: 8, xxl: 8 }}
                  >
                    <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" disabled />
                  </Field>
                  <Field
                    name="reasonDescribe"
                    label="事由描述"
                    decorator={{
                      initialValue: formData.reasonDescribe || undefined,
                      rules: [
                        {
                          required: false,
                          message: '请输入事由描述',
                        },
                      ],
                    }}
                    // labelCol={{ span: 8, xxl: 8 }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="planStartDate"
                    label="计划开始时间"
                    decorator={{
                      initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
                      rules: [
                        {
                          required: false,
                          message: '请填写计划开始时间',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              value &&
                              formData.planEndDate &&
                              moment(formData.planEndDate).isBefore(value)
                            ) {
                              callback('计划开始时间应该早于结束时间');
                            }
                            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                            callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      className="x-fill-100"
                      placeholder="计划开始时间"
                      format="YYYY-MM-DD"
                      disabled
                    />
                  </Field>
                  <Field
                    name="planEndDate"
                    label="计划结束时间"
                    decorator={{
                      initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
                      rules: [
                        {
                          required: false,
                          message: '请填写计划结束时间',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              value &&
                              formData.planStartDate &&
                              moment(value).isBefore(formData.planStartDate)
                            ) {
                              callback('计划结束时间应该晚于开始时间');
                            }
                            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                            callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      className="x-fill-100"
                      placeholder="计划结束时间"
                      format="YYYY-MM-DD"
                      disabled
                    />
                  </Field>
                  <Field
                    name="remark"
                    label="备注"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.remark || undefined,
                    }}
                  >
                    <Input.TextArea rows={3} placeholder="请输入备注" disabled />
                  </Field>
                  <Field
                    name="applyResId"
                    label="申请人"
                    decorator={{
                      initialValue: formData.applyResId || undefined,
                    }}
                  >
                    <Selection.Columns
                      key="applyResId"
                      className="x-fill-100"
                      source={() => selectUsersWithBu()}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统生成"
                      disabled
                    />
                  </Field>
                  <Field
                    name="applyDate"
                    label="申请日期"
                    decorator={{
                      initialValue: formData.applyDate || undefined,
                    }}
                  >
                    <Input placeholder="系统生成" disabled />
                  </Field>
                </FieldList>
              </Card>
            )}
          {mode === 'edit' && taskKey === 'ACC_A70_01_SUBMIT_i' && <EquivalentCreate />}
          {mode === 'edit' &&
            taskKey === 'ACC_A70_02_EMPLOYER_CONFIRM_b' &&
            buttonFilter === '2' &&
            formData.settlementType === 'TASK_PACKAGE_SETTLE' && (
              <TaskSettlement form={form} close={close} />
            )}
          {mode === 'edit' &&
            taskKey === 'ACC_A70_02_EMPLOYER_CONFIRM_b' &&
            buttonFilter === '2' &&
            formData.settlementType === 'BU_ACCOUNT_SETTLE' && (
              <UniversalSettlement form={form} close={close} />
            )}
          {mode === 'view' && <ApplyDetail />}
          {settlementVisible ? (
            <SettlementModal
              visible={settlementVisible}
              closeModal={this.closeModal}
              handleApply={this.handleApply}
            />
          ) : null}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}
export default EquivalentCreateFlow;
