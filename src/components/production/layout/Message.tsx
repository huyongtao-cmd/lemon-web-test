import React from 'react';

import {Alert, Icon, message as antMessage} from 'antd';
import {localeString} from '@/components/production/basic/Locale';

import styles from './style/message.less';


interface Props {
  type?: 'info' | 'success' | 'error' | 'warning'; // 类型
  content?: string, // 内容
  duration?: number; // 持续时间
  [propName: string]: any, // 其它属性

}

const iconType = {
  info: 'info-circle',
  success: 'check-circle',
  error: 'close-circle',
  warning: 'exclamation-circle',
  // loading: 'loading'
};

const iconColor = {
  info: '#284488',
  success: '#52c41a',
  error: '#f5222d',
  warning: '#faad14',
};

/**
 * 消息弹出框
 * @param options
 */
const message = (options:Props)=> {
  const {
    type="success",
    content=localeString({defaultMessage:'操作成功',localeNo:'portal:component:message:success:content'}),
    duration = 5,
  } = options;

  const contentWrapper = (
    <span className={styles.message}>
      <Icon type={iconType[type]} theme="filled" style={{ color: iconColor[type] }} />
      <span className={styles.description}>{content}</span>
      <Icon
        type="close"
        theme="outlined"
        style={{ color: '#A4A4A4', marginRight: 0,cursor:'pointer' }}
        onClick={()=>{
          instance();
        }}
      />
    </span>
  );

  const instance = antMessage.info(
    <Alert type={type} message={contentWrapper} />,
    duration
  );

  return instance;
};


export default message;
