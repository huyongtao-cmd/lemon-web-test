import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Row, Col, Radio, Input, Tree, Icon, Modal } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { Selection } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import styles from './index.less';

const DOMAIN = 'platTrainConfig';
const { Description } = DescriptionList;
const RadioGroup = Radio.Group;
const { TreeNode } = Tree;

@connect(({ loading, platTrainConfig }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  platTrainConfig,
}))
@mountToTab()
class CapaConfig extends PureComponent {
  state = {
    expandedKeys: [-1],
    stopModalShow: false,
    selectKeys: ['-1'],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
    });
  };

  preventBubble = e => {
    e.stopPropagation();
  };

  add = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    const { expandedKeys = [] } = this.state;
    if (id) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);

          if (item.key === parseInt(id, 10)) {
            const newId = genFakeId(-1);
            newItem.children = newItem.children || [];
            newItem.children.push({
              title: '',
              key: newId,
              id: newId,
              editable: true,
              sort: newItem.children.length + 1,
            });
            return newItem;
          }
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      const newTreeData = searchSelectedTreeNode(treeData);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          treeData: newTreeData,
          pid: id,
        },
      });
    }
    this.preventBubble(e);
  };

  swap = (arr, idx1, idx2) => {
    const newArr = Object.assign([], arr);
    // eslint-disable-next-line prefer-destructuring
    newArr[idx1] = newArr.splice(idx2, 1, newArr[idx1])[0];
    const temp = newArr[idx1].sort;
    newArr[idx1].sort = newArr[idx2].sort;
    newArr[idx2].sort = temp;

    return newArr;
  };

  // 上移
  moveUp = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;

    // 操作的分类 id 和 排序
    const idX1 = id;
    let sortNoX1 = 0;
    let idX2 = 0;
    let sortNoX2 = 0;
    let canChange = true;

    const moveNode = (data, key) => {
      if (!(data instanceof Array)) return;
      const curr = data.find(row => row.id === parseInt(key, 10));
      if (curr) {
        sortNoX1 = curr.sortNo;
        const idx = data.indexOf(curr);
        if (idx !== 0) {
          canChange = true;
          this.swap(data, idx, idx - 1);
          const currIndex = data.findIndex(row => row.id === parseInt(key, 10));
          const prev = data[currIndex - 1];
          idX2 = prev.id;
          sortNoX2 = prev.sortNo;
        } else {
          createMessage({ type: 'warn', description: '第一个子分类不能再上移' });
          canChange = false;
        }
      } else {
        data.forEach(row => moveNode(row.children, id));
      }
      // eslint-disable-next-line consistent-return
      return data;
    };
    moveNode(treeData, id);
    if (canChange) {
      dispatch({
        type: `${DOMAIN}/changeSort`,
        payload: {
          idX1,
          idX2,
          sortNoX1,
          sortNoX2,
        },
      });
    }

    this.preventBubble(e);
  };

  moveDown = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    // 操作的分类 id 和 排序
    const idX1 = id;
    let sortNoX1 = 0;
    let idX2 = 0;
    let sortNoX2 = 0;
    let canChange = true;

    const moveNode = (data, key) => {
      if (!(data instanceof Array)) return;
      const curr = data.find(row => row.id === parseInt(key, 10));
      if (curr) {
        sortNoX1 = curr.sortNo;
        const idx = data.indexOf(curr);
        if (idx + 1 !== data.length) {
          canChange = true;
          this.swap(data, idx, idx + 1);
          const currIndex = data.findIndex(row => row.id === parseInt(key, 10));
          const prev = data[currIndex + 1];
          idX2 = prev.id;
          sortNoX2 = prev.sortNo;
        } else {
          createMessage({ type: 'warn', description: '最后一个子分类不能再下移' });
          canChange = false;
        }
      } else {
        data.forEach(row => moveNode(row.children, id));
      }
      // eslint-disable-next-line consistent-return
      return data;
    };

    moveNode(treeData, id);
    if (canChange) {
      dispatch({
        type: `${DOMAIN}/changeSort`,
        payload: {
          idX1,
          idX2,
          sortNoX1,
          sortNoX2,
        },
      });
    }

    this.preventBubble(e);
  };

  startUsing = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    if (id) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);
          if (item.key === parseInt(id, 10)) {
            newItem.disabled = false;
            return newItem;
          }
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      dispatch({
        type: `${DOMAIN}/stopAndStart`,
        payload: {
          id,
          classStatus: 'IN_USE',
        },
      });
    }
    this.preventBubble(e);
  };

  stopUsing = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    if (id) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);
          if (item.key === parseInt(id, 10)) {
            newItem.disabled = true;
            return newItem;
          }
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      dispatch({
        type: `${DOMAIN}/stopAndStart`,
        payload: {
          id,
          classStatus: 'NOT_USED',
        },
      });
    }
    this.preventBubble(e);
  };

  delete = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;

    if (id) {
      if (id > 0) {
        dispatch({
          type: `${DOMAIN}/deleteClassFn`,
          payload: {
            id,
          },
        });
      } else {
        const deleteNodeHandle = data => {
          for (let i = 0; i < data.length; i += 1) {
            if (data[i].id === id) {
              data.splice(i, 1);
              return data;
            }
            if (data[i].children && data[i].children.length) {
              deleteNodeHandle(data[i].children);
            }
          }
          return data;
        };
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            treeData: deleteNodeHandle(treeData),
          },
        });
      }
    }

    this.preventBubble(e);
  };

  editFinish = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [], pid },
    } = this.props;
    const { inputVal } = this.state;
    if (!inputVal) {
      createMessage({ type: 'warn', description: '请输入分类名称' });
      return;
    }
    let addClass = {};
    if (id) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);
          if (item.key === parseInt(id, 10)) {
            newItem.title = inputVal;
            newItem.editable = false;
            addClass = newItem;
            return newItem;
          }
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      const newTreeData = searchSelectedTreeNode(treeData);
      dispatch({
        type: `${DOMAIN}/addAndupdateFn`,
        payload: { ...addClass, pid },
      });
    }
    this.preventBubble(e);
  };

  edit = (id, e) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    if (id) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);

          if (item.key === parseInt(id, 10)) {
            newItem.editable = true;
            return newItem;
          }
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      const newTreeData = searchSelectedTreeNode(treeData);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          treeData: newTreeData,
        },
      });
    }
    this.preventBubble(e);
  };

  // eslint-disable-next-line consistent-return
  compare = (x, y) => {
    if (x.sort < y.sort) {
      return -1;
    }
    if (x.sort > y.sort) {
      return 1;
    }
    return 0;
  };

  treeNodeSort = data => {
    if (!(data instanceof Array)) return;
    data.sort(this.compare);
    data.forEach(row => this.treeNodeSort(row.children));
    // eslint-disable-next-line consistent-return
    return data;
  };

  loopTreeData = data =>
    data.map(item => {
      const { selected = false, id, disabled = false, editable = false, title, key } = item;
      let titleNode = title;
      if (id === -1) {
        titleNode = (
          <div className={styles.btnWrap}>
            {title}
            <span
              onClick={e => {
                this.add(id, e);
              }}
            >
              添加
            </span>
          </div>
        );
      }
      if (selected && id !== -1) {
        titleNode = (
          <div className={styles.btnWrap}>
            {title}
            <span
              onClick={e => {
                this.add(id, e);
              }}
            >
              添加
            </span>
            <span
              onClick={e => {
                this.edit(id, e);
              }}
            >
              修改
            </span>
            <span
              onClick={e => {
                this.moveUp(id, e);
              }}
            >
              上移
            </span>
            <span
              onClick={e => {
                this.moveDown(id, e);
              }}
            >
              下移
            </span>
            <span
              onClick={e => {
                this.setState({
                  stopModalShow: true,
                  stopId: id,
                  stopEvent: e,
                });
              }}
            >
              停用
            </span>
            <span
              onClick={e => {
                this.delete(id, e);
              }}
            >
              删除
            </span>
          </div>
        );
      }
      if (disabled) {
        titleNode = (
          <div className={styles.btnWrap}>
            {title}
            <span className={styles.treeNodeDisabled}>已停用</span>
            <span
              onClick={e => {
                this.startUsing(id, e);
              }}
            >
              启用
            </span>
          </div>
        );
      }
      if (editable) {
        titleNode = (
          <div className={styles.btnWrap}>
            <Input
              defaultValue={title}
              onChange={e => {
                this.setState({
                  inputVal: e.target.value,
                });
              }}
              onBlur={e => {
                this.editFinish(id, e);
              }}
            />
            <span
              onClick={e => {
                this.delete(id, e);
              }}
            >
              删除
            </span>
          </div>
        );
      }

      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.key} title={titleNode}>
            {this.loopTreeData(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={titleNode} />;
    });

  treeNodeHandle = (selectedKey, handleKey) => {
    const {
      dispatch,
      platTrainConfig: { treeData = [] },
    } = this.props;
    const keys = parseInt(selectedKey, 10);
    if (keys) {
      const searchSelectedTreeNode = data => {
        const treeDataTmp = data.map(item => {
          const newItem = ({}, item);
          if (item.key === parseInt(keys, 10)) {
            newItem[handleKey] = true;
            return newItem;
          }
          newItem[handleKey] = false;
          if (item.children && item.children.length) {
            searchSelectedTreeNode(newItem.children);
          }

          return newItem;
        });
        return treeDataTmp;
      };

      const newTreeData = searchSelectedTreeNode(treeData);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          treeData: newTreeData,
        },
      });
    }
  };

  render() {
    const { loading, dispatch, platTrainConfig = {} } = this.props;
    const { treeData = [] } = platTrainConfig;
    const { expandedKeys, stopModalShow, stopId, stopEvent, selectKeys = [] } = this.state;
    return (
      <PageHeaderWrapper title="培训项目分类管理">
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" text="培训项目分类管理" />}
          bordered={false}
        >
          <div className={styles.treeWrap}>
            <Tree
              className={styles.tree}
              // defaultExpandedKeys={expandedKeys}
              expandedKeys={selectKeys}
              onSelect={keys => {
                const key = keys ? keys[0] : null;
                this.treeNodeHandle(key, 'selected');
                const newSelectkeys = Object.assign([], selectKeys);
                keys.forEach(item => {
                  const idx = newSelectkeys.indexOf(item);
                  if (idx > -1) {
                    newSelectkeys.splice(idx, 1);
                  } else {
                    newSelectkeys.push(item);
                  }
                });
                this.setState({
                  selectKeys: newSelectkeys,
                });
              }}
            >
              {this.loopTreeData(this.treeNodeSort(treeData))}
            </Tree>
          </div>
        </Card>
        <Modal
          title="停用确认"
          visible={stopModalShow}
          onOk={() => {
            this.stopUsing(stopId, stopEvent);
            this.setState({
              stopModalShow: false,
            });
          }}
          onCancel={() => {
            this.setState({
              stopModalShow: false,
            });
          }}
        >
          <p>确认将该分类及其所有子分类停用？</p>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default CapaConfig;
