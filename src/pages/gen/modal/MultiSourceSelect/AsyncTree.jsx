import React from 'react';
import { Tree, Row, Input, Icon } from 'antd';
import styles from './styles.less';

const { TreeNode } = Tree;
const { Search } = Input;

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'selected',
};

class AsyncTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      structure: props.structure || defaultStructure,
      text: props.text || 'text',
      treeData: [],
      searchValue: '',
      rootNode: props.rootNode || undefined,
      loadedKeys: [],
      leafLoading: undefined,
      expandedKeys: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.rootNode !== prevState.rootNode) {
      return {
        rootNode: nextProps.rootNode || undefined,
      };
    }
    if (nextProps.dataSource !== prevState.treeData) {
      return {
        treeData: nextProps.dataSource,
      };
    }
    return null;
  }

  onSelect = async (selectedKeys, e) => {
    const { node } = e;
    // tag: selectedKeys === [eventKey]
    const { eventKey, children, dataRef } = node.props;
    const { loadedKeys } = this.state;
    if (!loadedKeys.includes(eventKey)) {
      const { asyncLoadTree } = this.props;
      if (asyncLoadTree) {
        const result = await asyncLoadTree(eventKey);
        this.setState(
          {
            loadedKeys: [...loadedKeys, eventKey],
          },
          () => {
            if (result !== true) this.asyncLoadList(eventKey);
          }
        );
      }
    } else if (children) {
      // if (dataRef.children) return undefined;
      // nothing
    } else {
      this.setState({ leafLoading: eventKey }, () => this.asyncLoadList(eventKey));
    }
  };

  onExpandWrapper = (e, expandedKeys) => {
    e.stopPropagation();
    this.setState({ expandedKeys });
  };

  // loadData = async node => {
  //   const { eventKey, children, dataRef } = node.props;
  //   // if (dataRef.children) return Promise.resolve();
  //   // tag: 这里 children 待验证，目前按 antd 自己的demo来取，个人觉得应该取 dataRef.children
  //   if (children) return Promise.resolve();
  //   const { asyncLoadTree } = this.props;
  //   const { loadedKeys } = this.state;
  //   if (asyncLoadTree) {
  //     const result = await asyncLoadTree(eventKey);
  //     this.setState({
  //       loadedKeys: [...loadedKeys, eventKey],
  //     }, () => {
  //       if (result !== true) this.asyncLoadList(eventKey);
  //     });
  //     return Promise.resolve();
  //   }
  //   this.setState({
  //     loadedKeys: [...loadedKeys, eventKey],
  //   });
  //   return Promise.resolve();
  // }

  asyncLoadList = async code => {
    const { asyncLoadList } = this.props;
    if (asyncLoadList) {
      const result = await asyncLoadList(code);
      this.setState({ leafLoading: undefined });
    }
    this.setState({ leafLoading: undefined });
  };

  onSearchChange = e => {
    const { value } = e.target;
    this.setState({ searchValue: value }, () => {
      // if showSearch is indeed, add logical...
    });
  };

  renderTreeNode = (item, searchValue) => {
    const { showSearch } = this.props;
    const { structure, text, leafLoading, loadedKeys } = this.state;
    const { id, pid, children } = structure;
    // searchValue separate
    const index = item[text].indexOf(searchValue);
    const beforeStr = item[text].substr(0, index);
    const afterStr = item[text].substr(index + searchValue.length);
    // show searched value or not
    const searched = showSearch && index > -1;
    // give title by condition
    const titleNode = searched ? (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{searchValue}</span>
        {afterStr}
      </span>
    ) : (
      <span>{item[text]}</span>
    );
    if (item[children]) {
      const plusIcon = (
        <Icon
          type="plus-square"
          style={{ marginRight: 8 }}
          onClick={e => this.onExpandWrapper(e, [item[id]])}
        />
      );
      return (
        <TreeNode
          key={item[id]}
          title={
            <span>
              {plusIcon}
              {titleNode}
            </span>
          }
          dataRef={item}
        >
          {item[children].map(tree => this.renderTreeNode(tree, searchValue))}
        </TreeNode>
      );
    }
    const isLoading = leafLoading && leafLoading === item[id];
    const isLoaded = loadedKeys.includes(item[id]);
    const normalIcon = isLoaded ? 'tag' : 'plus-square';
    const finallyIcon = isLoading ? 'loading' : normalIcon;
    const icon = <Icon type={finallyIcon} style={{ marginRight: 8 }} />;
    // leaf TreeNode
    return (
      <TreeNode
        key={item[id]}
        title={
          <span>
            {icon}
            {titleNode}
          </span>
        }
        dataRef={item}
      />
    );
  };

  render() {
    const { showSearch = false, height } = this.props;
    const { treeData, searchValue, loadedKeys, expandedKeys } = this.state;

    return (
      <Row
        className={styles.asyncTree}
        // style={{ height }} // modal scroll， bind this height
      >
        {showSearch && (
          <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={this.onSearchChange} />
        )}
        <Tree
          onSelect={this.onSelect}
          // loadData={this.loadData}
          selectedKeys={[]}
          expandedKeys={expandedKeys}
          loadedKeys={loadedKeys}
        >
          {treeData.map(tree => this.renderTreeNode(tree, searchValue))}
        </Tree>
      </Row>
    );
  }
}

export default AsyncTree;
