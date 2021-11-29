import React from 'react';
import styles from './styles.less';

const TipTag = ({ text, color }) => (
  <div className={styles.tipWrap}>
    <span className={styles.tip} style={{ background: color }} />
    <span>{text}</span>
  </div>
);

export default TipTag;
