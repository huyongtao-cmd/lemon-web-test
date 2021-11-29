/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Table, Icon, Menu, Tooltip, Spin } from 'antd';
import classNames from 'classnames';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { isEmpty, clone } from 'ramda';
import MD5 from 'crypto-js/md5';
import ListItem from './ListItem';
import styles from './index.less';

const DOMAIN = 'myTrain';

@connect(({ loading, myTrain, dispatch, user }) => ({
  loading,
  myTrain,
  dispatch,
  user,
}))
class MyTrain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '0',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 默认拉取待完成培训
    this.fetchTrainList('0', 'init').then(res => {
      this.fetchTrainList('1', 'init'); // 已完成
    }); // 未完成等
  }

  fetchTrainList = (status, state) =>
    new Promise(resolve => {
      const {
        dispatch,
        myTrain: { trainListTodoChecked },
      } = this.props;
      dispatch({
        type: `${DOMAIN}/resTrainingProgSelect`,
        payload: {
          trnStatus: status,
        },
      }).then(res => {
        resolve(res);
        // 初始化时判断trainListTodoChecked是否为空，不是的话就是从我的赋能页面跳转过来的
        if (status === '0' && state === 'init' && Object.keys(trainListTodoChecked).length > 0) {
          this.itemSelected(trainListTodoChecked);
        }
      });
    });

  handleClick = e => {
    this.setState({
      current: e.key,
    });
    const {
      myTrain: { trainListTodo, trainListDone },
    } = this.props;

    if (e.key === '0') {
      const tt = trainListTodo.filter(v => v.checked);
      if (!isEmpty(tt)) {
        this.updateData(tt[0]);
      }
    } else {
      const tt = trainListDone.filter(v => v.checked);
      if (!isEmpty(tt)) {
        this.updateData(tt[0]);
      }
    }
  };

  deleteChange = item => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/resTrainingProgDel`,
      payload: {
        ids: item.id,
      },
    }).then(res => {
      if (res.ok) {
        const { current } = this.state;
        this.fetchTrainList(current, 'noInit');
      }
    });
  };

  changeChecked = item => {
    const {
      dispatch,
      myTrain: { trainListTodo, trainListDone },
    } = this.props;
    const { current } = this.state;
    if (current === '0') {
      const newTrainListTodo = clone(trainListTodo);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          trainListTodo: newTrainListTodo.map(v => ({ ...v, checked: v.id === item.id })),
        },
      });
    } else {
      const newTrainListDone = clone(trainListDone);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          trainListDone: newTrainListDone.map(v => ({ ...v, checked: v.id === item.id })),
        },
      });
    }
  };

  itemSelected = item => {
    if (!item.checked) {
      const { dispatch } = this.props;
      // 改变选中状态
      this.changeChecked(item);
      // 更新数据
      this.updateData(item);
    }
  };

  // 更新数据
  updateData = item => {
    const { dispatch } = this.props;
    // 更新dateSource
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        courseList: [],
      },
    });
    // 更新formData
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        ...item,
      },
    });
    // 培训课程列表
    dispatch({
      type: `${DOMAIN}/resTrainingProgSelTrain`,
      payload: {
        id: item.trainingProgId,
      },
    });
  };

  render() {
    const {
      loading,
      myTrain: { trainListTodo, trainListDone, courseList, formData },
      user: {
        user: {
          info: { email },
        },
      },
    } = this.props;
    const listLoading = loading.effects[`${DOMAIN}/resTrainingProgSelTrain`];
    const { current } = this.state;

    const columns = [
      {
        title: '培训课程',
        dataIndex: 'courseName',
        render: (value, row, index) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <span>{`${value.substr(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            <span>{value}</span>
          ),
      },
      {
        title: '必修/选修',
        dataIndex: 'trnRequirementName',
        align: 'center',
      },
      {
        title: '建议完成时间(天)',
        dataIndex: 'requiredTime',
        align: 'center',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (value, row, index) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <span>{`${value.substr(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            <span>{value}</span>
          ),
      },
      {
        title: '',
        dataIndex: 'YesOrNo',
        align: 'center',
        render: (val, row, index) =>
          row.isComplete === '0' ? <Icon type="check" style={{ color: '#52c41a' }} /> : null,
      },
      {
        title: '',
        dataIndex: 'operate',
        align: 'center',
        render: (val, row, index) => {
          const courseCode = row.courseNo;
          const loginName = email;
          const corpCode = 'elitesland';
          const timestamp = Date.now();
          const secretKey = 'a3c3f5e4077e75d0';
          const secret = MD5(
            [courseCode, loginName, corpCode, timestamp, secretKey].sort().join('')
          );

          if (row.lock) {
            return (
              <Icon style={{ fontSize: '20px' }} title="前一门必修课程完成后解锁" type="lock" />
            );
          }
          return (
            <a
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              href={`http://v4.21tb.com/els/provider.newSyncUserAndPlay.do?courseCode=${courseCode}&loginName=${loginName}&corpCode=${corpCode}&timestamp=${timestamp}&secret=${secret}`}
            >
              进入学习
            </a>
          );
        },
      },
    ];

    return (
      <div className={styles.myTrain}>
        <div className={styles.left}>
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text={formData.progName || '-'} />}
            bodyStyle={{
              padding: '10px',
            }}
          >
            <Spin spinning={loading.effects[`${DOMAIN}/resTrainingProgSelect`]}>
              <div className={classNames(styles.cardBlock, styles.cardBlock1)}>
                <div className={styles.title}>简介</div>
                <div className={styles.desc}>
                  <pre>{formData.progDesc || '-'}</pre>
                </div>
              </div>
              <div className={classNames(styles.cardBlock, styles.cardBlock2)}>
                <div className={styles.title}>学习目标</div>
                <div className={styles.desc}>
                  <pre>{formData.learnObj || '-'}</pre>
                </div>
              </div>
              <div className={classNames(styles.cardBlock, styles.cardBlock3)}>
                <div className={styles.title}>相关能力</div>
                <div className={styles.desc}>
                  <pre>{`${formData.capaSetView || ''}\n${formData.capaView || '-'}`}</pre>
                </div>
              </div>
            </Spin>

            <Divider dashed />
            <DescriptionList size="large" col={1} title="培训课程" noTop />
            <Table rowKey="id" dataSource={courseList} columns={columns} loading={listLoading} />
          </Card>
        </div>
        <div className={styles.right}>
          <Menu onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
            <Menu.Item key="0">{`待完成培训(${trainListTodo.length})`}</Menu.Item>
            <Menu.Item key="1">{`已结束培训(${trainListDone.length})`}</Menu.Item>
          </Menu>
          <Spin spinning={loading.effects[`${DOMAIN}/resTrainingProgSelect`]}>
            {current === '0' ? (
              !isEmpty(trainListTodo) ? (
                <ListItem
                  dataSource={trainListTodo}
                  onDel={item => this.deleteChange(item)}
                  itemSelected={item => this.itemSelected(item)}
                  delFlag
                />
              ) : (
                <div className={styles.empty}>暂无待完成培训</div>
              )
            ) : !isEmpty(trainListDone) ? (
              <ListItem
                dataSource={trainListDone}
                onDel={item => this.deleteChange(item)}
                itemSelected={item => this.itemSelected(item)}
                delFlag={false}
              />
            ) : (
              <div className={styles.empty}>暂无已结束培训</div>
            )}
          </Spin>
        </div>
      </div>
    );
  }
}

export default MyTrain;
