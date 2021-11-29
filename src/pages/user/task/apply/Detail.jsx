import React, { PureComponent } from 'react';
import { Button, Card } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil, clone } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { closeThenGoto } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { doTask } = api.bpm;
const { Description } = DescriptionList;

const TASK_APPLY_ASSIGN_POINT = 'TSK_P03_01_TASK_PACKAGE_SUBMIT_i';
const TASK_FLOW_VIEW = 'TSK_P03_02_EMPLOYER_CONFIRM_b';
const TASK_FLOW_SUBMIT = 'TSK_P03_01_TASK_PACKAGE_SUBMIT_i';
const DOMAIN = 'userTaskApplyDetail';
@connect(({ loading, userTaskApplyDetail, dispatch, user }) => ({
  loading,
  ...userTaskApplyDetail,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class UserDashboard extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/clean`,
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    }).then(datum => {
      const { user } = this.props;
      const { resId } = user.user.extInfo;
      const { apprStatus, disterResId, taskId } = datum;
      if (apprStatus === 'APPROVED' && disterResId === resId && isNil(taskId)) {
        createConfirm({
          content: '当前资源任务包未创建，是否去创建任务包？',
          onOk: () => closeThenGoto(`/user/task/edit?applyId=${param.id}`),
        });
      }
    });

    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  render() {
    const {
      loading,
      formData,
      fieldsConfig: config,
      flowForm,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = !!loading.effects[`${DOMAIN}/query`];
    const param = fromQs();

    let fieldsConfig = {};
    if (!isEmpty(config)) {
      const { taskKey } = config;
      // 提交节点
      if (
        taskKey === TASK_FLOW_SUBMIT &&
        (formData.apprStatus === 'NOTSUBMIT' ||
          formData.apprStatus === 'REJECTED' ||
          formData.apprStatus === 'WITHDRAW')
      ) {
        fieldsConfig = config;
      }
      // 发包人确认节点 审批中只有通过和拒绝按钮
      if (taskKey === TASK_FLOW_VIEW && formData.apprStatus === 'APPROVING') {
        const newConfig = clone(config);
        newConfig.buttons.pop();
        fieldsConfig = newConfig;
      }
      // 发包人确认节点 审批通过的只有发包人有新建任务包按钮
      if (taskKey === TASK_FLOW_VIEW && formData.apprStatus === 'APPROVED') {
        const newConfig = clone(config);
        const btns = newConfig.buttons.slice(-1);
        fieldsConfig = {
          ...newConfig,
          buttons: extInfo && extInfo.resId === formData.disterResId ? btns : [],
        };
      }
    }

    return (
      <PageHeaderWrapper title="任务包申请详情">
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
            const { taskKey } = fieldsConfig;
            // 提交任务包申请节点
            if (taskKey === TASK_APPLY_ASSIGN_POINT) {
              closeThenGoto(
                `/user/task/apply?id=${formData.id}&mode=update&apprId=${param.taskId}`
              );
              return Promise.resolve(false);
            }
            const { key } = operation;
            // 发包人确认节点
            // 通过按钮
            if (key === 'APPROVED') {
              return request
                .post(toUrl(doTask, { id: param.taskId }), {
                  body: {
                    remark: bpmForm.remark,
                    result: key,
                  },
                })
                .then(({ status, response }) => {
                  setTimeout(() => {
                    createConfirm({
                      content: '是否给该资源创建任务包？',
                      onOk: () => closeThenGoto(`/user/task/edit?applyId=${param.id}`),
                    });
                  }, 0);

                  return Promise.resolve(false);
                });
            }
            // 新建任务包按钮
            if (key === 'CREATE_TASK') {
              closeThenGoto(`/user/task/edit?applyId=${param.id}`);
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              disabled={disabledBtn || formData.apprStatus === 'APPROVING'}
              onClick={() => closeThenGoto(`/user/task/apply?id=${formData.id}&mode=update`)}
            >
              {formatMessage({ id: `misc.update`, desc: '编辑' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            title={
              <Title
                icon="profile"
                id="app.settings.menuMap.taskApply"
                defaultMessage="任务包申请"
              />
            }
            bordered={false}
          >
            {formData.id ? (
              <>
                <DescriptionList
                  size="large"
                  title={formatMessage({
                    id: `app.settings.menuMap.basicMessage`,
                    desc: '基本信息',
                  })}
                  col={2}
                >
                  <Description term="发包人">{formData.disterResName}</Description>
                  <Description term="接包人">{formData.receiverResName}</Description>
                  <Description term="任务名称">{formData.taskName}</Description>
                  {/* // capasetLevelId */}
                  <Description term="复合能力">{formData.capasetLevelName}</Description>
                  <Description term="事由类型">{formData.reasonTypeDesc}</Description>
                  <Description term="事由描述">{formData.reasonDesc}</Description>
                  <Description term="验收方式">{formData.acceptMethodDesc}</Description>

                  <Description term="计价方式">{formData.pricingMethodDesc}</Description>
                  <Description term="任务当量">{formData.eqvaQty}</Description>
                  <Description term="当量系数">{formData.eqvaRatio}</Description>

                  <Description term="预计开始时间">
                    {formData.planStartDate && formatDT(formData.planStartDate, 'YYYY-MM-DD')}
                  </Description>
                  <Description term="预计结束时间">
                    {formData.planEndDate && formatDT(formData.planEndDate, 'YYYY-MM-DD')}
                  </Description>
                  <DescriptionList size="large" col={1}>
                    <Description term="备注">
                      <pre>{formData.remark}</pre>
                    </Description>
                  </DescriptionList>
                  <Description term="申请人">{formData.createUserName}</Description>
                  <Description term="申请日期">
                    {formatDT(formData.createTime, 'YYYY-MM-DD')}
                  </Description>
                </DescriptionList>
              </>
            ) : (
              <Loading />
            )}
          </Card>
          {!param.taskId && <BpmConnection source={[{ docId: param.id, procDefKey: 'TSK_P03' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default UserDashboard;
