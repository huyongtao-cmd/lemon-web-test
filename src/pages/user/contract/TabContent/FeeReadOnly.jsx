import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Tooltip, Input, Table, InputNumber, DatePicker } from 'antd';
import { isEmpty } from 'ramda';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import moment from 'moment';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'Fee';

@connect(({ loading, dispatch, Fee, userContractEditSub }) => ({
  loading,
  dispatch,
  Fee,
  userContractEditSub,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class FeeReadOnly extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { id } = fromQs();

    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      Fee: { otherFeeList },
      dispatch,
    } = this.props;

    const newotherFeeList = otherFeeList;
    newotherFeeList[index] = {
      ...newotherFeeList[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { otherFeeList: newotherFeeList },
    });
  };

  expandedRowRender = (record, indexUp, indent, expanded) => {
    const {
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    let pageFieldView = [];
    pageConfig.pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_OTHER_FEE_DET') {
        pageFieldView = block.pageFieldViews;
      }
    });

    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const tableProps = {
      sortBy: 'contractOtherFeeId',
      rowKey: 'contractOtherFeeId',
      dataSource: record.detils,
      pagination: false,
      columns: [
        // {
        //   title: '费用编号',
        //   dataIndex: 'contractOtherFeeId',
        //   align: 'center',
        // },
        {
          title: '支付阶段',
          key: 'payStage',
          dataIndex: 'payStage',
          align: 'center',
          render: (value, row, index) => value,
        },
        {
          title: '支付金额',
          key: 'payMoney',
          dataIndex: 'payMoney',
          align: 'center',
          required: true,
          render: (value, row, index) => value,
        },
        {
          title: '支付比例',
          key: 'paymentProportion',
          dataIndex: 'paymentProportion',
          align: 'center',
          render: (value, row, index) =>
            `${((row.payMoney / record.contractAmt) * 100).toFixed(2)}%`,
        },
        {
          title: '结算状态',
          key: 'settleStatus',
          dataIndex: 'settleStatus',
          align: 'center',
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择相关结算状态"
              allowClear={false}
              code="ACC:SETTLE_STATUS"
              value={value}
              onChange={val => {
                this.onCellDetailChanged(index, val, 'settleStatus');
              }}
              disabled
            />
          ),
        },
        {
          title: '结算日期',
          key: 'settleDate',
          dataIndex: 'settleDate',
          align: 'center',
          required: true,
          render: (value, row, index) => value && moment(value).format('YYYY-MM-DD'),
          // <DatePicker
          //   defaultValue={moment(value)}
          //   value={value}
          //   onChange={val => this.onCellDetailChanged(index, val, 'settleDate')}
          // />),
        },
        {
          title: '结算单据号',
          key: 'settleBillsNo',
          dataIndex: 'settleBillsNo',
          align: 'center',
          render: (value, row, index) => value,
        },
        {
          title: '结算单据类型',
          key: 'settleBillsType',
          dataIndex: 'settleBillsType',
          align: 'center',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择结算单据类型"
              allowClear={false}
              code="ACC:RELATED_SETTLE_TYPE"
              value={value}
              onChange={val => {
                this.onCellDetailChanged(index, val, 'settleBillsType');
              }}
              disabled
            />
          ),
        },
      ]
        .filter(
          col => !col.key || (pageFieldJson[col.key] && pageFieldJson[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJson[col.key].displayName,
          sortNo: pageFieldJson[col.key].sortNo,
          required: pageFieldJson[col.key].requiredFlag === 1,
          options: {
            ...col.options,
            rules: [
              {
                required: pageFieldJson[col.key].requiredFlag === 1,
                message: `请输入${pageFieldJson[col.key].displayName}`,
              },
            ],
          },
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return <Table style={{ marginLeft: '-8px', marginRight: '-8px' }} {...tableProps} />;
  };

  render() {
    const {
      loading,
      dispatch,
      Fee: { otherFeeList },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 7) {
      return <div />;
    }
    let pageFieldView = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_OTHER_FEE') {
        pageFieldView = block.pageFieldViews;
      }
    });
    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const tableProps = {
      sortBy: 'id',
      rowKey: 'feeType',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: otherFeeList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      expandedRowRender: this.expandedRowRender,
      columns: [
        {
          title: '费用编号',
          key: 'feeNo',
          dataIndex: 'feeNo',
          align: 'center',
          width: '6%',
        },
        {
          title: '相关费用类型',
          key: 'feeType',
          dataIndex: 'feeType',
          align: 'center',
          required: true,
          width: '10%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择相关费用类型"
              allowClear={false}
              code="TSK:CONTRACT_FEE_TYPE"
              value={value}
              disabled
            />
          ),
        },
        {
          title: '总额',
          key: 'contractAmt',
          dataIndex: 'contractAmt',
          align: 'right',
          width: '10%',
          render: (value, row, key) => (value ? Number(value).toFixed(1) : 0.0),
        },
        {
          title: '已归集金额',
          key: 'collectedAmount',
          dataIndex: 'collectedAmount',
          align: 'center',
          width: '6%',
        },
        {
          title: '未结金额',
          key: 'outstandingAmount',
          dataIndex: 'outstandingAmount',
          align: 'center',
          width: '6%',
        },
        {
          title: '费用状态',
          key: 'reimStatus',
          dataIndex: 'reimStatus',
          align: 'center',
          required: true,
          width: '10%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择相关费用状态"
              allowClear={false}
              code="ACC:RELATED_REIM_STATUS"
              value={value}
              disabled
            />
          ),
        },
        {
          title: '费用承担方',
          key: 'reimExp',
          dataIndex: 'reimExp',
          align: 'center',
          required: true,
          width: '10%',
          render: (value, row, index) => (
            <Selection.Columns
              value={value}
              placeholder="请选择相关承担方"
              className="x-fill-100"
              source={() => selectBuMultiCol()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onChange={val => {
                this.onCellChanged(index, val, 'reimExp');
              }}
              onColumnsChange={e => {}}
              disabled
            />
          ),
        },
        {
          title: '参与收益比例计算',
          key: 'rateCount',
          dataIndex: 'rateCount',
          align: 'center',
          width: '10%',
          render: (value, row, index) => {
            if (value === 'Yes') {
              return '是';
            }
            if (value === 'No') {
              return '否';
            }
            return value;
          },
        },
        {
          title: '计算有效合同额时应减',
          key: 'feeDeductionWay',
          dataIndex: 'feeDeductionWay',
          align: 'center',
          width: '20%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择计算有效合同额时应减"
              allowClear={false}
              code="COM:YESNO"
              value={value}
              onChange={val => {
                this.onCellChanged(index, val, 'feeDeductionWay');
              }}
              disabled
            />
          ),
        },
        {
          title: '归集来源',
          key: 'reimSource',
          dataIndex: 'reimSource',
          align: 'center',
          width: '10%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="请选择归集来源"
              allowClear={false}
              code="ACC:RELATED_REIM_SOURCE"
              value={value}
              disabled
            />
          ),
        },
        {
          title: '关联单据号',
          key: 'documentNumber',
          dataIndex: 'documentNumber',
          align: 'center',
          width: '20%',
          render: (value, row, index) => value,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          // width: '20%',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ]
        .filter(
          col => !col.key || (pageFieldJson[col.key] && pageFieldJson[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJson[col.key].displayName,
          sortNo: pageFieldJson[col.key].sortNo,
          required: pageFieldJson[col.key].requiredFlag === 1,
          options: {
            ...col.options,
            rules: [
              {
                required: pageFieldJson[col.key].requiredFlag === 1,
                message: `请输入${pageFieldJson[col.key].displayName}`,
              },
            ],
          },
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return <DataTable {...tableProps} />;
  }
}

export default FeeReadOnly;
