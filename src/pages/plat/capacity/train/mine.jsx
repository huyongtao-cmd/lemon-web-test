import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Tabs, Input, Progress, Icon } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';

import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import styles from './index.less';

const DOMAIN = 'platTrainMine';
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { Search } = Input;

@connect(({ loading, platTrainMine }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platTrainMine,
}))
@mountToTab()
class CapaSetDetail extends PureComponent {
  state = {
    tabKey: 'inProcess',
  };

  componentDidMount() {}

  tabChange = key => {
    this.setState({
      tabKey: key,
    });
  };

  render() {
    const { tabKey } = this.state;
    return (
      <PageHeaderWrapper title="我的培训">
        <Tabs
          activeKey={tabKey}
          onChange={this.tabChange}
          tabBarStyle={{ marginBottom: '5px', background: '#fff' }}
        >
          <TabPane tab="进行中(5)" key="inProcess">
            <div className={styles.cardBoxWrap}>
              <div className={styles.cardBoxLeft}>
                <div>
                  <Search
                    placeholder="培训名称/简介"
                    onSearch={value => console.log(value)}
                    style={{ marginBottom: '20px' }}
                  />
                </div>
                <div>
                  <div className={styles.cardBox}>
                    <div className={styles.cardTitle}>Sap 软件培训</div>
                    <div className={styles.cardInfo}>
                      &nbsp;&nbsp;&nbsp;&nbsp;课程数:&nbsp;&nbsp;4门&nbsp;&nbsp;&nbsp;&nbsp;总课时:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;总学分:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;
                      <span>学习目标</span>
                      &nbsp;&nbsp;
                      <span>简介</span>
                    </div>
                    <div className={styles.cardInfo}>
                      截止日期:&nbsp;&nbsp;2020-05-01&nbsp;&nbsp;&nbsp;&nbsp;10天后截止
                    </div>
                    <div className={styles.cardInfo}>
                      学习进度:&nbsp;&nbsp;
                      <Progress percent={25} strokeColor="#22d7bb" />
                    </div>
                    <span className={styles.cardBtn}>能力复核</span>
                    <span className={styles.cardBtn}>推送</span>
                    <span className={styles.cardTag}>必修</span>
                  </div>
                  <div className={styles.cardBox}>
                    <div className={styles.cardTitle}>顾问行为准则</div>
                    <div className={styles.cardInfo}>
                      &nbsp;&nbsp;&nbsp;&nbsp;课程数:&nbsp;&nbsp;4门&nbsp;&nbsp;&nbsp;&nbsp;总课时:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;总学分:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;
                      <span>学习目标</span>
                      &nbsp;&nbsp;
                      <span>简介</span>
                    </div>
                    <div className={styles.cardInfo}>
                      截止日期:&nbsp;&nbsp;2020-05-11&nbsp;&nbsp;&nbsp;&nbsp;20天后截止
                    </div>
                    <div className={styles.cardInfo}>
                      学习进度:&nbsp;&nbsp;
                      <Progress percent={30} strokeColor="#22d7bb" />
                    </div>
                    <span className={styles.cardBtn}>能力复核</span>
                    <span className={styles.cardBtn}>推送</span>
                    <span className={`${styles.cardTag} ${styles.cardTagBlue}`}>选修</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardBoxRight}>
                <div className={styles.cardHoverBoxTop}>
                  <div className={styles.cardTitle}>Sap 软件培训</div>
                  <div className={styles.cardInfo}>
                    &nbsp;&nbsp;&nbsp;&nbsp;课程数:&nbsp;&nbsp;4门&nbsp;&nbsp;&nbsp;&nbsp;总课时:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;总学分:&nbsp;&nbsp;4
                  </div>
                  <div className={styles.cardInfo}>
                    截止日期:&nbsp;&nbsp;2020-05-01&nbsp;&nbsp;&nbsp;&nbsp;10天后截止
                  </div>
                  <div className={styles.cardInfo}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;简介:&nbsp;&nbsp;
                    埃林哲企业大学.资源管理部.SAP.公共.岗位专业技能.实施
                  </div>
                  <div className={styles.cardInfo}>学习目标:&nbsp;&nbsp;了解 Sap 软件</div>
                  <div className={styles.cardInfo}>
                    学习进度:&nbsp;&nbsp;
                    <Progress percent={25} strokeColor="#22d7bb" />
                  </div>
                </div>

                <div className={styles.cardHoverBoxBottom}>
                  <div className={styles.courseBox}>
                    <div className={styles.cardTitle}>SAP MM 批次管理</div>
                    <div className={styles.cardInfo}>
                      学时:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;学分:&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;建议完成天数:&nbsp;&nbsp;1天&nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.cardInfoTag}>必修</span>
                    </div>
                    <div className={styles.cardInfo}>建议入职当天完成</div>
                    <span className={styles.studyStyle}>
                      <Icon type="check" style={{ color: '#22d7bb', fontSize: '18px' }} />
                    </span>
                  </div>
                  <Divider dashed />
                  <div className={styles.courseBox}>
                    <div className={styles.cardTitle}>S4HC 云系统简介</div>
                    <div className={styles.cardInfo}>
                      学时:&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;学分:&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;&nbsp;建议完成天数:&nbsp;&nbsp;1天&nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.cardInfoTag}>必修</span>
                    </div>
                    <div className={styles.cardInfo}>建议入职当天完成</div>
                    <span className={styles.studyStyle}>进入学习</span>
                  </div>
                  <Divider dashed />
                  <div className={styles.courseBox}>
                    <div className={styles.cardTitle}>SAP 云平台</div>
                    <div className={styles.cardInfo}>
                      学时:&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;学分:&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;&nbsp;建议完成天数:&nbsp;&nbsp;1天&nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.cardInfoTag}>必修</span>
                    </div>
                    <div className={styles.cardInfo}>建议入职当天完成</div>
                    <span className={styles.studyStyle}>
                      <Icon type="lock" style={{ color: '#cccccc', fontSize: '18px' }} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tab="已结束(20)" key="finished">
            Content of Tab Pane 2
          </TabPane>
        </Tabs>
      </PageHeaderWrapper>
    );
  }
}

export default CapaSetDetail;
