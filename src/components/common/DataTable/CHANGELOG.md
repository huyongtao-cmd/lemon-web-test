# DataTable

## 本次改动如下：

1. 列显示缓存存取逻辑修改
    1. showColumns 为 false，不做存储，没有设置作用域不做缓存
    2. 缓存作用域由 domain 改为 columnsCache, 一方面与部分组件传 domain 调用 redux 的逻辑做差异化，避免混淆；一方面全局改动调整，修复一个页面多个表格的缓存混淆错误
    3. 存储结构调整，提高取缓存的速度，优化性能
    4. 组件内部update时，columns 更新逻辑变更，优化性能
2. 分页查询参数修改
    1. table 变化时，排序取值逻辑调整，避免赋空
    2. 初始化取值逻辑补充，调整分页参数赋值逻辑
    3. 组件内部update时，分页参数取值调整
3. 切tab保持数据
    1. 修改 selectRowKeys 取值逻辑
    2. selectRows 逻辑调整
    3. 增加分页等信息保持逻辑
4. 导出bug修复
5. 设置缺省值，清洗数据，优化取值判断逻辑，方便阅读
6. rowKey 取值逻辑调整,以兼容antd的接口
7. 解决动态列切换缓存问题，解决数据源改变偶尔触发的数据缓存问题

## 需要配合做的全局改动

1. 对应改动列表第一条，domain -> columnsCache，已改完
2. 有排序的，要设置默认排序项 sortBy,sortDirection
3. 切tab时的数据保持
    情况一: 跟随架构套路，用了 searchForm 的, 讲 searchForm 传进来即可
    情况二：没有跟随的，跟进架构

eg:

```jsx

  const tableProps = {
    rowKey: 'id', // 保证是唯一，实在不行可以不设置
    columnsCache: DOMAIN, // domain -> columnsCache 避免有疑惑
    sortBy: 'id', // 排序主键， 直接传，或者放在 searchForm 里面， 强推直接传，方便阅读！
    sortDirection: 'ASC', // 排序规则， 直接传，或者放在 searchForm 里面， 强推直接传，方便阅读！
    limit: 10, // 可选项，不传就是默认 10
    offset: 0, // 可选项， 不传就是默认 0
    searchForm,// 1. searchBarFormData 2. pagination 3. selectRowKeys
  }
```
