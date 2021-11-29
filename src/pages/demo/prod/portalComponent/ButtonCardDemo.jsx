import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

class ButtonCardDemo extends React.Component {
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
          <ButtonCard>
            <Button>按钮1</Button>
            <Button>按钮2</Button>
            <Button>按钮3</Button>
          </ButtonCard>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 基本使用</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default ButtonCardDemo;
