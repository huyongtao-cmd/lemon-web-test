import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import {
  Skeleton,
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
  Menu,
  Dropdown,
  Upload,
} from 'antd';
import { isNil, isEmpty } from 'ramda';
import { Selection, UdcSelect, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import GridContent from '@/components/layout/PageHeaderWrapper/GridContent';
// import Draggable from './Draggable';
import styles from './home.less';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { readNotify } from '@/services/user/flow/flow';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import ShortcutMenu from '@/components/common/Workbench/ShortcutMenu';
import CustomShortcutMenu from '@/components/common/Workbench/customShortcutMenu';
import RemindModal from '../gen/Account/Center/RemindModal';
import avatarImg from '@/assets/img/avatar_user.png';
import messageImg from '@/assets/img/message.png';
import createMessage from '../../components/core/AlertMessage';
import FormItem from '@/components/production/business/FormItem.tsx';

const { Field } = FieldList;
const { TabPane } = Tabs;
const DOMAIN = 'workTableHome';

@connect(({ user: { user }, dispatch, workTableHome, loading }) => ({
  user,
  dispatch,
  workTableHome,
  loadingShortcut: loading.effects[`${DOMAIN}/queryShortCut`],
  loadingCustomShortcut: loading.effects[`${DOMAIN}/queryCustomShortCut`],
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
class lemonCenter extends PureComponent {
  state = {
    isFound: false,
  };

  componentDidMount() {
    const {
      dispatch,
      user: {
        extInfo: { resId },
      },
    } = this.props;

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
    dispatch({
      type: `${DOMAIN}/queryCustomShortCut`,
      payload: {
        sortBy: 'sortNo',
        sortDirection: 'ASC',
        limit: 0,
      },
    });
    dispatch({ type: `${DOMAIN}/queryNoticeLength`, payload: { key: 'HOME_ARTICLE_NUM' } }).then(
      response => {
        let limitLength = 10;
        if (response && response.data) {
          limitLength = response.data.settingValue;
        }
        dispatch({
          type: `${DOMAIN}/queryNoticeList`,
          payload: {
            sortBy: 'id',
            sortDirection: 'DESC',
            offset: 0,
            limit: limitLength,
            homePage: true,
          },
          id: resId,
        });
      }
    );
    dispatch({
      type: `${DOMAIN}/queryUserPhoto`,
      payload: {
        resId,
      },
    });
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

  customModeSetting = () => {
    const {
      workTableHome: { customSettingMode },
      dispatch,
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        customSettingMode: customSettingMode === 'edit' ? 'display' : 'edit',
      },
    });
  };

  avatarFileUpload = info => {
    const { dispatch } = this.props;
    if (Array.isArray(info) && !isEmpty(info)) {
      dispatch({
        type: `user/getAvatarFn`,
      }).then(res => {
        if (!res) {
          createMessage({ type: 'error', description: '上传失败，请重试' });
        } else {
          createMessage({ type: 'success', description: '上传成功' });
        }
      });
    }
  };

  uploadFile = info => {
    // 上传中、完成、失败都会调用这个函数。
    const {
      dispatch,
      user: {
        extInfo: { resId },
      },
    } = this.props;
    const { file, event } = info;
    // 上传成功拿到response
    if (Array.isArray(info) && !isEmpty(info)) {
      dispatch({
        type: `${DOMAIN}/uploadUserPhoto`,
        payload: {
          resId,
          attach: info.join(','),
        },
      });
    }
  };

  render() {
    const { isFound } = this.state;
    const {
      dispatch,
      user,
      workTableHome: {
        customSettingMode,
        noticeList,
        myShortCut,
        custShortCut,
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
        headImg,
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
    const {
      extInfo: { resId },
    } = user;
    const menu = (
      <Menu>
        <Menu.Item key="1">
          {/* <FileManagerEnhance
            api="/api/production/sys/userPhoto/sfs/token"
            dataKey={resId}
            listType="text"
            disabled={false}
            ele={<div>上传头像</div>}
            multiple={false}
            onChange={e => {
              this.avatarFileUpload(e);
            }}
          /> */}
          <FormItem
            fieldType="FileUpload"
            fieldKey="resId"
            ele={<div>上传头像</div>}
            multiple={false}
            accept=".jpg,.gif,.png"
            onChange={e => {
              this.uploadFile(e);
            }}
            // onSuccess={(response,file)=>this.uploadFileSuccess(response,file)}
          />
        </Menu.Item>
      </Menu>
    );

    return (
      <GridContent className={styles.workTableHome}>
        <Row gutter={24}>
          <Col lg={12} md={24}>
            <Card bordered={false} className={styles.userinfocard}>
              <div className={styles.userinfo}>
                <div className={styles.avatarHolder}>
                  <Dropdown overlay={menu} trigger={['contextMenu']}>
                    {/* <img src={user.avatar ? user.avatar : avatarImg} alt="avatar" /> */}
                    {headImg ? (
                      <img src={`data:image/jpeg;base64,${headImg}`} alt="avatar" />
                    ) : (
                      <img src={avatarImg} alt="avatar" />
                    )}
                  </Dropdown>
                  <div className={styles.name}>{user.extInfo.resName || '登录人'}</div>
                </div>
              </div>

              <div className={styles.notice}>
                <div className={styles.title}>
                  {noticeList.length && noticeList.length > 0 ? (
                    <h2>
                      <Badge
                        // count={noticeList.length > 99 ? '99+' : noticeList.length}// 因未开发公告已读功能，导致公告阅读后还显示在首页上，所以此处隐藏数量图标
                        offset={[5, -3]}
                      >
                        <Icon type="sound" theme="twoTone" />
                        &nbsp;公告
                      </Badge>
                    </h2>
                  ) : (
                    <h2>
                      <Icon type="sound" theme="twoTone" />
                      &nbsp;公告
                    </h2>
                  )}
                </div>
                <ul className={styles.scroll}>
                  {noticeList.length > 0 ? (
                    noticeList.map((v, i) => (
                      <Popover content={v.artTitle} key={v.id}>
                        <li
                          onClick={() => {
                            router.push(`/plat/contentMgmt/elSound/Detail?id=${v.id}`);
                          }}
                        >
                          <div className={styles.item}>
                            <img
                              src={
                                v.artThumbFile
                                  ? `data:image/jpeg;base64,${v.artThumbFile}`
                                  : messageImg
                              }
                              alt=""
                            />

                            <div className={styles.noticeRight}>
                              <div
                                className={styles.noticeTitle}
                                style={{ color: v.artTitleColor }}
                              >
                                <span>{v.artTitle}</span>
                                <span>{formatDT(v.createTime)}</span>
                              </div>
                              <p className={styles.noticeContent}>{v.artSubTitle}</p>
                            </div>
                          </div>
                        </li>
                      </Popover>
                    ))
                  ) : (
                    <li style={{ height: '100%' }}>
                      <div className={styles.item} style={{ height: '100%' }}>
                        <Icon type="file-text" />
                        <div className={styles.noticeRight}>
                          <div className={styles.noticeTitle} />
                          <p>暂无数据</p>
                        </div>
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
            <ShortcutMenu currentPage="/workTable/home" />
          </Row>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          loading={loadingShortcut}
          style={{ marginTop: 8 }}
          title={
            <Title
              icon="profile"
              id="user.center.menu.customShortcut"
              defaultMessage="自定义入口"
            />
          }
          extra={
            <Icon type="setting" style={{ cursor: 'pointer' }} onClick={this.customModeSetting} />
          }
        >
          <Row className={styles.quickLinksWrapper} type="flex" align="middle" justify="start">
            <CustomShortcutMenu
              currentPage="/workTable/home"
              menuData={custShortCut}
              mode={customSettingMode}
            />
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

export default lemonCenter;
