import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { mountToTab } from '@/layouts/routerControl';
import moment from 'moment';
import style from '../style.less';

const DOMAIN = 'salePurchaseDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, salePurchaseDetail }) => ({
  loading,
  dispatch,
  salePurchaseDetail,
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

  render() {
    const {
      salePurchaseDetail: { detailData: formData, pageConfig },
      dispatch,
      loading,
    } = this.props;
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_DEL'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    console.log(pageFieldJson, 'pageFieldJson');

    const fields = [
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
        term={pageFieldJson.contractStatus.displayName}
        key="contractStatus"
        sortno={pageFieldJson.contractStatus.sortNo}
      >
        {formData.contractStatusDesc}
      </Description>,
      <Description
        term={pageFieldJson.contractSource.displayName}
        key="contractSource"
        sortno={pageFieldJson.contractSource.sortNo}
      >
        {formData.contractSource}
      </Description>,
      <Description
        term={pageFieldJson.contractSourceNo.displayName}
        key="contractSourceNo"
        sortno={pageFieldJson.contractSourceNo.sortNo}
      >
        {formData.contractSourceNo}
      </Description>,
      <Description
        term={pageFieldJson.activateDate.displayName}
        key="activateDate"
        sortno={pageFieldJson.activateDate.sortNo}
      >
        {formData.activateDate ? moment(formData.activateDate).format('YYYY-MM-DD HH:mm:ss') : null}
      </Description>,
      <Description
        term={pageFieldJson.overWhy.displayName}
        key="overWhy"
        sortno={pageFieldJson.overWhy.sortNo}
      >
        {formData.overWhy}
      </Description>,
      <Description
        term={pageFieldJson.overTime.displayName}
        key="overTime"
        sortno={pageFieldJson.overTime.sortNo}
      >
        {formData.overTime ? moment(formData.overTime).format('YYYY-MM-DD HH:mm:ss') : null}
      </Description>,
      <Description
        term={pageFieldJson.preDocResId.displayName}
        key="preDocResId"
        sortno={pageFieldJson.preDocResId.sortNo}
      >
        {formData.preDocResName}
      </Description>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);

    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">单据信息</div>
        <DescriptionList size="large" col={3} className={style.fill}>
          {filterList}
        </DescriptionList>
      </Card>
    );
  }
}

export default Detail;
