import React from 'react';
import { Modal, Row, Col, Tree, Input } from 'antd';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import styles from './index.less';

const { TreeNode } = Tree;
const { Search } = Input;
/**
 * 项目列表 单选
 */
class ResModal extends React.Component {
  state = {
    selectedRowKeys: [],
    selectedRows: null,
    expandedKeys: [],
    autoExpandParent: false,
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'resNo', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch, domain } = this.props;
    dispatch({
      type: `${domain}/queryModalList`,
      payload: { ...params, resStatus: '3' }, // 资源状态为已认证
    });
  };

  // 双击选中行
  handleOnRow = record => {
    const { selectedRowKeys, selectedRows } = this.state;
    return {
      onDoubleClick: () => {
        const found = selectedRowKeys.filter(key => key === record.id).length > 0;
        if (found) {
          this.setState({
            selectedRowKeys: selectedRowKeys.filter(key => key !== record.id),
            selectedRows: selectedRows.filter(row => row.id !== record.id),
          });
        } else {
          this.setState({
            selectedRowKeys: [record.id],
            selectedRows: [record],
          });
        }
      },
    };
  };

  // 点击确定按钮保存
  handleSave = e => {
    const { onOk, rowSelection = {}, tableRowKey, multiple = false } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    if (!selectedRowKeys.length) {
      createMessage({ type: 'error', description: '至少选择一条数据' });
      return;
    }
    if (multiple) {
      for (let i = 0; i < selectedRows.length; i += 1) {
        if (rowSelection.selectedRowKeys.includes(selectedRows[i][tableRowKey])) {
          selectedRows.splice(i, 1);
        }
      }
      onOk.apply(this.state, [e, selectedRowKeys, selectedRows]);
    } else {
      onOk.apply(this.state, [e, selectedRowKeys[0], selectedRows[0]]);
    }

    this.setState({
      selectedRowKeys: [],
      selectedRows: null,
    });
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel } = this.props;
    onCancel.apply(this.state, [e]);
  };

  // onSelect = selectedKeys => {
  //   const { fetchData } = this.props;
  //   fetchData({ id: selectedKeys });
  // };
  // 现在用的多选，单选时再进行进一步的优化
  onCheck = selectedKeys => {
    const { fetchData } = this.props;
    fetchData({ id: selectedKeys });
  };

  tableProps = () => {
    const {
      dataSource,
      loading,
      total,
      domain,
      tableColumns = [],
      searchBarForm = null,
      multiple = false,
      tableRowKey,
      rowSelection = {},
    } = this.props;
    const selectType = multiple ? 'checkbox' : 'radio';
    const { selectedRowKeys = [] } = this.state;
    return {
      rowKey: tableRowKey,
      domain, // 必填 用于本地缓存表格的列配置
      loading,
      dataSource,
      total,
      showColumn: false, // 是否显示右侧列配置按钮
      onRow: this.handleOnRow,
      showSearch: searchBarForm || (searchBarForm && searchBarForm.length > 0),
      showExport: false,
      rowSelection: {
        type: selectType,
        onChange: (rowKey, rows) => {
          this.setState({
            selectedRowKeys: rowKey,
            selectedRows: rows,
          });
        },
        ...rowSelection,
        selectedRowKeys:
          rowSelection && rowSelection.selectedRowKeys
            ? selectedRowKeys.concat(rowSelection.selectedRowKeys)
            : selectedRowKeys,
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm,
      columns: tableColumns,
      rightButtons: [],
      leftButtons: [
        // {
        //   key: 'add',
        //   className: 'tw-btn-primary',
        //   title: '选择',
        //   loading: false,
        //   hidden: false,
        //   disabled: !(selectedRowKeys && selectedRowKeys.length > 0),
        //   minSelections: 0,
        //   cb: () => {
        //     this.handleSave();
        //   },
        // },
      ],
    };
  };

  render() {
    const { visible, title, treeData = [], searchContent = <></>, checkable = true } = this.props;
    const { expandedKeys, autoExpandParent } = this.state;

    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        onOk={this.handleSave}
        onCancel={this.onToggle}
        width="80%"
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)' }}
      >
        <Row className={styles['modal-content']}>
          <Col
            span={6}
            style={{
              borderRight: '2px solid rgb(240, 242, 245) ',
            }}
          >
            <div className={styles['modal-content-tree']}>
              <TreeSearch
                showSearch
                placeholder="请输入关键字"
                treeData={treeData}
                // onSelect={this.onSelect}
                onCheck={this.onCheck}
                // defaultExpandedKeys={treeData.map(item => `${item.id}`)}
                checkable={checkable}
                onSelect={checkable ? () => {} : this.onCheck}
              />
            </div>
          </Col>
          <Col
            span={18}
            style={{
              borderLeft: '2px solid rgb(240, 242, 245) ',
            }}
          >
            <div className={styles['modal-content-table']}>
              {searchContent}
              <DataTable {...this.tableProps()} />
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ResModal;
