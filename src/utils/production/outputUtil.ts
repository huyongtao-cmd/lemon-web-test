import React from 'react';
import { Icon, notification,Modal } from 'antd';

import BusinessErrorHandler from './BusinessErrorHandler';
import {string} from "prop-types";

// @ts-ignore
const dangerousDispatch = settings => window.g_app._store.dispatch(settings);

interface TwMessage {
  code: string; //信息编码
  msg?: string; //信息描述
}
interface OutputProps{
  ok?: boolean;
  data?: any;
  warns?: TwMessage[];
  errors?: TwMessage[];
}
interface RequestFunction {
  (...params: Array<any>): Promise<OutputProps>;
}
interface CallbackFunction {
  (data:object):void;
}


/**
 * 后端请求返回封装,后端返回失败后默认抛出异常，不走后续方法
 * @param asyncFunction 后端请求方法
 * @param params 请求参数
 * @param cb 警告框确认按钮回调的dva方法
 * @param throwErrorFlag 后端遇到错误时是否抛异常中止程序允许，默认为true
 */
const outputHandle = async (asyncFunction:RequestFunction,params?:Object,cb?: string| CallbackFunction,throwErrorFlag=true) => {
  const response:any = await asyncFunction(params);
  if(response.status >= 200 && response.status < 300){
    const outputObject:OutputProps = response.response;
    if(outputObject.ok){
      return outputObject;
      // callback(outputObject);
    }else {
      if(outputObject.errors && outputObject.errors.length > 0){
        Modal.error({
          title: '操作失败',
          okText:"确认",
          content: React.createElement(BusinessErrorHandler, {
            errors: outputObject.errors
          }),
        });
      }else if(outputObject.warns && outputObject.warns.length > 0){
        Modal.confirm({
          title: '警告',
          content: React.createElement(BusinessErrorHandler, {
            warns: outputObject.warns
          }),
          okText:"确认",
          cancelText:"取消",
          onOk:async ()=>{
            // @ts-ignore
            const output = await outputHandle(asyncFunction,{...params,ignoreWarning:true},undefined,throwErrorFlag);
            if(typeof cb === 'string'){
              dangerousDispatch({type:cb,payload:output});
            }
            if(typeof cb === 'function'){
              cb(output);
            }
          },
          onCancel() {},
        });
      }else {
        console.warn("后端返回错误时,请添加错误信息(addErrors或者addWarns)")
      }
      if(throwErrorFlag){
        throw Error("后端处理失败或未按产品化要求返回OutputUtil工具类！");
      }else{
        return outputObject;
      }

    }
  }else {
    console.error("后端响应失败！");
    if(throwErrorFlag){
      throw Error("后端处理失败或未按产品化要求返回OutputUtil工具类！");
    }else{
      return response;
    }
  }


};


export {outputHandle,OutputProps};
