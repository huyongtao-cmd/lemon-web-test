import React from 'react';
import { connect } from 'dva';
import { Modal, Input, Tooltip } from 'antd';
import { equals, clone, type, isEmpty } from 'ramda';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { unique } from '@/utils/arrayUtils';
import { createConfirm } from '@/components/core/Confirm';

/* <InvoiceModalPro
  title="选择发票"
  visible={visible} // 控制显示和关闭
  onOk={this.handleModelOk} // 点击确认回调,返回选中的发票信息
  onCancel={this.toggleVisible} // 点击返回关闭
  selectedInvos={selectedInvos} // 本条数据已经选择的发票(用于展开弹窗回显)
  reimUserId={formData.expenseClaimUserId || userId} // 报销人userId
  reimDetailId={id} // 当前单据关联的发票也要查出来
  extraAlreadySelectedIds={flatten(
    sumWrappedDetails
      .filter(v => !isEmpty(v) && v.id !== TOTAL_ROW_ID)
      .map(v => (Array.isArray(v.invoiceentity) ? v.invoiceentity : []))
  )
    .map(v => v.id)
    .filter(v => !selectedInvos.map(item => item.id).includes(v))} // 其他数据已经选择的发票，本条数据弹窗不显示
  extraQuery={{}} // 其他筛选条件(前提是后端支持)
  docType="1" // 1 報銷，2采購
  disabled={
    currentNode !== 'create' && currentNode !== 'applyEdit' && currentNode !== 'advanceEdit' // 发票弹窗内不可选择发票的条件
  }
  checkedParmars={formData.chargeCompany} // 费用承担公司/报销主体->用于规则校验
/> */

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

/**
 * 发票池
 */
const DOMAIN = 'invoice';

@connect(({ dispatch, loading, global, invoice, user }) => ({
  dispatch,
  loading,
  global,
  invoice,
  user,
}))
class InvoiceModalPro extends React.Component {
  constructor(props) {
    super(props);
    const {
      selectedInvos = [],
      extraAlreadySelectedIds = [],
      extraQuery = {},
      reimUserId,
      visible,
      reimDetailId,
      checkedParmars,
    } = props;

    this.state = {
      selectedInvos, // 存储selectRows
      extraQuery, // 其他的数据查询条件
      extraAlreadySelectedIds, // 已经被其他单据选过的
      reimUserId, // 報銷人
      visible,
      reimDetailId, // 相关业务单据ID
      checkedParmars,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    // 控制visible
    const { visible: nextVisible } = nextProps;
    const { visible } = this.state;
    if (!equals(visible, nextVisible)) {
      this.setState({
        visible: nextVisible,
      });
    }

    // 報銷人
    const { reimUserId: nextReimUserId } = nextProps;
    const { reimUserId } = this.state;
    if (!equals(reimUserId, nextReimUserId)) {
      this.setState({
        reimUserId: nextReimUserId,
      });
    }

    // 已选择的发票数据
    const { selectedInvos: nextSelectedInvos } = nextProps;
    const { selectedInvos } = this.state;
    if (!equals(selectedInvos, nextSelectedInvos)) {
      this.setState({
        selectedInvos: nextSelectedInvos,
      });
    }

    // 其他筛选查询条件
    const { extraQuery: nextExtraQuery } = nextProps;
    const { extraQuery } = this.state;
    if (!equals(extraQuery, nextExtraQuery)) {
      this.setState({
        extraQuery: nextExtraQuery,
      });
    }

    // 已经被其他单据选了，列表不能再显示出来
    const { extraAlreadySelectedIds: nextExtraAlreadySelectedIds } = nextProps;
    const { extraAlreadySelectedIds } = this.state;
    if (!equals(extraAlreadySelectedIds, nextExtraAlreadySelectedIds)) {
      this.setState({
        extraAlreadySelectedIds: nextExtraAlreadySelectedIds,
      });
    }

    // 相关业务单据ID
    const { reimDetailId: nextreimDetailId } = nextProps;
    const { reimDetailId } = this.state;
    if (!equals(reimDetailId, nextreimDetailId)) {
      this.setState({
        reimDetailId: nextreimDetailId,
      });
    }

    // 发票规则校验参数
    const { checkedParmars: nextCheckedParmars } = nextProps;
    const { checkedParmars } = this.state;
    if (!equals(checkedParmars, nextCheckedParmars)) {
      this.setState({
        checkedParmars: nextCheckedParmars,
      });
    }
  }

  fetchData = async searchParams => {
    const {
      dispatch,
      invoice: { searchForm = {} },
      docType, // 标识  1.报销，0.采购
    } = this.props;
    const { extraQuery, reimUserId, reimDetailId } = this.state;

    // 拉取有效发票列表
    dispatch({
      type: `${DOMAIN}/queryExpense`,
      payload: {
        // 常規參數
        ...searchForm,
        limit: 0,
        offset: 0,
        sortBy: 'id',
        // 彈窗限制參數
        docType,
        type: 'pop',
        reimUserId,
        reimDetailId,
        ...extraQuery,
      },
    }).then(res => {
      if (res) {
        const { rows = [] } = res;
        this.dataDeal(rows);
      }
    });
  };

  dataDeal = (rows = []) => {
    const { selectedInvos = [] } = this.state;
    const tt = rows.filter(
      v => Array.isArray(selectedInvos) && selectedInvos.map(item => item.id).includes(v.id)
    );

    this.setState({
      selectedInvos: unique(selectedInvos.concat(tt), 'id'),
    });
  };

  // 点击确定按钮保存项目
  handleSave = e => {
    const { selectedInvos, checkedParmars } = this.state;
    const { onOk } = this.props;
    if (Array.isArray(selectedInvos) && !isEmpty(selectedInvos)) {
      selectedInvos.forEach((v, i) => {
        const tt = [];
        // 	如果选择的发票 “查验状态“≠”查验一致/无需查验“，则规则检查说明字段中显示”查验状态不符“
        if (v.inspectionStatus !== 1 && v.inspectionStatus !== 5) {
          tt.push('查验状态不符');
        }
        // 需要判断购方名称是否等于当前的费用承担公司，如不一致，在规则检查说明字段中显示出“抬头不一致“
        if (v.purchaserName && v.purchaserName !== checkedParmars) {
          tt.push('抬头不一致');
        }
        // eslint-disable-next-line no-param-reassign
        v.errRules = tt.join(', ');
      });
    }
    type(onOk) === 'Function' && onOk(selectedInvos);
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel, invoice } = this.props;
    const { searchForm } = invoice;
    type(onCancel) === 'Function' && onCancel();
    if (searchForm) {
      searchForm.invoiceNo = undefined;
      searchForm.invOwnerId = undefined;
      searchForm.createUserId = undefined;
      searchForm.invoiceDate = undefined;
      searchForm.purchaserName = undefined;
      searchForm.saleName = undefined;
      searchForm.inspectionStatus = undefined;
      searchForm.invState = undefined;
      searchForm.invReimStatus = undefined;
    }
    this.fetchData();
  };

