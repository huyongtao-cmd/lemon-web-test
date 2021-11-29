import React from 'react';
// import PropTypes from 'prop-types';
import { Form, Popover } from 'antd';
import styles from './index.less';
import responsive from './responsive';

const Field = ({
  label,
  name,
  column,
  fieldCol,
  popover,
  decorator,
  presentational,
  nesting,
  getFieldDecorator, // should come from form
  children,
  ...restProps
}) => (
  <Form.Item
    className={[
      nesting && styles.nesting,
      popover && styles['has-popover'],
      presentational && styles.presentational,
      ...responsive[fieldCol || column],
    ]
      .filter(Boolean)
      .join(' ')}
    label={
      popover ? (
        <Popover placement="topLeft" trigger="hover" {...popover}>
          {label}
        </Popover>
      ) : (
        label
      )
    }
    labelCol={{ span: 8, xxl: 6 }}
    wrapperCol={{ span: 14, xxl: 16 }}
    {...restProps}
  >
    {!presentational && getFieldDecorator
      ? getFieldDecorator(name, decorator)(children !== null && children !== undefined && children)
      : children !== null && children !== undefined && children}
  </Form.Item>
);

export default Field;
