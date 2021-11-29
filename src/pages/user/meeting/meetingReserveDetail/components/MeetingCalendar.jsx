/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, { PureComponent } from 'react';
import { Card, Row, Col } from 'antd';
import moment from 'moment';
import ToolTip from './ToolTip';
import Loading from '@/components/core/DataLoading';
import styles from './styles.less';

const WeekLayout = ({ data, newDate, click }) => (
  <>
    <Row type="flex" justify="start" align="middle" className={styles['calendar-title']} span={24}>
      <Col span={3}>会议名称</Col>
      <Col span={3}>周一</Col>
      <Col span={3}>周二</Col>
      <Col span={3}>周三</Col>
      <Col span={3}>周四</Col>
      <Col span={3}>周五</Col>
      <Col span={3}>周六</Col>
      <Col span={3}>周日</Col>
    </Row>
    {data.length !== 0 ? (
      data.map((item, index) => (
        <Row
          type="flex"
          justify="start"
          align="middle"
          span={24}
          key={index}
          className={styles['calendar-week']}
        >
          <Col span={3}>{item.roomname}</Col>
          <Col span={3} onClick={() => click(item, 0)}>
            {item.Monday.length !== 0 &&
              item.Monday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 1)}>
            {item.Tuesday.length !== 0 &&
              item.Tuesday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 2)}>
            {item.Wednesday.length !== 0 &&
              item.Wednesday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 3)}>
            {item.Thursday.length !== 0 &&
              item.Thursday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 4)}>
            {item.Friday.length !== 0 &&
              item.Friday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 5)}>
            {item.Saturday.length !== 0 &&
              item.Saturday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
          <Col span={3} onClick={() => click(item, 6)}>
            {item.Sunday.length !== 0 &&
              item.Sunday.map(_ => <ToolTip item={_} newDate={newDate} />)}
          </Col>
        </Row>
      ))
    ) : (
      <Row type="flex" justify="start" align="middle" span={24} className={styles['calendar-week']}>
        <div className={styles.dataEmpty}>暂无数据</div>
      </Row>
    )}
  </>
);
class MeetingCalendar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newDate: moment().valueOf(),
    };
  }

  componentDidMount() {}

  clickWeek = (params, index) => {
    const { click } = this.props;
    const clickDate = params.weedDays[index];
    click(clickDate, params.roomname);
  };

  render() {
    const { newDate } = this.state;
    const { data, loading } = this.props;
    return (
      <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
        {!loading ? (
          <div className={styles['calendar-box']}>
            <WeekLayout data={data} newDate={newDate} click={this.clickWeek} />
          </div>
        ) : (
          <Loading />
        )}
      </Card>
    );
  }
}

export default MeetingCalendar;
