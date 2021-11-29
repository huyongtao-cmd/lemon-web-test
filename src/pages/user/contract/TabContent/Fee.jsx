import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Radio, Button, DatePicker } from 'antd';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil, clone } from 'ramda';
import update from 'immutability-helper';
import moment from 'moment';
import { sub, genFakeId } from '@/utils/mathUtils';
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
@mountToTab()
class Fee extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      isHide: true,
      showDetail: false,
      currentNo: '',
      currentId: '',
      selectedRows: [],
      currentAmt: '',
    };
  }

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

  // 行编辑触发事件
  onCellDetailChanged = (index, value, name) => {
    const {
      Fee: { otherFeeList, otherFeeDetail },
      dispatch,
    } = this.props;

    const newotherFeeDetail = otherFeeDetail;
    newotherFeeDetail[index] = {
      ...newotherFeeDetail[index],
      [name]: name === 'settleDate' ? value.format('YYYY-MM-DD') : value,
    };
    const { currentId } = this.state;
    const newOtherFeeList = clone(otherFeeList);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < newOtherFeeList.length; i++) {
      if (newOtherFeeList[i].id === currentId) {
        newOtherFeeList[i].detils = newotherFeeDetail;
        break;
      }
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        otherFeeList: newOtherFeeList,
        otherFeeDetail: newotherFeeDetail,
      },
    });
  };

  showPayDetail = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    dispatch({
      type: `${DOMAIN}/otherFeeDetilRq`,
      payload: { id: selectedRowKeys[0] },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { currentNo: selectedRows[0].feeNo },
    });
    this.setState({
      showDetail: true,
      currentNo: selectedRows[0].feeNo,
      currentId: selectedRowKeys[0],
      currentAmt: selectedRows[0].contractAmt,
    });
  };

  saveDetails = () => {
    const { dispatch } = this.props;
    const { currentId } = this.state;
    dispatch({
      type: `${DOMAIN}/saveDetails`,
      payload: { id: currentId },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      Fee: { otherFeeList, otherFeeDetail },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 8) {
      return <div />;
    }

    let pageFieldView = [];
    let detils = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_OTHER_FEE') {
        pageFieldView = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_OTHER_FEE_DET') {
        detils = block.pageFieldViews;
      }
    });
    const pageFieldJson = {};
    const dJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    detils.forEach(field => {
      dJson[field.fieldKey] = field;
    });

    const { isHide, showDetail } = this.state;
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2500 },
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: otherFeeList,
      showColumn: false,
      onRow: () => {},
      rowSelection: {
        onChange: (selectedRowKeysIn, selectedRows) => {
          const { selectedRowKeys } = this.state;
          const { id } = fromQs();
          dispatch({
            type: `${DOMAIN}/save`,
            payload: { contractId: id },
          });
          // 切换时保存前一条的明细
          // if (selectedRowKeys[0]) {
          //   dispatch({
          //     type: `${DOMAIN}/saveDetails`,
          //     payload: { id: selectedRowKeys[0] },
          //   }).then(res => {
          //     if (selectedRowKeysIn[0]) {
          //       dispatch({
          //         type: `${DOMAIN}/otherFeeDetilRq`,
          //         payload: { id: selectedRowKeysIn[0] },
          //       });
          //     } else {
          //       this.setState({ showDetail: false });
          //     }
          //   });
          // } else if (selectedRowKeysIn[0]) {
          //   dispatch({
          //     type: `${DOMAIN}/otherFeeDetilRq`,
          //     payload: { id: selectedRowKeysIn[0] },
          //   });
          // }

          dispatch({
            type: `${DOMAIN}/otherFeeDetilRq`,
            payload: { id: selectedRowKeysIn[0] },
          });
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { currentNo: selectedRows[0].feeNo },
          });
          this.setState({
            showDetail: true,
            currentNo: selectedRows[0].feeNo,
            currentId: selectedRowKeysIn[0],
            currentAmt: selectedRows[0].contractAmt,
          });
          this.setState({
            isHide: selectedRowKeysIn.length !== 1,
            selectedRowKeys: selectedRowKeysIn,
            selectedRows,
          });
        },
        type: 'radio',
      },
      enableDoubleClick: false,
      showCopy: false,
      onAdd: newRow => {
        const { id, contractNo } = fromQs();
        let newList;
        if (isNil(otherFeeList) || isEmpty(otherFeeList)) {
          newList = update(otherFeeList, {
            $push: [
              {
                ...newRow,
                id: genFakeId(-1),
                feeNo:
                  contractNo.replace('C', '') +
                  (otherFeeList.length + 1 > 9
                    ? otherFeeList.length + 1
                    : `0${otherFeeList.length + 1}`),
                contractId: Number(id),
                feeType: 'THIRD_PARTY',
                feeDeductionWay: 'YES',
                contractAmt: 0,
                remark: '',
              },
            ],
          });
        } else {
          newList = update(otherFeeList, {
            $push: [
              {
                ...newRow,
                id: genFakeId(-1),
                feeNo: +otherFeeList[otherFeeList.length - 1].feeNo + 1,
                contractId: Number(id),
                feeType: otherFeeList[0].feeType,
                feeDeductionWay: otherFeeList[0].feeDeductionWay,
                contractAmt: 0,
                remark: '',
              },
            ],
          });
        }

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { otherFeeList: newList },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag5: 1 },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = otherFeeList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        this.setState({ showDetail: false });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { otherFeeList: newDataSource },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag5: 1 },
        });
      },
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
              placeholder={`请选择${pageFieldJson.feeType.displayName}`}
              allowClear={false}
              code="TSK:CONTRACT_FEE_TYPE"
              value={value}
              onChange={val => {
                this.onCellChanged(index, val, 'feeType');
              }}
            />
          ),
          options: {
            rules: [
              {
                required: true,
                message: `请选择${pageFieldJson.feeType.displayName}`,
              },
            ],
          },
        },
        {
          title: '总额',
          key: 'contractAmt',
          dataIndex: 'contractAmt',
          align: 'center',
          required: true,
          width: '10%',
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              defaultValue={value}
              value={value || 0}
              precision={1}
              onChange={val => {
                this.onCellChanged(index, val, 'contractAmt');
              }}
            />
          ),
        },
        {
          title: '已归集金额',
          key: 'collectedAmount',
          dataIndex: 'collectedAmount',
          align: 'center',
          width: '6%',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'collectedAmount');
              }}
            />
          ),
        },
        {
          title: '未结金额',
          key: 'outstandingAmount',
          dataIndex: 'outstandingAmount',
          align: 'center',
          width: '6%',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'outstandingAmount');
              }}
            />
          ),
        },
        {
          title: '费用状态',
          key: 'reimStatus',
          dataIndex: 'reimStatus',
          align: 'center',
          required: true, // 会在title前加一个红色※
          width: '10%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder={`请选择${pageFieldJson.reimStatus.displayName}`}
              allowClear={false}
              code="ACC:RELATED_REIM_STATUS"
              value={value}
              onChange={val => {
                this.onCellChanged(index, val, 'reimStatus');
              }}
            />
          ),
          options: {
            rules: [
              {
                required: true, // 整个输入框红色显示
                message: `请选择${pageFieldJson.reimStatus.displayName}`,
              },
            ],
          },
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
              placeholder={`请选择${pageFieldJson.reimExp.displayName}`}
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
            />
          ),
          options: {
            rules: [
              {
                required: true,
                message: `请选择${pageFieldJson.reimExp.displayName}`,
              },
            ],
          },
        },
        {
          title: '参与收益比例计算',
          key: 'rateCount',
          dataIndex: 'rateCount',
          align: 'center',
          width: '10%',
          render: (value, row, index) => (
            <Radio.Group
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'rateCount');
              }}
              value={value}
            >
              <Radio value="Yes">是</Radio>
              <Radio value="No">否</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '计算有效合同额时应减',
          key: 'feeDeductionWay',
          dataIndex: 'feeDeductionWay',
          align: 'center',
          width: '10%',
          render: (value, row, index) => (
            <Selection.UDC
              placeholder={`请选择${pageFieldJson.feeDeductionWay.displayName}`}
              allowClear={false}
              code="COM:YESNO"
              value={value}
              onChange={val => {
                this.onCellChanged(index, val, 'feeDeductionWay');
              }}
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
              placeholder={`请选择${pageFieldJson.reimSource.displayName}`}
              allowClear={false}
              code="ACC:RELATED_REIM_SOURCE"
              value={value}
              onChange={val => {
                this.onCellChanged(index, val, 'reimSource');
              }}
            />
          ),
        },
        {
          title: '关联单据号',
          key: 'documentNumber',
          dataIndex: 'documentNumber',
          align: 'center',
          width: '20%',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              value={value || ''}
              precision={1}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'documentNumber');
              }}
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
    const detailTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/otherFeeDetilRq`],
      dataSource: otherFeeDetail,
      showColumn: false,
      onRow: () => {},
      enableDoubleClick: false,
      showCopy: false,
      onAdd: newRow => {
        const { id } = fromQs();
        const { currentNo } = this.state;
        // let newList;
        // if (isNil(otherFeeDetail) || isEmpty(otherFeeDetail)) {
        //   newList = update(otherFeeDetail, {
        //     $push: [
        //       {
        //         ...newRow,
        //         id: '',
        //         contractOtherFeeId: currentNo,
        //       },
        //     ],
        //   });
        // } else {
        //   newList = update(otherFeeDetail, {
        //     $push: [
        //       {
        //         ...newRow,
        //         id: '',
        //         contractOtherFeeId: currentNo,
        //       },
        //     ],
        //   });
        // }
        const newList = update(otherFeeDetail, {
          $push: [
            {
              ...newRow,
              id: genFakeId(-1),
              feeNo: currentNo,
            },
          ],
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { otherFeeDetail: newList },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag5: 1 },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = otherFeeDetail.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        const { currentId } = this.state;
        const newOtherFeeList = clone(otherFeeList);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < newOtherFeeList.length; i++) {
          if (newOtherFeeList[i].id === currentId) {
            newOtherFeeList[i].detils = newDataSource;
            break;
          }
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            otherFeeList: newOtherFeeList,
            otherFeeDetail: newDataSource,
          },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag5: 1 },
        });
      },
      columns: [
        {
          title: '费用编号',
          key: 'feeNo',
          dataIndex: 'feeNo',
          align: 'center',
        },
        {
          title: '支付阶段',
          key: 'payStage',
          dataIndex: 'payStage',
          align: 'center',
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCellDetailChanged(index, e.target.value, 'payStage');
              }}
            />
          ),
        },
        {
          title: '支付金额',
          key: 'payMoney',
          dataIndex: 'payMoney',
          align: 'center',
          required: true,
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              defaultValue={value}
              value={value || 0}
              precision={1}
              onChange={val => {
                this.onCellDetailChanged(index, val, 'payMoney');
              }}
            />
          ),
        },
        {
          title: '支付比例',
          key: 'paymentProportion',
          dataIndex: 'paymentProportion',
          align: 'center',
          render: (value, row, index) => {
            const { currentAmt } = this.state;
            return (
              <Input
                className="x-fill-100"
                value={value}
                onChange={e => {
                  this.onCellDetailChanged(index, e.target.value, 'paymentProportion');
                }}
              />
            );
          },
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
            />
          ),
          options: {
            rules: [
              {
                required: true,
                message: '请选择结算状态',
              },
            ],
          },
        },
        {
          title: '结算日期',
          key: 'settleDate',
          dataIndex: 'settleDate',
          align: 'center',
          // required: true,
          render: (value, row, index) => (
            <DatePicker
              // defaultValue={value && moment(value) || null}
              value={typeof value === 'object' ? value : moment(value)}
              onChange={val => this.onCellDetailChanged(index, val, 'settleDate')}
            />
          ),
          options: {
            rules: [
              {
                required: true,
                message: '请选择结算日期',
              },
            ],
          },
        },
        {
          title: '结算单据号',
          key: 'settleBillsNo',
          dataIndex: 'settleBillsNo',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              value={value || ''}
              precision={1}
              onChange={e => {
                this.onCellDetailChanged(index, e.target.value, 'settleBillsNo');
              }}
            />
          ),
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
            />
          ),
        },
      ]
        .filter(col => !col.key || (dJson[col.key] && dJson[col.key].visibleFlag === 1))
        .map(col => ({
          ...col,
          title: dJson[col.key].displayName,
          sortNo: dJson[col.key].sortNo,
          required: dJson[col.key].requiredFlag === 1,
          options: {
            ...col.options,
            rules: [
              {
                required: dJson[col.key].requiredFlag === 1,
                message: `请输入${dJson[col.key].displayName}`,
              },
            ],
          },
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return (
      <>
        {/* <div style={{ marginBottom: '10px' }}>
          <Button type="primary" disabled={isHide} onClick={this.showPayDetail}>
            支付明细
          </Button>
        </div> */}
        <EditableDataTable {...tableProps} />
        {showDetail && (
          <div style={{ marginTop: '60px' }}>
            {/* <Button type="primary" style={{ marginBottom: 10 }} onClick={this.saveDetails}>
              保存
            </Button> */}
            <EditableDataTable {...detailTableProps} />
          </div>
        )}
      </>
    );
  }
}

export default Fee;
