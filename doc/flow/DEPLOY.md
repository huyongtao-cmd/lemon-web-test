# 部署

分两块：`bpmn`和`viewConf`

## 如何部署`bpmn`文件

- UI
  - URL： '/sys/system/flow/managements' -> `流程部署`按钮

- swagger
  - scope： `eds`
  - api: `/eds/ops/bpm/defs`


## 如何部署[`viewConf`](./ViewConf.md)

- swagger 调用接口

  - scope： `eds`
  - api: `/eds/ops/bpm/doc_views/{id}` `PUT`

    - paylod:

      - id: `taskKey`(`defKey-taskKey[-role]`)
      - config: 你的`json`配置
      - remark: 描述

- DB 直连

  table： PS_BPM_DOC_VIEW

  > 注意字段。。。

### 说明

- 本项目据说各流程都很清晰，也是自用项目所以不需要做`流程开发工具`(参考swagger-eds-流程开发工具)的 UI

- 每开发一个流程就会配置对应的`viewConf`，业务确定所以没有提供 `PUT doc_views`的 UI
