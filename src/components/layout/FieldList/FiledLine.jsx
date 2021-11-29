import React from 'react';
// import PropTypes from 'prop-types';
import { Form, Popover } from 'antd';
import styles from './index.less';
import responsive from './responsive';

const FieldLine = ({
  label,
  column,
  fieldCol,
  popover,
  decorator,
  presentational,
  getFieldDecorator, // should come from form
  children,
  required,
  ...restProps
}) => (
  <Form.Item
    className={[
      popover && styles['has-popover'],
      presentational && styles.presentational,
      ...responsive[fieldCol || column],
    ]
      .filter(Boolean)
      .join(' ')}
    label={
      popover ? (
        <Popover placement="topLeft" trigger="hover" {...popover}>
          <span className={required && 'ant-form-item-required'}>{label}</span>
        </Popover>
      ) : (
        <span className={required && 'ant-form-item-required'}>{label}</span>
      )
    }
    labelCol={{ span: 8, xxl: 6 }}
    wrapperCol={{ span: 14, xxl: 16 }}
    {...restProps}
  >
    {!presentational && getFieldDecorator
      ? React.Children.map(
          children,
          child =>
            child
              ? React.cloneElement(child, {
                  column: React.Children.count(children),
                  // column: child.props.column || React.Children.count(children),
                  getFieldDecorator,
                  nesting: true,
                })
              : child
        )
      : children !== null && children !== undefined && children}
  </Form.Item>
);

export default FieldLine;
