import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';

class OtherUnpackInfo extends PureComponent {
  componentDidMount() {}

  componentDidUpdate = () => {};

  render() {
    const {
      taskKey,
      dataSource: {
        taskName,
        disterResName,
        receiverResName,
        capasetLevelName,
        receiverBuName,
        guaranteeRate,
        eqvaSalary,
        eqvaQty,
        settlePrice,
        amt,
        apprStatus,
        apprStatusDesc,
      },
    } = this.props;

    return (
      <>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            任务包名称:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {taskName}
          </Col>
        </Row>
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
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            复合能力:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {capasetLevelName}
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            接收资源BU:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {receiverBuName}
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            质保金比例:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {guaranteeRate}%
          </Col>
        </Row>
        <Row gutter={8} style={{ marginBottom: '8px' }}>
          <Col span={10} style={{ textAlign: 'right' }}>
            拆包状态:
          </Col>
          <Col span={14} style={{ textAlign: 'left' }}>
            {apprStatusDesc}
          </Col>
        </Row>
        {taskKey === 'TSK_P12_03_BU_APPR_b' ? (
          <>
            <Row gutter={8} style={{ marginBottom: '8px' }}>
              <Col span={10} style={{ textAlign: 'right' }}>
                转包当量/转包金额:
              </Col>
              <Col span={14} style={{ textAlign: 'left' }}>
                {eqvaQty}/{amt}
              </Col>
            </Row>
            <Row gutter={8} style={{ marginBottom: '8px' }}>
              <Col span={10} style={{ textAlign: 'right' }}>
                BU间结算价:
              </Col>
              <Col span={14} style={{ textAlign: 'left' }}>
                {settlePrice}
              </Col>
            </Row>
            <Row gutter={8} style={{ marginBottom: '8px' }}>
              <Col span={10} style={{ textAlign: 'right' }}>
                申请人当量工资:
              </Col>
              <Col span={14} style={{ textAlign: 'left' }}>
                {eqvaSalary}
              </Col>
            </Row>
          </>
        ) : (
          ''
        )}
      </>
    );
  }
}

export default OtherUnpackInfo;
