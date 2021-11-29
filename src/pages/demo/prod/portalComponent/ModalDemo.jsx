import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Modal from '@/components/production/layout/Modal';
import Button from '@/components/production/basic/Button';

class ButtonCardDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: undefined,
      input2Value: '哈哈哈哈',
    };
  }

  componentDidMount() {}

  render() {
    const { visible, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="ButtonCard 按钮容器">
          <Button onClick={() => this.setState({ visible: true })}>弹出</Button>
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 基本使用</li>
          </ul>
        </Card>
        <Modal
          visible={visible}
          onOk={() => this.setState({ visible: false })}
          onCancel={() => this.setState({ visible: false })}
        >
          内容
        </Modal>
      </PageWrapper>
    );
  }
}

export default ButtonCardDemo;
