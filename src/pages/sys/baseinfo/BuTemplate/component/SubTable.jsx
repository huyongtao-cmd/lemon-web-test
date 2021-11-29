import React, { PureComponent } from 'react';
import { Input } from 'antd';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { AccTmplMutiModal } from '@/pages/gen/modal';

class BuTmplOperSub extends PureComponent {
  state = {
    modalVisible: false,
    // _selectedRowKeys: [],
    newTree: [],
  };

  componentDidMount() {
    const { dispatch, domain } = this.props;
    dispatch({ type: `${domain}/queryClassTrees` }).then(() => {
      this.fetchTreeDate();
    });
  }

  fetchTreeDate = () => {
    const { classTree } = this.props;
    this.setState({ newTree: classTree });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { operateList, dispatch, domain } = this.props;
    const newDataSource = update(operateList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({ type: `${domain}/updateState`, payload: { operateList: newDataSource } });
  };

  // 切换多选弹出窗。
  toggleMutiModal = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  // 打开多选弹出窗。
  openMutiModal = () => {
    // this.handleTransformTree();
    this.toggleMutiModal();
  };

  saveMutiModal = (e, checkedKeys) => {
    const { dispatch, domain, tmplId, operateList } = this.props;
    const { newTree } = this.state;
    this.toggleMutiModal();
    // 把勾选的树节点的code找出来(不包含列表已存在的code)
    const keys = checkedKeys.filter(
      datakey => !operateList.map(item => item.code).filter(v => v && v === datakey).length
    );
    // modalData重构列表数据
    const newDataSource = operateList.slice();
    const renderChild = (items, disables) =>
      items.forEach(item => {
        let data = null;
        if (item.children) {
          data = renderChild(item.children, disables);
        }
        if (disables.includes(item.key)) {
          newDataSource.push({
            ...item,
            classId: item.id,
            id: genFakeId(-1), // id>0时后台做update操作,id<0时后台做insert操作
            tmplId,
            remark: null,
            children: null,
          });
        }
      });
    renderChild(newTree, keys);

    dispatch({
      type: `${domain}/updateState`,
      payload: {
        operateList: newDataSource,
      },
    });
  };

  render() {
    const { dispatch, loading, domain, tmplId, operateList } = this.props;
    const { modalVisible, _selectedRowKeys, newTree } = this.state;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: loading.effects[`${domain}/queryOperationList`],
      total: operateList.length,
      dataSource: operateList,
      showCopy: false,
      // rowSelection: {
      //   selectedRowKeys: _selectedRowKeys,
      //   onChange: (selectedRowKeys, selectedRows) => {
      //     this.setState({
      //       _selectedRowKeys: selectedRowKeys,
      //     });
      //   },
      // },
      onAdd: newRow => {
        this.openMutiModal();
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = operateList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );

        dispatch({
          type: `${domain}/updateState`,
          payload: {
            operateList: newDataSource,
          },
        });
      },
      columns: [
        {
          title: '分类编号',
          dataIndex: 'code',
          align: 'center',
        },
        {
          title: '分类名称',
          dataIndex: 'name',
        },
        {
          title: '上级分类',
          dataIndex: 'pname',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onBlur={this.onCellChanged(index, 'remark')}
            />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <div>
        <EditableDataTable {...tableProps} />
        <AccTmplMutiModal
          title="选择产品分类"
          visible={modalVisible}
          // checkable={true}
          modalTreeData={newTree}
          dataSource={operateList}
          domain={domain}
          dispatch={dispatch}
          onOk={this.saveMutiModal}
          onCancel={this.toggleMutiModal}
        />
      </div>
    );
  }
}

export default BuTmplOperSub;
