import React from 'react';
import { Form } from 'antd';
// import Loading from '@/components/core/DataLoading';
import { BlankPageContext } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const DemoT1Form = Form.create({
  onFieldsChange(props, changedFields) {
    // 触发一下表单字段更改标记
    props.onTabChange();
    // 理论上是要更新一下表单数据，暂时先空着。
    // props.dispatch()
  },
})(({ onTabChange }) => (
  <p>
    这里的写法复杂一点
    用于带有新增修改功能的表单。注意所有字段的修改需要触发一下父组件中的标记函数。
  </p>
));

// DemoT1.typeName = 'DemoT1'

export default () => (
  <BlankPageContext.Consumer>
    {/* context里面的东西放在这里解构出来，下面只是其中一个任意字段 */
    allProps => <DemoT1Form {...allProps} />}
  </BlankPageContext.Consumer>
);
