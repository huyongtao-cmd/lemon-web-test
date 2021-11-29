// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';
import ButtonCard from '@/components/production/layout/ButtonCard';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { outputHandle } from '@/utils/production/outputUtil';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { fromQs } from '@/utils/production/stringUtil';
import { getUrl } from '@/utils/flowToRouter';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';

// 接口
import {
  informationDetail,
  informationLeaveApply,
  informationLeaveOverAll,
  informationLeaveFlowDetail,
} from '@/services/production/user';

import { closeThenGoto } from '@/layouts/routerControl';
import { isEmpty } from 'ramda';
import { connect } from 'dva';
import moment from 'moment';

// namespace声明
const DOMAIN = 'informationMove';

/***
 * 员工离职
 */
@connect(({ loading, dispatch, informationMove, user: { user } }) => ({
  dispatch,
  ...informationMove,
  user,
}))
@Form.create()
class InformationDimission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      loading: false,
    };
  }

  componentDidMount() {
    const { id, mode, taskId, flag, prcId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' || taskId ? 'EDIT' : 'DESCRIPTION';
    this.updateModelState({ formMode, taskId });
    this.callModelEffects('updateForm', { id });
    taskId && this.callModelEffects('fetchConfig', taskId);
    !prcId && this.loadData();
    prcId && this.flowAccInit(id);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

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

  loadData = async () => {
    const { userId } = fromQs();
    const { formData, loading } = this.state;
    this.setState({ loading: true });
    const { data } = await outputHandle(informationDetail, { id: userId });
    this.setState({ formData: { ...data, userId }, loading: false });
  };

  // 查看流程详情
  flowAccInit = async id => {
    const { formData } = this.state;
    this.setState({ loading: true });
    const res = await outputHandle(informationLeaveFlowDetail, { id });
    this.setState({
      loading: false,
      formData: res.data,
    });
  };

  handleOverall = async (param, cb) => {
    const { id } = fromQs();
    const { form } = this.props;
    const { formData, btnLoading } = this.state;
    const basic = await form.validateFields();
    const data = {
      ...basic,
      id,
      ...param,
    };
    const resSub = await outputHandle(informationLeaveOverAll, data);
    cb(resSub);
  };

  // 提交离职流程
  handleSave = async (param, cb) => {
    const { form } = this.props;
    const { formData, btnLoading } = this.state;
    const { id: userId } = formData;
    const basic = await form.validateFields();
    const data = {
      ...basic,
      userId,
      ...param,
    };
    const resSub = await outputHandle(informationLeaveApply, data, 'string', false);
    if (resSub.ok) {
      cb(resSub);
    }
  };

  render() {
    const { loading, formData } = this.state;
    const {
      form,
      fieldsConfig,
      flowForm,
      taskId,
      formMode,
      user: { extInfo = {} },
    } = this.props;
    const { mode } = fromQs();
    const tempFormMode = taskId || formData.apprStatus === 'FINISH' ? 'EDIT' : formMode;
    const { taskKey } = fieldsConfig;
    // taskKey==='USER03_05_HR'  显示"离职类型、离职审批表"，且可编辑
    // taskKey==='USER03_02_BU_LEADERS' 显示工作交接且可编辑
    /*界面模式
    formData.apprStatus==='FINISH'--> disabled
    'USER03_02_BU_LEADERS'节点之后，工作交接disabled
    */
    const disabledView = !['USER03_02_BU_LEADERS', 'USER03_05_HR'].includes(taskKey);
    const allBpm = [{ docId: formData.id, procDefKey: 'USER03', title: '员工离职流程' }];
    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig} // 通过、退回、返回（按钮由后端返回）
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          // 流程按钮
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            // 加签
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            // 提交
            if (key === 'FLOW_COMMIT') {
              this.handleSave(
                {
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                },
                () => {
                  const url = getUrl().replace('edit', 'view'); // view代替edit
                  closeThenGoto(url);
                }
              );
              // promise 为false,后续组件方法不走,走自己的逻辑
              return Promise.resolve(false);
            }
            // 退回
            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
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
                  });
                },
              });
            }
            // 通过
            if (key === 'FLOW_PASS') {
              this.handleOverall(
                {
                  result: 'APPROVED',
                  procTaskId: taskId,
                  procRemark: remark,
                  branch,
                  dryRunFlag: disabledView, // 只推流程不对数据进行更新
                  submit: true,
                },
                () => {
                  const url = getUrl().replace('edit', 'view');
                  closeThenGoto(url);
                }
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {[
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  this.handleSave(
                    {
                      submit: true,
                    },
                    () => {
                      closeThenGoto(`/user/flow/process?type=procs`);
                    }
                  );
                }}
                // loading={btnLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          {/*编辑模式节点 ：USER03_02_BU_LEADERS、USER03_05_HR*/}
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={tempFormMode}
            defaultColumnStyle={8}
          >
            <FormItem
              required
              fieldType="UserSimpleSelect"
              label="姓名"
              fieldKey="userId"
              disabled
              descriptionRender={formData.userName}
            />
            {/*<FormItem required fieldType='BaseInput' label='离职人姓名' fieldKey='name' />*/}
            <FormItem
              required
              fieldType="BaseDatePicker"
              label="入职时间"
              fieldKey="enrollDate"
              disabled
            />
            <FormItem
              fieldType="BuSimpleSelect"
              label="所属BU"
              fieldKey="buId"
              required
              disabled
              descriptionRender={formData.buName}
            />
            <FormItem
              fieldType="BaseAllOuSimpleSelect"
              label="所属公司"
              fieldKey="ouId"
              required
              disabled
              descriptionRender={formData.ouName}
            />
            <FormItem required fieldType="BaseInput" label="职位" fieldKey="position" disabled />
            <FormItem
              required
              fieldType="ResSimpleSelect"
              label="直属上级"
              fieldKey="parentResId"
              disabled
              descriptionRender={formData.parentName}
            />
            <FormItem
              required
              fieldType="BaseCustomSelect"
              label="Base地"
              fieldKey="baseCity"
              parentKey="CUS:CITY"
              disabled
            />
            <FormItem
              required
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              initialValue={extInfo.resId + ''}
              disabled
              descriptionRender={formData.applyName}
            />
            <FormItem
              required
              fieldType="BaseDatePicker"
              label="离职时间"
              disabled={taskId || formData.apprStatus === 'FINISH'}
              fieldKey="leaveDate"
              initialValue={moment(new Date()).format('YYYY-MM-DD')}
            />
            <FormItem
              required
              fieldType="BaseInputTextArea"
              label="离职原因"
              disabled={taskId || formData.apprStatus === 'FINISH'}
              fieldKey="leaveReason"
            />
            {taskKey === 'USER03_05_HR' || formData.apprStatus === 'FINISH' ? (
              <FormItem
                label="离职类型"
                fieldType="BaseRadioSelect"
                key="leaveType"
                fieldKey="leaveType"
                // descriptionField='leaveType' // 单选详情模式回显方式，需要后端传翻译后的字段回显
                required
                disabled={taskKey !== 'USER03_05_HR'}
                options={[{ label: '主动离职', value: '1' }, { label: '自动离职', value: '0' }]}
              />
            ) : (
              <></>
            )}
            {taskKey === 'USER03_05_HR' || formData.apprStatus === 'FINISH' ? (
              <FormItem
                fieldType="FileUpload"
                fieldKey="attachment"
                label="离职审批表"
                required
                disabled={taskKey !== 'USER03_05_HR'}
                fileList={formData.attachments}
                multiple
              />
            ) : (
              <></>
            )}
          </BusinessForm>
          {(taskId || formData.apprStatus === 'FINISH') && (
            <BusinessForm
              title="离职移交审批"
              form={form}
              formData={formData}
              formMode={tempFormMode}
              defaultColumnStyle={24}
            >
              {/*离职部门领导审批*/}
              <FormItem
                label="是否完成工作交接"
                fieldType="BaseRadioSelect"
                key="workHandover"
                required
                fieldKey="workHandover"
                disabled={
                  taskKey !== 'USER03_02_BU_LEADERS' || mode === 'view' || formData.workHandover
                }
                options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]}
              />
              {/*财务部门领导审批*/}
              <FormItem
                label="是否完成财务清算"
                fieldType="BaseRadioSelect"
                key="financeHandover"
                fieldKey="financeHandover"
                required
                disabled={
                  taskKey !== 'USER03_02_BU_LEADERS' || mode === 'view' || formData.financeHandover
                }
                options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]}
              />
              {/*公共事务部门领导审批*/}
              <FormItem
                label="是否完成移交物品（如：门禁卡。固定资产、行政用品）"
                fieldType="BaseRadioSelect"
                key="admHandover"
                fieldKey="admHandover"
                required
                options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]}
                disabled={
                  taskKey !== 'USER03_02_BU_LEADERS' || mode === 'view' || formData.admHandover
                }
              />
              {/*组织与人才部门领导审批*/}
              <FormItem
                label="是否完成结算工资、福利（如员工手册、培训费、退工证明或其他）"
                fieldType="BaseRadioSelect"
                key="hrHandover"
                fieldKey="hrHandover"
                required
                options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]}
                disabled={
                  taskKey !== 'USER03_02_BU_LEADERS' || mode === 'view' || formData.admHandover
                }
              />
            </BusinessForm>
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default InformationDimission;
