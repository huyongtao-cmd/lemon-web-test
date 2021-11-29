import React, { PureComponent, Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Tag } from 'antd';
import { isEmpty } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mul } from '@/utils/mathUtils';
import { createConfirm } from '@/components/core/Confirm';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';

const { Description } = DescriptionList;
const DOMAIN = 'CommonPreview';

const TASK_FLOW_01 = 'ACC_A22_01_EQVA_SETTLE_SUBMIT_i';

@connect(({ CommonPreview, loading }) => ({ CommonPreview, loading }))
@mountToTab()
class CommonPreview extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({ type: `${DOMAIN}/cleanFlow` });
  }

  render() {
    const {
      CommonPreview: { formData, fieldsConfig: config, flowForm },
      dispatch,
    } = this.props;
    const { visible } = this.state;
    const { id, sourceUrl, taskId } = fromQs();

    // 泛用没有评价，所以可以无脑去掉评价按钮
    let fieldsConfig = {};
    if (!isEmpty(config)) {
      fieldsConfig = {
        ...config,
        buttons: config.buttons.filter(({ key }) => key !== 'EVAL'),
      };
    }

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fields={[]}
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
            const { remark } = bpmForm;
            if (taskKey === TASK_FLOW_01) {
              closeThenGoto(
                `/plat/intelStl/list/common/edit?id=${id}&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            // ACC_A22_02_EMPLOYER_CONFIRM_b
            if (operation.key && operation.key === 'REJECTED') {
              return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
              const formD = {
                settleType: 'UNIVERSAL_EQVA',
                id,
                procTaskId: taskId,
                procRemark: remark,
              };
              dispatch({ type: `${DOMAIN}/putCommonSC`, payload: formD }).then(result => {
                if (result) {
                  // closeThenGoto(`/plat/intelStl/list/sum/preview?id=${id}`);
                  // 校验当量是否都已经结算
                  dispatch({
                    type: `SumPreview/checkTaskEqva`,
                    payload: id,
                  }).then(allStled => {
                    if (allStled) {
                      // 全部结算
                      // 弹出 提示窗口
                      createConfirm({
                        content: '任务包下所有当量已经结算，是否关闭该任务包？',
                        onOk: () =>
                          dispatch({
                            // 任务包下所有当量都已结算完毕，关闭任务包，弹出评价窗口
                            type: `SumPreview/closeTaskByStlId`,
                            payload: id,
                          }).then(taskView => {
                            // 选择关闭任务包，关闭成功后跳转到评价界面
                            const { disterResId, receiverResId, id: sourceId } = taskView;
                            if (taskView) {
                              // 如果接包人和发包人是同一个人 不需评价
                              if (disterResId === receiverResId)
                                closeThenGoto(`/user/flow/process`);
                              this.setState({ visible: true });
                              dispatch({
                                type: `evalCommonModal/query`,
                                payload: {
                                  evalClass: 'TASK',
                                  evalType: 'SENDER2RECEIVER',
                                  evalerResId: disterResId,
                                  evaledResId: receiverResId,
                                  sourceId,
                                },
                              });
                            } else {
                              closeThenGoto(`/user/flow/process`);
                            }
                          }),
                        onCancel: () => closeThenGoto(`/user/flow/process`),
                      });
                    } else {
                      closeThenGoto(`/user/flow/process`);
                    }
                  });
                }
                // checkAndSave方法完成保存、调用存储过程、审批流程工作，所以此处不再走架构提供的审批方法
                return resolve(false);
              });
            });
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={false}
              onClick={() =>
                sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/intelStl/list')
              }
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card className="tw-card-adjust" bordered={false}>
            <DescriptionList size="large" col={2} title="当量结算泛用">
              <Description term="结算单号">{formData.settleNo}</Description>
              <Description term="申请人">{formData.applyResName}</Description>
              <Description term="申请日期">
                {formatDT(formData.applyDate, 'YYYY-MM-DD HH:mm:ss')}
              </Description>
              <Description term="结算日期">
                {formatDT(formData.settleDate, 'YYYY-MM-DD HH:mm:ss')}
              </Description>
              <Description term="申请结算当量">{formData.applySettleEqva}</Description>
              <Description term="结算类型">{formData.settleTypeName}</Description>
              <Description term="申请结算金额">
                {formData.apprStatus && formData.apprStatus === 'APPROVED'
                  ? `${mul(formData.approveSettleEqva || 0, formData.settlePrice || 0).toFixed(0)}`
                  : `${mul(formData.applySettleEqva || 0, formData.settlePrice || 0).toFixed(0)}`}
              </Description>
              <Description term="结算单价/当量工资">
                {`${formData.settlePrice || '-'}/${formData.eqvaSalary || '-'}`}
              </Description>
              <Description term="相关项目">{formData.projName}</Description>
              <Description term="资源当量收入金额">
                {formData.apprStatus && formData.apprStatus === 'APPROVED'
                  ? `${mul(formData.approveSettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`
                  : `${mul(formData.applySettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`}
              </Description>
              <Description term="相关任务">{formData.taskName}</Description>
              <Description term="支出BU">{formData.expenseBuName}</Description>
              <Description term="收入资源">{formData.incomeResName}</Description>
              <Description term="收入BU">{formData.resBuName}</Description>
              <Description term="结算说明">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A22.COM' }]} />}
        </BpmWrapper>
        <EvalCommonModal
          visible={visible}
          toggle={() => {
            this.setState({ visible: !visible });
            closeThenGoto(`/user/flow/process`);
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CommonPreview;
