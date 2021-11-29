import React from 'react';
import {Icon,} from 'antd';
import {localeString} from '../Locale';
import BaseInput from '../BaseInput';
import Modal from '@/components/production/layout/Modal';

import styles from '../style/select.less';
import router from "umi/router";
import SearchTable, {DataOutput} from "@/components/production/business/SearchTable";


// service 引入
// @ts-ignore
import {resSelectPaging,} from '@/services/production/common/select';
import {ColumnProps} from "antd/es/table";


interface SelectProps {
  id: any,
  title: string,
  [propName: string]: any, // 其它属性
}

interface RowClickReturnProps {
  id:any, // 值
  title:string, // 显示名称
}

interface Props<T> {
  value?: any, // 值
  onChange?(value: any): void, // 值变化
  disabled?: boolean; // 是否可编辑
  descList?: SelectProps[]; // 初始选择项,用来显示默认名称,如果不传只能显示value
  title?: string; // 对象选择弹出框标题
  searchFormItems?: Array<React.ReactNode>; // 查询条件
  tableColumns?: ColumnProps<T>[]; // 表格列
  onRowClick(record:T):RowClickReturnProps; // 行点击事件
  fetchData(params:object): Promise<DataOutput>; // 查询数据方法
  allowClear?: boolean,
  placeholder?: string,

  [propName: string]: any, // 其它属性
}


/**
 * 对象选择(对于会频繁动态增加的业务对象下拉组件)
 * 1.
 * 2.
 */
class ProdObjectSelect<T> extends React.Component<Props<T>, any> {

  constructor(props:any) {
    super(props);
    const {descList,} = this.props;
    this.state = {
      selectVisible: false, // 弹出框是否显示
      options: descList, // 选择项
      hover:false,
    };
  }

  handleOnClick = () => {
    this.setState({selectVisible: true});
  };


  render() {
    const {
      value,
      title,
      disabled,
      fetchData,
      searchFormItems=[],
      tableColumns=[],
      onChange = () => {
      },
      onRowClick,
      placeholder = disabled?"":localeString({localeNo: 'portal:component:input:placeholder:baseSelect', defaultMessage: '请选择'}),
      ...rest
    } = this.props;

    const {options} = this.state;

    // 处理名称显示
    let displayName = value;
    if (options && options.length > 0) {
      const valueOption = options.filter((option:any) => option.id === value)[0];
      if (valueOption) {
        displayName = valueOption.title;
      }
    }


    return (
      <>
        <BaseInput
          disabled={disabled}
          value={displayName}
          placeholder={placeholder}
          onChange={(value) => {
            onChange(value);
          }}
          onClick={this.handleOnClick}
          addonAfter={
            <Icon
              type="search"
              style={{color: "rgba(0, 0, 0, 0.25)",cursor: "pointer"}}
              // className={styles[`${prefixCls}-clear-icon`]}
              {...(disabled?{}:{onClick:this.handleOnClick})}
            />}
        />
        <Modal
          title={title}
          visible={this.state.selectVisible}
          onOk={() => {
            this.setState({selectVisible: false});
          }}
          onCancel={() => {
            this.setState({selectVisible: false});
          }}
        >
          <SearchTable
            searchTitle=""
            tableTitle=""
            selectType={null}
            searchForm={searchFormItems}
            defaultSearchForm={{}}
            fetchData={fetchData}
            columns={tableColumns}
            showExport={false}
            showColumnSwitch={false}
            onRow={(record:any) => {
              return {
                onClick: (event:any) => {
                  const {id,title} = onRowClick(record);
                  this.setState((state:any)=>{
                    return {selectVisible: false,options:[{id,title}]};
                  });
                  onChange(record.id);
                }, // 点击行
                // onDoubleClick: (event:any) => {console.log(event)}, // 点击行,
              };
            }}
          />
        </Modal>
      </>
    );
  }

}

export default ProdObjectSelect;
