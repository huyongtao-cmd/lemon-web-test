# BpmConnection

同 `BpmViewer` 组件一样

因为需求变多，原来的废弃，使用这个

接受参数由多个变为一个

入参数 - source

```typescript
interface sourceObject = {
  docId: string;
  procDefKey: string;
  title?: string;
}

interface source: sourceObject[];
```
