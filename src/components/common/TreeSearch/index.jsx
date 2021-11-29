import { Input, Tree, Icon, Button } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'ramda';
import classnames from 'classnames';
import styles from './index.less';
import company from './company.svg';

// README: Line Tree 模式因为不可描述的原因不用了，换成 DirectoryTree
const { DirectoryTree } = Tree;

// 将List扁平化
const flattenDataList = treeList =>
  treeList.reduce((acc, curr) => {
    acc.push(curr);
    if (curr.child) {
      flattenDataList(curr.child).forEach(item => acc.push(item));
    }
    return acc;
  }, []);

// 寻找指定id数据的父节点
const getParentKey = (id, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i += 1) {
    const node = tree[i];
    if (node.child) {
      if (node.child.some(item => item.id === id)) {
        parentKey = node.id;
      } else if (getParentKey(id, node.child)) {
        parentKey = getParentKey(id, node.child);
      }
    }
  }
  return parentKey;
};

// 搜索树
/**
 * @author Richard.Cheng
 */
class TreeSearch extends React.Component {
  static propTypes = {
    treeData: PropTypes.array.isRequired,
  };

  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
  };

  constructor(props) {
    super(props);

    const { showSearch, treeData } = props;

    if (showSearch) {
      this.dataList = flattenDataList(treeData);
    }
  }

  /**
   * fix defaultExpandedKeys invalid, and the effects -> search invalid
   *
   * PS： 目前的实现，都是拉到treeData之后，才会渲染该组件，因此在componentDidMount里
   *      把 defaultExpandedKeys 更新给 expandedKeys 即可；如果以后需求变更，这里可能还是要改一下
   */
  componentDidMount() {
    const { defaultExpandedKeys = [] } = this.props;
    this.setState({
      expandedKeys: defaultExpandedKeys,
    });
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onChange = e => {
    const { treeData } = this.props;
    const { value } = e.target;
    const expandedKeys = this.dataList
      .map(item => {
        if (item.text && item.text.indexOf(value) > -1) {
          // console.log('in search val ->', item)
          return getParentKey(item.id, treeData) + '';
        }
        return null;
      })
      .filter((item, i, currMap) => item && currMap.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  render() {
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    const {
      treeData,
      highlightColor = '#f50',
      showSearch,
      showBtn,
      showBtnModel,
      className,
      placeholder,
      ...restProps
    } = this.props;

    // 省略属性
    const treeProps = omit(['placeholder', 'className', 'onExpand'], restProps);

    const loopForChildNode = data =>
      data.map(item => {
        let title = '';
        const icon = item.icon ? item.icon : '';
        if (item.text) {
          const index = searchValue ? item.text.indexOf(searchValue) : -1;
          const beforeStr = item.text.substr(0, index);
          const afterStr = item.text.substr(index + searchValue.length);
          title =
            index > -1 ? (
              <span>
                {beforeStr}
                <b style={{ color: highlightColor }}>{searchValue}</b>
                {afterStr}
              </span>
            ) : (
              <span>{item.text}</span>
            );
        } else {
          title = '[数据错误]';
        }
        if (item.child) {
          return (
            <Tree.TreeNode
              key={item.id}
              title={title}
              icon={
                <img
                  style={{
                    width: '24px',
                    height: '24px',
                    opacity: '0.7',
                    marginLeft: '-5px',
                    marginTop: '-5px',
                  }}
                  src={company}
                  alt=""
                />
              }
            >
              {loopForChildNode(item.child)}
            </Tree.TreeNode>
          );
        }
        return (
          <Tree.TreeNode
            key={item.id}
            title={title}
            icon={
              <img
                style={{
                  width: '24px',
                  height: '24px',
                  opacity: '0.7',
                  marginLeft: '-5px',
                  marginTop: '-5px',
                }}
                src={company}
                alt=""
              />
            }
          />
        );
      });

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

          {showBtn && (
            // 设计原因 BU管理 BU主数据 的按钮
            <Button
              className={classnames(styles.Search_Button, 'tw-btn-primary')}
              onClick={showBtnModel && showBtnModel}
            >
              保存历史版本
            </Button>
          )}
        </div>
        {treeData && treeData.length ? (
          <DirectoryTree
            // showLine
            // className="tw-tree-line"
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            {...treeProps}
          >
            {loopForChildNode(treeData)}
          </DirectoryTree>
        ) : (
          <div style={{ textAlign: 'center', margin: 10 }}>暂无数据</div>
        )}
      </div>
    );
  }
}

export default TreeSearch;
