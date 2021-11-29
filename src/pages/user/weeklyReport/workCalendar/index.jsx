import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classNames from 'classnames';
import router from 'umi/router';
import { Tooltip, Card, Row, Col, DatePicker, Button, Modal, Icon } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import { Selection } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { mountToTab } from '@/layouts/routerControl';
import { selectBuMember } from '@/services/gen/list';

import styles from './index.less';

const { Description } = DescriptionList;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const defaultStartDate = moment().startOf('isoWeek');
const defaultEndDate = moment()
  .add(4, 'w')
  .startOf('isoWeek');

@connect(({ workCalendar }) => ({
  workCalendar,
}))
@mountToTab()
class WorkCalendance extends PureComponent {
  componentDidMount() {
    // 在没有fresh的时候刷新日历默认话时间有fresh的时候可以刷新数据但是不能够初始化日期
    const { _refresh, resId = '' } = fromQs();
    if (_refresh) {
      this.getWorkCalendarInfo();
    } else {
      this.initDateData(resId);
    }
  }

  initDateData = id => {
    const { dispatch } = this.props;
    const planStartDate = moment()
      .startOf('isoWeek')
      .format('YYYY-MM-DD');
    const planEndDate = moment(defaultEndDate)
      .endOf('isoWeek')
      .format('YYYY-MM-DD');
    dispatch({
      type: 'workCalendar/updateState',
      payload: {
        weekStartDate: defaultStartDate,
        weekEndDate: defaultEndDate,
        planStartDate,
        planEndDate,
        cellSelectedBox: [],
      },
    });
    dispatch({
      type: 'workCalendar/query',
      payload: {
        planStartDate,
        planEndDate,
        resId: id,
      },
    });
  };

  getWorkCalendarInfo = () => {
    const {
      dispatch,
      workCalendar: { planStartDate = '', planEndDate = '', resId = '' },
    } = this.props;
    dispatch({
      type: 'workCalendar/query',
      payload: {
        planStartDate,
        planEndDate,
        resId,
      },
    });
    dispatch({
      type: 'workCalendar/updateState',
      payload: {
        cellSelectedBox: [],
      },
    });
  };

  workStatusChange = val => {
    const {
      dispatch,
      workCalendar: { resId = '' },
    } = this.props;
    dispatch({
      type: 'workCalendar/updateWorkStatus',
      payload: {
        workStatus: val,
        resId,
      },
    });
  };

  fetchDateRange = val => {
    const { dispatch } = this.props;
    const startVal = val[0];
    const endVal = val[1];
    const weekStart = moment(startVal)
      .startOf('isoWeek')
      .format('YYYY-MM-DD');
    const weekEnd = moment(endVal)
      .endOf('isoWeek')
      .format('YYYY-MM-DD');
    const weekStartDate = moment(startVal);
    const weekEndDate = moment(endVal);
    dispatch({
      type: 'workCalendar/updateState',
      payload: {
        weekStartDate,
        weekEndDate,
        planStartDate: weekStart,
        planEndDate: weekEnd,
      },
    });
  };

  addPlan = () => {
    const {
      workCalendar: { cellSelectedBox = [], resId = '' },
    } = this.props;
    const urls = getUrl();
    const from = stringify({ from: urls });
    if (cellSelectedBox.length === 0) {
      router.push(
        `/user/weeklyReport/workPlan/edit?fromFlag=ALL&fromPage=calendar&${from}&buResId=${resId}`
      );
    } else if (cellSelectedBox.length === 1) {
      router.push(
        `/user/weeklyReport/workPlan/edit?fromFlag=ALL&dateFrom=${cellSelectedBox[0]}&dateTo=${
          cellSelectedBox[0]
        }&fromPage=calendar&${from}&buResId=${resId}`
      );
    } else {
      const maxDate = cellSelectedBox
        .reduce((x, y) => moment.max(moment(x), moment(y)))
        .format('YYYY-MM-DD');

      const minDate = cellSelectedBox
        .reduce((x, y) => moment.min(moment(x), moment(y)))
        .format('YYYY-MM-DD');
      router.push(
        `/user/weeklyReport/workPlan/edit?fromFlag=ALL&dateFrom=${minDate}&dateTo=${maxDate}&fromPage=calendar&${from}&buResId=${resId}`
      );
    }
  };

  modifyPlanHandle = (id, type) => {
    const urls = getUrl();
    const from = stringify({ from: urls });
    router.push(
      `/user/weeklyReport/workPlan/edit?id=${id}&fromFlag=${type}&fromPage=calendar&${from}`
    );
  };

