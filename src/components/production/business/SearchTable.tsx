import React, {ReactElement, ReactNode} from 'react';
import { omit, clone,isEmpty } from 'ramda';
import {Table, Icon, Form,Row,Col,Dropdown,Menu,Radio } from 'antd';
import {WrappedFormUtils} from "antd/lib/form/Form";

import Link from "@/components/production/basic/Link";
import SearchForm from '@/components/production/business/SearchForm';
import FormItem,{Props as FormItemProps} from "@/components/production/business/FormItem";
import Card from "@/components/production/layout/Card";
import {localeString} from '@/components/production/basic/Locale';
import DataTable from '@/components/production/business/DataTable';
import {ColumnProps, TableRowSelection} from "antd/es/table";
import Button from "@/components/production/basic/Button";
import {PaginationProps} from "antd/es/pagination";
import confirm from "@/components/production/layout/Confirm";
import {handleEmptyProps} from "@/utils/production/objectUtils";
import {PaginationConfig} from "antd/lib/pagination";
import {SorterResult} from "antd/lib/table";
import {ButtonSize} from "antd/lib/button";
// @ts-ignore
import { createConfirm } from '@/components/core/Confirm';
import {OutputProps} from "@/utils/production/outputUtil";

interface DataOutput {
  total: number;
  rows: object[]
}

interface ButtonProps {
  key?: string; // key
  title?: string; // 按钮名称
  type?: 'default' | 'primary' | 'info' | 'danger'; // 按钮类型
  icon?: string; // 图标
  size?: ButtonSize; // 按钮大小
  loading?: boolean; // 加载状态
  cb?: (internalState: any) => void; // 回调方法
  disabled?: (internalState: any) => boolean | boolean; // 是否可点击
}

interface Props<T> {
  showSearchCardTitle?: boolean; // 是否展示查询区域Card的头部
  searchTitle?: string; // 查询区域标题
  tableTitle?: string; // 表格区域标题
  autoSearch?: boolean; // 表格加载后是否默认查询
  showExport?: boolean; // 是否显示导出按钮
  showColumnSwitch?: boolean; // 是否显示列控制器
  selectType?: "checkbox" | "radio" | null; // 选择形式,多选,单选,不可选择; 默认checkbox
  onRow?: (record: T, index: number) => any; // 表格行事件,比如点击,双击等
  defaultSearchAreaVisible?: boolean;
  defaultAdvancedSearch?: boolean;
  defaultColumnStyle?: 8 | 12 | 24;
  searchForm?: any;
  defaultSearchForm?: any; // 默认查询条件
  defaultSortBy?: string; // 默认排序字段
  defaultSortDirection?: 'ASC' | 'DESC'; // 默认排序方向
  fetchData(params:object): Promise<DataOutput>;
  deleteData?(keys:any[],rows:any[]): Promise<OutputProps>;
  wrapperInternalState?(params:any): void;
  tableExtraProps?: object; // 表格其它属性
  rowKey?: string,
  columns: ColumnProps<T>[];
  extra?: React.ReactNode;
  extraButtons?: ButtonProps[]; // 其它业务按钮
  // 表格按钮事件
  onAddClick?: () => void;
  onEditClick?: (data: T) => void;
  onCopyClick?: (data: T) => void;
  [propName: string]: any, // 其它属性
}

// const SearchDataContext = React.createContext({searchData:{},onStateChange:(data:any)=>{}});

// @ts-ignore
@Form.create()
class SearchTable<T> extends React.PureComponent<Props<T>, any> {

  static defaultProps?: object;

  constructor(props:Props<T>) {
    super(props);
    const {wrapperInternalState=()=>{}} = props;
    wrapperInternalState(this.getState);
    this.state = {
      searchAreaVisible: props.defaultSearchAreaVisible === undefined ? true : props.defaultSearchAreaVisible,
      advancedSearch: props.defaultAdvancedSearch === undefined ? false : props.defaultAdvancedSearch,
      // 查询表单
      // searchForm: {},
      // table 数据
      dataTotal: 0,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      current:1,
      pageSize:10,
      sortBy:props.defaultSortBy,
      sortDirection:props.defaultSortDirection,
      dataLoading:false,
      searchData:{},
      refreshData:this.getData,
    };
  }

  componentDidMount(): void {
    const {autoSearch=true} = this.props;
    if(autoSearch){
      this.getData();
    }

  }

  getState = ()=> {
    return {...this.state,form:this.props.form};
  };

  getData = async():Promise<void> => {
    const {form,fetchData} = this.props;
    const {current,pageSize,sortBy,sortDirection} = this.state;
    this.setState({dataLoading:true});
    const searchForm:any = form?form.getFieldsValue():{};
    let params = handleEmptyProps(searchForm);
    if(searchForm.advancedSearchValue){
      params = {...params,advancedSearchValue:handleEmptyProps(searchForm.advancedSearchValue,)}
    }
    const sortJson = (sortDirection && sortDirection.length>0) ? {sortBy,sortDirection}:{};
    const data = await fetchData({...params,offset:(current*pageSize-pageSize),limit:pageSize,...sortJson});
    this.setState({dataTotal:data.total,dataSource:data.rows,dataLoading:false,selectedRowKeys:[],selectedRows:[]});
  };

  onRowSelect = (record:T,selected: boolean, selectedRows: Object[])=> {
    const {rowKey="id"} = this.props;
    this.setState({selectedRowKeys:selectedRows.map((row:any)=>row[rowKey]),
      selectedRows:selectedRows
    })

  };

  onRowSelectAll = (selected: boolean, selectedRows: Object[], changeRows: Object[])=> {
    const {rowKey="id"} = this.props;
    if(selected){
      this.setState({selectedRowKeys:[...selectedRows.map((row:any)=>row[rowKey]),
          ...changeRows.map((row:any)=>row[rowKey])],
        selectedRows:[...selectedRows,...changeRows]
      });
    }else {
      this.setState({selectedRowKeys:[],selectedRows:[]});
    }

  };

