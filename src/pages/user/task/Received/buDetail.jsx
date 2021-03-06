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
      createMessage({ type: 'warn', description: '????????????????????????' });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userTaskSubpackDetail: {
        formData,
        taskSourceView,
        taskChangeView, // ????????????
        taskSurplusView, // ????????????
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
                  {formatMessage({ id: `misc.rtn`, desc: '??????' })}
                </Button>
              </Card>
            ) : null}
            <Card className="tw-card-adjust" bordered={false}>
              {(!taskId && Number(checkBuFlag)) || taskId ? (
                <DescriptionList size="large" title="????????????">
                  <div className={styles.buDetail}>
                    <div className={styles.taskInfo}>
                      <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
                        ?????????????????????
                      </p>
                      <div className={styles.taskMoney}>
                        <Row>
                          <Col span={12} className={styles.leftField}>
                            ???BU???????????????/??????
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
                              {taskSourceView.buSumSalary}???
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField}>
                          <Col span={12} className={styles.leftField}>
                            ????????????????????????/??????
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
                              {taskSourceView.applySumSalary}???
                            </span>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <Row style={{ marginTop: '14px' }}>
                          <Col span={12} className={styles.leftField}>
                            ??????BU
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
                            ??????BU
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
                            BU????????????
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
                            <span>{taskSourceView.buSettlePrice}???</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ?????????
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
                            ?????????
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
                            ?????????????????????
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
                            <span>{taskSourceView.eqvaSalary}???</span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ???????????????
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
                        ????????????
                      </p>
                      <div className={styles.taskMoney}>
                        <Row>
                          <Col span={12} className={styles.leftField}>
                            ???BU??????????????????/??????
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
                              {taskChangeView.buSumExpendSalary}???
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ???????????????????????????/??????
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
                              {taskChangeView.applySumExpendSalary}???
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ???BU??????????????????/??????
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
                              {taskChangeView.buExpendSalary}???
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ???????????????????????????/??????
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
                              {taskChangeView.applyExpendSalary}???
                            </span>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <Row style={{ marginTop: '14px' }}>
                          <Col span={12} className={styles.leftField}>
                            ??????BU
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
                            ??????BU
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
                            BU????????????
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
                            {taskChangeView.settlePrice}???
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ???????????????
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
                            ???????????????
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
                            ?????????????????????
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
                            {taskChangeView.eqvaSalary}???
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
                              ????????????????????????
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                    <div className={styles.balanceInfo}>
                      <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
                        ????????????
                      </p>
                      <div className={styles.taskMoney}>
                        <Row gutter={5}>
                          <Col span={12} className={styles.leftField}>
                            ???BU????????????/??????
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
                              {taskSurplusView.buSurplusSalary}???
                            </span>
                          </Col>
                        </Row>
                        <Row className={styles.lastField} gutter={4}>
                          <Col span={12} className={styles.leftField}>
                            ?????????????????????/??????
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
                              {taskSurplusView.applySurplusSalary}???
                            </span>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </DescriptionList>
              ) : null}
              <Divider dashed />
              <DescriptionList size="large" col={2} title="??????????????????">
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
