import React, { Component } from 'react';
import { Select, Icon } from 'antd';
import { equals, type, isNil, omit } from 'ramda';

const defaultTransfer = {
  code: 'code',
  name: 'name',
};

class AsyncSelect extends Component {
  state = {
    dataSource: [],
    loading: true,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { source } = nextProps;
    if (type(source) === 'Function') {
      return null;
    }
    if (type(source) === 'Array') {
      return equals(prevState.source, source)
        ? null
        : {
            dataSource: source,
          };
    }
    if (isNil(source)) {
      return {
        dataSource: [],
      };
    }
    return null;
  }

  componentDidMount() {
    const { source } = this.props;
    type(source) === 'Function'
      ? this.fetchSource(source)
      : this.setState({ dataSource: Array.isArray(source) ? source : [], loading: false });
  }

  fetchSource = async source => {
    this.setState({ loading: true });
    const { response } = await source();
    const list = Array.isArray(response) ? response : [];
    /**
     * resTransform: ()=>{}
     * eg: filters: res => res.filter(v => moment(v.name).isBefore(moment()))
     */
    const { resTransform } = this.props;
    const resultArray = type(resTransform) === 'Function' ? resTransform(list) : list;
    this.setState({ dataSource: resultArray, loading: false });
  };

  handleChange = (value, option) => {
    const { onValueChange, onChange } = this.props;
    if (type(onValueChange) === 'Function') {
      // const changedValue = isNil(value) ? value : JSON.parse(option.props.filter);
      // 多选时返回所有选中项
      // eslint-disable-next-line no-nested-ternary
      const changedValue = isNil(value)
        ? value
        : Array.isArray(option)
          ? option.map(v => JSON.parse(v.props.filter))
          : JSON.parse(option.props.filter);
      onValueChange(changedValue);
    }
    if (type(onChange) === 'Function') {
      onChange(value);
    }
  };

  render() {
    const { dataSource, loading } = this.state;
    const {
      transfer = defaultTransfer,
      value,
      mode,
      allowClear,
      disabledOptions = [],
      allowedOptions,
      ...restProps
    } = this.props;

    if (allowedOptions) {
      const { code } = transfer;
      const notAllowed = dataSource.map(d => d[code]).filter(c => allowedOptions.indexOf(c) === -1);
      disabledOptions.push(...notAllowed);
    }

    return (
      <Select
        defaultActiveFirstOption={false}
        className="x-fill-100"
        getPopupContainer={() => document.getElementById('root')}
        showSearch
        filterOption={(input, option) =>
          option.props.children &&
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...(loading ? { suffixIcon: <Icon type="loading" /> } : {})}
        allowClear={allowClear === false ? false : !loading}
        onChange={this.handleChange}
        mode={mode}
        // eslint-disable-next-line
        value={mode === 'multiple' ? value : isNil(value) ? undefined : `${value}`}
        {...omit(['onChange'], restProps)}
      >
        {dataSource.map(d => {
          const { code, name } = transfer;
          return (
            <Select.Option
              key={d[code]}
              title={d[name]}
              filter={JSON.stringify(d)}
              disabled={disabledOptions.indexOf(d[code]) > -1}
            >
              {d[name]}
            </Select.Option>
          );
        })}
      </Select>
    );
  }
}

export default AsyncSelect;
