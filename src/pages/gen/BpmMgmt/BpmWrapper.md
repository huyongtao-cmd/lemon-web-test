# BpmWrapper

## 来源

- 待办
- 已办
- 流程检索
- 知会？
- 首页那些个

每个流程都会有自己的 `defKey`, 通过 `flowToRouter`工具类来找到对应的路由做跳转，
以跳到对应的流程处理页面

参数为：
  
  1. 路由上各自的单据详情id
  2. prcId - 即procId，为流程实例ID
  3. taskId 流程节点id，使用缺省的流程节点推进接口时使用
  4. mode - 'edit|view' 处理或查看模式(比如待办就是`edit`，已办就是`view`)

## API

- api
  | 参数 | 类型 | 说明 | 默认值 |
  |-----|------|-----|--------|
  |fields | array[Object] | 本地流程配置 | [] |
  | fieldsConfig | array[Object] | 动态拉取远程的流程配置 | [] |
  | flowForm | Object | 流程数据缓存,与`onBpmChanges`配合使用 | {} |
  | onBpmChanges | Function(BpmObject)| 参数为流程数据 | void 0 |
  onBtnClick | Function(ClickObject) | 点击按钮操作时的响应 | 无默认值，必须实现 |

  > 划重点！！！ `onBpmChanges`只在多tab切换时触发，以优化性能，如果要做redux缓存就实现它，不做就不实现

  > 划重点中的重点，由于缓存问题，我们需要记录表单数据到 redux 的情况，各自会有个 redux 里的 flowForm 记录对象，里面要加一下 `dirty: false`，这样切页面后，就不会读取redux记录

- `BpmObject`

  | 参数 | 类型 | 说明 | 默认值 |
  |-----|------|-----|--------|
  | remark | string | 审批意见 | undefined |
  | cc | Object | 临时知会人(这个数据就是要传的数据，不要做改动) | undefined |
  这两个为固定参数，其他为动态表单`fields`对应的`key`

- `ClickObject`

  - operation 操作按钮类型
  - formData 动态表单值
  - bpmForm 流程区域的值(remark && cc)
