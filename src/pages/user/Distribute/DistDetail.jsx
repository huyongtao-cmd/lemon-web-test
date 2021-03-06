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
    // loading?????????????????????????????????
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      (formData.distStatus !== 'BROADCASTING' &&
        formData.distStatus !== 'CREATE' &&
        formData.apprStatus !== 'NOTSUBMIT' &&
        formData.apprStatus !== 'WITHDRAW' &&
        formData.apprStatus !== 'REJECTED') ||
      flag;
    const isDesignate = formData.distMethod && formData.distMethod === 'DESIGNATE';
    const enable = extInfo && formData.receiverResId === extInfo.resId; // ?????????????????????????????????
    const { distStatus } = formData;
    const renderRemark = param => <pre>{param}</pre>;
    const { visibleFlag } = this.state;
    const { mode } = fromQs();
    const visible = !!formData.needCapaNum && enable && visibleFlag && mode === 'edit';

    // ???????????????????????????
    const enableFlowBtn = distStatus && distStatus !== 'DISTRIBUTED';
    return (
      <PageHeaderWrapper title="????????????">
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
              // TODO: ????????????????????????????????????????????????  projFormData.id
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
                // ?????????,??????????????????????????????
                if (
                  formData.distStatus === 'CREATE' ||
                  formData.distStatus === 'BROADCASTING' ||
                  formData.apprStatus === 'NOTSUBMIT' ||
                  formData.apprStatus === 'WITHDRAW' ||
                  formData.apprStatus === 'REJECTED'
                ) {
                  closeThenGoto(`/user/distribute/create?id=${formData.id}&mode=update`);
                } else {
                  createMessage({ type: 'warn', description: '?????????????????????' });
                }
              }}
            >
              {formatMessage({ id: `misc.update`, desc: '??????' })}
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              // disabled={disabledBtn}
              onClick={() => closeThenGoto('/user/distribute/list')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '??????' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            title={
              <Title
                icon="profile"
                id="app.settings.menuMap.basicMessage"
                defaultMessage="????????????"
              />
            }
            bordered={false}
          >
            {formData.id ? (
              <>
                <DescriptionList
                  size="large"
                  title={formatMessage({ id: `app.settings.menuMap.distribute`, desc: '????????????' })}
                  col={2}
                  hasSeparator
                >
                  <Description term="????????????">{formData.reasonName}</Description>
                  <Description term="?????????/????????????">
                    {formData.disterResName}/
                    {formData.distTime && formatDT(formData.distTime, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="????????????">{formData.distMethodDesc}</Description>
                  <Description term="????????????">{formData.receiverResName}</Description>
                  <Description term="????????????">{formData.distDesc}</Description>
                  {formData.distMethod === 'BROADCAST' && (
                    <Description term="????????????????????????">{formData.respNumber}</Description>
                  )}
                  {formData.distMethod === 'BROADCAST' && (
                    <Description term="????????????/????????????">
                      {formData.broadcastDays}/{formData.remainingDays}
                    </Description>
                  )}
                  <Description term="????????????">{formData.distStatusDesc}</Description>
                </DescriptionList>
                <DescriptionList
                  size="large"
                  title={formatMessage({
                    id: `app.settings.menuMap.distReceiverRes`,
                    desc: '??????????????????',
                  })}
                  col={2}
                  hasSeparator
                >
                  <Description term="????????????">
                    {formData.jobType1Desc}/{formData.jobType2Desc}/{formData.levelName}
                  </Description>
                  <Description term="??????????????????">{formData.languageRequirement}</Description>
                  <Description term="??????|??????">{formData.workStyleDesc}</Description>
                  <Description term="??????????????????">{formData.otherCapability}</Description>
                  <Description term="????????????">{formData.timeRequirementDesc}</Description>
                  <Description term="???????????????">{formData.resBaseDesc}</Description>
                  <Description term="??????|??????">{formData.workMethodDesc}</Description>
                  <Description term="????????????">{formData.resTypeDesc}</Description>
                  <Description term="?????????">
                    {formData.workCountryDesc}
                    {formData.workProvinceDesc}
                    {formData.workPlaceDesc}
                    {formData.workDetailaddr}
                  </Description>
                  <Description term="??????????????????">
                    {formData.planStartDate &&
                      formatDT(formData.planStartDate, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="??????????????????">{formData.minCreditPoint}</Description>
                  <Description term="??????????????????">
                    {formData.planEndDate && formatDT(formData.planEndDate, 'YYYY-MM-DD HH:mm:ss')}
                  </Description>
                  <Description term="??????????????????">{formData.minSecurityLevel}</Description>
                  <Description term="??????">{renderRemark(formData.remark)}</Description>
                </DescriptionList>
                {!isDesignate && (
                  <div>
                    <div className="tw-card-title">
                      {formatMessage({ id: `app.settings.menuMap.distResponse`, desc: '????????????' })}
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
                            title: '??????',
                            dataIndex: 'respondentResName',
                          },
                          /* {
                          title: '????????????',
                          dataIndex: 'accessLevel',
                          // align: 'center',
                        },
                        {
                          title: '????????????',
                          dataIndex: 'creditPoint',
                          // align: 'center',
                        }, */
                          {
                            title: '????????????',
                            dataIndex: 'respStatusDesc',
                            align: 'center',
                          },
                          {
                            title: '????????????',
                            dataIndex: 'respTime',
                            render: (value, row, index) =>
                              value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null,
                          },
                          {
                            title: '????????????',
                            dataIndex: 'respDesc',
                          },
                          {
                            title: '????????????',
                            dataIndex: 'inviteFlag',
                            align: 'center',
                            render: (value, row, index) =>
                              value ? <Tag color="green">???</Tag> : <Tag color="red">???</Tag>,
                          },
                        ]}
                      />
                    </div>
                    <Divider dashed />
                  </div>
                )}
                {taskFormData && (
                  <DescriptionList title="????????????" size="large" col={2}>
                    <Description term="????????????">{taskFormData.taskName}</Description>
                    <Description term="??????">{taskFormData.taskNo}</Description>
                    <Description term="???????????????">{taskFormData.expenseBuName}</Description>
                    <Description term="????????????">
                      {[
                        taskFormData.jobType1Name,
                        taskFormData.jobType2Name,
                        taskFormData.capasetLeveldName,
                      ].join('-')}
                    </Description>
                    <Description term="????????????">{taskFormData.reasonTypeName}</Description>
                    <Description term="?????????">{taskFormData.reasonName}</Description>
                    <Description term="??????????????????">{taskFormData.planStartDate}</Description>
                    <Description term="??????????????????">{taskFormData.planEndDate}</Description>
                    <Description term="????????????">{taskFormData.acceptMethodName}</Description>
                    <Description term="????????????">{taskFormData.pricingMethodName}</Description>
                    {taskFormData.viewNo === '1' && (
                      <Description term="?????????">{taskFormData.buSettlePrice}</Description>
                    )}
                    {taskFormData.viewNo === '1' && (
                      <Description term="?????????/?????????">
                        {taskFormData.eqvaQty}/{taskFormData.amt}
                      </Description>
                    )}
                    {/**  viewNo === 1????????????????????? 2?????????????????????  */}
                    {taskFormData.viewNo === '2' &&
                      enable && (
                        <Description term="??????????????????">{taskFormData.eqvaSalary}</Description>
                      )}
                    {taskFormData.viewNo === '2' && (
                      <Description term="?????????/?????????">
                        {taskFormData.eqvaQty}/{taskFormData.sumSalary}
                      </Description>
                    )}
                    <Description term="?????????????????????">{taskFormData.eqvaRatio}</Description>
                    <Description term="????????????">
                      {taskFormData.allowTransferFlag ? '???' : '???'}
                    </Description>
                    <Description term="??????">{renderRemark(taskFormData.remark)}</Description>
                    <Description term="???????????????">{taskFormData.guaranteeRate}</Description>
                  </DescriptionList>
                )}
                {projFormData && (
                  <DescriptionList size="large" title="????????????" col={2}>
                    <Description term="????????????">{projFormData.projName}</Description>
                    <Description term="??????">{projFormData.projNo}</Description>
                    <Description term="????????????">{projFormData.custIdstDesc}</Description>
                    <Description term="????????????">{projFormData.custRegionDesc}</Description>
                    <Description term="????????????">{projFormData.deliveryAddress}</Description>
                    <Description term="????????????">{projFormData.ouName}</Description>
                    <Description term="????????????">{projFormData.workTypeDesc}</Description>
                    <Description term="????????????">{projFormData.projTempName}</Description>
                    <Description term="??????????????????">{projFormData.planStartDate}</Description>
                    <Description term="??????????????????">{projFormData.planEndDate}</Description>
                    <Description term="?????????????????????">
                      {projFormData.custpaytravelFlag === 1
                        ? '???'
                        : (projFormData.custpaytravelFlag === 0 ? '???' : '') || ''}
                    </Description>
                    <Description term="SOW??????">
                      <FileManagerEnhance
                        api="/api/op/v1/project/sow/sfs/token"
                        dataKey={projFormData.id}
                        listType="text"
                        disabled
                        preview
                      />
                    </Description>
                    <Description term="??????????????????">{projFormData.maxTravelFee}</Description>
                    <Description term="??????">{projFormData.currCodeDesc}</Description>
                    <DescriptionList size="large" col={1}>
                      <Description term="??????">{renderRemark(projFormData.remark)}</Description>
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
          title="????????????????????????"
          visible={visible}
          footer={null}
          onCancel={() => {
            this.setState({ visibleFlag: false });
          }}
        >
          <div>
            ?????????
            {formData.needCapaNum}
            ??????????????????????????????????????????????????????????????????
          </div>
          <span
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => {
              closeThenGoto('/user/center/myAbility');
            }}
          >
            ??????????????????
          </span>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default DistributeDetail;
