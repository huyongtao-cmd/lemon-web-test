interface TreeTempJson {
  [index:string]:TreeProps;
};

interface TreeProps {
  id:any,
  // key:string,
  title:string,
  children:Array<TreeProps>,
  parentId:any,
  [propName: string]: any, // 其它属性
}
// 将树List扁平化
const treeToList = (treeList:Array<TreeProps>=[]) =>
  treeList.reduce((initialArray:Array<Object>, current) => {
    initialArray.push(current);
    if (current.children) {
      treeToList(current.children).forEach(item => initialArray.push(item));
    }
    return initialArray;
  }, []);

/**
 * 将List转树形结构
 * 不建议使用，请使用 listToTreePlus
 * @param list
 * @param parentId
 * @deprecated
 */
const listToTree = (list:Array<TreeProps>=[],parentId:any) => {
  let treeList:Array<TreeProps> = [];

  list.forEach((item, index) => {
    if (item.parentId === parentId) {
      const children = listToTree(list, item.id)
      if (children && (children.length > 0)) {
        item.children = children
      }
      treeList.push(item);
    }
  });
  return treeList
};

/**
 * 树节点添加子节点
 */
const addChildren = (node:TreeProps,child:TreeProps) => {
  if(node.children){
    node.children.push(child);
  }else {
    node.children=[child];
  }
};

/**
 * 将List转树形结构
 * 不建议使用，请使用 listToTreePlus
 * @param list 数据集合
 * @param parentId 父节点id（可以不传），
 *    1. 不传该属性时会把list所有数据展示，当某个节点的父节点id不在所给list范围内时会放在第一个根节点
 *    2. 传该属性时，不显示不在parentId的子节点数据
 * @param parentField 父节点属性
 */
const listToTreePlus = (list:Array<TreeProps>=[],parentId?:any, keyField:string='id', parentField:string='parentId') => {
  const root:TreeProps = {id:null,title:"root",parentId:null,children:[]};
  const json:TreeTempJson = {};
  list.map(item=>{
    const keyValue = item[`${keyField}`];
    json[`${keyValue}`]=item;
  });
  list.forEach(item=>{
    if(parentId===undefined){
      let parentNode = root;
      const parentId = item[`${parentField}`];
      const temp = json[`${parentId}`];
      if(temp){
        parentNode = temp;
      }
      addChildren(parentNode,item);
    }else {
      if(item.id===parentId){
        addChildren(root,item)
      }else {
        const parentId = item[`${parentField}`];
        const parentNode = json[`${parentId}`];
        if(parentNode){
          addChildren(parentNode,item)
        }
      }

    }

  });
  return root.children;
};

/**
 * 树形列表循环
 * @param list
 * @param cb
 */
const treeListForeach = (list:Array<TreeProps>=[],cb:(item:TreeProps)=>void) => {
  list.forEach(node => {
    cb(node);
    if(node.children && node.children.length > 0){
      treeListForeach(node.children,cb);
    }
  })

};

export {treeToList,listToTree,listToTreePlus,treeListForeach,TreeProps};
