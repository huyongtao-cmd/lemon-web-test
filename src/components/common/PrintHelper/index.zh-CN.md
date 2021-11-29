---
title: Print Helper
subtitle: 打印帮助组件
---

需要打印的时候按如下方法使用该组件：
```jsx

  <PrintHelper content={() => this.componentRef}>
    {/* 任何onClick时间和ref都会被helper托管 */}
    <Button>
      打印
    </Button>
  </PrintHelper>
  
  ...

  <div ref={el => (this.componentRef = el)}>
    {/* ...你想打印的东西, 代码片段，etc. */}
  </div>
  
  {/* 任何非无状态组件也可以直接添加ref，确保多个ref在同一个组件内部不重复 */}
  <AnyComponentNotStateless ref={el => (this.componentRef_2 = el)}/>

```

## API

参数 | 说明 | 类型 | 默认值
----|------|-----|------
copyStyles | 复制当前节点样式 | Boolean | true
onBeforePrint | 打印之前执行的函数 | Function | new Function()
onAfterPrint | 打印调用后执行的函数 | Function | new Function()
pageStyle | 额外需要的内联样式 | string | -
bodyClass | 额外需要的样式className | string | -
content | 打印内容(用ref引用jsx代码片段) | ReactNode\|string | -
