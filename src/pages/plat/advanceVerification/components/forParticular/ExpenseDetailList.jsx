import React from 'react';
import update from 'immutability-helper';
import { clone, uniq, isEmpty, isNil } from 'ramda';
import { Cascader, Checkbox, DatePicker, Input, InputNumber } from 'antd';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import { getReimTmpl } from '@/services/user/expense/expense';
import { selectUsers } from '@/services/user/management/leads';
import { UdcSelect } from '@/pages/gen/field';
import EditableDataTable from '@/components/common/EditableDataTable';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { MulResSelect } from '../index';

const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children') => {
  const data = clone(array);
  const result = [];
  const hash = {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });

  data.forEach(item => {
    const hashVP = hash[item[pid]];
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = []);
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

const str2Tree = list => {
  const r = list;
  // console.log(r);
  const level1 = uniq(
    r.map(re => ({
      pid: undefined,
      id: re[0],
      label: re[0],
      value: re[0],
    }))
  );
  const level2 = uniq(
    r.map(re => ({
      pid: re[0],
      id: re[0] + re[1],
      label: re[1],
      value: re[1],
    }))
  );
  const level3 = uniq(
    r.filter(re => re[2]).map(re => ({
      pid: re[0] + re[1],
      id: re[0] + re[1] + re[2],
      label: re[2],
      value: re[2],
    }))
  );
  const result = arrayToTree([...level1, ...level2, ...level3], 'id', 'pid');
  // console.log(result);
  return result;
};

class ExpenseDetailList extends React.Component {
  state = {
    selMulSource: [],
    selMulloading: true,
  };

  componentDidMount() {
    selectUsers().then(res => {
      this.setState({
        selMulSource: Array.isArray(res.response) ? res.response : [],
        selMulloading: false,
      });
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataSource, domain } = this.props;

    let value = null;

    if (rowField === 'reimDesc') {
      // eslint-disable-next-line prefer-destructuring
      value = rowFieldValue.target.value;
    } else if (rowField === 'taxAmt') {
      // 税额
      value = rowFieldValue || 0;
    } else if (rowField === 'adjustedAmt') {
      // 调整后金额
      value = rowFieldValue || 0;
      const taxRate = parseInt(dataSource[rowIndex].taxRate || 0, 10);
      const reimAmt = div(mul(value, 100), add(taxRate, 100));
      const taxAmt = sub(value, reimAmt);
      const newDataList = update(dataSource, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          reimAmt: {
            $set: reimAmt,
          },
          taxAmt: {
            $set: taxAmt,
          },
        },
      });
      dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
      return;
    } else if (rowField === 'invCnt') {
      value = rowFieldValue || 0;
    } else if (rowField === 'feeDate') {
      value = rowFieldValue ? moment(rowFieldValue).format('YYYY-MM-DD') : undefined;
    } else if (rowField === 'taxedReimAmt') {
      value = rowFieldValue || 0;
      if (!checkIfNumber(value)) return;
      const taxRate = parseInt(dataSource[rowIndex].taxRate || 0, 10);
      const reimAmt = div(mul(value, 100), add(taxRate, 100));
      const taxAmt = sub(value, reimAmt);
      const newDataList = update(dataSource, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          reimAmt: {
            $set: reimAmt,
          },
          taxAmt: {
            $set: taxAmt,
          },
        },
      });
      dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
      return;
    } else if (rowField === 'taxRate') {
      value = rowFieldValue || 0;
      const { taxedReimAmt } = dataSource[rowIndex];
      if (!checkIfNumber(taxedReimAmt)) return;
      const taxRate = parseInt(value, 10);
      const reimAmt = div(mul(taxedReimAmt, 100), add(taxRate, 100));
      const taxAmt = sub(taxedReimAmt, reimAmt);

      const newDataList = update(dataSource, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          reimAmt: {
            $set: reimAmt,
          },
          taxAmt: {
            $set: taxAmt,
          },
        },
      });
      dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
      return;
    } else if (rowField === 'invFlag') {
      value = rowFieldValue.target.checked ? 1 : 0;
    } else if (rowField === 'accId') {
      const { reimTmpl } = this.props;
      const cand = reimTmpl.filter(t => t.accId && t.accName).map(t => ({
        ...t,
        parsedName: t.accName.split('-'),
      }));
      // console.log(cand);
      cand.forEach(c => {
        if (
          c.parsedName.length === rowFieldValue.length &&
          JSON.stringify(c.parsedName) === JSON.stringify(rowFieldValue)
        ) {
          // console.log(rowFieldValue, c.parsedName);
          value = c.accId;
        }
      });

      const newDataList = update(dataSource, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          preWfType: {
            // 联动前置流程类型
            $set: reimTmpl.filter(d => d.accId === value)[0].preWfType,
          },
          preWfTypeDesc: {
            // 联动前置流程类型
            $set: reimTmpl.filter(d => d.accId === value)[0].preWfTypeDesc,
          },
        },
      });

      dispatch({ type: `${domain}/updateState`, payload: { detailList: newDataList } });
      return;
    } else {
      value = rowFieldValue;
    }

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
    const {
      dataSource,
      loading,
      reimTmpl = [],
      disabled,
      domain,
      enableAdjustedAmt,
      isSpec = false,
      onTotalChange,
    } = this.props;
    const TOTAL_LABEL = 'myTotal';

    const { selMulSource, selMulloading } = this.state;

    const parsed = reimTmpl.filter(t => t.accId && t.accName).map(t => ({
      ...t,
      parsedName: t.accName.split('-'),
    }));

    const accList = str2Tree(parsed.map(p => p.parsedName));
    // console.log('dddd', accNoList);

    const totalLine = {
      id: TOTAL_LABEL,
      taxAmt: dataSource.reduce((a, b) => add(a, b.taxAmt), 0),
      reimAmt: dataSource.reduce((a, b) => add(a, b.reimAmt), 0),
      taxedReimAmt: dataSource.reduce((a, b) => add(a, b.taxedReimAmt), 0),
      invCnt: dataSource.reduce((a, b) => add(a, b.invCnt), 0),
      adjustedAmt: dataSource.reduce((a, b) => add(a, b.adjustedAmt), 0),
      invFlag: dataSource.filter(r => r.invFlag).length,
    };

    onTotalChange && onTotalChange(totalLine);

    const myDataSource = dataSource.concat(totalLine);

    const tableProps = {
      readOnly: disabled,
      scroll: {
        x: 1800,
      },
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: record.id === TOTAL_LABEL,
        }),
      },
      rowKey: 'id',
      sortBy: 'id',
      dataSource: myDataSource,
      loading,
      size: 'small',
      onChange: filters => {
        this.fetchData(filters);
      },
      onAdd: newRow => {
        const { dispatch, reimResId } = this.props;
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  invCnt: 0,
                  currCode: 'CNY',
                  taxAmt: 0,
                  reimAmt: 0,
                  taxedReimAmt: 0,
                  adjustedAmt: 0,
                  invFlag: 1,
                  taxRate: '0',
                  resIds: reimResId ? [`${reimResId}`] : [], // 新增一行的时候，默认把当前的报销人给放进来。PS: 转换成字符串是因为number的匹配不到，这个没时间纠结了
                  feeDate: (isSpec ? moment().add(-1, 'month') : moment()).format('YYYY-MM-DD'),
                },
              ],
            }),
          },
        });
      },
      onCopyItem: copied => {
        const { dispatch } = this.props;
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: update(dataSource, { $push: copied }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        const { dispatch } = this.props;
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: newDataSource,
          },
        });
      },

      columns: [
        {
          title: '#',
          dataIndex: 'index',
          align: 'center',
          // fixed: true,
          width: 50,
          render: (value, row, index) => (row.id !== TOTAL_LABEL ? index + 1 : '合计'),
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <DatePicker
                allowClear={false}
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                value={moment(value)}
                onChange={this.onCellChanged(index, 'feeDate')}
                disabledDate={current => {
                  if (!isSpec) return false;
                  return current && current >= moment().startOf('month');
                }}
              />
            ),
        },
        {
          title: '科目',
          dataIndex: 'accId',
          align: 'center',
          required: true,
          width: 250,
          render: (value, row, index) => {
            // if (disabled) {
            //   return <span style={{ whiteSpace: 'nowrap' }}>{row.accName}</span>;
            // }
            const v = parsed.filter(p => p.accId === value)[0];
            return (
              row.id !== TOTAL_LABEL && (
                <Cascader
                  // disabled={
                  //   row.id === TOTAL_LABEL ||
                  //   (isSpec === true && disabled === true) ||
                  //   (disabled && !enableAdjustedAmt)
                  // }
                  disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                  className="x-fill-100"
                  value={v ? v.parsedName : undefined}
                  placeholder=""
                  options={accList}
                  // dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  // defaultExpandAll
                  onChange={this.onCellChanged(index, 'accId')}
                />
              )
            );
          },
        },
        {
          title: '报销说明',
          dataIndex: 'reimDesc',
          align: 'center',
          required: true,
          width: 200,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Input.TextArea
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                autosize={{ minRows: 1, maxRows: 3 }}
                className="x-fill-100"
                defaultValue={value}
                onBlur={this.onCellChanged(index, 'reimDesc')}
              />
            ),
        },
        {
          title: '报销金额(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'center',
          required: true,
          width: 100,
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['请输入报销金额(含税)']);
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
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={2}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'taxedReimAmt')}
            />
          ),
        },
        {
          title: '货币码',
          dataIndex: 'currCode',
          align: 'center',
          required: true,
          width: 50,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <UdcSelect
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                code="COM:CURRENCY_KIND"
                allowClear={false}
                value={value}
                className="x-fill-100"
                onChange={this.onCellChanged(index, 'currCode')}
              />
            ),
        },
        {
          title: '增值税税率',
          dataIndex: 'taxRate',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <UdcSelect
                allowClear={false}
                // disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                code="COM.TAX_RATE"
                value={isEmpty(value) ? value : value + ''}
                className="x-fill-100"
                onChange={this.onCellChanged(index, 'taxRate')}
              />
            ),
        },
        {
          title: '税额',
          dataIndex: 'taxAmt',
          align: 'center',
          required: true,
          width: 90,
          render: (value, row, index) => (
            <InputNumber
              // disabled={
              //   row.id === TOTAL_LABEL || disabled !== true || (disabled && !enableAdjustedAmt)
              // }
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={2}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'taxAmt')}
            />
          ),
        },
        {
          title: '报销金额(不含税)',
          dataIndex: 'reimAmt',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={2}
              className="number-left x-fill-100"
              value={value}
            />
          ),
        },
        {
          title: '有票',
          dataIndex: 'invFlag',
          align: 'center',
          width: 50,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL ? (
              <Checkbox
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                className="x-fill-100"
                checked={!!value}
                onChange={this.onCellChanged(index, 'invFlag')}
              />
            ) : (
              value
            ),
        },
        {
          title: '调整后金额',
          dataIndex: 'adjustedAmt',
          align: 'center',
          width: 150,
          hidden: !enableAdjustedAmt,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={2}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'adjustedAmt')}
            />
          ),
        },
        {
          title: '发票张数',
          dataIndex: 'invCnt',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={0}
              value={value}
              className="number-left x-fill-100"
              onChange={this.onCellChanged(index, 'invCnt')}
            />
          ),
        },
        {
          title: '费用承担人',
          dataIndex: 'resIds',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) =>
            // console.log(value, row);
            // const { reimResNames = [] } = row;
            row.id !== TOTAL_LABEL && (
              <MulResSelect
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                value={value}
                onChange={this.onCellChanged(index, 'resIds')}
                selSource={selMulSource}
                loading={selMulloading}
              />
            ),
        },
        {
          title: '承担费用',
          dataIndex: 'shareAmt',
          align: 'center',
          width: 100,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL
              ? row.resIds &&
                row.resIds.length &&
                div(row.taxedReimAmt, row.resIds.length).toFixed(2)
              : null,
        },
      ],
    };

    return <EditableDataTable {...tableProps} />;
  }
}

export default ExpenseDetailList;
