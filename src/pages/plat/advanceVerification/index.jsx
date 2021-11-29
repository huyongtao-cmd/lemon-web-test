import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isNil, isEmpty } from 'ramda';
import { DatePicker, Tag, Input, Select, Modal, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, Selection } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectUsersWithBu, selectProject } from '@/services/gen/list';
import { selectBuBy } from '@/services/user/feeapply/feeapply';
import { formatDT, formatDTHM } from '@/utils/tempUtils/DateTime';
import moment from 'moment';
import FieldList from '@/components/layout/FieldList';
import { selectInnerAccount } from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'advanceVerificationList';
const { Option } = Select;
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const expenseColumns = [
  { dataIndex: 'code', title: '编号', span: 4 },
  { dataIndex: 'name', title: '名称', span: 20 },
];

@connect(({ loading, advanceVerificationList }) => ({
  // loading,
  advanceVerificationList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    const {
      advanceVerificationList: { jdePay },
    } = props;
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jdePay: { ...jdePay, ...changedValues } },
      });
    }
  },
})
@mountToTab()
class AdvanceVerificationList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC', limit: 10, offset: 0 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { applyDate, ...restParams } = params || {};
    const applyDateObject = { startTime: undefined, endTime: undefined };
    if (!isNil(applyDate) && !isEmpty(applyDate)) {
      applyDateObject.startTime = formatDT(applyDate[0]);
      applyDateObject.endTime = formatDT(applyDate[1]);
    }
    if (!restParams.prepayApplyNo) {
      delete restParams.prepayApplyNo;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...restParams, ...applyDateObject } });
  };

  render() {
    const {
      loading,
      advanceVerificationList,
      dispatch,
      form: { getFieldDecorator },
    } = this.props;
    const { list, total, searchForm } = advanceVerificationList;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '120%' },
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
        {
          title: '业务类型',
          dataIndex: 'prepayType',
          options: {
            initialValue: searchForm.prepayType,
          },
          tag: <Selection.UDC code="ACC:PREPAY_TYPE" placeholder="请选择" />,
        },
        {
          title: '预付款核销单号',
          dataIndex: 'prepayApplyNo',
          options: {
            initialValue: searchForm.prepayApplyNo,
          },
        },
        {
          title: '核销方式',
          dataIndex: 'hxType',
          options: {
            initialValue: searchForm.hxType,
          },
          tag: <Selection.UDC code="ACC:HX_TYPE" placeholder="请选择" />,
        },
        {
          title: '核销流程状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="ACC:REIM_STATUS" placeholder="请选择" />,
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
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择费用承担BU"
              source={() => selectBuBy()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择申请人"
              source={() => selectUsersWithBu()}
              columns={applyColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
      ],
      columns: [
        {
          title: '预付款核销单号',
          dataIndex: 'prepayApplyNo',
          align: 'center',
          render: (value, rowData) => {
            const href = `/plat/purchPay/advanceVerification/view?id=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '关联预付款',
          dataIndex: 'applyNo',
          align: 'center',
        },
        {
          title: '业务类型',
          dataIndex: 'prepayTypename',
          align: 'center',
        },
        {
          title: '预付款总额',
          dataIndex: 'adpayAmt',
          align: 'center',
        },
        {
          title: '核销方式',
          dataIndex: 'hxTypeName',
          align: 'center',
        },
        {
          title: '核销金额',
          dataIndex: 'reimAmt',
          align: 'center',
        },
        {
          title: '流程状态',
          dataIndex: 'apprStatusName',
          align: 'center',
        },
        {
          title: '核销状态',
          dataIndex: 'processStateName',
          align: 'center',
        },

        {
          title: '申请时间',
          dataIndex: 'applyDate',
          align: 'center',
          // render: value => formatDT(value),
        },

        {
          title: '创建日期',
          dataIndex: 'reimCreateTime',
          align: 'center',
          // render: value => formatDTHM(value),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="预付款核销">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default AdvanceVerificationList;
