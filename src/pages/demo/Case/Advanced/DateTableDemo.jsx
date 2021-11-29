/* eslint-disable no-plusplus */
import React from 'react';
import DataTable from '@/components/common/DataTable';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';
import { Input } from 'antd';

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

  let csvFile = '';
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

class DateTableDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      dataSource: [],
      total: 0,
    };
  }

  componentDidMount() {
    this.fetchData({ sortBy: 'defId', sortDirection: 'DESC' });
  }

  fetchData = async params => {
    this.setState({ loading: true });
    await request.get(toQs('/api/sys/v1/udc/def', params)).then(json => {
      if (json.response) {
        this.setState({
          dataSource: (json.response.rows || []).map(row => ({
            ...row,
          })),
          total: json.response.total,
        });
      }
      this.setState({ loading: false });
    });
  };

  tableProps = () => {
    const { dataSource, loading, total } = this.state;

    return {
      domain: 'rex_test_table', // 必填 用于本地缓存表格的列配置
      rowKey: 'defId',
      loading,
      total,
      dataSource,
      onSearchBarChange: (changedValues, allValues) => {
        console.log(changedValues, allValues);
      },
      onChange: filters => {
        console.log(filters);
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: 'UDC类别码',
          dataIndex: 'defId',
          tag: <Input placeholder="请输入UDC类别码" />,
        },
        {
          title: 'UDC名称',
          dataIndex: 'defName',
          tag: <Input placeholder="请输入UDC名称" />,
        },
      ],
      columns: [
        {
          title: 'UDC编码',
          dataIndex: 'defId',
          sorter: true,
          align: 'center',
        },
        {
          title: 'UDC名称',
          dataIndex: 'defName',
          align: 'center',
          sorter: true,
        },
        {
          title: '上级UDC编码',
          dataIndex: 'pdefId',
          align: 'center',
          sorter: true,
        },
        {
          title: '上级UDC名称',
          dataIndex: 'pdefName',
          align: 'center',
          sorter: true,
        },
        {
          title: '是否可修改',
          dataIndex: 'isBuiltIn',
          sorter: true,
          align: 'center',
        },
        {
          title: '创建时间',
          dataIndex: 'modifyTime',
        },
      ],
      rightButtons: [
        {
          key: 'download',
          title: '导出',
          icon: 'download',
          loading: false,
          hidden: false,
          disabled: false,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const rows = dataSource.map(r => Object.values(r));
            // console.log(rows);
            exportToCsv('export.csv', [
              ['UDC编码', 'UDC名称', '上级UDC编码', '上级UDC名称', '是否可修改', '创建时间'],
              ...rows,
            ]);
          },
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新增',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            console.log(selectedRowKeys, selectedRows, queryParams);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '编辑',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            console.log(selectedRowKeys, selectedRows, queryParams);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            console.log(selectedRowKeys, selectedRows, queryParams);
          },
        },
      ],
    };
  };

  render() {
    return <DataTable {...this.tableProps()} />;
  }
}

export default DateTableDemo;
