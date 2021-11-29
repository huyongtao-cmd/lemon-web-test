import React from 'react';
import { Select, Icon } from 'antd';
import { equals, isNil, omit } from 'ramda';
import { localeString } from '../Locale';

import styles from '../style/select.less';

const { Option } = Select;

const defaultTransfer = {
  code: 'value',
  name: 'title',
};

interface BasicSelectProps {
  value: string;
  title: string;
}

interface Props {
  value?: string | string[]; // 值
  onChange?(value: any, option: any[], allOptions: any[]): void; // 值change事件
  fetchData?(): Promise<Array<BasicSelectProps>>; // 获取数据方法
  options?: BasicSelectProps[]; // 选择项
  showSearch?: boolean; // 可搜索
  allowClear?: boolean; // 可清除
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string; // 占位符

  [propName: string]: any; // 其它属性
}

/**
 * 下拉选择
 * 1.
 */
class BasicSelect<T> extends React.Component<Props, any> {
  constructor(props: any) {
    super(props);
    const { options } = this.props;
    this.state = {
      options: options, // 选择项
    };
  }

  componentDidMount(): void {
    this.getOptions();
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<any>,
    nextContext: any
  ): boolean {
    const props = ['onChange'];
    const propsEqualsFlag = !equals(omit(props, this.props), omit(props, nextProps));
    const stateEqualsFlag = !equals(this.state, nextState);
    return propsEqualsFlag || stateEqualsFlag;
  }

  componentWillUnmount = () => {
    this.setState = () => {
      return;
    };
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    const { options: newOptions } = this.props;
    const { options: options } = prevProps;
    if (!equals(newOptions, options)) {
      this.setState({ options: newOptions });
    }
  }

  getOptions = async () => {
    const { fetchData } = this.props;
    if (fetchData) {
      const data = await fetchData();
      this.setState({ options: data });
    }
  };

  render() {
    const {
      value,
      mode,
      disabledOptions = [],
      allowedOptions,
      onChange = () => {},
      disabled,
      showSearch = true,
      placeholder = disabled
        ? ''
        : localeString({
            localeNo: 'portal:component:input:placeholder:baseSelect',
            defaultMessage: '请选择',
          }),
      transfer = defaultTransfer,
      ...rest
    } = this.props;
    const { options = [] } = this.state;
    const wrappedOptions = options.filter(
      (option: BasicSelectProps) => !isNil(option.value) && !isNil(option.title)
    );
    if (wrappedOptions.length < options.length) {
      console.error('BasicSelect组件数据错误提示:存在数据不存在value属性或者title属性', this.props);
    }

    if (allowedOptions) {
      const notAllowed = wrappedOptions
        .map((item: any) => item.value)
        .filter((c: any) => allowedOptions.indexOf(c) === -1);
      disabledOptions.push(...notAllowed);
    }
    return (
      <Select
        value={isNil(value) ? undefined : value}
        allowClear
        showSearch={showSearch}
        mode={mode}
        disabled={disabled}
        onChange={value => {
          if (Array.isArray(value)) {
            onChange(
              value,
              wrappedOptions.filter((option: any) => value.includes(option.value + '')),
              wrappedOptions
            );
          } else {
            onChange(
              value,
              wrappedOptions.filter((option: any) => value === option.value + ''),
              wrappedOptions
            );
          }
        }}
        placeholder={placeholder}
        className={styles[`prod-select`]}
        filterOption={(inputValue, option) => {
          if (!inputValue || inputValue.trim().length === 0) {
            return true;
          }
          return (
            // @ts-ignore
            option.props.title.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) > -1
          );
        }}
        {...rest}
      >
        {wrappedOptions.map((item: any) => {
          const { code, name } = transfer;
          return (
            <Option
              key={item[code]}
              title={item[name]}
              disabled={disabledOptions.indexOf(item[code]) > -1}
            >
              {item[name]}
            </Option>
          );
        })}
      </Select>
    );
  }
}

export default BasicSelect;
export { BasicSelectProps };
