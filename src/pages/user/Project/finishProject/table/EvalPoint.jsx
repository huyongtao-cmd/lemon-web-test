import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Table, Rate, Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import update from 'immutability-helper';

const DOMAIN = 'finishProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch }) => ({
  loading,
  finishProjectFlow,
  dispatch,
}))
@mountToTab()
class EvalPoint extends Component {
  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      finishProjectFlow: { getPointList, getPointItemList },
    } = this.props;

    const newDataSource = update(getPointItemList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    getPointList[0].itemList = newDataSource;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        getPointItemList: newDataSource,
        getPointList,
      },
    });
  };

  render() {
    const {
      loading,
      finishProjectFlow: { getPointList, getPointItemList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'iden',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/getPoint`],
      dataSource: getPointItemList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalPoint',
          align: 'center',
          width: '30%',
        },
        {
          title: '评分',
          dataIndex: 'evalScore',
          align: 'center',
          width: '35%',
          render: (value, row, index) => (
            <Rate
              count={Number(row.scoreTo)}
              allowHalf
              value={Number(row.evalScore) || Number(row.defaultScore)}
              onChange={this.onCellChanged(index, 'evalScore')}
            />
          ),
        },
        {
          title: '简评',
          dataIndex: 'evalComment',
          align: 'center',
          width: '35%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.evalComment}
              onChange={this.onCellChanged(index, 'evalComment')}
            />
          ),
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default EvalPoint;
