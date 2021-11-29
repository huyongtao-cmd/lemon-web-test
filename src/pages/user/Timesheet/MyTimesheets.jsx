// 我的工时
import React, { PureComponent } from 'react';
import { Calendar, Card } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { createAlert } from '@/components/core/Confirm';
import { TagOpt } from '@/utils/tempUtils';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

import styles from './MyTimesheet.less';

const DOMAIN = 'userMyTimesheet';
const tuli = ['CREATE', 'APPROVING', 'APPROVED', 'SETTLED', 'REJECTED'];
@connect(({ loading, dispatch, userMyTimesheet }) => ({
  loading,
  dispatch,
  userMyTimesheet,
}))
@injectUdc(
  {
    notaskUdc: 'TSK:TIMESHEET_NOTASK', // 无任务的活动
  },
  DOMAIN
)
@mountToTab()
class UserMyTimesheet extends PureComponent {
  componentDidMount() {
    this.fetchData(moment());
  }

  fetchData = value => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { date: value } });
  };

  onChange = value => {
    this.fetchData(value);
  };

  getListData = value => {
    const {
      userMyTimesheet: { dataSource },
    } = this.props;
    const { _udcMap = {} } = this.state;
    const { notaskUdc = [] } = _udcMap;
    let listData = [];
    // moment(exp).diff(moment(), 'days') 天数 exp > now
    // 找到当前日期对应的工时，并封装
    listData = dataSource
      .filter(item => moment(item.workDate).isSame(moment(value).format('YYYY-MM-DD')))
      .map(v => {
        // 项目名称
        const projectName = v.projName ? v.projName.substr(0, 6) : null;
        // 活动名称
        let actName = null;
        if (v.actId && v.taskId) {
          // 有任务包时，选择的活动
          // 获取任务包
          const timesheetViews =
            v.actId && v.taskId && v.timesheetViews
              ? v.timesheetViews.filter(item => item.id === v.taskId)[0] || {}
              : null;
          // 获取活动
          const resActivities =
            v.actId && timesheetViews && timesheetViews.resActivities
              ? timesheetViews.resActivities.filter(i => i.id === v.actId)[0] || {}
              : null;
          // 获取活动名
          actName = v.actId && resActivities ? resActivities.actName : v.tsActIdenDesc;
          if (!actName && v.tsTaskIden === 'NOTASK' && notaskUdc.length) {
            actName = notaskUdc.filter(i => i.code === v.tsActIden);
            actName = actName.length ? actName[0].name : null;
          }
        } else {
          // 无任务包时，选择的活动
          actName = v.tsActIdenDesc;
          if (v.tsActIden && !v.tsActIdenDesc && notaskUdc.length) {
            const { name = null } = notaskUdc.filter(i => i.code === v.tsActIden)[0] || {};
            actName = name;
          }
        }

        return {
          id: v.id,
          code: v.tsStatus,
          name:
            (projectName || '无项目') +
            '|' +
            (v.workHour || 0) +
            '|' +
            (v.apprResName || v.tsResName) +
            '|' +
            (actName || '无'),
          apprResult: v.apprResult,
        };
      });
    return listData || [];
  };

  dateCellRender = value => {
    const listData = this.getListData(value);

    return (
      <ul className={styles.events}>
        {listData.map(item => (
          <li key={item.id} title={item.name}>
            <TagOpt
              value={item.code}
              opts={[
                { code: 'CREATE', name: item.name },
                { code: 'APPROVING', name: item.name },
                { code: 'APPROVED', name: item.name },
                { code: 'SETTLED', name: item.name },
                { code: 'REJECTED', name: item.name },
              ]}
              palette="blue|orange|cyan|green|red"
            />
          </li>
        ))}
      </ul>
    );
  };

  getMonthData = value => {
    const {
      userMyTimesheet: { dataSource },
    } = this.props;

    const date = dataSource.filter(item => moment(item.workDate).month() === value.month());
    return date.length;
  };

  monthCellRender = value => {
    const num = this.getMonthData(value);
    return num ? (
      <div className={styles['notes-month']}>
        <section>{num}</section>
        {/* <span></span> */}
      </div>
    ) : null;
  };

  handleSelect = value => {
    const listData = this.getListData(value);
    if (listData[0] && listData[0].code === 'REJECTED') {
      const { apprResult } = listData[0];
      const apprRes = apprResult ? apprResult.replace(/^"|"$/g, '') : '无退回意见';
      createMessage({ type: 'warn', description: apprRes });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userMyTimesheet: { date },
    } = this.props;
    const { _udcMap = {} } = this.state;
    const { notaskUdc = [] } = _udcMap;
    return (
      <PageHeaderWrapper title="我的工时">
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="app.settings.menuMap.myTimesheet" defaultMessage="我的工时" />
          }
          bordered={false}
        >
          <div>
            <span>图例：</span>
            {tuli.map(item => (
              <TagOpt
                key={item}
                value={item}
                opts={[
                  { code: 'CREATE', name: '填写' },
                  { code: 'APPROVING', name: '审批中' },
                  { code: 'APPROVED', name: '已审批' },
                  { code: 'SETTLED', name: '已结算' },
                  { code: 'REJECTED', name: '已退回' },
                ]}
                palette="blue|orange|cyan|green|red"
              />
            ))}
          </div>
          {notaskUdc && !loading.effects[`${DOMAIN}/query`] ? (
            <div className={styles['my-calendar']}>
              <Calendar
                value={date}
                onPanelChange={this.onChange} // 样式隐藏年月按钮，onPanelChange可只关注于年月下拉
                // onPanelChange={value => {
                //   dispatch({ type: `${DOMAIN}/updateState`, payload: { date: value } });
                // }}
                dateCellRender={this.dateCellRender}
                monthCellRender={this.monthCellRender}
                onSelect={this.handleSelect}
              />
            </div>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UserMyTimesheet;
