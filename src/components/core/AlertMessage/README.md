# pop弹窗提示组件

## 为什么命名为 AlertMessage

因为 UI 设计参照的是 antd 的 Alert 组件，但是行为是 message 组件的行为，
所以命名组合了一下 XD

### API

| 参数 | 类型 | 说明 | 默认值 |
|-----|-----|-----|-----|
| type | string | 提示类型， 'info' | 'success' | 'error' | 'warn' | 'info' |
| description | stirng | 提示内容 | |
| duration | number | 自动关闭的延时，单位秒。设为 0 时不自动关闭。 | 3 |
| onClose | Function | 关闭时触发的回调函数 | |

### Method

createMessage(type, description[, duration, onClose]).then(afterClose)

createMessage(type, description[, duration, onClose])为组件提供的静态方法。then 接口返回值是 Promise。

### 使用说明

```jsx
import createMessage from '@/components/core/AlertMessage';
createMessage({
  type: 'warn',
  description: '这是一条测试数据',
})
```

```jsx
import createMessage from '@/components/core/AlertMessage';
const alertMessage = createMessage({
  type: 'warn',
  description: '这是一条测试数据',
});
// 关闭
createMessage();
// promise形式的
alertMessage.then(() => {});
```
