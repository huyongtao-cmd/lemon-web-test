import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Card, Row, Col, Input, Form, Button, Modal } from 'antd';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import RichText from '@/components/common/RichText';
import Ueditor from '@/components/common/Ueditor';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { selectIamUsers } from '@/services/gen/list';
import Loading from '@/components/core/DataLoading';
import moment from 'moment';
import PointModal from './Component/modal';
// import PointAlert from './Component/alert';

import styles from './index.less';
// import { index } from 'mathjs';

const { Field } = FieldList;
const { confirm } = Modal;

const DOMAIN = 'feedbackInfo';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, feedbackInfo, dispatch }) => ({
  loading,
  feedbackInfo,
  dispatch,
}))
@Form.create()
@mountToTab()
class FeedbackDetail extends React.PureComponent {
  state = {
    richTextContent: '',
    handleFeedStatus: 'SOLVING',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // id, isUser isUser 的值为 YES 或者 NO 分别代表是或者不是用户点进到详情页面
    const { id } = fromQs();
    dispatch({
      type: 'feedbackInfo/clean',
    });
    dispatch({
      type: 'feedbackInfo/queryFeedbackInfo',
      payload: {
        id,
      },
    });
    dispatch({
      type: 'feedbackInfo/queryRemarkAndResult',
      payload: {
        id,
      },
    });
  }

  handleSave = () => {
    const { dispatch } = this.props;
    const { handleFeedStatus } = this.state;
    const { id, isUser } = fromQs();
    const richTextContent = this.editor.getContent();

    if (!richTextContent || richTextContent.replace(/(^\s*)|(\s*$)/g, '').length < 12) {
      createMessage({ type: 'error', description: '反馈内容最少需要5个字' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/save`,
      payload: {
        id: parseInt(id, 10),
        problemContent: richTextContent,
        solveState: handleFeedStatus,
        solveType: isUser,
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        btnCanUse: false,
      },
    });
  };

  handleClose = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    let { richTextContent } = this.state;
    if (richTextContent.replace(/(^\s*)|(\s*$)/g, '') === '<p></p>') {
      richTextContent = '';
    }
    confirm({
      title: '确认关闭问题？',
      content: '关闭问题后无法进行回复',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: `${DOMAIN}/close`,
          payload: {
            ids: [parseInt(id, 10)],
            content: richTextContent,
            backHome: true,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btnCanUse: false,
          },
        });
      },
      onCancel() {},
    });
  };

  getRichText = value => {
    this.setState({
      richTextContent: value,
    });
  };

  changeFeedbackStatus = () => {
    let { handleFeedStatus } = this.state;
    if (handleFeedStatus === 'SOLVING') {
      handleFeedStatus = 'RESOLVED';
    } else {
      handleFeedStatus = 'SOLVING';
    }
    this.setState({
      handleFeedStatus,
    });
  };

  addPoint = content => {
    const { dispatch } = this.props;
    const { pointType } = this.state;
    if (pointType === 'result') {
      dispatch({
        type: `${DOMAIN}/saveResult`,
        payload: { ...content },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/saveRemark`,
        payload: { ...content },
      });
    }
    // const { id } = fromQs();
    // if (!content || content.replace(/(^\s*)|(\s*$)/g, '').length < 1) {
    //   createMessage({ type: 'error', description: '请输入内容' });
    //   return;
    // }
    // dispatch({
    //   type: `${DOMAIN}/saveResult`,
    //   payload: {
    //     pointContent: content,
    //     pointType,
    //     id,
    //   },
    // });
    this.onToggle();
  };

