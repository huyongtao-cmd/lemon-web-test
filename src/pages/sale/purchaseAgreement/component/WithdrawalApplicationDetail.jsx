import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Button, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { getUrl } from '@/utils/flowToRouter';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import FlowButton from '@/components/common/FlowButton';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { gte, isNil, isEmpty, clone, sum } from 'ramda';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import { stringify } from 'qs';
import moment from 'moment';
import style from '../style.less';

const DOMAIN = 'salePurchaseAgreementsDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, salePurchaseAgreementsDetail }) => ({
  loading,
  dispatch,
  salePurchaseAgreementsDetail,
}))
@mountToTab()
class Detail extends PureComponent {
  componentDidMount() {
    // const { dispatch } = this.props;
    // const { pid, pcontractId, taskId } = fromQs();
    // taskId &&
    //   dispatch({
    //     type: `${DOMAIN}/fetchConfig`,
    //     payload: taskId,
    //   });
    // dispatch({
    //   type: `${DOMAIN}/queryPurchase`,
    //   payload: pid || pcontractId,
    // });
    // dispatch({
    //   type: `${DOMAIN}/queryPlanList`,
    //   payload: pid || pcontractId,
    // });
  }

  tableProps = () => {
    const {
      salePurchaseAgreementsDetail: { detailData, pageConfig },
      loading,
    } = this.props;
    const { from } = fromQs();

    if (!detailData.agreementWithdrawViews.find(item => item.id === 'sum')) {
      detailData.agreementWithdrawViews.push({
        id: 'sum',
        eqva: detailData.agreementWithdrawViews.reduce(
          (total, item) => mathAdd(total, item.eqva),
          0
        ),
        amt: detailData.agreementWithdrawViews.reduce((total, item) => mathAdd(total, item.amt), 0),
      });
    }

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_WITHDRAW'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const columnsList = [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 50,
        render: (value, record, index) => (value !== 'sum' ? index + 1 : '合计'),
      },
      {
        title: `${pageFieldJson.resId.displayName}`,
        sortNo: `${pageFieldJson.resId.sortNo}`,
        key: 'resId',
        dataIndex: 'resName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.applyDate.displayName}`,
        sortNo: `${pageFieldJson.applyDate.sortNo}`,
        key: 'applyDate',
        dataIndex: 'applyDate',
        className: 'text-center',
        width: 150,
        render: (value, row, index) => formatDT(value),
      },
      {
        title: `${pageFieldJson.coopType.displayName}`,
        sortNo: `${pageFieldJson.coopType.sortNo}`,
        key: 'coopType',
        dataIndex: 'coopTypeName',
        className: 'text-right',
        width: 200,
      },
      {
        title: `${pageFieldJson.eqva.displayName}`,
        sortNo: `${pageFieldJson.eqva.sortNo}`,
        key: 'eqva',
        dataIndex: 'eqva',
        className: 'text-right',
        width: 200,
      },
      {
        title: `${pageFieldJson.amt.displayName}`,
        sortNo: `${pageFieldJson.amt.sortNo}`,
        key: 'amt',
        dataIndex: 'amt',
        className: 'text-right',
        width: 200,
      },
      {
        title: `${pageFieldJson.hrBatchNo.displayName}`,
        sortNo: `${pageFieldJson.hrBatchNo.sortNo}`,
        key: 'hrBatchNo',
        dataIndex: 'hrBatchNo',
        className: 'text-right',
        width: 300,
      },
      {
        title: `${pageFieldJson.withdrawStatus.displayName}`,
        sortNo: `${pageFieldJson.withdrawStatus.sortNo}`,
        key: 'withdrawStatus',
        dataIndex: 'withdrawStatusDesc',
        className: 'text-center',
        width: 150,
      },
      {
        title: `${pageFieldJson.paymentNo.displayName}`,
        sortNo: `${pageFieldJson.paymentNo.sortNo}`,
        key: 'paymentNo',
        dataIndex: 'paymentNo',
        className: 'text-left',
        width: 300,
      },
      {
        title: `${pageFieldJson.state.displayName}`,
        sortNo: `${pageFieldJson.state.sortNo}`,
        key: 'state',
        dataIndex: 'stateName',
        className: 'text-center',
        width: 150,
      },
    ];
    const columnsFilterList = columnsList.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );

    const tableProps = {
      rowKey: 'id',
      showSearch: false,
      // loading: loading.effects[`${DOMAIN}/queryDetail`],
      // scroll: {
      //   x: 1700,
      // },
      dataSource: detailData.agreementWithdrawViews,
      // enableSelection: from === 'list' && payBtnsFilterList.length > 0,
      enableSelection: false,
      columns: columnsFilterList,
      pagination: false,
    };
    return tableProps;
  };

  render() {
    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">提现申请</div>
        <DataTable {...this.tableProps()} />
      </Card>
    );
  }
}

export default Detail;
