## 系统状态模型

1. 业务相关的状态模型，请使用当前业务的领域+模块名称，并驼峰命名你的namespace。

1. 同一个项目中namespace不可重复。一下NS被系统注册(并不带有领域名词前缀):
  - global
  - login
  - register
  - uiSettings
  - user
