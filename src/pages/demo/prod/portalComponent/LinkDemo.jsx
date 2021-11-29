import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Link from '@/components/production/basic/Link';

class LinkDemo extends React.Component {
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
        <Card title="Link 超链接">
          <Link>超链接</Link>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 基本使用</li>
          </ul>
        </Card>

        <Card title="其它">
          <Link onClick={() => alert('点击')}>超链接</Link>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 点击事件</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default LinkDemo;
