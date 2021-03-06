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
      createMessage({ type: 'error', description: '????????????????????????' });
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
        user: { extInfo = {} }, // ?????????????????????resId
      },
    } = this.props;
    const { id, taskId } = fromQs();
    let fieldsConfig = {};
    if (!isEmpty(config)) {
      // ??????????????????????????? ???????????????????????????
      const { taskKey } = config;
      if (taskKey === CREATE_TASK && formData.apprStatus === 'APPROVING') {
        const newConfig = clone(config);
        newConfig.buttons.pop();
        fieldsConfig = newConfig;
      } else if (taskKey === CREATE_TASK && formData.apprStatus === 'APPROVED') {
        // ??????????????????????????? ?????????????????????????????????????????????
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
      <PageHeaderWrapper title="??????????????????">
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
            // ????????????
            if (tkey === TASK_TRANSFER_SUBMIT) {
              closeThenGoto(`/user/task/subpack?tId=${id}&taskId=${taskId}&remark=${remark}`);
              return Promise.resolve(false);
            }
            const { key } = operation;

            // ??????????????????????????? ????????????
            if (tkey === CREATE_TASK && key === 'APPROVED') {
              return pushFlowTask(taskId, { remark, result: key }).then(({ status, response }) => {
                if (status === 200) {
                  setTimeout(() => {
                    createConfirm({
                      content:
                        '?????????????????????????????????????????????????????????????????????????????????????????????????????????',
                      onOk: () => closeThenGoto(`/user/task/edit?subpackId=${id}`),
                      onCancel: () => closeThenGoto(`/user/task/subpackDetail?id=${id}`),
                    });
                  }, 0);
                }
                return Promise.resolve(false);
              });
            }

            // ???????????????????????????
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
                      ?????????????????????
                    </Button>

                    <Button
                      className={classnames('separate', 'tw-btn-default')}
                      icon="undo"
                      size="large"
                      onClick={this.handleBack}
                    >
                      {formatMessage({ id: `misc.rtn`, desc: '??????' })}
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
                    defaultMessage="??????????????????"
                  />
                }
              >
                <DescriptionList size="large" col={2}>
                  <Description term="?????????">{formData.disterResName}</Description>
                  <Description term="????????????">{formData.taskName}</Description>
                  <Description term="????????????">{formData.receiverResName}</Description>
                  <Description term="????????????BU">{formData.receiverBuName}</Description>
                  <Description term="????????????">{formData.capasetLevelName}</Description>
                  <Description term="???????????????">{formData.pname}</Description>
                  <Description term="????????????????????????/??????">
                    {formData.eqvaQty}/{formData.amt}
                  </Description>
                  <Description term="???????????????">{formData.subcontractEqva}</Description>
                  <Description term="????????????">
                    {formData.planStartDate}~{formData.planEndDate}
                  </Description>
                  <Description term="??????">{formData.remark1}</Description>
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
