import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, Card, Table, Divider, Tag, Modal } from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { FileManagerEnhance } from '@/pages/gen/field';
import Link from 'umi/link';

const { Description } = DescriptionList;
const TASK_DIST_ASSIGN_POINT = 'TSK_P01_01_ASSIGN_SUBMIT_i';
const DOMAIN = 'userDistDetail';

@connect(({ loading, userDistDetail, dispatch, user: { user } }) => ({
  loading,
  userDistDetail,
  dispatch,
  user,
}))
class DistributeDetail extends PureComponent {
  state = {
    visibleFlag: true,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    console.warn(param);
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    }).then(() => this.fetchResponseList());

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

  fetchResponseList = () => {
    const {
      dispatch,
      userDistDetail: { formData },
    } = this.props;
    if (formData.distMethod === 'DESIGNATE') return;
    dispatch({ type: `${DOMAIN}/queryDistResponse`, payload: formData.id });
  };

  render() {
    const {
      loading,
      userDistDetail: {
        formData = {},
        flowForm,
        taskFormData,
        fieldsConfig,
        projFormData,
        responseList,
      },
      user: { extInfo },
      dispatch,
    } = this.props;

    const flag = fromQs();
    // loading完成之前将按钮设为禁用
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      (formData.distStatus !== 'BROADCASTING' &&
        formData.distStatus !== 'CREATE' &&
        formData.apprStatus !== 'NOTSUBMIT' &&
        formData.apprStatus !== 'WITHDRAW' &&
        formData.apprStatus !== 'REJECTED') ||
      flag;
    const isDesignate = formData.distMethod && formData.distMethod === 'DESIGNATE';
    const enable = extInfo && formData.receiverResId === extInfo.resId; // 当前登录人是否接收资源
    const { distStatus } = formData;
    const renderRemark = param => <pre>{param}</pre>;
    const { visibleFlag } = this.state;
    const { mode } = fromQs();
    const visible = !!formData.needCapaNum && enable && visibleFlag && mode === 'edit';

    // 已派发不可以再接受
    const enableFlowBtn = distStatus && distStatus !== 'DISTRIBUTED';
    return (
      <PageHeaderWrapper title="派发详情">
        <BpmWrapper
          fieldsConfig={enableFlowBtn && fieldsConfig}
          flowForm={enableFlowBtn && flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          // onBtnClick={() => Promise.resolve(true)}
          onBtnClick={({ operation }) => {
            const { taskKey } = fieldsConfig;
            // console.warn(bpmForm, '------operation');
            if (taskKey === TASK_DIST_ASSIGN_POINT) {
              const param = fromQs();
              // TODO: 会有修改项目按钮吗？如果有，请用  projFormData.id
              operation.key === 'EDIT'
                ? closeThenGoto(
                    `/user/distribute/create?id=${param.id}&mode=update&apprId=${
                      param.taskId
                    }&procId=${param.prcId}`
                  )
                : closeThenGoto(`/user/task/edit?id=${taskFormData.id}&apprId=${param.taskId}`);
              return Promise.resolve(false);
            }
            if (operation.key === 'APPROVED' && !!formData.needCapaNum && enable) {
              this.setState({
                visibleFlag: true,
              });
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
              disabled={disabledBtn}
              onClick={() => {
                // 未派发,广播中的数据可以编辑
                if (
                  formData.distStatus === 'CREATE' ||
                  formData.distStatus === 'BROADCASTING' ||
                  formData.apprStatus === 'NOTSUBMIT' ||
                  formData.apprStatus === 'WITHDRAW' ||
                  formData.apprStatus === 'REJECTED'
                ) {
                  closeThenGoto(`/user/distribute/create?id=${formData.id}&mode=update`);
                } else {
                  createMessage({ type: 'warn', description: '该状态不能编辑' });
                }
              }}
            >
              {formatMessage({ id: `misc.update`, desc: '编辑' })}
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              // disabled={disabledBtn}
              onClick={() => closeThenGoto('/user/distribute/list')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            title={
              <Title
                icon="profile"
                id="app.settings.menuMap.basicMessage"
                defaultMessage="基本信息"
              />
            }
            bordered={false}
          >
            {formData.id ? (
              <>
                <DescriptionList
                  size="large"
                  title={formatMessage({ id: `app.settings.menuMap.distribute`, desc: '派发策略' })}
                  col={2}
                  hasSeparator
                >
                  <Description term="派发对象">{formData.reasonName}</Description>
                  <Description term="派发人/派发时间">
                    {formData.disterResName}/
                    {formData.distTime && formatDT(formData.distTime, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="派发方式">{formData.distMethodDesc}</Description>
                  <Description term="接收资源">{formData.receiverResName}</Description>
                  <Description term="派发说明">{formData.distDesc}</Description>
                  {formData.distMethod === 'BROADCAST' && (
                    <Description term="应答人数（上限）">{formData.respNumber}</Description>
                  )}
                  {formData.distMethod === 'BROADCAST' && (
                    <Description term="广播天数/剩余天数">
                      {formData.broadcastDays}/{formData.remainingDays}
                    </Description>
                  )}
                  <Description term="派发状态">{formData.distStatusDesc}</Description>
                </DescriptionList>
                <DescriptionList
                  size="large"
                  title={formatMessage({
                    id: `app.settings.menuMap.distReceiverRes`,
                    desc: '接包资源要求',
                  })}
                  col={2}
                  hasSeparator
                >
                  <Description term="复合能力">
                    {formData.jobType1Desc}/{formData.jobType2Desc}/{formData.levelName}
                  </Description>
                  <Description term="语言能力要求">{formData.languageRequirement}</Description>
                  <Description term="现场|远程">{formData.workStyleDesc}</Description>
                  <Description term="其他能力要求">{formData.otherCapability}</Description>
                  <Description term="时间要求">{formData.timeRequirementDesc}</Description>
                  <Description term="资源所在地">{formData.resBaseDesc}</Description>
                  <Description term="兼职|全职">{formData.workMethodDesc}</Description>
                  <Description term="资源类型">{formData.resTypeDesc}</Description>
                  <Description term="工作地">
                    {formData.workCountryDesc}
                    {formData.workProvinceDesc}
                    {formData.workPlaceDesc}
                    {formData.workDetailaddr}
                  </Description>
                  <Description term="预计开始时间">
                    {formData.planStartDate &&
                      formatDT(formData.planStartDate, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="最低信用积分">{formData.minCreditPoint}</Description>
                  <Description term="预计结束时间">
                    {formData.planEndDate && formatDT(formData.planEndDate, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="最低安全级别">{formData.minSecurityLevel}</Description>
                  <Description term="备注">{renderRemark(formData.remark)}</Description>
                </DescriptionList>
                {!isDesignate && (
                  <div>
                    <div className="tw-card-title">
                      {formatMessage({ id: `app.settings.menuMap.distResponse`, desc: '派发响应' })}
                    </div>
                    <div style={{ margin: 12 }}>
                      <Table
                        rowKey="id"
                        bordered
                        domain={DOMAIN}
                        loading={loading.effects[`${DOMAIN}/queryDistResponse`]}
                        dataSource={responseList}
                        columns={[
                          {
                            title: '资源',
                            dataIndex: 'respondentResName',
                          },
                          /* {
                          title: '安全级别',
                          dataIndex: 'accessLevel',
                          // align: 'center',
                        },
                        {
                          title: '信用评分',
                          dataIndex: 'creditPoint',
                          // align: 'center',
                        }, */
                          {
                            title: '响应状态',
                            dataIndex: 'respStatusDesc',
                            align: 'center',
                          },
                          {
                            title: '响应时间',
                            dataIndex: 'respTime',
                            render: (value, row, index) =>
                              value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null,
                          },
                          {
                            title: '响应描述',
                            dataIndex: 'respDesc',
                          },
                          {
                            title: '是否邀请',
                            dataIndex: 'inviteFlag',
                            align: 'center',
                            render: (value, row, index) =>
                              value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
                          },
                        ]}
                      />
                    </div>
                    <Divider dashed />
                  </div>
                )}
                {taskFormData && (
                  <DescriptionList title="任务简况" size="large" col={2}>
                    <Description term="任务名称">{taskFormData.taskName}</Description>
                    <Description term="编号">{taskFormData.taskNo}</Description>
                    <Description term="费用承担方">{taskFormData.expenseBuName}</Description>
                    <Description term="复合能力">
                      {[
                        taskFormData.jobType1Name,
                        taskFormData.jobType2Name,
                        taskFormData.capasetLeveldName,
                      ].join('-')}
                    </Description>
                    <Description term="事由类型">{taskFormData.reasonTypeName}</Description>
                    <Description term="事由号">{taskFormData.reasonName}</Description>
                    <Description term="计划开始时间">{taskFormData.planStartDate}</Description>
                    <Description term="计划结束时间">{taskFormData.planEndDate}</Description>
                    <Description term="验收方式">{taskFormData.acceptMethodName}</Description>
                    <Description term="计价方式">{taskFormData.pricingMethodName}</Description>
                    {taskFormData.viewNo === '1' && (
                      <Description term="结算价">{taskFormData.buSettlePrice}</Description>
                    )}
                    {taskFormData.viewNo === '1' && (
                      <Description term="总当量/总金额">
                        {taskFormData.eqvaQty}/{taskFormData.amt}
                      </Description>
                    )}
                    {/**  viewNo === 1是项目经理角色 2是项目成员角色  */}
                    {taskFormData.viewNo === '2' &&
                      enable && (
                        <Description term="单位当量收入">{taskFormData.eqvaSalary}</Description>
                      )}
                    {taskFormData.viewNo === '2' && (
                      <Description term="总当量/总收入">
                        {taskFormData.eqvaQty}/{taskFormData.sumSalary}
                      </Description>
                    )}
                    <Description term="任务包当量系数">{taskFormData.eqvaRatio}</Description>
                    <Description term="允许转包">
                      {taskFormData.allowTransferFlag ? '是' : '否'}
                    </Description>
                    <Description term="备注">{renderRemark(taskFormData.remark)}</Description>
                    <Description term="质保金比例">{taskFormData.guaranteeRate}</Description>
                  </DescriptionList>
                )}
                {projFormData && (
                  <DescriptionList size="large" title="项目简况" col={2}>
                    <Description term="项目名称">{projFormData.projName}</Description>
                    <Description term="编号">{projFormData.projNo}</Description>
                    <Description term="客户行业">{projFormData.custIdstDesc}</Description>
                    <Description term="客户区域">{projFormData.custRegionDesc}</Description>
                    <Description term="交付地点">{projFormData.deliveryAddress}</Description>
                    <Description term="签约公司">{projFormData.ouName}</Description>
                    <Description term="工作类型">{projFormData.workTypeDesc}</Description>
                    <Description term="项目模板">{projFormData.projTempName}</Description>
                    <Description term="预计开始时间">{projFormData.planStartDate}</Description>
                    <Description term="预计结束时间">{projFormData.planEndDate}</Description>
                    <Description term="客户承担差旅费">
                      {projFormData.custpaytravelFlag === 1
                        ? '是'
                        : (projFormData.custpaytravelFlag === 0 ? '否' : '') || ''}
                    </Description>
                    <Description term="SOW节选">
                      <FileManagerEnhance
                        api="/api/op/v1/project/sow/sfs/token"
                        dataKey={projFormData.id}
                        listType="text"
                        disabled
                        preview
                      />
                    </Description>
                    <Description term="差旅餐补限额">{projFormData.maxTravelFee}</Description>
                    <Description term="币种">{projFormData.currCodeDesc}</Description>
                    <DescriptionList size="large" col={1}>
                      <Description term="备注">{renderRemark(projFormData.remark)}</Description>
                    </DescriptionList>
                  </DescriptionList>
                )}
              </>
            ) : (
              <Loading />
            )}
          </Card>

          {!fromQs().taskId && (
            <BpmConnection source={[{ docId: fromQs().id, procDefKey: 'TSK_P01' }]} />
          )}
        </BpmWrapper>
        <Modal
          title="任务能力要求确认"
          visible={visible}
          footer={null}
          onCancel={() => {
            this.setState({ visibleFlag: false });
          }}
        >
          <div>
            你还有
            {formData.needCapaNum}
            项单项能力未获得，完成考核获得能力后才可接包
          </div>
          <span
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => {
              closeThenGoto('/user/center/myAbility');
            }}
          >
            查看能力要求
          </span>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default DistributeDetail;
