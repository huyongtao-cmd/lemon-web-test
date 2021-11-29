import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import { closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import { fromQs } from '@/utils/stringUtils';
import styles from '../../../user/center/message/index.less';

const { Description } = DescriptionList;

const DOMAIN = 'messageConfigDetail';

@connect(({ loading, messageConfigDetail, dispatch }) => ({
  loading,
  messageConfigDetail,
  dispatch,
}))
class MessageConfigDetail extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailFormData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  };

  render() {
    const {
      messageConfigDetail: { detailFormData },
    } = this.props;
    return (
      <PageHeaderWrapper title="消息通知配置详情">
        <Card className="tw-card-rightLine">
          <Button
            className="separate tw-btn-default"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              closeThenGoto(`/sys/system/MessageConfig`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card bordered={false}>
          <DescriptionList size="large" col={2}>
            <Description term="标题">
              {detailFormData ? detailFormData.configurationTitle : undefined}
            </Description>
            <Description term="消息编码">
              {detailFormData ? detailFormData.configurationNo : undefined}
            </Description>
            <Description term="内容类型">
              {detailFormData ? detailFormData.contentTypeName : undefined}
            </Description>
            <Description term="发布来源">
              {detailFormData ? detailFormData.releaseSource : undefined}
            </Description>
            <Description term="消息级别">
              {detailFormData ? detailFormData.releaseLevelName : undefined}
            </Description>
            <Description term="通知方式">
              {detailFormData ? detailFormData.noticeWayName : undefined}
            </Description>
            <Description term="通知范围/说明">
              {detailFormData ? detailFormData.noticeScopeName : undefined}/
              {detailFormData ? detailFormData.roles : undefined}
            </Description>
            <Description term="消息标签">
              {detailFormData ? detailFormData.messageTagName : undefined}
            </Description>
            <Description term="触发方式">{detailFormData.triggerModeName}</Description>
            {detailFormData.triggerMode === 'EVENTS_TRIGGER' ? (
              <Description term="事件触发说明">{detailFormData.triggerModeDesc}</Description>
            ) : null}
            {detailFormData.triggerMode === 'TIME_TRIGGER' ? (
              <Description term="时间表达式">{detailFormData.triggerTimeExpression}</Description>
            ) : null}
            <Description term="是否有效">
              {detailFormData.enabledFlag === 1
                ? '是'
                : (detailFormData.enabledFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="备注">{detailFormData.remark}</Description>
            <Description term="表达式说明">{detailFormData.expressionDesc}</Description>
          </DescriptionList>
          <div
            className={`${
              styles.paper
            } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
            dangerouslySetInnerHTML={{ __html: detailFormData.configurationContent }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MessageConfigDetail;
