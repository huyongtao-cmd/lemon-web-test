import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
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
      salePurchaseDetail: {
        detailData: { projectPurchaseView: formData },
        pageConfig,
      },
      dispatch,
      loading,
    } = this.props;
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_PROJECT'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const fields = [
      <Description
        term={pageFieldJson.projNo.displayName}
        key="projNo"
        sortno={pageFieldJson.projNo.sortNo}
      >
        {formData.projNo}
      </Description>,
      <Description
        term={pageFieldJson.projStatus.displayName}
        key="projStatus"
        sortno={pageFieldJson.projStatus.sortNo}
      >
        {formData.projStatusName}
      </Description>,
      <Description
        term={pageFieldJson.deliBuId.displayName}
        key="deliBuId"
        sortno={pageFieldJson.deliBuId.sortNo}
      >
        {formData.deliBuName}
      </Description>,
      <Description
        term={pageFieldJson.deliResId.displayName}
        key="deliResId"
        sortno={pageFieldJson.deliResId.sortNo}
      >
        {formData.deliResName}
      </Description>,
      <Description
        term={pageFieldJson.pmResId.displayName}
        key="pmResId"
        sortno={pageFieldJson.pmResId.sortNo}
      >
        {formData.pmResName}
      </Description>,
      <Description
        term={pageFieldJson.pmoResId.displayName}
        key="pmoResId"
        sortno={pageFieldJson.pmoResId.sortNo}
      >
        {formData.pmoResIdName}
      </Description>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">项目信息</div>
        <DescriptionList size="large" col={3} className={style.fill}>
          {filterList}
        </DescriptionList>
      </Card>
    );
  }
}

export default Detail;
