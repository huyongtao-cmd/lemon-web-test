import React from 'react';

import styles from './style/form.less';

interface Props {
  title?: string; // 标题
  [propName: string]: any, // 其它属性
}


/**
 * 表单标题
 */
class BusinessFormTitle extends React.PureComponent<Props, any> {

  static displayName?: string;

  render() {
    const {
      title,
      ...rest
    } = this.props;


    return (
      <div className={`${styles['prod-form-title']}`}  {...rest}>{title}</div>
    );
  }

}

BusinessFormTitle.displayName = 'BusinessFormTitle';

export default BusinessFormTitle;
