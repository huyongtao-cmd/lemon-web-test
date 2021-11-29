import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Row, Col } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, clone } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import { fromQs } from '@/utils/stringUtils';
import Link from 'umi/link';
import { stringify } from 'qs';
import styles from './buDetail.less';
import SubContractModal from './subContractModal';
import { getUrl } from '@/utils/flowToRouter';
import Loading from '@/components/core/DataLoading';

const { Description } = DescriptionList;
const DOMAIN = 'userTaskSubpackDetail';

@connect(({ loading, userTaskSubpackDetail, dispatch }) => ({
  dispatch,
  loading,
  userTaskSubpackDetail,
}))
@mountToTab()
class BuApprovalDetail extends PureComponent {
  state = {
    subVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, checkBuFlag, taskId } = fromQs();
    taskId &&
      dispatch({
        type: `${DOMAIN}/queryBu`,
        payload: id,
      });
    if (!taskId) {
      if (Number(checkBuFlag)) {
        dispatch({
          type: `${DOMAIN}/queryBu`,
          payload: id,
        });
      } else {
        dispatch({
          type: `${DOMAIN}/query`,
          payload: id,
        });
      }
    }
  }

  closeModal = () => {
    const {
      userTaskSubpackDetail: { taskOtherChangeViews },
    } = this.props;
    const { subVisible } = this.state;
    if (taskOtherChangeViews.length > 0) {
      this.setState({
        subVisible: !subVisible,
      });
    } else {
      createMessage({ type: 'warn', description: '暂无其它转包详情' });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userTaskSubpackDetail: {
        formData,
        taskSourceView,
        taskChangeView, // 转包信息
        taskSurplusView, // 结余信息
        taskApplyView,
        taskOtherChangeViews,
      },
    } = this.props;
    const { checkBuFlag, taskId } = fromQs();
    const { subVisible } = this.state;
    const urls = getUrl();
    const from = stringify({ from: urls });
    const loadingStatus =
      loading.effects[`${DOMAIN}/queryBu`] || loading.effects[`${DOMAIN}/query`];
    return (
      <>
        {loadingStatus ? (
          <Loading />
        ) : (
          <PageHeaderWrapper key={checkBuFlag}>
            {!taskId ? (
              <Card className="tw-card-rightLine">
                <Button
                  className={classnames('separate', 'tw-btn-default')}
                  icon="undo"
                  size="large"
                  onClick={() => {
                    const { from: from1 } = fromQs();
                    closeThenGoto(markAsTab(from1));
                  }}
                >
                  {formatMessage({ id: `misc.rtn`, desc: '返回' })}
                </Button>
              </Card>
            ) : null}
            <Card className="tw-card-adjust" bordered={false}>
              {(!taskId && Number(checkBuFlag)) || taskId ? (
                <DescriptionList size="large" title="结算信息">
                  <div className={styles.buDetail}>
                    <div className={styles.taskInfo}>
                      <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
                        来源任务包信息
                      </p>
                      <div className={styles.taskMoney}>
                        <Row>
                          <Col span={12} className={styles.leftField}>
                            本BU总收入当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskSourceView.eqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSourceView.eqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskSourceView.buSumSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSourceView.buSumSalary}元
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField}>
                          <Col span={12} className={styles.leftField}>
                            申请人总收入当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskSourceView.eqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSourceView.eqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskSourceView.applySumSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSourceView.applySumSalary}元
                            </span>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <Row style={{ marginTop: '14px' }}>
                          <Col span={12} className={styles.leftField}>
                            支出BU
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '48px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskSourceView.expenseBuName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            收入BU
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '48px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskSourceView.receiverBuName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            BU间结算价
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>{taskSourceView.buSettlePrice}元</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            发包人
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>{taskSourceView.disterResName}</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            接包人
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>{taskSourceView.receiverResName}</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            申请人当量工资
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>{taskSourceView.eqvaSalary}元</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            来源任务包
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                            }}
                          >
                            <Link
                              className="tw-link"
                              to={`/user/task/view?id=${taskSourceView.id}&${from}`}
                              style={{
                                display: 'inline-block',
                                width: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {taskSourceView.taskName}
                            </Link>
                          </Col>
                        </Row>
                      </div>
                    </div>
                    <div className={styles.subcontractInfo}>
                      <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
                        转包信息
                      </p>
                      <div className={styles.taskMoney}>
                        <Row>
                          <Col span={12} className={styles.leftField}>
                            本BU累计支出当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskChangeView.buSumExpendEqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.buSumExpendEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskChangeView.buSumExpendSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.buSumExpendSalary}元
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            申请人累计扣除当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskChangeView.applySumExpendEqvaQty < 0
                                  ? styles.negNumberColor
                                  : ''
                              }`}
                            >
                              {taskChangeView.applySumExpendEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskChangeView.applySumExpendSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.applySumExpendSalary}元
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            本BU本次支出当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskChangeView.buExpendEqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.buExpendEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskChangeView.buExpendSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.buExpendSalary}元
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            申请人本次扣除当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskChangeView.applyExpendEqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.applyExpendEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskChangeView.applyExpendSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskChangeView.applyExpendSalary}元
                            </span>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <Row style={{ marginTop: '14px' }}>
                          <Col span={12} className={styles.leftField}>
                            支出BU
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '48px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.expenseBuName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            收入BU
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '48px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.receiverBuName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            BU间结算价
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.settlePrice}元
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            转包发包人
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.disterResName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            转包接包人
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.receiverResName}
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            申请人当量工资
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {taskChangeView.eqvaSalary}元
                          </Col>
                        </Row>
                        <Row
                          type="flex"
                          justify="center"
                          align="middle"
                          span={24}
                          style={{ marginTop: '32px' }}
                        >
                          <Col>
                            <Button
                              className="tw-btn-primary"
                              onClick={() => this.closeModal()}
                              loading={loadingStatus}
                            >
                              查看其它转包详情
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                    <div className={styles.balanceInfo}>
                      <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
                        结余信息
                      </p>
                      <div className={styles.taskMoney}>
                        <Row gutter={5}>
                          <Col span={12} className={styles.leftField}>
                            本BU结余当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskSurplusView.buSurplusEqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSurplusView.buSurplusEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskSurplusView.buSurplusSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSurplusView.buSurplusSalary}元
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            申请人结余当量/金额
                          </Col>
                          <Col
                            span={8}
                            style={{
                              marginLeft: '42px',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              className={`${
                                taskSurplusView.applySurplusEqvaQty < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSurplusView.applySurplusEqvaQty}
                            </span>
                            /
                            <span
                              className={`${
                                taskSurplusView.applySurplusSalary < 0 ? styles.negNumberColor : ''
                              }`}
                            >
                              {taskSurplusView.applySurplusSalary}元
                            </span>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </DescriptionList>
              ) : null}
              <Divider dashed />
              <DescriptionList size="large" col={2} title="转包信息详情">
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
            {subVisible ? (
              <SubContractModal visible={subVisible} closeModal={this.closeModal} />
            ) : null}
          </PageHeaderWrapper>
        )}
      </>
    );
  }
}

export default BuApprovalDetail;
