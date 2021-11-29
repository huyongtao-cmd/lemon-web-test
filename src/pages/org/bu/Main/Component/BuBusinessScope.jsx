import React, { PureComponent } from 'react';
import { connect } from 'dva';
import update from 'immutability-helper';
import { Form, Input } from 'antd';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { AccTmplMutiModal } from '@/pages/gen/modal';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'buBusinessScope';

@connect(({ loading, buBusinessScope, dispatch }) => ({
  buBusinessScope,
  dispatch,
  loading: loading.effects['buBusinessScope/query'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateBasic`,
      payload: { key, value },
    });
  },
})
class BuBusinessScope extends PureComponent {
  state = {
    modalVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryProdClassTree`,
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  // 切换多选弹出窗。
  toggleMutiModal = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  addRowsByTreeSelect = (e, checkedKeys) => {
    const { dispatch, buId, buBusinessScope } = this.props;
    const { classTree, dataList } = buBusinessScope;

    this.toggleMutiModal();

    const keys = checkedKeys.filter(
      datakey => !dataList.map(item => item.code).filter(v => v && v === datakey).length
    );

    const newDataSource = dataList.slice();
    const renderChild = (items, disables) =>
      items.forEach(item => {
        let data = null;
        if (item.children) {
          data = renderChild(item.children, disables);
        }
        if (disables.includes(item.key)) {
          newDataSource.push({
            ...item,
            prodClassId: item.id,
            id: genFakeId(-1),
            buId,
            className: item.name,
            remark: null,
            children: null,
          });
          // console.log('--------includes', item.key, newDataSource);
        }
      });

    renderChild(classTree, keys);

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: newDataSource,
      },
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      buBusinessScope: { dataList },
    } = this.props;

    const newDataSource = update(dataList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataList: newDataSource },
    });
  };

  render() {
    const { buBusinessScope, dispatch } = this.props;
    const { modalVisible } = this.state;
    const { dataList, classTree } = buBusinessScope;

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      domain: DOMAIN,
      dispatch,
      showAdd: false,
      showCopy: false,
      // loading
      expirys: 0,
      dataSource: dataList,
      showSearch: false,
      showColumn: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {},

      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const delArr = [];
        selectedRowKeys.map(v => v > 0 && delArr.push(v));
        const newDataList = dataList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: newDataList,
            delList: delArr,
          },
        });
      },

      columns: [
        {
          title: '分类编号',
          dataIndex: 'code',
          width: '20%',
        },
        {
          title: '分类名称',
          dataIndex: 'className',
          width: '20%',
        },
        {
          title: '上级分类',
          dataIndex: 'pname',
          width: '20%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '40%',
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onBlur={this.onCellChanged(index, 'remark')} />
          ),
        },
      ],

      buttons: [
        {
          key: 'create',
          title: '新增',
          icon: 'create',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          className: 'tw-btn-primary',
          cb: () => {
            this.toggleMutiModal();
          },
        },
      ],
    };

    return (
      <ReactiveWrapper>
        <EditableDataTable {...tableProps} />
        <AccTmplMutiModal
          visible={modalVisible}
          modalTreeData={classTree}
          dataSource={dataList}
          domain={DOMAIN}
          dispatch={dispatch}
          onOk={this.addRowsByTreeSelect}
          onCancel={this.toggleMutiModal}
        />
      </ReactiveWrapper>
    );
  }
}

export default BuBusinessScope;
