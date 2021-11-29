import React, { PureComponent } from 'react';
import { Card } from 'antd';
import { OrgBu } from './Component';

class OrgBuData extends PureComponent {
  state = {};

  render() {
    return (
      <Card className="tw-card-multiTab" bordered={false}>
        <OrgBu />
      </Card>
    );
  }
}

export default OrgBuData;
