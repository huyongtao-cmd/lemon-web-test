import React from 'react';
// @ts-ignore
import { dangerousGetState } from '@/utils/networkUtils';

interface Props{
  defaultMessage: string; // 默认信息
  localeNo?: string; // 国际化编号
}

const Locale:React.FC<Props> = ({defaultMessage,localeNo}) => {

  return (<>{localeString({defaultMessage,localeNo})}</>);
};

const localeString = ({defaultMessage,localeNo}:Props)=>{
  const locale = dangerousGetState()['global']['locale'];
  if(!locale){
    return defaultMessage;
  }
  const user = dangerousGetState()['user'];
  let language = user.user.info.language;
  let tenantId = user.user.info.tenantId+"";
  if(!language || language.indexOf('zh')> -1 ){
    language = 'zh-CN';
  }
  let messageObj = locale[tenantId] && locale[tenantId][localeNo];
  if(!messageObj){
    messageObj = locale['basic'] && locale['basic'][localeNo];
  }
  if(!messageObj){
    return defaultMessage;
  } else {
    return messageObj[language] || messageObj['defaultName'];
  }

};

export default Locale;
export  {localeString};
