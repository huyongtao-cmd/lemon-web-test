# 可编辑表格

## 注意：

### 以下表格状态需要开发人员在组件外自己维护：

- 数据源 dataSource: array
- 总数 total: number
- 刷新状态 loading: boolean
- 自定义buttons按钮的状态
  - loading: boolean
  - hidden: boolean
  - disabled: boolean
- 自定义columns中render()控件的状态

### rowKey 列表唯一键 为表格必传属性

### 后端不要保存前端为新增行设置的随机唯一键!

## 配置

### 1. 表格

基本上所有ant table组件的入参均支持。 详见 https://ant.design/components/table-cn

#### columns配置

```js
columns: [{
  title: '字典',
  dataIndex: 'dict',
  required: true,
  render: (value, row, index) =>
    <Input
      defaultValue={value}
      size="small"
      onBlur={this.onCellChanged(index, 'dict')}
    />,
}, {
  title: '语言',
  dataIndex: 'lang',
  required: true,
  readOnly: true,
}]
```

#### 表格事件监听 （表格的数据源状态需要开发人员在组件外自己维护）

```js
// 新增事件

import update from 'immutability-helper';
tableProps = () => {
  // ... 其他配置项

  // 新增事件 => 向表格数据源插入记录
  onAdd: (newRow) => {
    this.setState({
      dataSource: update(this.state.dataSource, {
        $push: [{
          ...newRow,
          modifyTime: new Date(),
          lang: 'zh',
          dict: '生成的默认值',
        }],
      }),
    });
  },
  // 复制事件 => 向表格数据源插入记录
  onCopyItem: (copied) => {
    this.setState({
      dataSource: update(this.state.dataSource, { $push: copied }),
    });
  },
  // 删除事件 => 从表格数据源删除记录
  onDeleteItems: (selectedRowKeys, selectedRows) => {
    const newDataSource = this.state.dataSource.filter(row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length);
    this.setState({
      dataSource: newDataSource,
    });
  },
}
```

### 2. 按钮

#### 内置按钮入参

| 参数名        | 作用                 | 默认值   |
|------------|--------------------|-------|
| showAdd    | 是否显示新增按钮           | true  |
| showCopy   | 是否显示复制按钮           | true  |
| showDelete | 是否显示删除按钮           | true  |
| readOnly   | 表格是否只读， 只读状态按钮全不显示 | false |
| buttons    | 自定义按钮组             | []    |

自定义按钮组 buttons举例:

```js
buttons: [{
    key: 'upload',
    title: '可放置自定义按钮',
    icon: 'upload',
    loading: false,
    hidden: false,
    disabled: false,
    minSelections: 0,  // 最少需要选中多少行，按钮才显示
    cb: (selectedRowKeys, selectedRows) => {
      console.log(selectedRowKeys, selectedRows);
    },
  }]
```
