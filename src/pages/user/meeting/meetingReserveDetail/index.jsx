import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { DatePicker, Card, Row, Col } from 'antd';
import Title from '@/components/layout/Title';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { TipTag, MeetingCalendar, WeekPicker } from './components';

import styles from './styles.less';

const { RangePicker } = DatePicker;
const DOMAIN = 'meetingReserveDetail';
@connect(({ loading, meetingReserveDetail }) => ({
  meetingReserveDetail,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MeetingReserveDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment()
        .subtract(moment().format('E') - 1, 'days')
        .format('YYYY-MM-DD'), // 周一日期
      endDate: moment()
        .add(7 - moment().format('E'), 'days')
        .format('YYYY-MM-DD'), // 周日日期
    };
  }

  componentDidMount() {
    const { startDate, endDate } = this.state;
    this.fetchData({ startDate, endDate });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  createMeetingReserve = (params, roomName) => {
    closeThenGoto(
      `/user/meetingManage/meetingReserveList/detail?mode=create&formPage=reserveDetail&date=${params}&meetingName=${roomName}`
    );
  };

  // 更改日期
  changeDate = value => {
    this.fetchData({ ...value });
  };

  render() {
    const { meetingReserveDetail, dispatch, loading } = this.props;
    const { list } = meetingReserveDetail;
    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="会议室预定情况" />}
          bordered={false}
        >
          <Row type="flex" justify="start" align="middle">
            <Col span={8}>
              <WeekPicker onclick={this.changeDate} loading={loading} />
            </Col>
            <Col span={8}>
              <div style={{ color: '#FF8E8E' }}>
                温馨提示：点击对应日期格子空白处可快速预约会议室
              </div>
            </Col>
            <Col span={6} offset={2} className={styles.rightCol}>
              <TipTag text="进行中" color="#FF8E8E" />
              <TipTag text="待进行" color="#87BBFF" />
              <TipTag text="已结束" color="#596E90" />
            </Col>
          </Row>
        </Card>
        <MeetingCalendar
          key={list}
          data={list}
          dispatch={dispatch}
          loading={loading}
          click={this.createMeetingReserve}
        />
      </PageHeaderWrapper>
    );
  }
}

export default MeetingReserveDetail;
