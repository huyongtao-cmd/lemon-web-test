import React from 'react';
// @ts-ignore
import { dangerousGetState } from '@/utils/networkUtils';

interface Props{
  defaultMessage: string; // 默认信息
  remindCode?: string; // 消息提醒编号
}


const remindString = ({defaultMessage,remindCode}:Props)=>{
  const remind = dangerousGetState()['global']['remind'];
  let message = remind[remindCode] ;
  if(!message){
    return defaultMessage;
  }
  return message;
};

// export default Locale;
export  {remindString};
