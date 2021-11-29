import React, { PureComponent } from 'react';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { equals } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import { closeThenGoto } from '@/layouts/routerControl';

import RecordDay from './RecordDay';
import RecordMonth from './RecordMonth';

const contentList = {
  day: <RecordDay />,
  month: <RecordMonth />,
};

class AttendanceRecord extends PureComponent {
  state = {
    operationKey: 'day',
  };

  onOperationTabChange = key => {
    this.setState({ operationKey: key });
  };

  render() {
    const { operationKey } = this.state;

    const className = key => (equals(key, operationKey) ? 'tw-btn-primary' : 'tw-btn-default');

    return (
      <PageHeaderWrapper title="上下班打卡记录">
        <Card className="tw-card-rightLine">
          <Button.Group>
            <Button
              size="large"
              style={{ borderColor: '#284488' }}
              className={className('day')}
              onClick={() => this.onOperationTabChange('day')}
            >
              按天
            </Button>
            <Button
              size="large"
              style={{ borderColor: '#284488', marginLeft: 0 }}
              className={className('month')}
              onClick={() => this.onOperationTabChange('month')}
            >
              按月
            </Button>
          </Button.Group>
          {/* <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/attendance')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button> */}
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="上下班打卡记录" />}
        >
          {contentList[operationKey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceRecord;
