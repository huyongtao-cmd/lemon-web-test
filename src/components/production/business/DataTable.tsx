import React, {ReactNode} from 'react';
import { omit, clone } from 'ramda';
import {Table, Form, Row, Col, Dropdown, Menu, Checkbox, Tooltip,} from 'antd';
import {ColumnProps,TableRowSelection} from 'antd/es/table';
import Link from "@/components/production/basic/Link";
import Button from "@/components/production/basic/Button";
import Card from "@/components/production/layout/Card";
import {localeString} from '@/components/production/basic/Locale';

// @ts-ignore
import {compileCsvData, exportToCsv,} from './util/_utils';
import styles from './style/dataTable.less';
import {PaginationConfig, SelectionSelectFn, SorterResult} from "antd/lib/table";

interface Props<T> {
  title?: string; // 表格标题
  showExport?: boolean; // 是否显示导出按钮
  showColumnSwitch?: boolean; // 是否显示列控制器
  onRow?: (record: T, index: number) => any; // 表格行事件,比如点击,双击等
  dataSource?: T[];
  columns: ColumnProps<T>[];
  buttons?: ReactNode,
  rowKey?: string,
  loading?: boolean;
  pagination?: PaginationConfig | false,
  prodSelection?:TableRowSelection<T> | false; // 表格选择控制
  onChange?: (pagination: PaginationConfig, filters: Record<keyof T, string[]>, sorter: SorterResult<T>) => void;
  [propName: string]: any, // 其它属性
}

class DataTable<T> extends React.PureComponent<Props<T>, any> {

  static defaultProps?: object;

  constructor(props:Props<T>) {
    super(props);
    this.state={
      hiddenColumns:[],
    };

  }

  /**
   * 导出
   */
  handleExport = () => {
    const { columns = [] } = this.props;
    const { dataSource = [] } = this.props;
    const csvData = compileCsvData(dataSource, columns);
    exportToCsv('export.csv', csvData);
  };

  // 渲染列控制器
  renderColsSwitch = (cols:ColumnProps<T>[] = []) =>

    cols.map(col => {
      const { title, dataIndex, } = col;
      return (
        <Menu.Item key={dataIndex}>
          <Checkbox
            checked={this.state.hiddenColumns.indexOf(dataIndex)<0}
            onChange={e =>{
              const {hiddenColumns} = this.state;
              if(!e.target.checked){
                hiddenColumns.push(dataIndex);
                this.setState({hiddenColumns:[...hiddenColumns]});
              }else {
                hiddenColumns.splice(hiddenColumns.indexOf(dataIndex),1);
                this.setState({hiddenColumns:[...hiddenColumns]});
              }
            }}
          >
            {title}
          </Checkbox>
        </Menu.Item>
      );
    });


  render() {
    const {
      title,
      showExport = true,
      showColumnSwitch = true,
      dataSource,
      columns,
      buttons,
      pagination=false,
      bordered=true,
      rowKey='id',
      size="small",
      prodSelection=false,
      selectedRowKeys,
      onRowSelect,
      onRowSelectAll,
      loading,
      onChange,
      onRow,
      ...rest
    } = this.props;

    const {hiddenColumns=[]} = this.state;


    let prodRowSelection:any = {};
    if(prodSelection){
      prodRowSelection.rowSelection = {
        fixed:true,
        type:prodSelection.type,
        selectedRowKeys:prodSelection.selectedRowKeys,
        onSelect:prodSelection.onSelect,
        onSelectAll:prodSelection.onSelectAll,
      }
    }

    const wrappedColumns = columns.filter(column=> hiddenColumns.indexOf(column.dataIndex)<0);

    return (
      <Card
        title={title}
      >
        <div className={`${styles['prod-table-operations']}`}>
          <Row type="flex" justify="center" align="bottom">
            <Col span={18}>
              {buttons}
            </Col>
            <Col span={6} style={{textAlign:'right'}}>
              {showExport &&
              <Tooltip key="download" placement="top" title="导出">
                <Button
                  icon="download"
                  size="large"
                  style={{ marginRight: 4 }}
                  onClick={this.handleExport}
                />
              </Tooltip>
              }

              {showColumnSwitch &&
              <Dropdown
                // getPopupContainer={() => document.getElementById('main')}
                overlay={<Menu>{this.renderColsSwitch(columns)}</Menu>}
                trigger={['click']}
                placement="bottomRight"
              >
                <Tooltip placement="top" title="显示列">
                  <Button icon="table" size="large" />
                </Tooltip>
              </Dropdown>
              }


            </Col>
          </Row>
        </div>

        <Table
          bordered
          size={size}
          columns={wrappedColumns}
          dataSource={dataSource}
          rowKey={rowKey}
          {...prodRowSelection}
          pagination={pagination}
          onChange={onChange}
          loading={loading}
          onRow={onRow}
          {...rest}
        />

      </Card>

    );
  }

}

DataTable.defaultProps = {
};

export default DataTable;
