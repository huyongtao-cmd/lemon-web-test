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
import { div, mul } from '@/utils/mathUtils';
import { gte, isNil, isEmpty, clone } from 'ramda';
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
  componentDidMount() {}

  tableProps = () => {
    const {
      salePurchaseAgreementsDetail: { detailData, pageConfig },
      loading,
    } = this.props;

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_RES_DTL'
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
        render: (value, record, index) => index + 1,
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
        title: `${pageFieldJson.resStartDate.displayName}`,
        sortNo: `${pageFieldJson.resStartDate.sortNo}`,
        key: 'resStartDate',
        dataIndex: 'resStartDate',
        className: 'text-center',
        width: 150,
        render: (value, record, index) => `${record.resStartDate} ~ ${record.resEndDate}`,
      },
    ];
    const columnsFilterList = columnsList.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );

    const tableProps = {
      rowKey: 'id',
      showSearch: false,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      // scroll: {
      //   x: 1700,
      // },
      dataSource: detailData.agreementResViews,
      enableSelection: false,
      columns: columnsFilterList,
      pagination: false,
    };
    return tableProps;
  };

  render() {
    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">关联资源</div>
        <DataTable {...this.tableProps()} />
      </Card>
    );
  }
}

export default Detail;
