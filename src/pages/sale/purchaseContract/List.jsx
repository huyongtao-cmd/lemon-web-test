import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Modal, DatePicker, TreeSelect } from 'antd';
// import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { selectUsersWithBu, selectAbOus, selectAllAbOu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import moment from 'moment';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'salePurchaseList';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, salePurchaseList, dispatch }) => ({
  dispatch,
  loading:
    loading.effects[`${DOMAIN}/queryList`] ||
    loading.effects[`${DOMAIN}/active`] ||
    loading.effects[`${DOMAIN}/pending`] ||
    loading.effects[`${DOMAIN}/close`] ||
    loading.effects[`${DOMAIN}/remove`] ||
    loading.effects[`${DOMAIN}/getPageConfig`] ||
    loading.effects[`${DOMAIN}/fetchPrincipal`] ||
    false,
  salePurchaseList,
}))
// @mountToTab()
class PurchasesList extends PureComponent {
  state = {
    closeId: null,
    closeNo: null,
    closeReasonVisible: false,
    contractTypeVisible: false,
    closeReason: '',
    contractType: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clear`,
    });
    this.fetchData();
    dispatch({
      type: `${DOMAIN}/tree`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_CHOOSE',
      },
    });
    dispatch({
      type: `${DOMAIN}/fetchPrincipal`,
    });
  }

  fetchData = async (params = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryList`,
      payload: {
        ...params,
        createTime: undefined,
        signDate: undefined,
        createTimeStart:
          params.createTime && params.createTime[0]
            ? params.createTime[0].format('YYYY-MM-DD')
            : undefined,
        createTimeEnd:
          params.createTime && params.createTime[1]
            ? params.createTime[1].format('YYYY-MM-DD')
            : undefined,
        signDateStart:
          params.signDate && params.signDate[0]
            ? params.signDate[0].format('YYYY-MM-DD')
            : undefined,
        signDateEnd:
          params.signDate && params.signDate[1]
            ? params.signDate[1].format('YYYY-MM-DD')
            : undefined,
      },
    });
  };

  handleCloseOk = () => {
    const { dispatch } = this.props;
    const { closeId, closeNo, closeReason } = this.state;
    dispatch({
      type: `${DOMAIN}/close`,
      payload: {
        id: genFakeId(-1),
        contractId: closeId,
        contractNo: closeNo,
        overWhy: closeReason,
      },
    }).then(() => {
      this.setState({
        closeReasonVisible: false,
        closeId: null,
        closeNo: null,
        closeReason: '',
      });
    });
  };

  handleCloseOk2 = () => {
    const { contractType } = this.state;
    if (contractType) {
      router.push(`/sale/purchaseContract/Edit?purchaseType=${contractType}&mode=edit&from=list`);
      this.setState({
        contractTypeVisible: false,
        contractType: null,
      });
    } else {
      createMessage({ type: 'warn', description: '请选择一种采购合同类型' });
    }
  };

  handleCloseCancel = () => {
    this.setState({
      closeReasonVisible: false,
      closeId: null,
      closeNo: null,
      closeReason: '',
    });
  };

  handleCloseCancel2 = () => {
    this.setState({
      contractTypeVisible: false,
      contractType: null,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      salePurchaseList: { listData: dataSource, total, treeData, searchForm, pageConfig },
    } = this.props;
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const { closeReasonVisible, contractTypeVisible, closeReason, contractType } = this.state;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      scroll: { x: 3300 },
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '采购合同',
          dataIndex: 'contractNo',
          options: {
            initialValue: searchForm.contractNo,
          },
          tag: <Input placeholder="请输入采购合同名称/编号" />,
        },
        {
          title: '采购公司',
          dataIndex: 'purchaseLegalNo',
          options: {
            initialValue: searchForm.purchaseLegalNo,
          },
          tag: (
            <Selection.Columns
              columns={applyColumns}
              source={() => selectAbOus()}
              placeholder="请选择采购公司"
              showSearch
            />
          ),
        },
        {
          title: '采购BU',
          dataIndex: 'purchaseBuId',
          options: {
            initialValue: searchForm.purchaseBuId,
          },
          tag: <Selection.ColumnsForBu />,
        },
        {
          title: '采购负责人',
          dataIndex: 'purchaseInchargeResId',
          options: {
            initialValue: searchForm.purchaseInchargeResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择采购负责人"
              showSearch
            />
          ),
        },
        {
          title: '采购合同类型',
          dataIndex: 'purchaseType',
          options: {
            initialValue: searchForm.purchaseType,
          },
          tag: <Selection.UDC code="TSK:PURCHASE_TYPE3" placeholder="请选择采购合同类型" />,
        },
        {
          title: '业务类型',
          dataIndex: 'businessType',
          options: {
            initialValue: searchForm.businessType,
          },
          tag: <Selection.UDC code="TSK:BUSINESS_TYPE" placeholder="请选择业务类型" />,
        },
        {
          title: '验收方式',
          dataIndex: 'acceptanceType',
          options: {
            initialValue: searchForm.acceptanceType,
          },
          tag: <Selection.UDC code="TSK:ACCEPTANCE_TYPE" placeholder="请选择验收方式" />,
        },
        {
          title: '采购大类',
          dataIndex: 'classId',
          options: {
            initialValue: searchForm.classId,
          },
          tag: (
            <TreeSelect
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={treeData}
              placeholder="请选择采购大类"
              allowClear
            />
          ),
        },
        {
          title: '销售合同',
          dataIndex: 'contractNmNo',
          options: {
            initialValue: searchForm.contractNmNo,
          },
          tag: <Input placeholder="请输入合同名称/编号" />,
        },
        {
          title: '相关项目',
          dataIndex: 'projectSearchKey',
          options: {
            initialValue: searchForm.projectSearchKey,
          },
          tag: <Input placeholder="请输入相关项目名称/编号" />,
        },
        {
          title: '开票方', // TODO: 国际化
          dataIndex: 'invoice',
          options: {
            initialValue: searchForm.invoice,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectAllAbOu()}
              placeholder="请选择开票方"
              showSearch
            />
          ),
        },
        {
          title: '采购合同状态',
          dataIndex: 'contractStatus',
          options: {
            initialValue: searchForm.contractStatus,
          },
          tag: <Selection.UDC code="ACC:CONTRACT_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierLegalNo',
          options: {
            initialValue: searchForm.supplierLegalNo,
          },
          tag: (
            <Selection.Columns
              columns={applyColumns}
              source={() => selectAllAbOu()}
              placeholder="请选择供应商"
              showSearch
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
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择创建人"
              showSearch
            />
          ),
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: (
            <DatePicker.RangePicker
              className="x-fill-100"
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          ),
        },
        {
          title: '签约日期',
          dataIndex: 'signDate',
          options: {
            initialValue: searchForm.signDate,
          },
          tag: (
            <DatePicker.RangePicker
              className="x-fill-100"
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // router.push(markAsTab(`/sale/contract/purchasesCreate`));
            this.setState({
              contractTypeVisible: true,
            });
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'edit',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].contractStatus === 'CREATE') {
              const { id } = selectedRows[0];
              router.push(`/sale/purchaseContract/Edit?id=${id}&mode=edit&from=list`);
            } else {
              createMessage({ type: 'warn', description: '采购合同状态为新建时才允许修改' });
            }
          },
        },
        {
          key: 'change',
          title: '变更',
          className: 'tw-btn-info',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].contractStatus === 'ACTIVE') {
              const { id } = selectedRows[0];
              router.push(`/sale/purchaseContract/Edit?id=${id}&mode=change&from=list`);
            } else {
              createMessage({ type: 'warn', description: '采购合同状态为激活时才允许变更' });
            }
          },
        },
        {
          key: 'active',
          className: 'tw-btn-info',
          // title: row.oppoStatus === ACTIVE ? '暂挂': formatMessage({ id: `misc.active`, desc: '激活' }),
          title: `激活`,
          icon: 'check-circle',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (
              selectedRows[0].contractStatus === 'INACTIVE' ||
              selectedRows[0].contractStatus === 'PENDING'
            ) {
              dispatch({
                type: `${DOMAIN}/active`,
                payload: selectedRowKeys[0],
              });
            } else {
              createMessage({
                type: 'warn',
                description: '采购合同状态为未激活或暂挂时才允许激活',
              });
            }
          },
        },
        {
          key: 'pending',
          className: 'tw-btn-error',
          title: '暂挂',
          icon: 'rollback',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (
              selectedRows[0].contractStatus === 'ACTIVE' ||
              selectedRows[0].contractStatus === 'INACTIVE'
            ) {
              dispatch({
                type: `${DOMAIN}/pending`,
                payload: selectedRowKeys[0],
              });
            } else {
              createMessage({
                type: 'warn',
                description: '采购合同状态为激活或未激活时才允许暂挂',
              });
            }
          },
        },
        {
          key: 'end',
          title: '终止',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].contractStatus === 'ACTIVE') {
              const { id, contractNo } = selectedRows[0];
              this.setState({
                closeId: id,
                closeNo: contractNo,
                closeReasonVisible: true,
                closeReason: null,
              });
            } else {
              createMessage({ type: 'warn', description: '采购合同状态为激活时才允许终止' });
            }
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          // icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length > 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              salePurchaseList: { user },
            } = this.props;
            if (
              selectedRows.filter(item => item.contractStatus !== 'CREATE').length === 0 &&
              (selectedRows.filter(item => item.createUserId !== user.id).length === 0 ||
                user.roles.indexOf('SYS_ADMIN') !== -1)
            ) {
              createConfirm({
                content: '确认删除所选采购合同？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/remove`,
                    payload: { ids: selectedRowKeys.join(',') },
                  }),
              });
            } else {
              createMessage({
                type: 'warn',
                description: '当前登录用户为系统管理员或创建人并且采购合同状态为新建时才允许删除',
              });
            }
          },
        },
      ],
      columns: [
        {
          title: '采购合同编号',
          dataIndex: 'contractNo',
          width: 200,
          render: (value, row) => {
            const { id } = row;
            const href = `/sale/purchaseContract/Detail?id=${id}&pageMode=purchase&from=list`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '采购合同名称',
          dataIndex: 'contractName',
          align: 'center',
          width: 300,
        },
        {
          title: '采购合同状态',
          dataIndex: 'contractStatusDesc',
          align: 'center',
          width: 160,
        },
        {
          title: '采购合同类型',
          dataIndex: 'purchaseTypeDesc',
          align: 'center',
          width: 200,
        },
        {
          title: '业务类型',
          dataIndex: 'businessTypeDesc',
          align: 'center',
          width: 200,
        },
        {
          title: '采购公司',
          dataIndex: 'purchaseLegalName',
          align: 'center',
          width: 260,
        },
        {
          title: '采购BU',
          dataIndex: 'purchaseBuName',
          align: 'center',
          width: 200,
        },
        {
          title: '采购负责人',
          dataIndex: 'purchaseInchargeResName',
          align: 'center',
          width: 120,
        },
        {
          title: '供应商',
          dataIndex: 'supplierLegalName',
          align: 'center',
          width: 260,
        },
        {
          title: '签约日期',
          dataIndex: 'signDate',
          align: 'center',
          width: 100,
          render: value => (value ? moment(value).format('YYYY-MM-DD') : null),
        },
        {
          title: '开票方',
          dataIndex: 'invoiceName',
          align: 'center',
          width: 300,
        },
        // {
        //   title: '采购大类',
        //   dataIndex: 'classIdName',
        //   align: 'center',
        //   width: 200,
        // },
        {
          title: '关联销售合同',
          dataIndex: 'relatedSalesContractName',
          align: 'center',
          width: 200,
        },
        {
          title: '相关项目',
          dataIndex: 'relatedProjectName',
          align: 'center',
          width: 200,
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
          width: 100,
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          width: 100,
          render: value => (value ? moment(value).format('YYYY-MM-DD') : null),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title="终止原因"
          // width="400px"
          visible={closeReasonVisible}
          onOk={this.handleCloseOk}
          onCancel={this.handleCloseCancel}
          confirmLoading={loading}
        >
          <Input.TextArea
            value={closeReason}
            onChange={e => {
              this.setState({ closeReason: e.target.value });
            }}
            placeholder="请输入终止原因"
            rows={5}
          />
        </Modal>
        <Modal
          destroyOnClose
          title="采购合同类型"
          width="400px"
          visible={contractTypeVisible}
          onOk={this.handleCloseOk2}
          onCancel={this.handleCloseCancel2}
        >
          <Selection.UDC
            value={contractType}
            code="TSK:PURCHASE_TYPE3"
            placeholder="请选择采购合同类型"
            allowedOptions={pageFieldJson.purchaseType.permissionValues}
            onChange={value => {
              this.setState({ contractType: value });
            }}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default PurchasesList;
