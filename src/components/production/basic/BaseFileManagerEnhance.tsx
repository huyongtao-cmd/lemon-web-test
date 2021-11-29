import React from 'react';
import {InputNumber,Icon} from 'antd';
import {localeString} from './Locale';
// @ts-ignore
import {FileManagerEnhance} from "@/pages/gen/field";

import  './style/input-number.less';


interface Props {
  value?: number, // 值
  onChange?(value:any):void, // change事件
  disabled?: boolean; // 是否可编辑
  api?: string, // 附件api地址
  dataKey?: number, // 单据key
  preview?: boolean; // 预览模式
  listType?: 'text' | 'picture' | 'picture-card'; // 上传列表的内建样式
  // placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * FileManagerEnhance 附件组件的产品化形式
 * 1.
 * 2.
 */
class BaseFileManagerEnhance extends React.Component<Props,any> {

  static defaultProps?: object;

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };

  render() {
    const {
      value,
      onChange= ()=>{},
      disabled,
      api, // 附件api地址
      dataKey, // 单据key
      preview,
      listType,
      placeholder = disabled?"":localeString({localeNo:'portal:component:input:placeholder:baseInputNumber',defaultMessage:'请输入'}),
      ...rest
    } = this.props;



    return (
      <FileManagerEnhance
        api={api}
        dataKey={dataKey}
        listType={listType}
        disabled={disabled}
        preview={preview}
        fetchListCallback={(fileLength:number)=>{
          onChange(fileLength || undefined)
        }}
        {...rest}
      />
    );
  }

}

BaseFileManagerEnhance.defaultProps = {
  listType: "text", // 可输入最大长度
};

export default BaseFileManagerEnhance;
