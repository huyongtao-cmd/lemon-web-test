import React from 'react';
import classNames from 'classnames';
import { Button, Form } from 'antd';
import styles from './index.less';

const FormItem = Form.Item;

const LoginSubmit = ({ className, ...rest }) => {
  const clsString = classNames(styles.submit, 'tw-btn-primary', className);
  return (
    <FormItem>
      <Button htmlType="submit" className={clsString} size="large" {...rest} />
    </FormItem>
  );
};

export default LoginSubmit;
