import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import {
  Card,
  Row,
  Col,
  Icon,
  Divider,
  Input,
  // Carousel,
  Modal,
  Tabs,
  Badge,
  Form,
  Popover,
} from 'antd';
import { isNil } from 'ramda';
import GridContent from '@/components/layout/PageHeaderWrapper/GridContent';
// import Draggable from './Draggable';
import styles from './Center.less';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { readNotify } from '@/services/user/flow/flow';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import ShortcutMenu from '@/components/common/Workbench/ShortcutMenu';
import RemindModal from './RemindModal';

const { Field } = FieldList;
const { TabPane } = Tabs;
const DOMAIN = 'userCenter';

@connect(({ dispatch, userCenter, loading }) => ({
  dispatch,
  userCenter,
  loadingShortcut: loading.effects[`${DOMAIN}/queryShortCut`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
class Center extends PureComponent {
  state = {
    isFound: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;

    const { refresh } = fromQs();
    // 获取入职培训提示
    !refresh && dispatch({ type: `${DOMAIN}/selectTrainingAll` });

    /* 常用功能图标 */
    dispatch({ type: `${DOMAIN}/queryShortCut` });
    dispatch({ type: `${DOMAIN}/queryMyInfo` });
    dispatch({
      type: `${DOMAIN}/todo`,
      payload: { limit: 4, sortBy: 'startTime', sortDirection: 'DESC' },
    });
    dispatch({
      type: `${DOMAIN}/back`,
      payload: { limit: 4, sortBy: 'startTime', sortDirection: 'DESC' },
    });
    dispatch({
      type: `${DOMAIN}/done`,
      payload: { limit: 4, sortBy: 'startTime', sortDirection: 'DESC' },
    });
    dispatch({
      type: `${DOMAIN}/notify`,
      payload: { limit: 4, sortBy: 'startTime', sortDirection: 'DESC', onlyShowUnRead: 1 },
    });
    dispatch({
      type: `${DOMAIN}/message`,
      payload: { sortBy: 'startTime', sortDirection: 'DESC' },
    });
    dispatch({
      type: `${DOMAIN}/messageCount`,
      payload: {},
    });
    dispatch({ type: `${DOMAIN}/recentWork` });
  }

  handleChangeShortCut = parm => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/changeShortCut`,
      payload: {
        param: parm,
      },
    });
  };

  modalCancel = () => {
    this.setState({
      isFound: false,
    });
  };

  requestRealType = async (data, mode) => {
    const { id, taskId, docId } = data;
    const { status, response } = await getType(docId);
    if (status === 200 && response.ok) {
      const defKey =
        // eslint-disable-next-line
        response.datum === 'TASK_BY_PACKAGE'
          ? 'ACC_A22.SUM'
          : response.datum === 'TASK_BY_MANDAY'
            ? 'ACC_A22.SINGLE'
            : 'ACC_A22.COM';
      const route = flowToRouter(defKey, { id, taskId, docId, mode });
      router.push(route);
    }
  };

  jumpLink = (data, todo = false) => {
    const { defKey, id, taskId, docId, procIden } = data;
    const mode = todo ? 'edit' : 'view';
    if (procIden === 'ACC_A22') {
      this.requestRealType(data, mode);
    } else {
      const route = flowToRouter(procIden, {
        id,
        taskId,
        docId,
        mode,
      });
      router.push(route);
    }
  };

  messageJumpLink = id => {
    router.push(`/user/center/message/detail?id=${id}`);
  };

  render() {
    const { isFound } = this.state;
    const {
      dispatch,
      userCenter: {
        myShortCut,
        sysShortCuts,
        newSortNo,
        formData,
        todoList,
        todoTotalCount,
        backList,
        backTotalCount,
        doneList,
        doneTotalCount,
        notifyList,
        notifyTotalCount,
        myInfo,
        approvalCount,
        recentWork,
        activeTabKey,
        messageList,
        messageTotalCount,
        visible1,
        visible2,
        visible3,
      },
      form: { getFieldDecorator },
      loadingShortcut,
    } = this.props;

    const { refresh } = fromQs();
    // const dropMyNext = () => {
    //   this.changeMyIndex.next();
    // };
    // const dropMyPrev = () => {
    //   this.changeMyIndex.prev();
    // };
    // const dropSysNext = () => {
    //   this.changeSysIndex.next();
    // };
    // const dropSysPrev = () => {
    //   this.changeSysIndex.prev();
    // };

    // const foundShortCut = () => {
    //   this.setState({
    //     isFound: !isFound,
    //   });
    // };
    const modalOk = () => {
      dispatch({
        type: `${DOMAIN}/foundShortCut`,
        payload: {
          sortNo: newSortNo,
          shortcutName: formData.newShortCutName,
          shortcutUrl: formData.newShortCutUrl,
          shortcutIcon: '',
        },
      });
      this.setState({
        isFound: false,
      });
    };

    return (
      <GridContent className={styles.userCenter}>
        <Row gutter={24}>
          <Col lg={12} md={24}>
            <Card bordered={false} className={styles.userinfocard}>
              <div className={styles.userinfo}>
                <div className={styles.avatarHolder}>
                  <p className={styles.userTitle}>
                    <Icon type="user" />
                    <span>个人信息</span>
                  </p>
                  <img src="/cameo.svg" alt="avatar" />
                  <div className={styles.name}>{myInfo.userName || '登录人'}</div>
                  <span className={styles.level}>{myInfo.baseName || '所属组织'}</span>
                  <div className={styles.promote}>
                    当量系数：
                    <span>
                      {myInfo.eqvaRatio || '0.00'} <Icon type="stock" />
                    </span>
                  </div>
                </div>
                <Divider dashed />
                <div className={styles.info}>
                  <div>
                    <p>当量余额</p>
                    <p>
                      <Icon type="money-collect" />
                      <span>{myInfo.totalQty || '0.00'}</span>
                    </p>
                  </div>
                  <div>
                    <p>账号余额</p>
                    <p>
                      <Icon type="dollar" />
                      <span>{myInfo.totalAmt || '0.00'}</span>
                    </p>
                  </div>
                  <div>
                    <p>可用当量</p>
                    <p>
                      <Icon type="area-chart" />
                      <span>{myInfo.avalQty || '0.00'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.recentwork}>
                <div className={styles.title}>
                  {recentWork.length && recentWork.length > 0 ? (
                    <h2>
                      <Badge
                        count={recentWork.length > 99 ? '99+' : recentWork.length}
                        offset={[5, -3]}
                      >
                        我的工作
                      </Badge>
                    </h2>
                  ) : (
                    <h2>我的工作</h2>
                  )}

                  <Link to="/" className={styles.more}>
                    更多&gt;
                  </Link>
                </div>
                <ul className={styles.scroll}>
                  {recentWork.length > 0 ? (
                    recentWork.map((v, i) => (
                      <Popover content={v.title} key={'recentWork' + Math.random()}>
                        <li
                          onClick={() => {
                            if (v.type === 'BUSINESS_TRIP') {
                              createConfirm({
                                title: 'misc.confirm',
                                content: v.title,
                                choices: ['app.alert.used', 'app.alert.unused'],
                                onOk: () => {
                                  dispatch({
                                    type: `${DOMAIN}/changeTicketInfo`,
                                    payload: v.data,
                                  });
                                },
                              });
                            } else if (v.type === 'EXTRWORK') {
                              dispatch({
                                type: `${DOMAIN}/extrwork`,
                                payload: v.data,
                              }).then(() => {
                                router.push(v.url);
                              });
                            } else {
                              router.push(v.url);
                            }
                          }}
                        >
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p className={styles.linkTo}>{v.title}</p>
                          </div>
                        </li>
                      </Popover>
                    ))
                  ) : (
                    <li>
                      <div className={styles.item}>
                        <Icon type="file-text" />
                        <p>暂无数据</p>
                        <span>-无-</span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </Card>
          </Col>

          <Col lg={12} md={24}>
            <Card bordered={false} className={styles.todocard}>
              <Tabs
                activeKey={activeTabKey}
                onTabClick={activeKey =>
                  dispatch({ type: `${DOMAIN}/updateState`, payload: { activeTabKey: activeKey } })
                }
                tabBarExtraContent={
                  activeTabKey === '4' ? (
                    <Link to="/user/center/message" className={styles.more}>
                      更多&gt;
                    </Link>
                  ) : (
                    <Link to="/user/flow/process" className={styles.more}>
                      更多&gt;
                    </Link>
                  )
                }
              >
                <TabPane
                  tab={
                    <Badge count={todoTotalCount} offset={[5, -3]}>
                      我的待办
                    </Badge>
                  }
                  key="1"
                >
                  <ul>
                    {todoList &&
                      todoList.map(v => (
                        <li key={Math.random()}>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p onClick={() => this.jumpLink(v, true)}>{v.docName}</p>
                            <span>{formatDT(v.startTime)}</span>
                          </div>
                          <p className={styles.contennt}>
                            当前处理节点：
                            {v.todoInfo.taskNames}
                            &nbsp; | &nbsp; 当前处理人：
                            {v.todoInfo.workerNames}
                          </p>
                        </li>
                      ))}
                  </ul>
                </TabPane>
                <TabPane
                  tab={
                    <Badge count={backTotalCount} offset={[5, -3]}>
                      我的退回
                    </Badge>
                  }
                  key="5"
                >
                  <ul>
                    {backList &&
                      backList.map(v => (
                        <li key={Math.random()}>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p onClick={() => this.jumpLink(v, true)}>{v.docName}</p>
                            <span>{formatDT(v.startTime)}</span>
                          </div>
                          <p className={styles.contennt}>
                            当前处理节点：
                            {v.todoInfo.taskNames}
                            &nbsp; | &nbsp; 当前处理人：
                            {v.todoInfo.workerNames}
                          </p>
                        </li>
                      ))}
                  </ul>
                </TabPane>
                {/* <TabPane
                  tab={
                    // 已办不要角标
                    // <Badge count={doneTotalCount} offset={[5, -3]}>
                    <Badge count={undefined} offset={[5, -3]}>
                      我的已办
                    </Badge>
                  }
                  key="2"
                >
                  <ul>
                    {doneList &&
                      doneList.map(v => (
                        <li key={Math.random()}>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p onClick={() => this.jumpLink(v)}>{v.docName}</p>
                            <span>{formatDT(v.startTime)}</span>
                          </div>
                          {!isNil(v.todoInfo) ? (
                            <p className={styles.contennt}>
                              当前处理节点：
                              {v.todoInfo.taskNames}
                              &nbsp; | &nbsp; 当前处理人：
                              {v.todoInfo.workerNames}
                            </p>
                          ) : (
                            <p className={styles.contennt}>&nbsp;</p>
                          )}
                        </li>
                      ))}
                  </ul>
                </TabPane> */}

                <TabPane
                  tab={
                    <Badge count={notifyTotalCount} offset={[5, -3]}>
                      我的知会
                    </Badge>
                  }
                  key="3"
                >
                  <ul>
                    {notifyList &&
                      notifyList.map(v => (
                        <li key={Math.random()}>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p onClick={() => readNotify(v.taskId) && this.jumpLink(v)}>
                              {v.docName}
                            </p>
                            <span>{formatDT(v.startTime)}</span>
                          </div>
                          {!isNil(v.todoInfo) ? (
                            <p className={styles.contennt}>
                              当前处理节点：
                              {(v.todoInfo || {}).taskNames || '空'}
                              &nbsp; | &nbsp; 当前处理人：
                              {(v.todoInfo || {}).workerNames || '空'}
                            </p>
                          ) : (
                            <p className={styles.contennt}>&nbsp;</p>
                          )}
                        </li>
                      ))}
                  </ul>
                </TabPane>
                <TabPane
                  tab={
                    <Badge count={messageTotalCount} offset={[5, -3]}>
                      消息通知
                    </Badge>
                  }
                  key="4"
                >
                  <ul className={styles.message}>
                    {messageList &&
                      messageList.map(v => (
                        <li key={Math.random()}>
                          <div className={styles.item}>
                            <Icon type="file-text" className={v.isRead === 1 ? styles.read : ''} />
                            <p
                              onClick={() => this.messageJumpLink(v.noticeId)}
                              className={v.isRead === 1 ? styles.read : ''}
                            >
                              <span className={styles.messageTitle}>{v.releaseTitle}</span>
                              {Array.isArray(v.messageTagName) &&
                                v.messageTagName.map(item => (
                                  <span key={Math.random()} className={styles.messageTag}>
                                    {item}
                                  </span>
                                ))}
                            </p>
                            <span className={v.isRead === 1 ? styles.read : ''}>
                              {formatDT(v.releaseTime)}
                            </span>
                          </div>
                          <div
                            className={
                              v.isRead === 1 ? `${styles.read} ${styles.itemInfo}` : styles.itemInfo
                            }
                          >
                            {v.releaseTypeName}
                            <span>|</span>
                            发布来源:
                            {v.releaseSource}
                          </div>
                        </li>
                      ))}
                  </ul>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        <Card
          className="tw-card-adjust"
          bordered={false}
          loading={loadingShortcut}
          style={{ marginTop: 8 }}
          title={<Title icon="profile" id="user.center.menu.shortcut" defaultMessage="快捷入口" />}
        >
          <Row className={styles.quickLinksWrapper} type="flex" align="middle" justify="start">
            {/* {(sysShortCuts || []).map(v => (
              <div
                key={v.id}
                className={styles.quickLinks}
                onClick={() =>
                  router.push(v.shortcutUrl.startsWith('/') ? v.shortcutUrl : `/${v.shortcutUrl}`)
                }
              >
                <Row className={styles.linkImgWrapper} type="flex" justify="center" align="middle">
                  {isNil(v.shortcutIcon) ? (
                    <Icon type="shop" style={{ fontSize: 48 }} />
                  ) : (
                    <img className={styles.linkImg} src={v.shortcutIcon} alt={v.shortcutName} />
                  )}
                </Row>
                <div className={styles.linkBanner}>{v.shortcutName}</div>
              </div>
            ))} */}
            <ShortcutMenu currentPage="/user/home" />
          </Row>
        </Card>

        <Modal
          destroyOnClose
          title="自定义入口"
          visible={isFound}
          onOk={modalOk}
          onCancel={this.modalCancel}
        >
          <FieldList
            layout="horizontal"
            col={1}
            getFieldDecorator={getFieldDecorator}
            style={{ overflow: 'hidden' }}
          >
            <Field name="newShortCutName" label="名称" style={{ marginLeft: '-10%' }}>
              <Input placeholder="请输入名称" />
            </Field>
            <Field name="newShortCutUrl" label="路径" style={{ marginLeft: '-10%' }}>
              <Input placeholder="请输入URL路径   例如:/a/b/c" />
            </Field>
          </FieldList>
        </Modal>
        <RemindModal />
      </GridContent>
    );
  }
}

export default Center;
