import React from 'react';
import router from 'umi/router';
import { Button, Col, Dropdown, Menu, Row, Card, Tooltip, Pagination } from 'antd';
import { equals, type, isNil, isEmpty } from 'ramda';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { div } from '@/utils/mathUtils';
import { fittingString } from '@/utils/stringUtils';
import playImgUrl from './play.svg';
import playImgUrl1 from './play1.svg';
import playImgUrl2 from './play2.svg';
import playImgUrl3 from './play3.svg';
import defaultImgUrl from './default.svg';

import styles from './styles.less';
import SearchBar from './SearchBar';

import { findRowsByKeys } from './_utils';

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

// // 对字符串超长做处理
// const fittingString = (str = '', MaxNum) => {
//   // eslint-disable-next-line no-control-regex
//   const strLen = str.replace(/[^\x00-\xff]/g, '01').length;
//   if (div(strLen, 2) > MaxNum) {
//     return `${str.substring(0, MaxNum)}...`;
//   }
//   return str;
// };

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
      limit,
      offset,
      sortBy,
      sortDirection,
      total,
      // searchForm caching searchBarForm at past, now its more powerful to caching pagination and selectedRowKeys :)
      searchForm = {},
    } = props;

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
    };
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
    const { selectedRowKeys, selectedRows, queryParams } = this.state;
    const { showSearch = true, leftButtons = [], rightButtons = [] } = this.props;

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
        </Col>
        <Col span={4} className={styles.rightButtons}>
          {rightButtons.map(b => {
            const btnDisabled = equals(type(b.disabled), 'Function')
              ? b.disabled(selectedRows)
              : b.disabled;
            return b.hidden ? null : (
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
    const { limit, offset, ...restParams } = queryParams;
    const newQueryParams = {
      limit: pageSize,
      offset: (current - 1) * pageSize,
      ...restParams,
      ...filters,
    };

    this.setState(
      {
        pagination,
        queryParams: newQueryParams,
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
      dataSource,
      searchBarForm,
      showClear = true,
      showSearchButton = true,
      form,
      total,
    } = this.props;

    const { pagination } = this.state;

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
              form={form}
            />
          )}
        <div style={{ borderRadius: 5 }}>
          {showSearchButton ? (
            <>
              <div style={{ borderBottom: '6px solid #f0f2f5' }} />
              <div style={{ padding: '10px 24px 0', backgroundColor: '#fff' }}>
                {this.renderHeader()}
              </div>
            </>
          ) : null}

          <div style={{ backgroundColor: '#fff', padding: '10px 24px', overflow: 'hidden' }}>
            {!isEmpty(dataSource) ? (
              dataSource.map((item, index) => (
                <Card
                  hoverable
                  style={{
                    height: 'auto',
                    width: 258,
                    float: 'left',
                    marginRight: '20px',
                    marginBottom: '6px',
                  }}
                  bodyStyle={{
                    padding: 8,
                    fontSize: '12px',
                  }}
                  key={item.id}
                  onClick={() => {
                    const urls = getUrl();
                    const from = stringify({ from: urls });
                    router.push(`/sale/productHouse/showHomePage/view?id=${item.id}&${from}`);
                  }}
                  cover={
                    <div
                      style={{
                        width: '256px',
                        height: '144px',
                        position: 'relative',
                      }}
                    >
                      {/* <img className={styles.play} src={playImgUrl3} alt="play" /> */}
                      <img
                        alt="example"
                        width="100%"
                        height="100%"
                        src={
                          item.logoFile ? `data:image/jpeg;base64,${item.logoFile}` : defaultImgUrl
                        }
                      />
                    </div>
                  }
                >
                  <span
                    style={{
                      color: '#284488',
                      fontWeight: 'bolder',
                      marginBottom: '6px',
                    }}
                    title={`视频名称：${item.vname || '-暂无视频名称-'}`}
                  >
                    <div
                      style={{
                        width: '240px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                      }}
                    >
                      {`${fittingString(item.vname || '-暂无视频名称-', 28)}`}
                    </div>
                  </span>
                  <div
                    style={{
                      width: '240px',
                      height: '100px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      marginTop: '6px',
                      paddingRight: 2,
                    }}
                    title={`简介：${item.vdesc || '-暂无视频简介-'}`}
                  >
                    <pre>{`简介：${fittingString(item.vdesc || '-暂无视频简介-', 100)}`}</pre>
                  </div>
                </Card>
              ))
            ) : (
              <div
                style={{
                  padding: '10px 24px 10px',
                  textAlign: 'center',
                  width: '100%',
                  backgroundColor: 'white',
                }}
              >
                暂无数据
              </div>
            )}
          </div>
          {!isEmpty(dataSource) ? (
            <div
              style={{
                padding: '10px 24px 10px',
                textAlign: 'center',
                width: '100%',
                backgroundColor: 'white',
              }}
            >
              <Pagination
                showSizeChanger
                showQuickJumper
                {...pagination}
                total={total}
                onChange={pageNumber => {
                  this.setState(
                    {
                      pagination: {
                        ...pagination,
                        current: pageNumber,
                      },
                    },
                    () => {
                      const { pagination: newPagination } = this.state;
                      this.handleTableChange(newPagination);
                    }
                  );
                }}
                onShowSizeChange={(current, pageSize) => {
                  this.setState(
                    {
                      pagination: {
                        ...pagination,
                        current,
                        pageSize,
                      },
                    },
                    () => {
                      const { pagination: newPagination } = this.state;
                      this.handleTableChange(newPagination);
                    }
                  );
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default DataTable;
