import React from 'react';
import { localeString } from './Locale';
import BasicSelect from './internal/BasicSelect';

// @ts-ignore
import { resSelectPaging } from '@/services/production/common/select';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { isNil } from 'min-dash';
import { equals } from 'ramda';
import { handleEmptyProps } from '@/utils/production/objectUtils';

interface SelectProps {
  id: any;
  title: string;
}

interface Props {
  value?: number | string | string[]; // 值
  onChange?(value: any, option: any): void;
  resStatus?: string; // 资源状态
  resType1?: string; // 资源类型1
  descList?: SelectProps[];
  showSearch?: boolean;
  allowClear?: boolean;
  disabled?: boolean; // 是否可编辑
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string; // 下拉模式
  placeholder?: string; // 占位符

  [propName: string]: any; // 其它属性
}

/**
 * 资源简单下拉
 * 1.
 * 2.
 */
class ResSimpleSelect extends React.Component<Props, any> {
  static optionsCache = [];

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

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };

  getData = async () => {
    const { resStatus, resType1, transfer } = this.props;

    const queryParam: any = {};
    if (resStatus) {
      queryParam.resStatus = resStatus;
    }
    if (resType1) {
      queryParam.resType1 = resType1;
    }

    let resultOptions = [];

    const optionsList = ResSimpleSelect.optionsCache.filter((item: any) =>
      equals(item.queryParam, queryParam)
    );

    if (optionsList.length > 0) {
      // @ts-ignore
      resultOptions = optionsList[0].options;
    } else {
      let params: any = {};
      if (queryParam) {
        params = { ...queryParam, ...params };
      }
      params = handleEmptyProps(params);
      const output: OutputProps = await outputHandle(resSelectPaging, { ...params, limit: 0 });
      // resultOptions = output.data.rows.map((item: any) => ({...item,id:item.id,value: item.id, title: `${item.resNo}-${item.resName}`}));
      resultOptions = output.data.rows.map((item: any) => ({
        ...item,
        id: item.id,
        value: item.id,
        title: `${item.resName}`,
      }));

      if (transfer) {
        const { code, name } = transfer;
        resultOptions = resultOptions.filter((v: any) => v[code] && v[name]);
      }
      // @ts-ignore
      ResSimpleSelect.optionsCache.push({ queryParam: queryParam, options: resultOptions });
    }

    this.setState({ options: resultOptions });
  };

  render() {
    const { value, onChange = () => {}, disabled, ...rest } = this.props;
    const transfer = (value: any) => {
      if (!value) {
        return value;
      } else if (typeof value === 'number') {
        return value + '';
      } else if (typeof value === 'string' && value.indexOf(',') > -1) {
        return value.split(',');
      } else {
        return value;
      }
    };
    const wrapperValue: string | undefined | string[] = transfer(value);
    // const wrappedOptions = this.state.options.map((option:SelectProps)=>({...option,value:option.id,title:option.title}));

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
