import React from 'react';
import router from "umi/router";

interface Props {
  disabled?: boolean, // 是否可点击
  onClick?: React.MouseEventHandler<any>; // 点击事件
  twUri?: string; // tw系统内跳转链接
  [propName: string] : any, // 其它属性

}

/**
 * 1. <a/> 超链接的封装
 */
class Link extends React.Component<Props,any> {


  render() {
    const {
      disabled,
      children,
      twUri,
      style,
      ...rest
    } = this.props;

    const disabledStyle = disabled? { color: 'rgba(0, 0, 0, 0.25)', cursor: 'not-allowed' }:{};

    let twUriJson:any = {};
    if(twUri){
      twUriJson.onClick = ()=> {
        router.push(twUri);
      }
    }

    return (
      <a
        href={void 0}
        style={{...style,color:"#1890ff", ...disabledStyle}}
        {...twUriJson}
        {...rest}
      >
        {children}
      </a>
    );
  }

}

export default Link;
