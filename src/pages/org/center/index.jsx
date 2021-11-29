import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Icon, Progress, Tabs, Spin, Form, Cascader, Checkbox, Button } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { selectBuMember } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import ShortcutMenu from '@/components/common/Workbench/ShortcutMenu';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import rankIcon from '@/assets/img/bu_rank_icon.svg';
import krIcon from '@/assets/img/bu_kr_icon.svg';
import okrIcon from '@/assets/img/bu_okr_icon.svg';
import testIcon from '@/assets/img/bu_test_icon.svg';
import workIcon from '@/assets/img/bu_work_icon.svg';
import buCalendarIcon from '@/assets/img/bu_calendar_icon.svg';
import CircleCharts from '../../okr/okrMgmt/userHome/component/CircleCharts';
import OkrStatus from './components/OkrStatus';
import RankTable from './components/RankTable';
import Calendar from './components/Calendar';
import WorkTable from './components/WorkTable';
import styles from './index.less';

const { TabPane } = Tabs;
const { Field } = FieldList;
const DOMAIN = 'orgCenter';

@connect(({ loading, dispatch, orgCenter, buWorkCalendar, orgCenterWorkTable }) => ({
  loading,
  dispatch,
  orgCenter,
  buWorkCalendar,
  orgCenterWorkTable,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
      props.dispatch({ type: `${DOMAIN}/queryOkrInfo` });
    }
  },
})
// @mountToTab()
class OrgCenter extends PureComponent {
  state = {
    selectAllBu: false,
    readStatus: 'READ',
  };

  componentDidMount() {
    const {
      dispatch,
      orgCenter: { windowScrollY },
    } = this.props;
    const { _refresh } = fromQs();
    if (!_refresh) {
      this.fetchData();
    }
    window.addEventListener('scroll', () => this.handleScroll());
    if (windowScrollY) {
      window.scrollTo(0, windowScrollY);
    }
  }

