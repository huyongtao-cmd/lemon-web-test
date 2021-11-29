import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Modal } from 'antd';
// import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import { mountToTab, markAsTab } from '@/layouts/routerControl';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, BuVersion } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectSubContract } from '@/services/user/Contract/sales';
import { selectUsersWithBu } from '@/services/gen/list';
import Item from 'antd/lib/list/Item';
import { injectGlobal } from 'styled-components';
import createMessage from '@/components/core/AlertMessage';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userContractPurchasesList';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, userContractPurchasesList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/queryPagenation`],
  userContractPurchasesList,
}))
@mountToTab()
class PurchasesList extends PureComponent {
  state = {
    closeId: null,
    visible: false,
    closeReason: '',
  };

  componentDidMount() {
    this.fetchData({});
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryPagenation`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.purchaseBuId, 'purchaseBuId', 'purchaseBuVersionId'),
      },
    });
  };

  handleCloseOk = () => {
    const { dispatch } = this.props;
    const { closeId, closeReason } = this.state;
    dispatch({
      type: `${DOMAIN}/close`,
      payload: {
        id: closeId,
        reason: closeReason,
      },
    }).then(() => {
      this.setState({
        visible: false,
      });
    });
  };

  handleCloseCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userContractPurchasesList: { dataSource, total, searchForm },
    } = this.props;
    const { visible, closeReason } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      // filterMultiple: false,
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
          title: '合同名称/编号',
          dataIndex: 'contractNmNo',
          options: {
            initialValue: searchForm.contractNmNo,
          },
          tag: <Input placeholder="请输入合同名称/编号" />,
        },
        {
          title: '采购BU',
          dataIndex: 'purchaseBuId',
          options: {
            initialValue: searchForm.purchaseBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '创建人',
          dataIndex: 'createUserId',
          options: {
            initialValue: searchForm.createUserId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择创建人"
              showSearch
            />
          ),
        },
        {
          title: '采购大类',
          dataIndex: 'purchaseType1',
          options: {
            initialValue: searchForm.purchaseType1,
          },
          tag: <Selection.UDC code="TSK.PURCHASE_TYPE1" placeholder="请选择采购大类" />,
        },
        {
          title: '状态',
          dataIndex: 'contractStatus',
          options: {
            initialValue: searchForm.contractStatus,
          },
          tag: <Selection.UDC code="TSK.CONTRACT_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '采购类型',
          dataIndex: 'purchaseType',
          tag: <Selection.UDC code="TSK:PURCHASE_TYPE" placeholder="请选择采购类型" />,
        },
        {
          title: '关联子合同',
          dataIndex: 'subContractId',
          tag: (
            <Selection
              source={() => selectSubContract()}
              transfer={{ code: 'id', name: 'name' }}
              placeholder="请选择关联子合同"
            />
          ),
        },
        {
          title: '关闭原因',
          dataIndex: 'closeReason',
          tag: <Selection.UDC code="TSK:CONTRACT_CLOSE_REASON" placeholder="请选择关闭原因" />,
        },
      ],
      leftButtons: [
        // {
        //   key: 'add',
        //   title: '新增行政采购',
        //   className: 'tw-btn-info',
        //   icon: 'plus-circle',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     router.push(markAsTab(`/sale/contract/purchasesCreate`));
        //   },
        // },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 || selectedRows[0].contractStatus !== 'CREATE',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // if (selectedRows[0].contractStatus === 'ACTIVE') {
            //   createMessage({ type: 'error', description: '合同状态为激活,不可修改!' });
            //   return;
            // }
            const { id } = selectedRows[0];
            router.push(`/sale/contract/purchasesEdit?pid=${id}`);
          },
        },
        {
          key: 'active',
          title: '激活',
          className: 'tw-btn-info',
          icon: 'check-circle',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          // selectedRows.length !== 1 ||
          // (selectedRows[0].contractStatus !== 'CREATE' &&
          //   selectedRows[0].contractStatus !== 'PENDING') ||
          // !selectedRows[0].exitRecvPlan,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { contractStatus, exitRecvPlan, id, apprStatus } = selectedRows[0];
            if (contractStatus !== 'CREATE' && contractStatus !== 'PENDING') {
              createMessage({ type: 'warn', description: '只有新建和暂挂的采购合同可以激活！' });
              return;
            }
            if (apprStatus === 'REJECTED') {
              createMessage({
                type: 'warn',
                description: '合同已经发起过激活流程，请在我的流程-待办事宜中提交流程',
              });
              return;
            }
            if (!exitRecvPlan) {
              createMessage({
                type: 'warn',
                description: '采购合同需填写合同付款计划明细后才能激活！',
              });
              return;
            }
            dispatch({
              type: `${DOMAIN}/actvity`,
              payload: {
                defkey: 'TSK_S04',
                value: {
                  id,
                  // data: [],
                },
              },
            });
          },
        },
        {
          key: 'remove',
          title: '关闭',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            (selectedRows[0].contractStatus !== 'ACTIVE' &&
              selectedRows[0].contractStatus !== 'PENDING'),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            this.setState({
              closeId: id,
              visible: true,
            });
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let flag = false;
            selectedRows.map((item, key) => {
              if (item.contractStatus !== 'CREATE') {
                flag = true;
              }
              return true;
            });
            if (!flag) {
              dispatch({
                type: `${DOMAIN}/delete`,
                payload: { ids: selectedRowKeys.join(',') },
              });
            } else {
              createMessage({ type: 'error', description: '只有创建状态的合同才可以删除！' });
            }
          },
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'contractNo',
          sorter: true,
          align: 'center',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/sale/contract/purchasesDetail?pid=${id}&id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '合同名称',
          dataIndex: 'contractName',
        },
        {
          title: '合同状态',
          dataIndex: 'contractStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '采购类型',
          dataIndex: 'purchaseTypeDesc',
          align: 'center',
        },
        {
          title: '关联子合同',
          dataIndex: 'subContractName',
          align: 'center',
        },
        {
          title: '金额',
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '税率(%)',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '采购负责人',
          dataIndex: 'purchaseInchargeResName',
        },
        {
          title: '采购法人公司',
          dataIndex: 'purchaseLegalName',
        },
        {
          title: '采购大类',
          dataIndex: 'purchaseType1Desc',
          align: 'center',
        },
        {
          title: '关闭原因',
          dataIndex: 'closeReasonDesc',
          align: 'center',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          sorter: true,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title="关闭原因"
          width="400px"
          visible={visible}
          onOk={this.handleCloseOk}
          onCancel={this.handleCloseCancel}
        >
          <Selection.UDC
            value={closeReason}
            code="TSK.CONTRACT_CLOSE_REASON"
            onChange={value => {
              this.setState({ closeReason: value });
            }}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default PurchasesList;
