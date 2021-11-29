import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Icon, Pagination, Radio, Spin } from 'antd';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import arrowIcon from '@/assets/img/growth/icon-arrow.svg';

import LeveldTag from '../components/leveldTag';
import LeveIdTagModal from '../components/LeveIdTagModal';
import styles from '../index.less';
import IndividualAbility from './IndividualAbility';

const DOMAIN = 'myAbilityGrowth';

@connect(({ loading, dispatch, myAbilityGrowth }) => ({
  loading,
  dispatch,
  myAbilityGrowth,
}))
@mountToTab()
class CompoundAbility extends PureComponent {
  state = {
    capaId: null,
    canUsePermission: null,
    canUseConcern: null,
    apprStatus: '',
    visible: false,
    value: 1,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    dispatch({
      type: `${DOMAIN}/query`,
    });
    dispatch({
      type: `${DOMAIN}/queryCapaset`,
    });
  };

  capaChange = id => {
    this.setState({
      capaId: id,
    });
  };

  attendanceFn = () => {
    const { dispatch } = this.props;
    const { capaId } = this.state;
    dispatch({
      type: `${DOMAIN}/attendance`,
      payload: {
        id: capaId,
      },
    });
  };

  attendanceCancalFn = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/attendanceCancal`,
      payload: {
        id,
      },
    });
  };

  tagSelect = id => {
    const {
      dispatch,
      myAbilityGrowth: { selectTagIds = [] },
    } = this.props;
    this.visibleChange();
    // 设置选中状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        selectTagIds: [id],
      },
    });
    // 我的复合能力考核点
    dispatch({
      type: `${DOMAIN}/mycapaSetChecked`,
      payload: id,
    });
  };

  refreshPage = () => {
    const {
      dispatch,
      myAbilityGrowth: { selectTagIds = [] },
    } = this.props;
    const newSelectTagIds = selectTagIds;
    dispatch({
      type: `${DOMAIN}/query`,
    });
    if (newSelectTagIds.length === 0) {
      // TODO
    } else if (newSelectTagIds.length === 1) {
      dispatch({
        type: `${DOMAIN}/queryLeveldInfo`,
        payload: {
          capasetId: newSelectTagIds[0].split(',')[0],
          leveldId: newSelectTagIds[0].split(',')[1],
          capasetLevelId: newSelectTagIds[0].split(',')[2],
        },
      });
    } else if (newSelectTagIds.length === 2) {
      const tag1 = newSelectTagIds[0].split(',');
      const tag2 = newSelectTagIds[1].split(',');
      dispatch({
        type: `${DOMAIN}/queryLeveldDiffFn`,
        payload: [
          {
            capaSetId: parseInt(tag1[0], 10),
            leveldId: parseInt(tag1[1], 10),
            capaSetLevelId: parseInt(tag1[2], 10),
          },
          {
            capaSetId: parseInt(tag2[0], 10),
            leveldId: parseInt(tag2[1], 10),
            capaSetLevelId: parseInt(tag2[2], 10),
          },
        ],
      });
    } else {
      // TODO
    }
    if (newSelectTagIds.length === 1 || newSelectTagIds.length === 2) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          growthTreeInfo: {},
          infoLoad: true,
        },
      });
    }
  };

  btnComponent = (type, row, index) => {
    let btnCom = <></>;
    const {
      capaLevelId,
      capaAbilityId,
      courseNo,
      resCapaExamApplyStatus = 'CREATE',
      resCertApplyStatus = 'CREATE',
      resCourseApplyStatus = 'CREATE',
      accessFlag,
    } = row[index];
    const onlineBtnName = {
      CREATE: '申请权限',
      APPROVING: '权限申请中',
      APPROVED: '申请权限',
      REJECTED: '申请权限',
      CLOSED: '申请权限',
    };
    const certBtnName = {
      CREATE: '上传证书',
      APPROVING: '上传证书申请中',
      APPROVED: '参加培训',
      REJECTED: '上传证书',
      CLOSED: '上传证书',
    };
    const capaBtnName = {
      CREATE: '人工审核',
      APPROVING: '人工审核申请中',
      APPROVED: '参加培训',
      REJECTED: '人工审核',
      CLOSED: '人工审核',
    };
    if (
      (certBtnName && certBtnName === 'APPROVED') ||
      (resCapaExamApplyStatus && resCapaExamApplyStatus === 'APPROVED')
    ) {
      return btnCom;
    }

    switch (type) {
      case 'ONLINE':
        btnCom = (
          <Button
            className="tw-btn-primary"
            disabled={resCourseApplyStatus === 'APPROVING'}
            onClick={() => {
              this.approvalBtn(type, row, index);
            }}
          >
            {resCourseApplyStatus === 'APPROVED' && accessFlag === 'YES'
              ? '参加培训'
              : onlineBtnName[resCourseApplyStatus] || '申请权限'}
          </Button>
        );
        break;
      case 'CERT':
        btnCom = (
          <Button
            disabled={resCertApplyStatus === 'APPROVING'}
            className="tw-btn-primary"
            onClick={() => {
              this.approvalBtn(type, row, index);
            }}
          >
            {certBtnName[resCertApplyStatus] || '上传证书'}
          </Button>
        );
        break;
      case 'MANUAL':
        btnCom = (
          <Button
            disabled={resCapaExamApplyStatus === 'APPROVING'}
            className="tw-btn-primary"
            onClick={() => {
              this.approvalBtn(type, row, index);
            }}
          >
            {capaBtnName[resCapaExamApplyStatus] || '人工审核'}
          </Button>
        );
        break;
      default:
        btnCom = <></>;
    }

    return btnCom;
  };

  approvalBtn = (approvalType, row, index) => {
    const { dispatch } = this.props;
    const {
      capaLevelId,
      capaAbilityId,
      courseNo,
      resCapaExamApplyStatus,
      resCertApplyStatus,
      resCourseApplyStatus,
      accessFlag,
    } = row[index];
    if (approvalType === 'ONLINE') {
      if (resCourseApplyStatus === 'APPROVED' && accessFlag === 'YES') {
        // TODO 跳转到课程学习页面 现在没地址
        createMessage({ type: 'success', description: 'E-Learning课程学习' });
        return;
      }
      dispatch({
        type: `${DOMAIN}/courseApply`,
        payload: {
          capaLevelId,
          capaAbilityId,
          courseNo,
        },
      }).then(res => {
        res && this.refreshPage();
      });
    }

    if (approvalType === 'CERT') {
      dispatch({
        type: `${DOMAIN}/saveCertFnHandle`,
        payload: {
          capaLevelId,
          capaAbilityId,
        },
      });
    }

    if (approvalType === 'MANUAL') {
      dispatch({
        type: `${DOMAIN}/checkPointFnHandle`,
        payload: {
          capaLevelId,
          capaAbilityId,
        },
      });
    }
  };

  visibleChange = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      myAbilityGrowth: {
        total,
        capasetData = [],
        growthTreeData,
        growthTreeDataPagination,
        growthTreeInfo,
        infoLoad = false,
        infoIntroShow = false,
        diffShow = false,
        selectTagIds = [],
      },
    } = this.props;
    const { capaId, visible } = this.state;
    const { canUsePermission, canUseConcern, apprStatus, value } = this.state;

    return (
      <div className={styles['text-select-box']}>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList legend="" noReactive>
            <div className={styles['text-select-button-group']} style={{ paddingLeft: '10px' }}>
              <Radio.Group onChange={this.onChange} value={value}>
                <Radio value={1}>我的复合能力</Radio>
                &nbsp; &nbsp;
                <Radio value={2}>我的单项能力</Radio>
              </Radio.Group>
            </div>
            <Divider dashed />
            {value === 1 && (
              <div className={styles['text-select-button-group']}>
                <Selection.Columns
                  onChange={e => {
                    this.capaChange(e);
                    if (e) {
                      const filterObj = capasetData.filter(i => i.code === e)[0];
                      this.setState({
                        canUsePermission: filterObj && filterObj.isTrue,
                        canUseConcern: filterObj && filterObj.contract,
                        apprStatus:
                          filterObj.apprStatus === 'APPROVED' &&
                          filterObj.isTrue === 'NO' &&
                          filterObj.contract === 'NO',
                      });
                    } else {
                      this.setState({
                        canUsePermission: null,
                        canUseConcern: null,
                        apprStatus: '',
                      });
                    }
                  }}
                  value={capaId}
                  source={capasetData}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="请选择复合能力"
                  showSearch
                />
                <Button
                  size="large"
                  className="tw-btn-primary"
                  onClick={() => {
                    router.push(`/user/center/growth/compoundPermission/edit?id=${capaId}`);
                  }}
                  disabled={canUsePermission !== 'YES'}
                >
                  {apprStatus ? '权限申请中' : '权限申请'}
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                  size="large"
                  icon="star"
                  className="tw-btn-primary"
                  onClick={this.attendanceFn}
                  disabled={canUseConcern !== 'YES'}
                  // disabled={!capaId}
                >
                  关注
                </Button>
              </div>
            )}
          </FieldList>
          {value === 1 && (
            <div className={styles['growth-path']}>
              <div className={styles['growth-path-example']}>
                图例:&nbsp;&nbsp;
                <div style={{ display: 'inline-block', color: '#000' }}>
                  <img style={{ width: 16, marginBottom: 4 }} src="/growth/icon_yes.svg" alt="" />
                  &nbsp;&nbsp;已获得
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div style={{ display: 'inline-block', color: '#000' }}>
                  <img src="/growth/icon_guanzhu.svg" alt="" style={{ marginBottom: 6 }} />
                  &nbsp;&nbsp;已关注
                </div>
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className={styles['approval-ability']}>适岗考核中</span>
                  <span className={styles['get-ability']}>所在级别</span>
                  <span className={styles['next-ability']}>默认下一晋升级别</span>
                  {/* <span className={styles['approval-ability']}>晋升审批中</span> */}
                </div>
              </div>
              <div className={styles['growth-path-handle-info']} style={{ color: '#1890ff' }}>
                <Icon type="info-circle" className={styles['growth-path-handle-info-icon']} />
                点击级别，可查看该级别的考核点
              </div>
              <div className={styles['growth-path-info']}>
                <Spin spinning={loading.effects[`myAbilityGrowth/queryCapaset`]}>
                  {growthTreeDataPagination.map(item => (
                    <div className={styles['ability-wrap']} key={item.capaSetId}>
                      <div className={styles['ability-title']}>
                        {item.jobType1Desc}-{item.jobType2Desc}
                        {item.isMyConcern ? (
                          <img
                            src="/growth/icon_guanzhu.svg"
                            alt=""
                            onClick={() => {
                              this.attendanceCancalFn(item.concernId);
                            }}
                          />
                        ) : (
                          <img src="/growth/icon_yes.svg" alt="" />
                        )}
                      </div>
                      <div className={styles['ability-content']}>
                        {item.leveldViewList &&
                          item.leveldViewList.map((lItem, index) => (
                            <div key={lItem.id}>
                              <LeveldTag
                                capaSetId={item.capaSetId}
                                item={lItem}
                                index={index}
                                selectTagIds={selectTagIds}
                                tagSelect={this.tagSelect}
                                capasetLevelId={lItem.id}
                              />
                              {item.leveldViewList.length - 1 === index ? (
                                ''
                              ) : (
                                <img className={styles['ability-arrow']} src={arrowIcon} alt="" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ width: '100%', textAlign: 'center', marginTop: '15px' }}>
                    <Pagination
                      defaultCurrent={1}
                      total={growthTreeData.length}
                      onChange={(page, pageSize) => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            growthTreeDataPagination: growthTreeData.slice(
                              (page - 1) * 10,
                              pageSize * page
                            ),
                          },
                        });
                      }}
                    />
                  </div>
                </Spin>
              </div>
            </div>
          )}
          {value === 2 && <IndividualAbility />}
        </Card>
        {value === 1 && (
          <LeveIdTagModal visible={visible} visibleChange={() => this.visibleChange()} />
        )}
      </div>
    );
  }
}

export default CompoundAbility;
