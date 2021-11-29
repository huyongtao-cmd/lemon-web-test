import React from 'react';
import { union } from 'ramda';

import { Tag } from 'antd';

/**
 * 选择Tag组件
 * @param value - 传入的值
 * @param opts - 选项列表 - 按照项目udc的格式传入
 * @param palette - 调色盘(调色盘为空则调用默认)
 * @param disablePalette - 当等于true的时候禁用调色盘
 * TODO: 这里的比较写的不好，无调色盘则不需要初始化map。本来都是有颜色的，因为需求变更改成有的没有，所以临时改了一下。
 * @return {*}
 * @constructor
 */
const TagOpt = ({ value, opts = [], palette = '', disablePalette }) => {
  const defaultPalette = 'darkGray|red|orange|gold|blue|cyan|blue|purple'.split('|');
  const paletteMap = union(palette.split('|'), defaultPalette);
  // 组装选项列表
  const optList = opts.map((item, i) => ({
    [item.code]: [paletteMap[i % paletteMap.length], item.name],
  }));
  // 在udc列表里面找到选中的那一项
  const chosen = optList.filter(item => Object.keys(item)[0] === value + '')[0];
  // 判断组件属性值
  if (chosen) {
    return disablePalette ? (
      <span>{chosen[value][1] || '无'}</span>
    ) : (
      <Tag color={chosen[value][0]}>{chosen[value][1] || '默认'}</Tag>
    );
  }
  // 默认选项
  if (opts[0]) {
    return disablePalette ? (
      <span>{opts[0].name || '无'}</span>
    ) : (
      <Tag color={paletteMap[0]}>{opts[0].name || '默认'}</Tag>
    );
  }
  // 无配置默认选项
  return <span className="text-error">无</span>;
};

export default TagOpt;
