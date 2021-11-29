# FilemanagerEnhance

> FileManager 的特定业务版本  
> FileManager 为上传下载控件核心内容  
> FilemanagerEnhance 在 Filemanager 基础上，实现了拉取文件服务列表，上传等业务向逻辑

## API

| 参数 | 类型 | 说明 | 默认值 |
|-----|-----|-----|-----|
| api | string | 用于获取token信息 | |
| dataKey | string | 没有的话，就是临时文件，有的话就是对应的文件服务目录 | |
| listType | string | 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card | 'text |
| disabled | boolean | 是否禁用 | false |
| onChange | Function(object[]) | 文件列表 | |
