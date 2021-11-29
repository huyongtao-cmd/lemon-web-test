import React from 'react';
import PropTypes from 'prop-types';

import Schema from 'async-validator';

import { Button, Col, Popconfirm, Row, Table } from 'antd';
import { equals, type, isNil, isEmpty } from 'ramda';
import styles from './styles.less';
import { getGuid } from '@/utils/stringUtils';

const getRowClassName = (record, index) => (index % 2 === 0 ? 'table-stripe-odd' : '');

/**
 * @author Rex.Guo
 */
class EditableDataTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  onAddItem = () => {
    const { columns, onAdd, rowKey } = this.props;
    const newData = {};
    columns.forEach(item => {
      newData[item.dataIndex] = null;
    });
    newData[rowKey || 'id'] = getGuid('new');
    onAdd(newData);
  };

  onDeleteItems = () => {
    const { onDeleteItems } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onDeleteItems(selectedRowKeys, selectedRows);

    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  onCopyItem = () => {
    const { dataSource, rowKey, onCopyItem } = this.props;
    const { selectedRowKeys } = this.state;

    const copied = [];
    selectedRowKeys.forEach(keyValue => {
      let newData = dataSource.filter(row => row[rowKey] === keyValue)[0];
      newData = Object.assign({}, newData);
      newData[rowKey] = getGuid('copied');
      copied.push(newData);
    });
    onCopyItem(copied);
  };

  handleOnClickBtn = cb => () => {
    const { selectedRowKeys, selectedRows } = this.state;
    cb(selectedRowKeys, selectedRows);
    // this.setState({
    //   selectedRowKeys: [],
    //   selectedRows: [],
    // });
  };

  handleOnClickLeftBtn = (cb, selectedRows, selectedRowKeys, queryParams) => {
    cb && cb(selectedRowKeys, selectedRows, queryParams);
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  };

  renderFooter = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    const { showAdd, showCopy, showDelete, readOnly, buttons, rowSelection } = this.props;

    const mySelectedRowKeys =
      rowSelection && rowSelection.selectedRowKeys ? rowSelection.selectedRowKeys : selectedRowKeys;

    if (readOnly) {
      return null;
    }
    return (
      <Row>
        <Col span={16}>
          {showAdd !== false && (
            <Button key="add" className="tw-btn-primary" onClick={this.onAddItem}>
              新增
            </Button>
          )}
          {mySelectedRowKeys.length > 0 &&
            showCopy !== false && (
              <Button
                key="copy"
                className="tw-btn-error"
                style={{ marginLeft: 8 }}
                onClick={this.onCopyItem}
              >
                复制
              </Button>
            )}
          {buttons &&
            buttons.map(b => {
              const btnDisabled =
                typeof b.disabled === 'function' ? b.disabled(selectedRows) : b.disabled;
              if (b.minSelections === 1 && mySelectedRowKeys.length === 1) {
                return (
                  !b.hidden && (
                    <Button
                      key={b.key}
                      type={b.type}
                      className={b.className}
                      disabled={btnDisabled}
                      onClick={this.handleOnClickBtn(b.cb)}
                      style={{ marginLeft: 8 }}
                      loading={b.loading}
                      icon={b.icon}
                    >
                      {b.title}
                    </Button>
                  )
                );
              }
              if (b.minSelections > 1 && mySelectedRowKeys.length >= 1) {
                return (
                  !b.hidden && (
                    <Button
                      key={b.key}
                      type={b.type}
                      className={b.className}
                      disabled={btnDisabled}
                      onClick={this.handleOnClickBtn(b.cb)}
                      style={{ marginLeft: 8 }}
                      loading={b.loading}
                      icon={b.icon}
                    >
                      {b.title}
                    </Button>
                  )
                );
              }
              if (b.minSelections === 0) {
                return (
                  !b.hidden && (
                    <Button
                      key={b.key}
                      type={b.type}
                      className={b.className}
                      disabled={btnDisabled}
                      onClick={this.handleOnClickBtn(b.cb)}
                      style={{ marginLeft: 8 }}
                      loading={b.loading}
                      icon={b.icon}
                    >
                      {b.title}
                    </Button>
                  )
                );
              }
              return null;
            })}
          {showDelete !== false && !mySelectedRowKeys.length ? (
            <Button
              disabled={!mySelectedRowKeys.length}
              className="tw-btn-error"
              style={{ marginLeft: 8 }}
            >
              删除
            </Button>
          ) : (
            <Popconfirm
              key="delete"
              title="确定要删除这些记录么?"
              placement="top"
              onConfirm={this.onDeleteItems}
            >
              {showDelete !== false && (
                <Button
                  disabled={!mySelectedRowKeys.length}
                  className="tw-btn-error"
                  style={{ marginLeft: 8 }}
                >
                  删除
                </Button>
              )}
            </Popconfirm>
          )}
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12 }}>选择了 {mySelectedRowKeys.length} 条记录</span>
        </Col>
      </Row>
    );
  };

  // 渲染头部
  renderHeader = () => {
    const { selectedRowKeys, selectedRows, columns = [], queryParams } = this.state;
    const {
      showColumn = true,
      showSearch = true,
      showExport = true,
      leftButtons = [],
      rightButtons = [],
    } = this.props;

    return (
      <Row>
        <Col span={20}>
          {leftButtons.map(b => {
            const btnDisabled = equals(type(b.disabled), 'Function')
              ? b.disabled(selectedRows)
              : b.disabled;
            if (b.hidden) return null;
            // 单选
            const singleSelection = b.minSelections === 1 && selectedRowKeys.length === 1;
            // 多选
            const multiSelection = b.minSelections > 1 && selectedRowKeys.length >= 1;
            // 常驻
            const alwaysSelection = b.minSelections === 0;
            // 满足其中一个即可显示
            if (singleSelection || multiSelection || alwaysSelection) {
              return (
                <Button
                  size={b.size ? b.size : 'large'}
                  key={b.key}
                  className={b.className}
                  disabled={btnDisabled}
                  type={b.type}
                  onClick={() =>
                    this.handleOnClickLeftBtn(b.cb, selectedRows, selectedRowKeys, queryParams)
                  }
                  style={{ marginRight: 4, marginBottom: 4 }}
                  loading={b.loading}
                  icon={b.icon}
                >
                  {b.title}
                </Button>
              );
            }
            return null;
          })}
        </Col>
      </Row>
    );
  };

  render() {
    const { readOnly, columns, rowSelection, leftButtons = [], ...tableProps } = this.props;
    const { selectedRowKeys } = this.state;

    const elRowSelection = {
      ...rowSelection, // 扩展
      selectedRowKeys:
        rowSelection && rowSelection.selectedRowKeys
          ? rowSelection.selectedRowKeys
          : selectedRowKeys,
      onChange: (_selectedRowKeys, _selectedRows) => {
        this.setState({
          selectedRowKeys: _selectedRowKeys,
          selectedRows: _selectedRows,
        });
        rowSelection &&
          rowSelection.onChange &&
          rowSelection.onChange(_selectedRowKeys, _selectedRows);
      },
    };

    const cols = columns.filter(col => col.hidden !== true).map(col => ({
      ...col,
      title: col.required ? <span className="ant-form-item-required">{col.title}</span> : col.title,
      render: (value, row, index) => {
        // if (readOnly || col.readOnly) {
        //   return <span>{value}</span>;
        // }

        // console.log({ [col.dataIndex]: col.options && col.options.rules && col.options.rules });

        let valid = true;
        let msg = '';

        if (col.options && col.options.rules) {
          const validator = new Schema({
            [col.dataIndex]: col.options && col.options.rules && col.options.rules,
          });
          validator.validate({ [col.dataIndex]: value }, (errors, fields) => {
            if (errors) {
              valid = false;
              msg = errors[0].message;
            }
          });
        }

        return col.render ? (
          <div className={valid ? '' : 'ant-form-item-control has-error'}>
            {col.render(value, row, index)}
            <div hidden={valid} className="ant-form-explain">
              {msg}
            </div>
          </div>
        ) : (
          <span>{value}</span>
        );
      },
    }));

    return (
      <div style={{ backgroundColor: 'white', borderRadius: 5 }}>
        <div style={{ padding: '10px 24px 0' }}>{this.renderHeader()}</div>
        <div style={{ padding: !isEmpty(leftButtons) ? '10px 24px' : '0' }}>
          <Table
            footer={this.renderFooter}
            className={styles.table}
            bordered
            rowKey="id"
            size="small"
            columns={cols}
            pagination={false}
            rowClassName={getRowClassName}
            rowSelection={readOnly ? null : { ...elRowSelection }}
            {...tableProps}
          />
        </div>
      </div>
    );
  }
}

EditableDataTable.propTypes = {
  rowKey: PropTypes.string.isRequired,
  dataSource: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  onCopyItem: PropTypes.func,
  onDeleteItems: PropTypes.func,
  buttons: PropTypes.array,
  readOnly: PropTypes.bool,
  leftButtons: PropTypes.array,
};

EditableDataTable.defaultProps = {
  buttons: [],
  readOnly: false,
  onAdd: undefined,
  onCopyItem: undefined,
  onDeleteItems: undefined,
  leftButtons: [],
};

export default EditableDataTable;
