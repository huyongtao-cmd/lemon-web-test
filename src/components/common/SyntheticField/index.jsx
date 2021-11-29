import React, { cloneElement, PureComponent } from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';

/**
 * @author Richard.Cheng
 * TODO: 这里以后通过状态管理优化程序执行，暂时当无状态组件使用。
 */
class SyntheticField extends PureComponent {
  // static propTypes = {
  //   value: PropTypes.array,
  //   onChange: PropTypes.func,
  // };

  render() {
    // antd的form会托管一些属性，在类上指定defaultProps会导致值被解析重置。如下的默认值写法不会影响
    const { value = [], onChange = () => {}, children, ...restProps } = this.props;
    // 数组空值时保证长度
    const valueMap = Object.assign(Array(children.length).fill(void 0), [...value]);

    return (
      <Input.Group compact {...restProps}>
        {children.map((child, i) =>
          cloneElement(child, {
            key: 'fld_' + i, // eslint-disable-line
            value: value[i],
            onChange: e => {
              valueMap[i] = e && e.target ? e.target.value : e;
              return onChange(valueMap);
            },
          })
        )}
      </Input.Group>
    );
  }
}

export default SyntheticField;
