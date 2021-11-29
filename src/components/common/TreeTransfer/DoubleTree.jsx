import React, { Component } from 'react';
import { Tree, Input, Col, Row, Button, Icon } from 'antd';
import styles from './styles.less';
import util, { plainToTree } from './util';

const { arrayToTree } = util;

const { TreeNode } = Tree;
const { Search } = Input;

const recursionFindKeys = (key, children, checkedKeys, tree) => {
  let expandedKeys = [];
  tree.map(t => {
    if (checkedKeys.indexOf(t[key]) > -1) {
      if (t[children]) {
        expandedKeys = [
          ...expandedKeys,
          t[key],
          ...recursionFindKeys(key, children, checkedKeys, t[children]),
        ];
      } else {
        expandedKeys = [...expandedKeys, t[key]];
      }
    }
    return t;
  });
  return expandedKeys;
};

class TreeTransfer extends Component {
  state = {
    // eslint-disable-next-line
    key: this.props.keyBinding || 'key',
    // eslint-disable-next-line
    parentKey: this.props.parentKeyBinding || 'parentKey',
    // eslint-disable-next-line
    title: this.props.titleBinding || 'title',
    // eslint-disable-next-line
    selectedKeybinding: this.props.selectedBinding || 'selected',
    childrenBinding: 'children',
    searchValue: '',
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    treeData: [],
    lockedKeys: [],
    activeTree: [],
    activeChekedKeys: [],
    activeSearchValue: '',
    activeAutoExpandParent: true,
  };

  componentDidMount() {
    this.initialState();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.initialState();
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { dataSource } = this.props;
    if (prevProps.dataSource.length !== dataSource.length) {
      return true;
    }
    return null;
  }

  initialState = () => {
    // init basic data
    const { dataSource } = this.props;
    const { key, parentKey, childrenBinding, selectedKeybinding } = this.state;
    const treeData = plainToTree(dataSource, {
      id: key,
      pid: parentKey,
      children: childrenBinding,
      selected: selectedKeybinding,
    }).tree;
    const checkedKeys = dataSource.filter(item => item[selectedKeybinding]).map(item => item[key]);
    const { activeTree } = this.getCheckedObjectFromKeys(checkedKeys);
    const expandedKeys = recursionFindKeys(key, childrenBinding, checkedKeys, treeData);
    const activeExpandedKeys = recursionFindKeys(key, childrenBinding, checkedKeys, activeTree);
    this.setState({
      treeData,
      checkedKeys,
      expandedKeys,
      activeExpandedKeys,
      lockedKeys: checkedKeys,
      activeTree,
    });
  };

  getCheckedObjectFromKeys = (checkedKeys = []) => {
    const { dataSource } = this.props;
    const { key, selectedKeybinding, parentKey, childrenBinding } = this.state;
    const activeTreePlain = [...[], ...checkedKeys].map(k => {
      const findData = dataSource.find(data => data[key] === k);
      return {
        ...findData,
        [selectedKeybinding]: true,
      };
    });
    return {
      activeTreePlain,
      activeTree: arrayToTree(activeTreePlain, key, parentKey, childrenBinding),
    };
  };

  onCheck = (checkedKeys, e, active = false) => {
    const keyLabel = active ? 'activeChekedKeys' : 'checkedKeys';
    this.setState({ [keyLabel]: checkedKeys });
  };

  onDelete = () => {
    const { activeChekedKeys, lockedKeys, key, childrenBinding, treeData } = this.state;
    const checkedKeys = lockedKeys.filter(k => activeChekedKeys.indexOf(k) === -1);
    const { activeTree } = this.getCheckedObjectFromKeys(checkedKeys);
    const expandedKeys = recursionFindKeys(key, childrenBinding, checkedKeys, treeData);
    const activeExpandedKeys = recursionFindKeys(key, childrenBinding, checkedKeys, activeTree);
    this.setState({
      checkedKeys,
      activeChekedKeys: [],
      lockedKeys: checkedKeys,
      activeTree,
      expandedKeys,
      activeExpandedKeys,
    });
    const { onChange } = this.props;
    onChange && onChange(checkedKeys, activeTree);
  };

