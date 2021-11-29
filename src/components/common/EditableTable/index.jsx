import React from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Form, Input, Popconfirm, Row, Table } from 'antd';
import styles from './styles.less';
import { getGuid } from '@/utils/stringUtils';

// 获得Table样式
const getRowClassName = (record, index) => (index % 2 === 0 ? 'table-stripe-odd' : '');

// 上下文
const EditableContext = React.createContext();

// 行编辑 - 一行
const EditableFormRow = Form.create()(({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
));

// 行编辑 - 一格
const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  field,
  formatter,
  decorator,
  ...restProps
}) => (
  <EditableContext.Consumer>
    {form => {
      const { getFieldDecorator } = form;
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator(
                dataIndex,
                Object.assign(decorator || {}, {
                  initialValue:
                    typeof formatter === 'function'
                      ? formatter(record, dataIndex)
                      : record && record[dataIndex],
                })
              )(field || <Input value={record[dataIndex]} placeholder={`请输入${title}`} />)}
            </Form.Item>
          ) : (
            restProps.children
          )}
        </td>
      );
    }}
  </EditableContext.Consumer>
);

/**
 * 行编辑表格
 * @author Rex.Guo && Richard.Cheng
 */
class EditableTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editingKey: '',
      lastAddKey: '',
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
    const newId = onAdd(newData);
    newId && this.edit(newId);
    this.setState({ lastAddKey: newId });
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
  };

  // 渲染表头
  renderHeader = () => {
    const { selectedRowKeys, editingKey } = this.state;
    const { showAdd, showCopy, showDelete, readOnly, buttons, rowSelection } = this.props;

    const mySelectedRowKeys = rowSelection ? rowSelection.selectedRowKeys : selectedRowKeys;

    if (readOnly) {
      return null;
    }
    return (
      <Row>
        <Col span={16}>
          {showAdd !== false &&
            !editingKey && (
              <Button key="add" className="tw-btn-primary" onClick={this.onAddItem}>
                新增
              </Button>
            )}
          {mySelectedRowKeys.length > 0 && [
            showCopy !== false && (
              <Button
                key="copy"
                className="tw-btn-error"
                style={{ marginLeft: 8 }}
                onClick={this.onCopyItem}
              >
                复制
              </Button>
            ),
            <Popconfirm
              key="delete"
              title="确定要删除这些记录么?"
              placement="top"
              onConfirm={this.onDeleteItems}
            >
              {showDelete !== false && (
                <Button className="tw-btn-error" style={{ marginLeft: 8 }}>
                  删除
                </Button>
              )}
            </Popconfirm>,
          ]}
          {buttons &&
            buttons.map(b => {
              if (b.minSelections === 1 && mySelectedRowKeys.length === 1) {
                return (
                  !b.hidden && (
                    <Button
                      key={b.key}
                      type={b.type}
                      className={b.className}
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
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <small style={{ whiteSpace: 'nowrap' }}>选择了 {mySelectedRowKeys.length} 条记录</small>
        </Col>
      </Row>
    );
  };

  // 获得编辑状态
  getEditState = record => {
    const { ...tableProps } = this.props;
    const { rowKey } = tableProps;
    return record[rowKey] === this.state.editingKey; // eslint-disable-line
  };

  // 取消编辑状态
  cancelEditState = key => {
    this.setState({ editingKey: '' });
    const { lastAddKey } = this.state;
    if (lastAddKey === key) {
      const { onDeleteItems } = this.props;
      // 删除刚新增的数据。(只可能有一条 - 调用者可以通过第二个参数是否为null判断是行新增。)
      onDeleteItems([key], null);
    }
  };

  // 编辑
  edit(key) {
    this.setState({ editingKey: key });
  }

  render() {
    const { columns, rowSelection, onSave, ...tableProps } = this.props;
    const { selectedRowKeys } = this.state;
    const { rowKey } = tableProps;

    const elRowSelection = {
      selectedRowKeys: rowSelection ? rowSelection.selectedRowKeys : selectedRowKeys,
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

    const cols = [
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          const editable = this.getEditState(record);
          return (
            <>
              {editable ? (
                <>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:;" // eslint-disable-line
                        onClick={() =>
                          // 保存成功了需要返回true让状态刷新。
                          onSave(form, record, index) &&
                          this.setState({ editingKey: '', lastAddKey: '' })
                        }
                        style={{ marginRight: 8 }}
                      >
                        保存
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="确定吗?"
                    onConfirm={() => this.cancelEditState(record[rowKey])}
                  >
                    <a>取消</a>
                  </Popconfirm>
                </>
              ) : (
                <a onClick={() => this.edit(record[rowKey])}>编辑</a>
              )}
            </>
          );
        },
      },
    ]
      .concat(columns)
      .map(col => {
        const colData = {
          ...col,
          title: col.required ? (
            <span className="ant-form-item-required">{col.title}</span>
          ) : (
            col.title
          ),
        };
        if (!col.editable) {
          return colData;
        }
        return {
          ...colData,
          onCell: record => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            field: col.field, // 编辑时需要输入的字段
            value: col.value, // @deprecated
            formatter: col.formatter, // 格式化编辑输入
            decorator: col.decorator, // 表单设置
            editing: this.getEditState(record),
          }),
        };
      });

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    return (
      <div style={{ backgroundColor: 'white', borderRadius: 5 }}>
        <Table
          footer={this.renderHeader}
          className={styles.table}
          bordered
          rowKey="id"
          size="small"
          columns={cols}
          pagination={false}
          rowClassName={getRowClassName}
          rowSelection={{ ...elRowSelection }}
          components={components}
          {...tableProps}
        />
      </div>
    );
  }
}

EditableTable.propTypes = {
  rowKey: PropTypes.string.isRequired,
  dataSource: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onCopyItem: PropTypes.func,
  onDeleteItems: PropTypes.func,
  buttons: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
};

EditableTable.defaultProps = {
  readOnly: false,
  onAdd: undefined,
  onCopyItem: undefined,
  onDeleteItems: undefined,
};

export default EditableTable;
