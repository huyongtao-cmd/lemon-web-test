import React from 'react';
import {localeString} from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import {budgetSelectPaging,} from '@/services/production/common/select';
import {outputHandle, OutputProps} from '@/utils/production/outputUtil';
import {isNil,equals} from "ramda";
import {handleEmptyProps} from "@/utils/production/objectUtils";



interface SelectProps {
  id: any,
  title: string,
}

interface Props {
  value?: number,
  onChange?(value: any, option: any): void,
  queryParam?:object; // 查询参数（chargeBuId：部门，chargeProjectId：项目,状态: budgetStatus ）
  descList?: SelectProps[],
  showSearch?: boolean,
  allowClear?: boolean,
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string, // 占位符

  [propName: string]: any, // 其它属性

}


/**
 * 预算简单下拉
 * 1.
 * 2.
 */
class BudgetSimpleSelect extends React.Component<Props, any> {

  constructor(props:any) {
    super(props);
    const {descList=[],} = this.props;
    this.state = {
      options: descList, // 选择项
    };
  }


  componentDidMount(): void {
    this.getData();
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if(!equals(this.props.queryParam,nextProps.queryParam)){
      this.getData(nextProps);
    }
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };


  getData = async (props?:any) => {
    let queryParam;
    if(props){
      queryParam = props.queryParam;
    }else {
      queryParam = this.props.queryParam;
    }
    let params:any = {};
    if(queryParam){
      params = {...queryParam,...params};
    }
    params = handleEmptyProps(params);
    const output: OutputProps = await outputHandle(budgetSelectPaging, {...params,limit:0});
    // this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.budgetCode}-${item.budgetName}`}))});
    this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.budgetName}`}))});
  };


  render() {
    const {
      value,
      onChange = () => {
      },
      disabled,
      ...rest
    } = this.props;
    const wrapperValue:string|undefined = isNil(value)?undefined:(value+"");
    // const wrappedOptions = this.state.options.map((option:SelectProps)=>({value:option.id,title:option.title}));

    return (
      <BasicSelect
        value={wrapperValue}
        onChange={onChange}
        disabled={disabled}
        options={this.state.options}
        {...rest}
      />
    );
  }

}

export default BudgetSimpleSelect;
