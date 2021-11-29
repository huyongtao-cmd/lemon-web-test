import {Input, Tree} from 'antd';
import React, {ReactElement} from 'react';
import classnames from 'classnames';
import memoizeOne from 'memoize-one';
import {equals} from 'ramda';

import {listToTree, TreeProps} from '@/utils/production/TreeUtil';
import {localeString} from '@/components/production/basic/Locale';


import styles from './style/treeSearch.less';
import {AntTreeNodeSelectedEvent} from "antd/lib/tree";

const { DirectoryTree } = Tree;

interface Props {
  options:Array<TreeProps>,
  parentId?:any,
  onSelect?: (selectedKeys: string[], e: AntTreeNodeSelectedEvent) => void;
  [propName: string]: any, // 其它属性

}

const toTreeList = (list:Array<TreeProps> = [],parentId:any)=> {
  const transferList = list.map(item=>({...item,id:item.id+"",parentId:(item.parentId?item.parentId+"":item.parentId)}));
  return listToTree(transferList, parentId);
};
const memoizeToTreeList = memoizeOne(toTreeList);

const getParentIds = (parentId:any, list:Array<TreeProps> =[] ):Array<any> => {
  const parentNode = list.filter(item=> item.id+""===parentId)[0];
  if(parentNode && parentNode.parentId){
    return [parentId+"",...getParentIds(parentNode.parentId,list)];
  }
  return [parentId+""];
};

/**
 *
 */
class TreeSearch extends React.Component<Props,any> {

  state = {
    expandedKeys: [],
    searchValue: '',
    treeData: [],
  };

  constructor(props:any) {
    super(props);


  }


  componentDidMount() {
    const { options,parentId=null } = this.props;
    const treeDataTemp = memoizeToTreeList(options,parentId);
    const expandedKeys = treeDataTemp.map((item:any)=>item.id);
    this.setState({treeData:treeDataTemp,expandedKeys});
  }

  // static getDerivedStateFromProps(nextProps:Props, prevState:any) {
  //   console.log('.....')
  //   console.log(nextProps)
  //   const { options,parentId=null } = nextProps;
  //   const {treeData} = prevState;
  //   const treeDataTemp = memoizeToTreeList(options,parentId);
  //   if(treeData === treeDataTemp){
  //     return null;
  //   }
  //   const expandedKeys = treeDataTemp.map((item:any)=>item.id);
  //   return {treeData:treeDataTemp,expandedKeys};
  // }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    const { options,parentId=null } = this.props;
    const { options:prevOptions,parentId:prevParentId=null } = prevProps;

    if(!equals(options,prevOptions) || !equals(parentId,prevParentId)){
      const treeDataTemp = memoizeToTreeList(options,parentId);
      const expandedKeys = treeDataTemp.map((item:any)=>item.id);
      this.setState({treeData:treeDataTemp,expandedKeys});
    }
  }

  onExpand = (expandedKeys:Array<string>) => {
    this.setState({
      expandedKeys,
    });
  };

  onChange = (e:any) => {
    const { options=[] } = this.props;
    const { value } = e.target;
    if(value&&value.length>0){
      const expandedKeys = options.filter((item) => item && item.title && item.parentId && item.title.indexOf(value) > -1).map(item=>item.parentId+"");
      let expandedKeysList:Array<any> = [];
      expandedKeys.forEach(key=>{
        expandedKeysList = expandedKeysList.concat(getParentIds(key,options));
      });
      this.setState({
        expandedKeys:Array.from(new Set(expandedKeysList)),
        searchValue: value,
      });
    }else {
      const {treeData} = this.state;
      this.setState({
        expandedKeys:treeData.map((item:any)=>item.id),
        searchValue: value,
      });
    }

  };

  renderNodes = (list:Array<TreeProps>,searchValue?:string):Array<any>=>{
    const node = list.map( (item:TreeProps) => {
      let titleNode: string | ReactElement<any> = '';
      const title:string = item.title;
      if (title) {
        if(searchValue && searchValue.trim().length>0 ){
          const index = searchValue ? title.indexOf(searchValue) : -1;
          const beforeStr = title.substr(0, index);
          const afterStr = title.substr(index + searchValue.length);
          titleNode =
            index > -1 ? (
              <span>
                {beforeStr}
                <b style={{color: "#f50"}}>{searchValue}</b>
                {afterStr}
              </span>
            ) : (
              <span>{title}</span>
            );
        }else {
          titleNode = <span>{title}</span>
        }

      } else {
        titleNode = localeString({defaultMessage:'数据错误',localeNo:'portal:common:tips:dataError'});
      }
      if (item.children) {
        return (
          <Tree.TreeNode
            key={item.id}
            title={titleNode}
          >
            {this.renderNodes(item.children,searchValue)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          key={item.id}
          title={titleNode}
        />
      );
    });
    return node;
  };

  render() {
    const { searchValue, expandedKeys,treeData  } = this.state;
    const {
      options=[],
      parentId=null,
      onSelect,
      highlightColor = '#f50',
      showSearch,
      showBtn,
      showBtnModel,
      className,
      placeholder = localeString({defaultMessage:"请输入",localeNo:"page.placeholder.pleaseInput"}),
      ...restProps
    } = this.props;


    return (
      <div className={classnames(styles.treeSearch, className)}>
        <div className={classnames(styles.treeSearch_input)}>
          {showSearch && (
            <Input.Search
              placeholder={placeholder}
              onChange={this.onChange}
              className={classnames(styles.Search_input)}
            />
          )}

        </div>
        {treeData && treeData.length ? (
          <DirectoryTree
            // showLine
            // className="tw-tree-line"
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            // autoExpandParent
            onSelect={onSelect}
            {...restProps}
          >
            {this.renderNodes(treeData,searchValue)}
          </DirectoryTree>
        ) : (
          <div style={{ textAlign: 'center', margin: 10 }}>{localeString({defaultMessage:'暂无数据',localeNo:'portal:common:tips:dataEmpty'})}</div>
        )}
      </div>
    );
  }
}

export default TreeSearch;
