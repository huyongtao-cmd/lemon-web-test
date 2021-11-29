import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Loading from '@/components/production/basic/Loading';

class LoadingDemo extends React.Component {
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
        <Card title="Loading 超链接">
          <Loading />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 基本使用</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default LoadingDemo;
