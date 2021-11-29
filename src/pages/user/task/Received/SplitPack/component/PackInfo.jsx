import React, { PureComponent } from 'react';
import { Card, Row, Col } from 'antd';

class PackInfo extends PureComponent {
  componentDidMount() {}

  componentDidUpdate = () => {};

  render() {
    const {
      taskKey,
      dataSource: {
        expenseBuName,
        receiverBuName,
        eqvaQty,
        eqvaSalary,
        disterResName,
        receiverResName,
        taskName,
        amt,
        settlePrice,
      },
    } = this.props;

    return (
      <>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            支出BU:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {expenseBuName}
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            收入BU:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {receiverBuName}
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            总当量/总金额:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {eqvaQty}/{amt}
          </Col>
        </Row>
        {taskKey === 'TSK_P12_03_BU_APPR_b' ? (
          <Row gutter={8} style={{ marginBottom: '8px' }}>
            <Col span={10} style={{ textAlign: 'right' }}>
              BU间结算价:
            </Col>
            <Col span={14} style={{ textAlign: 'left' }}>
              {settlePrice}元
            </Col>
          </Row>
        ) : (
          ''
        )}
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            发包人:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {disterResName}
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            接包人:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {receiverResName}
          </Col>
        </Row>
        {taskKey === 'TSK_P12_03_BU_APPR_b' ? (
          <Row gutter={8} style={{ marginBottom: '8px' }}>
            <Col span={10} style={{ textAlign: 'right' }}>
              申请人当量工资:
            </Col>
            <Col span={14} style={{ textAlign: 'left' }}>
              {eqvaSalary}元
            </Col>
          </Row>
        ) : (
          ''
        )}
        {taskKey === 'TSK_P12_02_ORIGINAL_CONFIRM_b' || taskKey === 'TSK_P12_03_BU_APPR_b' ? (
          <Row gutter={8} style={{ marginBottom: '8px' }}>
            <Col span={10} style={{ textAlign: 'right' }}>
              来源任务包:
            </Col>
            <Col span={14} style={{ textAlign: 'left' }}>
              {taskName}
            </Col>
          </Row>
        ) : (
          ''
        )}
      </>
    );
  }
}

export default PackInfo;
