import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Table } from 'antd';
import update from 'immutability-helper';

const DOMAIN = 'userTaskChange';
@connect(({ loading, dispatch, userTaskChange }) => ({
  loading,
  dispatch,
  ...userTaskChange,
}))
class TaskChangeTable extends PureComponent {
  componentDidMount() {}

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { changeTableList, dispatch } = this.props;
    const newDataSource = update(changeTableList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });

    dispatch({ type: `${DOMAIN}/updateState`, payload: { changeTableList: newDataSource } });
  };

  render() {
    const { loading, changeTableList } = this.props;
    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: changeTableList.filter(data => Number.parseFloat(data.deltaEava) !== 0),
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '活动',
          dataIndex: 'resActivityDesc',
          width: '20%',
        },
        {
          title: '原当量',
          dataIndex: 'oldEqva',
          width: '20%',
        },
        {
          title: '变更当量',
          dataIndex: 'deltaEava',
          width: '15%',
        },
        {
          title: '变更后当量',
          dataIndex: 'newEqva',
          width: '15%',
        },
        {
          title: '变更说明',
          dataIndex: 'changeDesc',
          width: '20%',
          render: (value, row, index) => (
            <Input
              value={value}
              maxLength={35}
              onChange={this.onCellChanged(index, 'changeDesc')}
            />
          ),
        },
        // {
        //   title: '审批意见',
        //   dataIndex: 'approveDesc',
        //   width: '10%',
        //   align: 'center',
        // },
      ],
    };

    return (
      <div style={{ margin: 12 }}>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default TaskChangeTable;
