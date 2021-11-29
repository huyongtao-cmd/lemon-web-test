import React from 'react';
import { Row, Col } from 'antd';
// import classnames from 'classnames';
// import styles from './index.less';

const projectColProps = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 22,
  xxl: 19,
};

const fullCol = {
  span: 24,
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 24,
  xxl: 24,
};

const ReactiveWrapper = ({ children, rowProps, colProps, noReactive = false }) => {
  const defaultProps = noReactive ? fullCol : projectColProps;
  return (
    <Row {...rowProps}>
      <Col {...defaultProps} {...colProps}>
        {children}
      </Col>
    </Row>
  );
};

// TODO: 这里还要根据屏幕的 breakpoint， 做进一步细分

export default ReactiveWrapper;
