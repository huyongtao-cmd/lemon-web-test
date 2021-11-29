import React from 'react';

import Card from './Card';

import styles from './style/buttonCard.less';



interface Props {

  [propName: string]: any, // 额外属性,不添加这个, jsonObj 添加extra属性会报错

}

/**
 * 按钮专用Card, 减少Card的上下padding
 */
class ButtonCard  extends React.Component<Props, any> {

  static displayName?: string;

  render() {
    const {
      children,
      ...rest
    } = this.props;

    return (
      <Card
        className={styles['prod-button-card']}
        bodyStyle={{padding:'10px 24px'}}
        {...rest}
      >
        {children}
      </Card>
    );
  }

}

ButtonCard.displayName="ButtonCard";

export default ButtonCard;
