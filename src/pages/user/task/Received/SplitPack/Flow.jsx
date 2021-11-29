import React, { Component } from 'react';
import router from 'umi/router';
import { closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Spin, Form, Card } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import { connect } from 'dva';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { fromQs } from '@/utils/stringUtils';
import SplitPack from './index';
import BuSettleInfo from './component/BuSettleInfo';

const DOMAIN = 'splitPack';
@connect(({ loading, splitPack }) => ({
  loading,
  ...splitPack,
}))
class Flow extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { taskId } = fromQs();
    dispatch({ type: `${DOMAIN}/updateState`, payload: { fieldsConfig: {} } });
    taskId && dispatch({ type: `${DOMAIN}/fetchConfig`, payload: taskId });
  }

  getBuSettleInfo = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        buSettleInfoData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryBuSettleInfo`,
      payload: {
        id,
      },
    });
  };

  render() {
    const { loading, dispatch, form, flowForm, fieldsConfig, buSettleInfoData } = this.props;
    const { taskKey } = fieldsConfig;
    const param = fromQs();
    const { taskId, id } = param;
    return (
      <PageHeaderWrapper title="任务拆包审批流程">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (taskKey === 'TSK_P12_01_SPLIT_SUBMIT_i') {
              // router.push(
              //   `/user/task/splitpack?id=${id}&taskId=${taskId}&result=${key}&remark=${remark}&opMode=UPDATE`
              // );
              closeThenGoto(
                `/user/task/splitpack?id=${id}&taskId=${taskId}&result=${key}&remark=${remark}&opMode=UPDATE`
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card bordered={false}>
            {taskKey === 'TSK_P12_03_BU_APPR_b' ? (
              <>
                <DescriptionList size="large" title="结算信息" />
                <Spin spinning={loading.effects[`${DOMAIN}/queryBuSettleInfo`] || false}>
                  <BuSettleInfo
                    dataSource={buSettleInfoData}
                    getBuSettleInfo={this.getBuSettleInfo}
                  />
                </Spin>
              </>
            ) : (
              ''
            )}
            <DescriptionList size="large" title="转包信息" />
            <SplitPack fromFlow taskKey={taskKey} />
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default Flow;