  onExpand = (expandedKeys, info, active = false) => {
    const keys = active ? 'activeExpandedKeys' : 'expandedKeys';
    const autoExpandParent = active ? 'activeAutoExpandParent' : 'autoExpandParent';
    this.setState({
      [keys]: expandedKeys,
      [autoExpandParent]: false,
    });
  };

  onChange = (e, active = false) => {
    const { dataSource } = this.props;
    const { title, key, childrenBinding, parentKey } = this.state;
    const { value } = e.target;
    const matchData = dataSource.filter(data => data[title].indexOf(value) > -1);
    const matchChecked = matchData.map(m => m[key]);
    const matchTree = arrayToTree(matchData, key, parentKey, childrenBinding);
    const expandedKeys = recursionFindKeys(key, childrenBinding, matchChecked, matchTree);
    const keys = active ? 'activeExpandedKeys' : 'expandedKeys';
    const search = active ? 'activeSearchValue' : 'searchValue';
    const autoExpandParent = active ? 'activeAutoExpandParent' : 'autoExpandParent';
    this.setState({
      [keys]: expandedKeys,
      [search]: value,
      [autoExpandParent]: true,
    });
  };

  onSave = () => {
    const { onSave } = this.props;
    const { lockedKeys, activeTree } = this.state;
    // console.log('lockedKeys', lockedKeys);
    // console.log('activeTree', activeTree);
    if (onSave) {
      onSave(lockedKeys, activeTree);
    }
  };

  handleActive = () => {
    const { checkedKeys, expandedKeys } = this.state;
    const { activeTree } = this.getCheckedObjectFromKeys(checkedKeys);
    this.setState({
      lockedKeys: checkedKeys,
      activeExpandedKeys: expandedKeys,
      activeTree,
    });
    const { onChange } = this.props;
    onChange && onChange(checkedKeys, activeTree);
  };

  renderNode = (data, searchValue, editable = false) => {
    const { title, key, lockedKeys, childrenBinding } = this.state;
    return data.map(item => {
      const index = item[title].indexOf(searchValue);
      const beforeStr = item[title].substr(0, index);
      const afterStr = item[title].substr(index + searchValue.length);
      const titleNode =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item[title]}</span>
        );
      const disabled = !editable && lockedKeys.indexOf(item[key]) > -1;
      if (item[childrenBinding]) {
        return (
          <TreeNode key={item[key]} title={titleNode} disabled={disabled}>
            {this.renderNode(item[childrenBinding], searchValue, editable)}
          </TreeNode>
        );
      }
      return <TreeNode key={item[key]} title={titleNode} disabled={disabled} />;
    });
  };

  render() {
    const {
      treeData,
      searchValue,
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      activeTree,
      activeExpandedKeys,
      activeChekedKeys,
      activeSearchValue,
      activeAutoExpandParent,
    } = this.state;
    return (
      <Row className={styles.transfer} gutter={6} style={{}}>
        <Col span={10}>
          <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={this.onChange} />
          <Tree
            checkable
            onExpand={(keys, info) => this.onExpand(keys, info)}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            checkedKeys={checkedKeys}
            onCheck={(keys, e) => this.onCheck(keys, e)}
          >
            {this.renderNode(treeData, searchValue)}
          </Tree>
        </Col>
        <Col span={2} style={{ height: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              icon="left"
              onClick={this.onDelete}
              style={{ marginBottom: 8 }}
              // disabled={activeChekedKeys.length === 0}
            />
            <Button icon="right" onClick={this.handleActive} />
          </div>
        </Col>

        <Col span={10}>
          <Search
            style={{ marginBottom: 8 }}
            placeholder="搜索"
            onChange={e => this.onChange(e, true)}
          />
          <Tree
            checkable
            autoExpandParent={activeAutoExpandParent}
            onExpand={(keys, info) => this.onExpand(keys, info, true)}
            expandedKeys={activeExpandedKeys}
            checkedKeys={activeChekedKeys}
            onCheck={(keys, e) => this.onCheck(keys, e, true)}
          >
            {this.renderNode(activeTree, activeSearchValue, true)}
          </Tree>
        </Col>
      </Row>
    );
  }
}

export default TreeTransfer;
