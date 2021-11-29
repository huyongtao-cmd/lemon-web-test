import React from 'react';
import { Table, Button } from 'antd';
import { omit } from 'ramda';

class AsyncTable extends React.Component {
  state = {
    dataSource: [],
    selectedRowKeys: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.dataSource !== prevState.dataSource) {
      return {
        dataSource: nextProps.dataSource || [],
      };
    }
    return null;
  }

  onSelect = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys });
  };
  // 右侧选择框

  onSelectBox = listData => {
    const selectedRows = new Array(listData);
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(selectedRows);
    }
  };

  handleSelect = () => {
    const { dataSource, selectedRowKeys } = this.state;
    // const selectedRows = selectedRowKeys.map(data => dataSource[data]);
    const selectedRows = selectedRowKeys.map(data => JSON.parse(data));
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(selectedRows);
    }
    this.setState({ selectedRowKeys: [] });
  };

  columnsCompile = operate => {
    const { columnsCfg, multipleSelect = true, selectList = {} } = this.props;
    const singleChoseBtnDisable =
      !multipleSelect && selectList && Object.keys(selectList).length > 0;
    // eslint-disable-next-line
    const columns = columnsCfg.map(cfg => {
      return {
        key: cfg.dataIndex,
        ...cfg,
        width: '28%',
      };
    });
    return operate && operate === 'checked'
      ? [
          ...columns,
          {
            key: 'asyncOperate',
            title: '选择操作',
            dataIndex: 'asyncOperate',
            width: '16%',
            render: (a, b, c) => (
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  disabled={singleChoseBtnDisable}
                  onClick={() => {
                    this.onSelectBox(b);
                  }}
                >
                  选择
                </Button>
              </div>
            ),
          },
        ]
      : columns;
  };

  render() {
    const { height, operate, checkBox = true } = this.props;
    const { dataSource, selectedRowKeys } = this.state;
    // bind the props, control its in the Component.
    const omitProps = omit([...Object.keys(this.state), 'height', 'operate'], this.props);
    const tableProps1 = {
      // rowKey: 'id',
      rowKey: record => JSON.stringify(record),
      scroll: { y: 500 },
      dataSource,
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys,
        onChange: this.onSelect,
      },
      columns: this.columnsCompile(operate),
      bordered: true,
      // scroll: { y: height }, // modal scroll， bind this height
      pagination: false,
      ...omitProps,
    };
    const tableProps2 = {
      // rowKey: 'id',
      rowKey: record => JSON.stringify(record),
      scroll: { y: 500 },
      dataSource,
      columns: this.columnsCompile(operate),
      bordered: true,
      // scroll: { y: height }, // modal scroll， bind this height
      pagination: false,
      ...omitProps,
    };
    const tableProps = checkBox ? tableProps1 : tableProps2;
    return (
      <>
        {checkBox ? (
          <Button
            className="tw-btn-primary"
            style={{ marginBottom: 8 }}
            disabled={!selectedRowKeys.length}
            onClick={this.handleSelect}
          >
            选择
          </Button>
        ) : (
          ''
        )}
        <Table {...tableProps} />
      </>
    );
  }
}

export default AsyncTable;
