import React, { ReactNode } from 'react';
import { omit, clone } from 'ramda';
import { Table, Form, Row, Col, Dropdown, Menu, Checkbox, Tooltip, Popconfirm, Icon } from 'antd';
import { ColumnProps, TableRowSelection } from 'antd/es/table';
import Link from '@/components/production/basic/Link';
import Button from '@/components/production/basic/Button';
import Card from '@/components/production/layout/Card';
import message from '@/components/production/layout/Message';
import { localeString } from '@/components/production/basic/Locale';
import { outputHandle } from '@/utils/production/outputUtil';

import { treeToList } from '@/utils/production/TreeUtil';
// import {}

// @ts-ignore
import { compileCsvData, exportToCsv } from './util/_utils';
import styles from './style/editTable.less';
import { PaginationConfig, SelectionSelectFn } from 'antd/lib/table';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import confirm from '@/components/production/layout/Confirm';
// @ts-ignore
import { customSettingDetailByKey } from '@/services/production/system/customSetting';

interface Props<T> {
  title?: string; // 表格标题
  dataSource?: T[];
  columns: ColumnProps<T>[];
  buttons?: ReactNode;
  rowKey?: string;
  loading?: boolean;
  selectType?: 'checkbox' | 'radio' | null; // 选择形式,多选,单选,不可选择; 默认checkbox
  getCheckboxProps?: (data: T[]) => object; // 选择框的默认属性配置
  selectedRowKeys?: string[] | number[];
  onRowSelect?: SelectionSelectFn<T>;
  onRowSelectAll?: (selected: boolean, selectedRows: Object[], changeRows: Object[]) => void;
  readOnly?: boolean;
  onAddClick?: () => void;
  onCopyClick?: (data: T[]) => void;
  onDeleteConfirm?: (keys: any[]) => void;
  form: WrappedFormUtils;

  [propName: string]: any; // 其它属性
}

interface EditColumnProps<T> extends ColumnProps<T> {
  descriptionField?: string; // 详情模式字段，用于可编辑表格大数据量显示处理
  descriptionRender?: (text: any, record: T, index: number) => React.ReactNode; // 详情模式返回，用于可编辑表格大数据量显示处理
  required?: boolean; // 表头是否加红* 必填标识
  rowKey?: string;
  render?: (text: any, record: T, index: number) => any;
}

