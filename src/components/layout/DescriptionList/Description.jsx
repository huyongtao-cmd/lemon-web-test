import React from 'react';
import PropTypes from 'prop-types';
import { Col, Popover } from 'antd';
import styles from './index.less';
import responsive from './responsive';

const Description = ({ labelWidth = 160, term, column, children, popover, ...restProps }) => (
  <Col {...responsive[column]} {...restProps}>
    {term && (
      <div
        // className={[styles.term, popover && styles['has-popover'], 'ant-col-xs-12', 'ant-col-sm-8']
        className={[styles.term, popover && styles['has-popover']].filter(Boolean).join(' ')}
      >
        {popover ? (
          <Popover placement="topLeft" trigger="hover" {...popover}>
            <span className={styles.termWrapper} style={{ width: labelWidth }}>
              {term}
            </span>
          </Popover>
        ) : (
          <span className={styles.termWrapper} style={{ width: labelWidth }}>
            {term}
          </span>
        )}
      </div>
    )}
    {children !== null && children !== undefined && <div className={styles.detail}>{children}</div>}
  </Col>
);

Description.defaultProps = {
  term: '',
};

Description.propTypes = {
  term: PropTypes.node,
};

export default Description;
