import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import classNames from 'classnames';
import { Row, Col, Modal, Form, Button, Checkbox } from 'antd';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import styles from './RemindModal.less';

const DOMAIN = 'userCenter';
@connect(({ dispatch, userCenter, loading }) => ({
  dispatch,
  userCenter,
  loading: loading.effects[`${DOMAIN}/queryShortCut`],
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
class index extends Component {
  state = {
    second: 5,
    checked: false,
  };

  componentDidMount() {
    this.timerID = setInterval(() => {
      const { second } = this.state;
      this.setState(
        {
          second: second - 1,
        },
        () => {
          const { second: se } = this.state;
          if (!se) {
            clearInterval(this.timerID);
          }
        }
      );
    }, 1300);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  modalClose1 = () => {
    const {
      dispatch,
      userCenter: { pop2, pop3 },
    } = this.props;

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        visible1: false,
      },
    });

    const { checked } = this.state;
    // 点击了不再提示，更新提示标志
    if (checked) {
      dispatch({
        type: `${DOMAIN}/updateShowFlag`,
        payload: {
          flag: 'NO',
        },
      });
    }

    if (!isEmpty(pop2)) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          visible2: true,
        },
      });
    } else if (!isEmpty(pop3)) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          visible3: true,
        },
      });
    }
  };

  modalClose2 = () => {
    const {
      dispatch,
      userCenter: { pop3 },
    } = this.props;

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        visible2: false,
      },
    });

    if (!isEmpty(pop3)) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          visible3: true,
        },
      });
    }
  };

  modalClose3 = () => {
    const {
      dispatch,
      userCenter: { pop3 = [] },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        visible3: false,
      },
    });

    dispatch({
      type: `${DOMAIN}/updateNewPushFlag`,
      payload: {
        flag: 'NO',
        trainingProgIds: pop3.map(v => v.id).join(','),
      },
    });
  };

  render() {
    const {
      dispatch,
      userCenter: { pop1 = {}, pop2 = [], pop3 = [], visible1, visible2, visible3 },
    } = this.props;
    const { second } = this.state;
    const urls = getUrl();
    const from = stringify({ from: urls });

    return (
      <div>
        <Modal
          destroyOnClose
          title="培训说明"
          visible={visible1}
          maskClosable={false}
          closable={false}
          footer={
            <div style={{ textAlign: 'center' }}>
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="close"
                size="large"
                disabled={!!second}
                style={{ marginBottom: '5px' }}
                onClick={() => this.modalClose1()}
              >
                关闭
              </Button>
              {second ? <div style={{ color: 'red' }}>{`${second}秒后可关闭`}</div> : ''}
            </div>
          }
          width="650px"
          className={styles.entryTrain}
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={24}>
              <span className={styles.title}>入职与适岗培训说明</span>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={styles.noticDesc}>
                <span>1、请在培训截止日前完成所有入职和适岗培训</span>
                <span style={{ fontSize: '12px' }}> ( [培训截止日] 见【我的培训】页面 ) </span>
              </div>
              <div className={classNames(styles.noticDesc, styles.retract)}>
                <span>培训入口：个人中心 → 我的培训</span>
                &nbsp; &nbsp; &nbsp;
                {/* <span
                  style={{ color: '#008FDB', cursor: 'pointer' }}
                  onClick={() => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        visible1: false,
                      },
                    });
                    router.push(`/user/center/myTrain`);
                  }}
                >
                  点击进入
                </span> */}
                <Link className="tw-link" to="/user/center/myTrain">
                  点击进入
                </Link>
              </div>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={styles.noticDesc}>
                <span>2、【我的培训】功能使用介绍视频</span>
                &nbsp; &nbsp; &nbsp;
                {pop1?.viewId?.length === 1 ? (
                  //   <span
                  //   style={{ color: '#008FDB', cursor: 'pointer' }}
                  //   onClick={() => {
                  //     dispatch({
                  //       type: `${DOMAIN}/updateState`,
                  //       payload: {
                  //         visible1: false,
                  //       },
                  //     });
                  //     router.push(`/user/center/myTrain`);
                  //   }}
                  // >
                  //   点击进入
                  // </span>

                  <Link
                    className="tw-link"
                    to={`/sale/productHouse/showHomePage/view?id=${pop1.viewId[0]}&${from}`}
                  >
                    点击进入
                  </Link>
                ) : (
                  <span style={{ color: 'red', fontWeight: 'bolder' }}>
                    {pop1?.viewMessage || ''}
                  </span>
                )}
              </div>
            </Col>
            <Col className="gutter-row" span={24} style={{ marginTop: '10px' }}>
              <div className={classNames(styles.retract, styles.contact)}>
                <div>※ 有关培训问题可联系培训管理员</div>
                <div className={classNames(styles.retract1)}>
                  &nbsp;姓名：
                  {pop1?.name}
                </div>
                <div className={classNames(styles.retract1)}>
                  &nbsp;邮箱：
                  {pop1?.email}
                </div>
                <div className={classNames(styles.retract1)}>
                  &nbsp;手机：
                  {pop1?.phone}
                </div>
              </div>
            </Col>
            <Col className="gutter-row" span={24} style={{ marginTop: '15px' }}>
              <div style={{ color: 'black', textIndent: '1em' }}>
                <Checkbox
                  onChange={e => {
                    this.setState({
                      checked: e.target.checked,
                    });
                  }}
                >
                  不再提示
                </Checkbox>
              </div>
            </Col>
          </Row>
        </Modal>

        <Modal
          destroyOnClose
          title="培训逾期提醒"
          visible={visible2}
          maskClosable={false}
          closable={false}
          footer={
            <div style={{ textAlign: 'center' }}>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => this.modalClose2()}
              >
                知道了
              </Button>
            </div>
          }
          width="500px"
          className={styles.trainOverdue}
        >
          <Row gutter={16} style={{ paddingLeft: '40px' }}>
            <Col className="gutter-row" span={24}>
              <div className={styles.title}>
                <span>你有以下培训已逾期，请尽快完成 :</span>
              </div>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={styles.trainList}>
                {pop2.map(v => (
                  <div key={v.id}>
                    <span style={{ fontSize: '18px' }}>{v?.courseName}</span>
                    &nbsp; &nbsp;
                    <span style={{ color: 'red', fontSize: '12px' }}>
                      {`已逾期${v?.overdueDays}天`}
                    </span>
                  </div>
                ))}
              </div>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={classNames(styles.noticDesc)}>
                <span>培训入口:个人中心 → 我的培训</span>
                &nbsp; &nbsp; &nbsp;
                {/* <span
                  style={{ color: '#008FDB', cursor: 'pointer' }}
                  onClick={() => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        visible2: false,
                      },
                    });
                    router.push(`/user/center/myTrain`);
                  }}
                >
                  点击进入
                </span> */}
                <Link className="tw-link" to="/user/center/myTrain">
                  点击进入
                </Link>
              </div>
            </Col>
          </Row>
        </Modal>

        <Modal
          destroyOnClose
          title="培训推送提醒"
          visible={visible3}
          maskClosable={false}
          closable={false}
          footer={
            <div style={{ textAlign: 'center' }}>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => this.modalClose3()}
              >
                知道了
              </Button>
            </div>
          }
          width="500px"
          className={styles.trainOverdue}
        >
          <Row gutter={16} style={{ paddingLeft: '40px' }}>
            <Col className="gutter-row" span={24}>
              <div className={styles.title}>
                <span>为你推送了以下新的培训:</span>
              </div>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={styles.trainList}>
                {pop3.map(v => (
                  <div key={v.id}>
                    <span style={{ fontSize: '18px' }}>{v.courseName}</span>
                    &nbsp; &nbsp;
                    <span
                      style={{
                        color: v?.trnRequirement === 'REQUIRED' ? 'red' : 'green',
                        fontSize: '12px',
                      }}
                    >
                      {v?.trnRequirementName}
                    </span>
                  </div>
                ))}
              </div>
            </Col>
            <Col className="gutter-row" span={24}>
              <div className={classNames(styles.noticDesc)}>
                <span>培训入口：个人中心 → 我的培训</span>
                &nbsp; &nbsp; &nbsp;
                <Link className="tw-link" to="/user/center/myTrain">
                  点击进入
                </Link>
              </div>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}

export default index;
