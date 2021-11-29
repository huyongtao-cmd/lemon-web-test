/* eslint-disable react/no-array-index-key */
import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import router from 'umi/router';
import styles from './styles.less';

const AbilityMapShow = ({ data }) => {
  const changeRouter = url => {
    router.push(url);
  };
  return (
    <div className={styles.shape_contain}>
      {data.map(item => (
        <div className={styles.btnWrap} key={item.id} onClick={() => changeRouter(item.abilityUrl)}>
          <Tooltip placement="top" title={item.remark}>
            {item.abilityName}
          </Tooltip>
        </div>
      ))}
    </div>
  );
};
export default AbilityMapShow;
