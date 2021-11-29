/* eslint-disable react/no-array-index-key */
import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import router from 'umi/router';
import styles from './styles.less';

const ProcessShow = ({ data }) => {
  const changeRouter = url => {
    router.push(url);
  };
  const styleShape = [styles.bg_1, styles.bg_2, styles.bg_3, styles.bg_4, styles.bg_5];
  return (
    <div className={styles.shape_contain}>
      {data.map((item, index) => (
        <div className={styles.shape_contain_in} key={index}>
          <div className={styles.shape_title}>{item.proName}</div>
          {/* <div className={styles.shape_main}> */}
          {item.procDtls.map((_, i) => (
            <div className={`${styles.shape_item} ${styleShape[i]}`} key={i}>
              <Tooltip placement="top" title={_.nodeRemark} onClick={() => changeRouter(_.nodeUrl)}>
                <div>{_.nodeName}</div>
              </Tooltip>
            </div>
          ))}
          {/* </div> */}
        </div>
      ))}
    </div>
  );
};
export default ProcessShow;
