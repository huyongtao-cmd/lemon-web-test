import React from 'react';
import {localeString} from './Locale';

import ProdObjectSelect from "@/components/production/basic/internal/ProdObjectSelect";
import SearchFormItem from "@/components/production/business/SearchFormItem";
import {DataOutput} from "@/components/production/business/SearchTable";


// service 引入
// @ts-ignore
import {resSelectPaging,} from '@/services/production/common/select';
import {ColumnProps} from "antd/es/table";
import Link from "@/components/production/basic/Link";
import {outputHandle, OutputProps} from "@/utils/production/outputUtil";


interface SelectProps {
  id: any,
  title: string,
  [propName: string]: any, // 其它属性
}

interface Props {
  value?: any, // 值
  onChange?(value: any): void, // 值变化
  disabled?: boolean; // 是否可编辑
  descList?: SelectProps[]; // 初始选择项,用来显示默认名称,如果不传只能显示value
  placeholder?: string,
  [propName: string]: any, // 其它属性
}


/**
 * 资源选择下拉框
 * 1.
 * 2.
 */
class ResObjectSelect<T> extends React.Component<Props, any> {


  constructor(props:any) {
    super(props);
    const {descList=[],} = this.props;
    this.state = {
      selectVisible: false, // 弹出框是否显示
      options: descList, // 选择项
    };
  }


  fetchData = async (params: object): Promise<DataOutput> => {
    const output: OutputProps = await outputHandle(resSelectPaging, params);
    return output.data;
  };

  renderSearchFormItems = () => {
    return (
      [
        <SearchFormItem
          key="resName"
          fieldType="BaseInput"
          label="姓名"
          fieldKey="resName"
        />,
        <SearchFormItem
          key="resNo"
          fieldType="BaseInput"
          label="编号"
          fieldKey="resNo"
        />,
        <SearchFormItem
          key="resStatus"
          fieldType="BaseInput"
          label="资源状态"
          fieldKey="resStatus"
        />,
      ]
    );
  };


  render() {
    const {
      value,
      descList,
      disabled,
      onChange = () => {
      },
      ...rest
    } = this.props;

    // 处理展示列
    const columns: ColumnProps<T>[] = [
      {
        title: '编号',
        dataIndex: 'resNo',
        sorter: true,
      },
      {
        title: '姓名',
        dataIndex: 'resName',
        sorter: true,
      },
      {
        title: '部门',
        dataIndex: 'baseBuName',
        sorter: true,
      },
      {
        title: '公司',
        dataIndex: 'ouName',
      },
      {
        title: '状态',
        dataIndex: 'resStatusDesc',
      },
    ];

    return (
      <ProdObjectSelect
        title="资源选择"
        searchFormItems={this.renderSearchFormItems()}
        tableColumns={columns}
        fetchData={this.fetchData}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onRowClick={(record:any)=>{
          return {id:record.id,title:record.resName};
        }}
        descList={descList}
        {...rest}
      >

      </ProdObjectSelect>
    );
  }

}

export default ResObjectSelect;
