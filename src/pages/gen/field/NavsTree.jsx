import React from 'react';
import { without } from 'ramda';
import { Tree } from 'antd';
import { treeToPlain, getParentKeys } from '@/components/common/TreeTransfer';
import styles from './navsTree.less';

const { TreeNode } = Tree;

const structure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

const makeSelected = (plain, checkedKeys) =>
  plain.map(p => {
    const selected = checkedKeys.indexOf(p[structure.id]) > -1;
    return {
      ...p,
      [structure.selected]: selected,
    };
  });

class NavTree extends React.Component {
  state = {
    checkedKeys: [],
    expandedKeys: [],
    autoExpandParent: true,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { checkedKeys: checked } = prevState;
    if (checked !== nextProps.checkedKeys) {
      const { treeData, checkedKeys } = nextProps;
      const { plain, leafs } = treeToPlain(treeData, structure);
      const allKeys = plain.map(p => p[structure.id]);
      const uncheckedKeys = without(checkedKeys, allKeys);
      const uncheckedParents = getParentKeys(uncheckedKeys, structure, plain);
      const realChecked = without(uncheckedParents, checkedKeys);
      return {
        checkedKeys: realChecked,
      };
    }
    return null;
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = checkedKeys => {
    const { onChange, treeData } = this.props;
    const { plain, leafs } = treeToPlain(treeData, structure);
    const plainChecked = makeSelected(plain, checkedKeys);
    const leafsChecked = makeSelected(leafs, checkedKeys)
      .filter(l => l[structure.selected])
      .map(l => l[structure.id]);
    const allKeys = getParentKeys(leafsChecked, structure, plainChecked);
    const expandedKeys = without(leafsChecked, allKeys);
    this.setState({
      expandedKeys,
    });
    if (onChange) {
      onChange(allKeys, checkedKeys);
    }
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.code} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.code} />;
    });

  render() {
    const { treeData } = this.props;
    const { expandedKeys, autoExpandParent, checkedKeys } = this.state;
    return (
      <Tree
        className={styles.navsTree}
        checkable
        onExpand={this.onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={checkedKeys}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    );
  }
}

export default NavTree;
