import React from 'react';
import { Icon, Spin } from 'antd';
import { FormattedMessage } from 'umi/locale';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export default () => (
  <div style={{ textAlign: 'center' }}>
    <Spin indicator={antIcon} />
    &emsp;
    <FormattedMessage id="app.data.loading" defaultMessage="数据加载中..." />
  </div>
);
