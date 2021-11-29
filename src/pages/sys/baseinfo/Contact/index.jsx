import React, { PureComponent } from 'react';
import { connect } from 'dva';

@connect(loading => ({
  loading,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class BaseinfoContact extends PureComponent {
  state = {};

  componentDidMount() {}

  render() {
    return <div>通讯录管理 (暂时空白)</div>;
  }
}

export default BaseinfoContact;
