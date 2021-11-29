import React, { PureComponent } from 'react';
import { Card, Row, Col } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import styles from './buDetail.less';

class BuSettleInfo extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { getBuSettleInfo } = this.props;
    getBuSettleInfo(id);
  }

  componentDidUpdate = () => {};

  render() {
    const { dataSource } = this.props;

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
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
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.eqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.eqvaQty}
                  </span>
                  /<span style={dataSource.amt < 0 ? { color: 'red' } : {}}>{dataSource.amt}</span>
                </Col>
              </Row>
              <Row className={styles.lastField}>
                <Col span={12} className={styles.leftField}>
                  申请人总收入当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.applyEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.applyEqvaQty}
                  </span>
                  /
                  <span style={dataSource.applySumSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.applySumSalary}
                  </span>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div style={{ width: '80px', background: '#eee', height: '10px', position: 'relative' }}>
          <div className={styles.circular} />
        </div>
        <div className={styles.buDetail}>
          <div className={styles.taskInfo}>
            <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
              拆包信息
            </p>
            <div>
              <Row style={{ marginBottom: '4px' }}>
                <Col span={12} className={styles.leftField}>
                  本BU累计支出当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.buSumExpendEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.buSumExpendEqvaQty}
                  </span>
                  /
                  <span style={dataSource.buSumExpendSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.buSumExpendSalary}
                  </span>
                </Col>
              </Row>
              <Row style={{ marginBottom: '4px' }}>
                <Col span={12} className={styles.leftField}>
                  申请人累计扣除当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.applySumExpendEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.applySumExpendEqvaQty}
                  </span>
                  /
                  <span style={dataSource.applySumExpendSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.applySumExpendSalary}
                  </span>
                </Col>
              </Row>
              <Row style={{ marginBottom: '4px' }}>
                <Col span={12} className={styles.leftField}>
                  本BU本次支出当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.buExpendEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.buExpendEqvaQty}
                  </span>
                  /
                  <span style={dataSource.buExpendSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.buExpendSalary}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col span={12} className={styles.leftField}>
                  申请人本次扣除当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.applyExpendEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.applyExpendEqvaQty}
                  </span>
                  /
                  <span style={dataSource.applyExpendSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.applyExpendSalary}
                  </span>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div style={{ width: '80px', background: '#eee', height: '10px', position: 'relative' }}>
          <div className={styles.circular} />
        </div>
        <div className={styles.buDetail}>
          <div className={styles.taskInfo}>
            <p className={styles.taskTitle} style={{ marginBottom: '14px' }}>
              结余信息
            </p>
            <div className={styles.taskMoney}>
              <Row>
                <Col span={12} className={styles.leftField}>
                  本BU结余当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.buSurplusEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.buSurplusEqvaQty}
                  </span>
                  /
                  <span style={dataSource.buSurplusSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.buSurplusSalary}
                  </span>
                </Col>
              </Row>
              <Row className={styles.lastField}>
                <Col span={12} className={styles.leftField}>
                  申请人结余当量/金额
                </Col>
                <Col
                  span={10}
                  style={{
                    marginLeft: '26px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={dataSource.applySurplusEqvaQty < 0 ? { color: 'red' } : {}}>
                    {dataSource.applySurplusEqvaQty}
                  </span>
                  /
                  <span style={dataSource.applySurplusSalary < 0 ? { color: 'red' } : {}}>
                    {dataSource.applySurplusSalary}
                  </span>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BuSettleInfo;
