import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Card } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
import DataTable from '@/components/production/business/DataTable.tsx';
import createMessage from '@/components/core/AlertMessage';

// namespace声明
const DOMAIN = 'performanceTarget';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, performanceTarget, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...performanceTarget,
  user,
}))
class PerformanceTargetDetail extends React.PureComponent {
  state = {
    // eslint-disable-next-line react/no-unused-state
    isHistory: false,
    dataSource: [],
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
    }).then(res => {
      if (res && res.ok) {
        res.data.indexVersion !== 1 &&
          dispatch({
            type: `${DOMAIN}/getHistory`,
            payload: { id: res.data.id, versions: res.data.indexVersion },
          });
        this.setState({
          dataSource: [res?.data.indexList],
        });
      }
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
    const { formData, formMode, loading, taskId, indicatorData } = this.props;
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
    ];
    const { indexList = [] } = formData;
    const { isHistory, dataSource } = this.state;
    return (
      <PageWrapper loading={loading}>
        <BusinessForm
          title="基本信息"
          formData={formData}
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
          <FormItem label="创建人" fieldKey="createUserName" fieldType="ResSimpleSelect" />
        </BusinessForm>
        <Card title="指标明细" bordered={false}>
          <div>
            <Button
              className={isHistory ? 'tw-btn-default' : 'tw-btn-primary'}
              type="primary"
              size="large"
              disabled={false}
              onClick={() => {
                this.setState({
                  // eslint-disable-next-line react/no-unused-state
                  isHistory: false,
                  dataSource: [indexList],
                });
              }}
            >
              当前绩效
            </Button>
            <Button
              className={isHistory ? 'tw-btn-primary' : 'tw-btn-default'}
              type="primary"
              size="large"
              disabled={false}
              onClick={() => {
                this.setState({
                  // eslint-disable-next-line react/no-unused-state
                  isHistory: true,
                  dataSource: indicatorData,
                });
              }}
            >
              变更历史
            </Button>
          </div>
          {!isEmpty(dataSource) ? (
            dataSource.map((item, index) => (
              <DataTable
                columns={editDescColumns}
                title={isHistory && `版本：${item[0].version}`}
                dataSource={item}
                showExport={false}
                showColumnSwitch={false}
              />
            ))
          ) : (
            <DataTable
              columns={editDescColumns}
              dataSource={dataSource}
              showExport={false}
              showColumnSwitch={false}
            />
          )}
        </Card>
        {/* {!taskId && <BpmConnection source={allBpm} />} */}
      </PageWrapper>
    );
  }
}

export default PerformanceTargetDetail;
