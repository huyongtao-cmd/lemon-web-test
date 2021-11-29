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
import { fromQs } from '@/utils/stringUtils';

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
    const { id } = fromQs();
    this.fetchData({ id });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/querySingleList`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      advanceVerificationList,
      dispatch,
      form: { getFieldDecorator },
    } = this.props;
    const { singleList, total } = advanceVerificationList;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '120%' },
      loading,
      total: singleList.length,
      dataSource: singleList,
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
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
          title: '核销金额',
          dataIndex: 'reimAmt',
          align: 'center',
        },
        {
          title: '核销方式',
          dataIndex: 'hxTypeName',
          align: 'center',
        },
        {
          title: '备注说明',
          dataIndex: 'remark',
          align: 'center',
        },
        {
          title: '核销流程状态',
          dataIndex: 'apprStatusName',
          align: 'center',
        },

        {
          title: '申请时间',
          dataIndex: 'reimCreateTime',
          align: 'center',
          // render: value => formatDT(value),
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
