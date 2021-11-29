import React from 'react';
import {Tabs} from 'antd';
import Card from './Card';

const {TabPane} = Tabs;

interface Props {

  [propName: string]: any, // 额外属性,不添加这个, jsonObj 添加extra属性会报错

}

/**
 * 页签Card
 */
class TabsCard  extends React.Component<Props, any> {

  static TabPane = TabPane; // 页签组件

  constructor(props:any) {
    super(props);
    const {activeTabKey,} = this.props;
    this.state = {
      activeTabKey: activeTabKey, // 选择项
    };
  }


  render() {
    const {
      children,
      ...rest
    } = this.props;

    // console.log(children)
    // React.Children.forEach(children as React.ReactNode,(child,index)=>{
    //   if (!React.isValidElement(child)) return child;
    //   console.log(child.props)
    // });

    return (
      <Card>
        <Tabs
          {...rest}
        >
          {children}
        </Tabs>
      </Card>
    );
  }

}


export default TabsCard;
