import React, { PureComponent } from 'react';
import { connect } from 'dva';

@connect(loading => ({
  loading,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class SysDashboard extends PureComponent {
  state = {};

  componentDidMount() {}

  render() {
    return <div>xitong工作台首页 (暂时空白)</div>;
  }
}

export default SysDashboard;
