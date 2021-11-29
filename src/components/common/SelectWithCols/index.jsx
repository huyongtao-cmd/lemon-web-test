import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Select } from 'antd';
import { isNil, type } from 'ramda';

const { Option } = Select;

/**
 * @author Rex.Guo
 */

class SelectWithCols extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    // if ('value' in nextProps) {
    // return {
    //   value: {
    //     key: nextProps.value[nextProps.labelKey],
    //     label: nextProps.value[nextProps.labelKey],
    //   }
    // };
    // }
    return nextProps;
  }

  constructor(props) {
    super(props);
    // console.log('props', props);
    this.state = {
      value: props.value || props.defaultValue,
    };
  }

  triggerOnChange = (value, option) => {
    const { dataSource, valueKey = 'code', labelKey = 'name', onChange, onBlur } = this.props;
    let val = {};
    // console.log(value, option);

    if (value !== void 0) {
      const { key } = value;
      // console.log(key);
      const [first, ...rest] = dataSource.filter(d => d[valueKey] === key);
      val = first;
    } else {
      val = value;
    }

    this.setState({
      value: val,
    });

    onChange && onChange(val);
    onBlur && onBlur(val);
  };

  render() {
    const { columns, dataSource, selectProps, valueKey = 'code', labelKey = 'name' } = this.props;
    const { value } = this.state;

    // const val = {
    //   key: value && value[labelKey] ? value[labelKey] : '请选择',
    //   label: value && value[labelKey] ? value[labelKey] : '请选择',
    // };

    const val =
      !isNil(value) && !isNil(value[valueKey])
        ? {
            key: value[valueKey],
            label: value[labelKey],
          }
        : undefined;

    // console.log(value, val, selectProps);

    return (
      <Select
        {...selectProps}
        labelInValue
        value={val}
        filterOption={false}
        optionLabelProp="label"
        onChange={this.triggerOnChange}
        // onBlur={this.triggerOnBlur}
      >
        <Option key="disabled-option" value="disabled-option" disabled>
          <Row type="flex" justify="space-between" className="x-fill-100">
            {columns.map(col => (
              <Col key={col.dataIndex} span={col.span ? col.span : 24 / columns.length}>
                {col.title}
              </Col>
            ))}
          </Row>
        </Option>
        {(type(dataSource) === 'Array' ? dataSource : []).map(item => (
          <Option key={item[valueKey]} value={item[valueKey]} label={item[labelKey]}>
            <Row type="flex" justify="space-between" className="x-fill-100">
              {columns.map(col => (
                <Col key={col.dataIndex} span={col.span ? col.span : 24 / columns.length}>
                  {item[col.dataIndex]}
                </Col>
              ))}
            </Row>
          </Option>
        ))}
      </Select>
    );
  }
}

SelectWithCols.propTypes = {
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  dataSource: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  selectProps: PropTypes.object,
};

SelectWithCols.defaultProps = {
  selectProps: undefined,
  onChange: undefined,
  valueKey: 'code',
  labelKey: 'name',
};

export default SelectWithCols;
