import React from 'react';
import { Alert, Button, Tooltip  } from 'antd';
import styles from './errorHandler.less';

interface TwMessage {
  code: string; //信息编码
  msg?: string; //信息描述
}

interface Props {
  errors?:Array<TwMessage>; // 错误信息
  warns?:Array<TwMessage>; // 警告信息
  [propName: string] : any, // 其它属性
}

class ErrorHandler extends React.PureComponent<Props,any> {
  state = {
    visible: false,
  };

  render() {
    let list = this.props.errors;
    if( !list || list.length<1 ){
      list = this.props.warns || [];
    }
    return list.length>1?(
      <ol style={{padding:0,listStyleType:"decimal"}}>
        {list.map((item,number)=>(<Tooltip key={number} placement="topLeft" title={`编码：${item.code}`}><li>{item.msg}</li></Tooltip>))}
      </ol>
    ):(<Tooltip  placement="topLeft" title={`编码：${list[0].code}`}><li>{list[0].msg}</li></Tooltip>);
  }
}

export default ErrorHandler;
