import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Form, Table, Tag } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { FileManagerEnhance } from '@/pages/gen/field';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DescriptionList from '@/components/layout/DescriptionList';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

const DOMAIN = 'userTaskView';
const { Description } = DescriptionList;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, user, userTaskView }) => ({
  user,
  loading,
  ...userTaskView,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class TaskView extends React.PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    param.taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: param.taskId,
      });

    dispatch({
      type: `${DOMAIN}/findTaskComp`, // 根据任务包完工申请流程id获取任务包信息
      payload: param.id,
    }).then(() => {
      const {
        formData,
        formData: { id },
      } = this.props;
      if (id) {
        dispatch({
          type: `${DOMAIN}/query`,
          payload: { id },
        }).then(res => {
          dispatch({
            type: `${DOMAIN}/principal`,
            payload: param,
          }).then(resId => {
            let evalType = '';
            let evaledResId = '';
            if (resId === res.disterResId) {
              evalType = 'SENDER2RECEIVER';
              evaledResId = res.receiverResId;
            } else if (resId === res.receiverResId) {
              evalType = 'RECEIVER2SENDER';
              evaledResId = res.disterResId;
            }
            // 检查是否评价过
            dispatch({
              type: `${DOMAIN}/isEval`,
              payload: {
                evalClass: 'TASK',
                evalType,
                sourceId: id,
              },
            });
          });
        });
      }
    });
  }

  handleEval = () => {
    this.setState({ visible: true });

    const {
      dispatch,
      formData: { id, disterResId, receiverResId },
      resId,
    } = this.props;
    let evalType = '';
    let evaledResId = '';
    if (resId === disterResId) {
      evalType = 'SENDER2RECEIVER';
      evaledResId = receiverResId;
    } else if (resId === receiverResId) {
      evalType = 'RECEIVER2SENDER';
      evaledResId = disterResId;
    }
    dispatch({
      type: `evalCommonModal/query`,
      payload: {
        evalClass: 'TASK',
        evalType,
        evalerResId: resId,
        evaledResId,
        sourceId: id,
      },
    });
  };

  handleActEval = row => {
    this.setState({ visible: true });
    const { id } = row;
    const {
      dispatch,
      formData: { disterResId, receiverResId },
    } = this.props;

    dispatch({
      type: `evalCommonModal/query`,
      payload: {
        evalClass: 'ACTIVITY',
        evalType: 'SENDER2RECEIVER_ACT',
        evalerResId: disterResId,
        evaledResId: receiverResId,
        sourceId: id,
      },
    });
  };

  render() {
    const {
      loading,
      formData,
      dataList,
      hasEval,
      resId,
      fieldsConfig,
      flowForm,
      dispatch,
    } = this.props;
    const { visible } = this.state;

    const disabledBtn = !!loading.effects[`${DOMAIN}/query`];

    const { id, taskId } = fromQs(); // 这个id是任务包完工申请的id不是任务包的id
    // 其他流程
    const allBpm = [{ docId: id, procDefKey: 'TSK_P10', title: '任务包申请完工流程' }];

    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1600 },
      bordered: true,
      loading: false,
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      columns: [
        {
          title: '活动编号',
          dataIndex: 'actNo',
          key: 'actNo',
          className: 'text-center',
        },
        {
          title: '项目活动',
          dataIndex: 'actName',
          key: 'actName',
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
          key: 'planStartDate',
          className: 'text-center',
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
          key: 'planEndDate',
          className: 'text-center',
        },
        {
          title: '活动当量',
          dataIndex: 'eqvaQty',
          key: 'eqvaQty',
          className: 'text-right',
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          key: 'settledEqva',
          className: 'text-right',
        },
        {
          title: '执行状态',
          dataIndex: 'actStatusName',
          key: 'actStatusName',
          className: 'text-center',
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          key: 'milestoneFlag',
          className: 'text-center',
          render: (value, row, index) =>
            value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
        },
        {
          title: '要求文档清单',
          dataIndex: 'requiredDocList',
          key: 'requiredDocList',
        },
        {
          title: '完工时间',
          dataIndex: 'finishDate',
          key: 'finishDate',
          className: 'text-center',
        },
        // {
        //   title: '完工说明',
        //   dataIndex: 'finishDesc',
        //   key: 'finishDesc',
        // },
        {
          title: '活动评价',
          dataIndex: 'finishDesc',
          key: 'finishDesc',
          align: 'center',
          render: (value, row, index) => {
            if (row.hasEval) {
              return (
                <Button className="tw-btn-primary" disabled>
                  已评价
                </Button>
              );
            }
            return (
              <Button
                className="tw-btn-primary"
                onClick={() => this.handleActEval(row)}
                disabled={resId === formData.receiverResId || row.actStatus !== 'FINISHED'}
              >
                活动评价
              </Button>
            );
          },
        },
      ],
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="任务包信息">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="TSK_P10"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            if (
              operation.key &&
              operation.key === 'FLOW_PASS' &&
              taskKey &&
              taskKey === 'TSK_P10_02_APPROVE'
            ) {
              dispatch({
                // 手动调用审批通过方法
                type: `${DOMAIN}/flowHandle`,
                payload: {
                  id: taskId,
                  value: {
                    taskId,
                    result: 'APPROVED',
                    branch: 'FLOW_PASS',
                  },
                },
              }).then(result => {
                if (result) {
                  const { disterResId, receiverResId, id: taskTableId } = formData;
                  if (disterResId !== receiverResId) {
                    this.setState({ visible: true });
                    dispatch({
                      type: `evalCommonModal/query`,
                      payload: {
                        evalClass: 'TASK',
                        evalType: 'SENDER2RECEIVER',
                        evalerResId: disterResId,
                        evaledResId: receiverResId,
                        sourceId: taskTableId,
                      },
                    });
                  } else {
                    closeThenGoto(`/user/flow/process`);
                  }
                }
              });
              return Promise.resolve(false); // 不走架构方法
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              size="large"
              onClick={() => closeThenGoto(`/user/task/changehistory?id=${formData.id}`)}
            >
              变更历史
            </Button>
            {formData.taskStatus === 'CLOSED' && // 该任务的状态为"关闭"
            formData.disterResId !== formData.receiverResId && // 该任务的发包人 != 该任务的接包人
            (formData.disterResId === resId || // 当前用户为该任务的发包人
              formData.receiverResId === resId) && // 当前用户为该任务的接包人
              !hasEval && (
                <Button
                  className="tw-btn-primary"
                  size="large"
                  onClick={this.handleEval}
                  disabled={disabledBtn}
                >
                  任务包评价
                </Button>
              )}
            {formData.taskStatus === 'CLOSED' &&
              formData.disterResId !== formData.receiverResId && (
                <Button
                  className="tw-btn-primary"
                  size="large"
                  onClick={() => router.push(`/user/eval/history?sourceId=${id}&evalClass=TASK`)}
                >
                  评价历史
                </Button>
              )}

            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                // 看到这段代码不要惊讶，紧急修补……因为路由跳跳跳，为了找回来源，返回到正确页面，写得很奇怪
                const { from, source, resId } = fromQs(); // eslint-disable-line
                const concatResId = resId ? `${from}?resId=${resId}&` : `${from}?`;
                const url = source
                  ? `${concatResId}from=${source}`
                  : concatResId.substr(0, concatResId.length - 1);
                url ? closeThenGoto(url) : closeThenGoto(`/user/task/originated`);
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card className="tw-card-adjust" bordered={false} title="任务查询">
            <DescriptionList title="任务查询" size="large" col={2} hasSeparator>
              <Description term="发包人">{formData.disterResName}</Description>
              <Description term="编号">{formData.taskNo}</Description>
              <Description term="任务名称">{formData.taskName}</Description>
              <Description term="复合能力">
                {[formData.jobType1Name, formData.jobType2Name, formData.capasetLeveldName].join(
                  '-'
                )}
              </Description>
              <Description term="接收资源">{formData.receiverResName}</Description>
              <Description term="接收BU">{formData.receiverBuName}</Description>
              <Description term="合作类型">{formData.resSourceTypeName}</Description>
              <Description term="派发期间">{formData.distDate}</Description>
              {/* <Description style={{ visibility: 'hidden' }} term="占位">
                占位
              </Description> */}
              <Description term="事由类型">{formData.reasonTypeName}</Description>
              <Description term="事由号">{formData.reasonName}</Description>
              <Description term="费用承担BU">{formData.expenseBuName}</Description>
              <Description term="允许转包">{formData.allowTransferFlag ? '是' : '否'}</Description>
              <Description term="计划开始时间">{formatDT(formData.planStartDate)}</Description>
              <Description term="计划结束时间">{formatDT(formData.planEndDate)}</Description>
              <Description term="任务需求附件">
                <FileManagerEnhance
                  api="/api/op/v1/taskManager/task/requirement/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled
                  preview
                />
              </Description>
              <Description term="提交物模版附件">
                <FileManagerEnhance
                  api="/api/op/v1/taskManager/task/deliverable/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled
                  preview
                />
              </Description>
              <Description term="完工附件上传方法">{formData.attachuploadMethod}</Description>
              <Description term="任务状态">{formData.taskStatusName}</Description>
              <Description term="备注">{formData.remark}</Description>
              <Description term="来源任务包">
                {formData.pname ? formData.pname + '(' + formData.pno + ')' : ''}
              </Description>
              <Description term="创建人">{formData.createUserName}</Description>
              <Description term="创建日期">{formatDT(formData.createTime)}</Description>
            </DescriptionList>
            {
              {
                '1': (
                  <DescriptionList title="结算信息" size="large" col={2}>
                    <Description term="验收方式/计价方式">
                      {formData.acceptMethodName + ' / ' + formData.pricingMethodName}
                    </Description>
                    <Description term="自动按工时结算当量">
                      {formData.autoSettleFlag === 1 ? '是' : '否'}
                    </Description>
                    <Description term="派发当量系数">{formData.eqvaRatio}</Description>
                    <Description term="质保金比例">{formData.guaranteeRate}</Description>
                    {/* <Description term="自定义管理费">{formData.ohfeePriceFlag}</Description> */}
                    {/* <Description term="管理费">{formData.ohfeePrice}</Description> */}
                    <Description term="参考BU结算价格">{formData.suggestSettlePrice}</Description>
                    <Description term="税率">{formData.taxRate}</Description>
                    <Description term="自定义BU结算价格">
                      {formData.settlePriceFlag ? '是' : '否'}
                    </Description>
                    <Description term="实际BU结算价格">{formData.buSettlePrice}</Description>

                    <Description term="最终结算单价">{formData.settlePrice}</Description>
                    <Description term="总当量/总金额">
                      {formData.eqvaQty}/{formData.amt}
                    </Description>
                  </DescriptionList>
                ),
                '2': (
                  <DescriptionList title="结算信息" size="large" col={2}>
                    <Description term="验收方式">{formData.acceptMethodName}</Description>
                    <Description term="计价方式">{formData.pricingMethodName}</Description>
                    <Description term="派发当量系数">{formData.eqvaRatio}</Description>
                    <Description term="质保金比例">{formData.guaranteeRate}</Description>
                    <Description term="当量收入">{formData.eqvaSalary}</Description>
                    <Description term="总当量/总收入">
                      {formData.eqvaQty}/{formData.sumSalary}
                    </Description>
                  </DescriptionList>
                ),
              }[formData.viewNo]
            }
          </Card>
          <br />
          <Card className="tw-card-adjust" bordered={false} title="任务包活动信息">
            <Table {...tableProps} />
          </Card>

          <EvalCommonModal
            visible={visible}
            toggle={() => {
              this.setState({ visible: !visible });
              closeThenGoto(`/user/flow/process`);
            }}
          />
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_P10' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}
export default TaskView;
