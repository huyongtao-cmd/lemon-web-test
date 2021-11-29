/* eslint-disable */
import React from 'react';
import { Button, Checkbox, Col, Dropdown, Menu, Row, Table, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { pickAll, values } from 'ramda';

import styles from './styles.less';
import SearchBar from './SearchBar';

const getRowClassName = (record, index) => {
  return index % 2 === 0 ? 'table-stripe-odd' : '';
};

function exportToCsv(filename, rows) {
  const processRow = row => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }

      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\ufeff';
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

/**
 * @author Rex.Guo
 */
class DataTable extends React.Component {
  componentDidMount() {
    const { searchBarForm } = this.props;
    const { queryParams } = this.state;

    let iniFilter = [];
    searchBarForm &&
      searchBarForm.forEach(f => {
        if (f.options && f.options.initialValue !== undefined) {
          iniFilter.push({
            [f.dataIndex]: f.options.initialValue,
          });
        }
      });
    const newQueryParams = Object.assign({}, queryParams, ...iniFilter);

    this.setState({
      queryParams: newQueryParams,
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.columns !== prevState.columns) {
      return nextProps.columns.map(c => {
        const target = prevState.columns.filter(pc => pc.dataIndex === c.dataIndex)[0];
        let visible = true;
        if (target) {
          visible = target.visible;
        }
        return {
          ...c,
          visible,
        };
      });
    }
    return null;
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = Object.assign({}, this.state.pagination);
    const { queryParams } = this.state;
    const { rowKey, onChange, sortDirection } = this.props;

    pager.current = pagination.current;
    pager.pageSize = pagination.pageSize;

    // console.log('------- sorter.field', sorter)
    // console.log('-------queryParams', queryParams)
    const newQueryParams = Object.assign({}, queryParams, {
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      sortBy: sorter.field || undefined,
      sortDirection: sorter.order && (sorter.order === 'descend' ? 'DESC' : 'ASC'),
      ...filters,
    });

    this.setState(
      {
        pagination: pager,
        queryParams: newQueryParams,
        selectedRowKeys: [],
        selectedRows: [],
      },
      () => {
        onChange && onChange(newQueryParams);
      }
    );
  };

  // 切换可见列下拉框
  handleColVisibleChange = flag => {
    this.setState({ colsSwitchVisible: flag });
  };

  // 控制可见列配置
  handleColsSwitch = dataIndex => {
    const { columns } = this.state;
    const { domain } = this.props;

    const newColumns = columns.slice();
    newColumns.forEach(c => {
      if (c.dataIndex === dataIndex) {
        c.visible = !(c.visible || c.visible === void 0);
      }
    });

    // Save columns to local storage
    localStorage.setItem(
      `tbl_col_${domain}`,
      JSON.stringify(
        newColumns.map(m => {
          return { dataIndex: m.dataIndex, visible: m.visible }; // 只存id，不存其他信息
        })
      )
    );

    this.setState({
      columns: newColumns,
    });
  };

  handleExport = () => {
    const { columns } = this.props;
    const { dataSource = [] } = this.props;
    const csvDataTitle = columns.map(column => column.title);
    const csvColumnKeys = columns.map(column => column.dataIndex);
    const csvDataContent = dataSource.map(data => values(pickAll(csvColumnKeys, data)));
    const csvData = [csvDataTitle, ...csvDataContent];
    exportToCsv('export.csv', csvData);
  };

  // 渲染可见列控制器
  renderColsSwitch = cols => {
    return cols.map(col => {
      return (
        <Menu.Item key={col.dataIndex}>
          <Checkbox
            disabled={this.state.queryParams.sortBy === col.dataIndex}
            defaultChecked={col.visible}
            onChange={this.handleColsSwitch.bind(this, col.dataIndex)}
          >
            {col.title}
          </Checkbox>
        </Menu.Item>
      );
    });
  };

  handleOnClickBtn = cb => () => {
    const { selectedRowKeys, selectedRows, queryParams } = this.state;
    cb(selectedRowKeys, selectedRows, queryParams);
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  // 渲染头部
  renderHeader = () => {
    const { selectedRowKeys, selectedRows, colsSwitchVisible, columns, queryParams } = this.state;
    const { showColumn, showSearch, leftButtons, rightButtons, showExport } = this.props;
    const menu = columns.length && <Menu>{this.renderColsSwitch(columns)}</Menu>;

    return (
      <Row>
        <Col span={20}>
          {showSearch !== false && (
            <Button
              size="large"
              key="search"
              className="tw-btn-primary"
              style={{ marginRight: 4, marginBottom: 4 }}
              onClick={this.handleSearch}
              icon="search"
            >
              查询
            </Button>
          )}
          {leftButtons &&
            leftButtons.map(b => {
              const btnDisabled =
                typeof b.disabled === 'function' ? b.disabled(selectedRows) : b.disabled;
              if (b.hidden) return null;
              if (b.minSelections === 1 && selectedRowKeys.length === 1) {
                return (
                  <Button
                    size="large"
                    key={b.key}
                    className={b.className}
                    disabled={btnDisabled}
                    type={b.type}
                    onClick={this.handleOnClickBtn(b.cb)}
                    style={{ marginRight: 4, marginBottom: 4 }}
                    loading={b.loading}
                    icon={b.icon}
                  >
                    {b.title}
                  </Button>
                );
              } else if (b.minSelections > 1 && selectedRowKeys.length >= 1) {
                return (
                  <Button
                    size="large"
                    key={b.key}
                    className={b.className}
                    disabled={btnDisabled}
                    type={b.type}
                    onClick={this.handleOnClickBtn(b.cb)}
                    style={{ marginRight: 4, marginBottom: 4 }}
                    loading={b.loading}
                    icon={b.icon}
                  >
                    {b.title}
                  </Button>
                );
              } else if (b.minSelections === 0) {
                return (
                  <Button
                    size="large"
                    key={b.key}
                    className={b.className}
                    disabled={btnDisabled}
                    type={b.type}
                    onClick={this.handleOnClickBtn(b.cb)}
                    style={{ marginRight: 4, marginBottom: 4 }}
                    loading={b.loading}
                    icon={b.icon}
                  >
                    {b.title}
                  </Button>
                );
              } else {
              }
            })}
          {selectedRowKeys.length > 0 && (
            <span key="total" style={{ fontSize: 12, marginLeft: 8 }}>
              选择了 {selectedRowKeys.length} 条记录
            </span>
          )}
        </Col>
        <Col span={4} className={styles.rightButtons}>
          {rightButtons &&
            rightButtons.map(b => {
              const btnDisabled =
                typeof b.disabled === 'function' ? b.disabled(selectedRows) : b.disabled;
              return b.hidden ? null : (
                <Tooltip key={b.key} placement="top" title={b.title}>
                  <Button
                    size="large"
                    loading={b.loading}
                    icon={b.icon}
                    disabled={btnDisabled}
                    style={{ marginRight: 4 }}
                    onClick={this.handleOnClickBtn(b.cb)}
                  />
                </Tooltip>
              );
            })}
          {showExport !== false && (
            <Tooltip key="download" placement="top" title="导出">
              <Button
                size="large"
                loading={false}
                icon="download"
                disabled={false}
                style={{ marginRight: 4 }}
                onClick={() => this.handleExport()}
              />
            </Tooltip>
          )}
          {showColumn !== false && (
            <Dropdown
              // getPopupContainer={() => document.getElementById('main')}
              overlay={menu}
              onVisibleChange={this.handleColVisibleChange}
              visible={colsSwitchVisible}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip placement="top" title={'显示列'}>
                <Button size="large" icon={'table'} />
              </Tooltip>
            </Dropdown>
          )}
        </Col>
      </Row>
    );
  };

  constructor(props) {
    super(props);
    this.searchBarRef = React.createRef();

    const { columns, limit, offset, domain, rowKey } = props;

    let newColumns = columns.slice();

    // Load column config
    const storedCol = JSON.parse(localStorage.getItem(`tbl_col_${domain}`));

    newColumns = newColumns.map(c => {
      const target = storedCol && storedCol.find(m => m.dataIndex === c.dataIndex);
      let visible = true;
      if (target) {
        visible = target.visible;
      }
      return {
        ...c,
        visible,
      };
    });

    // let sortParams = {};
    // const t = newColumns.filter(c => c.sorter)[0];

    // if (t) {
    //   sortParams.sortBy = t.dataIndex;
    //   sortParams.sortDirection = t.defaultSortOrder === 'descend' ? 'DESC' : 'ASC';
    // }

    this.state = {
      queryParams: {
        offset: parseInt(offset, 10) || 0,
        limit: parseInt(limit, 10) || 10,
        // sortBy: sortParams.sortBy || rowKey,
        // sortDirection: sortParams.sortDirection || 'ASC',
      },
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
        showTotal: total => `共 ${total} 条`,
        defaultPageSize: 10,
        defaultCurrent: 1,
        pageSize: parseInt(limit, 10) || 10,
        current: parseInt(offset, 10) / limit + 1 || 1,
        total: this.props.total,
        size: 'default',
      },
      columns: newColumns,
      colsSwitchVisible: false,
    };
  }

  // 处理搜索按钮
  handleSearch = () => {
    const formFields = this.searchBarRef.current.getFieldsValue();
    const { queryParams, pagination } = this.state;
    const pager = Object.assign({}, pagination);
    pager.current = 1; // 回到第一页
    pager.pageSize = pagination.pageSize;
    const newQueryParams = Object.assign({}, queryParams, {
      offset: 0, // 回到第一页
      ...formFields,
    });
    this.setState(
      {
        pagination: pager,
        queryParams: newQueryParams,
        selectedRowKeys: [],
        selectedRows: [],
      },
      () => {
        this.props.onChange(newQueryParams);
      }
    );
  };

  handleOnRow = record => {
    const { selectedRowKeys, selectedRows } = this.state;
    const rk = this.props.rowKey;
    return {
      onDoubleClick: () => {
        const found = selectedRowKeys.filter(key => key === record[rk]).length > 0;
        if (found) {
          this.setState({
            selectedRowKeys: selectedRowKeys.filter(key => key !== record[rk]),
            selectedRows: selectedRows.filter(row => row[rk] !== record[rk]),
          });
        } else {
          this.setState({
            selectedRowKeys: [...selectedRowKeys, record[rk]],
            selectedRows: [...selectedRows, record],
          });
        }
      },
    };
  };

  onSearchBarChange = params => {
    const { queryParams } = this.state;

    if (this.props.onSearchBarChange) {
      this.props.onSearchBarChange(params, { ...queryParams, ...params });
    }
    this.setState({
      queryParams: { ...queryParams, ...params },
    });
  };

  render() {
    const {
      onRowChecked,
      onChange, // remove props.onChange
      rowSelection,
      dataSource,
      searchBarForm,
      enableSelection,
      ...tableProps
    } = this.props;

    const { pagination, selectedRowKeys, columns } = this.state;
    let visibleColumns = columns.filter(c => c.visible !== false);

    // console.log(columns);

    pagination.total = this.props.total;
    const elRowSelection = {
      type: 'checkbox',
      selectedRowKeys, // 不要覆盖
      onChange: (selectedRowKeys, selectedRows) => {
        typeof onRowChecked === 'function' && onRowChecked(selectedRowKeys, selectedRows);
        // 不要覆盖
        this.setState({
          selectedRowKeys,
          selectedRows,
        });
      },
    };

    return (
      <div>
        {searchBarForm && (
          <SearchBar
            wrappedComponentRef={this.searchBarRef}
            onSearchBarSearch={this.handleSearch}
            onSearchBarChange={this.onSearchBarChange}
            searchBarForm={searchBarForm}
          />
        )}
        <div style={{ backgroundColor: 'white', borderRadius: 5 }}>
          <div style={{ padding: '10px 24px 0' }}>{this.renderHeader()}</div>
          <div style={{ padding: '10px 24px' }}>
            <Table
              // title={this.renderHeader}
              className={styles.table}
              bordered
              size="small"
              onChange={this.handleTableChange}
              dataSource={dataSource}
              pagination={pagination}
              rowSelection={
                enableSelection === false ? null : { ...elRowSelection, ...rowSelection }
              }
              onRow={this.handleOnRow}
              rowClassName={getRowClassName}
              {...tableProps}
              columns={visibleColumns}
            />
          </div>
        </div>
      </div>
    );
  }
}

DataTable.propTypes = {
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  onChange: PropTypes.func,
  dataSource: PropTypes.array.isRequired,
  total: PropTypes.number,
  // loading: PropTypes.bool.isRequired,
  domain: PropTypes.string.isRequired,
  searchBarForm: PropTypes.array,
  onSearchBarChange: PropTypes.func,
  enableSelection: PropTypes.bool,
};

export default DataTable;
