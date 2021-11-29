import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isNil, isEmpty } from 'ramda';
import { DatePicker, Tag, Input, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, Selection, BuVersion } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectUsersWithBu, selectProject } from '@/services/gen/list';
import { selectBuBy } from '@/services/user/feeapply/feeapply';
import { formatDT, formatDTHM } from '@/utils/tempUtils/DateTime';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'prePayList';
const { Option } = Select;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const expenseColumns = [
  { dataIndex: 'code', title: '编号', span: 4 },
  { dataIndex: 'name', title: '名称', span: 20 },
];

@connect(({ loading, prePayList }) => ({
  // loading,
  prePayList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class PrePayList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { applyDate, adpayHxDate, ...restParams } = params || {};
    const applyDateObject = { applyDateStart: undefined, applyDateEnd: undefined };
    const adpayHxDateObject = { adpayHxDateStart: undefined, adpayHxDateEnd: undefined };
    if (!isNil(applyDate) && !isEmpty(applyDate)) {
      applyDateObject.applyDateStart = formatDTHM(applyDate[0]);
      applyDateObject.applyDateEnd = formatDTHM(applyDate[1]);
    }
    if (!isNil(adpayHxDate) && !isEmpty(adpayHxDate)) {
      adpayHxDateObject.adpayHxDateStart = formatDT(adpayHxDate[0]);
      adpayHxDateObject.adpayHxDateEnd = formatDT(adpayHxDate[1]);
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...restParams,
        ...applyDateObject,
        ...adpayHxDateObject,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
      },
    });
  };

  render() {
    const { loading, prePayList, dispatch } = this.props;
    const { list, total, searchForm } = prePayList;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1600 },
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        // {
        //   title: '申请人',
        //   dataIndex: 'applyResId',
        //   tag: (
        //     <Selection.Columns
        //       placeholder="请选择申请人"
        //       source={() => selectUsersWithBu()}
        //       columns={applyColumns}
        //       transfer={{ key: 'id', code: 'id', name: 'name' }}
        //       showSearch
        //       allowClear
        //     />
        //   ),
        // },
        {
          title: '业务类型',
          dataIndex: 'prepayType',
          options: {
            initialValue: searchForm.prepayType,
          },
          tag: <Selection.UDC code="ACC:PREPAY_TYPE" placeholder="请选择" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '相关采购合同',
          dataIndex: 'pcontractName',
          options: {
            initialValue: searchForm.pcontractName,
          },
        },
        {
          title: '相关项目',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          // tag: (
          //   <AsyncSelect
          //     source={() => selectProject().then(resp => resp.response)}
          //     showSearch
          //     filterOption={(input, option) =>
          //       option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //     }
          //     placeholder="请选择相关项目"
          //   />
          // ),
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatus',
          options: {
            initialValue: searchForm.applyStatus,
          },
          tag: <Selection.UDC code="ACC:APPLY_STATUS" placeholder="请选择" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierName',
          options: {
            initialValue: searchForm.supplierName,
          },
          // tag: (
          //   <AsyncSelect
          //     source={() => selectSupplier().then(resp => resp.response)}
          //     placeholder="请选择供应商"
          //     showSearch
          //     filterOption={(input, option) =>
          //       option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //     }
          //   />
          // ),
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '预计核销日期',
          dataIndex: 'adpayHxDate',
          options: {
            initialValue: searchForm.adpayHxDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '核销状态',
          dataIndex: 'processState',
          options: {
            initialValue: searchForm.processState,
          },
          tag: <Selection.UDC code="ACC:ADPAY_HX_STATE" placeholder="请选择" />,
        },
        {
          title: '是否延期核销',
          dataIndex: 'isHxDelay',
          options: {
            initialValue: searchForm.isHxDelay,
          },
          tag: <Selection.UDC code="COM:YESNO" placeholder="请选择" />,
        },
      ],
      columns: [
        {
          title: '预付款单号',
          dataIndex: 'applyNo',
          width: 150,
          render: (value, rowData) => {
            const href = `/user/center/prePay/detail?id=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '业务类型',
          dataIndex: 'prepayTypeDesc',
          width: 150,
          align: 'center',
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '相关采购合同',
          dataIndex: 'pcontractName',
          width: 200,
        },
        {
          title: '相关项目',
          dataIndex: 'reasonName',
          // width: 100,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          width: 150,
        },
        {
          title: '供应商',
          dataIndex: 'supplierName',
          // width: 200,
        },
        {
          title: '预付金额',
          dataIndex: 'adpayAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '预付款核销日期',
          dataIndex: 'adpayHxDate',
          align: 'center',
          width: 100,
        },
        {
          title: '已核销金额',
          dataIndex: 'alreadyAmt',
          align: 'center',
          width: 100,
        },
        {
          title: '核销状态',
          dataIndex: 'processStateName',
          align: 'center',
          width: 100,
        },
        {
          title: '是否延期核销字段',
          dataIndex: 'isHxDelayName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          width: 150,
          render: value => formatDTHM(value),
        },
        // {
        //   title: '审批状态',
        //   dataIndex: 'apprStatusDesc',
        // },
        // {
        //   title: '申请人资源ID',
        //   dataIndex: 'applyResName',
        // },
        // {
        //   title: '补贴起始月份',
        //   dataIndex: 'startPeriodId',
        // },
        // {
        //   title: '申请人',
        //   dataIndex: 'resBuName',
        // },
      ],
      leftButtons: [
        // {
        //   key: 'add',
        //   icon: 'plus-circle',
        //   className: 'tw-btn-primary',
        //   title: formatMessage({ id: 'misc.insert', desc: '新增' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     router.push('/user/center/prePay/create');
        //   },
        // },
        // {
        //   key: 'edit',
        //   icon: 'form',
        //   className: 'tw-btn-primary',
        //   title: formatMessage({ id: `misc.update`, desc: '修改' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => {
        //     if (isEmpty(selectedRows)) return true;
        //     const { isInitial, procId } = selectedRows[0];
        //     if (!!isInitial || isNil(procId)) return false;
        //     return true;
        //   },
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { id, isInitial, procId } = selectedRows[0];
        //     !isNil(id) &&
        //       (!!isInitial || isNil(procId)) &&
        //       router.push(`/user/center/prePay/edit?id=${id}`);
        //   },
        // },
        // {
        //   key: 'delete',
        //   icon: 'file-excel',
        //   className: 'tw-btn-error',
        //   title: formatMessage({ id: `misc.delete`, desc: '删除' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => {
        //     if (isEmpty(selectedRows)) return true;
        //     const { isInitial, procId } = selectedRows[0];
        //     if (!!isInitial || isNil(procId)) return false;
        //     return true;
        //   },
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { id } = selectedRows[0];
        //     !isNil(id) &&
        //       dispatch({ type: `${DOMAIN}/delete`, payload: id }).then(success => {
        //         if (success) {
        //           dispatch({
        //             type: `${DOMAIN}/updateSearchForm`,
        //             payload: { selectedRowKeys: [] },
        //           });
        //           this.fetchData(searchForm);
        //         }
        //       });
        //   },
        // },
        // {
        //   key: 'verification',
        //   icon: 'plus-circle',
        //   className: 'tw-btn-primary',
        //   title: '预付款核销',
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => {
        //     if (selectedRows && selectedRows.length !== 1) {
        //       return true;
        //     }
        //     const { applyStatus } = selectedRows[0];
        //     if (applyStatus === 'APPROVED') {
        //       return false;
        //     }
        //     return true;
        //   },
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { id } = selectedRows[0];
        //     router.push(
        //       `/plat/purchPay/advanceVerification/create?id=${id}&sourceUrl=/user/center/prePay`
        //     );
        //   },
        // },
      ],
    };

    return (
      <PageHeaderWrapper title="预付款列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrePayList;
