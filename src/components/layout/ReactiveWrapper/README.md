# ReactiveWrapper

简单来说，就是对 antd 的 Row && Col 组件的封装

目前的布局来说

| 断点 | 值 | 解释 |
|---- | ---- | ---- |
| xs | 24 | 占满 |
| sm | 24 | 占满 |
| md | 24 | 占满 |
| lg | 24 | 占满 |
| xl | 20 | col->span : 20 |
| xxl | 17 | col->span : 17 |

## API

| 参数 | 类型 | 说明 | 默认值 |
|-----|-----|-----|-----|
| rowProps | Object | 参考栅栏布局 | |
| colProps | Object | 参考栅栏布局 | |
| noreavtive | boolean | 是否启用弹性列布局 | false |
