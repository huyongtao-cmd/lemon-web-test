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

  render() {
    const {
      salePurchaseAgreementsDetail: { detailData: formData, pageConfig },
      loading,
    } = this.props;

    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_MASTER_SCOPE_DTL'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const mainFields = [
      <Description
        term={pageFieldJson.createUserId.displayName}
        key="createUserId"
        sortno={pageFieldJson.createUserId.sortNo}
      >
        {formData.createUserName}
      </Description>,
      <Description
        term={pageFieldJson.createTime.displayName}
        key="createTime"
        sortno={pageFieldJson.createTime.sortNo}
      >
        {formData.createTime ? moment(formData.createTime).format('YYYY-MM-DD') : null}
      </Description>,
      <Description
        term={pageFieldJson.agreementStatus.displayName}
        key="agreementStatus"
        sortno={pageFieldJson.agreementStatus.sortNo}
      >
        {formData.agreementStatusDesc}
      </Description>,
      <Description
        term={pageFieldJson.attAgreementNo.displayName}
        key="attAgreementNo"
        sortno={pageFieldJson.attAgreementNo.sortNo}
      >
        {formData.attAgreementNo}
      </Description>,
      <Description
        term={pageFieldJson.activateDate.displayName}
        key="activateDate"
        sortno={pageFieldJson.activateDate.sortNo}
      >
        {formData.activateDate ? moment(formData.activateDate).format('YYYY-MM-DD HH:mm:ss') : null}
      </Description>,
      <Description
        term={pageFieldJson.preDocResId.displayName}
        key="preDocResId"
        sortno={pageFieldJson.preDocResId.sortNo}
      >
        {formData.preDocResName}
      </Description>,
      <Description
        term={pageFieldJson.overWhy.displayName}
        key="overWhy"
        sortno={pageFieldJson.overWhy.sortNo}
      >
        {formData.overWhy}
      </Description>,
      <Description
        term={pageFieldJson.overDate.displayName}
        key="overDate"
        sortno={pageFieldJson.overDate.sortNo}
      >
        {formData.overDate ? moment(formData.overDate).format('YYYY-MM-DD HH:mm:ss') : null}
      </Description>,
    ];
    const mainFilterList = mainFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);

    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">单据信息</div>
        <DescriptionList size="large" col={3} className={style.fill}>
          {mainFilterList}
        </DescriptionList>
      </Card>
    );
  }
}

export default Detail;
