import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import { closeThenGoto, injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  checkExpensePeriod,
  checkProjectBudget,
} from '@/services/user/expense/expense';
import classnames from 'classnames';
import { isEmpty, isNil, takeWhile, trim } from 'ramda';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { selectUsersWithBu } from '@/services/gen/list';
import { ReimbursementDetailList } from './components';
import {
  AccSelect,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
  TripApplySelect,
  TripExpenseDetailList,
} from '../../../user/expense/components';

import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { revoke } = api.bpm;
const { Field } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'buReimbursementCreate';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 差旅费用报销
 */
@connect(({ loading, dispatch, buReimbursementCreate, user }) => ({
  loading,
  dispatch,
  buReimbursementCreate,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    if (key === 'applicantResId') {
      props.dispatch({
        type: `${DOMAIN}/updateSharingData`,
        payload: { applicantResId: value },
      });
    }
  },
})
@mountToTab()
class BuReimbursementCreate extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;
    const {
      extInfo: { resId },
    } = user;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/bu` });
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

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          id: param.id,
          mode: param.mode,
          resId: param.mode === 'create' ? resId : '',
        },
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  componentWillUnmount() {}
  // --------------- 剩下的私有函数写在这里 -----------------

  // 提交按钮事件
  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      buReimbursementCreate,
    } = this.props;
    const { detailList, formData, sharingData } = buReimbursementCreate;
    const param = fromQs();
    if (param.id) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          let notSatisfied = false;
          takeWhile(item => {
            const judgment = isNil(item.sharingBuId) || isNil(item.sharingAmt);
            const judgAmt = item.sharingAmt === 0;
            if (judgment) {
              createMessage({ type: 'warn', description: '请补全表单必填项（带*的均为必填项）' });
              notSatisfied = true;
              return 0;
            }
            if (judgAmt) {
              createMessage({ type: 'warn', description: '分摊金额不能为0' });
              notSatisfied = true;
              return 0;
            }
            return !judgment;
          }, detailList);
          if (notSatisfied) return;
          const newDetailList = detailList.map(r => ({
            ...r,
            id: typeof r.id === 'string' ? null : r.id,
          }));
          dispatch({
            type: `${DOMAIN}/submit`,
            payload: {
              ...sharingData,
              reimId: formData.id,
              sharingDetailEntities: newDetailList,
            },
          });
        }
      });
    }
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      buReimbursementCreate: {
        formData,
        sharingData,
        detailList,
        flowForm,
        fieldsConfig,
        feeCodeList,
        baseBuDataSource,
      },
      form: { getFieldDecorator },
    } = this.props;
    const { taskKey } = fieldsConfig;
    const param = fromQs();
    const { taskId, id, mode } = param;
    const preparing = loading.effects[`${DOMAIN}/query`];
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A63"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };
            if (key === 'FLOW_PASS') {
              if (
                [
                  'ACC_A63_02_COST_SHARING_BU_RES_b', // 相关bu处理人
                ].includes(taskKey)
              ) {
                dispatch({
                  type: `${DOMAIN}/updateBuFlow`,
                  payload: { result: 'APPROVED', ...payload },
                });
                return Promise.resolve(false);
              }
              return Promise.resolve(true);
            }

            if (key === 'FLOW_RETURN') {
              // 不走封装的按钮控制，应为有多分支，后端审批接口入参策略不一致
              if (
                [
                  'ACC_A63_02_COST_SHARING_BU_RES_b', // 相关bu处理人
                ].includes(taskKey)
              ) {
                dispatch({
                  type: `${DOMAIN}/updateBuFlow`,
                  payload: { result: 'REJECTED', ...payload },
                });
                return Promise.resolve(false);
              }
              return Promise.resolve(true);
            }
            return 0;
          }}
        >
          <Card className="tw-card-rightLine">
            {mode === 'create' && (
              <Button
                className="tw-btn-primary"
                icon="form"
                size="large"
                loading={loading.effects[`${DOMAIN}/submit`]}
                onClick={() => this.handleSubmit()}
              >
                提交
              </Button>
            )}
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                closeThenGoto('/org/bu/buReimbursementList/index?_refresh=0');
              }}
            >
              返回
            </Button>
          </Card>
          <Card className="tw-card-adjust deepColorDecorator" bordered={false}>
            {preparing || preparing === undefined ? (
              <Loading />
            ) : (
              <>
                <div className="tw-card-title">基本信息</div>
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="reimBatchNo"
                    label="报销单批次号"
                    decorator={{
                      initialValue: formData.reimBatchNo,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimNo"
                    label="报销单号"
                    decorator={{
                      initialValue: formData.reimNo,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="applyDate"
                    label="报销申请日期"
                    decorator={{
                      initialValue: formData.applyDate,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimStatusName"
                    label="报销单状态"
                    decorator={{
                      initialValue: formData.reimStatusName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="reimRes"
                    label="报销人"
                    decorator={{
                      initialValue: formData.reimResId
                        ? {
                            name: formData.reimResName,
                            id: formData.reimResId + '',
                            jobGrade: formData.jobGrade,
                          }
                        : undefined,
                    }}
                  >
                    <ResSelect disabled />
                  </Field>
                  <Field
                    name="resBuName"
                    label="报销人Base BU"
                    decorator={{
                      initialValue: formData.resBuName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="busitripApplyName"
                    label="出差申请单"
                    decorator={{
                      initialValue: formData.busitripApplyName,
                    }}
                  >
                    {/* TripApplySelect为原来开发时专门定制的，编辑页面已经弃用，这里又只是展示，申请单又增加参数了，就这样解决了:) */}

                    {formData.busitripApplyName && (
                      <Link
                        className="tw-link"
                        to={`/user/center/travel/detail?id=${formData.busitripApplyId}`}
                      >
                        {formData.busitripApplyName}
                      </Link>
                    )}
                  </Field>

                  <Field
                    name="expenseByTypeForTripName"
                    label="费用承担方"
                    decorator={{
                      initialValue: formData.expenseByTypeForTripName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reason"
                    label="事由类型 / 事由号"
                    decorator={{
                      initialValue: [formData.reasonType, formData.reasonId, formData.reasonName],
                    }}
                  >
                    <ReasonSelect disabled resId={formData.reimResId} />
                  </Field>
                  <Field
                    name="reimType"
                    label="报销类型"
                    decorator={{
                      initialValue: [formData.reimType1, formData.reimType2, formData.reimType3],
                    }}
                  >
                    <ReimTypeSelect isTrip disabled />
                  </Field>
                  <Field
                    name="expenseOuName"
                    label="费用承担公司"
                    decorator={{
                      initialValue: formData.expenseOuName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="expenseBuName"
                    label="费用BU"
                    decorator={{
                      initialValue: formData.expenseBuName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="feeCode"
                    label="费用码"
                    decorator={{
                      initialValue: formData.feeCode,
                    }}
                  >
                    <AsyncSelect disabled allowClear={false} source={feeCodeList} />
                  </Field>
                  <Field
                    name="payMethod"
                    label="支付方式"
                    decorator={{
                      initialValue: formData.payMethod,
                    }}
                  >
                    <UdcSelect allowClear={false} code="ACC:PAY_METHOD" disabled />
                  </Field>
                </FieldList>
              </>
            )}
          </Card>
          <Card
            className="tw-card-adjust deepColorDecorator"
            bordered={false}
            style={{ marginTop: '4px' }}
          >
            {preparing || preparing === undefined ? (
              <Loading />
            ) : (
              <>
                <div className="tw-card-title">报销分摊信息</div>
                <br />
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="applicantResId"
                    label="申请人"
                    decorator={{
                      initialValue: sharingData.applicantResId,
                      rules: [{ required: true, message: '请选择申请人' }],
                    }}
                  >
                    <Selection.Columns
                      disabled={mode !== 'create'}
                      source={() => selectUsersWithBu()}
                      className="x-fill-100"
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      columns={particularColumns}
                      dropdownMatchSelectWidth
                      placeholder="请选择申请人"
                      showSearch
                      onColumnsChange={value => {}}
                    />
                  </Field>
                  <Field
                    name="applicantTime"
                    label="申请日期"
                    decorator={{
                      initialValue: sharingData.applicantTime,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimAmt"
                    label="报销单金额"
                    decorator={{
                      initialValue: sharingData.reimAmt,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="sharingStatus"
                    label="状态"
                    decorator={{
                      initialValue: sharingData.sharingStatus,
                    }}
                  >
                    <UdcSelect allowClear={false} code="ACC:COST_SHARE_STATUS" disabled />
                  </Field>
                </FieldList>
              </>
            )}
          </Card>
          <Card
            className="tw-card-adjust deepColorDecorator"
            bordered={false}
            style={{ marginTop: '4px' }}
          >
            {preparing || preparing === undefined ? (
              <Loading />
            ) : (
              <>
                <div className="tw-card-title">报销分摊明细</div>
                <br />
                <ReimbursementDetailList
                  baseBuDataSource={baseBuDataSource}
                  dispatch={dispatch}
                  dataSource={detailList}
                  formData={formData}
                  loading={false}
                  domain={DOMAIN}
                  readOnly={mode !== 'create'}
                />
              </>
            )}
          </Card>
          {!taskId &&
            !isEmpty(formData) && (
              <BpmConnection
                source={[
                  // { docId: id, procDefKey: formData.bookTicketFlag === 1 ? 'ACC_A62' : 'ACC_A13' },
                  { docId: id, procDefKey: 'ACC_A63' },
                ]}
              />
            )}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default BuReimbursementCreate;
