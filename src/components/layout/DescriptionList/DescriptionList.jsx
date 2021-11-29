import React from 'react';
import classNames from 'classnames';
import { Row, Col } from 'antd';
import ReactiveWrapper from '../ReactiveWrapper';
import styles from './index.less';

const DescriptionList = ({
  className,
  title,
  hasSeparator,
  col = 2,
  layout = 'horizontal',
  gutter = 32,
  children,
  size,
  noReactive,
  noTop, // 扩展换行使用DescriptionList时会有padding-top
  ...restProps
}) => {
  const clsString = classNames(styles.descriptionList, styles[layout], className, {
    [styles.small]: size === 'small',
    [styles.large]: size === 'large',
  });
  const column = col > 4 ? 4 : col;
  const rowClassName = [
    styles[noTop ? 'row-offset-noTop' : 'row-offset'],
    hasSeparator && styles['has-separator'],
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={[clsString, className].filter(Boolean).join(' ')} {...restProps}>
      {title ? <div className={styles.title}>{title}</div> : null}
      <ReactiveWrapper
        noReactive={noReactive}
        rowProps={{ className: rowClassName, gutter }}
        colProps={{ style: { padding: 0 } }}
      >
        {React.Children.map(
          children,
          child => (child ? React.cloneElement(child, { column }) : child)
        )}
      </ReactiveWrapper>
    </div>
  );
};

export default DescriptionList;
