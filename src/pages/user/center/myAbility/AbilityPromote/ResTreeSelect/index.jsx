import React from 'react';
import { Modal, Row, Col, Tree, Input, Form, Divider, Button } from 'antd';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import styles from './index.less';
import FieldList from '@/components/layout/FieldList';

const { Field, FieldLine } = FieldList;

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
    selectQuery: {},
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
    const { onOk, rowSelection = {}, tableRowKey } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    if (!selectedRowKeys.length) {
      createMessage({ type: 'error', description: '至少选择一条数据' });
      return;
    }
    for (let i = 0; i < selectedRows.length; i += 1) {
      if (rowSelection.selectedRowKeys.includes(selectedRows[i][tableRowKey])) {
        selectedRows.splice(i, 1);
      }
    }

    onOk.apply(this.state, [e, selectedRowKeys, selectedRows]);
    this.setState({
      selectedRowKeys: [],
      selectedRows: null,
      expandedKeys: [],
      autoExpandParent: false,
      selectQuery: {},
    });
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel } = this.props;
    onCancel.apply(this.state, [e]);
    this.setState({
      selectedRowKeys: [],
      selectedRows: null,
      expandedKeys: [],
      autoExpandParent: false,
      selectQuery: {},
    });
  };

  // onSelect = selectedKeys => {
  //   const { fetchData } = this.props;
  //   fetchData({ id: selectedKeys });
  // };
  // 现在用的多选，单选时再进行进一步的优化
  onCheck = selectedKeys => {
    const { queryData } = this.props;
    const { selectQuery } = this.state;
    queryData({ ...selectQuery, id: selectedKeys });
    this.setState({
      selectQuery: {
        ...selectQuery,
        id: selectedKeys,
      },
    });
  };

  handleChange = event => {
    const { selectQuery } = this.state;
    this.setState({
      selectQuery: {
        ...selectQuery,
        text: event.target.value,
      },
    });
  };

  handleQuery = () => {
    const { selectQuery } = this.state;
    const { queryData } = this.props;
    if (selectQuery && selectQuery.text) {
      queryData(selectQuery);
    } else {
      createMessage({ type: 'error', description: '请输入能力名称' });
    }
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
    const { visible, title, treeData = [] } = this.props;
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
          <Col span={6}>
            <div>
              <TreeSearch
                showSearch
                placeholder="请输入关键字"
                treeData={treeData}
                // onSelect={this.onSelect}
                onCheck={this.onCheck}
                // defaultExpandedKeys={treeData.map(item => `${item.id}`)}
                checkable
              />
            </div>
          </Col>
          <Col span={1} />
          <Col span={17}>
            <div className={styles.content}>
              <Row>
                <Col xs={2} />
                <Col xs={20}>
                  <Form.Item
                    style={{ margin: '14px  auto' }}
                    label="能力名称"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  >
                    <Input
                      onChange={this.handleChange}
                      onPressEnter={this.handleQuery}
                      style={{ width: '60%' }}
                    />
                    <Button
                      className="tw-btn-primary"
                      style={{ marginLeft: '10px', marginBottom: 0 }}
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      onClick={this.handleQuery}
                    >
                      查询
                    </Button>
                  </Form.Item>
                </Col>
                <Col xs={2} />
              </Row>
              <div style={{ width: '95%', margin: '0 auto' }}>
                <Divider dashed />
              </div>
              <DataTable {...this.tableProps()} />
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ResModal;