  addRemark = content => {
    const { dispatch } = this.props;
    const { pointType } = this.state;
    const { id } = fromQs();
    if (!content || content.replace(/(^\s*)|(\s*$)/g, '').length < 1) {
      createMessage({ type: 'error', description: '请输入内容' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/saveRemark`,
      payload: {
        pointContent: content,
        pointType,
        id,
      },
    });
    this.onToggle();
  };

  onToggle = () => {
    this.setState({
      visible: false,
    });
  };

  addPointHandle = pType => {
    this.setState({
      visible: true,
      pointType: pType,
    });
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      feedbackInfo: {
        formData,
        btnCanUse,
        feedStatus = 'SOLVING',
        feedbackDetail = {},
        remarkDetail = [],
        resultDetail = [],
      },
    } = this.props;
    const { getFieldDecorator } = form;

    const {
      problemTitle = '',
      problemTypeName = '',
      solveState = '',
      problemUrl = '',
      name = '',
      problemTime = '',
      problemContent = '',
      resNo = '',
      FeedBackdetial = [],
      solveStateName = '',
    } = feedbackDetail;
    const { handleFeedStatus, visible, pointType } = this.state;
    const detailLength = FeedBackdetial.length;
    const linkName = window.location.protocol + window.location.hostname;
    const linkPort = window.location.port;
    const { isUser } = fromQs();
    return (
      <PageHeaderWrapper title="问题反馈">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sys/maintMgmt/feedback')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {!problemTitle ? (
          <Card title="反馈信息">
            <Loading />
          </Card>
        ) : (
          <Card title="反馈信息">
            <div className={styles.feedbackTitle}>
              <div>
                <span className={styles.minorContent}>
                  [{problemTypeName}
                  ]&nbsp;&nbsp;
                </span>
                {problemTitle}
                <span className={styles.feedbackItemSolverStatus}>{solveStateName}</span>
              </div>
              <div className={styles.minorContent}>
                问题URL:&nbsp;&nbsp;
                <span
                  className={styles.link}
                  onClick={() => {
                    router.push(problemUrl);
                  }}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {linkName}
                  {linkPort ? ':' + linkPort : ''}
                  {problemUrl}
                </span>
              </div>
            </div>

            <div className={styles.feedbackItem}>
              <div className={styles.feedbackItemUser}>
                {name} ({resNo}) | {problemTime}
              </div>
              <div
                className={styles.feedbackItemContent}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: problemContent }}
              />
            </div>

            {FeedBackdetial.map((item, index) => (
              <div
                className={
                  index + 1 === detailLength && item.solveType === 'NO' ? styles.activeItem : ''
                }
                key={item.problemTime}
              >
                <div className={styles.feedbackItem}>
                  <div
                    className={
                      item.solveType === 'NO' ? styles.feedbackItemSolver : styles.feedbackItemUser
                    }
                  >
                    {item.name} ({item.resNo}) | {item.problemTime}
                  </div>
                  <div
                    className={styles.feedbackItemContent}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: item.problemContent }}
                  />
                </div>
              </div>
            ))}
          </Card>
        )}

        {isUser === 'NO' && (
          <Card
            title="处理结果"
            style={{ marginTop: '10px' }}
            extra={
              <Button
                onClick={() => {
                  this.addPointHandle('result');
                }}
              >
                添加处理结果
              </Button>
            }
          >
            {resultDetail.map((item, index) => (
              <div key={item.createTime}>
                <div className={styles.feedbackItem}>
                  {item.problemLead && item.resultName ? (
                    <>
                      <div className={styles.feedbackItemUser}>
                        {/* {item.createUserName} ({item.createUserNo}) | {item.createTime} */}
                        {item.handler} ({item.handlerNo}) |{' '}
                        {moment(item.procesTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                      <div className={styles.feedbackItemContent}>
                        <span>负责人：</span>
                        <span dangerouslySetInnerHTML={{ __html: item.problemLead }} />
                      </div>
                      <div className={styles.feedbackItemContent}>
                        <span>处理结果：</span>
                        <span dangerouslySetInnerHTML={{ __html: item.resultName }} />
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}

        {isUser === 'NO' && (
          <Card
            title="备注"
            style={{ marginTop: '10px' }}
            extra={
              // remarkDetail.length === 0 ? (
              <Button
                onClick={() => {
                  this.addPointHandle('remark');
                }}
              >
                添加备注
              </Button>
              // ) : (
              //   <div />
              // )
            }
          >
            {remarkDetail.map((item, index) => (
              <div key={item.createTime}>
                <div className={styles.feedbackItem}>
                  <div className={styles.feedbackItemUser}>
                    {item.createUserName} ({item.createUserNo}) | {item.createTime}
                  </div>
                  <div
                    className={styles.feedbackItemContent}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: item.remark }}
                  />
                </div>
              </div>
            ))}
          </Card>
        )}

        {feedStatus === 'CLOSE' ? (
          ''
        ) : (
          <Card
            title="处理信息"
            style={{ marginTop: '10px' }}
            className={styles.feedbackStatusWrap}
          >
            {isUser === 'YES' ? (
              ''
            ) : (
              <Button
                className={handleFeedStatus === 'SOLVING' ? styles.noSolving : styles.resolved}
                type="primary"
                // icon="save"
                size="large"
                onClick={() => this.changeFeedbackStatus()}
                style={{ margin: '0 auto 10px' }}
              >
                {handleFeedStatus === 'SOLVING' ? '处理中' : '已解决'}
              </Button>
            )}

            {/* <RichText
              onChange={value => {
                this.getRichText(value);
              }}
            /> */}

            <Ueditor
              id="feedbackEditor"
              height="400"
              width="100%"
              initialContent=""
              ref={editor => {
                this.editor = editor;
              }}
            />

            <div className={styles.btnWrap}>
              <Button
                className="tw-btn-primary"
                type="primary"
                // icon="save"
                size="large"
                style={{
                  marginRight: '20px',
                }}
                disabled={!btnCanUse}
                onClick={() => this.handleSave()}
              >
                提交
              </Button>
              {isUser === 'YES' ? (
                <Button
                  className="tw-btn-error"
                  type="error"
                  // icon="save"
                  size="large"
                  disabled={!btnCanUse}
                  onClick={() => this.handleClose()}
                >
                  关闭问题
                </Button>
              ) : (
                ''
              )}
            </div>
          </Card>
        )}
        <PointModal
          addPoint={this.addPoint}
          visible={visible}
          onToggle={this.onToggle}
          pointType={pointType}
          // addRemark={this.addRemark}
        />
      </PageHeaderWrapper>
    );
  }
}

export default FeedbackDetail;