  deletePlanHandle = (id, name) => {
    const { dispatch } = this.props;
    const idArr = [id].join(',');
    confirm({
      title: '确认删除?',
      content: `确认删除${name}任务吗?`,
      onOk() {
        dispatch({
          type: 'workCalendar/delete',
          payload: {
            ids: idArr,
          },
        });
      },
      onCancel() {},
    });
  };

  cellSelectedHandle = date => {
    const {
      workCalendar: { cellSelectedBox = [] },
      dispatch,
    } = this.props;

    const selectedOrUnSelected = cellSelectedBox.indexOf(date);
    if (selectedOrUnSelected === -1) {
      cellSelectedBox.push(date);
    } else {
      cellSelectedBox.splice(selectedOrUnSelected, 1);
    }
    dispatch({
      type: 'workCalendar/updateState',
      payload: {
        cellSelectedBox,
      },
    });
  };

  handleChange = v => {
    const { dispatch } = this.props;
    dispatch({
      type: 'workCalendar/updateState',
      payload: {
        resId: v,
      },
    });
  };

  render() {
    const {
      workCalendar: {
        workCalendarData = {},
        workStatus,
        cleanWorkCalender = [],
        cellSelectedBox = [],
        weekStartDate = '',
        weekEndDate = '',
        resId = '',
      },
    } = this.props;
    const {
      buName = '',
      resNo = '',
      foreignName = '',
      personName = '',
      baseCityDesc = '',
      resType1Desc = '',
      resType2Desc = '',
    } = workCalendarData;
    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="工作日历" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="资源">
              {resNo}-{foreignName}-{personName}
            </Description>
            <Description term="BaseBU/Base地">
              {buName}
              {buName && baseCityDesc ? '/' : ''}
              {baseCityDesc}
            </Description>
            <Description term="资源类型">
              {resType1Desc}
              {resType2Desc && resType1Desc ? '-' : ''}
              {resType2Desc}
            </Description>
            <Description term="工作状态">
              <Selection.UDC
                allowClear={false}
                className={styles['select-box']}
                code="RES:WORK_STATUS"
                placeholder="请选择工作状态"
                value={workStatus}
                onChange={val => {
                  this.workStatusChange(val);
                }}
              />
            </Description>
          </DescriptionList>
        </Card>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <Row type="flex" justify="start" align="middle">
            <Col span={1}>期间</Col>
            <RangePicker
              className={styles['calendar-styles']}
              allowClear={false}
              value={[weekStartDate, weekEndDate]}
              disabledDate={current =>
                moment(current).format('YYYY-MM-DD') !==
                moment(current)
                  .startOf('isoWeek')
                  .format('YYYY-MM-DD')
              }
              onChange={value => value && this.fetchDateRange(value)}
            />
            <Col span={1} />
            <Col span={1}>资源</Col>
            <Selection
              className={styles['calendar-styles']}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              source={selectBuMember}
              value={resId}
              placeholder="请选择资源"
              onChange={v => this.handleChange(v)}
            />
          </Row>
        </Card>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <div className={styles['example-wrap']}>
            <Button
              icon="search"
              type="primary"
              className="tw-btn-primary"
              onClick={() => {
                this.getWorkCalendarInfo();
              }}
            >
              查询
            </Button>
            <Button
              icon="plus-circle"
              type="primary"
              className="tw-btn-primary"
              onClick={() => {
                this.addPlan();
              }}
            >
              添加计划
            </Button>
            图例:
            <span className={styles['example-finish']}>已完成</span>
            <span className={styles['example-plan']}>工作计划</span>
            <span className={styles['example-vacation']}>休假</span>
          </div>
          <div className={styles['calendar-box']}>
            <Row
              type="flex"
              justify="start"
              align="middle"
              className={styles['calendar-title']}
              span={8}
            >
              <Col span={3}>年周</Col>
              <Col span={3}>周一</Col>
              <Col span={3}>周二</Col>
              <Col span={3}>周三</Col>
              <Col span={3}>周四</Col>
              <Col span={3}>周五</Col>
              <Col span={3}>周六</Col>
              <Col span={3}>周日</Col>
            </Row>
            {cleanWorkCalender.map((item, index) => (
              <div className={styles['calendar-content']} key={Math.random()}>
                <Row type="flex" justify="start" align="middle" className={styles['week-title']}>
                  <Col span={3} className={styles['year-week']}>
                    {item.yearWeek}
                  </Col>
                  <Col span={21} className={styles['week-info']}>
                    {item.planItemVies.map((pItem, pIndex) => (
                      <div className={styles['pro-color']} key={Math.random()}>
                        <span className={styles['pro-title']}>
                          {pIndex === 0 ? '项目规划:' : ''}
                        </span>
                        {pItem.projName}({pItem.projdays}
                        天)
                      </div>
                    ))}
                    {item.businessVies.map((oItem, oIndex) => (
                      <div className={styles['opp-color']} key={Math.random()}>
                        <span className={styles['opp-title']}>
                          {oIndex === 0 ? '商机规划:' : ''}
                        </span>
                        {oItem.oppoName}({oItem.oppodays}
                        天)
                      </div>
                    ))}
                    {item.taskViews.map((tItem, tIndex) => (
                      <div className={styles['task-color']} key={Math.random()}>
                        <span className={styles['task-title']}>
                          {tIndex === 0 ? '处理中的任务包:' : ''}
                        </span>
                        {tItem.taskName}({tItem.planStartDate}-{tItem.planEndDate})
                      </div>
                    ))}
                  </Col>
                </Row>
                <Row
                  key={Math.random()}
                  type="flex"
                  justify="start"
                  align="top"
                  className={styles['week-content']}
                  // span={8}
                >
                  <Col span={3} className={styles['date-plan-left-cell']} />
                  {item.dayPlan.map((dateItem, dateIndex) => (
                    <Col
                      span={3}
                      key={Math.random()}
                      className={
                        cellSelectedBox.indexOf(dateItem.yearDate) > -1
                          ? styles['cell-selected']
                          : ''
                      }
                      onClick={() => {
                        this.cellSelectedHandle(dateItem.yearDate);
                      }}
                    >
                      <div className={styles['date-info']}>{dateItem.date}</div>
                      <div className={styles['date-line']} />
                      <div className={styles['date-plan-info']}>
                        {dateItem.dayPlanInfo.map((workPlanItem, workPlanIndex) => (
                          <div
                            key={Math.random()}
                            className={classNames(
                              styles[workPlanItem.className],
                              workPlanItem.isStart ? styles['plan-left-styles'] : '',
                              workPlanItem.isEnd ? styles['plan-right-styles'] : ''
                            )}
                          >
                            {workPlanItem.isStart || workPlanItem.needName ? (
                              // 有备注就显示 备注分为备注1和备注2
                              <Tooltip
                                title={`${workPlanItem.planNo || ''} ${workPlanItem.planName ||
                                  ''} ${workPlanItem.remark1 || workPlanItem.remark2 ? '(' : ''} ${
                                  workPlanItem.remark1 ? '备注1:' : ''
                                } ${workPlanItem.remark1 || ''}  ${
                                  workPlanItem.remark2 ? '备注2:' : ''
                                } ${workPlanItem.remark2 || ''} ${
                                  workPlanItem.remark1 || workPlanItem.remark2 ? ')' : ''
                                }`}
                              >
                                {workPlanItem.planNo || ''} {workPlanItem.planName || ''}{' '}
                                {workPlanItem.remark1 || workPlanItem.remark2 ? '(' : ''}{' '}
                                {workPlanItem.remark1 ? '备注1:' : ''} {workPlanItem.remark1 || ''}{' '}
                                {workPlanItem.remark2 ? '备注2:' : ''} {workPlanItem.remark2 || ''}{' '}
                                {workPlanItem.remark1 || workPlanItem.remark2 ? ')' : ''}
                              </Tooltip>
                            ) : (
                              ''
                            )}

                            {workPlanItem.isEnd ? (
                              <span className={styles['plan-handle']}>
                                <Icon
                                  type="delete"
                                  style={{ fontSize: '14px', color: '#284488' }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.deletePlanHandle(workPlanItem.id, workPlanItem.planName);
                                  }}
                                >
                                  删除
                                </Icon>
                                <Icon
                                  type="form"
                                  style={{ fontSize: '14px', color: '#284488' }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.modifyPlanHandle(workPlanItem.id, workPlanItem.planType);
                                  }}
                                >
                                  修改
                                </Icon>
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        ))}
                        {dateItem.leavePlanInfo.map(leavePlanItem => (
                          <div
                            key={Math.random()}
                            className={classNames(
                              styles[leavePlanItem.className],
                              styles['plan-left-styles'],
                              styles['plan-right-styles']
                            )}
                          >
                            {leavePlanItem.vdays ? (
                              <span>
                                已请假(
                                {leavePlanItem.vdays}
                                天)
                              </span>
                            ) : (
                              <></>
                            )}
                          </div>
                        ))}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkCalendance;
