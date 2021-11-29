/* eslint-disable no-console */
import React from 'react';
import moment from 'moment';
import { Button, DatePicker, Input, InputNumber, Select } from 'antd';
import update from 'immutability-helper';

import EditableDataTable from '@/components/common/EditableDataTable';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

class EDateTableDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      dataSource: [],
      // selectedRowKeys: [],
      total: 0,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    // this.setState({ loading: true });
    // await request(toQs('/api/sys/v1/dics')(params)).then(json => {
    //   if (json.response) {
    //     this.setState({
    //       dataSource: (json.response.rows || []).map(row => ({
    //         ...row,
    //         id: row.dict + row.lang + row.word,
    //       })),
    //       total: json.response.total,
    //     });
    //   }
    //   this.setState({ loading: false });
    // });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    console.log(rowIndex, rowField);
    const { dataSource } = this.state;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    this.setState({
      dataSource: newDataSource,
    });
  };

  tableProps = () => {
    const { dataSource, loading, total } = this.state;

    return {
      sortBy: 'id',
      rowKey: 'id',
      loading,
      total,
      dataSource,
      // rowSelection: {
      //   selectedRowKeys: selectedRowKeys,
      //   onChange: (selectedRowKeys, selectedRows) => {
      //     console.log(selectedRowKeys, selectedRows);
      //     this.setState({
      //       selectedRowKeys,
      //     });
      //   },
      // },
      onAdd: newRow => {
        this.setState({
          dataSource: update(dataSource, {
            $push: [
              {
                ...newRow,
                modifyTime: new Date(),
                lang: 'zh',
                dict: '生成的默认值',
              },
            ],
          }),
        });
      },
      onCopyItem: copied => {
        this.setState({
          dataSource: update(dataSource, { $push: copied }),
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        this.setState({
          dataSource: newDataSource,
        });
      },
      columns: [
        {
          title: 'id',
          dataIndex: 'id',
        },
        {
          title: '字典(必填)，校验方法传入options.rules，参考form',
          dataIndex: 'dict',
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '必填',
              },
            ],
          },
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onBlur={this.onCellChanged(index, 'dict')} />
          ),
        },
        {
          title: '语言',
          dataIndex: 'lang',
          render: (value, row, index) => (
            <Select
              value={value}
              size="small"
              style={{ width: 70 }}
              onChange={this.onCellChanged(index, 'lang')}
            >
              <Select.Option value="zh">zh</Select.Option>
              <Select.Option value="en">en</Select.Option>
            </Select>
          ),
        },
        {
          title: '修改时间',
          dataIndex: 'modifyTime',
          render: (value, row, index) => (
            <DatePicker
              value={moment(value)}
              size="small"
              onChange={this.onCellChanged(index, 'modifyTime')}
            />
          ),
        },
        {
          title: '文字',
          dataIndex: 'text',
          align: 'center',
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onBlur={this.onCellChanged(index, 'text')} />
          ),
        },
        {
          title: '词语',
          dataIndex: 'word',
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onBlur={this.onCellChanged(index, 'word')} />
          ),
        },
        {
          title: '租户ID',
          dataIndex: 'tenantId',
          align: 'center',
          readOnly: true,
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              size="small"
              onBlur={this.onCellChanged(index, 'tenantId')}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'upload',
          title: '自定义按钮',
          icon: 'upload',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys, selectedRows);
          },
        },
        {
          key: 'one',
          title: '必须选择一行的按钮',
          icon: '',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys, selectedRows);
          },
        },
        {
          key: 'two',
          title: '必须选择多行的按钮',
          icon: '',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys, selectedRows);
          },
        },
        {
          key: 'moveUp',
          title: '上移',
          icon: 'up',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys, selectedRows);
          },
        },
        {
          key: 'moveDown',
          title: '下移',
          icon: 'down',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys, selectedRows);
          },
        },
      ],
    };
  };

  render() {
    const { dataSource } = this.state;
    return (
      <div>
        <div>
          <Button type="primary" onClick={() => console.log(dataSource)}>
            【保存】获取表格数据见console
          </Button>
        </div>
        <br />
        <div>
          表格动态数据：
          {JSON.stringify(dataSource)}
        </div>
        <br />
        <div>
          <EditableDataTable {...this.tableProps()} />
        </div>
      </div>
    );
  }
}

export default EDateTableDemo;
