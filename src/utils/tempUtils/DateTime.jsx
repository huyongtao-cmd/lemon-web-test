import React from 'react';
import moment from 'moment';

// 返回时间格式字符串模版用于Table行等显示
// TODO: 这个函数应当调用TimeUtil中的时间处理
// 日期
const formatDT = (value, format = 'YYYY-MM-DD') => (value ? moment(value).format(format) : void 0);

// 日期+小时+分钟
const formatDTHM = (value, format = 'YYYY-MM-DD HH:mm') =>
  value ? moment(value).format(format) : void 0;

// TODO: 做成标签组件的形式，便于开发调用。
const DateTime = () => <></>;

export { formatDT, formatDTHM };

export default DateTime;
