/* eslint-disable array-callback-return */
/* eslint-disable prefer-const */
import React from 'react';
import update from 'immutability-helper';
import { TimePicker, DatePicker, Input, InputNumber, Button, Row, Col } from 'antd';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { Selection } from '@/pages/gen/field';
import EditableDataTable from '@/components/common/EditableDataTable';
import { selectBus } from '@/services/org/bu/bu';

import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
class ReimbursementDetailList extends React.Component {
  state = {
    // selMulSource: [],
    // selMulloading: true,
  };

  componentDidMount() {}

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    // eslint-disable-next-line no-console
    const { dispatch, dataSource, domain, visible, formData } = this.props;
    let value = null;
    if (rowField === 'sharingBuId') {
      value = rowFieldValue;
    }
    if (rowField === 'sharingNote') {
      value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    }
    if (rowField === 'sharingAmt') {
      value = rowFieldValue || 0;
      if (!checkIfNumber(value)) return;
      let sumAmt = 0;
      dataSource.map((item, index) => {
        if (index !== rowIndex) {
          sumAmt = add(sumAmt, item.sharingAmt);
        }
      });
      if (add(sumAmt, value) > formData.taxedReimAmt) {
        createMessage({ type: 'warn', description: '分摊金额不能大于总金额' });
        return;
      }
      // let sharingProportion = mul(div(value, formData.taxedReimAmt), 100) + '%';
      const newDataList = update(dataSource, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          // sharingProportion: {
          //   $set: sharingProportion,
          // },
        },
      });
      dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
      return;
    }
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
    const { dispatch, dataSource, domain, readOnly, baseBuDataSource } = this.props;
    const tableProps = {
      readOnly,
      rowSelection: {},
      rowKey: 'id',
      sortBy: 'id',
      dataSource,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  sharingAmt: 0,
                  // sharingProportion: '0%',
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
            detailList: newDataSource,
          },
        });
      },

      columns: [
        {
          title: '费用分摊BU',
          dataIndex: 'sharingBuId',
          align: 'center',
          required: true,
          width: 90,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuDataSource}
              disabled={readOnly}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              value={value}
              placeholder="请选择费用分摊BU"
              onChange={this.onCellChanged(index, 'sharingBuId')}
            />
          ),
        },
        {
          title: '分摊金额',
          dataIndex: 'sharingAmt',
          align: 'center',
          required: true,
          width: 90,
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['分摊金额']);
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              disabled={readOnly}
              min={0}
              precision={2}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'sharingAmt')}
            />
          ),
        },
        // {
        //   title: '分摊比例',
        //   dataIndex: 'sharingProportion',
        //   align: 'center',
        //   width: 90,
        //   render: (value, row, index) => (
        //     <Input disabled className="number-left x-fill-100" value={value} defaultValue={value} />
        //   ),
        // },
        {
          title: '分摊原因',
          dataIndex: 'sharingNote',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              disabled={readOnly}
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'sharingNote')}
            />
          ),
        },
      ],
    };

    return <EditableDataTable {...tableProps} />;
  }
}

export default ReimbursementDetailList;
