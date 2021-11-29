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
import Loading from '@/components/core/DataLoading';

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
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'TASK_MANAGER_DETAILS' },
    });
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
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
              sourceId: param.id,
            },
          });
        });
      });
    }
  }

  handleEval = () => {
    this.setState({ visible: true });

    const {
      dispatch,
      formData: { disterResId, receiverResId },
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
        sourceId: fromQs().id,
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

  renderPage = () => {
    const { loading, formData, dataList, hasEval, resId, pageConfig } = this.props;
    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentTaskConfig = [];
    let currentSettlementConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_TASK') {
        currentTaskConfig = view;
      } else if (view.tableName === 'T_TASK_TRANSFER') {
        currentSettlementConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsTask } = currentTaskConfig; // 任务信息
    const { pageFieldViews: pageFieldViewsSettlement } = currentSettlementConfig; // 结算信息

    const pageFieldJsonTask = {}; // 任务信息
    const pageFieldJsonSettlement = {}; // 结算信息
    if (pageFieldViewsTask) {
      pageFieldViewsTask.forEach(field => {
        pageFieldJsonTask[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsSettlement) {
      pageFieldViewsSettlement.forEach(field => {
        pageFieldJsonSettlement[field.fieldKey] = field;
      });
    }
    const {
      disterResId = {},
      taskName = {},
      taskStatus = {},
      taskNo = {},
      expenseBuId = {},
      receiverBuId = {},
      receiverResId = {},
      reasonType = {},
      reasonId = {},
      allowTransferFlag = {},
      planStartDate = {},
      planEndDate = {},
      acceptMethod = {},
      buSettlePrice = {},
      eqvaRatio = {},
      eqvaQty = {},
      taxRate = {},
      guaranteeRate = {},
      cooperationType = {},
      attachuploadMethod = {},
      remark = {},
      capasetLeveldId = {},
      suggestSettlePrice = {},
      settlePriceFlag = {},
      taskPackageType = {},
      autoSettleFlag = {},
      distDate = {},
      createUserId = {},
      createTime = {},
      transferFlag = {},
      pricingMethod = {},
      eqvaSalary = {},
      amt = {},
      settlePrice = {},
    } = pageFieldJsonTask;
    const { pid = {} } = pageFieldJsonSettlement;
    const taskFields = [
      <Description term={disterResId.displayName} key="disterResId" sortNo={disterResId.sortNo}>
        {formData.disterResName}
      </Description>,
      <Description term={taskNo.displayName} key="taskNo" sortNo={taskNo.sortNo}>
        {formData.taskNo}
      </Description>,
      <Description term={taskName.displayName} key="taskName" sortNo={taskName.sortNo}>
        {formData.taskName}
      </Description>,
      <Description
        term={capasetLeveldId.displayName}
        key="capasetLeveldId"
        sortNo={capasetLeveldId.sortNo}
      >
        {[formData.jobType1Name, formData.jobType2Name, formData.capasetLeveldName].join('-')}
      </Description>,
      <Description
        term={receiverResId.displayName}
        key="receiverResId"
        sortNo={receiverResId.sortNo}
      >
        {formData.receiverResName}
      </Description>,
      <Description term={receiverBuId.displayName} key="receiverBuId" sortNo={receiverBuId.sortNo}>
        {formData.receiverBuName}
      </Description>,
      <Description
        term={cooperationType.displayName}
        key="cooperationType"
        sortNo={cooperationType.sortNo}
      >
        {formData.resSourceTypeName}
      </Description>,
      <Description term={distDate.displayName} key="distDate" sortNo={distDate.sortNo}>
        {formData.distDate}
      </Description>,
      <Description term={reasonType.displayName} key="reasonType" sortNo={reasonType.sortNo}>
        {formData.reasonTypeName}
      </Description>,
      <Description term={reasonId.displayName} key="reasonId" sortNo={reasonId.sortNo}>
        {formData.reasonName}
      </Description>,
      <Description term={expenseBuId.displayName} key="expenseBuId" sortNo={expenseBuId.sortNo}>
        {formData.expenseBuName}
      </Description>,
      <Description term={transferFlag.displayName} key="transferFlag" sortNo={transferFlag.sortNo}>
        {transferFlag.allowTransferFlag ? '是' : '否'}
      </Description>,
      <Description
        term={planStartDate.displayName}
        key="planStartDate"
        sortNo={planStartDate.sortNo}
      >
        {formatDT(formData.planStartDate)}
      </Description>,
      <Description term={planEndDate.displayName} key="planEndDate" sortNo={planEndDate.sortNo}>
        {formatDT(formData.planEndDate)}
      </Description>,
      <Description term="任务需求附件">
        <FileManagerEnhance
          api="/api/op/v1/taskManager/task/requirement/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description term="提交物模版附件">
        <FileManagerEnhance
          api="/api/op/v1/taskManager/task/deliverable/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description
        term={attachuploadMethod.displayName}
        key="attachuploadMethod"
        sortNo={attachuploadMethod.sortNo}
      >
        {formData.attachuploadMethod}
      </Description>,
      <Description term={taskStatus.displayName} key="taskStatus" sortNo={taskStatus.sortNo}>
        {formData.taskStatusName}
      </Description>,
      <Description term={remark.displayName} key="remark" sortNo={remark.sortNo}>
        {formData.remark}
      </Description>,
      <Description term={pid.displayName} key="pid" sortNo={pid.sortNo}>
        {/* {formData.pname ? formData.pname + '(' + formData.pno + ')' : ''} */}
        {formData.pname ? formData.pname : ''}
      </Description>,
      <Description
        term={taskPackageType.displayName}
        key="taskPackageType"
        sortNo={taskPackageType.sortNo}
      >
        {formData.taskPackageTypeName}
      </Description>,
      <Description term={createUserId.displayName} key="createUserId" sortNo={createUserId.sortNo}>
        {formData.createUserName}
      </Description>,
      <Description term={createTime.displayName} key="createTime" sortNo={createTime.sortNo}>
        {formatDT(formData.createTime)}
      </Description>,
    ];
    const filterList1 = taskFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonTask[field.key] && pageFieldJsonTask[field.key].visibleFlag === 1) ||
          (pageFieldJsonSettlement[field.key] &&
            pageFieldJsonSettlement[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const settlementFields = [
      <Description
        term={acceptMethod.displayName + '/' + pricingMethod.displayName}
        key="acceptMethod"
        viewNo="1"
        sortNo={acceptMethod.sortNo}
      >
        {formData.acceptMethodName + ' / ' + formData.pricingMethodName}
      </Description>,
      <Description
        term={autoSettleFlag.displayName}
        key="autoSettleFlag"
        viewNo="1"
        sortNo={autoSettleFlag.sortNo}
      >
        {formData.autoSettleFlag === 1 ? '是' : '否'}
      </Description>,
      <Description term={eqvaRatio.displayName} viewNo="1" sortNo={eqvaRatio.sortNo}>
        {formData.eqvaRatio}
      </Description>,
      <Description
        term={guaranteeRate.displayName}
        key="guaranteeRate"
        viewNo="1"
        sortNo={guaranteeRate.sortNo}
      >
        {formData.guaranteeRate}
      </Description>,
      <Description
        term={suggestSettlePrice.displayName}
        key="suggestSettlePrice"
        viewNo="1"
        sortNo={suggestSettlePrice.sortNo}
      >
        {formData.suggestSettlePrice}
      </Description>,
      <Description term={taxRate.displayName} key="taxRate" viewNo="1" sortNo={taxRate.sortNo}>
        {formData.taxRate}
      </Description>,
      <Description
        term={settlePriceFlag.displayName}
        key="settlePriceFlag"
        viewNo="1"
        sortNo={settlePriceFlag.sortNo}
      >
        {formData.settlePriceFlag ? '是' : '否'}
      </Description>,
      <Description
        term={buSettlePrice.displayName}
        key="buSettlePrice"
        viewNo="1"
        sortNo={buSettlePrice.sortNo}
      >
        {formData.buSettlePrice}
      </Description>,

      <Description
        term={settlePrice.displayName}
        key="settlePrice"
        viewNo="1"
        sortNo={settlePrice.sortNo}
      >
        {formData.settlePrice}
      </Description>,
      <Description term={amt.displayName} key="amt" viewNo="1" sortNo={amt.sortNo}>
        {formData.eqvaQty}/{formData.amt}
      </Description>,

      <Description term={acceptMethod.displayName} viewNo="2" sortNo={acceptMethod.sortNo}>
        {formData.acceptMethodName}
      </Description>,
      <Description
        term={pricingMethod.displayName}
        key="pricingMethod"
        viewNo="2"
        sortNo={pricingMethod.sortNo}
      >
        {formData.pricingMethodName}
      </Description>,
      <Description
        term={eqvaRatio.displayName}
        key="eqvaRatio"
        viewNo="2"
        sortNo={eqvaRatio.sortNo}
      >
        {formData.eqvaRatio}
      </Description>,
      <Description term={guaranteeRate.displayName} viewNo="2" sortNo={guaranteeRate.sortNo}>
        {formData.guaranteeRate}
      </Description>,
      <Description
        term={eqvaSalary.displayName}
        key="eqvaSalary"
        viewNo="2"
        sortNo={eqvaSalary.sortNo}
      >
        {formData.eqvaSalary}
      </Description>,
      <Description term={eqvaQty.displayName} key="eqvaQty" viewNo="2" sortNo={eqvaQty.sortNo}>
        {formData.eqvaQty + '/' + formData.sumSalary}
      </Description>,
    ];
    const filterList2 = settlementFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonTask[field.key] && pageFieldJsonTask[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const filterList3 = filterList2.filter(field => field.props.viewNo === formData.viewNo);
    return (
      <>
        <DescriptionList title="任务查询" size="large" col={2} hasSeparator>
          {filterList1}
        </DescriptionList>
        <DescriptionList title="结算信息" size="large" col={2}>
          {filterList3}
        </DescriptionList>
      </>
    );
  };

  render() {
    const { loading, formData, dataList, hasEval, resId, pageConfig } = this.props;
    const { visible } = this.state;

    const disabledBtn = !!loading.effects[`${DOMAIN}/query`];

    const { taskId, id, distId } = fromQs();
    // 其他流程
    let allBpm = [
      { docId: formData.distId, procDefKey: 'TSK_P01', title: '派发流程' },
      { docId: id, procDefKey: 'TSK_P03', title: '任务申请流程' },
      { docId: formData.changeTaskId, procDefKey: 'TSK_P04', title: '任务变更流程' },
      { docId: formData.compTaskId, procDefKey: 'TSK_P10', title: '任务包申请完工流程' },
    ];
    // 转包流程
    const transfBpm =
      formData.transferIds && !isEmpty(formData.transferIds)
        ? formData.transferIds.map((item, index) => ({
            docId: item,
            procDefKey: 'TSK_P07',
            title: index === 0 ? '转包流程' : undefined,
          }))
        : [];
    // 全部流程
    allBpm = isEmpty(transfBpm) ? allBpm : allBpm.concat(transfBpm);

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_RES_ACTIVITY') {
        currentConfig = view;
      }
    });
    const { pageFieldViews } = currentConfig;
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const {
      actNo = {},
      actName = {},
      actStatus = {},
      planStartDate = {},
      planEndDate = {},
      settledEqva = {},
      milestoneFlag = {},
      finishDate = {},
      finishDesc = {},
      requiredDocList = {},
      eqvaQty = {},
    } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1600 },
      bordered: true,
      loading: false,
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      columns: [
        actNo.visibleFlag && {
          title: `${actNo.displayName}`,
          dataIndex: 'actNo',
          key: 'actNo',
          sortNo: `${actNo.sortNo}`,
          className: 'text-center',
        },
        actName.visibleFlag && {
          title: `${actName.displayName}`,
          dataIndex: 'actName',
          key: 'actName',
          sortNo: `${actName.sortNo}`,
        },
        planStartDate.visibleFlag && {
          title: `${planStartDate.displayName}`,
          dataIndex: 'planStartDate',
          key: 'planStartDate',
          className: 'text-center',
          sortNo: `${planStartDate.sortNo}`,
        },
        planEndDate.visibleFlag && {
          title: `${planEndDate.displayName}`,
          dataIndex: 'planEndDate',
          key: 'planEndDate',
          className: 'text-center',
          sortNo: `${planEndDate.sortNo}`,
        },
        eqvaQty.visibleFlag && {
          title: `${eqvaQty.displayName}`,
          dataIndex: 'eqvaQty',
          key: 'eqvaQty',
          className: 'text-right',
          sortNo: `${eqvaQty.sortNo}`,
        },
        settledEqva.visibleFlag && {
          title: `${settledEqva.displayName}`,
          dataIndex: 'settledEqva',
          key: 'settledEqva',
          className: 'text-right',
          sortNo: `${settledEqva.sortNo}`,
        },
        actStatus.visibleFlag && {
          title: `${actStatus.displayName}`,
          dataIndex: 'actStatusName',
          key: 'actStatusName',
          className: 'text-center',
          sortNo: `${actStatus.sortNo}`,
        },
        milestoneFlag.visibleFlag && {
          title: `${milestoneFlag.displayName}`,
          dataIndex: 'milestoneFlag',
          key: 'milestoneFlag',
          className: 'text-center',
          sortNo: `${milestoneFlag.sortNo}`,
          render: (value, row, index) =>
            value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
        },
        requiredDocList.visibleFlag && {
          title: `${requiredDocList.displayName}`,
          dataIndex: 'requiredDocList',
          key: 'requiredDocList',
          sortNo: `${requiredDocList.sortNo}`,
        },
        finishDate.visibleFlag && {
          title: `${finishDate.displayName}`,
          dataIndex: 'finishDate',
          key: 'finishDate',
          className: 'text-center',
          sortNo: `${finishDate.sortNo}`,
        },
        // {
        //   title: '完工说明',
        //   dataIndex: 'finishDesc',
        //   key: 'finishDesc',
        // },
        finishDesc.visibleFlag && {
          title: `${finishDesc.displayName}`,
          dataIndex: 'finishDesc',
          key: 'finishDesc',
          sortNo: `${finishDesc.sortNo}`,
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
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="任务包信息">
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
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
          {/* <DescriptionList title="任务查询" size="large" col={2} hasSeparator>
            <Description term="发包人">{formData.disterResName}</Description>
            <Description term="编号">{formData.taskNo}</Description>
            <Description term="任务名称">{formData.taskName}</Description>
            <Description term="复合能力">
              {[formData.jobType1Name, formData.jobType2Name, formData.capasetLeveldName].join('-')}
            </Description>
            <Description term="接收资源">{formData.receiverResName}</Description>
            <Description term="接收BU">{formData.receiverBuName}</Description>
            <Description term="合作类型">{formData.resSourceTypeName}</Description>
            <Description term="派发期间">{formData.distDate}</Description>
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
            <Description term="任务包类型">{formData.taskPackageTypeName}</Description>
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
          } */}
        </Card>
        <br />
        {!loading.effects[`${DOMAIN}/getPageConfig`] ? (
          <Card className="tw-card-adjust" bordered={false} title="任务包活动信息">
            <Table {...tableProps} />
          </Card>
        ) : null}

        {!taskId && !disabledBtn && <BpmConnection source={allBpm} />}

        <EvalCommonModal visible={visible} toggle={() => this.setState({ visible: !visible })} />
      </PageHeaderWrapper>
    );
  }
}
export default TaskView;
