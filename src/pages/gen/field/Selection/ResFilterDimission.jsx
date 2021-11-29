import React, { Component } from 'react';
import { Select, Row, Col, Icon, Checkbox } from 'antd';
import {
  isEmpty,
  omit,
  equals,
  isNil,
  map,
  pickAll,
  values,
  toLower,
  type,
  findIndex,
  propEq,
  concat,
} from 'ramda';
import Basic from './Basic';

const { Option } = Select;

const defaultTransfer = {
  key: 'code',
  code: 'code',
  name: 'name',
};

// 根据checked选择框筛选已离职人员
const getlimitData = (list, limit, value, props) => {
  const { transfer = defaultTransfer } = props;
  const { key } = transfer;

  // 表单回写用，以该resId为首截取20个
  let start;
  if (!isNil(limit)) {
    // 单选
    if (!Array.isArray(value) && !isNil(value)) {
      // value数组最后一个值在list的索引
      start = list.findIndex(propEq(key, value));
      return list.slice(start, start + limit);
    }

    // 多选传入的是数组
    if (Array.isArray(value) && !isEmpty(value)) {
      // value数组最后一个值在list的索引
      start = list.findIndex(propEq(key, value[value.length - 1]));

      // 以value最后一个元素为基准，取出limit条数据
      let getLastValueArr = list.slice(start, start + limit);

      // 与value其他元素在list对应的值一一拼接
      value.forEach(v => {
        if (
          list.filter(item => item[key] === v).length &&
          !getLastValueArr.filter(item => item[key] === v).length
        ) {
          getLastValueArr = list.filter(item => item[key] === v).concat(getLastValueArr);
        }
      });
      return getLastValueArr;
    }

    // 多选传入的是空数组
    if (Array.isArray(value) && isEmpty(value)) {
      // 以value最后一个元素为基准，取出limit条数据
      return list.slice(0, limit);
    }
  }
  return [];
};

// 删除已离职资源
const filterDimission = (dataSource, filterDimissionFlag) => {
  if (filterDimissionFlag) {
    return dataSource;
  }
  return dataSource.filter(v => v.resStatus !== '6');
};

class Selection extends Component {
  state = {
    dataSource: [],
    limitData: [],
    loading: true,
    filterDimissionFlag: false,
  };

  // focus source is Array
  static getDerivedStateFromProps(nextProps, prevState) {
    const { source, value, limit } = nextProps;
    if (type(source) === 'Function') {
      // so Function type cause no action
      return null;
    }

    const list = source;

    if (type(source) === 'Array') {
      return equals(prevState.source, source)
        ? null
        : {
            dataSource: list,
            limitData: !isNil(limit) && value ? getlimitData(list, limit, value, nextProps) : list,
          };
    }
    if (isNil(list)) {
      return {
        dataSource: [],
        limitData: [],
      };
    }
    return null;
  }

  componentDidMount() {
    const { source, value, limit } = this.props;
    const list = Array.isArray(source) ? source : [];

    type(source) === 'Function'
      ? this.fetchSource(source)
      : this.setState({
          dataSource: list,
          limitData: !isNil(limit) && value ? getlimitData(list, limit, value, this.props) : list,
          loading: false,
        });
  }

  fetchSource = async source => {
    const { value, limit } = this.props;
    this.setState({ loading: true });
    const { response } = await source();
    const list = Array.isArray(response) ? response : [];

    this.setState({
      dataSource: list,
      limitData: !isNil(limit) && value ? getlimitData(list, limit, value, this.props) : list,
      loading: false,
    });
  };

  handleChange = (value, option) => {
    const { onColumnsChange, onChange } = this.props;
    if (type(onColumnsChange) === 'Function') {
      const modifiedValue = () =>
        Array.isArray(option)
          ? option.map(({ props }) => JSON.parse(props.filter))
          : JSON.parse(option.props.filter);
      const changedValue = isNil(value) ? value : modifiedValue();
      onColumnsChange(changedValue);
    }
    if (type(onChange) === 'Function') {
      onChange(value);
    }
  };

