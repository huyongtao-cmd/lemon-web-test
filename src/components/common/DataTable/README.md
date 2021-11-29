# 可编辑表格组件

## 注意：

#### rowKey 列表唯一键 为表格必传属性

#### domain 表格全局的唯一ID 为表格必传属性 用于本地缓存表格的列配置

## 配置

### 1. 表格

基本上所有ant table组件的入参均支持。 详见 https://ant.design/components/table-cn

#### columns配置

参见 ant table 中的配置

#### 表格事件监听 （表格的数据源状态需要开发人员在组件外自己维护）

```js
// 当搜索部变化，可触发搜索
onSearchBarChange: (changedValues, allValues) => {
  console.log(changedValues, allValues);
},
// 当表格变化，必须触发搜索
onChange: filters => {
  console.log(filters);
  this.fetchData(filters);
},
```

### 2. 搜索部配置 searchBarForm

```js
searchBarForm:[
  {
    title: '租户ID',
    dataIndex: 'tenantId',
    render: ()=>{},
    option: {
      // ...https://ant.design/components/form-cn/#getFieldDecorator(id,-options)-%E5%8F%82%E6%95%B0

      rules: [],
      initialValue: [],
    }
  }
]
```

### 3. 按钮配置

| 参数名          | 作用          | 默认值  |
|--------------|-------------|------|
| showSearch   | 是否显示左侧查询按钮  | true |
| showColumn   | 是否显示右侧列配置按钮 | true |
| leftButtons  | 左侧自定义按钮组    | []   |
| rightButtons | 右侧自定义按钮组    | []   |

leftButtons, rightButtons举例:

```js
rightButtons: [{
  key: 'upload',
  title: '上传',
  icon: 'upload',
  loading: false,
  hidden: false,
  disabled: false,
  cb: (selectedRowKeys, selectedRows, queryParams) => {
    console.log(selectedRowKeys, selectedRows, queryParams);
  },
}],
leftButtons: [{
  key: 'add',
  className: 'tw-btn-primary',
  title: '新增',
  loading: false,
  hidden: false,
  disabled: false,
  minSelections: 0,
  cb: (selectedRowKeys, selectedRows, queryParams) => {
    console.log(selectedRowKeys, selectedRows, queryParams);
  },
}],
```
