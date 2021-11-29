# 工作流组件介绍

## 入口 `BpmWrapper`

作为包裹型组件，可以控制流程具体详情页的内容

流程页面分为`A`、`B`、`C`三块，如下区域：

```bash
  #-------------
  #| A   | A-1 | <按钮操作区域>  <流程图按钮#><打印机><返回>  |
  #|     | A-2 | <知会>                                  |
  #|           | <审批意见>                               |
  #|     | A-3 | <流程补录业务单据(一块或多块)#>             |
  #
  #| B   | 业务单据详情页（业务人员自己开发的页#面）            |
  #
  #| C   | <流程履历>                                     |
  #-------------
```

### **A**区

  [配置](/doc/flow/DEPLOY.md)


### **B**区

  业务自己开发的页面

  * 划重点：

    - Card -> 'tw-card-rightLine' 该`className`包含区域为业务自己的工具条

      由于被`BpmWrapper`，参与了工作流页面，因此要加料，做限制。

      工具条内的操作按钮，按用途划分，非业务操作按钮要加上`className -> stand`，业务操作不需要做改动。

      eg:
      ```jsx
      <Card className="tw-card-rightLine">
        <Button className="tw-btn-primary">修改</Button>
        <Button className="tw-btn-primary stand">返回</Button>
      </Card>
      ```
      
      顶部工具条里有两个按钮，修改为业务操作，返回为常规操作；  
      如果不处于流程中，原样展示；如果处于流程中，则修改按钮会被去除。

      `BpmWrapper`根据其是否有`stand`的`class`来控制显示隐藏;

    - 如何区分是否在流程中

      这个由业务测告知。  
      当进入该页面时，`URL`上添加`inflow`参数，[其他参数参照这里]()
  
### **C**区

  [流程履历](./BpmLogs.md)
