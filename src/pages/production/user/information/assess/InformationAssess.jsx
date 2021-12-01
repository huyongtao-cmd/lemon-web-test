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
import { fromQs } from '@/utils/production/stringUtil';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';

// 接口
import {
  informationDetail,
  informationAssSubmit,
  informationAssOverAll,
  informationAssFlowDetail,
} from '@/services/production/user';

import { connect } from 'dva';
import moment from 'moment';

// namespace声明
const DOMAIN = 'informationMove';

/***
 * 试用期考核
 */
@connect(({ loading, dispatch, informationMove, user: { user } }) => ({
  dispatch,
  ...informationMove,
  user,
}))
@Form.create()
class InformationAssess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      btnLoading: false,
      pageLoading: false,
    };
  }

  componentDidMount() {
    const { id, mode, taskId, flag, prcId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    this.updateModelState({ formMode, taskId });
    this.callModelEffects('updateForm', { id });
    !prcId && this.loadData();
    taskId && this.callModelEffects('fetchConfig', taskId);
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

  // 查看流程详情
  flowAccInit = async id => {
    const { formData } = this.state;
    this.setState({ pageLoading: true });
    const res = await outputHandle(informationAssFlowDetail, { id });
    this.setState({
      pageLoading: false,
      formData: res.data,
    });
  };

  loadData = async () => {
    const { userId } = fromQs();
    const { formData, pageLoading } = this.state;
    this.setState({ pageLoading: true });
    const { data } = await outputHandle(informationDetail, { id: userId });
    this.setState({
      formData: {
        ...data,
        userId,
      },
      pageLoading: false,
    });
  };

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
    const resSub = await outputHandle(informationAssSubmit, data, 'string', false);
    if (resSub.ok) {
      cb(resSub);
    }
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
    const resSub = await outputHandle(informationAssOverAll, data);
    cb(resSub);
  };

  render() {
    const {
      form,
      fieldsConfig,
      flowForm,
      taskId,
      user: { extInfo = {} },
      formMode,
    } = this.props;
    const { pageLoading, btnLoading, formData } = this.state;
    const { taskKey } = fieldsConfig;
    const disabledView = taskKey === 'USER02_04_USER_CONFIRM';
    const allBpm = [{ docId: formData.id, procDefKey: 'USER02', title: '试用期考核流程' }];
    return (
      <PageWrapper loading={pageLoading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig} // 通过、退回、返回（按钮由后端返回）
          flowForm={flowForm}
          buttonLoading={pageLoading}
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
                  dryRunFlag: !disabledView,
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
                loading={btnLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="试用期考核申请"
            form={form}
            formData={formData}
            formMode={formMode}
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
            <FormItem
              fieldType="BaseAllOuSimpleSelect"
              label="所属公司"
              fieldKey="ouId"
              required
              descriptionRender={formData.ouName}
              disabled
            />
            <FormItem
              fieldType="BuSimpleSelect"
              label="所属BU"
              fieldKey="buId"
              required
              descriptionRender={formData.buName}
              disabled
            />
            <FormItem
              required
              fieldType="BaseInput"
              label="职位"
              fieldKey="position"
              disabled
              descriptionRender={formData.position}
            />
            <FormItem
              required
              fieldType="ResSimpleSelect"
              label="直属上级"
              fieldKey="parentResId"
              disabled
              descriptionRender={formData.parentUserName}
            />
            <FormItem
              required
              fieldType="BaseDatePicker"
              label="入职时间"
              fieldKey="enrollDate"
              disabled
            />
            <FormItem
              required
              fieldType="BaseDatePicker"
              label="转正时间"
              fieldKey="regularDate"
              initialValue={moment(new Date()).format('YYYY-MM-DD')}
            />
            <FormItem
              required
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              initialValue={extInfo.resId + ''}
              disabled
              descriptionRender={formData.applyUserName}
            />
            <FormItem
              label="个人总结"
              fieldType="BaseInputTextArea"
              fieldKey="selfEval"
              placeholder={taskKey !== 'USER02_04_USER_CONFIRM' ? '由员工个人填写' : '请填写'}
              disabled={taskKey !== 'USER02_04_USER_CONFIRM'}
            />
          </BusinessForm>
          {/*
          {
            // TODO: 试用期考核辞退确认时显示
            <BusinessForm
              title='部门负责人意见'
              form={form}
              formData={formData}
              // formMode={formMode}
              defaultColumnStyle={8}
            >
              <FormItem
                label='意见'
                fieldType='BaseInputTextArea'
                fieldKey='222'
                // disabled={}
              />
            </BusinessForm>}
          */}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default InformationAssess;