  render() {
    const {
      dispatch,
      loading,
      global: { userList },
      invoice: { list = [], total = 0, searchForm },
      title,
      disabled,
    } = this.props;
    const { selectedInvos = [], extraAlreadySelectedIds = [], visible } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading:
        loading.effects[`${DOMAIN}/queryExpense`] ||
        loading.effects[`${DOMAIN}/getMyInvoiceModalFromBaiwang`],
      expenseTotal: total,
      dataSource: list.filter(v => !extraAlreadySelectedIds.includes(v.id)),
      pagination: false,
      scroll: { x: 2050, y: 500 },
      enableSelection: true,
      rowSelection: {
        selectedRowKeys: Array.isArray(selectedInvos) ? selectedInvos.map(v => v.id) : [],
        onChange: (selectedRowKeys, selectedRows) => {
          // 筛选出list里面没有的已选择发票数据，说明在其他查询条件选的，都要保留下来
          const tt = selectedInvos.filter(
            item => Array.isArray(list) && !list.map(v => v.id).includes(item.id)
          );
          // 拼接现在选择的和之前选择的
          this.setState({
            selectedInvos: unique(selectedRows.concat(tt), 'id'),
          });
        },
        getCheckboxProps: record => ({
          disabled,
        }),
      },
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: disabled
        ? []
        : [
            {
              title: '发票号码',
              dataIndex: 'invoiceNo',
              options: {
                initialValue: searchForm.invoiceNo || undefined,
              },
              tag: <Input placeholder="请输入发票号码" />,
            },
            {
              title: '归属人',
              dataIndex: 'invOwnerId',
              options: {
                initialValue: searchForm.invOwnerId,
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
                initialValue: searchForm.createUserId,
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
                initialValue: searchForm.invoiceDate,
              },
              tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
            },
            {
              title: '购方名称',
              dataIndex: 'purchaserName',
              options: {
                initialValue: searchForm.purchaserName || undefined,
              },
              tag: <Input placeholder="请输入购方名称" />,
            },
            {
              title: '销方名称',
              dataIndex: 'saleName',
              options: {
                initialValue: searchForm.saleName || undefined,
              },
              tag: <Input placeholder="请输入销方名称" />,
            },

            {
              title: '查验状态',
              dataIndex: 'inspectionStatus',
              options: {
                initialValue: searchForm.inspectionStatus || undefined,
              },
              tag: <Selection.UDC code="ACC:INV_INSPECTION_STATUS" placeholder="请选择查询状态" />,
            },

            {
              title: '发票状态',
              dataIndex: 'invState',
              options: {
                initialValue: searchForm.invState,
              },
              tag: <Selection.UDC code="ACC:INV_STATUS" placeholder="请选择发票状态" />,
            },
            {
              title: '报销状态',
              dataIndex: 'invReimStatus',
              options: {
                initialValue: searchForm.invReimStatus,
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
        },
        {
          title: '已核销金额',
          dataIndex: 'writtenOffAmt',
          width: 150,
          align: 'right',
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
          title: '发票状态',
          dataIndex: 'invStateDesc',
          width: 200,
          align: 'center',
        },
        {
          title: '报销状态',
          dataIndex: 'invReimStatusDesc',
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
      leftButtons: disabled
        ? []
        : [
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
                    ...searchForm,
                    invReimSelect: 1,
                    limit: 999,
                    offset: 0,
                    reimDetailId: fromQs().id,
                    type: 'pop',
                  },
                }).then(res => {
                  if (res.ok) {
                    this.fetchData();
                  }
                });
              },
            },
            {
              key: 'syncMyInvoice1',
              className: 'tw-btn-primary',
              title: '删除',
              loading: loading.effects[`${DOMAIN}/delInvoiceFromBaiwang`],
              hidden: false,
              disabled: !selectedInvos?.length,
              minSelections: 0,
              cb: (selectedRowKeys, selectedRows, queryParams) => {
                createConfirm({
                  content:
                    '如所删发票为最新创建发票，可直接重新同步，如为之前创建发票，需在百望APP删除该发票并再次采集后，再重新同步至OA系统。',
                  onOk: () =>
                    dispatch({
                      type: `${DOMAIN}/delInvoiceFromBaiwang`,
                      payload: selectedInvos.map(v => v.id).join(','),
                    }).then(res => {
                      if (res.ok) {
                        this.fetchData();
                      }
                    }),
                });
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
            selectedInvos: [],
          });
        }}
      >
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default InvoiceModalPro;
