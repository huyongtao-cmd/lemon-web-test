# 样式工具类说明

## 顶部保存区域样式

>  - tw-card-rightLine 只对 Card 生效（同时separate也只会作用在该类下），以保证样式统一切不会影响其他地方
> - separate 用于拆分按钮布局，将按钮两端对齐  
  原理是`flex`布局的 `margin-left: auto`  
  参考下面例子即可。

- 正常布局

  | `button1` `button2` ----------- |

  ```jsx
    <Card className="tw-card-rightLine">
      <Button>
        button1
      </Button>
      <Button>
        button2
      </Button>
    </Card>
  ```

- 右对齐布局

  | ----------- `button1` `button2` |

  ```jsx
    <Card className="tw-card-rightLine">
      <Button className="separate">
        button1
      </Button>
      <Button>
        button2
      </Button>
    </Card>
  ```

- 两端各有布局

  - | `button1`  ----------- `button2` |

    ```jsx
      <Card className="tw-card-rightLine">
        <Button>
          button1
        </Button>
        <Button className="separate">
          button2
        </Button>
      </Card>
    ```

  - | `button1`  ----------- `button2` `button3` |

    ```jsx
      <Card className="tw-card-rightLine">
        <Button>
          button1
        </Button>
        <Button className="separate">
          button2
        </Button>
        <Button>
          button3
        </Button>
      </Card>
    ```

## Button

我们项目默认 button 大小为 large 。

使用对应的 className 即可达到效果。
> eg. `<Button className="tw-btn-warning" size="large" />`

其中 DataTable 组件，size 已内部设置为 large，className根据使用需要自己传入

EditDataTable 不做对应

模版参考：[这里](../pages/demo/Case/Blank.jsx)

# Layout

布局上面，我们得表单分为[输入型](../components/layout/FieldList/index.js)和[展示型](../components/layout/DescriptionList/index.zh-CN.md)

这两个组件目前都包了一个组件[ReactiveWrapper](../components/layout/ReactiveWrapper/README.md)，这个组件用来控制页面响应范围，将自己得 children 在不同得 media 断点设置为不同得宽度。
目前设置已基本覆盖到位，有特殊得需要自己再调整。
