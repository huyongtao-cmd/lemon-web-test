import React from 'react';

import Loading from '@/components/core/DataLoading';

import { BlankPageContext } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
export default props => (
  <BlankPageContext.Consumer>
    {(/* 用什么就在这里解构什么 - 所有属性都在父页面定义了。 */) => (
      <>
        <p>
          这个是最简单的写法 无状态组件 一般用于table之类的纯查询(下面随便放一个loading，没有作用)
        </p>
        <Loading />
      </>
    )}
  </BlankPageContext.Consumer>
);