class EditTable<T> extends React.PureComponent<Props<T>, any> {
  static defaultProps?: object;

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      max: undefined,
      selectedRowKeys: [],
      selectedRows: [],
      editRowKeys: [],
    };
  }

  componentDidMount() {
    this.getMax(); // 获取可编辑表格最大行数
  }

  getMax = async () => {
    const { data } = await outputHandle(customSettingDetailByKey, {
      key: 'EDIT_TABLE_MAX_ROWS_COUNT',
    });
    this.setState({ max: data.settingValue });
  };
  onRowSelect = (record: T, selected: boolean, selectedRows: Object[]) => {
    const { rowKey } = this.props;
    const rowKeyString: string = rowKey as string;
    this.setState({
      selectedRowKeys: selectedRows.map((row: any) => row[rowKeyString]),
      selectedRows: selectedRows,
    });
  };

  onRowSelectAll = (selected: boolean, selectedRows: Object[], changeRows: Object[]) => {
    const { rowKey } = this.props;
    const rowKeyString: string = rowKey as string;
    if (selected) {
      this.setState({
        selectedRowKeys: [
          ...selectedRows.map((row: any) => row[rowKeyString]),
        ],
        selectedRows: [...selectedRows],
      });
    } else {
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    }
  };

  renderFooter = () => {
    const { selectedRows, selectedRowKeys } = this.state;
    const { onAddClick, onCopyClick, onDeleteConfirm, readOnly, rowKey, buttons } = this.props;

    if (readOnly) {
      return null;
    }
    return (
      <Row className={styles[`prod-table-operations`]}>
        <Col span={24}>
          {onAddClick && (
            <Button key="add" type="primary" onClick={onAddClick}>
              新增
            </Button>
          )}
          {onCopyClick && (
            <Button key="copy" type="primary" onClick={() => {
              if(selectedRows.length === 0){
                message({
                  type: 'info',
                  content: '请至少选择一条数据复制！',
                });
                return;
              }
              onCopyClick(selectedRows);
            }}>
              复制
            </Button>
          )}
          {onDeleteConfirm && (
            <Button
              key="delete"
              type="danger"
              onClick={() => {
                if (selectedRowKeys && selectedRowKeys.length > 0) {
                  console.log(selectedRowKeys);
                  confirm({
                    onOk: () => {
                      onDeleteConfirm(selectedRowKeys);
                      this.setState({ selectedRowKeys: [], selectedRows: [] });
                    },
                  });
                }else {
                  message({
                    type: 'info',
                    content: '请至少选择一条数据删除！',
                  });
                }
              }}
            >
              删除
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  handleEdit = (key: any) => {
    const { editRowKeys } = this.state;
    if (editRowKeys.length > 0) {
      message({
        type: 'info',
        content: '您有尚未保存的编辑内容，请先保存！',
      });
    } else {
      const { form } = this.props;
      form && form.setFieldsValue({ editTableSpecial_: true });
      this.setState({ editRowKeys: [key] });
    }
  };
  handleEditSave = (key: any) => {
    const { form } = this.props;
    form.validateFields(
      (error, values) => {
        if (error) {
          return;
        }
        this.setState({ editRowKeys: [] });
      }
    );
  };

  render() {
    const {
      title,
      dataSource,
      columns,
      buttons,
      pagination = false,
      bordered = true,
      rowKey,
      size = 'small',
      loading,
      selectType,
      getCheckboxProps,
      rowSelection: newRowSelection = {},
      ...rest
    } = this.props;

    const { selectedRowKeys, max, editRowKeys } = this.state;
    let prodRowSelection: any = {};
    if (selectType) {
      prodRowSelection.rowSelection = {
        ...{
          // fixed: true,
          type: selectType,
          selectedRowKeys: selectedRowKeys,
          onSelect: this.onRowSelect,
          onSelectAll: this.onRowSelectAll,
          getCheckboxProps: getCheckboxProps,
        },
        ...newRowSelection,
      };
    }
    // let prodSelection:TableRowSelection<T> | false = false;
    // const prodRowSelection:TableRowSelection<T> = {
    //   fixed:true,
    //   type:'checkbox',
    //   selectedRowKeys:selectedRowKeys,
    //   onSelect:this.onRowSelect,
    //   onSelectAll:this.onRowSelectAll,
    // };

    let wrappedColumns = columns.map((column: any) => ({
      ...column,
      title: column.required ? (
        <span className="ant-form-item-required">{column.title}</span>
      ) : (
        column.title
      ),
    }));

    // @ts-ignore
    const dataSourceLength = treeToList(dataSource || []).length; //有的dataSource为树形结构，转化为list的长度
    if (max && dataSourceLength && dataSourceLength > max) {
      wrappedColumns = wrappedColumns.map((column: EditColumnProps<T>, index: number) => {
        const { render } = column;
        if (render) {
          column.render = (text: any, record: T, index: number) => {
            // @ts-ignore
            if (editRowKeys.indexOf(record[`${rowKey}`]) > -1) {
              return render(text, record, index);
            } else {
              // @ts-ignore
              let result = record[`${column.dataIndex}`];
              if (column.descriptionField) {
                // @ts-ignore
                result = record[`${column.descriptionField}`];
              }
              if (column.descriptionRender) {
                result = column.descriptionRender(text, record, index);
              }
              return result ? result.toString() : result;
            }
          };
        }
        return column;
      });

      wrappedColumns = [
        ...wrappedColumns,
        {
          title: '操作',
          dataIndex: 'editOption',
          align: 'center',
          render: (value: any, rows: any) => (
            <div>
              {editRowKeys.indexOf(rows[`${rowKey}`]) === -1 && (
                <Icon
                  type="edit"
                  theme="twoTone"
                  style={{ cursor: 'pointer' }}
                  title={'编辑'}
                  onClick={e => {
                    this.handleEdit(rows[`${rowKey}`]);
                  }}
                />
              )}
              {editRowKeys.indexOf(rows[`${rowKey}`]) !== -1 && (
                <Icon
                  type="check"
                  style={{ cursor: 'pointer', color: 'rgb(24, 144, 255) ' }}
                  title={'保存'}
                  onClick={e => {
                    this.handleEditSave(rows[`${rowKey}`]);
                  }}
                />
              )}
            </div>
          ),
        },
      ];
    }

    return (
      <Card
        title={
          <p>
            {title}
            {dataSourceLength > max && (
              <span style={{ fontSize: '14px', color: 'red' }}>
                {' '}
                当前数据量过多，建议您单行编辑！
              </span>
            )}
          </p>
        }
      >
        <Table
          className={styles['prod-edit-table']}
          bordered
          size={size}
          columns={wrappedColumns}
          dataSource={dataSource}
          rowKey={rowKey}
          {...prodRowSelection}
          footer={this.renderFooter}
          pagination={pagination}
          {...rest}
        />
      </Card>
    );
  }
}

EditTable.defaultProps = {
  // title: "编辑表格",
  rowKey: 'id',
  selectType: 'checkbox',
};

export default EditTable;
