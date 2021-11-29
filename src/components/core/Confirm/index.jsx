import React from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Modal } from 'antd';
import styles from './index.less';

const MODAL_TYPES = ['info', 'success', 'warning', 'error'];

const createConfirm = ({
  title = 'misc.note',
  type = 'confirm',
  content,
  i18n,
  choices = ['app.alert.confirm', 'app.alert.cancel'],
  className,
  ...restProps
}) =>
  Modal[type]({
    className: className ? styles[className] : styles.confirmHack,
    title: formatMessage({ id: title, defaultMessage: 'Info' }),
    content: i18n ? formatMessage({ id: i18n, defaultMessage: content }) : content,
    okText: formatMessage({ id: choices[0] }),
    cancelText: formatMessage({ id: choices[1] }),
    okButtonProps: { size: 'large', className: 'tw-btn-primary' }, // 我们的button都是 large 的，所以这里注入一下
    cancelButtonProps: { size: 'large', className: 'tw-btn-default' },
    ...restProps,
  });

const createAlert = appProps => createConfirm({ ...appProps, type: 'info' });
MODAL_TYPES.forEach(key => {
  createAlert[key.toLowerCase()] = ({ ...restProps }) => createConfirm({ ...restProps, type: key });
  createConfirm[key.toLowerCase()] = ({ ...restProps }) =>
    createConfirm({ ...restProps, type: key });
});

// TODO: 这块还没设计好 所以先export一个function 以后用class
// eslint-disable-next-line
export { createConfirm, createAlert };
