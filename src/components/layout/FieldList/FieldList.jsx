import React from 'react';
import classNames from 'classnames';
import { Form, Row, Col } from 'antd';
import ReactiveWrapper from '../ReactiveWrapper';
import styles from './index.less';

const FieldList = ({
  className,
  legend,
  hasSeparator,
  layout = 'horizontal',
  col = 2,
  getFieldDecorator = () => void 0,
  children,
  noReactive,
  ...restProps
}) => {
  const clsString = classNames(
    hasSeparator && styles['has-separator'],
    styles['form-fieldset'],
    styles[layout],
    className
  );
  const column = col > 4 ? 4 : col;
  return (
    <Form className={clsString} {...restProps}>
      {legend ? <div className={styles.title}>{legend}</div> : null}
      <ReactiveWrapper noReactive={noReactive}>
        {React.Children.map(
          children,
          child => (child ? React.cloneElement(child, { column, getFieldDecorator }) : child)
        )}
      </ReactiveWrapper>
    </Form>
  );
};

export default FieldList;
