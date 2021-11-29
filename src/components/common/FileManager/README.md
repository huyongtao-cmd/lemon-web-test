# FileManager

## TODO

- ~~onCancel -> 接口通了之后做试验，可能需要使用[ref](http://react-component.github.io/upload/examples/simple.html)，
  虽然也有[文档](https://github.com/react-component/upload#methods)表明可以直接调用方法，不过没有changelog啊……不知道哪个版本可以用~~

## 后端要配合的地方

- ~~onRemove 目前删除操作需要hash，因此上传成功之后希望返回。。。详情见FileManagerEnhance里的 onRemove 里的注释~~

## API

| 参数 | 类型 | 说明 | 默认值 |
|-----|-----|-----|-----|
| fileList | Object[] | 已经上传的文件列表 | [] |
| trigger | string | 文件列表展开的触发行为，可选'hover'， 'focus'，'click'， 'contextMenu' | 'click' |
| placement | 'string' | 文件列表框位置，可选 'top', 'left', 'right', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'leftTop', 'leftBottom', 'rightTop', 'rightBottom' | 'bottomLeft' |
| multiple | boolean | 是否支持多选文件，ie10+ 支持。开启后按住 ctrl 可选择多个文件。 | false |
| accept | string | 接受上传的文件类型 | |
| listType | string | 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card | 'text |
| disabled | boolean | 是否禁用 | false |
| onChange | Function({file, fileList, event | false }) | 上传文件改变时的状态 | |
| onRemove | Function(file) | 删除文件 |  |
| beforeUpload | (file, fileList) => boolean | 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。 | |
| action | string | 必选参数, 上传的地址 | |
| headers | Object | 设置上传的请求头部，IE10 以上有效 | { 'el-xsrf': localStorage.getItem('csrfToken') } |
| withCredentials | boolean | 上传请求时是否携带 cookie | |
| data | Object | 上传所需参数或返回上传参数的方法 | { ...tokenInfo, dataKey } |
