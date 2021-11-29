import React from 'react';
import {localeString} from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import {contractSelectPaging,} from '@/services/production/common/select';
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
  // contractStatus?: string; // 合同状态
  queryParam?:object;
  // myContract?: object; // 查询我的合同,使用方法举例：{myContractResId:1,myContractUserId:1001}即查询合同负责人resId等于1 或者合同所属部分负责人resId等于1 或者 创建人userId = 1001 的合同
  descList?: SelectProps[],
  showSearch?: boolean,
  allowClear?: boolean,
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string, // 占位符

  [propName: string]: any, // 其它属性

}


/**
 * 合同简单下拉
 * 1.
 * 2.
 */
class ContractSimpleSelect extends React.Component<Props, any> {

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
      this.getData();
    }
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };


  getData = async () => {
    const {queryParam} = this.props;
    let params:any = {};
    if(queryParam){
      params = {...params,...queryParam};
    }
    params = handleEmptyProps(params);
    const output: OutputProps = await outputHandle(contractSelectPaging, {...params,limit:0});
    this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.contractNo}-${item.contractName}`}))});
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

export default ContractSimpleSelect;
