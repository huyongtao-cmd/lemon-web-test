import React, { PureComponent } from 'react';
import { Popover } from 'antd';

class FieldTypePermission extends PureComponent {
  getContent = () => {
    const { emptyContent = <div>请求中...</div>, content, load = false } = this.props;
    if (load) {
      return content;
    }
    return emptyContent;
  };

  render() {
    const node = this.getContent();

    return node;
  }
}

export default FieldTypePermission;
