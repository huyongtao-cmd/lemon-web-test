import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Card, Tooltip, List, Avatar } from 'antd';
import moment from 'moment';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';

import { fromQs } from '@/utils/production/stringUtil';
import DataTable from '@/components/production/business/DataTable.tsx';
import createMessage from '@/components/core/AlertMessage';
import styles from './index.less';

// namespace声明
const DOMAIN = 'performanceFeedback';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, performanceFeedback, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...performanceFeedback,
  user,
}))
class PerformanceFeedbackDetail extends React.PureComponent {
  state = {
    // eslint-disable-next-line react/no-unused-state
    isHistory: false,
  };

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId, flag } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const checked = flag === 'CHECK';
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    this.fetchData(id);
    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId, checked });
    // taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetail`,
      payload: { id: params },
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  render() {
    const { formData, formMode, loading, taskId } = this.props;
    const {
      targetView = {},
      evaluateEntities = [],
      shortageAndImproveEntities = [],
      indexList = [],
      firstHalfSummary,
      secondHalfExpectation,
    } = formData;
    // 其他流程1
    // const allBpm = [{ docId: formData.id, procDefKey: 'PUR_G01', title: '采购流程' }];
    const editDescColumns = [
      {
        title: 'KPI指标',
        align: 'center',
        dataIndex: 'indexName',
      },
      {
        title: '评估标准',
        align: 'center',
        dataIndex: 'assessStandard',
      },
      {
        title: '权重',
        align: 'center',
        dataIndex: 'indexWeight',
      },
      {
        title: '完成进度',
        align: 'center',
        dataIndex: 'progress',
      },
    ];
    return (
      <PageWrapper loading={loading}>
        <BusinessForm
          title="基本信息"
          formData={targetView}
          formMode={formMode}
          defaultColumnStyle={8}
        >
          <FormItem
            fieldType="BaseInput"
            label="目标名称"
            placeholder="员工部门+姓名+年度+绩效目标"
            fieldKey="targetName"
          />
          <FormItem
            fieldType="BaseInput"
            label="员工姓名"
            placeholder="请选择员工姓名"
            fieldKey="resName"
          />
          <FormItem
            fieldType="BaseInput"
            label="部门"
            placeholder="请输入申请名称"
            fieldKey="baseBuName"
          />
          <FormItem
            fieldType="BaseInput"
            label="职位"
            placeholder="请输入申请名称"
            fieldKey="jobtitle"
          />
          <FormItem
            fieldType="BaseInput"
            label="职级"
            placeholder="请输入申请名称"
            fieldKey="jobGrade"
          />
          <FormItem
            fieldType="BaseInput"
            label="直属负责人"
            placeholder="请输入申请名称"
            fieldKey="presName"
          />
          <FormItem label="入职日期" fieldKey="enrollDate" fieldType="BaseDatePicker" />
          <FormItem label="现岗位任职日期" fieldKey="positionTakeDate" fieldType="BaseDatePicker" />
          <FormItem label="目标周期" fieldKey="periodName" fieldType="BaseInput" />
          <FormItem label="创建人" fieldKey="createUserName" fieldType="BaseInput" />
        </BusinessForm>
        <Card title="半年度KPI回顾" bordered={false}>
          <DataTable
            columns={editDescColumns}
            dataSource={indexList}
            showExport={false}
            showColumnSwitch={false}
          />
        </Card>
        <Card title="半年度工作总结与进度回顾" bordered={false} style={{ marginTop: '2px' }}>
          {/* <div
            className={`${styles.paper
              } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
            dangerouslySetInnerHTML={{ __html: firstHalfSummary }}
          /> */}
          <div
            style={{ padding: '15px', overflow: 'hidden', overflowY: 'scroll' }}
            className={styles.paper}
            dangerouslySetInnerHTML={{ __html: firstHalfSummary }}
          />
        </Card>
        <DataTable
          title={<div> 存在的不足及改进措施</div>}
          dataSource={shortageAndImproveEntities}
          showExport={false}
          showColumnSwitch={false}
          columns={[
            {
              title: '不足之处',
              align: 'center',
              dataIndex: 'shortage',
              width: 500,
            },
            {
              title: '改进措施',
              align: 'center',
              dataIndex: 'improvement',
            },
          ]}
        />
        <Card title="下半年度工作期望" bordered={false} style={{ marginTop: '2px' }}>
          <div
            style={{ padding: '15px', overflow: 'hidden', overflowY: 'scroll' }}
            className={styles.paper}
            dangerouslySetInnerHTML={{ __html: secondHalfExpectation }}
          />
        </Card>
        <Card
          title="领导整体评价及建议"
          bordered={false}
          style={{ marginTop: '2px', padding: '15px' }}
        >
          <div className={styles.evaluate}>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                paddingTop: '10px',
                marginLeft: '15px',
                height: '50px',
              }}
            >
              全部评价及建议
            </div>
            <div style={{ borderTop: '1px solid #eee', width: '100%' }} />
            <div className={styles.evaluateContent} style={{ height: '348px' }}>
              <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={evaluateEntities}
                renderItem={item => (
                  <li style={{ marginTop: '20px' }}>
                    <Tooltip>
                      <Avatar size="small" icon="user" />
                      <span style={{ marginLeft: '10px' }}>{item.createUserName}</span>
                      <span style={{ marginLeft: '6px' }}>
                        {moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </Tooltip>
                    <p style={{ marginTop: '8px', marginLeft: '35px' }}>{item.comment}</p>
                  </li>
                )}
              />
            </div>
          </div>
        </Card>
        {/* {!taskId && <BpmConnection source={allBpm} />} */}
      </PageWrapper>
    );
  }
}

export default PerformanceFeedbackDetail;
