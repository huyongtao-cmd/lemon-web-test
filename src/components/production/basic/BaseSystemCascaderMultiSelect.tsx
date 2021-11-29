import React from 'react';
import {localeString} from './Locale';
import BaseSelect, {BaseSelectProps} from './BaseSelect';
import {equals, isNil} from "ramda";
import BasicSelect, {BasicSelectProps} from "@/components/production/basic/internal/BasicSelect";
import {outputHandle, OutputProps} from "@/utils/production/outputUtil";

// @ts-ignore
import {systemSelectionCascader} from '@/services/production/system';


interface Props {
  value?: any, // 值
  onChange?(value: any, option: any, allOptions: any[]): void, // 值change事件
  disabled?: boolean; //是否可选择
  descList?: BaseSelectProps[], // 直接传入的下拉选择项,当异步获取下拉项时可传入该选项,提示页面名称展示速度
  showSearch?: boolean, // 带搜索框
  allowClear?: boolean, // 允许清除
  parentKey?: string; // 指定父节点key,根据系统选择项父节点拉取子节点(p_system_selection)
  cascaderValues?: string[]; // 级联字段,请按顺序写。比如省市区的级联，省:[],市：['province'],区['province','city']
  placeholder?: string, // 占位符
  [propName: string]: any, // 其它属性
}

/**
 * 1. 系统选择项级联
 * 2. 多字段形式的级联，以省市区举例，如果单据要保存省市区三个字段，选用该组件。
 */
class BaseSystemCascaderMultiSelect extends React.Component<Props,any> {

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

  getData = async () => {
    const {parentKey,cascaderValues=[]} = this.props;
    if (parentKey) {
      const output: OutputProps = await outputHandle(systemSelectionCascader, {key: parentKey,cascaderValues:cascaderValues.join(",")});
      this.setState({options: output.data.map((item: any) => ({...item,value: item.selectionValue, title: item.selectionName}))});
    }
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    const {cascaderValues: oldCascaderValues} = prevProps;
    const {cascaderValues} = this.props;
    if(!equals(oldCascaderValues,cascaderValues) ){
      this.getData();
    }

  }


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
      placeholder = localeString({localeNo:'portal:component:input:placeholder:baseTreeSelect',defaultMessage:'请选择'}),
      parentKey,
      ...rest
    } = this.props;

    const {options} = this.state;

    return (
      <BasicSelect
        value={value}
        onChange={onChange}
        disabled={disabled}
        allowClear
        showSearch={showSearch}
        mode={mode}
        options={options}
        disabledOptions={disabledOptions}
        allowedOptions={allowedOptions}
        placeholder={placeholder}
        {...rest}
      >
      </BasicSelect>
    );
  }

}

BaseSystemCascaderMultiSelect.defaultProps = {
  allowClear: true, // 默认可清除
};

export default BaseSystemCascaderMultiSelect;