  /**
   * 查询表单按钮
   */
  renderOperationsButtons = ():ReactNode => {
    const {defaultSearchForm={},form,} = this.props;
    return (<>
      <Button
        type='primary'
        key="search"
        icon="search"
        onClick={() => this.setState({current:1}, this.getData)}
      >
        查询
      </Button>
      <Button type='primary' key="reset" icon="undo" style={{ marginLeft: 8 }} onClick={()=>form && form.resetFields()}>
        重置
      </Button>
    </>);
  };

  /**
   * 渲染表格按钮
   */
  renderButtons = ():ReactNode => {
    const {onAddClick,onEditClick,onCopyClick,deleteData,extraButtons=[]} = this.props;
    return (
      <>
        {onAddClick && <Button size="large" type="primary" onClick={onAddClick}>新增</Button>}
        {onEditClick &&
        <Button
          size="large"
          type="primary"
          disabled={this.state.selectedRowKeys.length !== 1}
          onClick={()=>onEditClick(this.state.selectedRows[0])}
        >修改</Button>}
        {onCopyClick &&
        <Button
          size="large"
          type="primary"
          disabled={this.state.selectedRowKeys.length !== 1}
          onClick={()=>onCopyClick(this.state.selectedRows[0])}
        >复制</Button>}
        {deleteData &&
        <Button
          size="large"
          type="danger"
          disabled={this.state.selectedRowKeys.length <= 0}
          onClick={
            () =>
            //   confirm({
            //   onOk: ()=> {
            //     const dataOutputPromise = deleteData(this.state.selectedRowKeys,this.state.selectedRows);
            //     dataOutputPromise.then(()=>this.getData());
            //   }
            // })
              createConfirm({
                content: '确定删除吗？',
                onOk: () => {
                  const dataOutputPromise:Promise<OutputProps> = deleteData(this.state.selectedRowKeys,this.state.selectedRows);
                  dataOutputPromise.then((output) => {output.ok && this.getData()});
                }
              })
          }
        >删除</Button>}
        {extraButtons.map( button => (
          <Button
            key={button.key}
            icon={button.icon}
            type={button.type}
            loading={button.loading}
            size={button.size}
            onClick={
              () => {
                button.cb && button.cb(this.state);
              }
            }
            disabled={typeof button.disabled === 'function'?button.disabled(this.state):button.disabled}
          >
            {button.title}
          </Button>
        ))}
      </>
    );
  };

  // setSearchData = (data:any)=> {
  //   this.setState({searchData:{...this.state.searchData,...data}});
  // };

  handleTableChange = (pagination:PaginationConfig, filters:Record<keyof T, string[]>, sorter:SorterResult<T>) => {
    const param:any = {
      current:pagination.current,
      pageSize:pagination.pageSize,
    };
    if(sorter.order && sorter.field){
      let sortDirection;
      if(sorter.order==='ascend'){
        sortDirection = 'ASC';
      }
      if(sorter.order==='descend'){
        sortDirection = 'DESC';
      }
      param.sortDirection = sortDirection;
      param.sortBy = sorter.field;
    }
    this.setState(param, this.getData);
  };

  render() {
    const {
      showSearchCardTitle,
      searchTitle,
      tableTitle,
      selectType = "checkbox",
      onRow,
      showExport,
      showColumnSwitch,
      form,
      extra=[],
      searchForm,
      defaultColumnStyle,
      columns,
      rowKey="id",
      defaultAdvancedSearch,
      defaultSearchForm,
      tableExtraProps={},
      ...rest
    } = this.props;

    const pagination:PaginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      showTotal: (total:number) => `共 ${total} 条`,
      size: 'default',
      total: this.state.dataTotal,
      current:this.state.current,
      pageSize:this.state.pageSize,
      // onChange:(page: number, pageSize?: number) => {
      //   this.setState({current:page,pageSize:pageSize},this.getData);
      // },
      // onShowSizeChange: (current: number, size: number) => {
      //   this.setState({current:current,pageSize:size},this.getData);
      // }
    };

    let prodSelection:TableRowSelection<T> | false = false;
    if(selectType){
      prodSelection = {
        type: selectType,
        selectedRowKeys:this.state.selectedRowKeys,
        onSelect:this.onRowSelect,
        onSelectAll:this.onRowSelectAll,
      };
    }

    return (
      <>
        {searchForm && searchForm.length > 0 &&
        <Row>
          <Col span={24}>
            <SearchForm
              showCardTitle={showSearchCardTitle}
              title={searchTitle}
              getData={this.getData}
              operations={this.renderOperationsButtons()}
              form={form}
              defaultAdvancedSearch={defaultAdvancedSearch}
              defaultSearchForm={defaultSearchForm}
              defaultColumnStyle={defaultColumnStyle}
            >
              {searchForm}
            </SearchForm>

          </Col>
        </Row>
        }
        <Row>
          <Col span={24}>
            <DataTable
              title={tableTitle}
              columns={columns}
              dataSource={this.state.dataSource}
              dataTotal={this.state.dataTotal}
              pagination={pagination}
              rowKey={rowKey}
              buttons={this.renderButtons()}
              prodSelection={prodSelection}
              loading={this.state.dataLoading}
              onChange={this.handleTableChange}
              showExport={showExport}
              showColumnSwitch={showColumnSwitch}
              onRow={onRow}
              {...tableExtraProps}
            />
          </Col>
        </Row>
      </>
    );
  }

}

SearchTable.defaultProps = {
  showSearchCardTitle: true,
};
export default SearchTable;
export {DataOutput};
