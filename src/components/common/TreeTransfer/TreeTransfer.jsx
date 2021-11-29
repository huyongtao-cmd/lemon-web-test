import React, { Component } from 'react';
import { Tree, Input, Table, Row, Col, Button } from 'antd';
// import { clone } from 'ramda';
import { treeToPlain, plainToTree, keepParentBehavior } from './util';
import styles from './styles.less';

const { TreeNode } = Tree;
const { Search } = Input;

const defaultStructure = {
  id: 'id',
  pid: 'pid',
  children: 'children',
  selected: 'selected',
};

/**
 * @author Mouth.Guo
 */
class TreeTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text || 'text',
      structure: props.structure || defaultStructure,
      type: props.type || 'tree', // 'tree' | 'palin',
      searchValue: '',
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      lockedKeys: [],
      treeData: [],
      leafData: [],
      plainData: [],
      selectedRowKeys: [],
      dataSource: [],
    };
  }

  componentDidMount() {
    this.compileData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.compileData();
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { dataSource } = this.props;
    if (prevProps.dataSource !== dataSource) {
      return true;
    }
    return null;
  }

  static getDerivedStateFromProps(props, state) {
    if (props.dataSource !== state.dataSource) {
      return {
        dataSource: props.dataSource,
      };
    }
    return null;
  }

  transferData = data => {
    const { structure, type } = this.state;
    let tree = [];
    let plain = [];
    let leafs = [];
    if (type === 'tree') {
      const rst = treeToPlain(data, structure);
      tree = [...data];
      plain = [...rst.plain];
      leafs = [...rst.leafs];
    } else {
      const rst = plainToTree(data, structure);
      tree = [...rst.tree];
      plain = [...data];
      leafs = [...rst.leafs];
    }
    return { tree, plain, leafs };
  };

  compileData = () => {
    const { structure, dataSource } = this.state;
    const { selected, id } = structure;
    const { tree, plain, leafs } = this.transferData(dataSource);
    const checkedKeys = plain.filter(d => d[selected]).map(d => d[id]);
    this.setState({
      treeData: tree,
      leafData: leafs,
      plainData: plain,
      checkedKeys,
      lockedKeys: checkedKeys,
    });
  };

  onExpand = (expandedKeys, info) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = (checkedKeys, e) => {
    this.setState({ checkedKeys });
  };

  onRight = () => {
    const { onActive } = this.props;
    const { checkedKeys, plainData, structure, leafData } = this.state;
    const { id, selected } = structure;
    const newPlainData = plainData.map(d => {
      if (checkedKeys.indexOf(d[id]) > -1) {
        return {
          ...d,
          [selected]: true,
        };
      }
      return d;
    });
    const activeData = leafData.filter(d => checkedKeys.indexOf(d[id]) > -1);
    const activeKeys = activeData.map(d => d[id]);
    if (onActive) {
      const result = onActive(activeKeys, activeData);
      result ? this.handleChange(activeKeys, activeData, newPlainData) : null;
    } else {
      this.handleChange(activeKeys, activeData, newPlainData);
    }
  };

  handleChange = (activeKeys, activeData, newPlainData) => {
    const { onChange } = this.props;
    if (onChange) onChange(activeKeys, activeData, newPlainData);
  };

  onDelete = () => {
    const { onDelete } = this.props;
    const { selectedRowKeys, plainData, structure, leafData } = this.state;
    const { id, selected } = structure;
    const newPlainData = keepParentBehavior(selectedRowKeys, structure, plainData, false);
    const activeData = leafData.filter(d => selectedRowKeys.indexOf(d[id]) === -1 && d[selected]);
    const activeKeys = activeData.map(d => d[id]);
    if (onDelete) {
      const result = onDelete(
        selectedRowKeys,
        selectedRowKeys.map(rowKey => leafData.find(leaf => leaf[id] === rowKey))
      );
      this.setState({ selectedRowKeys: [] });
      result ? this.handleChange(activeKeys, activeData, newPlainData) : null;
    } else {
      this.setState({ selectedRowKeys: [] });
      this.handleChange(activeKeys, activeData, newPlainData);
    }
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  onSearchChange = e => {
    const { structure, text, dataSource } = this.state;
    const { ignoreCase } = this.props;
    const { id } = structure;
    const { value } = e.target;
    const matchData = ignoreCase
      ? dataSource.filter(data => data[text].toUpperCase().indexOf(value.toUpperCase()) > -1)
      : dataSource.filter(data => data[text].indexOf(value) > -1);
    const matchChecked = matchData.map(m => m[id]);
    this.setState({
      expandedKeys: matchChecked,
      searchValue: value,
      autoExpandParent: true,
    });
    const { onSearchChange } = this.props;
    if (onSearchChange) onSearchChange(value);
  };

  renderTree = (data, searchValue) => {
    const { text, structure, lockedKeys } = this.state;
    const { id, children } = structure;
    const { ignoreCase } = this.props;
    return data.map(item => {
      const index = ignoreCase
        ? item[text].toUpperCase().indexOf(searchValue.toUpperCase())
        : item[text].indexOf(searchValue);
      const targetStr = item[text].substr(index, searchValue.length);
      const beforeStr = item[text].substr(0, index);
      const afterStr = item[text].substr(index + searchValue.length);
      const titleNode =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{targetStr}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item[text]}</span>
        );
      const disabled = lockedKeys.indexOf(item[id]) > -1;
      if (item[children]) {
        return (
          <TreeNode key={item[id]} title={titleNode} disabled={disabled}>
            {this.renderTree(item[children], searchValue)}
          </TreeNode>
        );
      }
      return <TreeNode key={item[id]} title={titleNode} disabled={disabled} />;
    });
  };

  render() {
    const { columns, height = 400, treeProps, tableProps, buttons } = this.props;
    const {
      treeData,
      leafData,
      searchValue,
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      structure,
      selectedRowKeys,
    } = this.state;
    const { id, selected } = structure;
    const treesProps = {
      checkable: true,
      onExpand: this.onExpand,
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      onCheck: this.onCheck,
      style: {
        height,
      },
      ...treeProps,
    };
    const tablesProps = {
      rowKey: id,
      size: 'small',
      columns,
      dataSource: leafData.filter(d => d[structure.selected]),
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange,
      },
      bordered: true,
      ...tableProps,
    };
    return (
      <Row className={styles.transfer}>
        <Col span={8} style={{ overflow: 'hidden' }}>
          <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={this.onSearchChange} />
          <Tree {...treesProps}>{this.renderTree(treeData, searchValue)}</Tree>
        </Col>
        <Col span={2} style={{ height: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button icon="right" onClick={this.onRight} />
          </div>
        </Col>
        <Col span={14}>
          <div className="ant-input-affix-wrapper" style={{ marginBottom: 8 }}>
            <Button type="danger" disabled={selectedRowKeys.length === 0} onClick={this.onDelete}>
              删除
            </Button>
            {buttons || null}
          </div>
          <Table {...tablesProps} style={{ height }} />
        </Col>
      </Row>
    );
  }
}

export default TreeTransfer;
