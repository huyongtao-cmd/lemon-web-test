import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Button from '@/components/production/basic/Button';

class ButtonDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: '',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="Button 类型">
          <Button type="primary" onClick={() => alert('点击了按钮...')}>
            primary
          </Button>
          <Button type="default" onClick={() => alert('点击了按钮...')}>
            default
          </Button>
          <Button type="info" onClick={() => alert('点击了按钮...')}>
            info
          </Button>
          <Button type="danger" onClick={() => alert('点击了按钮...')}>
            danger
          </Button>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 常用的几种样式的按钮</li>
          </ul>
        </Card>

        <Card title="其它">
          <Button loading>loading</Button>
          <Button disabled>disabled</Button>
          <Button icon="search">带图标</Button>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 其它举例</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default ButtonDemo;
