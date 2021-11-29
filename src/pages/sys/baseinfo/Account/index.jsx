import React, { PureComponent } from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

@connect(loading => ({
  loading,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class BaseinfoAccount extends PureComponent {
  state = {};

  componentDidMount() {}

  render() {
    return <PageHeaderWrapper>核算基础数据管理 (暂时空白)</PageHeaderWrapper>;
  }
}

export default BaseinfoAccount;
