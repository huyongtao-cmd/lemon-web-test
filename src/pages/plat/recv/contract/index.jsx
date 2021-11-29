import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { Input, InputNumber, Radio } from 'antd';
import { formatDT } from '@/utils/tempUtils/DateTime';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';

import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';

import { createConfirm } from '@/components/core/Confirm';
import { mountToTab } from '@/layouts/routerControl';
import { selectCust } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
// import { selectApplyNo } from '@/services/plat/recv/Contract';
import SyntheticField from '@/components/common/SyntheticField';
import { ouInternalRq } from '@/services/plat/recv/Contract';
import { toQs, toUrl } from '@/utils/stringUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'contractRecv';
const { RangePicker } = DatePicker;
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, contractRecv, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  contractRecv,
}))
@mountToTab()
class ContractRecv extends PureComponent {
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'recvNo', sortDirection: 'DESC' });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const parm = {
      ...params,
      expectRecvDate: null,
      invDate: null,
      actualRecvDate: null,
      ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
    };
    dispatch({ type: `${DOMAIN}/query`, payload: { ...parm } });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { flag: false } });
  };

  onCellChanged = (rowId, rowField) => rowFieldValue => {
    const {
      dispatch,
      contractRecv: { recvPlanList },
    } = this.props;

    let value = null;
    if (rowField === 'recvRatio') {
      value = rowFieldValue / 100;
    } else {
      value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    }

    const newDataList = recvPlanList.map(data => {
      if (data.id === rowId) {
        return {
          ...data,
          [rowField]: value,
        };
      }
      return data;
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { recvPlanList: newDataList, flag: true } });
  };

  render() {
    const {
      dispatch,
      loading,
      contractRecv: { recvPlanList, total, searchForm, flag },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 3700 },
      dataSource: recvPlanList,
      onChange: filters => {
        flag
          ? createConfirm({
              content: '您有未保存的修改,是否要继续此操作?',
              onOk: () => {
                this.fetchData(filters);
              },
            })
          : this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        const filter = allValues;
        switch (Object.keys(changedValues)[0]) {
          case 'expectRecvDate':
            filter.expectRecvDateStart = formatDT(changedValues.expectRecvDate[0]);
            filter.expectRecvDateEnd = formatDT(changedValues.expectRecvDate[1]);
            break;
          case 'invDate':
            filter.invDateStart = formatDT(changedValues.invDate[0]);
            filter.invDateEnd = formatDT(changedValues.invDate[1]);
            break;
          case 'actualRecvDate':
            filter.actualRecvDateStart = formatDT(changedValues.actualRecvDate[0]);
            filter.actualRecvDateEnd = formatDT(changedValues.actualRecvDate[1]);
            break;
          default:
            break;
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: filter,
        });
      },
      leftButtons: [
        {
          key: 'save',
          title: '保存',
          className: 'tw-btn-primary',
          icon: 'save',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/save`,
            });
            dispatch({ type: `${DOMAIN}/updateState`, payload: { flag: false } });
          },
        },
        {
          key: 'invBatchApply',
          title: '申请开票',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows.filter(item => !!item.invbatchId).length > 0) {
              const batchNos =
                '【' +
                selectedRows
                  .filter(item => !!item.batchNo)
                  .map(value => value.batchNo)
                  .join(',') +
                '】';
              createMessage({
                type: 'error',
                description: '不能重复申请开票！已申请开票的开票批次号：' + batchNos,
              });
              return;
            }
            const { custId, ouId } = selectedRows[0];
            let status = true;
            selectedRows.map(v => {
              if (v.recvStatus !== '1') {
                status = false;
              }
              return void 0;
            });
            if (!status) {
              createMessage({ type: 'warn', description: '只可对"未收款"的收款计划发起申请开票' });
              return;
            }
            const sameCustId = selectedRows.filter(v => v.custId !== custId).length; // 客户不同的条数
            const sameOuId = selectedRows.filter(v => v.ouId !== ouId).length; // 公司不同的条数
            const invoiceAmt = selectedRows.filter(v => !!v.invAmt).length; // 已开票合同条数
            if (sameCustId) {
              createMessage({ type: 'warn', description: '只能勾选同一个客户进行开票' });
              return;
            }
            if (sameOuId) {
              createMessage({ type: 'warn', description: '不同公司的合同，不能一起开票' });
              return;
            }
            if (invoiceAmt) {
              createMessage({ type: 'warn', description: '勾选项包含已开票合同，不允许重复开票' });
              return;
            }
            const uniqueSubContractNo = Array.from(
              new Set(selectedRows.map(row => row.contractNo))
            );
            if (uniqueSubContractNo.length > 1) {
              createMessage({ type: 'warn', description: '不同的子合同，不能一块申请开票' });
            } else {
              flag
                ? createConfirm({
                    content: '您有未保存的修改,是否要继续此操作?',
                    onOk: () => {
                      router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
                    },
                  })
                : router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
            }
          },
        },
        // {
        //   key: 'invInput',
        //   title: '录入开票',
        //   className: 'tw-btn-info',
        //   icon: 'strikethrough',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { custId, ouId } = selectedRows[0];
        //     let sameCustId = true;
        //     let sameOuId = true;
        //     sameCustId = selectedRows.map(v => v.custId !== custId && false);
        //     sameOuId = selectedRows.map(v => v.ouId !== ouId && false);
        //     if (!sameCustId) {
        //       createMessage({ type: 'error', description: '只能勾选同一个客户进行开票' });
        //       return;
        //     }
        //     if (!sameOuId) {
        //       createMessage({ type: 'error', description: '不同公司的合同，不能一起开票' });
        //       return;
        //     }
        //     if (sameCustId && sameOuId) {
        //       // 签约公司与客户都相同
        //       if (flag) {
        //         createConfirm({
        //           content: '您有未保存的修改,是否要继续此操作?',
        //           onOk: () => {
        //             dispatch({
        //               type: 'invBatchEdit/updateState',
        //               payload: {
        //                 recvPlanList: selectedRows,
        //               },
        //             });
        //             router.push(`/plat/saleRece/invBatch/edit`);
        //           },
        //         });
        //       } else {
        //         dispatch({
        //           type: 'invBatchEdit/updateState',
        //           payload: {
        //             recvPlanList: selectedRows,
        //           },
        //         });
        //         router.push(`/plat/saleRece/invBatch/edit`); // ?custId=${custId}
        //       }
        //     }
        //   },
        // },
        {
          key: 'distInfo',
          title: '收益分配',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // （1）收款状态为“部分收款”/“已全额收款”  -> recvStatus 为 '2' 或 '3'
            const unStatisfiedStatus = selectedRows.filter(
              ({ recvStatus }) => `${recvStatus}` !== '2' && `${recvStatus}` !== '3'
            );
            if (!isEmpty(unStatisfiedStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选收款状态为“部分收款”/“已全额收款”',
              });
              return;
            }
            // （2）可以基于一个/多个收款计划发起  -> minSelections: 1
            // （3）子合同状态为“暂挂”/“激活”/“关闭” -> contractStatus 为 '3' '4' '5'
            // const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
            //   const toStr = `${contractStatus}`;
            //   return toStr !== 'PENDING' && toStr !== 'ACTIVE' && toStr !== 'CLOSE';
            // });

            // 只有子合同状态为激活的合同可以进行利益分配
            const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
              const toStr = `${contractStatus}`;
              return toStr !== 'ACTIVE';
            });
            if (!isEmpty(unStatisfiedContractStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选子合同状态为“激活”',
              });
              return;
            }
            // （4）收款计划中新增”已分配收入“和“可分配收入”字段，基于“可分配收入“的金额计算出收益分配数额，“可分配收入”金额必须有值才可以发起
            router.push(
              `/plat/saleRece/contract/list/distInfo?ids=${selectedRowKeys.join(',')}&date=${
                selectedRows[0].actualRecvDate
              }`
            );
          },
        },
        {
          key: 'defaultRule',
          title: '按默认规则分配',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // （1）收款状态为“部分收款”/“已全额收款”  -> recvStatus 为 '2' 或 '3'
            const unStatisfiedStatus = selectedRows.filter(
              ({ recvStatus }) => `${recvStatus}` !== '2' && `${recvStatus}` !== '3'
            );
            if (!isEmpty(unStatisfiedStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选收款状态为“部分收款”/“已全额收款”',
              });
              return;
            }

            // 只有子合同状态为激活的合同可以进行利益分配
            const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
              const toStr = `${contractStatus}`;
              return toStr !== 'ACTIVE';
            });
            if (!isEmpty(unStatisfiedContractStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选子合同状态为“激活”',
              });
              return;
            }

            const ids = selectedRowKeys.join(',');
            dispatch({
              type: `${DOMAIN}/defaultRule`,
              payload: {
                ids,
                triggerType: 'RECV_DIST',
              },
            }).then(res => {
              this.fetchData(searchForm);
            });
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'warning',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const delArr = [];
            selectedRowKeys.map(v => v > 0 && delArr.push(v));
            const newDataList = recvPlanList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                recvPlanList: newDataList,
                delList: delArr,
              },
            });
          },
        },
        {
          key: 'download',
          title: '收款明细导出',
          className: 'tw-btn-info',
          icon: 'download',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // eslint-disable-next-line
            location.href = toQs(`${SERVER_URL}/api/op/v1/contract/export`, queryParams);
          },
        },
      ],
      searchBarForm: [
        {
          title: '客户名称',
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: <Selection source={() => selectCust()} placeholder="请选择客户名称" />,
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
          title: '子合同名称',
          dataIndex: 'subContractName',
          options: {
            initialValue: searchForm.subContractName,
          },
          tag: <Input placeholder="请输入子合同名称" />,
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
          title: '主合同名称',
          dataIndex: 'mainContractName',
          options: {
            initialValue: searchForm.mainContractName,
          },
          tag: <Input placeholder="请输入主合同名称" />,
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          options: {
            initialValue: searchForm.userdefinedNo,
          },
          tag: <Input placeholder="请输入参考合同号" />,
        },
        {
          title: '签约公司',
          dataIndex: 'ouId',
          options: {
            initialValue: searchForm.ouId,
          },
          tag: <Selection source={() => ouInternalRq()} placeholder="请选择签约公司" />,
        },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder="请输入收款账号" />,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '销售人员',
          dataIndex: 'salesManResId',
          options: {
            initialValue: searchForm.salesManResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择销售人员"
              showSearch
            />
          ),
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
        {
          title: 'BU负责人',
          dataIndex: 'deliBuResId',
          options: {
            initialValue: searchForm.deliBuResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择BU负责人"
              showSearch
            />
          ),
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          options: {
            initialValue: searchForm.recvStatus,
          },
          tag: <Selection.UDC code="ACC.RECV_STATUS" placeholder="请选择收款状态" />,
        },
        {
          title: '预期收款日期',
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
          title: '开票日期',
          dataIndex: 'invDate',
          options: {
            initialValue: searchForm.invDate,
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
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          options: {
            initialValue: searchForm.actualRecvDate,
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
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          options: {
            initialValue: searchForm.confirmedAmt,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value=">">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="<">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="=">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="!=">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <Input placeholder="请输入已确认金额" />
            </SyntheticField>
          ),
        },
        {
          title: '可分配金额',
          dataIndex: 'distAmt',
          options: {
            initialValue: searchForm.distAmt,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value=">">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="<">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="=">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="!=">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <Input placeholder="请输入可分配金额" />
            </SyntheticField>
          ),
        },
        {
          title: '相关请款单号',
          dataIndex: 'custexpApplyId',
          options: {
            initialValue: searchForm.custexpApplyId,
          },
          tag: <Input placeholder="请输入相关请款单号" />,
          // <Selection
          //   transfer={{ key: 'id', code: 'id', name: 'name' }}
          //   // columns={applyColumns}
          //   source={() => selectApplyNo()}
          //   placeholder="请选择相关请款单号"
          //   showSearch
          // />
        },
      ],
      columns: [
        {
          title: '客户名',
          dataIndex: 'custName',
          width: 200,
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
          // width: 200,
        },
        {
          title: '子合同号',
          dataIndex: 'contractNo',
          align: 'center',
          width: 150,
          sorter: true,
        },
        {
          title: '子合同名称',
          dataIndex: 'contractName',
        },
        {
          title: '子合同状态',
          dataIndex: 'contractStatusDesc',
          align: 'center',
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          width: 120,
          sorter: true,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          align: 'center',
          width: 100,
          sorter: true,
          render: (value, row, index) => row.recvStatusDesc,
        },
        {
          title: '开票状态',
          dataIndex: 'batchStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '签约公司',
          dataIndex: 'ouName',
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          width: 100,
          // align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
          width: 100,
          // align: 'center',
        },
        {
          title: '销售人员',
          dataIndex: 'salesManResName',
          width: 100,
          // align: 'center',
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResName',
          width: 100,
          // align: 'center',
        },
        {
          title: 'BU负责人',
          dataIndex: 'deliBuResName',
          width: 100,
          // align: 'center',
        },
        // {
        //   title: '行号',
        //   dataIndex: 'lineNo',
        //   sorter: true,
        //   align: 'center',
        // },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          // align: 'center',
          width: 120,
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          // width: 100,
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100 deeperColor"
              defaultValue={value}
              onChange={this.onCellChanged(row.id, 'phaseDesc')}
            />
          ),
        },
        {
          title: '相关请款单号',
          dataIndex: 'custexpApplyNo',
          // width: 100,
          align: 'center',
          render: (value, row, index) => (
            <Link className="tw-link" to={`/user/project/custExp/detail?id=${row.custexpApplyId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '当期收款金额',
          dataIndex: 'recvAmt',
          align: 'right',
          width: 120,
          // sorter: true,
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              onChange={this.onCellChanged(row.id, 'recvAmt')}
              className="x-fill-100 deeperColor"
            />
          ),
        },
        {
          title: '当期收款比例',
          dataIndex: 'recvRatio',
          align: 'right',
          width: 120,
          sorter: true,
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value * 100}
              min={1}
              max={100}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              onChange={this.onCellChanged(row.id, 'recvRatio')}
              className="x-fill-100 deeperColor"
            />
          ),
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          sorter: true,
          width: 150,
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100 deeperColor"
              value={value}
              size="small"
              onChange={this.onCellChanged(row.id, 'expectRecvDate')}
            />
          ),
        },
        {
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          width: 150,
          sorter: true,
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100 deeperColor"
              value={value}
              size="small"
              onChange={this.onCellChanged(row.id, 'actualRecvDate')}
            />
          ),
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          align: 'right',
          width: 80,
          sorter: true,
        },
        {
          title: '开票日期',
          dataIndex: 'invDate',
          width: 130,
          sorter: true,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'right',
          width: 100,
          // sorter: true,
        },
        {
          title: '未开票金额',
          dataIndex: 'unInvAmt',
          align: 'right',
          width: 100,
          // sorter: true,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'right',
          width: 100,
          // sorter: true,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'right',
          width: 100,
          // sorter: true,
        },
        {
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          width: 100,
          align: 'right',
        },
        {
          title: '可分配金额',
          dataIndex: 'distAmt',
          width: 100,
          align: 'right',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="收款计划列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ContractRecv;
