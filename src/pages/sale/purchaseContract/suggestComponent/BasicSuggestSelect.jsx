/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/named */
/* eslint-disable no-else-return */
/* eslint-disable lines-between-class-members */
import React, { Component } from 'react';
import SuggestSelect from './SuggestSelect';

// 多选单选的mode需要通过selectProps传进来,showTitle多列时是否展示title
class BasicSuggestSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      val: void 0,
    };
  }
  componentDidMount() {
    this.fetch();
  }
  fetch = val => {
    this.setState({ val });
    const { source } = this.props;
    if (typeof source === 'function') {
      return source(val).then(res => this.setState({ dataSource: res }));
    } else {
      return this.setState({ dataSource: source });
    }
  };
  suggestSelectConfig = () => {
    const {
      onChange,
      onBlur,
      value,
      columns,
      valueKey,
      labelKey,
      defaultSource,
      selectProps,
      disabled,
      showTitle,
    } = this.props;
    return {
      onChange,
      onBlur,
      value,
      columns,
      valueKey,
      labelKey,
      defaultSource,
      selectProps: {
        ...selectProps,
        dropdownMatchSelectWidth: false,
        // onFocus: this.onFocus,
      },
      disabled,
      showTitle,
    };
  };
  render() {
    return (
      <SuggestSelect
        {...this.suggestSelectConfig()}
        defaultSource={this.state.val ? [] : this.state.dataSource}
        source={async val => {
          await this.fetch(val);
          return Promise.resolve(this.state.dataSource);
        }}
      />
    );
  }
}

export default BasicSuggestSelect;
