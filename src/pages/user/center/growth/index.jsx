import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input, Row, Col, Select, Divider, Tooltip, Icon, message } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import router from 'umi/router';
import Link from 'umi/link';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectIamUsers } from '@/services/gen/list';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';
import arrowIcon from '@/assets/img/growth/icon-arrow.svg';

import LeveldTag from './components/leveldTag';
import styles from './index.less';

const DOMAIN = 'growthInfo';

@connect(({ loading, dispatch, growthInfo }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  growthInfo,
}))
@mountToTab()
class GrowthInfo extends PureComponent {
  state = {
    capaId: null,
    canUsePermission: null,
    canUseConcern: null,
    apprStatus: '',
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
      growthInfo: { selectTagIds = [] },
    } = this.props;
    let newSelectTagIds = selectTagIds;
    const selectTagIdsCount = selectTagIds.length;
    if (selectTagIdsCount === 0) {
      newSelectTagIds = [id];
    }
    if (selectTagIdsCount === 1) {
      if (newSelectTagIds.includes(id)) {
        newSelectTagIds = [];
      } else {
        newSelectTagIds = [selectTagIds[0], id];
      }
    }
    if (selectTagIdsCount === 2) {
      const idx = newSelectTagIds.indexOf(id);
      if (idx > -1) {
        newSelectTagIds.splice(idx, 1);
      } else {
        newSelectTagIds = [selectTagIds[1], id];
      }
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        selectTagIds: newSelectTagIds,
      },
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
    const infoIntroShow =
      newSelectTagIds && Array.isArray(newSelectTagIds) && newSelectTagIds.length === 1;
    const diffShow =
      newSelectTagIds && Array.isArray(newSelectTagIds) && newSelectTagIds.length === 2;
    if (newSelectTagIds.length === 1 || newSelectTagIds.length === 2) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          growthTreeInfo: {},
          infoLoad: true,
          infoIntroShow,
          diffShow,
        },
      });
    }
  };

  refreshPage = () => {
    const {
      dispatch,
      growthInfo: { selectTagIds = [] },
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

  render() {
    const {
      dispatch,
      loading,
      growthInfo: {
        total,
        capasetData = [],
        growthTreeData,
        growthTreeInfo,
        infoLoad = false,
        infoIntroShow = false,
        diffShow = false,
        selectTagIds = [],
      },
    } = this.props;
    const { capaId } = this.state;
    const {
      title,
      capaSetIsHaveViewList = [],
      isMyCapaLevelViewList = [],
      myAbility,
    } = growthTreeInfo;
    const myAbility1 = myAbility ? myAbility.split(',')[0] : '';
    const myAbility2 = myAbility ? myAbility.split(',')[1] : '';
    const abilityIntroTableProps = {
      domain: DOMAIN, // 必填 用于本地缓存表格的列配置
      rowKey: 'id',
      loading,
      total,
      dataSource: capaSetIsHaveViewList,
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      columns: [
        {
          title: '编号',
          align: 'center',
          dataIndex: 'capasetNo',
          key: 'capasetNo',
          width: '15%',
        },
        {
          title: '当量系数',
          align: 'center',
          dataIndex: 'eqvaRatio',
          key: 'eqvaRatio',
          width: '10%',
        },
        {
          title: '获得方式',
          align: 'center',
          dataIndex: 'obtainMethodName',
          key: 'obtainMethodName',
          width: '15%',
        },
        {
          title: '获得状态',
          align: 'center',
          dataIndex: 'isHavecapaSet',
          key: 'isHavecapaSet',
          width: '10%',
        },
        {
          title: '获得时间',
          align: 'center',
          dataIndex: 'obtainDate',
          key: 'obtainDate',
          width: '15%',
        },
        {
          title: '能力描述',
          dataIndex: 'ddesc',
          key: 'ddesc',
          // width: '25%',
          render: (value, row, key) => <pre>{row.ddesc}</pre>,
        },
        {
          title: '审核人',
          align: 'center',
          dataIndex: 'apprTypeName',
          key: 'apprTypeName',
          width: '20%',
        },
      ],
      leftButtons: [
        {
          key: 'approval',
          className: 'tw-btn-primary',
          title:
            capaSetIsHaveViewList &&
            capaSetIsHaveViewList.length > 0 &&
            capaSetIsHaveViewList[0].apprStatus
              ? '能力获取申请中'
              : '能力获取申请',
          loading: false,
          hidden: false,
          disabled:
            capaSetIsHaveViewList && capaSetIsHaveViewList.length > 0
              ? !(capaSetIsHaveViewList[0].button && !capaSetIsHaveViewList[0].apprStatus)
              : true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const id = selectTagIds[0].split(',')[2];
            if (capaSetIsHaveViewList[0].message === true) {
              createMessage({
                type: 'warn',
                description: '该能力不能跨级别晋升，请按级别从低到高依次晋升',
              });
            } else {
              dispatch({
                type: `${DOMAIN}/saveCapaGrowthFnHandle`,
                payload: {
                  capaSetLevelId: id,
                },
              });
            }
          },
        },
      ],
    };

    const abilityDetailTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      rowKey: 'id',
      dataSource: isMyCapaLevelViewList,
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      columns: [
        {
          title: '单项能力',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '12%',
        },
        {
          title: '获得状态',
          align: 'center',
          dataIndex: 'have',
          key: 'have',
          width: '10%',
          render: (value, row, key) => (value ? '已获得' : '未获得'),
        },
        {
          title: '单项能力描述',
          dataIndex: 'dDesc',
          key: 'dDesc',
          width: '25%',
          render: (value, row, key) => {
            const { myAbilityViewList = [] } = row;
            let descHeight = '100px';
            if (myAbilityViewList && myAbilityViewList.length > 2) {
              descHeight = myAbilityViewList.length * 50 + 'px';
            }

            return (
              <div
                className={`${styles['table-cell-scroll']} ${styles['table-padding']}`}
                style={{
                  height: descHeight,
                }}
              >
                <pre>{row.ddesc}</pre>
              </div>
            );
          },
        },
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'myAbilityViewList',
          key: 'abilityName',
          width: '18%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    <Tooltip title={item.examPointName}>
                      <div className={styles['exam-point']}>
                        {item.examPointName && item.examPointName.length > 10
                          ? `${item.examPointName.slice(0, 9)}...`
                          : item.examPointName}
                      </div>
                    </Tooltip>
                  </div>
                ))}
            </div>
          ),
        },
        {
          title: '完成状态',
          align: 'center',
          dataIndex: 'myAbilityViewList',
          key: 'isHave',
          width: '10%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.isHave ? (
                      <Icon type="check" />
                    ) : (
                      <Icon type="close" style={{ color: '#f5222d' }} />
                    )}
                  </div>
                ))}
            </div>
          ),
        },
        {
          title: '考核方式',
          align: 'center',
          dataIndex: 'myAbilityViewList',
          key: 'examMethod',
          width: '10%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.examMethodName}
                  </div>
                ))}
            </div>
          ),
        },
        {
          title: '审核人',
          align: 'center',
          dataIndex: 'myAbilityViewList',
          key: 'apprRes',
          // width: '15%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                      width: '300px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.apprRes}
                  </div>
                ))}
            </div>
          ),
        },
        {
          title: '',
          align: 'center',
          dataIndex: 'myAbilityViewList',
          key: 'examMethodBtn',
          width: '10%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                      padding: '0 10px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.isHave ? '' : this.btnComponent(item.examMethod, value, index)}
                  </div>
                ))}
            </div>
          ),
        },
      ],
    };
    const { canUsePermission, canUseConcern, apprStatus } = this.state;
    return (
      <PageHeaderWrapper title="我的成长">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="我的成长" />}
        >
          <Link to="/user/center/growth/reord/course" style={{ fontSize: 15 }}>
            培训课程权限申请记录
          </Link>
          <Link to="/user/center/growth/reord/certificate" style={{ fontSize: 15, marginLeft: 32 }}>
            资格证书上传申请记录
          </Link>
          <Link to="/user/center/growth/reord/examination" style={{ fontSize: 15, marginLeft: 32 }}>
            考核点审核申请记录
          </Link>
          <Link
            to="/user/center/growth/reord/abilityAccess"
            style={{ fontSize: 15, marginLeft: 32 }}
          >
            能力权限申请记录
          </Link>
          <Link
            to="/user/center/growth/reord/abilityObtain"
            style={{ fontSize: 15, marginLeft: 32 }}
          >
            能力获取申请记录
          </Link>
          <FieldList legend="" noReactive>
            <div className={styles['text-select-button-group']}>
              <span>复合能力</span>
              <Selection.Columns
                onChange={e => {
                  this.capaChange(e);
                  const filterObj = capasetData.filter(i => i.code === e)[0];
                  this.setState({
                    canUsePermission: filterObj && filterObj.isTrue,
                    canUseConcern: filterObj && filterObj.contract,
                    // apprStatus:
                    //   filterObj.apprStatus === 'APPROVED' &&
                    //   filterObj.isTrue === 'NO' &&
                    //   filterObj.contract === 'NO',
                    apprStatus: filterObj.apping === 'YES',
                  });
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
          </FieldList>
          <Divider dashed />
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
                <span className={styles['get-ability']}>所在级别</span>
                <span className={styles['next-ability']}>默认下一晋升级别</span>
                <span className={styles['approval-ability']}>晋升审批中</span>
              </div>
            </div>
            <div className={styles['growth-path-handle-info']}>
              <Icon type="info-circle" className={styles['growth-path-handle-info-icon']} />
              选择一个级别节点，可查看该级别的能力详情和构成；选择任意两个级别节点，可查看这两个级别之间的能力差
            </div>
            <div className={styles['growth-path-info']}>
              {growthTreeData.map(item => (
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
            </div>
          </div>
          <Divider dashed />
          {infoLoad ? (
            <Loading />
          ) : (
            <div>
              {infoIntroShow ? (
                <div className={styles['growth-intro']}>
                  <div className={styles['tag-name']}>{title}</div>
                  <div className={styles['table-wrap']}>
                    <DataTable {...abilityIntroTableProps} />
                  </div>
                </div>
              ) : (
                ''
              )}
              {diffShow || infoIntroShow ? (
                <div>
                  {infoIntroShow ? (
                    <div className={styles['tag-name']}>能力构成</div>
                  ) : (
                    <div className={styles['tag-name']}>
                      {myAbility1}
                      &nbsp;
                      <Icon type="arrow-right" />
                      &nbsp;
                      {myAbility2}
                      &nbsp;:&nbsp;能力差
                    </div>
                  )}

                  <div className={`${styles['table-wrap']} ${styles['table-clear-padding']}`}>
                    <DataTable {...abilityDetailTableProps} />
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default GrowthInfo;
