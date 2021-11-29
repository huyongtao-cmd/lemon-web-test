import React from 'react';
import Loading from '@/components/production/basic/Loading';


interface Props {
  loading?: boolean; // 是否加载中
  [propName: string]: any, // 其它属性

}

/**
 * 页面包装组件
 * 1. 页面层次包装处理逻辑,非最外层页面不建议使用该组件包括
 * 2. 提供loading状态,使页面加载状态展示统一,代码逻辑更清楚
 */
class PageWrapper  extends React.Component<Props, any> {



  render() {
    const {
      children,
      loading=false,
    } = this.props;

    return (
      <>
        {loading?<Loading/>:children}
      </>
    );
  }

}

export default PageWrapper;
