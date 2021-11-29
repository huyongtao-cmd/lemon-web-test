import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Divider, Table, Form, Tag } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { isNil, isEmpty } from 'ramda';
import AddrEdit from './customerInfoEdit';
import AddrDet from './customerInfoDetail';

import {
  infoEditTabList,
  edubgColumns,
  workbgColumns,
  proExpColumns,
  financeInfoColumns,
} from '@/pages/plat/res/profile/config';

const { Description } = DescriptionList;

const DOMAIN = 'customerFlow';

@connect(({ dispatch, loading, customerFlow }) => ({
  dispatch,
  loading,
  ...customerFlow,
}))
@mountToTab()
class CustomerFlow extends PureComponent {
  constructor(props) {
    super(props);
    // this.auditRef = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    id &&
      dispatch({
        type: `customer/customerDetails`,
        payload: id,
      });
    // 流程配置
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  handleSaveAll = (remark, branch, status) => {
    const { taskId } = fromQs();
    // console.log('auditRef', this.auditRef);
    this.auditRef.handleSaveAll({
      remark,
      taskId,
      branch,
      result: status || 'APPROVED',
    });
  };

  getRef = ref => {
    this.auditRef = ref;
  };

  render() {
    const { dispatch, abNo, fieldsConfig, flowForm } = this.props;
    // console.log('fieldsConfig', fieldsConfig);
    const { taskKey } = fieldsConfig;
    const { id, taskId, mode } = fromQs();

    return (
      <PageHeaderWrapper title="登记为客户审批">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          // eslint-disable-next-line consistent-return
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            // console.log('operation', operation)
            // console.log('bpmForm', bpmForm)
            // return Promise.resolve(true)
            if (branch === 'FLOW_RETURN') {
              // 退回
              return Promise.resolve(true);
            }
            if (branch === 'FLOW_PASS') {
              // // 通过，先进行全部保存
              const tempFlag = this.handleSaveAll(remark, branch);
              if (tempFlag) {
                return Promise.resolve(true);
              }
              return Promise.resolve(false);
            }
            if (branch === 'FLOW_COMMIT') {
              // 再次提交
              this.handleSaveAll(remark, branch, 'APPLIED');
              return Promise.resolve(false);
            }
          }}
        >
          {/* {taskKey === 'TSK_S05_02_CONTRACT_ADMIN' && <AddrEdit getRef={this.getRef} isFlow />} */}
          <AddrEdit getRef={this.getRef} isFlow />
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default CustomerFlow;
