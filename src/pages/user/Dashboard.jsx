import React, { PureComponent } from 'react';
import { connect } from 'dva';

@connect(loading => ({
  loading,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class UserDashboard extends PureComponent {
  state = {};

  componentDidMount() {}

  render() {
    return <div>个人工作台首页 (暂时空白)</div>;
  }
}

export default UserDashboard;
