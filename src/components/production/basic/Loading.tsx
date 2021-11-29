import React from 'react';
import { Icon, Spin } from 'antd';

import Locale from '@/components/production/basic/Locale';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export default () => (
  <div style={{ textAlign: 'center' }}>
    <Spin indicator={antIcon} />
    &emsp;
    <Locale defaultMessage="数据加载中..." localeNo="portal:component:loading:tip" />
  </div>
);
