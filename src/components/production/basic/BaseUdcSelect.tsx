import React from 'react';
import { localeString } from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import { udcSelect } from '@/services/production/common/select';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import {isNil} from "min-dash";

interface SelectProps {
  id: any;
  title: string;
}

interface Props {
  value?: any;
  udcCode?: string;
  onChange?(value: any, option: any): void;
  descList?: SelectProps[];
  showSearch?: boolean;
  allowClear?: boolean;
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  parentKey?: string; // 指定父节点key,根据系统选择项父节点拉取子节点(p_system_selection)
  placeholder?: string; // 占位符

  [propName: string]: any; // 其它属性
}

/**
 * 简单内部公司下拉
 * 1.
 * 2.
 */
class BaseUdcSelect extends React.Component<Props, any> {
  constructor(props: any) {
    super(props);
    const { descList = [] } = this.props;
    this.state = {
      options: descList, // 选择项
    };
  }

  componentDidMount(): void {
    this.getData();
  }

  getData = async () => {
    const { udcCode } = this.props;
    // const output: OutputProps = await outputHandle(udcSelect, {code: udcCode});
    // this.setState({options: output.data.rows.map((item: any) => ({id:item.code,value: item.code, title: item.name}))});

    const tt = await udcSelect({ code: udcCode });
    if (tt.status === 200 && Array.isArray(tt.response)) {
      this.setState({
        options: tt.response.map((item: any) => ({
          ...item,
          id: item.code,
          value: item.code,
          title: item.name,
        })),
      });
    }
  };

  render() {
    const {
      value,
      mode,
      disabledOptions,
      allowedOptions,
      onChange = () => {},
      disabled,
      showSearch = true,
      placeholder,
      list,
      ...rest
    } = this.props;
    const wrapperValue:string|undefined = isNil(value)?undefined:(value+"");
    const wrappedOptions = this.state.options.map((option: SelectProps) => ({
      ...option,
      value: option.id,
      title: option.title,
    }));

    return (
      <BasicSelect
        value={value}
        onChange={(value, option) => onChange(value, option)}
        disabled={disabled}
        allowClear
        showSearch={showSearch}
        mode={mode}
        options={wrappedOptions}
        disabledOptions={disabledOptions}
        allowedOptions={allowedOptions}
        placeholder={placeholder}
        {...rest}
      />
    );
  }
}

export default BaseUdcSelect;
