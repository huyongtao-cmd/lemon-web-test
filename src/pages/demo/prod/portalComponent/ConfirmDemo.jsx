import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import confirm from '@/components/production/layout/Confirm';
import Button from '@/components/production/basic/Button';

class ConfirmDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: '哈哈哈哈',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="ButtonCard 按钮容器">
          <Button onClick={() => confirm({})}>确认</Button>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 基本使用</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default ConfirmDemo;
