import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Spin, Form } from 'antd';
import Title from '@/components/layout/Title';
import router from 'umi/router';
import { connect } from 'dva';
import tabConf from '../common/tabPageConf';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { fromQs } from '@/utils/stringUtils';

import WagePageInfoDetail from '../components/detail';
import PayObj from '../components/payObj';
import BU from '../components/BU';

const contentList = {
  detail: <WagePageInfoDetail />,
  payObj: <PayObj />,
  BU: <BU />,
};
const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
@Form.create()
class WageCostMainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'detail',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    taskId && dispatch({ type: `${DOMAIN}/fetchConfig`, payload: taskId });
    if (id) {
      dispatch({
        type: `${DOMAIN}/getViewItem`,
        payload: {
          id,
        },
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
    });
  };

  render() {
    const { operationkey } = this.state;
    const { loading, dispatch, form, flowForm, fieldsConfig } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, setFieldsValue } = form;
    const { taskKey } = fieldsConfig;
    const param = fromQs();
    const { taskId, id } = param;
    return (
      <PageHeaderWrapper title="薪资成本详情">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (taskKey === 'ACC_A68_01_SUBMIT_i') {
              router.push(
                `/plat/expense/wageCost/main?id=${id}&taskId=${taskId}&result=${key}&remark=${remark}&opMode=UPDATE`
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Spin
            spinning={
              loading.effects[`${DOMAIN}/detailSave`] ||
              loading.effects[`${DOMAIN}/submit`] ||
              loading.effects[`wageCostMainPage/payObjSave`] ||
              loading.effects[`wageCostMainPage/payObjCreateData`] ||
              loading.effects[`wageCostMainPage/BUSave`] ||
              loading.effects[`wageCostMainPage/BUCreateData`] ||
              false
            }
          >
            <Card
              className={['tw-card-adjust']}
              title={
                <Title
                  icon="profile"
                  id="ui.menu.plat.expense.wageCostInfo"
                  defaultMessage="薪资成本详情"
                />
              }
              headStyle={{ background: '#fff' }}
              bodyStyle={{ padding: '0px' }}
              bordered={false}
            />
            <Card
              className="tw-card-multiTab"
              bordered={false}
              activeTabKey={operationkey}
              tabList={tabConf}
              onTabChange={this.onOperationTabChange}
            >
              {contentList[operationkey]}
            </Card>
          </Spin>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default WageCostMainPage;
