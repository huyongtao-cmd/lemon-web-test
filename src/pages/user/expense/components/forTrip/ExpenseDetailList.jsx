import React from 'react';
import update from 'immutability-helper';
import {
  TimePicker,
  DatePicker,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Icon,
  Table,
  Tooltip,
} from 'antd';
import moment from 'moment';
import { isEmpty, isNil, findIndex } from 'ramda';
import { selectOus } from '@/services/gen/list';
import { selectUsers } from '@/services/user/management/leads';
import { Selection } from '@/pages/gen/field';
import EditableDataTable from '@/components/common/EditableDataTable';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { flatten } from '@/utils/arrayUtils';
import { MulResSelect } from '../index';
import createMessage from '@/components/core/AlertMessage';
import styles from './style.less';
import InvoiceModal from '../InvoiceModal';

class ExpenseDetailList extends React.Component {
  state = {
    selMulSource: [],
    selMulloading: true,
    visibleInvo: false,
    selFeeDate: null,
    invSelRows: [],
    selReimdListId: null,
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
    const { dispatch, dataSource, domain, visible } = this.props;
    const currItem = dataSource[rowIndex];
    let value = null;

    if (rowField === 'reimDesc') {
      // eslint-disable-next-line prefer-destructuring
      value = rowFieldValue.target.value;
    } else if (rowField === 'noinvReason') {
      // 无发票原因
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
    } else if (rowField === 'feeDate' || rowField === 'feeDateTo') {
      value = rowFieldValue ? moment(rowFieldValue).format('YYYY-MM-DD') : undefined;
      this.setState({
        selFeeDate: value,
      });
      if (rowField === 'feeDate') {
        dispatch({
          type: `${domain}/updateTableCell`,
          payload: {
            item: currItem,
            ruleExplain: '',
            feeDate: rowFieldValue ? moment(rowFieldValue).format('YYYY-MM-DD') : undefined,
          },
        });
      }
    } else if (rowField === 'dtime') {
      value = rowFieldValue ? moment(rowFieldValue).format('HH:mm:ss') : undefined;
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

  toggleVisible = () => {
    const { visibleInvo } = this.state;
    this.setState({
      visibleInvo: !visibleInvo,
      // invSelRows: [],
    });
  };

  // 行编辑触发事件
  onInvoiceCellChanged = (index, value, name) => {
    const { dispatch, dataSource, domain } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${domain}/updateState`,
      payload: { [dataSource]: newDataSource },
    });
  };

  // 选中发票
  handleModelOk = (e, checkRows, closeFlag = true) => {
    const { dataSource, dispatch, domain } = this.props;
    const { selReimdListId } = this.state;
    // 获取点击的是哪条数据
    const rowIndex = dataSource.findIndex(v => v.id === selReimdListId);
    const rowTaxRate = dataSource.filter(v => v.id === selReimdListId)[0]?.taxRate;
    const currItem = dataSource.filter(v => v.id === selReimdListId)[0];

    // 每次重新选择发票后，更新ruleExplain为空
    this.onInvoiceCellChanged(rowIndex, '', 'ruleExplain');
    // 更新有票无票
    this.onInvoiceCellChanged(rowIndex, checkRows.length ? 1 : 0, 'invFlag');
    // 更新发票张数
    this.onInvoiceCellChanged(rowIndex, checkRows.length, 'invCnt');
    // 更新税额
    // this.onInvoiceCellChanged(
    //   rowIndex,
    //   !isEmpty(checkRows) ? checkRows.map(v => v.invTotalTax).reduce((x, y) => x + y) : 0,
    //   'invTotalTax'
    // );
    // 更新发票金额
    this.onInvoiceCellChanged(
      rowIndex,
      !isEmpty(checkRows) ? checkRows.map(v => v.amountTax).reduce((x, y) => add(x, y)) : 0,
      'amountTax'
    );
    // 选了发票之后，报销金额(含税)默认为发票金额
    this.onInvoiceCellChanged(
      rowIndex,
      !isEmpty(checkRows) ? checkRows.map(v => v.amountTax).reduce((x, y) => add(x, y)) : 0,
      'taxedReimAmt'
    );
    // 选了发票之后，更新报销金额(不含税)默认为发票金额
    this.onInvoiceCellChanged(
      rowIndex,
      div(
        mul(
          !isEmpty(checkRows) ? checkRows.map(v => v.amountTax).reduce((x, y) => add(x, y)) : 0,
          100
        ),
        add(rowTaxRate, 100)
      ),
      'reimAmt'
    );
    // 选了发票之后，更新税额(不含税的乘税率)
    this.onInvoiceCellChanged(
      rowIndex,
      mul(
        div(
          mul(
            !isEmpty(checkRows) ? checkRows.map(v => v.amountTax).reduce((x, y) => add(x, y)) : 0,
            100
          ),
          add(rowTaxRate, 100)
        ),
        div(rowTaxRate, 100)
      ),
      'taxAmt'
    );
    // 更新发票list
    this.onInvoiceCellChanged(rowIndex, checkRows, 'invoiceentity');

    // 更新违反规则信息
    const ruleExplain = Array.from(
      new Set(
        checkRows
          .map(v => v.errRules)
          .filter(v => v)
          .join(',')
          .split(',')
      )
    ).join(',');
    this.onInvoiceCellChanged(rowIndex, ruleExplain, 'ruleExplain');

    if (closeFlag) {
      // 更新完成数据，关闭弹窗
      this.toggleVisible();
    }
  };

  delInvoiceItemFun = invSelected => {
    // 选中发票的list
    const { dataSource, dispatch, domain } = this.props;
    const { selReimdListId } = this.state;

    const rowIndex = dataSource.findIndex(v => v.id === selReimdListId);
    const { invoiceentity } = dataSource[rowIndex];

    if (!isEmpty(invoiceentity)) {
      // 删除的发票编号集合
      const delInvNo = invSelected.map(v => v.invoiceNo);

      // 去除删除后发票的list
      const newInvoiceentity = invoiceentity.filter(v => !delInvNo.includes(v.invoiceNo));

      // 获取点击的是哪条数据
      this.handleModelOk(1, newInvoiceentity, false);
    }
  };

  detailEntityTable = (record, index, indent, expanded) => {
    // 合计行不展开内容
    if (record.id === 'myTotal') {
      return null;
    }
    const columns = [
      {
        title: '发票号码',
        dataIndex: 'invoiceNo',
        align: 'center',
      },
      {
        title: '开票日期',
        dataIndex: 'invoiceDate',
        align: 'center',
      },
      {
        title: '发票类型',
        dataIndex: 'invTypeDesc',
        align: 'center',
        render: (value, row, i) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={value}>
              <pre>{`${value.substr(0, 15)}...`}</pre>
            </Tooltip>
          ) : (
            <pre>{value}</pre>
          ),
      },
      {
        title: '发票金额',
        key: 'amountTax',
        dataIndex: 'amountTax',
        align: 'right',
      },
      {
        title: '归属人',
        dataIndex: 'invOwnerName',
        align: 'center',
      },
    ];

    return (
      <Table
        rowKey="id"
        style={{ marginLeft: '-8px' }}
        columns={columns}
        dataSource={record.invoiceentity}
        pagination={false}
        // rowSelection={rowSelection}
      />
    );
  };

  render() {
    const {
      dispatch,
      dataSource,
      loading,
      reimTmpl = [],
      disabled,
      domain,
      enableAdjustedAmt,
      cities,
      isPersonalAndTrip,
      formData,
      expenseType,
      reimResId,
    } = this.props;
    const TOTAL_LABEL = 'myTotal';
    const {
      selMulSource,
      selMulloading,
      visibleInvo,
      selFeeDate,
      invSelRows,
      selReimdListId,
    } = this.state;
    const param = fromQs();

    const parsed = reimTmpl.filter(t => t.accId && t.accName).map(t => ({
      ...t,
      parsedName: t.accName.split('-'),
    }));
    // console.log('dddd', accNoList);

    const { redRow } = styles;
    const myDataSource = dataSource.concat({
      id: TOTAL_LABEL,
      taxAmt: dataSource.reduce((a, b) => add(a, b.taxAmt), 0),
      reimAmt: dataSource.reduce((a, b) => add(a, b.reimAmt), 0),
      taxedReimAmt: dataSource.reduce((a, b) => add(a, b.taxedReimAmt), 0),
      invCnt: dataSource.reduce((a, b) => add(a, b.invCnt), 0),
      adjustedAmt: dataSource.reduce((a, b) => add(a, b.adjustedAmt), 0),
      invFlag: dataSource.filter(r => r.invFlag).length,
      amountTax: dataSource.reduce((a, b) => add(a, b.amountTax || 0), 0),
      invTotalTax: dataSource.reduce((a, b) => add(a, b.invTotalTax || 0), 0),
    });
    const tableProps = {
      readOnly: disabled,
      scroll: {
        x: 2800,
      },
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: record.id === TOTAL_LABEL,
        }),
      },
      rowKey: 'id',
      sortBy: 'id',
      dataSource: myDataSource,
      expandedRowRender: this.detailEntityTable,
      loading,
      size: 'small',
      onChange: filters => {
        this.fetchData(filters);
      },
      rowClassName: (record, index) => {
        if (record.exceedHotelFee) {
          return redRow;
        }
        return '';
      },
      buttons: [
        // {
        //   key: 'food',
        //   title: '生成餐费',
        //   // icon: 'upload',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows) => {
        //     console.log(selectedRowKeys, selectedRows);
        //   },
        // },
      ],
      onAdd: newRow => {
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  invCnt: 1,
                  currCode: 'CNY',
                  taxRate: '0',
                  taxAmt: 0,
                  reimAmt: 0,
                  taxedReimAmt: 0,
                  adjustedAmt: 0,
                  resIds: reimResId ? [`${reimResId}`] : [], // 新增一行的时候，默认把当前的报销人给放进来。PS: 转换成字符串是因为number的匹配不到，这个没时间纠结了
                  // expenseByType: 'ELITESLAND',
                  feeDate: moment().format('YYYY-MM-DD'),
                  feeDateTo: undefined,
                  dtime: moment().format('HH:mm'),
                  amountTax: 0,
                  invTotalTax: 0,
                  lineNo: dataSource.length + 1,
                  invoiceentity: [],
                },
              ],
            }),
          },
        });
      },
      onCopyItem: copied => {
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            detailList: update(dataSource, { $push: [{ ...copied[0], invoiceentity: [] }] }),
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
          title: '#',
          dataIndex: 'index',
          align: 'center',
          // fixed: true,
          width: 50,
          render: (value, row, index) => (row.id !== TOTAL_LABEL ? index + 1 : '合计'),
        },
        {
          title: '差旅费用类型',
          dataIndex: 'feeType',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Selection.UDC
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                code="ACC:REIM_TRIP_EXP_TYPE"
                allowClear={false}
                value={value}
                className="x-fill-100"
                // onChange={this.onCellChanged(index, 'feeType')}
                onValueChange={udcValue => {
                  if (isNil(udcValue) || isEmpty(udcValue)) {
                    // do nothing
                  } else {
                    const { sphd1, code } = udcValue;
                    const carriedTaxRate = sphd1 || 0;
                    const { taxedReimAmt } = row;
                    if (!checkIfNumber(taxedReimAmt)) return;
                    const taxRate = !isPersonalAndTrip ? row.taxRate : parseInt(carriedTaxRate, 10);
                    const reimAmt = !isPersonalAndTrip
                      ? row.reimAmt
                      : div(mul(taxedReimAmt, 100), add(taxRate, 100));
                    const taxAmt = !isPersonalAndTrip ? row.taxAmt : sub(taxedReimAmt, reimAmt);

                    const newDataList = update(dataSource, {
                      [index]: {
                        taxRate: {
                          $set: taxRate,
                        },
                        feeType: {
                          $set: code,
                        },
                        reimAmt: {
                          $set: reimAmt,
                        },
                        taxAmt: {
                          $set: taxAmt,
                        },
                      },
                    });
                    dispatch({
                      type: `${domain}/updateState`,
                      payload: { detailList: newDataList },
                    });
                    if (udcValue.code === 'MEAL') {
                      const newDataList1 = update(newDataList, {
                        [index]: {
                          toPlace: {
                            $set: '',
                          },
                        },
                      });
                      dispatch({
                        type: `${domain}/updateState`,
                        payload: { detailList: newDataList1 },
                      });
                    }
                  }
                }}
              />
            ),
        },
        {
          title: '日期(起)',
          dataIndex: 'feeDate',
          align: 'center',
          required: true,
          width: 150,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <DatePicker
                allowClear={false}
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                defaultValue={moment(value)}
                onChange={this.onCellChanged(index, 'feeDate')}
              />
            ),
        },
        {
          title: '日期(止)',
          dataIndex: 'feeDateTo',
          align: 'center',
          width: 150,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <DatePicker
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                defaultValue={value ? moment(value) : undefined}
                onChange={this.onCellChanged(index, 'feeDateTo')}
              />
            ),
        },
        {
          title: '地点(从)',
          dataIndex: 'fromPlace',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) => {
            const v = parsed.filter(p => p.accId === value)[0];
            return (
              row.id !== TOTAL_LABEL && (
                <Selection
                  allowClear={false}
                  disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                  value={value}
                  source={cities}
                  onChange={this.onCellChanged(index, 'fromPlace')}
                />
              )
            );
          },
        },
        {
          title: '地点(至)',
          dataIndex: 'toPlace',
          align: 'center',
          width: 100,
          render: (value, row, index) => {
            const v = parsed.filter(p => p.accId === value)[0];
            return (
              row.id !== TOTAL_LABEL && (
                <Selection
                  disabled={
                    row.id === TOTAL_LABEL ||
                    (disabled && !enableAdjustedAmt) ||
                    row.feeType === 'MEAL'
                  }
                  value={value}
                  source={cities}
                  onChange={this.onCellChanged(index, 'toPlace')}
                />
              )
            );
          },
        },
        {
          title: '时间',
          dataIndex: 'dtime',
          hidden: true,
          align: 'center',
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <TimePicker
                // use12Hours
                // format="h:mm a"
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                value={value ? moment(value, 'HH:mm') : undefined}
                format="HH:mm"
                onChange={this.onCellChanged(index, 'dtime')}
              />
            ),
        },
        {
          title: '报销金额(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'center',
          required: true,
          width: 160,
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
            <Row gutter={6}>
              <Col span={18}>
                <InputNumber
                  disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                  // min={0} // 差旅报销可以输入负数
                  precision={2}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/\$\s?|(,*)/g, '')}
                  className="number-left x-fill-100"
                  value={value}
                  onChange={this.onCellChanged(index, 'taxedReimAmt')}
                />
              </Col>
              <Col span={2} hidden={row.id === TOTAL_LABEL || row.feeType !== 'MEAL'}>
                <Button
                  disabled={
                    !(row.feeDate && row.feeDateTo && row.fromPlace)
                    //  || (disabled && !enableAdjustedAmt)
                  }
                  className="tw-btn-primary"
                  icon="reconciliation"
                  title="差旅餐补自动计算"
                  onClick={() => {
                    const { visible } = this.props;
                    const { id, feeType, fromPlace, feeDate, feeDateTo } = row;
                    dispatch({
                      type: `${domain}/updateState`,
                      payload: {
                        visible: !visible,
                        modalParmas: {
                          id,
                          index,
                          feeType,
                          fromPlace,
                          feeDate,
                          feeDateTo,
                          days: moment(feeDateTo).diff(moment(feeDate), 'days'),
                        },
                      },
                    });
                    dispatch({
                      type: `${domain}/getMealFee`,
                      payload: {
                        feeType,
                        fromPlace,
                        resId: formData.reimResId,
                      },
                    }).then(res => {
                      if (!res.ok) {
                        createMessage({
                          type: 'error',
                          description: res.reason || '获取餐费额度失败',
                        });
                        return;
                      }
                      const { modalParmas, mealMoenyList = [] } = this.props;

                      const { days } = modalParmas;

                      const arr = [];

                      for (let i = 0; i <= days; i += 1) {
                        const nowDate = moment(feeDate)
                          .add(i, 'days')
                          .format('YYYY-MM-DD');
                        const tt = mealMoenyList.filter(v => v.tripDate === nowDate);
                        if (tt.length) {
                          arr.push({ ...tt[0], id: i });
                        } else {
                          arr.push({
                            id: i,
                            tripDate: moment(feeDate)
                              .add(i, 'days')
                              .format('YYYY-MM-DD'),
                            morning: '1',
                            noon: '1',
                            night: '1',
                            meals: res.datum.feeAmt || 0,
                            feeAmt: res.datum.feeAmt || 0,
                          });
                        }
                      }

                      dispatch({
                        type: `${domain}/updateState`,
                        payload: { mealMoenyList: arr },
                      });
                    });
                  }}
                />
              </Col>
            </Row>
          ),
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
          title: '规则检查说明',
          dataIndex: 'ruleExplain',
          width: 200,
          align: 'center',
          render: value => <span style={{ color: '#f8ac30' }}>{value}</span>,
        },
        {
          title: '关联发票',
          dataIndex: 'invoice',
          required: true,
          width: 200,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Input
                value={row?.invoiceentity?.map(v => v.invoiceNo).join(',')}
                disabled
                addonAfter={
                  disabled ? (
                    ''
                  ) : (
                    <a
                      className="tw-link-primary"
                      // disabled={fromQs().taskId || fromQs().mode === 'view'}
                      onClick={() => {
                        this.setState(
                          {
                            selFeeDate: row.feeDate, // 发票时间只对比开始时间即可
                            invSelRows: row?.invoiceentity || [],
                            selReimdListId: row.id,
                          },
                          () => {
                            dispatch({
                              type: `invoiceList/updateExpenseSearchForm`,
                              payload: {
                                invSelected: row?.invoiceentity || [],
                              },
                            });
                            this.toggleVisible();
                          }
                        );
                      }}
                    >
                      <Icon type="search" />
                    </a>
                  )
                }
              />
            ),
        },
        {
          title: '无发票原因',
          dataIndex: 'noinvReason',
          align: 'center',
          width: 200,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Input.TextArea
                disabled={disabled}
                // disabled={fromQs().taskId || fromQs().mode === 'view'}
                autosize={{ minRows: 1, maxRows: 3 }}
                className="x-fill-100"
                defaultValue={value}
                onChange={this.onCellChanged(index, 'noinvReason')}
              />
            ),
        },
        {
          title: '发票金额',
          dataIndex: 'amountTax',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              disabled
              // disabled={
              //   row.id === TOTAL_LABEL ||
              //   (isSpec === true && disabled === true) ||
              //   (disabled && !enableAdjustedAmt) ||
              //   param.normalEdit === 'true'
              // }
              precision={2}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'amountTax')}
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
              <Selection.UDC
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
          // required: true,
          width: 100,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Selection.UDC
                allowClear={false}
                // disabled
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
          // required: true,
          width: 90,
          render: (value, row, index) => (
            <InputNumber
              // disabled
              // disabled={
              //   row.id === TOTAL_LABEL || disabled !== true || (disabled && !enableAdjustedAmt)
              // }
              disabled={
                row.id === TOTAL_LABEL ||
                (disabled && !enableAdjustedAmt) ||
                param.normalEdit === 'true' ||
                isNil(fromQs().id)
              }
              min={0}
              precision={2}
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
              disabled={
                row.id === TOTAL_LABEL ||
                (disabled && !enableAdjustedAmt) ||
                param.normalEdit === 'true' ||
                isNil(fromQs().id)
              }
              min={0}
              precision={2}
              className="number-left x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'reimAmt')}
            />
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
              // disabled
              disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
              min={0}
              precision={0}
              value={value}
              // value={row?.invoiceentity?.length}
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
          title: '发票法人',
          dataIndex: 'invOuId',
          align: 'center',
          width: 150,
          render: (value, row, index) =>
            row.id !== TOTAL_LABEL && (
              <Selection
                // allowClear={false}
                disabled={row.id === TOTAL_LABEL || (disabled && !enableAdjustedAmt)}
                value={value}
                source={() => selectOus().then(resp => resp.response)}
                onChange={this.onCellChanged(index, 'invOuId')}
              />
            ),
        },
        // {
        //   title: '费用承担方',
        //   dataIndex: 'expenseByType',
        //   align: 'center',
        //   required: true,
        //   width: 100,
        //   render: (value, row, index) =>
        //     row.id !== TOTAL_LABEL && (
        //       <UdcSelect
        //         allowClear={false}
        //         disabled={disabled}
        //         code="ACC:REIM_EXP_BY"
        //         value={value}
        //         className="x-fill-100"
        //         onChange={this.onCellChanged(index, 'expenseByType')}
        //       />
        //     ),
        // },
      ],
    };

    return (
      <>
        <EditableDataTable {...tableProps} />
        <InvoiceModal
          title="选择发票"
          visible={visibleInvo}
          expenseType={expenseType}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          delInvoiceItem={this.delInvoiceItemFun}
          params={{
            feeDate: selFeeDate,
            invSelRows,
            reimResId,
            formData,
            // 一条发票信息只能对应一条明细
            alreadySel: flatten(
              dataSource
                .filter(v => v.id !== selReimdListId)
                .map(
                  v => (Array.isArray(v.invoiceentity) ? v.invoiceentity.map(item => item.id) : [])
                )
            )
              .filter(v => v)
              .join(','),
          }}
        />
      </>
    );
  }
}

export default ExpenseDetailList;
