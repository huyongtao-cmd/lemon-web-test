/* eslint-disable no-nested-ternary */
import React from 'react';
import { Tooltip as AntdTooltip } from 'antd';
import styles from './styles.less';

const ToolTip = ({ item, newDate }) => (
  <AntdTooltip
    placement="rightTop"
    title={() => (
      <div className={styles.toolTipWrap}>
        <div>
          会议室:
          {item.meetingName}
        </div>
        <div>
          开始时间:
          {item.startDate} {item.starTime}
        </div>
        <div>
          结束时间:
          {item.endDate} {item.endTime}
        </div>
        <div>
          电话会议系统:
          {item.isNeedPhoneDesc}
        </div>
        <div>
          投影仪:
          {item.isNeedProjectorDesc}
        </div>
        <div>
          视频会议系统:
          {item.isNeedVideoDesc}
        </div>
        <div>
          申请人BU:
          {item.buName}
        </div>
        <div>
          申请人:
          {item.createUserName}
        </div>
      </div>
    )}
  >
    <div
      className={styles.timeWrap}
      style={{
        background:
          newDate < item.startTimePinch
            ? '#87BBFF'
            : newDate > item.endTimePinch
              ? '#596E90'
              : '#FF8E8E',
      }}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      {item.starTime}-{item.endTime}
    </div>
  </AntdTooltip>
);

export default ToolTip;
