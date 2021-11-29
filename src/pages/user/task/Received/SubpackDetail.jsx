import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, clone } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import { fromQs } from '@/utils/stringUtils';
import BuDetail from './buDetail';

const TASK_TRANSFER_SUBMIT = 'TSK_P07_01_TASK_TRANSFER_SUBMIT_i';
// const CREATE_TASK = 'TSK_P07_03_CREATE_TASK_b';
const BU_APPR = 'TSK_P07_03_BU_APPR_b';
const CREATE_TASK = 'TSK_P07_04_CREATE_TASK_b';

const DOMAIN = 'userTaskSubpackDetail';
const { Description } = DescriptionList;

@connect(({ dispath, userTaskSubpackDetail, user }) => ({
  dispath,
  ...userTaskSubpackDetail,
  user,
}))
@mountToTab()
class SubpackDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      }).then(() => {
        setTimeout(() => {
          taskId
            ? dispatch({
                type: `${DOMAIN}/fetchConfig`,
                payload: taskId,
              })
            : dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  fieldsConfig: {},
                },
              });
        }, 0);
      });
    }
  }

  handleEdit = () => {
    const {
      userTaskSubpackDetail: { formData },
    } = this.props;
    const { apprStatus } = formData;
    if (!apprStatus || apprStatus === 'NOTSUBMIT') {
      const { id } = fromQs();
      closeThenGoto(`/user/task/subpack?tId=${id}`);
    } else {
      createMessage({ type: 'error', description: '当前状态不可编辑' });
    }
  };

  handleCreate = () => {
    const { id } = fromQs();
    closeThenGoto(`/user/task/edit?subpackId=${id}`);
  };

  handleBack = () => {
    closeThenGoto('/user/flow/process');
  };

  render() {
    const {
      dispatch,
      formData,
      fieldsConfig: config,
      flowForm,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    const { id, taskId } = fromQs();
    let fieldsConfig = {};
    if (!isEmpty(config)) {
      // 创建转包任务包节点 审批中只有通过按钮
      const { taskKey } = config;
      if (taskKey === CREATE_TASK && formData.apprStatus === 'APPROVING') {
        const newConfig = clone(config);
        newConfig.buttons.pop();
        fieldsConfig = newConfig;
      } else if (taskKey === CREATE_TASK && formData.apprStatus === 'APPROVED') {
        // 创建转包任务包节点 审批结束只有创建转包任务包按钮
        const newConfig = clone(config);
        const btns = newConfig.buttons.slice(-1);
        fieldsConfig = {
          ...newConfig,
          buttons: extInfo && extInfo.resId === formData.disterResId ? btns : [],
        };
      } else {
        fieldsConfig = config;
      }
    }

    return (
      <PageHeaderWrapper title="任务转包详情">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          disableBpm={formData.apprStatus === 'APPROVED'}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey: tkey } = fieldsConfig;
            const { remark } = bpmForm;
            // 发起节点
            if (tkey === TASK_TRANSFER_SUBMIT) {
              closeThenGoto(`/user/task/subpack?tId=${id}&taskId=${taskId}&remark=${remark}`);
              return Promise.resolve(false);
            }
            const { key } = operation;

            // 创建转包任务包节点 通过按钮
            if (tkey === CREATE_TASK && key === 'APPROVED') {
              return pushFlowTask(taskId, { remark, result: key }).then(({ status, response }) => {
                if (status === 200) {
                  setTimeout(() => {
                    createConfirm({
                      content:
                        '是否创建转包任务包？如果取消，请在任务详情页选择相应的转包流程进行修改',
                      onOk: () => closeThenGoto(`/user/task/edit?subpackId=${id}`),
                      onCancel: () => closeThenGoto(`/user/task/subpackDetail?id=${id}`),
                    });
                  }, 0);
                }
                return Promise.resolve(false);
              });
            }

            // 创建转包任务包按钮
            if (tkey === CREATE_TASK && key === 'CREATE_SUB_TASK') {
              closeThenGoto(`/user/task/edit?subpackId=${id}`);
              return Promise.resolve(false);
            }

            return Promise.resolve(true);
          }}
        >
          {fieldsConfig.taskKey === BU_APPR ? (
            <BuDetail />
          ) : (
            <>
              {formData.apprStatus === 'APPROVED' &&
                extInfo &&
                extInfo.resId === formData.disterResId && (
                  <Card className="tw-card-rightLine">
                    <Button
                      className="tw-btn-primary"
                      type="primary"
                      icon="plus-circle"
                      size="large"
                      onClick={this.handleCreate}
                    >
                      创建转包任务包
                    </Button>

                    <Button
                      className={classnames('separate', 'tw-btn-default')}
                      icon="undo"
                      size="large"
                      onClick={this.handleBack}
                    >
                      {formatMessage({ id: `misc.rtn`, desc: '返回' })}
                    </Button>
                  </Card>
                )}

              <Card
                className="tw-card-adjust"
                bordered={false}
                title={
                  <Title
                    icon="profile"
                    id="user.task.subpackDetail"
                    defaultMessage="转包信息详情"
                  />
                }
              >
                <DescriptionList size="large" col={2}>
                  <Description term="转包人">{formData.disterResName}</Description>
                  <Description term="任务名称">{formData.taskName}</Description>
                  <Description term="接收资源">{formData.receiverResName}</Description>
                  <Description term="接收资源BU">{formData.receiverBuName}</Description>
                  <Description term="复合能力">{formData.capasetLevelName}</Description>
                  <Description term="来源任务包">{formData.pname}</Description>
                  <Description term="来源任务包总当量/金额">
                    {formData.eqvaQty}/{formData.amt}
                  </Description>
                  <Description term="转包当量数">{formData.subcontractEqva}</Description>
                  <Description term="计划时间">
                    {formData.planStartDate}~{formData.planEndDate}
                  </Description>
                  <Description term="备注">{formData.remark1}</Description>
                </DescriptionList>
              </Card>
            </>
          )}

          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_P07' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default SubpackDetail;
