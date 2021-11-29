# Flow button Handle
## 参数说明
#### commitprops 提交流程参数
```
{
  defkey:'ACC_A05',
  value:{
    id:1,
    data:{
      ...
    }
  }
}
```
#### passProps returnProps 推流程按钮
```
{
  taskId: 'TSK_S04:1:8bbf2155-1eba-11e9-89c0-000c2992c5f8',
  result: 'APPROVED', 
};
result的值:
APPLIED("提交"),
REJECTED("被拒"),
FAILED("失败"),
AGAIN("再次询价"),
APPROVED("同意"),;

```
##按钮显示 showButton 说明
```
showButton ={
  COMMIT:true,//提交按钮
  PASS:true,//通过按钮
  RETURN:true,//拒绝按钮
  COUNTERSIGN:true,//加签按钮
  NOTICE:true,//会签按钮
  NOTIFY:true,//知会按钮
}
```
##更多按钮 moreButton 说明
```
const moreButton = (
  <Button key="moreButton" className="tw-btn-primary" size="large" onClick={() => moreButtonFn}>
    更多按钮
  </Button>
);
```
