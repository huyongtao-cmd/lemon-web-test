import React from 'react';
import { Modal } from 'antd';
import DataTable from '@/components/common/DataTable';
import { UdcSelect } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

/**
 * 项目列表 单选
 */
class ProjectModal extends React.Component {
  state = {
    selectedRowKeys: [],
    selectedRows: null,
    userSource: [],
    searchForm: {},
  };

  componentDidMount() {
    const { userList, domain, dispatch, searchData } = this.props;
    this.setState({ searchForm: { projStatus: 'ACTIVE' } });
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'ASC',
      projStatus: 'ACTIVE',
    });
    dispatch({ type: `${domain}/selectUsers` }).then(() => {
      this.setState({ userSource: userList });
    });
  }

  fetchData = async params => {
    const { domain, dispatch } = this.props;
    const { pmResId } = params;
    // 在自己的models里写queryProjList和selectUsers方法
    dispatch({
      type: `${domain}/queryProjList`,
      payload: { ...params, pmResId: pmResId ? pmResId.id : null },
    });
  };

  // 双击选中行
  handleOnRow = record => {
    const { selectedRowKeys, selectedRows } = this.state;
    return {
      onDoubleClick: e => {
        const found = selectedRowKeys.filter(key => key === record.id).length > 0;
        if (found) {
          this.setState({
            selectedRowKeys: selectedRowKeys.filter(key => key !== record.id),
            selectedRows: selectedRows.filter(row => row.id !== record.id),
          });
        } else {
          const { onOk } = this.props;
          this.setState({
            selectedRowKeys: [record.id],
            selectedRows: [record],
          });
          if (record.projStatus !== 'ACTIVE' && record.projStatus !== 'PENDING') {
            createMessage({ type: 'error', description: `只能选择项目状态为激活或暂挂的项目` });
            return;
          }
          onOk.apply(this.state, [e, [record.id], [record]]);
        }
      },
    };
  };

  // 点击确定按钮保存项目
  handleSave = e => {
    const { onOk } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    if (!selectedRowKeys.length) {
      createMessage({ type: 'error', description: '请选择一个项目' });
      return;
    }
    if (
      selectedRowKeys[0] !== 0 &&
      selectedRows[0].projStatus !== 'ACTIVE' &&
      selectedRows[0].projStatus !== 'PENDING'
    ) {
      createMessage({ type: 'error', description: `只能选择项目状态为激活或暂挂的项目` });
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
    const { dataSource, loading, total, domain, userList } = this.props;
    const { userSource, selectedRowKeys, searchForm } = this.state;

    return {
      rowKey: 'id',
      domain, // 必填 用于本地缓存表格的列配置
      loading,
      dataSource,
      total,
      showColumn: false, // 是否显示右侧列配置按钮
      onRow: this.handleOnRow,
      rowSelection: {
        type: 'radio',
        selectedRowKeys,
        onChange: (rowKey, rows) => {
          this.setState({
            selectedRowKeys: rowKey,
            selectedRows: rows,
          });
        },
      },
      onSearchBarChange: (changedValues, allValues) => {
        this.setState({ searchForm: allValues });
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: '项目名称',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.projName,
          },
        },
        {
          title: '项目经理',
          dataIndex: 'pmResId',
          options: {
            initialValue: searchForm.pmResId,
            //  ? { code: searchForm.pmResId, name: searchForm.pmResName } : undefined,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              columns={columns}
              dataSource={userSource}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  this.setState({
                    userSource: userList.filter(
                      d =>
                        d.code.indexOf(value) > -1 ||
                        d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                    ),
                  });
                },
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        },
        {
          title: '项目状态',
          dataIndex: 'projStatus',
          options: {
            initialValue: searchForm.projStatus,
          },
          tag: <UdcSelect code="TSK.PROJ_STATUS" placeholder="请选择" />,
        },
        {
          title: '项目类型',
          dataIndex: 'workType',
          options: {
            initialValue: searchForm.workType,
          },
          tag: <UdcSelect code="TSK.WORK_TYPE" placeholder="请选择" />,
        },
      ],
      columns: [
        {
          title: '项目编号',
          dataIndex: 'projNo',
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
        },
        {
          title: '项目状态',
          dataIndex: 'projStatusName',
          align: 'center',
        },
        {
          title: '项目类型',
          dataIndex: 'workTypeDesc',
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
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
        width="65%"
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)' }}
      >
        <DataTable {...this.tableProps()} />
      </Modal>
    );
  }
}

export default ProjectModal;
