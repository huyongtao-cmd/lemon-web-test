import React from 'react';
import { selectUsersWithBu } from '@/services/gen/list';
import { getReimTmpl } from '@/services/user/expense/expense';
import { Select, Table } from 'antd';
import update from 'immutability-helper';

// eslint-disable-next-line react/prefer-stateless-function
class PreDocList extends React.Component {
  // // eslint-disable-next-line no-useless-constructor
  // constructor(props) {
  //   super(props);
  // }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataSource, domain } = this.props;

    let value = null;
    value = rowFieldValue;
    // console.log(rowIndex, rowField, rowFieldValue, value);

    const newDataList = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });

    dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
  };

  render() {
    const { dataSource, loading, reimTmpl = [], disabled } = this.props;

    const types = reimTmpl.filter(r => r.preWfType).map(r => ({
      ...r,
      // key: r.preWfType,
      // label: r.preWfTypeDesc,
    }));
    // console.log(types);
    // console.log(dataSource);

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: dataSource.filter(d => d.preWfTypeDesc),
      loading,
      bordered: true,
      pagination: false,
      size: 'small',
      columns: [
        {
          title: '#',
          dataIndex: 'index',
          align: 'center',
          width: 50,
          render: (value, row, index) => index + 1,
        },
        {
          title: '前置流程类型',
          width: 200,
          dataIndex: 'preWfTypeDesc',
          render: (value, row, index) => <span>{value || '无前置流程'}</span>,
        },
        {
          title: '前置单据号',
          dataIndex: 'preDocId',
          width: 200,
          render: (value, row, index) => {
            const accPreWf = types.filter(t => t.accId === dataSource[index].accId);
            return accPreWf.length ? (
              <Select
                disabled={disabled}
                style={{ width: '100%' }}
                value={value || undefined}
                onChange={this.onCellChanged(index, 'preDocId')}
                // source={dataSource.map(d => ({ ...d, name: `${d.name} ${d.code}` }))}
                // showSearch
                // onSearch={this.onSearch}
              >
                {accPreWf[0].preWfList.map(d => (
                  <Select.Option key={d.id}>{d.name}</Select.Option>
                ))}
              </Select>
            ) : (
              <span>无前置流程</span>
            );
          },
        },
      ],
    };

    return <Table {...tableProps} />;
  }
}

export default PreDocList;
//
// <Select style={{ width: '100%' }}>
//   {accPreWf.map(r => (
//     <Select.Option key={r.key}>{r.label}</Select.Option>
//   ))}
// </Select>
