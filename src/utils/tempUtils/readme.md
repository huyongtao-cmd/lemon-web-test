---
title:
  zh-CN: 模版字符串工具类
order: 1
cols: 1
---

该工具类用于提供表单或者表格行内的数据格式化

## API

### DateTime

- DateTime
  提供日期模版
  
- DateTime.formatDT : Function
  提供格式化日期函数 使用Moment.js 默认为YYYY-MM-DD(暂无其他支持)
  

### TagOpt

| 参数     | 说明                       | 类型          | 默认值   |
|---------|---------------------------|---------------|---------|
| value   | 需要传入的值                | string number | - |
| opts    | 数据集。opts第一项为默认为空项 | Object        | - |

- opts结构应当为:
```text
{
  默认选项: ["默认颜色", "空值或默认描述" ], 
  选项1: ["颜色1", "属性描述1"],
  选项2: ["颜色2", "属性描述2"],
  ...
}
```
- 颜色可以参考https://ant.design/components/tag/#header


### Wan

- 格式化成人命币 单位为万


### Yuan

- 格式化为人民币 单位为元
