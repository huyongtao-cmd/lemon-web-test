import React from 'react';
import { Tree, Table, Row, Col, Button, Input, Switch } from 'antd';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import styles from './styles.less';

const { TreeNode } = Tree;
const { Search } = Input;

const TREE_KEY = 'id';
const TREE_TEXT = 'abilityName';
const RELATION = {
  table: 'abilityId',
  tree: 'id',
};

const fetchTreeApi = '/api/base/v1/abilities/:q/s';
const fetchTableApi = '/api/base/v1/capaAbilities/:capaId';
const updateMustFlag = '/api/base/v1/capaAbility/stat'; // patch
const deleteLine = '/api/base/v1/capaAbilities/{ids}/d'; // patch
const capaAbilitiesAdd = '/api/base/v1/capaAbilities'; // post

class ListTransferTable extends React.Component {
  state = {
    treeData: [],
    tableData: [],
    selectedRowKeys: [],
  };

  componentDidMount() {
    const { capaId } = this.props;
    capaId && this.fetchTable(capaId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchTable(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { capaId } = this.props;
    if (prevProps.capaId !== capaId) {
      return capaId;
    }
    return null;
  }

  fetchTable = capaId => {
    request.get(toUrl(fetchTableApi, { capaId })).then(({ response }) => {
      if (response && response.ok) {
        this.setState({
          tableData: Array.isArray(response.datum) ? response.datum : [],
        });
      }
    });
  };

  onCheck = (checkedKeys, e) => {
    this.setState({ checkedKeys });
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  onSearchChange = e => {
    const { value } = e.target;
    request.get(toUrl(fetchTreeApi, { q: value })).then(({ response }) => {
      if (response && response.ok) {
        this.setState({
          treeData: Array.isArray(response.datum) ? response.datum : [],
        });
      }
    });
  };

  onRight = () => {
    const { checkedKeys, treeData } = this.state;
    const { capaId } = this.props;
    const pickedData = treeData.filter(tree => checkedKeys.indexOf(`${tree.id}`) > -1).map(data => {
      const { id } = data;
      return {
        capaLevelId: capaId,
        abilityId: id,
        mustFlag: 1,
      };
    });
    request.post(capaAbilitiesAdd, { body: pickedData }).then(({ response }) => {
      response.ok && this.setState({ checkedKeys: [] }, () => this.fetchTable(capaId));
    });
  };

  onStatChange = (checked, record) => {
    request
      .patch(updateMustFlag, { body: { id: record.id, mustFlag: checked ? 1 : 0 } })
      .then(({ status }) => {
        if (status === 100) {
          // 主动取消请求
          return;
        }
        const { capaId } = this.props;
        this.fetchTable(capaId);
      });
  };

  onDelete = () => {
    const { selectedRowKeys } = this.state;
    request.patch(deleteLine.replace('{ids}', selectedRowKeys.join(','))).then(({ response }) => {
      const { capaId } = this.props;
      response.ok && this.setState({ selectedRowKeys: [] }, () => this.fetchTable(capaId));
    });
  };

  render() {
    const { height = 400 } = this.props;
    const { treeData, tableData, checkedKeys, selectedRowKeys } = this.state;
    const treesProps = {
      checkable: true,
      checkedKeys,
      onCheck: this.onCheck,
      style: {
        height,
      },
    };
    const tableProps = {
      rowKey: 'id',
      size: 'small',
      scroll: {
        y: 400,
      },
      columns: [
        {
          title: '编号',
          dataIndex: 'abilityNo',
          key: 'abilityNo',
          width: '10%',
        },
        {
          title: '能力支撑名称',
          dataIndex: 'abilityName',
          key: 'name',
          width: '35%',
        },
        {
          title: '获取条件',
          dataIndex: 'obtainCondition',
          key: 'dsc',
          width: '40%',
        },
        {
          title: '是否必需',
          dataIndex: 'mustFlag',
          key: 'mustFlag',
          width: '15%',
          render: (value, record, index) => (
            <Switch checked={!!value} onChange={checked => this.onStatChange(checked, record)} />
          ),
        },
      ],
      dataSource: tableData,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange,
      },
      bordered: true,
      pagination: false,
    };

    // tag:: 我们需要一个列表以供选中到表格上，所以套用了 Tree 这个组件，放了平级数据，所以 TreeNode 并没有做嵌套渲染，如果
    // 以后这里做了扩展，改变 这个渲染即可
    return (
      <Row className={styles.transfer}>
        <Col span={8} style={{ overflow: 'hidden' }}>
          <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={this.onSearchChange} />
          <Tree {...treesProps}>
            {treeData.map(item => {
              const includes = tableData.find(
                table => table[RELATION.table] === item[RELATION.tree]
              );
              return (
                <TreeNode key={item[TREE_KEY]} title={item[TREE_TEXT]} disabled={!!includes} />
              );
            })}
          </Tree>
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
          </div>
          <Table {...tableProps} style={{ height }} />
        </Col>
      </Row>
    );
  }
}

export default ListTransferTable;
