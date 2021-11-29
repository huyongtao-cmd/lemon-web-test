import React from 'react';
import {TreeSelect,Icon} from 'antd';
import {listToTreePlus,treeListForeach, TreeProps} from "@/utils/production/TreeUtil";
import memoizeOne from 'memoize-one';
import {equals} from "ramda";

import {localeString} from './Locale';
import {outputHandle, OutputProps} from "@/utils/production/outputUtil";

// @ts-ignore
import {systemSelectionContainBase} from '@/services/production/system';

import styles from './style/select.less';


interface Props {
  value?: string, // 值
  onChange?(value: any, option: any, allOptions: any[]): void, // 值change事件
  parentId?: string;// 父节点id，传此属性将仅渲染该节点的子数据，其它节点不显示在根节点
  parentKey?: string;// 系统选择项父节点key,将按照此节点的树渲染树
  parentSelectAble?: boolean; // 父节点是否可选
  fetchData?(): Promise<Array<TreeProps>>; // 获取数据方法
  options?: TreeProps[], // 直接传入的下拉选择项(带parentId的扁平结构),当异步获取下拉项时可传入该选项,提示页面名称展示速度,需要树形数据完整,顶层数据的parentId需要是null
  optionsKeyField?: string, // 选择项的key字段,用作转树形结构
  showSearch?: boolean, // 可搜索
  allowClear?: boolean, // 可清除
  multiple?: boolean, // 允许多选
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性

}

const toTreeList = (list:Array<TreeProps>=[],parentId?:any,keyField?:string,parentSelectAble=true)=> {
  const transferList = list.map(item=>({
    ...item,
    key:item.id,
    value:item.id,
  }));
  const treeList = listToTreePlus(transferList,parentId,keyField);
  if(!parentSelectAble){
    treeListForeach(treeList,(item)=>{
      if(item.children && item.children.length > 0){
        item.selectable = false;
      }
    });
  }

  return treeList;
};
const memoizeToTreeList = memoizeOne(toTreeList);

/**
 * 1. 树选择组件
 * 2. 请注意 fetchData 与 parentKey 不要同时使用,可能会造成下拉数据混乱
 */
class BaseTreeSelect extends React.Component<Props,any> {

  static defaultProps?: object;

  constructor(props:any) {
    super(props);
    const {options=[],parentId,optionsKeyField,parentSelectAble} = this.props;
    this.state = {
      options: options, // 选择项
      parentId,
    };
    const treeDataTemp = memoizeToTreeList(options,parentId,optionsKeyField,parentSelectAble);
    this.state={treeData:treeDataTemp,options};
  }

  componentDidMount(): void {
    this.getData();
    this.getSystemSelections();
  }

  /**
   * 获取系统选择树
   */
  getSystemSelections = async  () => {
    const {parentKey} = this.props;
    if (parentKey===null || parentKey) {
      const output: OutputProps = await outputHandle(systemSelectionContainBase, {limit: 0,currentTenantFlag:true});
      this.setState({options: output.data.map((item: any) => ({id: item.id, title: item.selectionName,parentId:item.parentId,key:item.selectionKey}))});
    }
  };

  getData = async () => {
    const {fetchData} = this.props;
    if (fetchData) {
      const data = await fetchData();
      this.setState({options:data});
    }
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    const {options:newOptions} = this.state;
    const {options:options,parentId:prevParentId} = prevState;
    const {parentKey,options:propsOptions,parentId,optionsKeyField,parentSelectAble} = this.props;
    if( parentKey && !equals(newOptions,options) ){
      let parentId = null;
      const parentObject = newOptions.filter((option:any) => parentKey===option.key);
      if(parentObject && parentObject.length > 0){
        parentId = parentObject[0].id;
      }
      const treeDataTemp = memoizeToTreeList(newOptions,parentId,optionsKeyField,parentSelectAble);
      this.setState({treeData:treeDataTemp});
    }
    if( !parentKey && !equals(newOptions,options) ){
      const treeDataTemp = memoizeToTreeList(newOptions,parentId,optionsKeyField,parentSelectAble);
      this.setState({treeData:treeDataTemp,options:newOptions});
    }
    if( (propsOptions!==undefined && !equals(options,propsOptions)) ||  prevParentId !== parentId){
      this.setState({options:propsOptions,parentId});
      const treeDataTemp = memoizeToTreeList(propsOptions,parentId,optionsKeyField,parentSelectAble);
      this.setState({treeData:treeDataTemp});
    }
  }


  render() {
    const {
      value,
      multiple,
      onChange= ()=>{},
      showSearch,
      parentKey,
      fetchData,
      placeholder = localeString({localeNo:'portal:component:input:placeholder:baseTreeSelect',defaultMessage:'请选择'}),
      ...rest
    } = this.props;

    const {options=[]} = this.state;

    if(parentKey && fetchData){
      console.error('warning: parentKey 与 fetchData 属性不可同时传入,可能会造成下拉数据混乱');
    }

    return (
      <TreeSelect
        className={styles[`prod-select`]}
        value={value}
        allowClear
        showSearch={showSearch}
        multiple={multiple}
        treeNodeFilterProp="title"
        treeData={this.state.treeData || []}
        onChange={(value) => {
          if(Array.isArray(value)){
            onChange(value, options.filter((option:any) => value.includes(option.value)),options);
          }else {
            onChange(value, options.filter((option:any) => value === option.value),options);
          }
        }}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseTreeSelect.defaultProps = {
  showSearch: true, // 默认可查询
};

export default BaseTreeSelect;
