import React from 'react';
import { Icon } from 'antd';
import { FormattedMessage } from 'umi/locale';
import styles from './index.less';

// 登录表单字段配置文件 - 这里的配置对象key = 组件的class
export default {
  UserName: {
    props: {
      size: 'large',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: (
        <FormattedMessage id="login.form.validate.username" defaultMessage="请输入用户名" />
      ), //
    },
    rules: [
      {
        required: true,
        message: (
          <FormattedMessage id="login.form.validate.username" defaultMessage="请输入用户名" />
        ),
      },
    ],
  },

  Password: {
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'password',
      placeholder: (
        <FormattedMessage id="login.form.validate.password" defaultMessage="请输入密码" />
      ),
    },
    rules: [
      {
        required: true,
        message: <FormattedMessage id="login.form.validate.password" defaultMessage="请输入密码" />,
      },
    ],
  },

  Mobile: {
    props: {
      size: 'large',
      prefix: <Icon type="mobile" className={styles.prefixIcon} />,
      placeholder: 'mobile number',
    },
    rules: [
      {
        required: true,
        message: 'Please enter mobile number!',
      },
      {
        pattern: /^1\d{10}$/,
        message: 'Wrong mobile number format!',
      },
    ],
  },

  Captcha: {
    props: {
      size: 'large',
      prefix: <Icon type="safty-certificate" className={styles.prefixIcon} />,
      placeholder: (
        <FormattedMessage id="login.form.validate.captcha" defaultMessage="请输入密码" />
      ),
    },
    rules: [
      {
        required: true,
        message: <FormattedMessage id="login.form.validate.captcha" defaultMessage="请输入密码" />,
      },
    ],
  },

  SMSCode: {
    props: {
      size: 'large',
      prefix: <Icon type="mail" className={styles.prefixIcon} />,
      placeholder: '短信校验码',
    },
    rules: [
      {
        required: true,
        message: 'Please enter SMSCode!',
      },
    ],
  },
};
