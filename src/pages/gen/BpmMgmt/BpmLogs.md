# BpmLogs

接收流程实例`prcId`，拉取对应履历做展示

`prcId` 在 `BpmWrapper` 套件内时，由套件本身提供，其来源在`URL`上面

由于履历已经倒叙展示，我们不需要对返回数据`reverse`，直接渲染即可
