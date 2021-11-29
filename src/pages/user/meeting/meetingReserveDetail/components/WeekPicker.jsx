import React, { PureComponent } from 'react';
import { Icon } from 'antd';
import moment from 'moment';
import styles from './styles.less';

class WeekPicker extends PureComponent {
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

  componentDidMount() {}

  // 向前查一个星期
  forwardWeek = () => {
    const { onclick } = this.props;
    const { startDate, endDate } = this.state;
    const start = moment(endDate)
      .add(1, 'day')
      .format('YYYY-MM-DD');
    const end = moment(endDate)
      .add(7, 'day')
      .format('YYYY-MM-DD');
    this.setState({
      startDate: start,
      endDate: end,
    });
    onclick({
      startDate: start,
      endDate: end,
    });
  };

  // 向后查一个星期
  backWeek = () => {
    const { onclick } = this.props;
    const { startDate, endDate } = this.state;
    const start = moment(startDate)
      .subtract(7, 'day')
      .format('YYYY-MM-DD');
    const end = moment(startDate)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    this.setState({
      startDate: start,
      endDate: end,
    });
    onclick({
      startDate: start,
      endDate: end,
    });
  };

  render() {
    const { startDate, endDate } = this.state;
    return (
      <div className={styles.weekWrap}>
        <span className={styles.leftBtn} onClick={() => this.backWeek()}>
          <Icon type="double-left" />
        </span>
        <div className={styles.weekStart}>{startDate}</div>至
        <div className={styles.weekEnd}>{endDate}</div>
        <span className={styles.rightBtn} onClick={() => this.forwardWeek()}>
          <Icon type="double-right" />
        </span>
      </div>
    );
  }
}

export default WeekPicker;
