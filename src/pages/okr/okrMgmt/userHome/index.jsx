import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import {
  Card,
  Row,
  Col,
  Icon,
  Divider,
  Tabs,
  Badge,
  Form,
  Avatar,
  Spin,
  Progress,
  Popover,
} from 'antd';
import { Chart, Geom, Axis, Tooltip, Coord } from 'bizcharts';
import { isNil } from 'ramda';
import GridContent from '@/components/layout/PageHeaderWrapper/GridContent';
import DataTable from '@/components/common/DataTable';
import { mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DescriptionList from '@/components/layout/DescriptionList';
import { getUrl, flowToRouter } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import CircleCharts from './component/CircleCharts';
import { add, div, mul } from '@/utils/mathUtils';
import styles from './Center.less';
import { readNotify } from '@/services/user/flow/flow';
import createMessage from '@/components/core/AlertMessage';
import ShortcutMenu from '@/components/common/Workbench/ShortcutMenu';
import { fromQs } from '@/utils/stringUtils';

import krIcon from '@/assets/img/bu_kr_icon.svg';
import okrIcon from '@/assets/img/bu_okr_icon.svg';
import workIcon from '@/assets/img/bu_work_icon.svg';
import { getType } from '@/services/user/equivalent/equivalent';

const { TabPane } = Tabs;
const DOMAIN = 'okrUserCenter';

@connect(({ dispatch, okrUserCenter, workPlanChnt, myReportList, loading }) => ({
  dispatch,
  okrUserCenter,
  workPlanChnt,
  myReportList,
  loading,
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
// @mountToTab()
class Center extends Component {
  componentDidMount() {
    const {
      dispatch,
      okrUserCenter: {
        formData: { windowScrollY },
      },
    } = this.props;

    // OKR目标列表
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    // 关键行动列表
    this.workPlan({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    // 工作报告列表
    this.myReport({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    /* 常用功能图标 */
    dispatch({ type: `${DOMAIN}/userHomeMyShortCut` });
    // 个人首页基础数据
    dispatch({ type: `${DOMAIN}/userHomeBaseData` });
    // 我的待办 - 提醒部分
    dispatch({
      type: `${DOMAIN}/userHomeTodoTasks`,
    });
    // 我的待办 - 流程部分
    dispatch({
      type: `${DOMAIN}/todo`,
      payload: {
        limit: 0,
        sortBy: 'startTime',
        sortDirection: 'DESC',
      },
    });
    // 我的退回
    dispatch({
      type: `${DOMAIN}/back`,
      payload: { limit: 0, sortBy: 'startTime', sortDirection: 'DESC' },
    });
    // 我的知会
    dispatch({
      type: `${DOMAIN}/notify`,
      payload: { limit: 100, sortBy: 'startTime', sortDirection: 'DESC', onlyShowUnRead: 1 },
    });
    // 消息通知
    dispatch({
      type: `${DOMAIN}/message`,
      payload: { sortBy: 'startTime', sortDirection: 'DESC' },
    });
    dispatch({
      type: `${DOMAIN}/messageCount`,
      payload: {},
    });

    window.addEventListener('scroll', () => this.handleScroll());
    if (windowScrollY) {
      window.scrollTo(0, windowScrollY);
    }
  }

  handleScroll = () => {
    const { dispatch } = this.props;
    if (window.scrollY) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { windowScrollY: window.scrollY },
      });
    }
  };

  // 关键行动
  workPlan = params => {
    const { dispatch } = this.props;
    dispatch({ type: `workPlanChnt/query`, payload: { ...params } });
  };

  // 我的报告(周报)
  myReport = params => {
    const { dispatch } = this.props;
    dispatch({ type: `myReportList/query`, payload: params });
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

  // 我的待办列表
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

  // OKR目标列表
  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  messageJumpLink = id => {
    router.push(`/user/center/message/detail?id=${id}`);
  };

  toOKRMgmt = (completeStatus, num) => {
    if (!num) {
      createMessage({ type: 'warn', description: '暂无可查看数据！' });
      return;
    }
    router.push(`/okr/okrMgmt/targetMgmt?completeStatus=${completeStatus}`);
  };

  toWorkPlanMgmt = (workPlanStatus, num) => {
    if (!num) {
      createMessage({ type: 'warn', description: '暂无可查看数据！' });
      return;
    }
    router.push(`/okr/okrMgmt/workPlanChnt?workPlanStatus=${workPlanStatus}`);
  };

  render() {
    const {
      loading,
      dispatch,
      okrUserCenter: {
        sysShortCuts,
        formData,
        todoList,
        todoTotalCount,
        userHomeTodoTasksList,
        activeTabKey,
        messageTotalCount,
        searchForm,
        list,
        total,
        twOkrObjectiveView,
        findOkrResWorkPlanByList,
        findOkrObjectByList,
        findOkrObjectScoreByList,
        backList,
        backTotalCount,
        notifyTotalCount,
        notifyList,
        msgTotalCount,
        msgList,
      },
      workPlanChnt: { list: workPlanList, total: workPlanTotal, searchForm: workPlanSearchForm },
      myReportList: {
        dataSource: myReportList,
        total: myReportTotal,
        searchForm: myReportSearchForm,
      },
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;

    const loadingShortcut = loading.effects[`${DOMAIN}/userHomeMyShortCut`];

    // OKR目标
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource: list.map(v => ({ ...v, children: null })),
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [],
      columns: [
        {
          title: '目标',
          dataIndex: 'objectiveName',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/targetMgmt/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '负责人',
          dataIndex: 'objectiveResName',
          align: 'center',
        },
        {
          title: '最近更新',
          dataIndex: 'modifyTime',
          align: 'center',
          sorter: true,
        },
        {
          title: '类型',
          dataIndex: 'objectiveTypeName',
          align: 'center',
        },
        {
          title: '当前进度',
          dataIndex: 'objectiveCurProg',
          align: 'center',
          sorter: true,
          render: value => (
            <Progress
              style={{ width: '80%' }}
              percent={Number(Number(value).toFixed(2)) || 0}
              status="active"
            />
          ),
        },
      ],
      leftButtons: [],
    };

    // 关键行动
    const workPlanTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`workPlanChnt/query`],
      total: workPlanTotal,
      dataSource: workPlanList,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      onChange: filters => this.workPlan(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `workPlanChnt/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm: workPlanSearchForm,
      searchBarForm: [],
      columns: [
        {
          title: '关键行动名称',
          dataIndex: 'taskName',
          width: 180,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/workPlanChnt/detail?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '执行人',
          dataIndex: 'planResName',
          className: 'text-center',
          width: 50,
        },
        {
          title: '日期范围',
          dataIndex: 'date',
          width: 100,
          render: (value, row, index) => `${row.dateFrom} ~ ${row.dateTo}`,
        },
        {
          title: '状态',
          dataIndex: 'planStatusName',
          width: 50,
          align: 'center',
        },
        {
          title: '目标',
          dataIndex: 'objectiveName',
          className: 'text-center',
          width: 200,
        },
        {
          title: '相关人员',
          width: 50,
          dataIndex: 'relevantResName',
          className: 'text-center',
        },
        {
          title: '优先级',
          dataIndex: 'priority',
          align: 'center',
          width: 50,
        },
      ],
      leftButtons: [],
    };

    // 周报
    const myReportTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`myReportList/query`],
      total: myReportTotal,
      dataSource: myReportList,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      onChange: filters => this.myReport(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `myReportList/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm: myReportSearchForm,
      searchBarForm: [],
      columns: [
        {
          title: '汇报给',
          dataIndex: 'reportToResIdName',
          width: '20%',
        },
        {
          title: '日期',
          dataIndex: 'dateStart',
          width: '20%',
          render: (value, row, index) => (value ? `${row.dateStart} ~ ${row.dateEnd}` : ''),
        },
        {
          title: '状态',
          dataIndex: 'reportStatusName',
          width: '10%',
        },
        {
          title: '报告类型',
          dataIndex: 'reportTypeName',
          width: '10%',
        },
        {
          title: '工作总结',
          dataIndex: 'workSummary',
          width: '30%',
        },
        {
          title: '详情',
          dataIndex: 'multiDetail',
          render: (value, rowData) => {
            const { id } = rowData;
            // const reportSource = false;
            const href = `/user/weeklyReport/workReportDetail?id=${id}&reportSource=${false}`;
            return (
              <Link className="tw-link" to={href}>
                报告详情
              </Link>
            );
          },
        },
      ],
      leftButtons: [],
    };

    return (
      <GridContent className={styles.okrUserCenter}>
        <Row gutter={16} type="flex" align="middle" justify="center">
          <Col lg={8} md={24}>
            <Card style={{ height: '220px' }} bordered={false} className={styles.userinfocard}>
              <div className={styles.userinfo}>
                <Row gutter={26}>
                  <Col span={12}>
                    <div
                      className={styles.avatarHolder}
                      style={{ float: 'right', marginTop: '30px' }}
                    >
                      <Avatar
                        style={{ width: '120px', height: '120px' }}
                        alt="员工照片"
                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.avatarHolder} style={{ float: 'left' }}>
                      <img src="/cameo.svg" alt="avatar" />
                      <div className={styles.name}>{formData.resName || '登录人'}</div>
                      <span className={styles.level}>{formData.buName || '所属组织'}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col lg={16} md={24}>
            <Card
              className="tw-card-adjust"
              bordered={false}
              style={{
                height: '220px',
                paddingTop: '20px',
              }}
            >
              <ShortcutMenu currentPage="/okr/okrMgmt/userHome" />
            </Card>
          </Col>
        </Row>

        <br />

        <Card bordered={false}>
          <Row gutter={16}>
            <Col lg={10} md={24}>
              <Card style={{ height: '360px', border: '2px solid #F5F5F5' }} bordered={false}>
                <DescriptionList title="当前目标" size="large" col={2} />
                <div style={{ marginBottom: '40px' }}>
                  <div className={styles.taskMonthTitle}>当前目标</div>
                  <div
                    className={styles.taskMonth}
                    onClick={() => this.toOKRMgmt('MYOBJ', twOkrObjectiveView.objectSum || 0)}
                  >
                    <div>目标总数</div>
                    <div className={styles.num}>{twOkrObjectiveView.objectSum || 0}</div>
                    <Progress
                      percent={mul(
                        div(twOkrObjectiveView.objectSum || 0, twOkrObjectiveView.objectSum || 0),
                        100
                      )}
                      status="active"
                      showInfo={false}
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toOKRMgmt('COMPLETE', twOkrObjectiveView.objectCompleted || 0)
                    }
                  >
                    <div>已完成</div>
                    <div className={styles.num}>{twOkrObjectiveView.objectCompleted || 0}</div>
                    <Progress
                      percent={mul(
                        div(
                          twOkrObjectiveView.objectCompleted || 0,
                          twOkrObjectiveView.objectSum || 0
                        ),
                        100
                      )}
                      status="active"
                      showInfo={false}
                      strokeColor="#AED88B"
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toOKRMgmt('PROG', twOkrObjectiveView.objectNoCompleted || 0)
                    }
                  >
                    <div>未完成</div>
                    <div className={styles.num}>{twOkrObjectiveView.objectNoCompleted || 0}</div>
                    <Progress
                      percent={mul(
                        div(
                          twOkrObjectiveView.objectNoCompleted || 0,
                          twOkrObjectiveView.objectSum || 0
                        ),
                        100
                      )}
                      status="active"
                      showInfo={false}
                      strokeColor="#F18A7D"
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() => this.toOKRMgmt('OVERDUE', twOkrObjectiveView.objectOverdue || 0)}
                  >
                    <div>已逾期</div>
                    <div className={styles.num}>{twOkrObjectiveView.objectOverdue || 0}</div>
                    <Progress
                      percent={mul(
                        div(
                          twOkrObjectiveView.objectOverdue || 0,
                          twOkrObjectiveView.objectSum || 0
                        ),
                        100
                      )}
                      status="exception"
                      showInfo={false}
                    />
                  </div>
                </div>
                <br />
                <br />
                <Divider dashed />
                <div>
                  <div className={styles.taskMonthTitle}>关键行动</div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toWorkPlanMgmt('MYWORKPLAN', findOkrResWorkPlanByList.workPlanSum || 0)
                    }
                  >
                    <div>总数</div>
                    <div className={styles.num}>{findOkrResWorkPlanByList.workPlanSum || 0}</div>
                    <Progress
                      percent={mul(
                        div(
                          findOkrResWorkPlanByList.workPlanSum || 0,
                          findOkrResWorkPlanByList.workPlanSum || 0
                        ),
                        100
                      )}
                      status="active"
                      showInfo={false}
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toWorkPlanMgmt(
                        'FINISHED',
                        findOkrResWorkPlanByList.workPlanCompleted || 0
                      )
                    }
                  >
                    <div>已完成</div>
                    <div className={styles.num}>
                      {findOkrResWorkPlanByList.workPlanCompleted || 0}
                    </div>
                    <Progress
                      percent={mul(
                        div(
                          findOkrResWorkPlanByList.workPlanCompleted || 0,
                          findOkrResWorkPlanByList.workPlanSum || 0
                        ),
                        100
                      )}
                      status="active"
                      showInfo={false}
                      strokeColor="#AED88B"
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toWorkPlanMgmt('PLAN', findOkrResWorkPlanByList.workPlanNoCompleted || 0)
                    }
                  >
                    <div>未完成</div>
                    <div className={styles.num}>
                      {findOkrResWorkPlanByList.workPlanNoCompleted || 0}
                    </div>
                    <Progress
                      percent={mul(
                        div(
                          findOkrResWorkPlanByList.workPlanNoCompleted || 0,
                          findOkrResWorkPlanByList.workPlanSum || 0
                        ),
                        100
                      )}
                      status="active"
                      showInfo={false}
                      strokeColor="#F18A7D"
                    />
                  </div>
                  <div
                    className={styles.taskMonth}
                    onClick={() =>
                      this.toWorkPlanMgmt('OVERDUE', findOkrResWorkPlanByList.workPlanOverdue || 0)
                    }
                  >
                    <div>已逾期</div>
                    <div className={styles.num}>
                      {findOkrResWorkPlanByList.workPlanOverdue || 0}
                    </div>
                    <Progress
                      percent={mul(
                        div(
                          findOkrResWorkPlanByList.workPlanOverdue || 0,
                          findOkrResWorkPlanByList.workPlanSum || 0
                        ),
                        100
                      )}
                      status="exception"
                      showInfo={false}
                    />
                  </div>
                </div>
              </Card>
            </Col>

            <Col lg={14} md={24}>
              <Card bordered={false} className={styles.todocard}>
                <Tabs
                  activeKey={activeTabKey}
                  onTabClick={activeKey =>
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: { activeTabKey: activeKey },
                    })
                  }
                >
                  <TabPane
                    tab={
                      <Badge count={todoTotalCount || 0} offset={[5, -3]}>
                        我的待办
                      </Badge>
                    }
                    key="1"
                  >
                    <ul className={styles.scroll} style={{ height: '300px', overflowY: 'scroll' }}>
                      {todoList.length > 0
                        ? todoList.map(v => (
                            // eslint-disable-next-line react/jsx-indent
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
                          ))
                        : null}
                      {!todoList.length > 0 ? (
                        <li>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p>暂无数据</p>
                            <span>-无-</span>
                          </div>
                        </li>
                      ) : null}
                    </ul>
                  </TabPane>
                  <TabPane
                    tab={
                      <Badge count={backTotalCount || 0} offset={[5, -3]}>
                        我的退回
                      </Badge>
                    }
                    key="2"
                  >
                    <ul className={styles.scroll} style={{ height: '300px', overflowY: 'scroll' }}>
                      {backList.length > 0
                        ? backList.map(v => (
                            // eslint-disable-next-line react/jsx-indent
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
                          ))
                        : null}
                      {!backList.length > 0 ? (
                        <li>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p>暂无数据</p>
                            <span>-无-</span>
                          </div>
                        </li>
                      ) : null}
                    </ul>
                  </TabPane>
                  <TabPane
                    tab={
                      <Badge count={notifyTotalCount} offset={[5, -3]}>
                        我的知会
                      </Badge>
                    }
                    key="3"
                  >
                    <ul className={styles.message}>
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
                      {!notifyList.length > 0 ? (
                        <li>
                          <div className={styles.item}>
                            <Icon type="file-text" />
                            <p>暂无数据</p>
                            <span>-无-</span>
                          </div>
                        </li>
                      ) : null}
                    </ul>
                  </TabPane>
                  <TabPane
                    tab={
                      <Badge
                        count={(msgList.length || 0) + (userHomeTodoTasksList.length || 0)}
                        offset={[5, -3]}
                      >
                        消息通知
                      </Badge>
                    }
                    key="5"
                  >
                    <ul className={styles.message}>
                      {msgList &&
                        msgList.map(v => (
                          <li key={Math.random()}>
                            <div className={styles.item}>
                              <Icon
                                type="file-text"
                                className={v.isRead === 1 ? styles.read : ''}
                              />
                              <p
                                onClick={() => this.messageJumpLink(v.noticeId)}
                                className={v.isRead === 1 ? styles.read : ''}
                              >
                                <span className={styles.messageTitle}>{v.releaseTitle}</span>
                                {v.releaseLevel === 'URGENCY' || v.releaseLevel === 'IMPORTANT' ? (
                                  <span className={styles.messageTag}>{v.releaseLevelName}</span>
                                ) : (
                                  ''
                                )}
                              </p>
                              <span className={v.isRead === 1 ? styles.read : ''}>
                                {formatDT(v.releaseTime)}
                              </span>
                            </div>
                            <div
                              className={
                                v.isRead === 1
                                  ? `${styles.read} ${styles.itemInfo}`
                                  : styles.itemInfo
                              }
                            >
                              {v.releaseTypeName}
                              <span>|</span>
                              发布来源:
                              {v.releaseSource}
                            </div>
                          </li>
                        ))}
                      {userHomeTodoTasksList.length > 0
                        ? userHomeTodoTasksList.map((v, i) => (
                            // eslint-disable-next-line react/jsx-indent
                            <Popover
                              content={v.title}
                              key={'userHomeTodoTasksList' + Math.random()}
                            >
                              <li
                                onClick={() => {
                                  router.push(v.url);
                                }}
                              >
                                <div className={styles.item}>
                                  <Icon type="file-text" />
                                  <p className={styles.linkTo}>{v.title}</p>
                                </div>
                              </li>
                            </Popover>
                          ))
                        : null}
                    </ul>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </Card>

        <br />

        <Card bordered={false}>
          <Spin
            spinning={loading.effects[`${DOMAIN}/userHomeBaseData`]}
            style={{ backgroundColor: 'white' }}
          >
            <Row gutter={16}>
              <Col lg={6} md={24}>
                <Card style={{ height: '320px', border: '2px solid #F5F5F5' }} bordered={false}>
                  <DescriptionList title="目标进度" size="large" col={2} />
                  <div style={{ width: '100%' }}>
                    <Chart
                      height={80}
                      data={findOkrObjectByList}
                      padding={[0, 30, 15, 80]}
                      forceFit
                    >
                      <Coord transpose scale={[1, -1]} />
                      <Axis name="objectYpercent" />
                      <Axis name="aboveRate" position="right" />
                      <Tooltip />
                      <Geom
                        type="interval"
                        position="objectYpercent*aboveRate"
                        tooltip={[
                          'objectYpercent*aboveRate',
                          (objectYpercent, aboveRate) => ({
                            // 自定义 tooltip 上显示的 title 显示内容等。
                            name: objectYpercent,
                            title: '目标进度',
                            value: aboveRate,
                          }),
                        ]}
                      />
                    </Chart>
                  </div>
                  <Divider dashed />
                  <DescriptionList title="评分" size="large" col={2} />
                  <div style={{ width: '100%' }}>
                    <Chart
                      height={80}
                      data={findOkrObjectScoreByList}
                      padding={[0, 30, 25, 80]}
                      forceFit
                    >
                      <Coord transpose scale={[1, -1]} />
                      <Axis name="objectScorY" />
                      <Axis name="objectScorCountX" position="right" />
                      <Tooltip />
                      <Geom
                        type="interval"
                        position="objectScorY*objectScorCountX"
                        tooltip={[
                          'objectScorY*objectScorCountX',
                          (objectScorY, objectScorCountX) => ({
                            // 自定义 tooltip 上显示的 title 显示内容等。
                            name: objectScorY,
                            title: '评分',
                            value: objectScorCountX,
                          }),
                        ]}
                      />
                    </Chart>
                  </div>
                </Card>
              </Col>

              <Col lg={18} md={24}>
                <Card title="OKR指标完成情况" style={{ height: '300px' }} bordered={false}>
                  <Row gutter={16} type="flex" justify="center" align="middle">
                    <Col lg={8} md={24} style={{ textAlign: 'center' }}>
                      {twOkrObjectiveView.objectCompleted ||
                      twOkrObjectiveView.objectNoCompleted ? (
                        <CircleCharts
                          title="目标"
                          data={[
                            {
                              item: '完成',
                              count: twOkrObjectiveView.objectCompleted || 0,
                            },
                            {
                              item: '未完成',
                              count: twOkrObjectiveView.objectNoCompleted || 0,
                            },
                          ]}
                        />
                      ) : (
                        '目标达成情况暂无数据'
                      )}
                    </Col>
                    <Col lg={8} md={24} style={{ textAlign: 'center' }}>
                      {findOkrResWorkPlanByList.workPlanCompleted ||
                      findOkrResWorkPlanByList.workPlanNoCompleted ? (
                        <CircleCharts
                          title="关键行动"
                          data={[
                            {
                              item: '完成',
                              count: findOkrResWorkPlanByList.workPlanCompleted || 0,
                            },
                            {
                              item: '未完成',
                              count: findOkrResWorkPlanByList.workPlanNoCompleted || 0,
                            },
                          ]}
                        />
                      ) : (
                        '关键行动执行率暂无数据'
                      )}
                    </Col>
                    <Col lg={8} md={24} style={{ textAlign: 'center' }}>
                      {findOkrObjectScoreByList.reduce(
                        (x, y) => add(x.objectScorCountX || 0, y.objectScorCountX || 0),
                        0
                      )
                        ? findOkrObjectScoreByList && (
                            // eslint-disable-next-line react/jsx-indent
                            <CircleCharts
                              title="评分"
                              data={findOkrObjectScoreByList.map(v => ({
                                item: v.objectScorY,
                                count: v.objectScorCountX,
                              }))}
                            />
                          )
                        : '整体评分暂无数据'}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Spin>
        </Card>

        <br />

        <Card bodyStyle={{ padding: 15 }} bordered={false}>
          <Tabs
            tabBarStyle={{ marginBottom: 0 }}
            defaultActiveKey="1"
            activeKey={formData.activeTab}
            onChange={e => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: { activeTab: e },
              });
            }}
          >
            <TabPane
              tab={
                <span className={styles.tabName}>
                  <img src={okrIcon} alt="okr" />
                  OKR
                </span>
              }
              key="1"
            >
              <DataTable {...tableProps} />
            </TabPane>
            <TabPane
              tab={
                <span className={styles.tabName}>
                  <img src={krIcon} alt="kr" />
                  关键行动
                </span>
              }
              key="2"
            >
              <DataTable {...workPlanTableProps} />
            </TabPane>
            <TabPane
              tab={
                <span className={styles.tabName}>
                  <img src={workIcon} alt="work" />
                  周报
                </span>
              }
              key="3"
            >
              <DataTable {...myReportTableProps} />
            </TabPane>
          </Tabs>
        </Card>
      </GridContent>
    );
  }
}

export default Center;
