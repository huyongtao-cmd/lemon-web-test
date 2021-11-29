import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Select, Card, Form, Input, Radio, Divider, Modal } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { sub, genFakeId } from '@/utils/mathUtils';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import ResVacationTable from './table/ResVacationTable';
import DetailEntityTable from './table/DetailEntityTable';
import RecentResVacationTable from './table/RecentResVacationTable';
import ViewDetail from './ViewDetail';
import TaskOne from './TaskOne';

const DOMAIN = 'vacationFlowNew';

@connect(({ loading, vacationFlowNew, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/submit`],
  ...vacationFlowNew,
  dispatch,
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class VacationApplyFlow extends Component {
  componentDidMount() {
    const { id, copy, mode, currentNode = 'create', taskId } = fromQs();
    this.updateModelState(id, taskId);
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    // const {
    //   formData,
    //   user: { extInfo = {} }, // 取当前登陆人的resId
    // } = this.props;
    taskId && this.callModelEffects('fetchConfig', taskId);
    id && this.callModelEffects('queryDetail', id);
  }

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
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      formData,
      resData,
      baseBuData,
      flowForm,
      fieldsConfig,
      formMode,
      currentNode,
      // id,
      taskId,
      attachments,
      hrattachments,
      addattachments,
    } = this.props;
    const { taskKey, buttons } = fieldsConfig;
    const { mode, id } = fromQs();
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
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
            const { key, branches } = operation;
            if (key === 'FLOW_PASS') {
              if (taskKey === 'RES_R04_02_HR_APPROVE') {
                form.validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    this.callModelEffects('updateForm', {
                      ...values,
                    });
                    const { addFlag, addList, date } = formData;
                    if (addFlag && !addList) {
                      form.setFields({
                        addList: {
                          value: undefined,
                          errors: [new Error('请输入补充附件清单')],
                        },
                      });
                    }
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        result: 'APPROVED',
                        taskId,
                        procRemark: remark,
                        branch,
                        dryRunFlag: true,
                        submit: true,
                      },
                    });
                  }
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/submit`,
                  payload: {
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                    dryRunFlag: true,
                    submit: true,
                  },
                });
              }
            }

            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
                  pushFlowTask(taskId, {
                    remark,
                    result: 'REJECTED',
                    branch,
                    submit: true,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  });
                },
              });
            }
            if (key === 'FLOW_COMMIT') {
              dispatch({
                type: `${DOMAIN}/submit`,
                payload: {
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                  dryRunFlag: true,
                  submit: true,
                },
              });
            }
          }}
        >
          {mode === 'edit' &&
            taskKey === 'RES_R04_01_SUBMIT_i' && <TaskOne detailId={id} taskId={taskId} />}
          {mode === 'edit' &&
            taskKey !== 'RES_R04_01_SUBMIT_i' && (
              <BusinessForm
                title="基本信息1"
                form={form}
                formData={formData}
                formMode={formMode}
                defaultColumnStyle={12}
              >
                <FormItem fieldType="BaseInput" label="申请人" fieldKey="apprResName" disabled />
                <FormItem fieldType="BaseInput" label="申请日期" fieldKey="apprDate" disabled />
                <FormItem fieldType="BaseInput" label="申请单号" fieldKey="applyNo" disabled />
                <FormItem
                  fieldType="BaseInput"
                  label="假期类型"
                  fieldKey="vacationTypeDesc"
                  disabled
                />
                <FormItem
                  fieldType="BaseDateRangePicker"
                  label="休假开始/结束日"
                  fieldKey="date"
                  disabled
                />
                <FormItem fieldType="BaseInput" label="休假天数" fieldKey="vacationDays" disabled />
                {/* <FormItem
                  fieldType="BaseFileManagerEnhance"
                  label="申请人附件"
                  fieldKey="attachment"
                  api="/api/production/vac/sfs/token"
                  dataKey={formData.id}
                  disabled
                /> */}
                <FormItem
                  fieldType="FileUpload"
                  fieldKey="attachment"
                  label="申请人提交附件"
                  fileList={attachments}
                  multiple
                  preview
                  disabled
                />
                <FormItem fieldType="BaseInputTextArea" label="事由" fieldKey="reason" disabled />
                <FormItem
                  fieldType="BaseInputTextArea"
                  label="工作安排"
                  fieldKey="workPlan"
                  disabled
                />
                {/* <FormItem
                  fieldType="BaseFileManagerEnhance"
                  label="人事上传附件"
                  fieldKey="hrAttachment"
                  api="/api/production/vacAdd/sfs/token"
                  dataKey={formData.id}
                  visible={
                    formData.vacationTypeDesc !== '事假' && formData.vacationTypeDesc !== '年假'
                  }
                  disabled={currentNode !== 'hrCheck'}
                /> */}
                <FormItem
                  fieldType="FileUpload"
                  fieldKey="hrAttachment"
                  label="人事上传附件"
                  fileList={hrattachments}
                  visible={
                    formData.vacationTypeDesc !== '事假' && formData.vacationTypeDesc !== '年假'
                  }
                  multiple
                  disabled={currentNode !== 'hrCheck'}
                  preview={currentNode !== 'hrCheck'}
                />
                <FormItem
                  fieldType="BaseRadioSelect"
                  label="休假后补充附件"
                  fieldKey="addFlag"
                  options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]}
                  visible={
                    formData.vacationTypeDesc !== '事假' && formData.vacationTypeDesc !== '年假'
                  }
                  disabled={currentNode !== 'hrCheck'}
                  required
                />
                <FormItem
                  fieldType="BaseInputTextArea"
                  label="补充附件清单"
                  fieldKey="addList"
                  visible={
                    formData.vacationTypeDesc !== '事假' && formData.vacationTypeDesc !== '年假'
                  }
                  disabled={currentNode !== 'hrCheck'}
                />
                {/* <FormItem
                  fieldType="BaseFileManagerEnhance"
                  label="补充附件"
                  fieldKey="addAttachment"
                  api="/api/production/vacAddAtt/sfs/token"
                  dataKey={formData.id}
                  visible={
                    formData.vacationTypeDesc !== '事假' &&
                    formData.vacationTypeDesc !== '年假' &&
                    currentNode !== 'hrCheck'
                  }
                  disabled={currentNode !== 'addCheck'}
                /> */}
                <FormItem
                  fieldType="FileUpload"
                  fieldKey="addAttachment"
                  label="补充附件"
                  fileList={addattachments}
                  visible={
                    formData.vacationTypeDesc !== '事假' &&
                    formData.vacationTypeDesc !== '年假' &&
                    currentNode !== 'hrCheck'
                  }
                  multiple
                  disabled={currentNode !== 'addCheck'}
                  preview={currentNode !== 'addCheck'}
                />
              </BusinessForm>
            )}
          {mode === 'edit' && taskKey !== 'RES_R04_01_SUBMIT_i' && <DetailEntityTable />}
          {mode === 'view' && <ViewDetail detailId={id} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default VacationApplyFlow;
