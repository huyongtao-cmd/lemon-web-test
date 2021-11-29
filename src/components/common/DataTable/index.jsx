import React from 'react';
import { Button, Checkbox, Col, Dropdown, Menu, Row, Table, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { equals, type, isNil, isEmpty } from 'ramda';

import styles from './styles.less';
import SearchBar from './SearchBar';

import {
  compileCsvData,
  exportToCsv,
  getColumnsVisibly,
  setColumnsVisibly,
  makeRandomKey,
  findRowsByKeys,
} from './_utils';

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

/**
 * @author Rex.Guo
 * @refactor Mouth.Guo
 */
class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.searchBarRef = React.createRef();
    const {
      rowKey,
      dataSource = [],
      columns,
      limit,
      offset,
      sortBy,
      sortDirection,
      columnsCache,
      total,
      showColumn = true,
      // searchForm caching searchBarForm at past, now its more powerful to caching pagination and selectedRowKeys :)
      searchForm = {},
    } = props;
    // tag :: combine columns' visibility props from cache
    const enableCache = showColumn && !isNil(columnsCache);
    if (!enableCache) {
      // add a friendly console
      // eslint-disable-next-line
      console.warn('[DataTable] - if you find no cache in the table,');
      // eslint-disable-next-line
      console.warn('`showColumn` is the first step, `columnsCache` must be confirmed.');
    }
    const columnsVisibilityRendered = enableCache
      ? getColumnsVisibly(columnsCache, columns)
      : columns;

    const parseOffset = searchForm.offset || parseInt(offset, 10) || 0;
    const parseLimit = searchForm.limit || parseInt(limit, 10) || 10;
    const current = parseOffset / parseLimit + 1 || 1;

    this.state = {
      queryParams: {
        offset: parseOffset,
        limit: parseLimit,
        sortBy: searchForm.sortBy || sortBy,
        sortDirection: searchForm.sortDirection || sortDirection,
      },
      selectedRowKeys: searchForm.selectedRowKeys || [],
      selectedRows: findRowsByKeys(rowKey, searchForm.selectedRowKeys, dataSource),
      pagination: {
        ...defaultPagination,
        pageSize: parseLimit,
        current,
        total,
      },
      columns: columnsVisibilityRendered,
      // resolve update cache,
      // point 1: columns change -> search 'tag :: point 1'
      // point 2: onChange -> includes dataSource,pagination,sorter,searchBarForm
      //  2-1 -> search 'tag : point 2-1'
      //  2-2 -> search 'tag : point 2-2'
      dynamicKey: undefined,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { columns = [], total, pagination, rowKey, dataSource = [], searchForm } = nextProps;
    const modifiedState = {};
    // combine columns visibility
    const nextVisibilityCols = columns.map(({ visible, ...rest }) => ({
      visible: !!visible,
      ...rest,
    }));
    const prevVisibilityCols = prevState.columns.map(({ visible, ...rest }) => ({
      visible: !!visible,
      ...rest,
    }));
    if (!equals(nextVisibilityCols, prevVisibilityCols)) {
      const columnsVisibilityRendered = columns.map(col => {
        const prevCol = prevState.columns.find(({ dataIndex }) => equals(dataIndex, col.dataIndex));
        return {
          ...col,
          visible: isNil(prevCol) ? true : !equals(prevCol.visible, false),
        };
      });
      modifiedState.columns = columnsVisibilityRendered;
    }
    // combine pagination
    if (type(pagination) === 'Boolean') modifiedState.pagination = false;
    else {
      let modifiedPagination = {};
      let modifiedQueryParams = {};
      if (!isNil(total) && total !== prevState.pagination.total) {
        modifiedPagination.total = total;
        // if total change , reset selectedRowKeys. it fix closeThenGoTo ...
        modifiedState.selectedRowKeys = [];
        modifiedState.selectedRows = [];
      }

      if (isNil(searchForm)) {
        // no searchForm props provided, nothing to do
      } else if (isNil(searchForm.offset)) {
        // when tab change back and click menu, its become initial -> undefined
        modifiedPagination = { ...modifiedPagination, current: 1, pageSize: 10 };
        modifiedQueryParams = { offset: 0, limit: 10 };
      } else {
        modifiedPagination = {
          ...modifiedPagination,
          current: searchForm.offset / searchForm.limit + 1,
          pageSize: searchForm.limit,
        };
        modifiedQueryParams = { offset: searchForm.offset, limit: searchForm.limit };
      }
      modifiedState.pagination = { ...prevState.pagination, ...modifiedPagination };
      modifiedState.queryParams = { ...prevState.queryParams, ...modifiedQueryParams };
    }
    // combine selectedRowKeys
    if (
      !isNil(searchForm) && // no searchForm props provided, nothing to do
      !isNil(searchForm.selectedRowKeys) &&
      searchForm.selectedRowKeys !== prevState.selectedRowKeys
    ) {
      const selectedRows = findRowsByKeys(rowKey, searchForm.selectedRowKeys, dataSource);
      modifiedState.selectedRowKeys = searchForm.selectedRowKeys;
      modifiedState.selectedRows = selectedRows;
    }

    // ---- unbelievable bug ----
    // fix dynamic columns cache
    // tag :: point 1
    if (columns.length !== prevState.columns.length) {
      modifiedState.dynamicKey = makeRandomKey();
    }

    if (isEmpty(modifiedState)) return null;
    return modifiedState;
  }

  componentDidMount() {
    if (this.searchBarRef.current) {
      // 如果有 searchBarForm 的话
      // tab切回来的时候，组装之前存在 redux 里面的查询数据
      const { queryParams } = this.state;
      const searchFormFields = this.searchBarRef.current.getFieldsValue();
      this.setState({ queryParams: { ...queryParams, ...searchFormFields } });
    }
  }

  // 控制可见列配置
  handleColsSwitch = (dataIndex, visible) => {
    const { columns } = this.state;
    const { columnsCache, showColumn = true } = this.props;

    // 切换 state 里存储的对应列 visible 状态
    const columnsVisibilityRendered = columns.map(col => {
      if (!equals(col.dataIndex, dataIndex)) return col;
      return { ...col, visible };
    });

    // Save columns to local storage
    // tag :: store columns' visibility props into cache
    const enableCache = showColumn && !isNil(columnsCache);
    enableCache && setColumnsVisibly(columnsCache, columnsVisibilityRendered);

    this.setState({ columns: columnsVisibilityRendered });
  };

  handleExport = () => {
    const { columns = [] } = this.props;
    const { dataSource = [] } = this.props;
    const csvData = compileCsvData(dataSource, columns);
    exportToCsv('export.csv', csvData);
  };

  // 渲染可见列控制器
  renderColsSwitch = (cols = []) =>
    cols.map(col => {
      const { title, dataIndex, visible, sorter } = col;
      return (
        <Menu.Item key={dataIndex}>
          <Checkbox
            disabled={sorter}
            defaultChecked={visible}
            onChange={e => this.handleColsSwitch(dataIndex, e.target.checked)}
          >
            {title}
          </Checkbox>
        </Menu.Item>
      );
    });

  handleOnClickBtn = (cb, selectedRows, selectedRowKeys, queryParams) => {
    cb && cb(selectedRowKeys, selectedRows, queryParams);
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  };

  // 处理搜索按钮
  handleSearch = () => {
    // 回到第一页
    const searchFormFields = this.searchBarRef.current.getFieldsValue();
    const { queryParams, pagination } = this.state;
    const changedParams = { offset: 0, ...searchFormFields };
    const newQueryParams = { ...queryParams, ...changedParams };
    const modifiedState = {
      pagination: { ...pagination, current: 1 },
      queryParams: newQueryParams,
      selectedRowKeys: [],
      selectedRows: [],
      // dynamicKey: makeRandomKey(), // tag : point 2-1
    };
    this.setState(modifiedState, () => {
      const { onChange, onSearchBarChange } = this.props;
      onSearchBarChange &&
        onSearchBarChange(changedParams, { ...newQueryParams, selectedRowKeys: [] });
      onChange && onChange(newQueryParams, changedParams);
    });
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
          {equals(showSearch, true) && (
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
          {leftButtons.map(b => {
            const btnDisabled = equals(type(b.disabled), 'Function')
              ? b.disabled(selectedRows)
              : b.disabled;
            const btnHidden = equals(type(b.hidden), 'Function')
              ? b.hidden(selectedRows)
              : b.hidden;
            if (btnHidden) return null;
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
                    this.handleOnClickBtn(b.cb, selectedRows, selectedRowKeys, queryParams)
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
          {selectedRowKeys.length > 0 && (
            <span key="total" style={{ fontSize: 12, marginLeft: 8 }}>
              选择了 {selectedRowKeys.length} 条记录
            </span>
          )}
        </Col>
        <Col span={4} className={styles.rightButtons}>
          {rightButtons.map(b => {
            const btnDisabled = equals(type(b.disabled), 'Function')
              ? b.disabled(selectedRows)
              : b.disabled;
            const btnHidden = equals(type(b.hidden), 'Function')
              ? b.hidden(selectedRows)
              : b.hidden;
            return btnHidden ? null : (
              <Tooltip key={b.key} placement="top" title={b.title}>
                <Button
                  size="large"
                  loading={b.loading}
                  className={b.className}
                  icon={b.icon}
                  disabled={btnDisabled}
                  style={{ marginRight: 4 }}
                  onClick={() =>
                    this.handleOnClickBtn(b.cb, selectedRows, selectedRowKeys, queryParams)
                  }
                >
                  {b.title}
                </Button>
              </Tooltip>
            );
          })}
          {equals(showExport, true) && (
            <Tooltip key="download" placement="top" title="导出">
              <Button
                size="large"
                loading={false}
                icon="download"
                disabled={false}
                style={{ marginRight: 4 }}
                onClick={this.handleExport}
              />
            </Tooltip>
          )}
          {equals(showColumn, true) && (
            <Dropdown
              // getPopupContainer={() => document.getElementById('main')}
              overlay={<Menu>{this.renderColsSwitch(columns)}</Menu>}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip placement="top" title="显示列">
                <Button size="large" icon="table" />
              </Tooltip>
            </Dropdown>
          )}
        </Col>
      </Row>
    );
  };

  onSearchBarChange = params => {
    const { onSearchBarChange } = this.props;
    const { queryParams } = this.state;
    const newQueryParams = { ...queryParams, ...params };
    onSearchBarChange && onSearchBarChange(params, newQueryParams);
    this.setState({ queryParams: newQueryParams });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { queryParams } = this.state;
    const { current, pageSize } = pagination;
    const {
      limit,
      offset,
      sortBy = undefined,
      sortDirection = undefined,
      ...restParams
    } = queryParams;
    const newQueryParams = {
      limit: pageSize,
      offset: (current - 1) * pageSize,
      sortBy: sorter.field || sortBy,
      // eslint-disable-next-line
      sortDirection: sorter.order ? (sorter.order === 'descend' ? 'DESC' : 'ASC') : sortDirection,
      ...restParams,
      ...filters,
    };

    this.setState(
      {
        pagination,
        queryParams: newQueryParams,
        selectedRowKeys: [],
        selectedRows: [],
        // dynamicKey: makeRandomKey(), // tag : point 2-2
      },
      () => {
        const { onChange, onSearchBarChange } = this.props;
        onSearchBarChange &&
          onSearchBarChange(newQueryParams, { ...newQueryParams, selectedRowKeys: [] });
        onChange && onChange(newQueryParams);
      }
    );
  };

  render() {
    const {
      onRowChecked,
      onChange, // bind props.onChange
      rowSelection,
      dataSource,
      searchBarForm,
      enableSelection = true,
      total,
      onSearchBarChange,
      showClear = true,
      ...tableProps
    } = this.props;

    const { pagination, selectedRowKeys, columns, dynamicKey, queryParams } = this.state;
    const visibleColumns = columns.filter(c => !equals(c.visible, false));

    const elRowSelection = {
      type: 'checkbox',
      selectedRowKeys, // 不要覆盖
      onChange: (_selectedRowKeys, selectedRows) => {
        equals(type(onRowChecked), 'Function') && onRowChecked(_selectedRowKeys, selectedRows);
        onSearchBarChange &&
          onSearchBarChange({}, { ...queryParams, selectedRowKeys: _selectedRowKeys });
        this.setState({ selectedRowKeys: _selectedRowKeys, selectedRows });
      },
    };

    const theKey = isNil(dynamicKey) ? {} : { key: dynamicKey };

    return (
      <div>
        {!isNil(searchBarForm) &&
          !isEmpty(searchBarForm) && (
            <SearchBar
              wrappedComponentRef={this.searchBarRef}
              onSearchBarSearch={this.handleSearch}
              onSearchBarChange={this.onSearchBarChange}
              searchBarForm={searchBarForm}
              showClear={showClear}
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
                equals(enableSelection, true) ? { ...elRowSelection, ...rowSelection } : null
              }
              {...tableProps}
              {...theKey}
              columns={visibleColumns}
            />
          </div>
        </div>
      </div>
    );
  }
}

DataTable.defaultProps = {
  onChange: () => {},
  total: undefined,
  loading: false,
  searchBarForm: [],
  onSearchBarChange: () => {},
  enableSelection: true,
  columnsCache: undefined,
  showColumn: true,
  showSearch: true,
  showExport: true,
  leftButtons: [],
  rightButtons: [],
  limit: 10,
  offset: 0,
};

DataTable.propTypes = {
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  onChange: PropTypes.func,
  dataSource: PropTypes.array.isRequired,
  total: PropTypes.number,
  loading: PropTypes.bool,
  searchBarForm: PropTypes.array,
  onSearchBarChange: PropTypes.func,
  enableSelection: PropTypes.bool,

  columnsCache: PropTypes.string,
  showColumn: PropTypes.bool,
  showSearch: PropTypes.bool,
  showExport: PropTypes.bool,
  leftButtons: PropTypes.array,
  rightButtons: PropTypes.array,
  limit: PropTypes.number,
  offset: PropTypes.number,
};

export default DataTable;
