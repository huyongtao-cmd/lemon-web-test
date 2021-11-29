# Button 说明

## TW's Button

| 参数 | 类型 | 说明 | 默认值 |
|-----|------|-----|--------|
|type | string? | 按钮类型，'primary', 'info', 'success', 'error', 'warning', 'default' | 'default' |
|size | string? | 按钮大小，'small', 'default', 'large' | 'large' |

其他 API 参考 antd button

## Authorized

> 通过 context 实现，进入时拉取 当前登录人 有权限的所有 codes (string[])
> 需要权限的 Button 配置好 code， 当其包含在 上下文中的时候，即可展示，否则隐藏。
> 不设置则不计入权限规则

| 参数 | 类型 | 说明 | 默认值 |
|-----|------|-----|--------|
|code | string? | 权限code | '' |


