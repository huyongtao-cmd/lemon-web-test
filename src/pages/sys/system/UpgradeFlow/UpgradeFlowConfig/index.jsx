import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

import FlowModeler from '../components/flowComponents';

class FlowCreate extends Component {
  componentDidMount() {}

  render() {
    return (
      <PageHeaderWrapper title="创建流程">
        <FlowModeler />
      </PageHeaderWrapper>
    );
  }
}
export default FlowCreate;
