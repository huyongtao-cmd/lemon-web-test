import React from 'react';
import { Form } from 'antd';

import { BlankPageContext } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
// 可以分开使用Form监听每个部分字段的变化。
@Form.create({
  onFieldsChange(props, changedFields) {},
})
class DemoT3Form extends React.PureComponent {
  componentDidMount() {}

  render() {
    const { markTab } = this.props;
    // 这里只是为了demo一下tab的修改 - 一般是放在onFieldsChange里面的
    markTab(2);

    return (
      <>Class类型的初始化 - 大多数情况用第一个tab的就OK了。 这里还测试了一下onFieldChange的触发。</>
    );
  }
}

export default () => (
  <BlankPageContext.Consumer>
    {/* context里面的东西放在这里解构出来，下面只是其中一个任意字段 */
    allProps => <DemoT3Form {...allProps} />}
  </BlankPageContext.Consumer>
);
