# Role 备忘录

## navs

```
[
  {
    "checked": false,
    "code": "string",
    "disabled": false,
    "menu": false,
    "name": "string",
    "pcode": "string",
    "remark": "string",
    "tcode": "string"
  }
]
```

navs 数据有 check，代表是否选中。 所以

```
GET
/eds/ops/iam/roles/{id}/navs
```

即是主数据，也是编辑的时候判断是否选中的数据
