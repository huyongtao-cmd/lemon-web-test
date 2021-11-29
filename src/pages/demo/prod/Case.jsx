import React from 'react';
import { List } from 'antd';
import router from 'umi/router';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Link from '@/components/production/basic/Link';

class Case extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      business: [
        { component: 'SingleCase', componentName: '单表案例', uri: '/demo/prod/case/SingleCase' },
        {
          component: 'MainSub',
          componentName: '主子表案例',
          uri: '/demo/prod/portalComponent/confirm',
        },
      ],
    };
  }

  componentDidMount() {}

  render() {
    const { business } = this.state;

    return (
      <PageWrapper>
        <Card title="常用场景案例">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={business}
            renderItem={item => (
              <List.Item>
                {item.componentName}:{' '}
                <Link onClick={() => router.push(item.uri)}>{item.component}</Link>
              </List.Item>
            )}
          />
          ,
        </Card>
      </PageWrapper>
    );
  }
}

export default Case;
