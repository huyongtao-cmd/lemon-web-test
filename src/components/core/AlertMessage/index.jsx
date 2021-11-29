import React from 'react';
import { message, Alert, Icon } from 'antd';
import styles from './styles.less';

const iconType = {
  info: 'info-circle',
  success: 'check-circle',
  error: 'close-circle',
  warn: 'exclamation-circle',
  // loading: 'loading'
};

const iconColor = {
  info: '#284488',
  success: '#52c41a',
  error: '#f5222d',
  warn: '#faad14',
};

const createMessage = ({ type = 'info', description = '', duration = 5, onClose }) => {
  const isFunc = typeof onClose === 'function';
  const content = (
    <span className={styles.message}>
      <Icon type={iconType[type]} theme="filled" style={{ color: iconColor[type] }} />
      <span className={styles.description}>{description}</span>
      <Icon
        type="close"
        theme="outlined"
        style={{ color: '#A4A4A4', marginRight: 0 }}
        onClick={() => {
          if (isFunc) {
            onClose();
          }
          // eslint-disable-next-line
          instance();
        }}
      />
    </span>
  );
  const instance = message.info(
    <Alert className={styles.message} type={type} message={content} />,
    duration
  );

  return instance;
};

export default createMessage;
