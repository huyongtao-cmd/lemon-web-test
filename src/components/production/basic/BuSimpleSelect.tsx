import React from 'react';
import {localeString} from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import {buSelectPaging,} from '@/services/production/common/select';
import {outputHandle, OutputProps} from '@/utils/production/outputUtil';
import {isNil} from "min-dash";



interface SelectProps {
  id: any,
  title: string,
}

interface Props {
  value?: number,
  onChange?(value: any, option: any): void,
  buStatus?: string; // 部门状态
  descList?: SelectProps[],
  showSearch?: boolean,
  allowClear?: boolean,
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string, // 占位符

  [propName: string]: any, // 其它属性

}


/**
 * 部门简单下拉
 * 1.
 * 2.
 */
class BuSimpleSelect extends React.Component<Props, any> {

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
    const {buStatus} = this.props;
    const queryParam:any = {};
    if(buStatus){
      queryParam.buStatus = buStatus;
    }

    const output: OutputProps = await outputHandle(buSelectPaging, {...queryParam,limit:0});
    // this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.buNo}-${item.buName}`}))});
    this.setState({options: output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.buName}`}))});
  };


  render() {
    const {
      value,
      onChange = () => {
      },
      disabled,
      placeholder,
      ...rest
    } = this.props;
    const wrapperValue:string|undefined = isNil(value)?undefined:(value+"");
    // const wrappedOptions = this.state.options.map((option:SelectProps)=>({value:option.id,title:option.title}));
    return (
      <BasicSelect
        placeholder={placeholder}
        value={wrapperValue}
        onChange={onChange}
        disabled={disabled}
        options={this.state.options}
        {...rest}
      />
    );
  }

}

export default BuSimpleSelect;
