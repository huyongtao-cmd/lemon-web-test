import React, { Component } from 'react';
import { Checkbox, Radio, Select } from 'antd';
import PropTypes from 'prop-types';
// import styles from './index.less';
// import classNames from 'classnames';

/**
 * @author Richard.Cheng
 */
class AsyncCheck extends Component {
  static propTypes = {
    source: PropTypes.oneOfType([PropTypes.func, PropTypes.array]).isRequired,
  };

  constructor(props) {
    super(props);
    const { value, mode } = this.props;

    this.state = {
      value: value || (mode === 'multiple' ? [] : ''),
      dataSource: [],
    };
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    // console.log(nextProps.value);
    const { mode, value, source } = nextProps;
    const newState = { ...nextState };

    // 设置该属性，则每次属性变化都会重新获取值
    if (Array.isArray(source)) {
      Object.assign(newState, {
        dataSource: [...source],
      });
    }

    if (mode === 'multiple') {
      Object.assign(newState, {
        value: value || [],
      });
      // eslint-disable-next-line
    } else if (value + '' !== nextState.value) {
      Object.assign(newState, {
        // eslint-disable-next-line
        value: value ? value + '' : null,
      });
    }
    return newState;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    const { sourceRequest$ } = this.props;
    if (sourceRequest$ instanceof Promise) {
      sourceRequest$.reject();
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // eslint-disable-next-line
  //   return !!nextState.dataSource && nextState.dataSource.length !== this.state.dataSource.length;
  // }

  fetchData() {
    // eslint-disable-next-line
    this.setState({ fetching: true });
    const { source } = this.props;
    // 关于缓存:
    // 暂时全部从后端实时获取，如果需要缓存在request中或者在redux中使用memoize-one来处理，这样不仅限与UDC而是整个项目的网络请求缓存统一。
    switch (typeof source) {
      case 'function':
        return source().then(data => {
          let asyncData = data;
          if (!Array.isArray(data)) {
            // console.warn('Designated source map must be an Array!');
            asyncData = [];
          }
          // console.log('async data source ->', data);
          this.setState({
            dataSource: asyncData,
          });
        });
      default:
        // console.log('sync data source ->', source);
        this.setState({
          dataSource: source || [],
        });
        return source;
    }
  }

  handleChange(value) {
    const { onChange } = this.props;
    onChange(value);
    this.setState({
      value,
      // eslint-disable-next-line
      fetching: false,
    });
  }

  clear() {
    const { mode } = this.props;
    this.setState({
      value: mode === 'multiple' ? [] : '',
    });
  }

  render() {
    const { dataSource, value } = this.state;
    const { multiple, hasFieldDecorator, disabledMap, ...otherProps } = this.props;
    return multiple ? (
      <Checkbox.Group
        {...(dataSource
          ? {
              options: dataSource.map(data => ({
                label: data.name,
                value: data.code,
                disabled: disabledMap ? disabledMap.some(item => item === data.text) : false,
              })),
            }
          : {})}
        {...(hasFieldDecorator ? {} : { value })}
        onChange={this.handleChange}
        {...otherProps}
      />
    ) : (
      <Radio.Group
        {...(hasFieldDecorator ? {} : { value })}
        onChange={this.handleChange}
        {...otherProps}
      >
        {dataSource.map(d => (
          <Radio key={d.code} value={d.code}>
            {d.name}
          </Radio>
        ))}
      </Radio.Group>
    );
  }
}

export default AsyncCheck;
