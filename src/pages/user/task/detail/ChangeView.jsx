import React from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import { Button, Card, Table, Tag } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { FileManagerEnhance } from '@/pages/gen/field';
import { mountToTab, markAsTab, closeThenGoto } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userTaskChangeView';
const { Description } = DescriptionList;
const TASK_CHANGE_RECEIVER_CONFIRM = 'TSK_P04_02_RECEIVER_CONFIRM_b';
const TASK_CHANGE_SUBMIT = 'TSK_P04_01_TASK_CHANGE_SUBMIT_i';
// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, userTaskChangeView }) => ({
  loading,
  ...userTaskChangeView,
}))
@mountToTab()
class TaskChangeView extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      }).then(() => {
        setTimeout(() => {
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
        }, 0);
      });
    }
  }

  render() {
    const {
      loading,
      dispatch,
      formData,
      dataList,
      changeTableList,
      changeFormData,
      fieldsConfig: config,
      flowForm,
    } = this.props;

    const { id, taskId } = fromQs();

    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1600 },
      bordered: true,
      loading: false,
      pagination: false,
      dataSource: dataList,
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
          dataIndex: 'planEqva',
          key: 'planEqva',
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
        {
          title: '完工说明',
          dataIndex: 'finishDesc',
          key: 'finishDesc',
        },
      ],
    };

    const changeTableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: changeTableList.filter(data => Number.parseFloat(data.deltaEava) !== 0),
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '活动',
          dataIndex: 'resActivityDesc',
          width: '20%',
        },
        {
          title: '原当量',
          dataIndex: 'oldEqva',
          width: '20%',
          align: 'right',
        },
        {
          title: '变更当量',
          dataIndex: 'deltaEava',
          width: '15%',
          align: 'right',
        },
        {
          title: '变更后当量',
          dataIndex: 'newEqva',
          width: '15%',
          align: 'right',
        },
        {
          title: '变更说明',
          dataIndex: 'changeDesc',
          width: '20%',
        },
        // {
        //   title: '审批意见',
        //   dataIndex: 'approveDesc',
        //   width: '10%',
        //   align: 'center',
        // },
      ],
    };

    let fieldsConfig = {};
    if (!isEmpty(config)) {
      const { taskKey } = config;
      // changeApprStatus 变更状态 提交节点
      if (
        taskKey === TASK_CHANGE_SUBMIT &&
        (changeFormData.apprStatus === 'NOTSUBMIT' ||
          changeFormData.apprStatus === 'REJECTED' ||
          changeFormData.apprStatus === 'WITHDRAW')
      ) {
        fieldsConfig = config;
      }
      if (taskKey === TASK_CHANGE_RECEIVER_CONFIRM && changeFormData.apprStatus === 'APPROVING') {
        fieldsConfig = config;
      }
    }
    return (
      <PageHeaderWrapper title="任务包信息">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={() => {
            const { taskKey } = fieldsConfig;
            if (
              taskKey === TASK_CHANGE_SUBMIT &&
              (changeFormData.apprStatus === 'NOTSUBMIT' ||
                changeFormData.apprStatus === 'REJECTED' ||
                changeFormData.apprStatus === 'WITHDRAW')
            ) {
              const param = fromQs();
              closeThenGoto(`/user/task/change?id=${changeFormData.id}&apprId=${param.taskId}`);
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => closeThenGoto(markAsTab(`/user/task/list`))}
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
              <Description style={{ visibility: 'hidden' }} term="占位">
                占位
              </Description>
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
              <Description style={{ visibility: 'hidden' }} term="占位">
                占位
              </Description>
              <Description term="创建人">{formData.createUserName}</Description>
              <Description term="创建日期">{formatDT(formData.createTime)}</Description>
            </DescriptionList>
            {
              {
                '1': (
                  <DescriptionList title="结算信息" size="large" col={2}>
                    <Description term="验收方式">{formData.acceptMethodName}</Description>
                    <Description term="计价方式">{formData.pricingMethodName}</Description>
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
                      {formData.planEqva}/{formData.amt}
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
                      {formData.planEqva}/{formData.sumSalary}
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
          <br />
          <Card className="tw-card-adjust" bordered={false} title="当量变更结果">
            <DescriptionList size="large" col={2}>
              <Description term="变更说明">{changeFormData.changeDesc}</Description>
            </DescriptionList>
            <div style={{ margin: 12 }}>
              <Table {...changeTableProps} />
            </div>
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_P04' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default TaskChangeView;
