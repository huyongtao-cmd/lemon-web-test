import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import {
  Card,
  Button,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Rate,
  Tooltip,
  Spin,
  Input,
  Icon,
  Tabs,
  Table,
  Popover,
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import VideoFlv from '@/components/common/VideoFlv';
import { isNil, isEmpty, view } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import noVideo from '@/assets/img/noVideo.svg';

import router from 'umi/router';

import styles from './index.less';

import jbxxSvg from './icon/jibenxinxi.svg';
import jbxxSvgSelect from './icon/jibenxinxi_selected.svg';
import nlSvg from './icon/nengli.svg';
import nlSvgSelect from './icon/nengli_selected.svg';
import pjSvg from './icon/pingjia.svg';
import pjSvgSelect from './icon/pingjia_selected.svg';
import zzSvg from './icon/zizhi.svg';
import zzSvgSelect from './icon/zizhi_selected.svg';
import gzSvg from './icon/gongzuo.svg';
import gzSvgSelect from './icon/gongzuo_selected.svg';
import xmSvg from './icon/xiangmu.svg';
import xmSvgSelect from './icon/xiangmu_selected.svg';
import rwSvg from './icon/renwu.svg';
import rwSvgSelect from './icon/renwu_selected.svg';
import ghSvg from './icon/guihua.svg';
import ghSvgSelect from './icon/guihua_selected.svg';
import manSvg from './icon/man.svg';
import womanSvg from './icon/woman.svg';

const { Description } = DescriptionList;

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

const DOMAIN = 'resPortrayal';

const { TabPane } = Tabs;
@connect(({ loading, resPortrayal, dispatch }) => ({
  loading,
  resPortrayal,
  dispatch,
}))
@mountToTab()
class ResPortrayal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/resPortrayal`,
        payload: { id },
      });
      dispatch({ type: `${DOMAIN}/fetchVideoUrl`, payload: id });
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        certInput: '',
        workInput: '',
        newInput: '',
        goodInput: '',
        middleInput: '',
        badInput: '',
        allInput: '',
        projectInput: '',
        taskInput: '',
      },
    });
  }

  toggleVisible = parmars => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        userInfoVisible: parmars === 'userInfoVisible',
        abilityVisible: parmars === 'abilityVisible',
        evaluationVisible: parmars === 'evaluationVisible',
        qualificationVisible: parmars === 'qualificationVisible',
        workVisible: parmars === 'workVisible',
        projectVisible: parmars === 'projectVisible',
        taskVisible: parmars === 'taskVisible',
      },
    });
  };

  expandedRowRender = (record, index, indent, expanded) => {
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource: record.twResCapaListView,
      pagination: false,
      columns: [
        {
          title: '能力',
          dataIndex: 'entryName',
          width: '20%',
        },
        {
          title: '获得日期',
          dataIndex: 'obtainDate',
          align: 'center',
          width: '20%',
        },
        {
          title: '能力描述',
          dataIndex: 'capaDesc',
          align: 'center',
        },
      ],
    };

    return <Table style={{ marginLeft: '-8px', marginRight: '-8px' }} {...tableProps} />;
  };

  renderTags = selfTagging => {
    if (selfTagging) {
      if (selfTagging.split(',').length > 8) {
        const tagArr = selfTagging
          .split(',')
          .splice(0, 8)
          .map(item => (
            <Tag title={item} className={styles.selfTag} color="blue">
              {item}
            </Tag>
          ));
        // tagArr.push('...');
        return tagArr;
      }
      return selfTagging.split(',').map(item => (
        <Tag title={item} className={styles.selfTag} color="blue">
          {item}
        </Tag>
      ));
    }
    return null;
  };

  render() {
    const {
      loading,
      dispatch,
      resPortrayal: {
        userInfo: {
          resName,
          foreignName,
          gender,
          genderName,
          age,
          mobile,
          email,
          workYearSum,
          workMonthSum,
          selfEval,
          selfTagging,
          twEvalResPortView, // 平台信息
          twResProjectTaskView, // 项目&任务经验
        },
        capacity,
        certificate,
        work,
        certInput,
        workInput,
        newInput,
        goodInput,
        middleInput,
        badInput,
        allInput,
        projectInput,
        taskInput,
        allEval,
        goodEval,
        middleEval,
        badEval,
        newEval,
        project,
        task,
        capaDataSource,
        userInfoVisible, // 基本信息
        abilityVisible, // 能力
        evaluationVisible, // 评价
        qualificationVisible, // 资质证书
        workVisible, // 工作经历
        projectVisible, // 项目经验
        taskVisible, // 任务履历
        recentVisible, // 近期规划
        workLimit,
        workTotal,
        projectLimit,
        projectTotal,
        taskLimit,
        taskTotal,
        newLimit,
        newTotal,
        goodLimit,
        goodTotal,
        middleLimit,
        middleTotal,
        badLimit,
        badTotal,
        allLimit,
        allTotal,
        videoUrl,
      },
    } = this.props;
    const {
      synEvalScore,
      eqvaRatio,
      jobType,
      resType,
      enrollDate,
      buName,
      baseCityName,
      resType1Name,
      resType2Name,
    } = twEvalResPortView || {};
    const {
      resProjectSum, // 参与平台项目个数
      resTaskSum, // 参与平台任务个数
      avgProjScore, // 项目平均得分
      avgTaskScore, // 任务平均得分
      goodProjSum, // 项目—好评数
      centreProjSum, // 项目—中评数
      shortProjSum, // 项目—差评数
      goodTaskSum, // 任务—好评数
      centreTaskSum, // 任务—中评数
      shortTaskSum, // 任务—差评数
      twProjComView, // 项目UDC
      twTaskComView, // 任务UDC
    } = twResProjectTaskView || {};
    const spinLoading = loading.effects[`${DOMAIN}/resPortrayal`];
    const { id } = fromQs();
    // 评价页 好中差全部取值
    const goodSth =
      newEval.twProjTaskComView && newEval.twProjTaskComView.filter(i => i.udcTxt === 'GOOD')[0];
    const middleSth =
      newEval.twProjTaskComView && newEval.twProjTaskComView.filter(i => i.udcTxt === 'NORMAL')[0];
    const badSth =
      newEval.twProjTaskComView && newEval.twProjTaskComView.filter(i => i.udcTxt === 'BAD')[0];
    const allSth =
      newEval.twProjTaskComView && newEval.twProjTaskComView.filter(i => i.udcTxt === '12325')[0];

    const ProjContent = props => {
      const { twEvalView } = props;
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
            {/* <img width="30" src={pjSvgSelect} style={{ verticalAlign: 'bottom' }} alt="" /> */}
            {twEvalView.projName}
            <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
              {twEvalView.projTaskIdent}
              &nbsp;&nbsp;评价时间:&nbsp;&nbsp;
              {twEvalView.evalDate}
            </span>
          </div>
          <div style={{ marginLeft: 10 }}>
            <Rate disabled count={10} value={Number(twEvalView.synEvalScore) || 0} />
            <div style={{ fontSize: 12 }}>
              <pre>{twEvalView.evalComment}</pre>
              <Divider />
            </div>
          </div>
          <div style={{ paddingBottom: 15 }}>
            {twEvalView.twEvalSorce &&
              twEvalView.twEvalSorce.map(socre => (
                <div key={socre.id}>
                  <Tooltip placement="topLeft" title={<pre>{socre.evalPoint}</pre>}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 120,
                        textAlign: 'right',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      {socre.evalPoint}
                    </span>
                  </Tooltip>
                  &nbsp;&nbsp;
                  <Rate disabled count={10} value={socre.evalScore || 0} />
                  <Tooltip placement="topLeft" title={<pre>{socre.evalCommentSroce}</pre>}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'top',
                        paddingTop: 5,
                      }}
                    >
                      <pre>{socre.evalCommentSroce}</pre>
                    </span>
                  </Tooltip>
                </div>
              ))}
          </div>
        </div>
      );
    };
    const TaskContent = props => {
      const { twEvalView } = props;
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
            {/* <img width="30" src={pjSvgSelect} style={{ verticalAlign: 'bottom' }} alt="" /> */}
            {twEvalView.taskName}
            <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
              {twEvalView.projTaskIdent}
              &nbsp;&nbsp;评价时间:&nbsp;&nbsp;
              {twEvalView.evalDate}
            </span>
          </div>
          <div style={{ marginLeft: 10 }}>
            <Rate disabled count={10} value={Number(twEvalView.synEvalScore) || 0} />
            <div style={{ fontSize: 12 }}>
              <pre>{twEvalView.evalComment}</pre>
              <Divider />
            </div>
          </div>
          <div style={{ paddingBottom: 15 }}>
            {twEvalView.twEvalSorce &&
              twEvalView.twEvalSorce.map(socre => (
                <div key={socre.id}>
                  <Tooltip placement="topLeft" title={<pre>{socre.evalPoint}</pre>}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 120,
                        textAlign: 'right',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      {socre.evalPoint}
                    </span>
                  </Tooltip>
                  &nbsp;&nbsp;
                  <Rate disabled count={10} value={socre.evalScore || 0} />
                  <Tooltip placement="topLeft" title={<pre>{socre.evalCommentSroce}</pre>}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'top',
                        paddingTop: 5,
                      }}
                    >
                      <pre>{socre.evalCommentSroce}</pre>
                    </span>
                  </Tooltip>
                </div>
              ))}
          </div>
        </div>
      );
    };
    const ProjViewContent = props => {
      const { twResProjLogView } = props;
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
            {/* <img width="30" src={xmSvgSelect} style={{ verticalAlign: 'bottom' }} alt="" /> */}
            {twResProjLogView.projName}
            <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
              {twResProjLogView.platProjFlag === 'YES' ? '平台内项目' : ''}
              &nbsp;&nbsp; {twResProjLogView.dateFrom} ~ {twResProjLogView.dateTo}
              {twResProjLogView.yearMonthWork ? `(${twResProjLogView.yearMonthWork})` : null}
            </span>
          </div>
          <div>
            <div style={{ marginBottom: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                相关行业:
              </span>
              &nbsp;&nbsp;
              {twResProjLogView.industry}
            </div>
            <div className={styles.pjLabel} style={{ marginBottom: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                相关产品:
              </span>
              &nbsp;&nbsp;
              {twResProjLogView.product}
            </div>
            <div className={styles.pjLabel} style={{ marginBottom: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                项目角色:
              </span>
              &nbsp;&nbsp;
              {twResProjLogView.projRole}
            </div>
            <div className={styles.pjLabel} style={{ marginBottom: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                所在公司:
              </span>
              &nbsp;&nbsp;
              {twResProjLogView.company}
            </div>
            <div style={{ marginBottom: '2px' }}>
              <div
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                项目简介:
              </div>
              &nbsp;&nbsp;
              <div
                style={{
                  display: 'inline-block',
                  width: 'calc(100% - 120px)',
                  verticalAlign: 'top',
                }}
              >
                <pre>{twResProjLogView.projIntro}</pre>
              </div>
            </div>
            <div>
              <div
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                  width: 80,
                  textAlign: 'right',
                }}
              >
                职责&业绩:
              </div>
              &nbsp;&nbsp;
              <div
                style={{
                  display: 'inline-block',
                  width: 'calc(100% - 120px)',
                  verticalAlign: 'top',
                }}
              >
                <pre>{twResProjLogView.dutyAchv}</pre>
              </div>
            </div>
          </div>
        </div>
      );
    };
    return (
      <PageHeaderWrapper>
        <Spin spinning={spinLoading}>
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                closeThenGoto(markAsTab(from));
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <div className={styles.wrap}>
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px', paddingTop: 0 }}
              title={<Title icon="profile" text="资源画像" />}
              bordered={false}
            >
              <Row gutter={24} style={{ minWidth: '1000px' }}>
                <Col span={10}>
                  <div className={styles.resPortrayalLeft}>
                    <div
                      className={styles.leftItem}
                      onClick={() => this.toggleVisible('userInfoVisible')}
                      style={{
                        position: 'absolute',
                        top: 95,
                        left: '26%',
                      }}
                    >
                      <span style={{ color: userInfoVisible ? '#13227a' : '#999' }}>
                        基本信息&nbsp;&nbsp;
                      </span>
                      <div className={userInfoVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={userInfoVisible ? jbxxSvgSelect : jbxxSvg}
                          alt=""
                        />
                      </div>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('abilityVisible');
                        dispatch({
                          type: `${DOMAIN}/getCapacity`,
                          payload: { id },
                        });
                        dispatch({
                          type: `${DOMAIN}/querySingleAbility`,
                          payload: {
                            resId: id,
                            limit: 0,
                          },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 95,
                        left: '55%',
                      }}
                    >
                      <div className={abilityVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={abilityVisible ? nlSvgSelect : nlSvg}
                          alt=""
                        />
                      </div>
                      <span
                        className={styles.img}
                        style={{ color: abilityVisible ? '#13227a' : '#999' }}
                      >
                        &nbsp;&nbsp;能力
                      </span>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('evaluationVisible');
                        dispatch({
                          type: `${DOMAIN}/getNewEval`,
                          payload: {
                            id: { id },
                            portEvalSelect: {
                              limit: newLimit,
                            },
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/getGoodEval`,
                          payload: {
                            id: { id },
                            portEvalSelect: {
                              limit: goodLimit,
                            },
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/getMiddleEval`,
                          payload: {
                            id: { id },
                            portEvalSelect: {
                              limit: middleLimit,
                            },
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/getBadEval`,
                          payload: {
                            id: { id },
                            portEvalSelect: {
                              limit: badLimit,
                            },
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/getAllEval`,
                          payload: {
                            id: { id },
                            portEvalSelect: {
                              limit: allLimit,
                            },
                          },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 205,
                        left: '64%',
                      }}
                    >
                      <div className={evaluationVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={evaluationVisible ? pjSvgSelect : pjSvg}
                          alt=""
                        />
                      </div>
                      <span style={{ color: evaluationVisible ? '#13227a' : '#999' }}>
                        &nbsp;&nbsp;评价
                      </span>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('qualificationVisible');
                        dispatch({
                          type: `${DOMAIN}/getCertificate`,
                          payload: { id: { id } },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 325,
                        left: '65%',
                      }}
                    >
                      <div className={qualificationVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={qualificationVisible ? zzSvgSelect : zzSvg}
                          alt=""
                        />
                      </div>
                      <span style={{ color: qualificationVisible ? '#13227a' : '#999' }}>
                        &nbsp;&nbsp;资质证书
                      </span>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('workVisible');
                        dispatch({
                          type: `${DOMAIN}/getWork`,
                          payload: {
                            id: { id },
                            inBoxName: {
                              limit: workLimit,
                            },
                          },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 445,
                        left: '64%',
                      }}
                    >
                      <div className={workVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={workVisible ? gzSvgSelect : gzSvg}
                          alt=""
                        />
                      </div>
                      <span style={{ color: workVisible ? '#13227a' : '#999' }}>
                        &nbsp;&nbsp;工作经历
                      </span>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() =>
                        router.push(
                          `/user/center/myTeam/resPlan?resId=${id}&from=/hr/res/resPortrayal`
                        )
                      }
                      style={{
                        position: 'absolute',
                        top: 205,
                        left: '18%',
                      }}
                    >
                      <span
                        className={styles.img}
                        style={{ color: recentVisible ? '#13227a' : '#999' }}
                      >
                        近期规划&nbsp;&nbsp;
                      </span>
                      <div className={styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={recentVisible ? ghSvgSelect : ghSvg}
                          alt=""
                        />
                      </div>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('taskVisible');
                        dispatch({
                          type: `${DOMAIN}/getTask`,
                          payload: {
                            id: { id },
                            taskSelect: { limit: taskLimit }, // 首次查10条 超过十条显示加载更多
                          },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 325,
                        left: '15%',
                      }}
                    >
                      <span style={{ color: taskVisible ? '#13227a' : '#999' }}>
                        任务履历&nbsp;&nbsp;
                      </span>
                      <div className={taskVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={taskVisible ? rwSvgSelect : rwSvg}
                          alt=""
                        />
                      </div>
                    </div>
                    <div
                      className={styles.leftItem}
                      onClick={() => {
                        this.toggleVisible('projectVisible');
                        dispatch({
                          type: `${DOMAIN}/getProject`,
                          payload: {
                            id: { id },
                            portProjSelect: { limit: projectLimit },
                          },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: 445,
                        left: '20%',
                      }}
                    >
                      <span style={{ color: projectVisible ? '#13227a' : '#999' }}>
                        项目经验&nbsp;&nbsp;
                      </span>
                      <div className={projectVisible ? styles.bgBlue : styles.bgGrey}>
                        <img
                          className={styles.img}
                          width="40"
                          src={projectVisible ? xmSvgSelect : xmSvg}
                          alt=""
                        />
                      </div>
                    </div>
                    <img
                      style={{
                        position: 'absolute',
                        top: 205,
                        left: '35%',
                      }}
                      width="220"
                      height="400"
                      src={gender === 'F' ? womanSvg : manSvg}
                      alt=""
                    />
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: userInfoVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div className={styles.rightItem}>
                      <div className={styles.rightTitle}>个人信息</div>
                      <div className={styles.userInfo} style={{ position: 'relative' }}>
                        <div className={styles.userInfoItem1}>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>姓名:</span>
                            {resName} {foreignName}
                          </div>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>年龄:</span>
                            {age}
                          </div>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>手机:</span>
                            {mobile}
                          </div>
                        </div>
                        <div className={styles.userInfoItem2}>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>性别:</span>
                            {genderName}
                          </div>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>工作年限:</span>
                            {workYearSum}
                          </div>
                          <div className={styles.items}>
                            <span className={styles.itemsLabel}>邮箱:</span>
                            {email}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            verticalAlign: 'top',
                            position: 'absolute',
                            top: '-25px',
                            right: '4%',
                          }}
                        >
                          <Avatar shape="circle" size={100} icon="user" />
                        </div>
                      </div>
                    </div>
                    <div className={classnames(styles.rightItem, styles.selfIntroduce)}>
                      <div className={styles.rightTitle}>自我介绍</div>
                      <div className={styles.leftContent}>
                        <div style={{ margin: '0 0 10px 46px' }}>
                          <pre title={selfEval} className={styles.selfText}>
                            {selfEval}
                          </pre>
                        </div>
                        <div className={styles.marginLeft}>{this.renderTags(selfTagging)}</div>
                      </div>
                      <div className={styles.videoView}>
                        <VideoFlv
                          width="100%"
                          height="150"
                          style={{ 'object-fit': 'fill' }}
                          controlslist="nodownload"
                          controls
                          preload="auto"
                          oncontextmenu="return false"
                          type="mp4"
                          url={videoUrl}
                          poster={videoUrl ? '' : `${noVideo}`}
                        />
                      </div>
                    </div>
                    <div className={styles.rightItem}>
                      <div className={styles.rightTitle}>平台信息</div>
                      <div style={{ margin: '0 0 0px 46px' }}>
                        综合评分:&nbsp;&nbsp;
                        <Rate disabled count={10} value={Number(synEvalScore) || 0} />
                      </div>
                      <div style={{ marginLeft: '24px' }}>
                        <div className={styles.userInfo}>
                          <div className={styles.userInfoItem1}>
                            <div className={styles.items}>
                              <span className={styles.itemsLabel}>当量系数:</span>
                              {eqvaRatio}
                            </div>
                            <div className={styles.items}>
                              <span className={styles.itemsLabel}>资源类型:</span>
                              {resType1Name} - {resType2Name}
                            </div>
                            <div className={styles.items}>
                              <span className={styles.itemsLabel}>BaseBU:</span>
                              {buName}
                            </div>
                          </div>
                          <div className={styles.platInfoItem}>
                            <div className={styles.items}>
                              <span className={styles.itemsPlatLabel}>最高级别能力:</span>
                              {jobType}
                            </div>
                            <div className={styles.items}>
                              <span className={styles.itemsPlatLabel}>进入平台时间:</span>
                              {enrollDate}
                            </div>
                            <div className={styles.items}>
                              <span className={styles.itemsPlatLabel}>Base地:</span>
                              {baseCityName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={classnames(styles.rightItem, styles.projectItem)}>
                      <div className={styles.rightTitle}>项目&任务经验</div>
                      <div className={styles.taskExp}>
                        <div>
                          <img
                            style={{ verticalAlign: 'text-bottom' }}
                            width="20"
                            src={xmSvgSelect}
                            alt=""
                          />
                          <span style={{ fontWeight: 'bold', marginLeft: 10 }}>项目</span>
                        </div>
                        <div className={styles.platInfoItem}>
                          <div className={styles.items} style={{ marginTop: 10 }}>
                            <span className={styles.itemsLabel}>参与平台项目:</span>
                            {resProjectSum || 0}个 &nbsp;&nbsp;
                            {resProjectSum ? (
                              <span
                                style={{ color: '#1890FF', cursor: 'pointer', fontSize: 14 }}
                                onClick={() => {
                                  dispatch({
                                    type: `${DOMAIN}/getProject`,
                                    payload: {
                                      id: { id },
                                      portProjSelect: { limit: projectLimit + 10 },
                                    },
                                  });
                                  this.toggleVisible('projectVisible');
                                }}
                              >
                                查看详情
                              </span>
                            ) : null}
                          </div>
                          {resProjectSum ? (
                            <div className={styles.items}>
                              <span className={styles.itemsLabel}>平均得分:</span>
                              <Rate disabled count={10} value={avgProjScore || 0} />
                              &nbsp;&nbsp;
                              {twProjComView &&
                                twProjComView.map(item => (
                                  <span>
                                    &nbsp;&nbsp;
                                    {item.text}({item.projSum})
                                  </span>
                                ))}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <img
                            style={{ verticalAlign: 'text-bottom' }}
                            width="20"
                            src={rwSvgSelect}
                            alt=""
                          />
                          <span style={{ fontWeight: 'bold', marginLeft: 10 }}>任务</span>
                        </div>
                        <div className={styles.platInfoItem}>
                          <div className={styles.items} style={{ marginTop: 10 }}>
                            <span className={styles.itemsLabel}>完成任务包:</span>
                            {resTaskSum || 0}
                            个&nbsp;&nbsp;
                            {resTaskSum ? (
                              <span
                                style={{ color: '#1890FF', cursor: 'pointer', fontSize: 14 }}
                                onClick={() => {
                                  dispatch({
                                    type: `${DOMAIN}/getTask`,
                                    payload: {
                                      id: { id },
                                      taskSelect: { limit: taskLimit },
                                    },
                                  });
                                  this.toggleVisible('taskVisible');
                                }}
                              >
                                查看详情
                              </span>
                            ) : null}
                          </div>
                          {resTaskSum ? (
                            <div className={styles.items}>
                              <span className={styles.itemsLabel}>平均得分:</span>
                              <Rate disabled count={10} value={avgTaskScore || 0} />
                              &nbsp;&nbsp;
                              {twTaskComView &&
                                twTaskComView.map(item => (
                                  <span>
                                    &nbsp;&nbsp;
                                    {item.text}({item.taskSum})
                                  </span>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: abilityVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    {capacity.map(item => (
                      <div className={styles.rightItem} style={{ padding: '20px 30px 36px' }}>
                        <div>
                          {/* <img width="20" src={nlSvgSelect} alt="" /> */}
                          <span style={{ fontWeight: 'bold' }}>{item.merge}</span>
                        </div>
                        <div>
                          <div style={{ lineHeight: 2 }}>
                            <span className={styles.label}>当量系数:</span>
                            {item.eqvaRatio}
                            <span className={styles.label} style={{ marginLeft: 80 }}>
                              获得时间:
                            </span>
                            {item.obtainDate}
                          </div>
                          <div>
                            <div
                              className={styles.label}
                              style={{
                                display: 'inline-block',
                                width: 80,
                                whiteSpace: 'nowrap',
                                marginRight: 0,
                              }}
                            >
                              能力描述:
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                width: 'calc(100% - 90px)',
                                verticalAlign: 'top',
                              }}
                            >
                              <pre>{item.ddesc}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className={styles.rightItem}>
                      <div className={styles.rightTitle}>单项能力</div>
                      <div className={styles.marginLeft}>
                        <DataTable
                          enableSelection={false}
                          showSearch={false}
                          showColumn={false}
                          showExport={false}
                          pagination={defaultPagination}
                          loading={loading.effects[`${DOMAIN}/querySingleAbility`]}
                          dataSource={capaDataSource}
                          columns={[
                            {
                              title: '分类',
                              dataIndex: 'name',
                              render: (value, row) => `${row.capaType1Name}-${row.capaType2Name}`,
                            },
                          ]}
                          rowKey="cid"
                          expandedRowRender={this.expandedRowRender}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: evaluationVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div className={styles.rightItem}>
                      <div style={{ fontWeight: 'bold', padding: '0 30px' }}>综合评分</div>
                      <div style={{ padding: '0 30px' }}>
                        <Rate disabled count={10} value={newEval.projTaskAvgScore} />
                      </div>
                    </div>
                    <div style={{ padding: '0 30px' }}>
                      <Tabs defaultActiveKey="1">
                        <TabPane tab="最新" key="1">
                          <div style={{ marginBottom: 10 }}>
                            <Input
                              style={{ width: 280 }}
                              placeholder="被评价任务/项目名称"
                              value={newInput}
                              onChange={e =>
                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: { newInput: e.target.value },
                                })
                              }
                              onPressEnter={() => {
                                dispatch({
                                  type: `${DOMAIN}/getNewEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: newInput || void 0 },
                                  },
                                });
                              }}
                            />
                            <Icon
                              style={{ cursor: 'pointer', marginLeft: 10 }}
                              type="search"
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getNewEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: newInput || void 0 },
                                  },
                                });
                              }}
                            />
                          </div>
                          {/* <Divider /> */}
                          {newEval.twEvalProjTask &&
                            newEval.twEvalProjTask.map(
                              item =>
                                item && (
                                  <div>
                                    <div
                                      className={styles.rightItem}
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 'bold',
                                          marginLeft: 10,
                                          marginBottom: 0,
                                        }}
                                      >
                                        {/* <img
                                          width="30"
                                          src={pjSvgSelect}
                                          style={{ verticalAlign: 'bottom' }}
                                          alt=""
                                        /> */}
                                        {item.taskName}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            marginLeft: 20,
                                          }}
                                        >
                                          {item.projTaskIdent}
                                          &nbsp;&nbsp;&nbsp;&nbsp;评价时间: {item.evalDate}
                                        </span>
                                      </div>
                                      <div style={{ marginLeft: 10 }}>
                                        <Rate disabled count={10} value={item.synEvalScore} />
                                        <div style={{ fontSize: 12 }}>
                                          <pre>{item.evalComment}</pre>
                                        </div>
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        {item.twEvalSorce &&
                                          item.twEvalSorce.map(socre => (
                                            <div className={styles.pjLabel}>
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalPoint}</pre>}
                                              >
                                                <span
                                                  className={`${styles.label} ${styles.evalLabel}`}
                                                >
                                                  {socre.evalPoint}
                                                </span>
                                              </Tooltip>
                                              <Rate
                                                disabled
                                                count={10}
                                                value={socre.evalScore || 0}
                                              />
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalCommentSroce}</pre>}
                                              >
                                                <span className={styles.desc}>
                                                  <pre>{socre.evalCommentSroce}</pre>
                                                </span>
                                              </Tooltip>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <Divider dashed />
                                  </div>
                                )
                            )}
                          {newLimit < newTotal ? (
                            <div
                              style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getNewEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { limit: newLimit + 10 },
                                  },
                                });
                              }}
                            >
                              加载更多
                            </div>
                          ) : null}
                        </TabPane>
                        <TabPane
                          tab={`${(goodSth && goodSth.text) || '好评'}(${(goodSth &&
                            goodSth.centreComSum) ||
                            0})`}
                          key="2"
                        >
                          <div style={{ marginBottom: 10 }}>
                            <Input
                              style={{ width: 280 }}
                              placeholder="被评价任务/项目名称"
                              value={goodInput}
                              onChange={e =>
                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: { goodInput: e.target.value },
                                })
                              }
                              onPressEnter={() => {
                                dispatch({
                                  type: `${DOMAIN}/getGoodEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: goodInput || void 0 },
                                  },
                                });
                              }}
                            />
                            <Icon
                              style={{ cursor: 'pointer', marginLeft: 10 }}
                              type="search"
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getGoodEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: goodInput || void 0 },
                                  },
                                });
                              }}
                            />
                          </div>
                          {/* <Divider /> */}
                          {goodEval.twEvalProjTask &&
                            goodEval.twEvalProjTask.map(
                              item =>
                                item && (
                                  <div>
                                    <div
                                      className={styles.rightItem}
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 'bold',
                                          marginLeft: 10,
                                          marginBottom: 10,
                                        }}
                                      >
                                        {/* <img
                                          width="30"
                                          src={pjSvgSelect}
                                          style={{ verticalAlign: 'bottom' }}
                                          alt=""
                                        /> */}
                                        {item.taskName}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            marginLeft: 20,
                                          }}
                                        >
                                          {item.projTaskIdent}
                                          &nbsp;&nbsp;&nbsp;&nbsp;评价时间: {item.evalDate}
                                        </span>
                                      </div>
                                      <div style={{ marginLeft: 10 }}>
                                        <Rate disabled count={10} value={item.synEvalScore} />
                                        <div style={{ fontSize: 12 }}>
                                          <pre>{item.evalComment}</pre>
                                        </div>
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        {item.twEvalSorce &&
                                          item.twEvalSorce.map(socre => (
                                            <div className={styles.pjLabel}>
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalPoint}</pre>}
                                              >
                                                <span
                                                  className={`${styles.label} ${styles.evalLabel}`}
                                                >
                                                  {socre.evalPoint}
                                                </span>
                                              </Tooltip>
                                              <Rate
                                                disabled
                                                count={10}
                                                value={socre.evalScore || 0}
                                              />
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalCommentSroce}</pre>}
                                              >
                                                <span className={styles.desc}>
                                                  <pre>{socre.evalCommentSroce}</pre>
                                                </span>
                                              </Tooltip>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <Divider dashed />
                                  </div>
                                )
                            )}
                          {goodLimit < goodTotal ? (
                            <div
                              style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getGoodEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { limit: goodLimit + 10 },
                                  },
                                });
                              }}
                            >
                              加载更多
                            </div>
                          ) : null}
                        </TabPane>
                        <TabPane
                          tab={`${(middleSth && middleSth.text) || '中评'}(${(middleSth &&
                            middleSth.centreComSum) ||
                            0})`}
                          key="3"
                        >
                          <div style={{ marginBottom: 10 }}>
                            <Input
                              style={{ width: 280 }}
                              placeholder="被评价任务/项目名称"
                              value={middleInput}
                              onChange={e =>
                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: { middleInput: e.target.value },
                                })
                              }
                              onPressEnter={() => {
                                dispatch({
                                  type: `${DOMAIN}/getMiddleEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: middleInput || void 0 },
                                  },
                                });
                              }}
                            />
                            <Icon
                              style={{ cursor: 'pointer', marginLeft: 10 }}
                              type="search"
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getMiddleEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: middleInput || void 0 },
                                  },
                                });
                              }}
                            />
                          </div>
                          {/* <Divider /> */}
                          {middleEval.twEvalProjTask &&
                            middleEval.twEvalProjTask.map(
                              item =>
                                item && (
                                  <div>
                                    <div
                                      className={styles.rightItem}
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 'bold',
                                          marginLeft: 10,
                                          marginBottom: 10,
                                        }}
                                      >
                                        {/* <img
                                          width="30"
                                          src={pjSvgSelect}
                                          style={{ verticalAlign: 'bottom' }}
                                          alt=""
                                        /> */}
                                        {item.taskName}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            marginLeft: 20,
                                          }}
                                        >
                                          {item.projTaskIdent}
                                          &nbsp;&nbsp;&nbsp;&nbsp;评价时间: {item.evalDate}
                                        </span>
                                      </div>
                                      <div style={{ marginLeft: 10 }}>
                                        <Rate disabled count={10} value={item.synEvalScore} />
                                        <div style={{ fontSize: 12 }}>
                                          <pre>{item.evalComment}</pre>
                                        </div>
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        {item.twEvalSorce &&
                                          item.twEvalSorce.map(socre => (
                                            <div className={styles.pjLabel}>
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalPoint}</pre>}
                                              >
                                                <span
                                                  className={`${styles.label} ${styles.evalLabel}`}
                                                >
                                                  {socre.evalPoint}
                                                </span>
                                              </Tooltip>
                                              <Rate
                                                disabled
                                                count={10}
                                                value={socre.evalScore || 0}
                                              />
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalCommentSroce}</pre>}
                                              >
                                                <span className={styles.desc}>
                                                  <pre>{socre.evalCommentSroce}</pre>
                                                </span>
                                              </Tooltip>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <Divider dashed />
                                  </div>
                                )
                            )}
                          {middleLimit < middleTotal ? (
                            <div
                              style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getMiddleEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { limit: middleLimit + 10 },
                                  },
                                });
                              }}
                            >
                              加载更多
                            </div>
                          ) : null}
                        </TabPane>
                        <TabPane
                          tab={`${(badSth && badSth.text) || '差评'}(${(badSth &&
                            badSth.centreComSum) ||
                            0})`}
                          key="4"
                        >
                          <div style={{ marginBottom: 10 }}>
                            <Input
                              style={{ width: 280 }}
                              placeholder="被评价任务/项目名称"
                              value={badInput}
                              onChange={e =>
                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: { badInput: e.target.value },
                                })
                              }
                              onPressEnter={() => {
                                dispatch({
                                  type: `${DOMAIN}/getBadEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: badInput || void 0 },
                                  },
                                });
                              }}
                            />
                            <Icon
                              style={{ cursor: 'pointer', marginLeft: 10 }}
                              type="search"
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getBadEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: badInput || void 0 },
                                  },
                                });
                              }}
                            />
                          </div>
                          {/* <Divider /> */}
                          {badEval.twEvalProjTask &&
                            badEval.twEvalProjTask.map(
                              item =>
                                item && (
                                  <div>
                                    <div
                                      className={styles.rightItem}
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 'bold',
                                          marginLeft: 10,
                                          marginBottom: 10,
                                        }}
                                      >
                                        {/* <img
                                          width="30"
                                          src={pjSvgSelect}
                                          style={{ verticalAlign: 'bottom' }}
                                          alt=""
                                        /> */}
                                        {item.taskName}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            marginLeft: 20,
                                          }}
                                        >
                                          {item.projTaskIdent}
                                          &nbsp;&nbsp;&nbsp;&nbsp;评价时间: {item.evalDate}
                                        </span>
                                      </div>
                                      <div style={{ marginLeft: 10 }}>
                                        <Rate disabled count={10} value={item.synEvalScore} />
                                        <div style={{ fontSize: 12 }}>
                                          <pre>{item.evalComment}</pre>
                                        </div>
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        {item.twEvalSorce &&
                                          item.twEvalSorce.map(socre => (
                                            <div className={styles.pjLabel}>
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalPoint}</pre>}
                                              >
                                                <span
                                                  className={`${styles.label} ${styles.evalLabel}`}
                                                >
                                                  {socre.evalPoint}
                                                </span>
                                              </Tooltip>
                                              <Rate
                                                disabled
                                                count={10}
                                                value={socre.evalScore || 0}
                                              />
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalCommentSroce}</pre>}
                                              >
                                                <span className={styles.desc}>
                                                  <pre>{socre.evalCommentSroce}</pre>
                                                </span>
                                              </Tooltip>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <Divider dashed />
                                  </div>
                                )
                            )}
                          {badLimit < badTotal ? (
                            <div
                              style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getBadEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { limit: badLimit + 10 },
                                  },
                                });
                              }}
                            >
                              加载更多
                            </div>
                          ) : null}
                        </TabPane>
                        <TabPane
                          tab={`${(allSth && allSth.text) || '全部'}(${(allSth &&
                            allSth.centreComSum) ||
                            0})`}
                          key="5"
                        >
                          <div style={{ marginBottom: 10 }}>
                            <Input
                              style={{ width: 280 }}
                              placeholder="被评价任务/项目名称"
                              value={allInput}
                              onChange={e =>
                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: { allInput: e.target.value },
                                })
                              }
                              onPressEnter={() => {
                                dispatch({
                                  type: `${DOMAIN}/getAllEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: allInput || void 0 },
                                  },
                                });
                              }}
                            />
                            <Icon
                              style={{ cursor: 'pointer', marginLeft: 10 }}
                              type="search"
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getAllEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { portEvalSelect: allInput || void 0 },
                                  },
                                });
                              }}
                            />
                          </div>
                          {/* <Divider /> */}
                          {allEval.twEvalProjTask &&
                            allEval.twEvalProjTask.map(
                              item =>
                                item && (
                                  <div>
                                    <div
                                      className={styles.rightItem}
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 'bold',
                                          marginLeft: 10,
                                          marginBottom: 10,
                                        }}
                                      >
                                        {/* <img
                                          width="30"
                                          src={pjSvgSelect}
                                          style={{ verticalAlign: 'bottom' }}
                                          alt=""
                                        /> */}
                                        {item.taskName}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            marginLeft: 20,
                                          }}
                                        >
                                          {item.projTaskIdent}
                                          &nbsp;&nbsp;&nbsp;&nbsp;评价时间: {item.evalDate}
                                        </span>
                                      </div>
                                      <div style={{ marginLeft: 10 }}>
                                        <Rate disabled count={10} value={item.synEvalScore} />
                                        <div style={{ fontSize: 12 }}>
                                          <pre>{item.evalComment}</pre>
                                        </div>
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        {item.twEvalSorce &&
                                          item.twEvalSorce.map(socre => (
                                            <div className={styles.pjLabel}>
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalPoint}</pre>}
                                              >
                                                <span
                                                  className={`${styles.label} ${styles.evalLabel}`}
                                                >
                                                  {socre.evalPoint}
                                                </span>
                                              </Tooltip>
                                              <Rate
                                                disabled
                                                count={10}
                                                value={socre.evalScore || 0}
                                              />
                                              <Tooltip
                                                placement="topLeft"
                                                title={<pre>{socre.evalCommentSroce}</pre>}
                                              >
                                                <span className={styles.desc}>
                                                  <pre>{socre.evalCommentSroce}</pre>
                                                </span>
                                              </Tooltip>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <Divider dashed />
                                  </div>
                                )
                            )}
                          {allLimit < allTotal ? (
                            <div
                              style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                              onClick={() => {
                                dispatch({
                                  type: `${DOMAIN}/getAllEval`,
                                  payload: {
                                    id: { id },
                                    portEvalSelect: { limit: allLimit + 10 },
                                  },
                                });
                              }}
                            >
                              加载更多
                            </div>
                          ) : null}
                        </TabPane>
                      </Tabs>
                    </div>
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: qualificationVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div style={{ padding: '20px 30px 36px', borderBottom: '5px solid #F0F2F5' }}>
                      <Input
                        style={{ width: 280 }}
                        placeholder="证书名称"
                        value={certInput}
                        onChange={e =>
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { certInput: e.target.value },
                          })
                        }
                        onPressEnter={() => {
                          dispatch({
                            type: `${DOMAIN}/getCertificate`,
                            payload: {
                              id: { id },
                              certName: { certName: certInput || void 0 },
                            },
                          });
                        }}
                      />
                      <Icon
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        type="search"
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getCertificate`,
                            payload: {
                              id: { id },
                              certName: { certName: certInput || void 0 },
                            },
                          });
                        }}
                      />
                    </div>
                    <div style={{ width: '100%' }}>
                      {certificate.map(item => (
                        <div className={styles.certificate}>
                          <div style={{ fontWeight: 'bold', marginBottom: 10 }}>
                            {/* <img
                              width="30"
                              src={zzSvgSelect}
                              style={{ verticalAlign: 'bottom' }}
                              alt=""
                            /> */}
                            {item.certName}
                          </div>
                          <div>
                            <div className={styles.lineHeight}>
                              <span className={styles.label}>证书号码:</span>
                              {item.certNo}
                            </div>
                            <div className={styles.lineHeight}>
                              <span className={styles.label}>获得时间:</span>
                              {item.obtainDate}
                            </div>
                            <div className={styles.lineHeight}>
                              <span className={styles.label}>颁发机构:</span>
                              {item.releaseBy}
                            </div>
                            <div className={styles.lineHeight}>
                              <span className={styles.label}>分数/等级:</span>
                              {item.score}/{item.grade}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: workVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div style={{ padding: '20px 30px 36px', borderBottom: '5px solid #F0F2F5' }}>
                      <Input
                        style={{ width: 280 }}
                        placeholder="行业/公司/职位"
                        value={workInput}
                        onChange={e =>
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { workInput: e.target.value },
                          })
                        }
                        onPressEnter={() => {
                          dispatch({
                            type: `${DOMAIN}/getWork`,
                            payload: {
                              id: { id },
                              inBoxName: { inBoxName: workInput || void 0 },
                            },
                          });
                        }}
                      />
                      <Icon
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        type="search"
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getWork`,
                            payload: {
                              id: { id },
                              inBoxName: { inBoxName: workInput || void 0 },
                            },
                          });
                        }}
                      />
                    </div>
                    {work.map(item => (
                      <div className={styles.rightItem}>
                        <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
                          {/* <img
                            width="30"
                            src={gzSvgSelect}
                            style={{ verticalAlign: 'bottom' }}
                            alt=""
                          /> */}
                          {item.companyName}
                          <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
                            {item.dateFrom && item.dateFrom.slice(0, 7)}~
                            {item.dateTo && item.dateTo.slice(0, 7)}({item.yearMonthWork})
                          </span>
                        </div>
                        <div style={{ marginLeft: 38 }}>
                          <div className={styles.lineHeight}>
                            <span className={styles.label}>行业:</span>
                            {item.industry}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span className={styles.label}>职位:</span>
                            {item.jobtitle}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span className={styles.label}>部门:</span>
                            {item.deptName}
                          </div>
                          {/* <div className={styles.lineHeight}>
                            <span className={styles.label}>部门:</span>
                            {item.deptName}
                          </div> */}
                          <div className={styles.lineHeight} style={{ display: 'flex' }}>
                            <div className={styles.label} style={{ whiteSpace: 'nowrap' }}>
                              职责:
                            </div>
                            <div>
                              <pre>{item.dutyDesc}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {workLimit < workTotal ? (
                      <div
                        style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getWork`,
                            payload: {
                              id: { id },
                              inBoxName: { limit: workLimit + 10 },
                            },
                          });
                        }}
                      >
                        加载更多
                      </div>
                    ) : null}
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: projectVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div style={{ padding: '20px 30px 36px', borderBottom: '5px solid #F0F2F5' }}>
                      <Input
                        style={{ width: 320 }}
                        placeholder="项目名称/行业/产品/角色/所在公司/简介"
                        value={projectInput}
                        onChange={e =>
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { projectInput: e.target.value },
                          })
                        }
                        onPressEnter={() => {
                          dispatch({
                            type: `${DOMAIN}/getProject`,
                            payload: {
                              id: { id },
                              portProjSelect: { portProjSelect: projectInput || void 0 },
                            },
                          });
                        }}
                      />
                      <Icon
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        type="search"
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getProject`,
                            payload: {
                              id: { id },
                              portProjSelect: { portProjSelect: projectInput || void 0 },
                            },
                          });
                        }}
                      />
                    </div>
                    {project.map(item => (
                      <div className={styles.rightItem}>
                        <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
                          {/* <img
                            width="30"
                            src={xmSvgSelect}
                            style={{ verticalAlign: 'bottom' }}
                            alt=""
                          /> */}
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {item.projName}
                          <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
                            {item.platProjFlag === 'YES' ? '平台内项目' : ''}
                            &nbsp;&nbsp; {item.dateFrom} ~ {item.dateTo}
                            &nbsp;&nbsp;&nbsp;(
                            {item.yearMonthWork})
                          </span>
                        </div>
                        <div>
                          <div>
                            <div
                              className={styles.pjLabel}
                              style={{ marginBottom: '2px', display: 'inline-block' }}
                            >
                              <span className={styles.label}>相关行业:</span>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: 180,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  verticalAlign: 'bottom',
                                }}
                              >
                                {item.industry}
                              </span>
                            </div>
                            <div
                              className={styles.pjLabel}
                              style={{ marginBottom: '2px', display: 'inline-block' }}
                            >
                              <span className={styles.label}>相关产品:</span>
                              {item.product}
                            </div>
                          </div>
                          <div>
                            <div
                              className={styles.pjLabel}
                              style={{ marginBottom: '2px', display: 'inline-block' }}
                            >
                              <span className={styles.label}>项目角色:</span>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: 180,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  verticalAlign: 'bottom',
                                }}
                              >
                                {item.projRole}
                              </span>
                            </div>
                            <div
                              className={styles.pjLabel}
                              style={{ marginBottom: '2px', display: 'inline-block' }}
                            >
                              <span className={styles.label}>所在公司:</span>
                              {item.company}
                            </div>
                          </div>
                          <div style={{ marginLeft: 52, marginBottom: '2px' }}>
                            <div
                              className={styles.label}
                              style={{
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'top',
                              }}
                            >
                              项目简介:
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                width: 'calc(100% - 120px)',
                                verticalAlign: 'top',
                              }}
                            >
                              <pre>{item.projIntro}</pre>
                            </div>
                          </div>
                          <div style={{ marginLeft: 40 }}>
                            <div
                              className={styles.label}
                              style={{
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'top',
                              }}
                            >
                              职责&业绩:
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                width: 'calc(100% - 120px)',
                                verticalAlign: 'top',
                              }}
                            >
                              <pre>{item.dutyAchv}</pre>
                            </div>
                          </div>
                          {item.platProjFlag === 'YES' && item.twEvalView ? (
                            <div style={{ marginLeft: 30 }}>
                              {/* <img width="30" src={pjSvgSelect} alt="" /> */}
                              <Rate disabled count={10} value={Number(item.synEvalScore) || 0} />
                              <Popover
                                placement="left"
                                content={<ProjContent twEvalView={item.twEvalView} />}
                                trigger="hover"
                              >
                                <span style={{ color: '#1890FF', cursor: 'pointer', fontSize: 14 }}>
                                  评价详情
                                </span>
                              </Popover>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {projectLimit < projectTotal ? (
                      <div
                        style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getProject`,
                            payload: {
                              id: { id },
                              portProjSelect: { limit: projectLimit + 10 },
                            },
                          });
                        }}
                      >
                        加载更多
                      </div>
                    ) : null}
                  </div>
                </Col>
                <Col
                  span={14}
                  style={{
                    display: taskVisible ? 'block' : 'none',
                    padding: 0,
                    borderLeft: '5px solid #F0F2F5',
                  }}
                >
                  <div className={styles.resPortrayalRight}>
                    <div style={{ padding: '20px 30px 36px', borderBottom: '5px solid #F0F2F5' }}>
                      <Input
                        style={{ width: 280 }}
                        placeholder="任务名称/事由/能力"
                        value={taskInput}
                        onChange={e =>
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: { taskInput: e.target.value },
                          })
                        }
                        onPressEnter={() => {
                          dispatch({
                            type: `${DOMAIN}/getTask`,
                            payload: {
                              id: { id },
                              taskSelect: { taskSelect: taskInput || void 0 },
                            },
                          });
                        }}
                      />
                      <Icon
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        type="search"
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getTask`,
                            payload: {
                              id: { id },
                              taskSelect: { taskSelect: taskInput || void 0 },
                            },
                          });
                        }}
                      />
                    </div>
                    {task.map(
                      item =>
                        item && (
                          <div className={styles.rightItem} key={item.id}>
                            <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
                              {/* <img
                                width="30"
                                src={rwSvgSelect}
                                style={{ verticalAlign: 'bottom' }}
                                alt=""
                              /> */}
                              &nbsp;&nbsp;
                              {item.taskName}
                            </div>
                            <div>
                              <div className={styles.pjLabel} style={{ marginBottom: '2px' }}>
                                <span className={styles.label} style={{ width: 90 }}>
                                  事由:
                                </span>
                                {item.reasonMerg}
                                &nbsp;&nbsp;&nbsp;
                                {/* <span>{item.reasonTypeName}</span> */}
                                &nbsp;&nbsp;
                                {item.reasonType === '01' &&
                                  item.twResProjLogView && (
                                    <Popover
                                      placement="left"
                                      content={
                                        <ProjViewContent twResProjLogView={item.twResProjLogView} />
                                      }
                                      trigger="hover"
                                    >
                                      <span
                                        style={{
                                          color: '#1890FF',
                                          cursor: 'pointer',
                                          fontSize: 14,
                                        }}
                                      >
                                        查看详情
                                      </span>
                                    </Popover>
                                  )}
                              </div>
                              <div className={styles.pjLabel} style={{ marginBottom: '2px' }}>
                                <span className={styles.label} style={{ width: 90 }}>
                                  复合能力:
                                </span>
                                {item.merge}
                              </div>
                              {item.twEvalView && (
                                <div style={{ marginLeft: 30 }}>
                                  {/* <img width="30" src={pjSvgSelect} alt="" /> */}
                                  <Rate
                                    disabled
                                    count={10}
                                    value={Number(item.synEvalScore) || 0}
                                  />
                                  <Popover
                                    placement="left"
                                    content={<TaskContent twEvalView={item.twEvalView} />}
                                    trigger="hover"
                                  >
                                    <span
                                      style={{ color: '#1890FF', cursor: 'pointer', fontSize: 14 }}
                                    >
                                      评价详情
                                    </span>
                                  </Popover>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                    )}
                    {taskLimit < taskTotal ? (
                      <div
                        style={{ textAlign: 'center', cursor: 'pointer', color: '#1890FF' }}
                        onClick={() => {
                          dispatch({
                            type: `${DOMAIN}/getTask`,
                            payload: {
                              id: { id },
                              taskSelect: { limit: taskLimit + 10 },
                            },
                          });
                        }}
                      >
                        加载更多
                      </div>
                    ) : null}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default ResPortrayal;
