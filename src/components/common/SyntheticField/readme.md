---
title: SyntheticField
subtitle: 合成字段组件
order: 1
cols: 1
---

将多个字段合成一个name控制的字段，value以数组形式传入，依次赋值给每一个子字段组件。
注意：该组件不支持深级别渗透，只能支持1级。
内部写法与antd的input.group组件相同 详见: https://ant.design/components/input/#header

## API

### SyntheticField

| 参数        | 说明                       | 类型           | 默认值         |
|------------|---------------------------|---------------|---------------|
| value      | 数组，赋值给每个组件的参数      | Array         | `[]`          |
| onChange   | 监听整个组件的方法            | Function      | `() => {}`    |
| className  | 样式Class                  | String        | void 0        |
