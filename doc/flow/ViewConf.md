# 工作流配置

## **JSON**命名说明

`bpmn`文件有自己`defKey`，然后其没个节点有自己的`taskKey`
因此推荐的命名规则是`defKey-taskKey`
> 本项目的要求： taskKey 为 `defKey-taskKey`，每个节点其实已经自带作用域了==

- 这个命名只是基础版本，以后加了权限的时候，可能会变更为`defKey-taskKey-role`，视具体情况而定

## 内容分类

  配置主要包含三块：

    - taskKey 方便业务人员拉代码时确定自己当前处于什么节点，要做什么对应的业务
    - buttons 顶部操作按钮控制
    - fields 表单区域控制

示例：

  ```json
    {
      "taskKey": "",
      "buttons": [],
      "fields": []
    }
  ```

### taskKey

> 上面已经解释过了

### buttons

  ```json
    {
      "type": "button",
      "icon": "interation",
      "key": "ASSIGN",
      "title": "app.setting.flow.assign",
      "className": "tw-btn-primary"
    }
  ```

#### 按钮图标库

| code | name | icon | i18n | color |
|------|------|------|------|-------|
| APPLIED | 提交 | deployment-unit |  app.setting.flow.applied | tw-btn-primary |
| ABORTED | 作废 | delete | app.setting.flow.aborted | tw-btn-error |
| APPROVED | 通过 | check-square | app.setting.flow.approved | tw-btn-primary |
| REJECTED | 拒绝 | close-square | app.setting.flow.rejected | tw-btn-error |
| ASSIGN | 分配 | interation | app.setting.flow.assign | tw-btn-primary |
| NOTIFIED | 知会 | notification | app.setting.flow.notified | tw-btn-warning |
| REVIEWED | 已阅 | read | app.setting.flow.reviewed | tw-btn-warning |
| CONTINUED | 继续 | build | app.setting.flow.continued | tw-btn-primary |
| CLOSE | 关闭 | close | app.setting.flow.close | tw-btn-error |
| REVOKED | 撤回 | rollback | app.setting.flow.revoked | tw-btn-primary |
| ACCEPT | 接收 | check | app.setting.flow.accept | tw-btn-primary |
| EDIT | 修改 | form | misc.update | tw-btn-primary stand |
| EVAL | 评价 | highlight | app.setting.flow.eval | tw-btn-primary stand |
| CREATE_TASK | 新建任务包 | plus-circle | app.setting.flow.createTask | tw-btn-primary stand |
| CREATE_SUB_TASK | 创建转包任务包 | plus-circle | app.setting.flow.createSubPageTask | tw-btn-primary stand |
| BOOKING | 录入订票详情 | check-square | app.setting.flow.booking | tw-btn-primary |

> [每个按钮对应的流程图颜色](/src/pages/gen/BpmMgmt/variable.js)

> **修改 EDIT** 和 **评价 EVAL** 都是业务操作， 所以设置 calssName 的时候，加一下 埋点 'stand'，如果以后要公共组件去控制的时候，可以有口子去做

#### 额外类型

  ```json
    {
      "type": "cc"
    }
  ```

  如果有需要临时添加**知会人**的节点，要加上这个配置。组件读取到这个`type`的时候，就会增加配置画面

### fields

  ```json
    {
      "cardId": "leads",
      "disabled": 0,
      "hidden": 0,
      "items": [
        {
          "dataIndex": "salesmanResId",
          "required": 1,
          "disabled": 0,
          "hidden": 0
        }
      ]
    }
  ```

表单配置由 块(block) 级开始划分， 下分 条(item)

- block
  | key | type | desc | optional |
  | --- | --- | --- | --- |
  | cardId | string | 块级Id，以此区分不同块 | 必须 |
  | disabled | boolean | 展示型(DescriptionList)还是编辑型(FieldList) | 可选 |
  | hidden | boolean | 显示还是隐藏 | 可选（需要隐藏的加上hidden: 1即可） |
  | items | array[Object] | 表单内容列表 | 可选(但是一般有块了其实还是会有items的) |

- item
  | key | type | desc | optional |
  | --- | --- | --- | --- |
  | dataIndex | string | 表单字段 | 必须 |
  | required | boolean | 是否必须 | 可选 |
  | disabled | boolean | 展示型(span包裹)还是编辑型(可编辑组件) | 可选 |
  | hidden | boolean | 显示还是隐藏 | 可选（需要隐藏的加上hidden: 1即可） |
