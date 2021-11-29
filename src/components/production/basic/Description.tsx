import React from 'react';

interface Props {
  value?: any, // 值
  [propName: string] : any, // 其它属性

}

/**
 * 1. 字段情模式
 */
class Description extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      value,
    } = this.props;

    return (
      <pre>{value}</pre>
    );
  }

}

Description.defaultProps = {
  value: '',
};

export default Description;
