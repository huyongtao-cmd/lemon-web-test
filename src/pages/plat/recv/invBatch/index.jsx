import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Form, Input, Upload, Select, Button, DatePicker, Modal } from 'antd';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectCustomer } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectOus, selectUsersWithBu } from '@/services/gen/list';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';
import { selectInnerAccount } from '@/services/plat/recv/InvBatch';

const DOMAIN = 'invBatchList';
const { RangePicker } = DatePicker;
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, invBatchList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  invBatchList,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateState`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class InvBatchList extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData();
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const parm = {
      ...params,
      expectRecvDate: null,
      batchDate: null,
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...parm } });
  };

  targeToggleVisiable = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  select = () => {
    // 保存数据
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateRecvInfo`,
      payload: null,
    }).then(response => {
      if (response.ok) {
        this.targeToggleVisiable();
        this.fetchData();
      }
    });
  };

  cancel = () => {
    this.targeToggleVisiable();
  };

  render() {
    const {
      dispatch,
      loading,
      invBatchList: { dataSource, total, searchForm },
      form: { getFieldDecorator },
    } = this.props;
    const { visible } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      total,
      scroll: {
        x: '150%',
      },
      rowKey: record => `${record.id}-${record.planId}-${record.invId}`,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        const filter = allValues;
        switch (Object.keys(changedValues)[0]) {
          case 'batchDate':
            filter.batchDateStart = formatDT(changedValues.batchDate[0]);
            filter.batchDateEnd = formatDT(changedValues.batchDate[1]);
            break;
          case 'expectRecvDate':
            filter.expectRecvDateStart = formatDT(changedValues.expectRecvDate[0]);
            filter.expectRecvDateEnd = formatDT(changedValues.expectRecvDate[1]);
            break;
          default:
            break;
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: filter,
        });
      },
      searchBarForm: [
        {
          title: '开票批次号',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="请输入批次号" />,
        },
        {
          title: '批次状态',
          dataIndex: 'batchStatus',
          options: {
            initialValue: searchForm.batchStatus,
          },
          tag: <Selection.UDC code="ACC.INVBATCH_STATUS" placeholder="请选择批次状态" />,
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          options: {
            initialValue: searchForm.invNo,
          },
          tag: <Input placeholder="请输入发票号" />,
        },
        {
          title: '发票抬头',
          dataIndex: 'invTitle',
          options: {
            initialValue: searchForm.invTitle,
          },
          tag: <Input placeholder="请输入发票抬头" />,
        },
        {
          title: '客户名称',
          dataIndex: 'custName',
          options: {
            initialValue: searchForm.custName,
          },
          tag: <Selection source={() => selectCustomer()} placeholder="请选择客户名称" />,
        },
        {
          title: '主合同名称',
          dataIndex: 'contractName',
          options: {
            initialValue: searchForm.contractName,
          },
          tag: <Input placeholder="请输入主合同名称" />,
        },
        {
          title: '子合同名称',
          dataIndex: 'subContractName',
          options: {
            initialValue: searchForm.subContractName,
          },
          tag: <Input placeholder="请输入子合同名称" />,
        },
        {
          title: '子合同号',
          dataIndex: 'subContractNo',
          options: {
            initialValue: searchForm.subContractNo,
          },
          tag: <Input placeholder="请输入子合同号" />,
        },
        {
          title: '子合同状态',
          dataIndex: 'contractStatus',
          options: {
            initialValue: searchForm.contractStatus,
          },
          tag: <Selection.UDC code="TSK:CONTRACT_STATUS" placeholder="请选择子合同状态" />,
        },
        {
          title: '预期开票日期',
          dataIndex: 'batchDate',
          options: {
            initialValue: searchForm.batchDate,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          options: {
            initialValue: searchForm.expectRecvDate,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        {
          title: '逾期天数',
          dataIndex: 'overDays',
          options: {
            initialValue: searchForm.overDays,
          },
          tag: <Input placeholder="请输入逾期天数" />,
        },
        {
          title: '开票主体', // TODO: 国际化
          dataIndex: 'ouId',
          tag: <Selection source={() => selectOus()} placeholder="请选择开票主体" />,
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResId',
          options: {
            initialValue: searchForm.pmoResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择PMO"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { custId, id, batchStatus } = selectedRows[0];
            if (batchStatus === '1' || batchStatus === '5') {
              router.push(
                `/plat/saleRece/invBatch/edit?id=${id}&from=/plat/saleRece/invBatch/list`
              ); // &custId=${custId}
            } else {
              createMessage({ type: 'error', description: '发票批次已经审批或收款中，不能再修改' });
            }
          },
        },
        // 此按钮只有“财务人员”能看到
        {
          key: 'invBatchApply',
          title: '录入发票详情',
          className: 'tw-btn-info',
          icon: 'dollar',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { custId, id, batchStatus } = selectedRows[0];
            if (batchStatus === '3') {
              router.push(
                `/plat/saleRece/invBatch/edit?status=3&id=${id}&from=/plat/saleRece/invBatch/list`
              ); // &custId=${custId}
            } else {
              createMessage({ type: 'error', description: '只有已批准的收款计划可以录入发票信息' });
            }
          },
        },
        // 此按钮只有“财务人员”能看到
        {
          key: 'invInput',
          title: '收款录入',
          className: 'tw-btn-info',
          icon: 'strikethrough',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          // eslint-disable-next-line
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const filteredRows = selectedRows.filter(row => !!row.subContractNo);
            if (isEmpty(filteredRows))
              return createMessage({ type: 'error', description: '行数据不完整' });
            const noInvBatch = filteredRows.filter(
              ({ batchStatus }) => batchStatus !== '4' && batchStatus !== '6'
            );
            if (!isEmpty(noInvBatch))
              return createMessage({
                type: 'error',
                description: '只有"已开票"或"收款中"的收款计划可以发起录入收款操作!!!',
              });

            const noInvBatch2 = filteredRows.filter(
              ({ contractStatus }) => contractStatus === 'UPDATING'
            );
            if (!isEmpty(noInvBatch2))
              return createMessage({
                type: 'error',
                description: '合同状态为‘收益规则修改中’的不能发起录入收款操作!!!',
              });
            const diffContractNo = Array.from(
              new Set(filteredRows.map(({ subContractNo }) => subContractNo))
            );
            if (diffContractNo.length > 1)
              return createMessage({ type: 'error', description: '相同子合同，才能发起收款录入' });
            const urlPramId = Array.from(new Set(filteredRows.map(({ id }) => id))).join(',');
            router.push(`/plat/saleRece/invBatch/invInput?id=${urlPramId}`);
          },
        },
        {
          key: 'rollback',
          title: '退回',
          className: 'tw-btn-info',
          // icon: 'strikethrough',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const noAccessKeys = selectedRows.filter(row => row.batchStatus + '' !== '4');
            if (!isEmpty(noAccessKeys)) {
              createMessage({ type: 'warn', description: '选中行里有不可退回的条目' });
            } else {
              // 过滤相同合同号，让入参干净点
              dispatch({
                type: `${DOMAIN}/rollbackItems`,
                payload: Array.from(new Set(selectedRows.map(row => row.id))).join(','),
              });
            }
          },
        },

        // TODO: 待定
        // {
        //   key: 'initiateCall',
        //   title: '发起催收',
        //   className: 'tw-btn-info',
        //   // icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     // TODO: 收款录入
        //   },
        // },

        // 发起退票
        {
          key: 'reback',
          title: '发起退票',
          className: 'tw-btn-info',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            let flag = true;
            if (
              selectedRows.length === 1 &&
              selectedRows[0].batchStatusDesc === '已开票待收款' &&
              selectedRows[0].apprStatus === 'APPROVED'
            ) {
              flag = false;
            } else {
              flag = true;
            }
            return flag;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { custId, id, batchStatus, batchStatusDesc } = selectedRows[0];
            if (batchStatus === '4') {
              router.push(
                `/plat/saleRece/invBatch/edit?id=${id}&from=/plat/saleRece/invBatch/list&status=${batchStatus}`
              );
            }
          },
        },
        {
          key: 'addAccount',
          title: '补录银行账号',
          className: 'tw-btn-info',
          icon: 'strikethrough',
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            let flag = true;
            // 收款完成的才能补录
            if (selectedRows.length === 1 && selectedRows[0].batchStatus === '7') {
              flag = false;
            }
            return flag;
          },
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            const { id } = selectedRows[0];
            this.targeToggleVisiable(); // 弹出窗口
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { invId: id },
            });
          },
        },
      ],
      columns: [
        {
          title: '开票批次号',
          dataIndex: 'batchNo',
          key: 'batchNo',
          align: 'center',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/plat/saleRece/invBatch/detail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '开票主体',
          dataIndex: 'ouName',
          key: 'ouName',
        },
        {
          title: '批次状态',
          dataIndex: 'batchStatusDesc',
          key: 'batchStatusDesc',
          align: 'center',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          key: 'createUserName',
          align: 'center',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
        },
        {
          title: '客户名',
          dataIndex: 'custName',
          key: 'custName',
          align: 'center',
        },
        {
          title: '主合同名',
          dataIndex: 'mianContractName',
          key: 'mianContractName',
        },
        {
          title: '子合同号',
          dataIndex: 'subContractNo',
          key: 'subContractNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '子合同名',
          dataIndex: 'subContractName',
          key: 'subContractName',
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          key: 'userdefinedNo',
        },
        {
          title: '合同状态',
          dataIndex: 'contractStatusDesc',
          key: 'contractStatusDesc',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          key: 'projectManager',
          align: 'center',
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          key: 'invNo',
          align: 'center',
          sorter: true,
        },
        {
          title: '快递号',
          dataIndex: 'deliveryNo',
          key: 'deliveryNo',
          align: 'center',
          sorter: true,
        },
        {
          title: '发票抬头',
          dataIndex: 'invTitle',
          key: 'invTitle',
          align: 'center',
        },
        {
          title: '开票日期',
          dataIndex: 'batchDate',
          key: 'batchDate',
          sorter: true,
        },
        {
          title: '批次开票金额',
          dataIndex: 'invAmt',
          key: 'invAmt',
          align: 'right',
          sorter: true,
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          key: 'phaseDesc',
          align: 'center',
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          key: 'expectRecvDate',
          sorter: true,
        },
        {
          title: '主签约BU',
          dataIndex: 'signBuName',
          key: 'signBuName',
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          key: 'deliBuName',
          align: 'center',
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResName',
          width: 100,
          // align: 'center',
        },
        {
          title: '银行账号',
          dataIndex: 'accountNo',
          key: 'accountNo',
          align: 'center',
        },
        {
          title: '总账日期',
          dataIndex: 'ledgerDate',
          key: 'ledgerDate',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="合同开票列表">
        <DataTable {...tableProps} />
        <Modal
          title="收款信息补录"
          visible={visible}
          loading={false}
          onOk={this.select}
          onCancel={this.cancel}
          width="35%"
        >
          <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={2}>
            <Field
              name="accountNo"
              label="银行账号"
              decorator={{
                // initialValue: formData.abAccId
                //   ? { accountNo: formData.accountNo, id: formData.abAccId + '' }
                //   : undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入银行账号',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectInnerAccount()}
                columns={[
                  // span加起来不能超过24
                  { dataIndex: 'valCode', title: '账户', span: 6 },
                  { dataIndex: 'valDesc', title: '公司', span: 9 },
                  // { dataIndex: 'valSphd1', title: '银行', span: 3 },
                  { dataIndex: 'valSphd2', title: '网点', span: 9 },
                ]}
                transfer={{ key: 'id', code: 'valCode', name: 'valCode' }} // key唯一键，code要保存的值；name选中后显示的值
                dropdownMatchSelectWidth={false} // 下拉菜单菜单和选择器同款
                dropdownStyle={{ width: 700 }} // 下拉宽度
                showSearch
                onColumnsChange={() => {}}
                placeholder="请选择收款银行账号"
                // value={value}
                width={100}
                onChange={e => {}}
              />
            </Field>

            <Field
              name="ledgerDate"
              label="总账日期"
              decorator={{
                initialValue: moment(),
                rules: [
                  {
                    required: true,
                    message: '请输入总账日期',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <DatePicker
                placeholder="请输入总账日期"
                format="YYYY-MM-DD"
                className="x-fill-100"
                allowClear={false}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default InvBatchList;
