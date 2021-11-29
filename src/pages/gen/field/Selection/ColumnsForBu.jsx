import React, { Component } from 'react';
import { Select, Row, Col, Icon } from 'antd';
import { connect } from 'dva';
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
import { queryBuList } from '@/services/gen/app';
import Basic from './Basic';

const { Option } = Select;

const defaultTransfer = {
  key: 'id',
  code: 'id',
  name: 'name',
};

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

@connect(({ global }) => ({
  global,
}))
class Selection extends Component {
  state = {
    dropDownData: [],
    limitData: [],
    loading: true,
  };

  componentDidMount() {
    this.fetchSource(queryBuList);
  }

  fetchSource = async source => {
    const {
      value,
      limit,
      buType = 'active',
      global: { buList = [] },
    } = this.props;
    this.setState({ loading: true });
    let list = buList || [];
    if (!buList || (buList && buList.length === 0)) {
      const { response } = await source();
      list = Array.isArray(response) ? response : [];
    }
    const dataSource = list.filter(item => item.buStatus === 'ACTIVE');
    const allDataSource = list.map(item => {
      const newItem = item;
      if (item.buStatus === 'CLOSED') {
        newItem.name = `${item.name}(已关闭)`;
      }
      return newItem;
    });
    const dropDownData = buType === 'all' ? allDataSource : dataSource;
    const { resTransform } = this.props;
    const resultArray =
      type(resTransform) === 'Function' ? resTransform(dropDownData) : dropDownData;
    this.setState({
      dropDownData: resultArray,
      limitData:
        !isNil(limit) && value ? getlimitData(resultArray, limit, value, this.props) : resultArray,
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
    // buType:1 active 激活BU 2 all 激活+已关闭
    // columnsCode: ['code', 'name', 'ouName'] 默认显示两列 值为数组 可以根据需要传递值
    // code:BU编号 name: BU名称  ouName: 公司
    const {
      buType = 'active',
      columnsCode = ['code', 'name'],
      columnFilterList = [],
      onColumnsChange,
      source = [],
      transfer = defaultTransfer,
      columnShow,
      limit = undefined,
      showSearch = true,
      ...restProps
    } = this.props;
    // 此处 columns 为统一设置 请不要改动此处代码
    const columnsArr = [
      { dataIndex: 'code', title: '编号', span: 8 },
      { dataIndex: 'name', title: '名称', span: 8 },
      { dataIndex: 'ouName', title: '公司', span: 8 },
    ];
    let columns = [];
    columnsArr.forEach(item => {
      columnsCode.forEach(itemCode => {
        if (item.dataIndex === itemCode) {
          columns.push(item);
        }
      });
    });
    if (columns && columns.length === 1) {
      columns = columns.map(item => {
        const newItem = item;
        newItem.span = 24;
        return newItem;
      });
    }
    if (columns && columns.length === 2) {
      columns = columns.map(item => {
        const newItem = item;
        newItem.span = 12;
        return newItem;
      });
    }
    const dropdownMatchSelectWidth = columnsCode.length !== 3;
    const dropdownStyle = columnsCode && columnsCode.length === 3 ? { width: 600 } : {};
    if (isEmpty(columns))
      return (
        <Basic
          {...omit(['columns', 'columnFilterList', 'onColumnsChange', 'columnShow'], this.props)}
        />
      );
    const { loading, limitData, dropDownData } = this.state;
    return (
      <Select
        defaultActiveFirstOption={false}
        className="x-fill-100"
        onChange={this.handleChange}
        optionLabelProp="show"
        placeholder="请选择BU"
        showSearch={showSearch}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
        dropdownStyle={dropdownStyle}
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
                const list = dropDownData.filter(
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
    );
  }
}

export default Selection;