  render() {
    const {
      columns = [],
      columnFilterList = [],
      onColumnsChange,
      source = [],
      transfer = defaultTransfer,
      columnShow,
      dropdownMatchSelectWidth,
      limit = undefined,
      ...restProps
    } = this.props;
    if (isEmpty(columns))
      return (
        <Basic
          {...omit(['columns', 'columnFilterList', 'onColumnsChange', 'columnShow'], this.props)}
        />
      );
    const { dataSource, loading, limitData: limitDataArr, filterDimissionFlag } = this.state;
    const { showSearch } = restProps;

    const limitData = filterDimission(limitDataArr, filterDimissionFlag);

    return (
      <Row type="flex" gutter={6} key={filterDimissionFlag}>
        <Col span={16}>
          <Select
            defaultActiveFirstOption={false}
            className="x-fill-100"
            onChange={this.handleChange}
            optionLabelProp="show"
            {...(equals(showSearch, true)
              ? {
                  filterOption: (inputValue, option) => {
                    const { filter } = option.props;
                    if (isNil(filter)) return true; // 表示 index === 0, 是标题
                    const optionData = JSON.parse(filter);
                    const filterKeys = isEmpty(columnFilterList)
                      ? map(({ dataIndex }) => dataIndex, columns)
                      : columnFilterList;
                    const filterData = pickAll(filterKeys, optionData);
                    const exist = values(filterData)
                      .map(data => toLower(`${data}`).includes(toLower(inputValue)))
                      .includes(true);
                    return exist;
                  },
                }
              : {})}
            {...(equals(showSearch, true) && !isNil(limit)
              ? {
                  filterOption: false,
                  onSearch: v => {
                    const list = dataSource.filter(
                      item =>
                        item.code.toLowerCase().indexOf(v.toLowerCase()) >= 0 ||
                        item.name.toLowerCase().indexOf(v.toLowerCase()) >= 0
                    );
                    this.setState({
                      limitData: list,
                    });
                  },
                }
              : {})}
            {...(loading ? { suffixIcon: <Icon type="loading" /> } : {})}
            allowClear={restProps.allowClear === false ? false : !loading}
            dropdownMatchSelectWidth={isEmpty(dataSource) ? true : dropdownMatchSelectWidth}
            {...omit(['onChange', 'allowClear'], restProps)}
          >
            {limitData.map((data, index) => {
              const { key, code, name } = transfer;
              return index < (limit || limitData.length)
                ? [
                    equals(index, 0) ? (
                      <Option key="default" value="default" disabled>
                        <Row type="flex">
                          {columns.map(({ title, dataIndex, span }) => (
                            <Col key={dataIndex} span={span}>
                              {title}
                            </Col>
                          ))}
                        </Row>
                      </Option>
                    ) : null,
                    // eslint-disable-next-line react/jsx-indent
                    <Option
                      key={data[key]}
                      value={data[code]}
                      show={data[columnShow || name]}
                      filter={JSON.stringify(data)}
                    >
                      <Row type="flex">
                        {columns.map(({ title, dataIndex, span }) => (
                          <Col
                            className="ant-select-dropdown-menu-item noPadding"
                            key={title}
                            span={span}
                          >
                            {data[dataIndex]}
                          </Col>
                        ))}
                      </Row>
                    </Option>,
                  ].filter(Boolean)
                : null;
            })}
          </Select>
        </Col>
        <Col span={8}>
          <span title="显示已离职资源">
            <Checkbox
              checked={filterDimissionFlag}
              onChange={e => {
                this.setState({
                  filterDimissionFlag: e.target.checked,
                });
              }}
              title="离职"
            >
              含离职
            </Checkbox>
          </span>
        </Col>
      </Row>
    );
  }
}

export default Selection;
