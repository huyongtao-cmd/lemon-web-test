import React from 'react';
import {localeString} from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import {resSelectPaging,} from '@/services/production/common/select';
import {outputHandle, OutputProps} from '@/utils/production/outputUtil';
import {isNil} from "min-dash";



interface SelectProps {
  id: any,
  title: string,
}

interface Props {
  value?: number,
  onChange?(value: any, option: any): void,
  resStatus?: string; // 资源状态
  resType1?: string; // 资源类型1
  descList?: SelectProps[],
  showSearch?: boolean,
  allowClear?: boolean,
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string, // 占位符

  [propName: string]: any, // 其它属性

}


/**
 * 用户简单下拉
 * 1. 大部分场景应该用ResSimpleSelect
 * 2. 用户下拉组件的值为PS_IAM_USER的表的id
 */
class ResSimpleSelect extends React.Component<Props, any> {

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

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };


  getData = async () => {
    const {resStatus,resType1} = this.props;
    const queryParam:any = {};
    if(resStatus){
      queryParam.resStatus = resStatus;
    }
    if(resType1){
      queryParam.resType1 = resType1;
    }

    const output: OutputProps = await outputHandle(resSelectPaging, {...queryParam,limit:0});
    this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.userId,value: item.userId, title: `${item.resNo}-${item.resName}`}))});
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

export default ResSimpleSelect;
