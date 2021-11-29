import React from 'react';

import {Card as AntCard} from 'antd';

import styles from './style/card.less';
import {CardTabListType} from "antd/lib/card";


interface Props {
  title?: React.ReactNode; // 标题
  tabList?: CardTabListType[];
  [propName: string]: any, // 其它属性
}

/**
 * 产品化Card
 */
class Card  extends React.Component<Props, any> {

  render() {
    const {
      title,
      children,
      ...rest
    } = this.props;

    return (
      <AntCard
        title={title}
        className={`${styles['prod-card']}`}
        {...rest}
      >
        {children}
      </AntCard>
    );
  }

}

export default Card;
