import React, {ReactElement} from 'react';

import {Modal, } from 'antd';
import {localeString} from '@/components/production/basic/Locale';


interface Props {
  title?: string, // 标题
  content?: string, // 内容
  okText?: string, // 确认按钮
  okType?: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger', // 确认按钮类型
  cancelText?: string, // 取消按钮
  onOk?: ()=> void, // 确定事件
  onCancel?: ()=> void, // 取消事件
  [propName: string]: any, // 其它属性

}

/**
 * 1. 组件默认确认删除的提醒方式
 * @param options
 */
const confirm = (options:Props)=> {
  const {
    title=localeString({defaultMessage:'确认',localeNo:'portal:component:confirm:delete:title'}),
    content=localeString({defaultMessage:'确认要删除么?',localeNo:'portal:component:confirm:delete:content'}),
    okText=localeString({defaultMessage:'确认',localeNo:'portal:component:confirm:delete:okText'}),
    okType='danger',
    cancelText=localeString({defaultMessage:'取消',localeNo:'portal:component:confirm:delete:cancelText'}),
    onOk = ()=>{},
    onCancel = ()=>{},
  } = options;
  Modal.confirm({title, content, okText, okType, cancelText, onOk, onCancel,});
};


export default confirm;
