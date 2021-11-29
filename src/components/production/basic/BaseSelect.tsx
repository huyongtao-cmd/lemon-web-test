import React from 'react';

import BasicSelect, {BasicSelectProps} from './internal/BasicSelect';
import {equals, isNil} from 'ramda';

// @ts-ignore
import {systemSelectionListByKey} from '@/services/production/system';
import {outputHandle, OutputProps} from '@/utils/production/outputUtil';

interface BaseSelectProps {
  id?: any,
  value: string,
  title: string,
}

interface Props {
  value?: any, // 值
  onChange?(value: any, option: any, allOptions: any[]): void, // 值change事件
  disabled?: boolean; //是否可选择
  descList?: BaseSelectProps[], // 直接传入的下拉选择项,当异步获取下拉项时可传入该选项,提示页面名称展示速度
  fetchData?(): Promise<Array<BasicSelectProps>>; // 获取数据方法,如果指定parentKey，该属性失效
  showSearch?: boolean, // 带搜索框
  allowClear?: boolean, // 允许清除
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  parentKey?: string; // 指定父节点key,根据系统选择项父节点拉取子节点(p_system_selection)
  placeholder?: string, // 占位符
  [propName: string]: any, // 其它属性

}


/**
 * 简单下拉选择
 * 1. 非树形,仅取儿子一级
 * 2.
 */
class BaseSelect extends React.Component<Props, any> {

  static defaultProps?: object;

  constructor(props:any) {
    super(props);
    const {descList=[],} = this.props;
    this.state = {
      options: descList.map(desc=>({...desc,value:desc.value+"",title:desc.title})), // 选择项
    };
  }

  componentDidMount(): void {
    this.getData();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    const {descList:newDescList = []} = this.props;
    const {descList = []} = prevProps;
    if(!equals(newDescList,descList)){
      this.setState({options:newDescList.map(desc=>({...desc,value:desc.value+"",title:desc.title}))});
    }
  }

  getData = async () => {
    const {parentKey} = this.props;
    if (parentKey) {
      const output: OutputProps = await outputHandle(systemSelectionListByKey, {key: parentKey});
      this.setState({options: output.data.map((item: any) => ({...item,value: item.selectionValue, title: item.selectionName}))});
    }
  };


  render() {
    const {
      value,
      mode,
      disabledOptions,
      allowedOptions,
      onChange = () => {
      },
      disabled,
      fetchData,
      showSearch = true,
      placeholder,
      list,
      parentKey,
      ...rest
    } = this.props;

    const {options} = this.state;


    return (
      <BasicSelect
        value={isNil(value)?value:(Array.isArray(value)?value.map(val => val.toString()):value.toString())}
        onChange={onChange}
        disabled={disabled}
        allowClear
        showSearch={showSearch}
        mode={mode}
        options={options}
        disabledOptions={disabledOptions}
        allowedOptions={allowedOptions}
        placeholder={placeholder}
        fetchData={parentKey?undefined:fetchData}
        {...rest}
      >
      </BasicSelect>
    );
  }

}

BaseSelect.defaultProps={

};

export default BaseSelect;
export {BaseSelectProps};
