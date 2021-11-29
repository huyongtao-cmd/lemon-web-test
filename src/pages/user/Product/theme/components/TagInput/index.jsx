/* eslint-disable react/jsx-no-bind */
// import '@babel/polyfill';
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import styles from './styles.less';

const DEFAULT_MAX_COUNT = 5;

class TagInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidMount() {
  // console.log(this.selectRef.current);
  // this.selectRef.on('paste', function (e) {
  //   e.preventDefault();
  //   console.log(e);
  // });

  // this.selectRef.current.addEventListener('paste', function (e) {
  //   e.preventDefault();
  //   console.log(e);
  // });
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (snapshot) {
  //   }
  // }
  //
  // getSnapshotBeforeUpdate(prevProps) {
  //
  // }

  handleChange(value) {
    const { maxCount = DEFAULT_MAX_COUNT, onChange } = this.props;

    const slicedValue = value.length > maxCount ? value.slice(0, maxCount) : value;
    onChange && onChange(slicedValue);
  }

  render() {
    const { value = [], disabled, maxCount = DEFAULT_MAX_COUNT, ...otherProps } = this.props;
    const slicedValue = value.length > maxCount ? value.slice(0, maxCount) : value;
    // console.log(slicedValue);
    return (
      <div className={styles.container}>
        <Select
          disabled={disabled}
          allowClear
          style={{ width: '100%' }}
          notFoundContent=""
          placeholder={'可输入最多5个标题，以";"或者空格分隔'}
          {...otherProps}
          onChange={this.handleChange.bind(this)}
          getPopupContainer={triggerNode => triggerNode.parentElement}
          dropdownStyle={{ display: 'none' }}
          tokenSeparators={[';']}
          mode="tags"
          value={slicedValue}
          // ref={this.selectRef}
        />
      </div>
    );
  }
}

// TagInput.propTypes = {
//   disabled: PropTypes.bool,
//   onChange: PropTypes.func,
// };

export default TagInput;
