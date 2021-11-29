import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Row, Col, Modal, AutoComplete } from 'antd';
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
import Link from 'umi/link';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';
import styles from '../styles.less';
import arrow from '@/assets/img/arrow.svg';

const DOMAIN = 'equivalentCreateFlow';

@connect(({ equivalentCreateFlow, dispatch, loading }) => ({
  dispatch,
  equivalentCreateFlow,
  loading: loading.effects[`${DOMAIN}/submit`],
}))
// @mountToTab()
class SettlementModal extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      equivalentCreateFlow: { formData, taskFormData },
    } = this.props;
    let payload = {};
    if (formData.settlementType === 'TASK_PACKAGE_SETTLE') {
      payload = {
        reasonType: taskFormData.reasonType,
        reasonId: taskFormData.reasonId,
        expenseBuId: taskFormData.expenseBuId,
        receiverBuId: taskFormData.receiverBuId,
      };
    } else if (formData.settlementType === 'BU_ACCOUNT_SETTLE') {
      payload = {
        expenseBuId: taskFormData.expenseBuId,
        receiverBuId: taskFormData.receiverBuId,
      };
    }
    dispatch({
      type: `${DOMAIN}/queryModal`,
      payload,
    });
  }

  render() {
    const {
      visible,
      closeModal,
      handleApply,
      equivalentCreateFlow: { formData, taskFormData, modalFormData },
      loading,
    } = this.props;
    const urls = getUrl();
    const from = stringify({ from: urls });
    return (
      <Modal
        // centered
        width="64%"
        destroyOnClose
        visible={visible}
        onCancel={closeModal}
        title="结算信息"
        wrapClassName={styles.settlementModal}
        // onOk={this.handleSubmit}
        footer={
          <>
            <Button type="primary" size="large" onClick={() => handleApply()} loading={loading}>
              确定
            </Button>
            <Button type="primary" size="large" onClick={() => closeModal(true)}>
              取消
            </Button>
          </>
        }
      >
        <PageHeaderWrapper>
          <div>
            <Row
              type="flex"
              justify="space-around"
              align="middle"
              span={24}
              style={{ width: '94%', margin: '0px auto 20px', color: '#00f' }}
            >
              <Col style={{ width: '30%', textAlign: 'center' }}>
                <span>结算方式</span>
              </Col>
              {formData.settlementType === 'TASK_PACKAGE_SETTLE' && (
                <>
                  <Col
                    style={{
                      width: '38%',
                      textAlign: 'center',
                    }}
                  >
                    <span>任务包名称</span>
                  </Col>
                  <Col style={{ width: '30%', textAlign: 'center' }}>
                    <span>验收/计价方式</span>
                  </Col>
                </>
              )}
            </Row>
            <Row
              type="flex"
              justify="space-around"
              align="middle"
              span={24}
              style={{ width: '94%', margin: '0 auto', color: '#00f' }}
            >
              <Col
                style={{
                  width: '30%',
                  textAlign: 'center',
                }}
              >
                <span>{formData.settlementTypeName}</span>
              </Col>
              {formData.settlementType === 'TASK_PACKAGE_SETTLE' && (
                <>
                  <Col
                    style={{
                      width: '38%',
                      textAlign: 'center',
                    }}
                  >
                    <span>{taskFormData.taskName}</span>
                  </Col>
                  <Col
                    style={{
                      width: '30%',
                      textAlign: 'center',
                    }}
                  >
                    <span>
                      {taskFormData.acceptMethodName}/{taskFormData.pricingMethodName}
                    </span>
                  </Col>
                </>
              )}
            </Row>
          </div>
          <div className={styles.detail}>
            <div className={styles.info}>
              <p className={styles.title} style={{ marginBottom: '14px' }}>
                支出方
              </p>
              <div className={styles.spendingInfo}>
                <Row>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <span>账号</span>
                  </Col>
                  <Col span={16} className={styles.text}>
                    <span style={{ width: '100%', display: 'inline-block' }}>
                      {modalFormData.expenseLedgerNo}
                    </span>
                  </Col>
                </Row>
                <Row style={{ marginTop: '8px' }}>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <span>账号名称</span>
                  </Col>
                  <Col span={16} className={styles.text}>
                    <span style={{ width: '100%', display: 'inline-block' }}>
                      {modalFormData.expenseLedgerName}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={styles.wrapper}>
              <div style={{ width: '100%', marginRight: '20%' }}>
                <div>
                  <Row>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <span>结算当量</span>
                    </Col>
                    <Col span={12} style={{ paddingLeft: '20px' }}>
                      <span>{taskFormData.applyforEqva}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ textAlign: 'right', marginTop: '8px' }}>
                      <span>结算单价</span>
                    </Col>
                    <Col span={12} style={{ marginTop: '8px', paddingLeft: '20px' }}>
                      <span>{taskFormData.settlePrice}元</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ textAlign: 'right', margin: '8px 0px 50px 0px' }}>
                      <span>结算金额</span>
                    </Col>
                    <Col span={12} style={{ margin: '8px 0px 50px 0px', paddingLeft: '20px' }}>
                      <span>{taskFormData.amt}元</span>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
            <div className={styles.info}>
              <p className={styles.title} style={{ marginBottom: '14px' }}>
                收入方
              </p>
              <div className={styles.spendingInfo}>
                <Row>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <span>账号</span>
                  </Col>
                  <Col span={16} className={styles.text}>
                    <span style={{ width: '100%', display: 'inline-block' }}>
                      {modalFormData.receiverLedgerNo}
                    </span>
                  </Col>
                </Row>
                <Row style={{ marginTop: '8px' }}>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <span>账号名称</span>
                  </Col>
                  <Col span={16} className={styles.text}>
                    <span style={{ width: '100%', display: 'inline-block' }}>
                      {modalFormData.receiverLedgerName}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </PageHeaderWrapper>
      </Modal>
    );
  }
}
export default SettlementModal;
