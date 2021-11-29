import React from 'react';
import { Row, Col } from 'antd';
import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toUrl, toQs } from '@/utils/stringUtils';
import { plainToTree, treeToPlain } from '@/utils/dataUtils';
import AsyncTree from './AsyncTree';
import AsyncTable from './AsyncTable';

const sourceInfoApi = api.sys.iam.orgs.orgInfo;
const sourceTreeNodeApi = api.sys.iam.orgs.orgUnits;

const structure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
};

class SourceChosen extends React.Component {
  state = {
    sourceName: undefined,
    listNodeType: undefined,
    rootNode: undefined,
    dataSource: [],
    treeData: [],
  };

  componentDidMount() {
    const { sourceName } = this.props;
    sourceName && this.fetchSourceInfo(sourceName);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null && snapshot !== undefined) {
      this.fetchSourceInfo(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { sourceName } = this.props;
    if (prevProps.sourceName !== sourceName) {
      return sourceName;
    }
    return null;
  }

  // ------- custom method -------

  onAdd = selectedRows => {
    const { sourceName, dataSource } = this.state;
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(sourceName, selectedRows, dataSource);
    }
    return true;
  };

  asyncLoadTree = async code => {
    const { treeData, listNodeType, sourceName } = this.state;
    const { plain } = treeToPlain(treeData, structure);
    const asyncNode = plain.find(tree => tree.code === code);
    const { type } = asyncNode;
    const result = await this.fetchTreeNode(sourceName, type, code);
    if (!Array.isArray(result) || result.length === 0) return result; // false | undefined
    // compile tree Data
    const { tree } = plainToTree(result, structure);
    asyncNode.children = tree;
    const newTree = plainToTree(plain, structure).tree;
    this.setState({
      treeData: [...newTree],
    });
    return true;
  };

  asyncLoadList = async code => {
    const { listNodeType, sourceName } = this.state;
    await this.fetchTableList(sourceName, listNodeType, code);
    return undefined;
  };

  // ------- request -------
  fetchSourceInfo = source => {
    request.get(toUrl(sourceInfoApi, { id: source })).then(({ response, status }) => {
      if (status === 200 && response) {
        const { listFields, listNodeType, sourceName, treeNodeType } = response;
        this.setState(
          {
            rootNode: treeNodeType,
            listNodeType,
            sourceName,
            dataSource: [],
            treeData: [],
          },
          () => {
            // eslint-disable-next-line
            if (!!treeNodeType) {
              this.fetchTreeNode(sourceName, treeNodeType);
            } else {
              this.fetchTableList(sourceName, listNodeType, undefined);
            }
          }
        );
      }
    });
  };

  /**
   * return type:
   * - array -> give back the children data
   * - undefined -> no children data, then fetch a table list
   * - false -> error
   */
  fetchTreeNode = async (sourceName, type, code = undefined) => {
    const { response } = await request.get(
      toQs(toUrl(sourceTreeNodeApi, { id: sourceName }), { code, type })
    );
    if (response) {
      const isArray = Array.isArray(response);
      if (isArray) {
        // if code not exist, its the root tree-node
        if (!code) {
          this.setState({ treeData: response });
          return false;
        }
        if (response.length) {
          return response;
        }
        // undefined means no children
        return undefined;
      }
      return [];
    }
    return false;
  };

  fetchTableList = async (sourceName, type, code) => {
    const { response } = await request.get(
      toQs(toUrl(sourceTreeNodeApi, { id: sourceName }), { code, type })
    );
    if (response) {
      const listData = Array.isArray(response) ? response : [];
      this.setState({
        dataSource: listData,
      });
    }
    return undefined;
  };

  render() {
    const {
      sourceColumns,
      chosenHeight,
      operate,
      checkBox,
      multipleSelect = true,
      selectList = {},
    } = this.props;
    const { rootNode, treeData, dataSource } = this.state;
    // eslint-disable-next-line
    const offset = !!rootNode ? 2 : 0;
    // eslint-disable-next-line
    const span = !!rootNode ? 12 : 24;
    return (
      <Row gutter={8}>
        {!!rootNode && (
          <Col span={10}>
            <AsyncTree
              text="name"
              height={chosenHeight}
              rootNode={rootNode}
              asyncLoadTree={this.asyncLoadTree}
              asyncLoadList={this.asyncLoadList}
              dataSource={treeData}
              operate
            />
          </Col>
        )}
        <Col offset={offset} span={span}>
          <AsyncTable
            height={chosenHeight}
            columnsCfg={sourceColumns}
            dataSource={dataSource}
            onAdd={this.onAdd}
            operate={operate}
            checkBox={checkBox}
            multipleSelect={multipleSelect}
            selectList={selectList}
          />
        </Col>
      </Row>
    );
  }
}

export default SourceChosen;
