import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Card, Row, Col, Progress, Spin, Divider } from 'antd';
import router from 'umi/router';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { fromQs } from '@/utils/production/stringUtil';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import moment from 'moment';
import { div, mul } from '@/utils/mathUtils';

const DOMAIN = 'projectOverview';

// eslint-disable-next-line no-useless-escape
const pat = /^(\d{4})\-(\d{2})\-(\d{2})$/; // 日期格式正则

const numToRate = num => (num ? mul(num, 100).toFixed(2) : 0);

@connect(({ loading, projectOverview, dispatch }) => ({
  loading,
  ...projectOverview,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class index extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    this.setState({
      id,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PROJECT_EDIT:DETAILS' },
    // });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  triangle = () => (
    <div
      style={{
        borderStyle: 'solid',
        borderWidth: '10px',
        borderColor: 'transparent transparent #fff transparent',
        height: 0,
        width: 0,
        position: 'absolute',
        top: '-20px',
        left: 0,
        right: 0,
        margin: '0 auto',
      }}
    />
  );

  render() {
    const {
      loading,
      projectView,
      formData,
      planViews,
      budgetViews = [],
      riskViews = [],
    } = this.props;
    const relatedProductId = !isNil(projectView.relatedProductId)
      ? projectView.relatedProductId
      : '';

    const disabledBtn = loading.effects[`${DOMAIN}/queryDetails`];

    const { id } = this.state;
    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(`/workTable/projectMgmt/projectMgmtList/detail?id=${id}&mode=DISABLED`);
            }}
            disabled={disabledBtn}
          >
            基本信息
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(`/workTable/projectMgmt/projectMgmtList/projectMember?projectId=${id}`);
            }}
            disabled={disabledBtn}
          >
            项目成员
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(`/workTable/projectMgmt/projectPlanMgmt?projectId=${id}`);
            }}
            disabled={disabledBtn}
          >
            WBS
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(`/workTable/projectMgmt/sessionMgmt?projectId=${id}`);
            }}
            disabled={disabledBtn}
          >
            场次列表
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/projectMgmt/noticeList?projectId=${id}&phaseId=${projectView.currentPhaseId ||
                  ''}`
              );
            }}
            disabled={disabledBtn}
          >
            通告单
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/projectMgmt/weeklyList?projectId=${id}&projectNo=${
                  projectView.projectNo
                }`
              );
            }}
            disabled={disabledBtn}
          >
            周报表
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/bud/budgetList?chargeProjectId=${projectView.id}&chargeBuId=${
                  projectView.inchargeBuId
                }`
              );
            }}
            disabled={disabledBtn}
          >
            项目预算
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/reimburseMgmt/expenseClaimList?chargeProjectId=${
                  projectView.id
                }&chargeBuId=${projectView.inchargeBuId}&chargeCompany=${
                  projectView.inchargeCompany
                }`
              );
            }}
            disabled={disabledBtn}
          >
            报销列表
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/pur/purchaseList?chargeProjectId=${projectView.id}&chargeBuId=${
                  projectView.inchargeBuId
                }&chargeCompany=${projectView.inchargeCompany}&relatedProductId=${relatedProductId}`
              );
            }}
            disabled={disabledBtn}
          >
            采购单
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(`/workTable/projectMgmt/projectMgmtList/projectRisk?projectId=${id}`);
            }}
            disabled={disabledBtn}
          >
            项目风险
          </Button>
        </ButtonCard>

        <Card
          className="tw-card-adjust"
          bodyStyle={{
            backgroundColor: '#f0f2f5',
            borderColor: '#f0f2f5',
            padding: '24px 4px 4px 4px',
          }}
          bordered={false}
        >
          <Spin spinning={disabledBtn}>
            <div
              style={{
                backgroundColor: '#fff',
                padding: '30px',
                fontSize: '18px',
                height: '130px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '20%',
                  height: '100%',
                  borderRight: '1px solid rgb(222 224 228)',
                  float: 'left',
                }}
              >
                <div style={{ width: '100%', height: '50%' }}>开机</div>
                <div style={{ width: '100%', height: '50%' }}>
                  <span style={{ color: '#000', fontWeight: 'bolder' }}>
                    {/*{pat.test(projectView.configurableField5)*/}
                    {/*  ? moment().diff(moment(projectView.configurableField5), 'days')*/}
                    {/*  : '0'}*/}
                    {Number(formData.nowDay) || 0}
                  </span>
                  &nbsp; 天
                </div>
              </div>
              <div
                style={{
                  width: '20%',
                  height: '100%',
                  borderRight: '1px solid rgb(222 224 228)',
                  float: 'left',
                }}
              >
                {moment(projectView.configurableField6).diff(moment(), 'days') < 0 ? (
                  <div style={{ width: '100%', height: '100%' }}>已杀青</div>
                ) : (
                  <div>
                    <div style={{ width: '100%', height: '50%' }}>距离杀青</div>
                    <div style={{ width: '100%', height: '50%' }}>
                      <span style={{ color: 'orange', fontWeight: 'bolder' }}>
                        {pat.test(projectView.configurableField6)
                          ? moment(projectView.configurableField6).diff(moment(), 'days')
                          : '0'}
                      </span>
                      &nbsp; 天
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  width: '20%',
                  height: '100%',
                  borderRight: '1px solid rgb(222 224 228)',
                  float: 'left',
                }}
              >
                <div style={{ width: '100%', height: '50%' }}>总制片人</div>
                <div style={{ width: '100%', height: '50%' }}>
                  <span style={{ color: 'black', fontWeight: 'bolder' }}>
                    {projectView.relatedRes2IdDesc || ''}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '20%',
                  height: '100%',
                  borderRight: '1px solid rgb(222 224 228)',
                  float: 'left',
                }}
              >
                <div style={{ width: '100%', height: '50%' }}>制片人</div>
                <div style={{ width: '100%', height: '50%' }}>
                  <span style={{ color: 'black', fontWeight: 'bolder' }}>
                    {projectView.pmResIdDesc || ''}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '20%',
                  height: '100%',
                  float: 'left',
                }}
              >
                <div style={{ width: '100%', height: '50%' }}>当前阶段</div>
                <div style={{ width: '100%', height: '50%' }}>
                  <span style={{ color: 'orange', fontWeight: 'bolder' }}>
                    {projectView.currentPhaseIdDesc || ''}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <Row gutter={12}>
                <Col lg={6} md={12} sm={24}>
                  <div style={{ backgroundColor: '#fff', padding: '10px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bolder',
                        marginBottom: '30px',
                        position: 'relative',
                        left: '10px',
                        textAlign: 'left',
                        color: '#000',
                      }}
                    >
                      活动进度
                    </div>
                    <Progress
                      type="circle"
                      percent={Number(projectView.projectSchedule) || 0}
                      format={percent => (
                        <span style={{ color: 'rgb(16, 142, 233)' }}>{percent}%</span>
                      )}
                    />
                    <Row gutter={12} style={{ padding: '30px 0 15px' }}>
                      <Col span={12}>
                        逾期事件：
                        <span style={{ color: 'red', fontWeight: 'bolder' }}>
                          {Number(formData.overdueEventsCount) || 0}
                        </span>
                        件
                      </Col>
                      <Col span={12}>
                        明日到期：
                        <span style={{ color: '#000' }}>
                          {Number(formData.tomorrowOverdueCount) || 0}
                        </span>
                        件
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div style={{ backgroundColor: '#fff', padding: '10px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bolder',
                        marginBottom: '30px',
                        position: 'relative',
                        left: '10px',
                        textAlign: 'left',
                        color: '#000',
                      }}
                    >
                      拍摄进度
                    </div>
                    <Progress
                      type="circle"
                      percent={Number(formData.statisticsField1Rate) || 0}
                      format={percent => (
                        <span style={{ color: 'rgb(16, 142, 233)' }}>{percent}%</span>
                      )}
                    />
                    <Row gutter={12} style={{ padding: '30px 0 15px' }}>
                      <Col span={12}>
                        今日拍摄：
                        <span style={{ color: '#000', fontWeight: 'bolder' }}>
                          {Number(formData.todayShotNum) || 0}
                        </span>
                        场
                      </Col>
                      <Col span={12}>
                        今日页数：
                        <span style={{ color: '#000', fontWeight: 'bolder' }}>
                          {Number(formData.todayPageNum).toFixed(2) || 0}
                        </span>
                        页
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div style={{ backgroundColor: '#fff', padding: '10px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bolder',
                        marginBottom: '30px',
                        position: 'relative',
                        left: '10px',
                        textAlign: 'left',
                        color: '#000',
                      }}
                    >
                      预算执行进度
                    </div>
                    <Progress
                      type="circle"
                      percent={numToRate(div(Number(formData.pay), Number(formData.total))) || 0}
                      format={percent => (
                        <span style={{ color: 'rgb(16, 142, 233)' }}>{percent}%</span>
                      )}
                    />
                    <Row gutter={12} style={{ padding: '30px 0 15px' }}>
                      <Col span={12}>
                        支出：
                        <span style={{ color: '#000', fontWeight: 'bolder' }}>
                          {Number(formData.pay) || 0}
                        </span>
                        万
                      </Col>
                      <Col span={12}>
                        余额：
                        <span style={{ color: '#000', fontWeight: 'bolder' }}>
                          {Number(formData.balance) || 0}
                        </span>
                        万
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div style={{ backgroundColor: '#fff', padding: '10px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bolder',
                        marginBottom: '30px',
                        position: 'relative',
                        left: '10px',
                        textAlign: 'left',
                        color: '#000',
                      }}
                    >
                      风险预警
                    </div>
                    <Progress
                      type="circle"
                      percent={numToRate(
                        div(Number(formData.heighOpenRiskNum), Number(formData.openRiskNum))
                      )}
                      format={percent => (
                        <span style={{ color: 'rgb(16, 142, 233)' }}>{Number(percent)}%</span>
                      )}
                    />
                    <Row gutter={12} style={{ padding: '30px 0 15px' }}>
                      <Col span={24}>
                        高级别风险：
                        <span style={{ color: '#000', fontWeight: 'bolder' }}>
                          {Number(formData.heighOpenRiskNum) || 0}
                        </span>
                        /{Number(formData.openRiskNum) || 0}
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>

            <div
              style={{ marginTop: '20px' }}
              ref={dom => {
                this.pvcDesDom = dom;
              }}
            >
              <Row gutter={12}>
                <Col lg={6} md={12} sm={24}>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      minHeight: '300px',
                      height: this.pvcDesDom && this.pvcDesDom.clientHeight + 'px',
                    }}
                  >
                    {this.triangle()}
                    {planViews.map((v, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i}>
                        <Row gutter={12} style={{ padding: '30px 0' }}>
                          <Col span={12}>{v.planName || ''}</Col>
                          <Col span={12}>
                            <span
                              style={{
                                backgroundColor: 'red',
                                padding: '3px 5px',
                                borderRadius: '3px',
                              }}
                            >
                              已逾期
                              {v.overdueDay || ''}天
                            </span>
                          </Col>
                        </Row>
                        {i < planViews.length - 1 ? (
                          <div
                            style={{
                              width: '100%',
                              borderTop: '1px #000 dashed',
                              margin: '15px 0',
                            }}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      minHeight: '300px',
                      height: this.pvcDesDom && this.pvcDesDom.clientHeight + 'px',
                    }}
                  >
                    {this.triangle()}
                    <div>
                      <Row>
                        <Col span={16} style={{ textAlign: 'left' }}>
                          页数：
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.allReportStatisticsField2) || 0}
                          </span>
                          /{Number(formData.allScheduleStatisticsField2) || 0}
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.statisticsField2Rate) || 0}%
                          </span>
                        </Col>
                      </Row>
                      <Row>
                        <Progress
                          percent={Number(formData.statisticsField2Rate) || 0}
                          showInfo={false}
                        />
                      </Row>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <Row>
                        <Col span={16} style={{ textAlign: 'left' }}>
                          场数：
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.allReportStatisticsField1) || 0}
                          </span>
                          /{Number(formData.allScheduleStatisticsField1) || 0}
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.statisticsField1Rate) || 0}%
                          </span>
                        </Col>
                      </Row>
                      <Row>
                        <Progress
                          percent={Number(formData.statisticsField1Rate) || 0}
                          showInfo={false}
                        />
                      </Row>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <Row>
                        <Col span={16} style={{ textAlign: 'left' }}>
                          天数：
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.nowDay) || 0}
                          </span>
                          /{Number(formData.allDay) || 0}
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.nowDay) !== 0 && Number(formData.allDay) === 0
                              ? '100'
                              : numToRate(div(Number(formData.nowDay), Number(formData.allDay)))}
                            %
                          </span>
                        </Col>
                      </Row>
                      <Row>
                        <Progress
                          percent={numToRate(div(Number(formData.nowDay), Number(formData.allDay)))}
                          showInfo={false}
                        />
                      </Row>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <Row>
                        <Col span={16} style={{ textAlign: 'left' }}>
                          集数(至上周末)：
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.episodesNum) || 0}
                          </span>
                          /{Number(formData.allEpisodesNum) || 0}
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <span style={{ color: '#000', fontWeight: 'bolder' }}>
                            {Number(formData.episodesNum) !== 0 &&
                            Number(formData.allEpisodesNum) === 0
                              ? '100'
                              : numToRate(
                                  div(Number(formData.episodesNum), Number(formData.allEpisodesNum))
                                )}
                            %
                          </span>
                        </Col>
                      </Row>
                      <Row>
                        <Progress
                          percent={numToRate(
                            div(Number(formData.episodesNum), Number(formData.allEpisodesNum))
                          )}
                          showInfo={false}
                        />
                      </Row>
                    </div>
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      textAlign: 'left',
                      minHeight: '300px',
                      height: this.pvcDesDom && this.pvcDesDom.clientHeight + 'px',
                    }}
                  >
                    {this.triangle()}
                    <div>超支风险：</div>
                    {budgetViews.map(v => (
                      <div>
                        【{v.itemName || ''}
                        】预算
                        {v.detailBudgetAmt || ''}
                        万，已拨付
                        {v.detailAppropriationAmt || ''}
                        万，当前使用
                        {v.nowUsedAmt || ''}
                        万，拨付金额已使用
                        {numToRate(div(v.detailAppropredAmt, v.detailAppropriationAmt)) || ''}
                        %，预算已使用
                        {numToRate(v.detailBudgetUsed)}%
                      </div>
                    ))}
                  </div>
                </Col>
                <Col lg={6} md={12} sm={24}>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      minHeight: '300px',
                    }}
                  >
                    {this.triangle()}
                    {riskViews.map((v, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i}>
                        <div>
                          <span
                            style={{
                              backgroundColor: v.riskLevel === 'RISK_LEVEL_HIGH' ? 'red' : '',
                              padding: '3px 5px',
                              borderRadius: '3px',
                            }}
                          >
                            风险
                            {i + 1}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 'auto', wordBreak: 'break-all' }}>
                          ({v.riskLevelDesc || ''}) &nbsp;
                          {v.riskContent || ''}
                        </div>
                        <div>
                          <span>by</span>
                          &nbsp;
                          <span>{v.createUserIdDesc || ''}</span>
                          &nbsp;
                          <span>
                            {v.createTime ? moment(v.createTime).format('YYYY-MM-DD') : ''}
                          </span>
                        </div>
                        {i < riskViews.length - 1 ? (
                          <div
                            style={{
                              width: '100%',
                              borderTop: '1px #000 dashed',
                              margin: '15px 0',
                            }}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          </Spin>
        </Card>
      </PageWrapper>
    );
  }
}

export default index;
