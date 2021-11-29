import React from 'react';
import { Modal } from 'antd';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

/**
 * 项目列表 单选
 */
class ResModal extends React.Component {
  state = {
    selectedRowKeys: [],
    selectedRows: null,
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'resNo', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch, domain } = this.props;
    dispatch({
      type: `${domain}/queryModalList`,
      payload: { ...params, resStatus: '3' }, // 资源状态为已认证
    });
  };

  // 双击选中行
  handleOnRow = record => {
    const { selectedRowKeys, selectedRows } = this.state;
    return {
      onDoubleClick: () => {
        const found = selectedRowKeys.filter(key => key === record.id).length > 0;
        if (found) {
          this.setState({
            selectedRowKeys: selectedRowKeys.filter(key => key !== record.id),
            selectedRows: selectedRows.filter(row => row.id !== record.id),
          });
        } else {
          this.setState({
            selectedRowKeys: [record.id],
            selectedRows: [record],
          });
        }
      },
    };
  };

  // 点击确定按钮保存
  handleSave = e => {
    const { onOk } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    if (!selectedRowKeys.length) {
      createMessage({ type: 'error', description: '请选择一个资源' });
      return;
    }
    onOk.apply(this.state, [e, selectedRowKeys, selectedRows]);
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel } = this.props;
    onCancel.apply(this.state, [e]);
  };

  tableProps = () => {
    const { dataSource, loading, total, domain, multiple = false } = this.props;
    const selectType = multiple ? 'checkbox' : 'radio';
    const { selectedRowKeys } = this.state;
    return {
      rowKey: 'id',
      domain, // 必填 用于本地缓存表格的列配置
      loading,
      dataSource,
      total,
      showColumn: false, // 是否显示右侧列配置按钮
      onRow: this.handleOnRow,
      rowSelection: {
        type: selectType,
        selectedRowKeys,
        onChange: (rowKey, rows) => {
          this.setState({
            selectedRowKeys: rowKey,
            selectedRows: rows,
          });
        },
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: '资源编号/姓名', // TODO: 国际化
          dataIndex: 'searchKey',
        },
      ],
      columns: [
        {
          title: '资源编号', // TODO: 国际化
          dataIndex: 'resNo',
          sorter: true,
          align: 'center',
          defaultSortOrder: 'descend',
        },
        {
          title: '姓名', // TODO: 国际化
          dataIndex: 'resName',
          sorter: true,
        },
        {
          title: '工号', // TODO: 国际化
          dataIndex: 'empNo',
          align: 'center',
          sorter: true,
        },
        {
          title: '资源类型一', // TODO: 国际化
          dataIndex: 'resType1Name',
          align: 'center',
        },
        {
          title: '资源类型二', // TODO: 国际化
          dataIndex: 'resType2Name',
          align: 'center',
        },
        {
          title: '资源状态', // TODO: 国际化
          dataIndex: 'resStatusName',
          align: 'center',
        },
        {
          title: '所属组织', // TODO: 国际化
          dataIndex: 'baseBuName',
        },
      ],
      rightButtons: [],
      leftButtons: [],
    };
  };

  render() {
    const { visible, title } = this.props;

    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        onOk={this.handleSave}
        onCancel={this.onToggle}
        width="80%"
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)' }}
      >
        <DataTable {...this.tableProps()} />
      </Modal>
    );
  }
}

export default ResModal;
