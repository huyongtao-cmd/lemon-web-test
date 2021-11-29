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

const DOMAIN = 'timingMessageInfo';
@connect(({ loading, timingMessageInfo, dispatch }) => ({
  loading,
  timingMessageInfo,
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
      type: 'timingMessageInfo/updateState',
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
      timingMessageInfo: { detailFormData = {} },
    } = this.props;
    const {
      noticeScopeFlag,
      timingCode,
      noticeScopeList,
      releaseTitle,
      releaseSource,
      releaseTypeName,
      releaseLevelName,
      noticeWayNameList,
      timingUsable,
    } = detailFormData;
    let noticeScopeName = '';
    if (noticeScopeFlag === 3) {
      noticeScopeName = '全员';
    }
    if (noticeScopeFlag === 4) {
      noticeScopeName = '自定义逻辑';
    }
    if (noticeScopeFlag === 0 || noticeScopeFlag === 1 || noticeScopeFlag === 2) {
      noticeScopeName = '固定对象';
    }
    return (
      <PageHeaderWrapper title="定时消息模版详情">
        <Card className="tw-card-rightLine">
          <Button
            className="separate tw-btn-default"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              closeThenGoto(`/plat/messageMgmt/timingMessage`);
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
              <Description term="标题">{releaseTitle}</Description>
              <Description term="发布来源">{releaseSource}</Description>
              <Description term="消息类型">{releaseTypeName}</Description>
              <Description term="消息级别">{releaseLevelName}</Description>
              <Description term="通知方式">
                {noticeWayNameList && noticeWayNameList.length > 0
                  ? noticeWayNameList.join(', ')
                  : ''}
              </Description>
              <Description term="启用">{timingUsable === 'YES' ? '是' : '否'}</Description>
            </DescriptionList>

            <div
              className={`${
                styles.paper
              } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
              dangerouslySetInnerHTML={{ __html: detailFormData.releaseBody }}
            />
            <div style={{ clear: 'both' }} />
            <DescriptionList size="large" col={1}>
              <Description term="通知范围">{noticeScopeName}</Description>
            </DescriptionList>
            {noticeScopeFlag === 4 && (
              <div
                className="ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15"
                style={{ background: '#eee', padding: '15px 30px', margin: '0 0 0 108px' }}
              >
                {noticeScopeName}
              </div>
            )}

            {(noticeScopeFlag === 0 || noticeScopeFlag === 1 || noticeScopeFlag === 2) && (
              <div
                className="ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15"
                style={{ background: '#eee', padding: '15px 30px', margin: '0 0 0 108px' }}
              >
                {noticeScopeList && noticeScopeList.join(',')}
              </div>
            )}
            <div style={{ clear: 'both' }} />
            <DescriptionList size="large" col={1}>
              <Description term="定时发送码">{timingCode}</Description>
            </DescriptionList>
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default MessageDetail;
