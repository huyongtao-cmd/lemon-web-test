import React, { Component } from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
// import { clone } from 'ramda';
// import styles from './index.less';
// import classNames from 'classnames';

/**
 * @author Richard.Cheng
 */
class AsyncSelectDisable extends Component {
  static propTypes = {
    source: PropTypes.oneOfType([PropTypes.func, PropTypes.array]).isRequired,
  };

  constructor(props) {
    super(props);
    const { value, mode } = this.props;

    this.state = {
      value: value || (mode === 'multiple' ? [] : null),
      dataSource: [],
      sourceRequest: () => {},
    };
  }

  /**
   * TODO: 这里的生命周期控制没做好，可能产生性能损耗，开发时间紧张暂时不打算优化，后期这里要处理一下。
   * 本次改动修复联动问题。这里做一下注释防止后人踩坑：
   * static 静态方法里面，没有 this 啊，所以才GG了
   */
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
    const { sourceRequest } = this.props;
    if (sourceRequest instanceof Promise) {
      sourceRequest.reject();
    }
  }

  handleChange = (value, target) => {
    const { onChange } = this.props;
    // console.log('value, target ->', value, target);
    onChange && onChange(value, target);
    this.setState({
      value,
    });
  };

  fetchData() {
    const { source } = this.props;
    // 关于缓存:
    // 暂时全部从后端实时获取，如果需要缓存在request中或者在redux中使用memoize-one来处理，这样不仅限与UDC而是整个项目的网络请求缓存统一。
    switch (typeof source) {
      case 'function':
        // eslint-disable-next-line
        const sourceRequest = source();
        return sourceRequest.then(data => {
          let asyncData = data;
          if (!Array.isArray(data)) {
            // console.warn('Designated source map must be an array!');
            asyncData = [];
          }
          this.setState({
            sourceRequest,
            dataSource: asyncData,
          });
        });
      default:
        this.setState({
          dataSource: source || [],
        });
        return source;
    }
  }

  clear() {
    const { mode } = this.props;
    this.setState({
      value: mode === 'multiple' ? [] : null,
    });
  }

  render() {
    const { dataSource, value } = this.state;
    const { ...otherProps } = this.props;
    return (
      <Select
        defaultActiveFirstOption={false}
        className="x-fill-100"
        getPopupContainer={() => document.getElementById('root')}
        allowClear
        // filterOption={false}
        showSearch
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...otherProps}
        value={value}
        onChange={this.handleChange}
      >
        {Array.isArray(dataSource) ? (
          dataSource.map(d => (
            <Select.Option key={d.code} title={d.name} disabled={d.valSphd1 === 'INACTIVE'}>
              {d.name}
              {d.valSphd1 === 'INACTIVE' ? '(无效)' : ''}
            </Select.Option>
          ))
        ) : (
          <Select.Option key="undefined" />
        )}
      </Select>
    );
  }
}

export default AsyncSelectDisable;
