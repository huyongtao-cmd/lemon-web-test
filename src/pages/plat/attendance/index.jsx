import React from 'react';
import Link from 'umi/link';
import { Card, Row, Col } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';

const Attendance = () => (
  <PageHeaderWrapper title="打卡管理">
    <Card
      className="tw-card-adjust"
      bordered={false}
      title={<Title icon="profile" text="打卡管理" />}
    >
      <Row gutter={100} justify="space-around">
        <Col span={12}>
          <Card title="上下班打卡">
            <Row style={{ height: 70, margin: '0 20%', textAlign: 'center' }}>
              查看上下班打卡记录，设置打卡人员，打卡时间，打卡地点。
            </Row>
            <Row>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Link className="tw-link" to="/hr/attendanceMgmt/attendance/record">
                  查看
                </Link>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Link className="tw-link" to="/hr/attendanceMgmt/attendance/rule">
                  设置
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="其它打卡">
            <Row style={{ height: 70, margin: '0 20%', textAlign: 'center' }}>
              查看其他打卡记录。
            </Row>
            <Row style={{ textAlign: 'center' }}>
              <Link className="tw-link" to="/hr/attendanceMgmt/attendance/recordOther">
                查看
              </Link>
            </Row>
          </Card>
        </Col>
      </Row>
      {/* <Row>
        <Link className="tw-link" to="/hr/attendanceMgmt/attendance/reapply">
          补卡审批
        </Link>
      </Row> */}
    </Card>
  </PageHeaderWrapper>
);

export default Attendance;
