import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import TabsCard from '@/components/production/layout/TabsCard';
import Link from '@/components/production/basic/Link';

class TabsCardDemo extends React.Component {
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
        <TabsCard>
          <TabsCard.TabPane key="test1" tab="标题1">
            内容1
          </TabsCard.TabPane>
          <TabsCard.TabPane key="test2" tab="标题2">
            内容2
          </TabsCard.TabPane>
        </TabsCard>
      </PageWrapper>
    );
  }
}

export default TabsCardDemo;
