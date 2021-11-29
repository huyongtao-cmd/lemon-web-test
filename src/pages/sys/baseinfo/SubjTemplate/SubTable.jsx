import React, { PureComponent } from 'react';
import { Checkbox, Input, Icon } from 'antd';
import moment from 'moment';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { AccTmplModal, AccTmplMutiModal } from '@/pages/gen/modal';

// 构建树节点
const renderChild = (items, disables) =>
  items.map(item => {
    let data = null;
    if (item.children) {
      data = renderChild(item.children, disables);
    }
    return { ...item, key: item.code, title: item.name, children: data || [] };
  });

class SubjTemplateSub extends PureComponent {
  state = {
    modalVisible: false,
    visible: false,
    _selectedRowKeys: [],
    newTree: [],
  };

  componentDidMount() {
    const {
      dispatch,
      tmplId,
      domain,
      formData: { tmplIndustry },
    } = this.props;

    dispatch({ type: `${domain}/queryDetails`, payload: { tmplId } }).then(() => {
      // payload需传入accIndustry
      dispatch({ type: `${domain}/queryAccMasTree`, payload: { accIndustry: tmplIndustry } }).then(
        () => {
          this.handleTransformTree();
        }
      );
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch, domain } = this.props;
    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue.target.checked ? 1 : 0,
        },
      },
    });

    dispatch({ type: `${domain}/updateState`, payload: { dataSource: newDataSource } });
  };

  onCellCheckBoxChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch, domain } = this.props;
    const val = rowFieldValue.target.checked ? 1 : 0;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    });
    if (newDataSource[rowIndex].procStatus !== 'NEWADDED') {
      newDataSource[rowIndex].procStatus = 'TOPROCESS';
      newDataSource[rowIndex].procStatusName = '待处理';
    }

    dispatch({ type: `${domain}/updateState`, payload: { dataSource: newDataSource } });
  };

  // 构建modal树的数据源,过滤本模板已存在的科目模板树
  handleTransformTree = () => {
    const { dataSource, modalTreeData } = this.props;
    const keys = dataSource.map(item => item.accCode);
    const newTree = renderChild(modalTreeData, keys);
    this.setState({
      newTree,
    });
  };

  // 切换多选弹出窗。
  toggleMutiModal = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  // 切换单选弹出窗。
  toggleRadioModal = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  // 打开多选弹出窗。
  openMutiModal = () => {
    // this.handleTransformTree();
    this.toggleMutiModal();
  };

  // 打开单选弹出窗
  openRadioModal = () => {
    // this.handleTransformTree();
    this.toggleRadioModal();
  };

  saveMutiModal = (e, checkedKeys) => {
    const { dispatch, domain, modalTreeData } = this.props;
    this.toggleMutiModal();
    dispatch({ type: `${domain}/saveAccMasTree`, payload: { checkedKeys, modalTreeData } });
  };

  saveRadioModal = (e, selectValue) => {
    this.toggleRadioModal();

    const { dispatch, domain, dataSource } = this.props;
    const newCodes = dataSource.map(item => item.accId).filter(value => !!value);

    // 选择值selectValue是null，则不插入列表
    if (newCodes.includes(selectValue.id)) {
      return;
    }
    let flag = 0;
    const newDataSource = dataSource.map(item => {
      if (!item.accId && flag === 0) {
        flag += 1;
        return {
          ...item,
          ...selectValue,
          accId: selectValue.id,
          children: null,
          id: genFakeId(-1), // id>0时后台做update操作,id<0时后台做insert操作
        };
      }
      return item;
    });

    dispatch({
      type: `${domain}/updateState`,
      payload: {
        dataSource: newDataSource,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      domain,
      tmplId,
      dataSource,
      total,
      deleteList,
      formData,
    } = this.props;
    const { modalVisible, _selectedRowKeys, visible, newTree } = this.state;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: loading.effects[`${domain}/query`],
      total,
      dataSource,
      showCopy: false,
      rowSelection: {
        selectedRowKeys: _selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
            _selectedRowKeys: selectedRowKeys,
          });
        },
        getCheckboxProps: record => ({
          disabled: record.procStatus !== 'NEWADDED',
        }),
      },
      onAdd: newRow => {
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  tmplId,
                  includeFlag: 0,
                  procStatus: 'NEWADDED',
                  procStatusName: '新加',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );

        dispatch({
          type: `${domain}/updateState`,
          payload: {
            dataSource: newDataSource,
            // deleteList: selectedRowKeys,
          },
        });
      },
      columns: [
        {
          title: '包含',
          dataIndex: 'includeFlag',
          required: true,
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'includeFlag')}
            />
          ),
        },
        {
          title: '处理状态',
          dataIndex: 'procStatusName',
          align: 'center',
        },
        {
          title: '科目编号',
          dataIndex: 'accCode',
          align: 'center',
          required: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              disabled
              addonAfter={
                <a
                  className="tw-link-primary"
                  onClick={() => {
                    this.openRadioModal(index, 'accCode');
                  }}
                >
                  <Icon type="search" />
                </a>
              }
            />
          ),
        },
        {
          title: '科目名称',
          dataIndex: 'accName',
        },
        {
          title: '状态',
          dataIndex: 'accStatusName',
          align: 'center',
        },
        {
          title: '是否预算科目',
          dataIndex: 'budgetFlag',
          align: 'center',
          render: (value, row, index) =>
            // eslint-disable-next-line no-nested-ternary
            Number.parseInt(row.accLevel, 10) === formData.budgetLevel ? (
              <Checkbox
                checked={value === 1}
                onChange={this.onCellCheckBoxChanged(index, 'budgetFlag')}
              />
            ) : value === 1 ? (
              '是'
            ) : (
              '否'
            ),
        },
        {
          title: '大类',
          dataIndex: 'accType1',
        },
        {
          title: '明细类1',
          dataIndex: 'accType2',
        },
        {
          title: '明细类2',
          dataIndex: 'accType3',
        },
        {
          title: '明细账',
          dataIndex: 'dtlAcc',
        },
        {
          title: '汇总',
          dataIndex: 'sumFlag',
          align: 'center',
          render: (value, row, index) => <Checkbox checked={value} disabled />,
        },
        {
          title: '子账类型',
          dataIndex: 'ledgertypeName',
          align: 'center',
        },
        {
          title: '处理时间',
          dataIndex: 'procTime',
          render: (value, row, index) =>
            value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null,
        },
        {
          title: '处理信息',
          dataIndex: 'procInfo',
        },
      ],
      buttons: [
        {
          key: 'createD',
          title: '批量新增',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            this.openMutiModal();
          },
        },
      ],
    };

    return (
      <div style={{ margin: 12 }}>
        <EditableDataTable {...tableProps} />
        <AccTmplMutiModal
          title="选择科目"
          visible={modalVisible}
          // checkable={true}
          modalTreeData={newTree}
          dataSource={dataSource}
          domain={domain}
          dispatch={dispatch}
          onOk={this.saveMutiModal}
          onCancel={this.toggleMutiModal}
        />

        <AccTmplModal
          title="选择科目"
          visible={visible}
          // checkable={false}
          items={newTree}
          // dataSource={dataSource}
          loading={loading}
          // domain={domain}
          // dispatch={dispatch}
          // handleOk, handleCancel, loading, items
          handleOk={this.saveRadioModal}
          handleCancel={this.toggleRadioModal}
        />
      </div>
    );
  }
}

export default SubjTemplateSub;
