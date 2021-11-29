/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */
import React from 'react';
import debounce from 'lodash.debounce';
import { Col, Divider, Row, Select, Spin } from 'antd';

const Option = Select.Option;
class SuggestSelect extends React.Component {
  static getDerivedStateFromProps(nextProps, nextState) {
    let newValue = nextState.value;
    let newDefaultSource = nextState.defaultSource;
    let newDataSource = nextState.dataSource;

    if (nextProps.value !== nextState.value) {
      newValue = nextProps.value;
    }
    // 如果defaultSource变化，更新dataSource
    // console.log(
    //   JSON.stringify(nextProps.defaultSource) ===
    //     JSON.stringify(nextState.defaultSource),
    // );
    if (JSON.stringify(nextProps.defaultSource) !== JSON.stringify(nextState.defaultSource)) {
      newDefaultSource = nextProps.defaultSource;
      newDataSource = nextProps.defaultSource;
      // console.log('newDefaultSource', newDefaultSource);
    }

    return {
      ...nextState,
      value: newValue,
      defaultSource: newDefaultSource,
      dataSource: newDataSource,
    };
    // return nextState;
  }

  constructor(props) {
    super(props);
    const { value, selectProps, defaultSource = [] } = this.props;

    this.fetchData = debounce(this.fetchData, 800);

    if (
      selectProps &&
      selectProps.mode === 'multiple' &&
      (Array.isArray(value) || value === undefined)
    ) {
      this.state = {
        value: value === void 0 ? [] : value.join(',').split(','),
        dataSource: defaultSource || [],
        fetching: false,
        defaultSource,
      };
    } else {
      this.state = {
        value: value === void 0 ? '' : '' + value,
        dataSource: defaultSource || [],
        fetching: false,
        defaultSource,
      };
    }
  }

  // componentDidMount = () => {
  //   this.fetchData();
  // };

  fetchData = params => {
    const { columns, selectProps, source, valueKey = 'code' } = this.props;
    const { dataSource, value } = this.state;

    // console.log(dataSource, value);
    this.setState({ fetching: true });

    let val;

    // 多列
    if (columns && columns.length) {
      // 多选
      if (selectProps && selectProps.mode === 'multiple' && Array.isArray(value)) {
        val = value.map(v => {
          const target = dataSource.filter(d => d[valueKey] === v.key)[0];
          if (target) {
            return target;
          }
          return 0;
        });

        source(params).then(data => {
          this.setState({
            dataSource: [...data, ...val],
            fetching: false,
          });
        });
      } else {
        // 单选
        source(params).then(data => {
          this.setState({
            dataSource: data,
            fetching: false,
          });
        });
      }
    } else {
      // 单列
      // 多选
      if (selectProps && selectProps.mode === 'multiple' && Array.isArray(value)) {
        val = value.map(v => {
          const target = dataSource.filter(d => d[valueKey] === v)[0];
          if (target) {
            return target;
          }
        });

        source(params).then(data => {
          this.setState({
            dataSource: [...data, ...val],
            fetching: false,
          });
        });
      } else {
        // 单选
        source(params).then(data => {
          this.setState({
            dataSource: data,
            fetching: false,
          });
        });
      }
    }

    return 0;
  };

  handleChange = (value, option) => {
    const { columns, onChange, onBlur, selectProps, defaultSource } = this.props;
    // console.log(value, option);
    const { dataSource } = this.state;
    const { valueKey = 'code' } = this.props;
    let val = {};
    // 多列
    if (columns && columns.length) {
      // 多选
      if (selectProps && selectProps.mode === 'multiple' && Array.isArray(value)) {
        // console.log(value, dataSource);
        val = value.map(v => {
          const target = dataSource.filter(d => d[valueKey] === v.key)[0];
          if (target) {
            return { ...target, ...v };
          }
        });
        // 单选
      } else {
        if (value !== void 0) {
          const { key } = value;
          const [first] = dataSource.filter(d => d[valueKey] === key);
          val = first;
        } else {
          val = value;
        }
      }
      onChange && onChange(val, option);
      onBlur && onBlur(val, option);
    } else {
      if (selectProps && selectProps.mode === 'multiple' && Array.isArray(value)) {
        onChange && onChange(value ? value.filter(v => v !== void 0) : value, option);
        onBlur && onBlur(value ? value.filter(v => v !== void 0) : value, option);
      } else {
        onChange && onChange(value, option);
        onBlur && onBlur(value, option);
      }
    }

    let newDataSource = defaultSource || [];
    if (selectProps && selectProps.mode === 'multiple' && Array.isArray(value)) {
      newDataSource = value.length === 0 ? newDataSource : this.state.dataSource;
    } else {
      newDataSource = value === void 0 ? newDataSource : this.state.dataSource;
    }
    this.setState({
      value,
      fetching: false,
      dataSource: newDataSource,
    });
  };

