import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Locale from '@/components/production/basic/Locale';

class LocaleDemo extends React.Component {
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
        <Card title="Locale 前端国际化">
          <Locale defaultMessage="默认值" localeNo="" />
          <br />
          <Locale
            defaultMessage="默认值2"
            localeNo="portal:component:input:placeholder:baseInput"
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. defaultMessage 用在找不到localeNo时显示信息,也会方便代码搜索</li>
            <li>
              2. localeNo
              只能是portal开头的信息才能访问到,其它的不会读取到前端.因为所有的国际化信息读取到前端是性能浪费
            </li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default LocaleDemo;
