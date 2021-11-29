import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import createMessage from '@/components/core/AlertMessage';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import styles from './index.less';

const { Description } = DescriptionList;

const DOMAIN = 'messageInfo';
@connect(({ loading, messageInfo, dispatch }) => ({
  loading,
  messageInfo,
  dispatch,
}))
// @mountToTab()
class MessageDetail extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: 'messageInfo/updateState',
      payload: {
        detailFormData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryMessageDetailInfo`,
      payload: {
        id,
      },
    });
  };

  render() {
    const {
      messageInfo: { detailFormData = {} },
    } = this.props;
    return (
      <PageHeaderWrapper title="消息详情">
        <Card className="tw-card-rightLine">
          <Button
            className="separate tw-btn-default"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              closeThenGoto(`/plat/messageMgmt/message`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {!detailFormData.id ? (
          <Loading />
        ) : (
          <Card bordered={false}>
            <DescriptionList size="large" col={2}>
              <Description term="标题">{detailFormData.releaseTitle}</Description>
              <Description term="发布来源">{detailFormData.releaseSource}</Description>
              <Description term="消息类型">{detailFormData.releaseTypeName}</Description>
              <Description term="发布时间">{detailFormData.releaseTime}</Description>
              <Description term="消息级别">{detailFormData.releaseLevelName}</Description>
              <Description term="通知方式">
                {detailFormData.noticeWayNameList && detailFormData.noticeWayNameList.length > 0
                  ? detailFormData.noticeWayNameList.join(', ')
                  : ''}
              </Description>
              <Description term="消息标签">{detailFormData.messageTagName}</Description>
            </DescriptionList>
            <DescriptionList size="large" col={1} style={{ marginTop: '-32px' }}>
              <Description term="通知范围">
                {detailFormData.noticeScopeList && detailFormData.noticeScopeList.length > 0
                  ? detailFormData.noticeScopeList.join(', ')
                  : ''}
              </Description>
            </DescriptionList>

            <div
              className={`${
                styles.paper
              } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
              dangerouslySetInnerHTML={{ __html: detailFormData.releaseBody }}
            />
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default MessageDetail;