  handleScroll = () => {
    const { dispatch } = this.props;
    if (window.scrollY) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { windowScrollY: window.scrollY },
      });
    }
  };

  fetchData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'orgCenter/queryBuList',
    });
  };

  buChange = idVal => {
    const id = idVal[idVal.length - 1];
    const { dispatch } = this.props;
    const { selectAllBu } = this.setState;
    const selectAllBuVal = selectAllBu ? 'YES' : 'NO';
    dispatch({
      type: 'orgCenter/updateState',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
        buVal: idVal,
        buMember: [],
      },
    });
    dispatch({
      type: 'orgCenter/updateForm',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/clean',
    });
    dispatch({
      type: 'orgCenter/queryBuInfo',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'orgCenter/queryImplementList',
    });
    dispatch({
      type: 'orgCenter/queryRankInfo',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'orgCenter/queryBuMember',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'buWorkCalendar/updateState',
      payload: {
        resId: null,
        cleanWorkCalender: [],
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryOkrList',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryWorkPlanList',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
        readStatus: 'READ',
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryExamListList',
      payload: {
        buId: id,
        selectAllBu: selectAllBuVal,
      },
    });
    this.setState({
      selectAllBu: false,
      resId: null,
      readStatus: 'READ',
    });
  };

  buCheckboxHandle = e => {
    const {
      orgCenter: { buId },
      dispatch,
    } = this.props;
    const selectAllBu = e.target.checked ? 'YES' : 'NO';
    this.setState({
      selectAllBu: e.target.checked,
      resId: null,
    });

    dispatch({
      type: 'orgCenter/queryBuInfo',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'orgCenter/updateState',
      payload: {
        buMember: [],
      },
    });
    dispatch({
      type: 'orgCenter/updateForm',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/clean',
    });
    dispatch({
      type: 'orgCenter/queryImplementList',
    });
    dispatch({
      type: 'orgCenter/queryRankInfo',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'orgCenter/queryBuMember',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'buWorkCalendar/updateState',
      payload: {
        resId: null,
        cleanWorkCalender: [],
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryOkrList',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryWorkPlanList',
      payload: {
        buId,
        selectAllBu,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId,
        selectAllBu,
        readStatus: 'READ',
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryExamListList',
      payload: {
        buId,
        selectAllBu,
      },
    });
  };

  choseRes = e => {
    const resId = e;
    const {
      orgCenter: { buId },
      dispatch,
    } = this.props;
    const { selectAllBu } = this.state;

    dispatch({
      type: 'orgCenterWorkTable/clean',
    });
    dispatch({
      type: 'orgCenterWorkTable/queryOkrList',
      payload: {
        buId,
        resId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryWorkPlanList',
      payload: {
        buId,
        resId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId,
        resId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
        readStatus: 'READ',
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryExamListList',
      payload: {
        buId,
        resId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
      },
    });
    this.setState({
      resId,
    });
  };

  choseReadStatus = readStatus => {
    const {
      orgCenter: { buId },
      dispatch,
    } = this.props;
    const { selectAllBu, resId } = this.state;

    dispatch({
      type: 'orgCenterWorkTable/updateState',
      payload: {
        reportList: [],
        reportTotal: 0,
      },
    });
    dispatch({
      type: 'orgCenterWorkTable/queryReportList',
      payload: {
        buId,
        readStatus,
        resId,
        selectAllBu: selectAllBu ? 'YES' : 'NO',
      },
    });
    this.setState({
      readStatus,
    });
  };

  displayRender = label => label[label.length - 1];

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      orgCenter: {
        buList = [],
        buInfo = {},
        buId,
        okrInfo = {},
        rankInfo = [],
        menuData = [],
        buMember = [],
        formData,
        implementList = [],
        buVal = [],
        choseTab = '0',
      },
    } = this.props;
    const { buType, ouName, resCountBu } = buInfo;
    const { okrStatusRatio = 0, resWorkPlanRatio = 0, okrListViews = [] } = okrInfo;
    const circleChartsData = okrListViews.map(okrStatusItem => {
      const circleChartsDataItem = {};
      circleChartsDataItem.item = okrStatusItem.krStatus;
      circleChartsDataItem.count = okrStatusItem.count;
      return circleChartsDataItem;
    });
    const { selectAllBu, resId, readStatus } = this.state;
    return (
      <PageHeaderWrapper title="部门首页">
        <div className={styles.centerWrap}>
          <div className={styles.horizeBox}>
            <div className={styles.leftPart}>
              <Spin
                size="small"
                spinning={loading.effects[`${DOMAIN}/queryBuList`]}
                wrapperClassName={styles.centerLoading}
              >
                <div className={styles.buCenterIntro}>
                  <div className={styles.buType}>
                    <Icon type="apartment" />
                    <span>{buType}</span>
                  </div>
                  <div className={styles.buInfo}>
                    <div className={styles.buName}>
                      {buId && (
                        // <Selection
                        //   className={styles.buSelect}
                        //   transfer={{ key: 'id', code: 'id', name: 'name' }}
                        //   source={buList}
                        //   value={buId}
                        //   placeholder="请选择BU"
                        //   onChange={v => this.buChange(v)}
                        //   allowClear={false}
                        // />
                        <Cascader
                          className={styles.buSelect}
                          options={buList}
                          value={buVal || []}
                          displayRender={this.displayRender}
                          onChange={v => this.buChange(v)}
                        />
                      )}
                      {buId && (
                        <Checkbox onChange={this.buCheckboxHandle} checked={selectAllBu}>
                          汇总下级部门数据
                        </Checkbox>
                      )}
                      {!buId && <div className={styles.buSelectPlaceholder} />}
                    </div>
                    <div className={styles.buCompany}>{ouName}</div>
                    {buId && (
                      <div className={styles.buNum}>
                        <Icon type="user" />
                        {resCountBu || 0}人
                      </div>
                    )}
                    {!buId && <div className={styles.buNumPlaceholder} />}
                  </div>
                </div>
              </Spin>
            </div>
            <div className={styles.rightPart}>
              <div className={styles.shortcutMenuWrap}>
                <ShortcutMenu currentPage="/org/bu/center" />
              </div>
            </div>
          </div>
          <div className={`${styles.horizeBox}  ${styles.okrBox}`}>
            <Spin
              size="small"
              spinning={loading.effects[`${DOMAIN}/queryOkrInfo`]}
              wrapperClassName={styles.centerLoading}
            >
              <div className={styles.okrWrap}>
                <div className={styles.okrSelect}>
                  <FieldList
                    layout="horizontal"
                    getFieldDecorator={getFieldDecorator}
                    col={1}
                    noReactive
                  >
                    <Field
                      name="periodId"
                      label="目标周期"
                      decorator={{
                        initialValue: formData.periodId || undefined,
                      }}
                      style={{
                        marginBottom: '20px',
                      }}
                    >
                      <Selection
                        className="x-fill-100"
                        source={implementList || []}
                        transfer={{ key: 'id', code: 'id', name: 'periodName' }}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        onValueChange={e => {}}
                        placeholder="请选择目标周期"
                        allowClear={false}
                      />
                    </Field>
                    <Field
                      name="objectiveType"
                      label="目标类型"
                      decorator={{
                        initialValue: formData.objectiveType || undefined,
                      }}
                    >
                      <Selection.UDC code="OKR:OBJ_TYPE" placeholder="请选择目标类型" />
                    </Field>
                  </FieldList>
                </div>
                <div className={styles.okrprogressWrap}>
                  <Progress
                    type="circle"
                    strokeWidth={8}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    percent={okrStatusRatio}
                    width={100}
                  />
                  <span>目标整体进度</span>
                </div>
                <div className={styles.okrprogressWrap}>
                  <Progress
                    type="circle"
                    strokeWidth={8}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    percent={resWorkPlanRatio}
                    width={100}
                  />
                  <span>关键行动完成度</span>
                </div>
              </div>
              <div className={styles.okrReportWrap}>
                <div className={styles.okrData}>
                  <OkrStatus dataSource={okrListViews} />
                </div>
                {circleChartsData &&
                  circleChartsData.length > 0 && (
                    <div className={styles.okrStatus}>
                      <CircleCharts data={circleChartsData || []} />
                    </div>
                  )}
                {!circleChartsData ||
                  (circleChartsData.length === 0 && (
                    <div className={styles.okrStatus}>暂无数据</div>
                  ))}
              </div>
            </Spin>
          </div>
          <div className={`${styles.horizeBox} ${styles.rankBox}`}>
            <Spin
              size="small"
              spinning={loading.effects[`${DOMAIN}/queryRankInfo`]}
              wrapperClassName={styles.centerLoading}
            >
              {rankInfo &&
                rankInfo.map((item, idx) => (
                  <div className={styles.rankBoxItem} key={item.no}>
                    <div className={styles.rankBoxTitle}>
                      <img src={rankIcon} alt="排行榜图标" />
                      {item.topListName}
                    </div>
                    <div className={styles.rankBoxData}>
                      统计期间：
                      {item.startDate}~{item.endDate}
                    </div>
                    <RankTable dataSource={item.dataTopViews} type={idx} />
                    {item.dataTopViews &&
                      item.dataTopViews.length > 0 && (
                        <div className={styles.rankListMore}>
                          <span
                            onClick={() => {
                              const url = getUrl();
                              router.push(`/user/prefMgmt/topListView?id=${item.id}&from=${url}`);
                            }}
                          >
                            查看完整榜单&rsaquo;
                          </span>
                        </div>
                      )}
                  </div>
                ))}
            </Spin>
          </div>
          {buId && (
            <div className={`${styles.horizeBox} ${styles.workBox}`}>
              <div className={styles.choseResBox}>
                资源:&nbsp;&nbsp;
                <Selection.Columns
                  key={buId || selectAllBu}
                  className={styles.choseResSelect}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  source={buMember}
                  value={resId}
                  showSearch
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  // value={resId}
                  placeholder="请选择资源"
                  onChange={v => this.choseRes(v)}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {choseTab === '2' && (
                  <Selection.UDC
                    className={styles.choseResSelect}
                    code="TSK.WORK_REPORT_READ_STATE"
                    value={readStatus}
                    placeholder="请选择阅读状态"
                    onChange={v => {
                      this.choseReadStatus(v);
                    }}
                  />
                )}
                {choseTab === '2' && <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                <Button
                  className="tw-btn-primary"
                  size="middle"
                  onClick={() => {
                    this.choseRes(resId);
                  }}
                >
                  刷新
                </Button>
              </div>
              <Tabs
                activeKey={choseTab}
                onChange={activeKey => {
                  dispatch({
                    type: 'orgCenter/updateState',
                    payload: {
                      choseTab: activeKey,
                    },
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
                  key="0"
                >
                  <WorkTable tab={0} buId={buId} selectAllBu={selectAllBu} resId={resId} />
                </TabPane>
                <TabPane
                  tab={
                    <span className={styles.tabName}>
                      <img src={krIcon} alt="kr" />
                      关键行动
                    </span>
                  }
                  key="1"
                >
                  <WorkTable tab={1} buId={buId} selectAllBu={selectAllBu} resId={resId} />
                </TabPane>
                <TabPane
                  tab={
                    <span className={styles.tabName}>
                      <img src={workIcon} alt="work" />
                      工作报告
                    </span>
                  }
                  key="2"
                >
                  <WorkTable
                    tab={2}
                    buId={buId}
                    selectAllBu={selectAllBu}
                    resId={resId}
                    readStatus={readStatus}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span className={styles.tabName}>
                      <img src={testIcon} alt="test" />
                      绩效考核
                    </span>
                  }
                  key="3"
                >
                  <WorkTable tab={3} buId={buId} selectAllBu={selectAllBu} resId={resId} />
                </TabPane>
              </Tabs>
            </div>
          )}

          <div className={`${styles.horizeBox} ${styles.calendarBox}`}>
            <div className={styles.calendarTitle}>
              <img src={buCalendarIcon} alt="工作日历" />
              工作日历
            </div>
            <div>
              <Calendar buMember={buMember} key={buId || selectAllBu} />
            </div>
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default OrgCenter;
