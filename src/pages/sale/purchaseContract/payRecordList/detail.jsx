/* eslint-disable array-callback-return */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import update from 'immutability-helper';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';

import DataTable from '@/components/common/DataTable';

import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import { selectAbOus, selectUsersWithBu, selectOus, selectCusts } from '@/services/gen/list';
import { selectAccountByNo } from '@/services/sale/purchaseContract/paymentApplyList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

import { payRecordTableProps } from './detailConfig/payRecordConfig';
import { CONFIGSCENE, FLOW_NO } from '../constConfig';

const DOMAIN = 'payRecordDetail';

@connect(({ loading, payRecordDetail, dispatch, user }) => ({
  loading,
  payRecordDetail,
  dispatch,
  user,
}))
@mountToTab()
class Edit extends PureComponent {
  componentDidMount() {
    const param = fromQs();
    const { dispatch } = this.props;
    // 获取自定义配置
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { mode: param.mode, id: param.id || '' },
    });
  }

  submit = params => {
    const { dispatch, payRecordDetail } = this.props;
    const { payRecordList } = payRecordDetail;
    const { taskId, result, remark } = params;
    // 如果有taskid 后端去推流程
    const { from } = fromQs();
    const url = getUrl(from);
    dispatch({
      type: `${DOMAIN}/updatePaymentSlipUpdate`,
      payload: payRecordList[0],
    }).then(res => {
      if (res) {
        if (taskId) {
          dispatch({
            type: `${DOMAIN}/reSubmit`,
            payload: {
              id: res,
              flow: {
                taskId,
                result,
                remark,
              },
            },
          }).then(resq => {
            if (resq.ok) {
              createMessage({ type: 'success', description: '提交成功' });
              closeThenGoto(url);
            } else {
              createMessage({ type: 'success', description: '提交失败' });
            }
          });
        }
      }
    });
  };

  render() {
    const { loading, payRecordDetail, dispatch } = this.props;
    const { formData, fieldsConfig, flowForm } = payRecordDetail;
    const { mode, id, taskId } = fromQs();
    // console.log('fieldsConfig', fieldsConfig);
    // const { taskKey } = fieldsConfig;
    return (
      <PageHeaderWrapper title="付款申请单审批">
        <BpmWrapper
          fields={formData || {}}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope={FLOW_NO.PAYRECORD}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            const { key } = operation;
            const payload = {
              taskId,
              remark: bpmForm.remark,
            };
            if (key === 'FLOW_PASS') {
              payload.result = 'APPROVED';
              return Promise.resolve(true);
            }

            if (key === 'FLOW_RETURN') {
              payload.result = 'REJECTED';
              return Promise.resolve(true);
            }
            if (key === 'FLOW_COMMIT') {
              payload.result = 'APPROVED';
              this.submit(payload);
              // return Promise.resolve(true);
            }
            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-adjust" bordered={false}>
            <div className="tw-card-title">付款单记录</div>
            <EditableDataTable
              {...payRecordTableProps(DOMAIN, dispatch, loading, mode, payRecordDetail)}
            />
          </Card>
        </BpmWrapper>

        {!taskId && <BpmConnection source={[{ docId: id, procDefKey: FLOW_NO.PAYRECORD }]} />}
      </PageHeaderWrapper>
    );
  }
}

export default Edit;
