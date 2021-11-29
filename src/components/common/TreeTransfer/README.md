# TreeTransferEnhance

> TreeTransfer 的特定业务版本  
> TreeTransfer 为控件核心内容  
> TreeTransferEnhance 在 TreeTransfer 基础上，实现了业务的组件

## API

| 参数 | 类型 | 说明 | 默认值 |
|-----|-----|-----|-----|
| type | string | 传入的数据源类型，'plain' | 'tree' | 'tree' |
| text | string | 树形控件展示节点标题的字段 | 'text' |
| height | number | string | 控件高度 | 400 |
| dataSource | Object[] | 数据源 | [] |
| structure | Object | 数据转换依赖的转换结构，需传入'id','pid','children','selected' 来转换成树型结构或平铺结构 | { id: 'id', pid: 'pid', children: 'children', selected: 'selected' } |
| columns | object[] | 表格列的配置描述 | |
| onChange | Function(string[], Object[], Object[]) | 被激活的数据的keys，object以及最新状态的数据源 | |
| onActive | Function(string[], Object[]) | 点击向右激活时，被激活的数据的keys，object |
| onDelete | Function(string[], Object[]) | 点击删除时，被激活的数据的keys，object |
| treeProps | Object | 树形控件antd属性注入 | |
| tableProps | Object | 表格控件antd属性注入 | |
