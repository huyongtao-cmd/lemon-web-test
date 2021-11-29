import React, {isValidElement, ReactElement} from 'react';

import {Form, Tooltip, Icon, Input, Select, Dropdown, Menu} from 'antd';
import {omit, clone} from 'ramda';
import Link from "@/components/production/basic/Link";
import './style/form-item.less';
import InternalOuSimpleSelect from "@/components/production/basic/InternalOuSimpleSelect";
import FormItem from "@/components/production/business/FormItem";


const {Option} = Select;

interface Props {
  fieldKey: string, // 字段key
  label?: string, // 字段标签
  fieldType?:
    | 'BaseInput'
    | 'BaseInputNumber'
    | 'BaseInputAmt'
    | 'BaseInputTextArea'
    | 'BaseDatePicker'
    | 'BaseDateRangePicker'
    | 'BaseSwitch' // 开关切换
    | 'BaseSelect'
    | 'BaseSystemCascaderMultiSelect'
    | 'BaseCustomCascaderMultiSelect'
    | 'BaseCustomSelect'
    | 'BaseUdcSelect'
    | 'BaseTreeSelect'
    | 'ResObjectSelect'
    | 'ResSimpleSelect'
    | 'UserSimpleSelect'
    | 'BuSimpleSelect'
    | 'BuReportSelect'
    | 'ContractSimpleSelect'
    | 'ProjectSimpleSelect' // 项目简单下拉
    | 'ProjectManagementSelect' // 项目列表下拉
    | 'ProductSimpleSelect' // 产品简单下拉
    | 'ProductManagementSelect' // 产品列表下拉
    | 'TenantSimpleSelect'
    | 'SupplierSimpleSelect' // 供应商简单下拉
    | 'BudgetSimpleSelect' // 预算简单下拉
    | 'InternalOuSimpleSelect' // 字段类型
    | 'BaseAllOuSimpleSelect'; // 字段类型

  defaultShow?: boolean; // 供查SearchForm 组件使用,判断高级查询是否默认显示该字段
  advanced?: boolean,  // 是否高级查询条件,默认为否
  searchMode?: 'equals' | 'like' | 'moreThan' | 'lessThan' | 'in' | 'between', // 查询模式
  initialValue?: any, // 初始值
  question?: string, // 帮助
  visible?:boolean; // 是否显示
  [propName: string]: any, // 其它属性

}

class SearchFormItem extends React.Component<Props, any> {

  static displayName?: string;
  static defaultProps?: object;

  // 处理子节点
  renderChildren = () => {
    const {
      form,
      initialValue,
      advancedSearch = false,
      fieldType,
      fieldKey,
      searchData,
      onStateChange,
      searchMode = "equals",
      children,
      ...rest
    } = this.props;

    // const formData:any = this.state.formData;
    // const searchData:any = SearchFormItem.contextType.Consumer.;
    // const onStateChange:any = SearchFormItem.contextType.onStateChange;

    const itemProps = omit(
      ['labelCol', 'wrapperCol', 'fieldType', 'label', 'form', 'className', 'initialValue', 'formData', 'fieldMode',
        'defaultShow', 'advanced',],
      rest);

    // 如果有fieldType属性,按照此渲染输入组件
    if (fieldType) {
      const Class1 = require(`../basic/${fieldType}`).default;
      if (searchMode === 'between') {

      }
      const fieldKeyItem = advancedSearch ? "advancedSearchValue." + fieldKey : fieldKey;
      return advancedSearch?(
        <Input.Group compact>
          {form.getFieldDecorator("advancedSearchType." + fieldKey, {
            initialValue: 'equals',
          })(
            <Select style={{width: "25%"}}>
              <Option value="equals">等于</Option>
              <Option value="contains">包含</Option>
              <Option value="moreThan">&gt;=</Option>
              <Option value="lessThan">&lt;=</Option>
              <Option value="in">在列表</Option>
              {/*<Option value="between">介于</Option>*/}
            </Select>
          )}
          {form.getFieldDecorator(fieldKeyItem, {
            initialValue: initialValue,
          })(
            <Class1 style={{width:"75%"}} {...itemProps} />
          )}

        </Input.Group>
      ):(
        form.getFieldDecorator(fieldKeyItem, {
          initialValue: initialValue,
        })(
          <Class1 style={{width:"100%"}} {...itemProps} />
        )
      );
    } else {
      if (isValidElement(children)) {
        return children;
      } else {
        throw Error('FormItem必须包含fieldType属性或者子节点');
      }

    }
  };

  renderItem = () => {
    const {
      fieldKey,
      className,
      label,
      question,
      children,
      advancedSearch,
      advanced,
      ...rest
    } = this.props;
    const labelNode = question ?
      <span>{label}&nbsp;<Tooltip title={question}><Icon type="question-circle"/></Tooltip></span> : label;

    return <Form.Item label={labelNode} className={className} {...rest}>
      {this.renderChildren()}
    </Form.Item>

  };


  render() {

    return this.renderItem();
  }

}

SearchFormItem.displayName = "SearchFormItem";
SearchFormItem.defaultProps = {
  visible: true, // 默认显示
};
export default SearchFormItem;
export {Props,};
