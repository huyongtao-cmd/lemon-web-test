import React, { PureComponent } from 'react';
import { Button, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';

import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs, toUrl } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import { isEmpty, clone } from 'ramda';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';

const { Description } = DescriptionList;

const DOMAIN = 'resActFinishDetail';

const TASK_FLOW_CONFIRM = 'TSK_P08_02_MANAGER_CONFIRM_b';
const TASK_FLOW_SUBMIT = 'TSK_P08_01_FINISH_APPLY_SUBMIT_i';

@connect(({ loading, resActFinishDetail, dispatch, user }) => ({
  loading,
  ...resActFinishDetail,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class ResActFinishDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
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
      evalVisible,
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
      fieldsConfig = config;
      // 提交节点
      // if (
      //   taskKey === TASK_FLOW_SUBMIT &&
      //   (formData.apprStatus === 'NOTSUBMIT' ||
      //     formData.apprStatus === 'REJECTED' ||
      //     formData.apprStatus === 'WITHDRAW')
      // ) {
      //   fieldsConfig = config;
      // }
      // // 发包人确认节点 审批中只有通过和拒绝按钮
      // if (taskKey === TASK_FLOW_CONFIRM && formData.apprStatus === 'APPROVING') {
      //   const newConfig = clone(config);
      //   newConfig.buttons.pop();
      //   fieldsConfig = newConfig;
      // }
    }

    return (
      <PageHeaderWrapper title="活动完工申请">
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
            const { key } = operation;

            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };

            if (key === 'EDIT') {
              closeThenGoto(
                `/user/task/resActFinish?id=${param.id}&apprId=${param.taskId}&remark=${
                  bpmForm.remark
                }`
              );
            }

            if (key === 'APPROVED') {
              dispatch({
                type: `evalCommonModal/query`,
                payload: {
                  evalClass: 'ACTIVITY',
                  evalType: 'SENDER2RECEIVER_ACT',
                  evalerResId: formData.managerId,
                  evaledResId: formData.receiverResId,
                  sourceId: formData.id,
                },
              });
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  evalVisible: true,
                },
              });

              // dispatch({
              //   type: `${DOMAIN}/approve`,
              //   payload,
              // })

              return Promise.resolve(true);
            }

            if (key === 'REJECTED') {
              // 不走封装的按钮控制，应为有多分支，后端审批接口入参策略不一致
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              // disabled={disabledBtn || formData.apprStatus === 'APPROVING'}
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
                id="app.settings.menuMap.basicMessage"
                defaultMessage="活动完工申请"
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
                  <Description term="活动编号">{formData.actNo}</Description>
                  <Description term="活动名称">{formData.actName}</Description>
                  <Description term="预计开始日期">{formData.planStartDate}</Description>
                  <Description term="预计结束日期">{formData.planEndDate}</Description>

                  <Description term="活动当量">{formData.eqvaQty}</Description>
                  <Description term="已结算当量">{formData.settledEqva}</Description>

                  <Description term="要求文档清单">{formData.requiredDocList}</Description>
                  <Description term="完工说明">{formData.finishDesc}</Description>
                </DescriptionList>
              </>
            ) : (
              <Loading />
            )}
          </Card>
          {!param.taskId && <BpmConnection source={[{ docId: param.id, procDefKey: 'TSK_P08' }]} />}
        </BpmWrapper>
        <EvalCommonModal
          visible={evalVisible}
          toggle={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                evalVisible: false,
              },
            });
          }}
        />
      </PageHeaderWrapper>
    );
  }
}
export default ResActFinishDetail;