  handleSearch = value => {
    this.fetchData(value);
  };

  dropdownRender = menu => {
    const { columns } = this.props;
    if (columns && columns.length) {
      return (
        <>
          <Row type="flex" justify="space-between" style={{ width: '100%', padding: '5px 12px' }}>
            {columns.map(col => (
              <Col key={col.dataIndex} span={col.span ? col.span : 24 / columns.length}>
                {col.title}
              </Col>
            ))}
          </Row>
          <Divider style={{ margin: '4px 0' }} />
          {menu}
        </>
      );
      // eslint-disable-next-line no-else-return
    } else {
      return null;
    }
  };

  render() {
    const { dataSource, fetching, value } = this.state;
    const {
      columns,
      valueKey = 'code',
      labelKey = 'name',
      disabled,
      selectProps,
      ...otherProps
    } = this.props;

    if (columns && columns.length) {
      let val;
      if (selectProps && selectProps.mode === 'multiple') {
        val = value;
      } else {
        val =
          value && value[valueKey]
            ? {
                key: value[valueKey],
                label: value[labelKey],
              }
            : undefined;
      }

      // console.log(value, val);
      // console.log(dataSource);

      return (
        <Select
          allowClear
          notFoundContent={fetching ? <Spin size="small" /> : null}
          style={{ width: '100%' }}
          {...selectProps}
          showSearch
          filterOption={false}
          optionLabelProp="title"
          labelInValue
          dropdownRender={this.dropdownRender}
          value={val}
          disabled={disabled}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
        >
          {dataSource.map(item => (
            <Option key={item[valueKey]} value={item[valueKey]} title={item[labelKey]}>
              <Row type="flex" justify="space-between" style={{ width: '100%' }}>
                {columns.map(col => (
                  <Col
                    key={col.dataIndex}
                    span={col.span ? col.span : 24 / columns.length}
                    style={{ ...col.style }}
                    title={item[col.dataIndex]}
                  >
                    {item[col.dataIndex]}
                  </Col>
                ))}
              </Row>
            </Option>
          ))}
        </Select>
      );
    } else {
      // console.log(dataSource);
      // console.log('dddd', value, otherProps.value);

      let v = value;

      if (
        selectProps &&
        selectProps.mode === 'multiple' &&
        (Array.isArray(otherProps.value) || value === undefined)
      ) {
        v =
          // @ts-ignore
          otherProps.value === void 0 || otherProps.value.length === 0
            ? []
            : // @ts-ignore
              otherProps.value.join(',').split(',');
      } else {
        if (otherProps.value && otherProps.value + '' !== value) {
          v = otherProps.value + '';
        }
      }

      // console.log('v', v);

      return (
        <Select
          allowClear
          notFoundContent={fetching ? <Spin size="small" /> : null}
          style={{ width: '100%' }}
          {...selectProps}
          showSearch
          value={v}
          defaultActiveFirstOption={false}
          filterOption={false}
          disabled={disabled}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
          optionLabelProp="children"
          // getPopupContainer={() => document.getElementById('centerContainer')}
        >
          {dataSource &&
            dataSource.map(d => (
              <Option key={d[valueKey]} title={d[labelKey]}>
                {d[labelKey]}
              </Option>
            ))}
        </Select>
      );
    }
  }
}

export default SuggestSelect;
