/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Spin } from 'antd';
import classNames from 'classnames';
import { mountToTab } from '@/layouts/routerControl';
import { isEmpty, clone } from 'ramda';
import ListItem from './ListItem';
import TreeSelect from './ResTreeSelect';
import LeveIdTagCapaModal from '../components/LeveIdTagCapaModal';
import styles from './index.less';

const DOMAIN = 'myAbilityGrowthIndividualAbility';

@connect(({ loading, myAbilityGrowthIndividualAbility, dispatch, user }) => ({
  loading,
  myAbilityGrowthIndividualAbility,
  dispatch,
  user,
}))
@mountToTab()
class MyTrain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      leveIdTagVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 我获得的单项能力、我关注的单项能力
    dispatch({
      type: `${DOMAIN}/resCapaType`,
    });
    // 单项能力树
    dispatch({
      type: `${DOMAIN}/queryCapaTreeData`,
    });

    // dispatch({
    //   type: `${DOMAIN}/getCapacityList`,
    // });
  }

  // 切换弹出窗。(单项能力树)
  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  // 切换弹出窗。(考核点)
  leveIdTagVisibleChange = () => {
    const { leveIdTagVisible } = this.state;
    this.setState({
      leveIdTagVisible: !leveIdTagVisible,
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaTreeDataDetail: [],
        capaTreeDataDetailTotal: 0,
      },
    });
    dispatch({
      type: `${DOMAIN}/queryCapaTreeDataDetail`,
      payload: { ...params },
    });
  };

  queryData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaTreeDataDetail: [],
        capaTreeDataDetailTotal: 0,
      },
    });
    if (params.text || params.id.length > 0) {
      dispatch({
        type: `${DOMAIN}/queryCapaTreeDataDetailWithText`,
        payload: { ...params },
      });
    }
  };

  // 添加关注
  handleModelOk = (e, checkedKeys, checkRows) => {
    const {
      dispatch,
      myAbilityGrowthIndividualAbility: { myFocusCapatCheckedForm },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/saveMyResCapa`,
      payload: checkRows,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/myFocusResCapa`,
        payload: {
          upperId: myFocusCapatCheckedForm.upperId,
        },
      });
      this.toggleVisible();
    });
  };

  // 改变选中状态
  changeChecked = (item, status) => {
    const {
      dispatch,
      myAbilityGrowthIndividualAbility: { myCapaTrees, myFocusCapat },
    } = this.props;
    if (status === 'myCapaTrees') {
      const newData = clone(myCapaTrees);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          myCapaTrees: newData.map(v => ({ ...v, checked: v.id === item.id })),
        },
      });
    } else {
      const newData = clone(myFocusCapat);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          myFocusCapat: newData.map(v => ({ ...v, checked: v.id === item.id })),
        },
      });
    }
  };

  // 点击单项能力获取信息
  itemSelected = (item, status) => {
    if (!item.checked) {
      const { dispatch } = this.props;
      // 改变选中状态
      this.changeChecked(item, status);
      if (status === 'myCapaTrees') {
        // 我的单项能力对应的考点
        dispatch({
          type: `${DOMAIN}/myResCapaRq`,
          payload: {
            upperId: item.upperId,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            myCapaTreesCheckedForm: item,
          },
        });
      } else {
        // 我关注的单项能力对应的考点
        dispatch({
          type: `${DOMAIN}/myFocusResCapa`,
          payload: {
            upperId: item.upperId,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            myFocusCapatCheckedForm: item,
          },
        });
      }
    }
  };

  cancelMyResCapaFun = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/cancelMyResCapa`,
      payload: {
        id,
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      myAbilityGrowthIndividualAbility: {
        trainListTodo = [],
        courseList,
        formData,
        capaTreeDataDetail,
        capaTreeDataDetailTotal,
        capaTreeData,
        dataList, // 单项能力列表
        dataListDel, // 删除的单项能力id
        capacityList, // 复合能力列表
        capacityListSelected, // 已选择的复合能力
        capacityListSelectedDelId, // 删除的已选复合能力Id
        myCapaTrees, // 我的单项能力分类
        myCapaTreesCheckedList, // 我的单项能力
        myCapaTreesCheckedForm,
        myFocusCapat, // 我关注的单项能力分类
        myFocusCapatCheckedList, // 我关注的单项能力
        myFocusCapatCheckedForm,
      },
      user: {
        user: {
          info: { email },
        },
      },
    } = this.props;
    const { visible, leveIdTagVisible } = this.state;

    const fetchDataLoading =
      loading.effects[`${DOMAIN}/queryCapaTreeData`] ||
      loading.effects[`${DOMAIN}/queryCapaTreeDataDetail`] ||
      loading.effects[`${DOMAIN}/queryCapaTreeDataDetailWithText`];

    const listLoading = loading.effects[`${DOMAIN}/resTrainingProgSelTrain`];

    const tableColumns = [
      {
        title: '分类',
        dataIndex: 'capaTypeName',
        key: 'capaTypeName',
        align: 'center',
        width: 200,
      },
      {
        title: '单项能力',
        dataIndex: 'text',
        key: 'text',
        align: 'center',
        width: 200,
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        key: 'dsc',
        render: val => <pre>{val}</pre>,
      },
    ];

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: dataList.find(item => item.capaLevelId === record.capaLevelId), // Column configuration not to be checked
      }),
      selectedRowKeys: dataList.map(item => item.capaLevelId),
    };

    return (
      <div className={styles.myTrain}>
        <div>
          <div className={styles.littleTitle}>我获得的</div>
          <div className={styles.right}>
            <Spin spinning={loading.effects[`${DOMAIN}/resCapaType`]}>
              {isEmpty(myCapaTrees) ? (
                <div className={styles.empty}>暂无数据</div>
              ) : (
                <ListItem
                  dataSource={myCapaTrees}
                  itemSelected={item => this.itemSelected(item, 'myCapaTrees')}
                />
              )}
            </Spin>
          </div>
          <div className={styles.left}>
            <div className={classNames(styles.cardBlock, styles.cardBlock3)}>
              <div className={styles.title}>{myCapaTreesCheckedForm.capaTypeName || ''}</div>
              {isEmpty(myCapaTreesCheckedList) ? (
                <div className={styles.empty}>暂无数据</div>
              ) : (
                <Spin
                  spinning={
                    loading.effects[`${DOMAIN}/myResCapaRq`] ||
                    loading.effects[`${DOMAIN}/resCapaType`]
                  }
                >
                  {myCapaTreesCheckedList.map(item => (
                    <div key={item.name} className={styles.desc}>
                      <div className={styles.capa} title={item.name}>
                        {item.name || ''}
                      </div>
                      <div
                        className={styles.clickLink}
                        onClick={() => {
                          this.leveIdTagVisibleChange();
                          dispatch({
                            type: `${DOMAIN}/capaAbility`,
                            payload: {
                              abilityId: item.leveldId,
                              entryType: item.entryType,
                            },
                          });
                        }}
                      >
                        考核点
                      </div>
                    </div>
                  ))}
                </Spin>
              )}
            </div>
          </div>
        </div>
        <Divider dashed />
        <div style={{ position: 'relative' }}>
          <div className={styles.littleTitle}>我关注的</div>
          <div
            className={styles.attent}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              this.setState({
                visible: true,
              });
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  capaTreeDataDetail: [],
                  capaTreeDataDetailTotal: 0,
                },
              });
            }}
          >
            <img style={{ marginTop: '-3px' }} src="/growth/icon_guanzhu.svg" alt="" />
            &nbsp;
            <span>添加关注</span>
          </div>
          <div className={styles.right}>
            <Spin spinning={loading.effects[`${DOMAIN}/resCapaType`]}>
              {isEmpty(myFocusCapat) ? (
                <div className={styles.empty}>暂无数据</div>
              ) : (
                <ListItem
                  dataSource={myFocusCapat}
                  itemSelected={item => this.itemSelected(item, 'myFocusCapat')}
                />
              )}
            </Spin>
          </div>
          <div className={styles.left}>
            <div className={classNames(styles.cardBlock, styles.cardBlock3)}>
              <div className={styles.title}>{myFocusCapatCheckedForm.capaTypeName || ''}</div>
              {isEmpty(myFocusCapatCheckedList) ? (
                <div className={styles.empty}>暂无数据</div>
              ) : (
                <Spin
                  spinning={
                    loading.effects[`${DOMAIN}/myFocusResCapa`] ||
                    loading.effects[`${DOMAIN}/resCapaType`]
                  }
                >
                  {myFocusCapatCheckedList.map(item => (
                    <div key={item.name} className={styles.desc}>
                      <div className={styles.capa} title={item.name}>
                        {item.name || ''}
                      </div>
                      <div
                        className={styles.clickLink}
                        onClick={() => {
                          this.leveIdTagVisibleChange();
                          dispatch({
                            type: `${DOMAIN}/capaAbility`,
                            payload: {
                              abilityId: item.leveldId,
                              entryType: item.entryType,
                            },
                          });
                        }}
                      >
                        考核点
                      </div>
                      <div className={styles.littleStar}>
                        <img
                          style={{ height: '100%' }}
                          src="/growth/icon_guanzhu.svg"
                          alt=""
                          onClick={() => {
                            dispatch({
                              type: `${DOMAIN}/cancelMyResCapa`,
                              payload: {
                                id: item.id,
                              },
                            }).then(res => {
                              if (res.ok) {
                                dispatch({
                                  type: `${DOMAIN}/myFocusResCapa`,
                                  payload: {
                                    upperId: myFocusCapatCheckedForm.upperId,
                                  },
                                });
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Spin>
              )}
            </div>
          </div>
        </div>
        <LeveIdTagCapaModal
          visible={leveIdTagVisible}
          visibleChange={() => this.leveIdTagVisibleChange()}
        />
        <TreeSelect
          title="单项能力添加"
          domain={DOMAIN}
          visible={visible}
          dispatch={dispatch}
          queryData={this.queryData}
          fetchData={this.fetchData}
          dataSource={capaTreeDataDetail}
          tableColumns={tableColumns}
          multiple
          loading={fetchDataLoading}
          total={capaTreeDataDetailTotal}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          treeData={capaTreeData}
          tableRowKey="capaLevelId"
          rowSelection={rowSelection}
        />
      </div>
    );
  }
}

export default MyTrain;
