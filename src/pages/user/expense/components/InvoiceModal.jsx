import React from 'react';
import { connect } from 'dva';
import { Modal, Input, Tooltip } from 'antd';
import { equals, clone, type } from 'ramda';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { createConfirm } from '@/components/core/Confirm';

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

/**
 * 发票池
 */
const DOMAIN = 'invoiceList';

@connect(({ dispatch, loading, global, invoiceList }) => ({
  dispatch,
  loading,
  global,
  invoiceList,
}))
class InvoiceModal extends React.Component {
  constructor(props) {
    super(props);
    const { params } = this.props;
    this.state = {
      params,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearExpense`,
    });
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'ASC',
      invReimSelect: 1,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ params: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { params } = this.props;
    if (!equals(prevState.params, params)) {
      return params;
    }
    return null;
  }

  fetchData = async searchParams => {
    const { dispatch } = this.props;
    const { isCopy } = fromQs();
    let { id } = fromQs();
    if (isCopy === '1') {
      id = null;
    }
    const reimId = id;
    // 拉取有效发票列表
    dispatch({
      type: `${DOMAIN}/queryExpense`,
      payload: {
        ...searchParams,
        invReimSelect: 1,
        limit: 999,
        offset: 0,
        reimId,
        type: 'pop',
      },
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/updateExpenseSearchForm`,
        payload: {
          invSelected: [],
        },
      });
    });
  };

  // 点击确定按钮保存项目
  handleSave = e => {
    const {
      onOk,
      expenseType,
      invoiceList: { expenseSearchForm = {} },
    } = this.props;
    const {
      params: { feeDate, invSelRows, formData, isSpec, rowelected },
    } = this.state;

    let { invSelected } = expenseSearchForm;
    // if (!invSelRows.length) {
    //   createMessage({ type: 'warn', description: '请选择至少一条关联发票信息' });
    //   return;
    // }

    if (invSelected.length > 0) {
      /**
       * 购买方名称必须和费用承担公司一致，
       * 购方名称和报销人一样时，不受此规则限制
       */

      // 抬头不一致和发票校验状态不一致加入规则检查说明
      invSelected = invSelected
        // .filter(item => item.purchaserName !== formData.reimResName)
        .map(v => {
          // 非增值税发票，无需查验状态的发票不做违反规则校验
          if (v.inspectionStatus === 5) {
            return v;
          }

          let item = { ...v };
          const { accCode } = v;

          if (
            isSpec &&
            accCode === 'MGT-6602-009' &&
            v.purchaserName !== formData.expenseOuName &&
            v.purchaserName !== formData.reimResName
          ) {
            item = {
              ...item,
              errRules:
                // eslint-disable-next-line no-nested-ternary
                item.errRules && item.errRules.includes('抬头不一致')
                  ? item.errRules
                  : item.errRules
                    ? item.errRules + ',抬头不一致'
                    : '抬头不一致',
            };
          } else if (v.purchaserName !== formData.expenseOuName) {
            item = {
              ...item,
              errRules:
                // eslint-disable-next-line no-nested-ternary
                item.errRules && item.errRules.includes('抬头不一致')
                  ? item.errRules
                  : item.errRules
                    ? item.errRules + ',抬头不一致'
                    : '抬头不一致',
            };
          }

          if (v.inspectionStatus !== 1 && v.inspectionStatus !== 5) {
            item = {
              ...item,
              errRules:
                // eslint-disable-next-line no-nested-ternary
                item.errRules && item.errRules.includes('查验状态不符')
                  ? item.errRules
                  : item.errRules
                    ? item.errRules + ',查验状态不符'
                    : '查验状态不符',
            };
          }
          return item;
        });

      // const tempInvSelRows = invSelected
      //   .filter(item => item.purchaserName)
      //   .filter(item => item.purchaserName !== formData.reimResName);
      // if (tempInvSelRows.length > 0) {
      //   if (tempInvSelRows.some(item => item.purchaserName !== formData.expenseOuName)) {
      //     createMessage({
      //       type: 'warn',
      //       description: '必须选择购方名称和当前费用承担公司一致的发票!',
      //     });
      //     return;
      //   }
      // }
      // const tempInvSelRow = invSelected.filter(
      //   item => item.inspectionStatus !== 1 && item.inspectionStatus !== 5
      // );
      // const invErrorNo = tempInvSelRow.map(v => v.invoiceNo).join(',');
      // if (tempInvSelRow.length > 0) {
      //   createMessage({
      //     type: 'warn',
      //     description: `增值税发票需查验通过才可以关联到报销单，${invErrorNo}发票查验未通过`,
      //   });
      //   return;
      // }
      // 发票类型必须选择同一种
      // if (invSelected.length > 1) {
      //   // 多选
      //   const invTypeArr = Array.from(new Set(invSelected.map(item => item.invType))); // 发票类型数组去重
      //   if (invTypeArr.length > 1) {
      //     createMessage({
      //       type: 'warn',
      //       description: '一个费用明细必须选择同种类型的发票!',
      //     });
      //     return;
      //   }
      // }
    }

    // 非差旅报销发票日期不能早于费用发生日期三个月
    if (expenseType === 'normal') {
      const tt = invSelected.filter(v =>
        moment(feeDate).isAfter(moment(v.invBillingDate).add(3, 'months'))
      );
      if (tt.length) {
        createMessage({
          type: 'warn',
          description: '非差旅报销发票日期不能早于费用发生日期三个月',
        });
        return;
      }
    } else {
      // 差旅报销开票时间不能早于费用的发生时间(除了非差旅的所有报销)
      const tt = invSelected.filter(v => moment(feeDate).isAfter(moment(v.invBillingDate)));
      if (tt.length) {
        createMessage({ type: 'warn', description: '报销开票时间不能早于费用的发生时间' });
        return;
      }
    }

    onOk.apply(this.state, [e, invSelected]);
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel } = this.props;
    onCancel.apply(this.state, [e]);
    this.setState({
      rows: [],
    });
  };

  delInvoiceItemFun = invSelected => {
    const { delInvoiceItem } = this.props;
    // invSelected是选中删除的发票
    type(delInvoiceItem) === 'Function' && delInvoiceItem(invSelected);
  };

  delInvoice = selectedRowKeys => {
    const {
      dispatch,
      invoiceList: {
        expenseSearchForm: { invSelected = [] },
      },
    } = this.props;
    const invoice = this;
    // 弹窗提醒
    createConfirm({
      content:
        '如所删发票为最新创建发票，可直接重新同步，如为之前创建发票，需在百望APP删除该发票并再次采集后，再重新同步至TW系统。',
      onOk: () =>
        dispatch({
          type: `${DOMAIN}/delInvoiceFromBaiwang`,
          payload: {
            selectedRowKeys,
          },
        }).then(resp => {
          invoice.fetchData();
          this.delInvoiceItemFun(invSelected);
        }),
    });
  };

  render() {
    const {
      dispatch,
      loading,
      global: { userList },
      invoiceList: { expenseList = [], expenseTotal = 0, expenseSearchForm = {} },
      title,
      visible,
    } = this.props;
    const { params } = this.state;
    const { invSelected = [], ...restExpenseSearchForm } = expenseSearchForm;

    const { feeDate, reimResId, alreadySel, invSelRows } = params;

    const filterDataSource = expenseList.filter(
      // 只有报销人负责的发票和未被其他明细选中的发票可以选择
      v =>
        Number(v.invOwnerResId) === Number(reimResId) &&
        !alreadySel
          .split(',')
          .map(item => Number(item))
          .includes(v.id)
    );

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading:
        loading.effects[`${DOMAIN}/queryExpense`] ||
        loading.effects[`${DOMAIN}/getMyInvoiceModalFromBaiwang`],
      expenseTotal: filterDataSource.length,
      dataSource: filterDataSource,
      pagination: false,
      scroll: { x: 1750 },
      enableSelection: true,
      rowSelection: {
        selectedRowKeys: invSelected.map(v => v.id),
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateExpenseSearchForm`,
            payload: {
              invSelected: selectedRows,
            },
          });
        },
      },
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateExpenseSearchForm`,
          payload: allValues,
        });
      },
      searchForm: restExpenseSearchForm,
      searchBarForm: [
        {
          title: '发票号码',
          dataIndex: 'invoiceNo',
          options: {
            initialValue: expenseSearchForm.invoiceNo || undefined,
          },
          tag: <Input placeholder="请输入发票号码" />,
        },
        {
          title: '归属人',
          dataIndex: 'invOwnerId',
          options: {
            initialValue: expenseSearchForm.invOwnerId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={userList}
              columns={columns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择归属人"
            />
          ),
        },
        {
          title: '创建人',
          dataIndex: 'createUserId',
          options: {
            initialValue: expenseSearchForm.createUserId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={userList}
              columns={columns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择创建人"
            />
          ),
        },
        {
          title: '开票日期',
          dataIndex: 'invoiceDate',
          options: {
            initialValue: expenseSearchForm.invoiceDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '购方名称',
          dataIndex: 'purchaserName',
          options: {
            initialValue: expenseSearchForm.purchaserName || undefined,
          },
          tag: <Input placeholder="请输入购方名称" />,
        },
        {
          title: '销方名称',
          dataIndex: 'saleName',
          options: {
            initialValue: expenseSearchForm.saleName || undefined,
          },
          tag: <Input placeholder="请输入销方名称" />,
        },

        {
          title: '查验状态',
          dataIndex: 'inspectionStatusName',
          options: {
            initialValue: expenseSearchForm.inspectionStatusName || undefined,
          },
          tag: <Input placeholder="请输入查验状态" />,
        },

        {
          title: '发票状态',
          dataIndex: 'invState',
          options: {
            initialValue: expenseSearchForm.invState,
          },
          tag: <Selection.UDC code="ACC:INV_STATUS" placeholder="请选择发票状态" />,
        },
        {
          title: '报销状态',
          dataIndex: 'invReimStatus',
          options: {
            initialValue: expenseSearchForm.invReimStatus,
          },
          tag: <Selection.UDC code="ACC:INV_REIMB_STATUS" placeholder="请选择报销状态" />,
        },
      ],
      columns: [
        {
          title: '发票号码',
          dataIndex: 'invoiceNo',
          align: 'center',
          width: 200,
        },
        {
          title: '发票金额',
          dataIndex: 'amountTax',
          width: 150,
          align: 'right',
          sorter: true,
        },
        {
          title: '发票类型',
          dataIndex: 'invTypeDesc',
          align: 'center',
          width: 150,
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
          title: '开票日期',
          dataIndex: 'invoiceDate',
          align: 'center',
          width: 150,
          sorter: true,
        },
        {
          title: '销方名称',
          dataIndex: 'saleName',
          width: 200,
          align: 'center',
        },
        {
          title: '购方名称',
          dataIndex: 'purchaserName',
          width: 200,
          align: 'center',
        },
        {
          title: '查验状态',
          dataIndex: 'inspectionStatusName',
          width: 200,
          align: 'center',
        },
        {
          title: '出发站',
          dataIndex: 'leaveCity',
          width: 100,
          align: 'center',
        },
        {
          title: '出发时间',
          dataIndex: 'leaveTime',
          width: 150,
          align: 'center',
        },
        {
          title: '到达站',
          dataIndex: 'arriveCity',
          width: 100,
          align: 'center',
        },
        {
          title: '到达时间',
          dataIndex: 'arriveTime',
          width: 150,
          align: 'center',
        },

        {
          title: '归属人',
          dataIndex: 'invOwnerName',
          width: 150,
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'syncMyInvoice',
          className: 'tw-btn-primary',
          title: '同步最新发票',
          loading: loading.effects[`${DOMAIN}/getMyInvoiceModalFromBaiwang`],
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/getMyInvoiceModalFromBaiwang`,
              payload: {
                ...restExpenseSearchForm,
                invReimSelect: 1,
                limit: 999,
                offset: 0,
                reimId: fromQs().id,
                type: 'pop',
              },
            });
          },
        },
        {
          key: 'syncMyInvoice1',
          className: 'tw-btn-primary',
          title: '删除',
          loading: loading.effects[`${DOMAIN}/delInvoiceFromBaiwang`],
          hidden: false,
          disabled: !expenseSearchForm.invSelected?.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.delInvoice(selectedRowKeys);
          },
        },
      ],
    };

    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        onOk={this.handleSave}
        onCancel={this.onToggle}
        width={1300}
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)' }}
        afterClose={() => {
          this.setState({
            rows: [],
          });
        }}
      >
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default InvoiceModal;
