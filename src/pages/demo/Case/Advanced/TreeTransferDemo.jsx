import React from 'react';
import { TreeTransferEnhance } from '@/pages/gen/field';

class TreeTransferDemo extends React.Component {
  onChange = activeData => {
    console.log('do u need it ? ->', activeData);
  };

  render() {
    return <TreeTransferEnhance capasetId={1} onChange={this.onChange} />;
  }
}

export default TreeTransferDemo;
