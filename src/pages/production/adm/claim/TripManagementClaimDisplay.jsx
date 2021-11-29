import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit } from 'ramda';
import { Form, Input, Tooltip } from 'antd';
import moment from 'moment';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
import { systemLocaleListPaging, systemLocaleLogicalDelete } from '@/services/production/system';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import EditTable from '@/components/production/business/EditTable.tsx';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import DataTable from '@/components/production/business/DataTable.tsx';
import { closeThenGoto } from '@/layouts/routerControl';
import message from '@/components/production/layout/Message.tsx';
import { getUrl } from '@/utils/flowToRouter';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { remindString } from '@/components/production/basic/Remind.tsx';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import styles from './index.less';
import classnames from 'classnames';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

// namespace声明
const DOMAIN = 'tripManagementClaimDisplayPage';
const procKey = 'ADM_M07';

/**
 * 单表案例 综合展示页面
 */
@connect(
  ({ loading, dispatch, tripManagementClaimDisplayPage, bookingByAdminList, user: { user } }) => ({
    loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
    saveLoading: loading.effects[`${DOMAIN}/save`],
    dispatch,
    ...tripManagementClaimDisplayPage,
    ...bookingByAdminList,
    user,
  })
)
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class TripManagementClaimDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId, from } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
      selectedRows,
      baseCurrencyBookTotalAmt,
    } = this.props;
    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId });

    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init').then(data => {
      this.callModelEffects('fetchAbAccByCompanys', { companyCodes: data.chargeCompany }); //根据费用承担公司获取付款银行账号
      taskId &&
        this.callModelEffects('fetchConfig', taskId).then(res => {
          this.callModelEffects('fetchFinancialAccSubjList').then(listRes => {
            const tt = listRes.filter(v => v.accCode === '224103')[0] || {};
            const { taskKey } = res;
            if (taskKey === 'ADM_M07_03_FIN_AUDIT_APPROVAL') {
              const { chargeClassification, finAccSubjId } = data;
              if (
                (chargeClassification === 'DAILY' || chargeClassification === 'SPECIAL') &&
                !finAccSubjId
              ) {
                this.callModelEffects('updateForm', {
                  finAccSubjId: tt.id,
                  finAccSubjIdDesc: '其他应付款-日常',
                });
              }
            }
          });
        });
    });
    this.callModelEffects('fetchFinancialAccSubjList');
    if (from === 'bookingByAdminList') {
      const tripTicketBookingIdArr = selectedRows.map(item => item.tripTicketBookingId);
      this.callModelEffects('updateForm', {
        // baseCurrencyClaimAmt: baseCurrencyBookTotalAmt,
        tripTicketBookingIdArr,
      });
      //将相应费用编号下的所有行政订票明细查出 如果一个行政订票有多个明细 但是只选择了一条 必须把其他数据也带出来
      this.callModelEffects('getAllBookingDetail', tripTicketBookingIdArr);
      this.callModelEffects('fetchAccountList', {
        abNo: selectedRows[0].abNo,
        accStatus: 'ACTIVE',
      });
    }
    taskId === undefined && this.callModelEffects('fetchInternalOuList');
    taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { response } = await systemLocaleListPaging(params);
    return response.data;
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

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', {
          formData: {
            ...omit(['applyStatus'], formData),
            ...param,
            ...values,
            submit: true,
            applyStatus: 'APPROVING',
          },
        }).then(data => {
          cb && cb();
        });
      }
    });
  };

  /**
   * 保存
   */
  handleSave = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', { formData: { ...formData, ...param, ...values } }).then(
          data => {
            cb && cb();
          }
        );
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  /**
   * 时间设置为null
   */
  // setTimeNull = () => {
  //   const {
  //     formData: { id },
  //   } = this.props;
  //   this.callModelEffects('setTimeNull', { id, nullFields: ['testTime'] });
  // };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      saveLoading,
      fieldsConfig,
      flowForm,
      taskId,
      financialAccSubjList,
      accountList,
      // baseCurrencyBookTotalAmt,
      applyStatus,
      payAccountList,
      currentNode,
      selectedRows,
      user: { extInfo = {} }, // 取当前登陆人的resId
      attachments,
    } = this.props;

    const { details, baseCurrencyClaimAmt } = formData;
    const { taskKey } = fieldsConfig;
    const diabledView = taskKey === 'ADM_M07_03_FIN_AUDIT_APPROVAL';

    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: procKey, title: '行政订票结算流程' }];

    const {
      ticketBookSite,
      supplierId,
      chargeCompany,
      tripTicketClaimName,
      tripTicketBookingId,
    } = selectedRows[0];

    const paymentColumns = [
      {
        title: '商品名称',
        dataIndex: 'temName',
        width: '200px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`details[${index}].temName`}
            disabled
          />
        ),
      },
      {
        title: '数量',
        dataIndex: 'qty',
        width: '80px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`details[${index}].qty`}
            initialValue={1}
            disabled
          />
        ),
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        width: '180px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`details[${index}].unitPrice`}
            disabled
          />
        ),
      },
      {
        title: '金额',
        dataIndex: 'amt',
        width: '180px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`details[${index}].amt`}
            disabled
          />
        ),
      },
      {
        title: '交付日期',
        dataIndex: 'deliveryDate',
        width: '160px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`details[${index}].deliveryDate`}
            disabled
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '150px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`details[${index}].remark`}
            disabled={formMode === 'DESCRIPTION' || diabledView}
          />
        ),
      },
      {
        title: '明细ID',
        dataIndex: 'id',
        width: '0px',
        className: `${styles.button}`,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`details[${index}].id`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
      {
        title: '出差明细ID',
        dataIndex: 'tripExpenseId',
        width: '0px',
        className: `${styles.button}`,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`details[${index}].tripExpenseId`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
    ];
    const paymentDescColumns = [
      {
        title: '商品名称',
        dataIndex: 'temName',
        width: '200px',
      },
      {
        title: '数量',
        dataIndex: 'qty',
        width: '50px',
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        width: '150px',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        width: '150px',
      },
      {
        title: '交付日期',
        dataIndex: 'deliveryDate',
        width: '200px',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          scope={procKey}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            //const { taskKey } = fieldsConfig;
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'ADM_M07_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.handleSubmit(
                  {
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            } else if (
              (taskKey === 'ADM_M07_06_CASHIER_PAYMENT' || 'ADM_M07_03_FIN_AUDIT_APPROVAL') &&
              key === 'FLOW_PASS'
            ) {
              if (taskKey === 'ADM_M07_03_FIN_AUDIT_APPROVAL') {
                if (!formData.finAccSubjId) {
                  createMessage({ type: 'error', description: '请编辑会计科目！' });
                  return Promise.resolve(false);
                }
              }
              // 出纳付款节点，审批通过时需要保存付款银行账户
              this.handleSave(
                {
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                  submit: true,
                },
                () => {
                  const url = getUrl().replace('edit', 'view');
                  closeThenGoto(url);
                }
              );
              return Promise.resolve(false);
            } else {
              if (key === 'FLOW_RETURN') {
                createConfirm({
                  content: '确定要拒绝该流程吗？',
                  onOk: () =>
                    pushFlowTask(taskId, {
                      remark,
                      result: 'REJECTED',
                      branch,
                    }).then(({ status, response }) => {
                      if (status === 200) {
                        createMessage({ type: 'success', description: '操作成功' });
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      }
                      return Promise.resolve(false);
                    }),
                });
              }
              if (key === 'FLOW_PASS') {
                return Promise.resolve(true);
              }
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' && [
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  this.handleSave({}, () => {});
                }}
                loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                size="large"
                type="primary"
                loading={saveLoading}
                onClick={() =>
                  this.handleSubmit({ result: 'APPROVED' }, () => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  })
                }
              >
                提交
              </Button>,
            ]}
            {formMode === 'DESCRIPTION' &&
              formData.budgetStatus === 'CREATE' && (
                <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
                  编辑
                </Button>
              )}
            {formData.id &&
              formData.id > 0 && (
                <a
                  href={`/print?scope=${procKey}&id=${fromQs().id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', marginRight: 8, float: 'right' }}
                >
                  <Tooltip title="打印单据">
                    <Button
                      className={classnames('tw-btn-default')}
                      type="dashed"
                      icon="printer"
                      size="large"
                    />
                  </Tooltip>
                </a>
              )}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="结算单号"
              fieldKey="tripTicketClaimNo"
              placeholder="系统字段生成"
              disabled
            />

            <FormItem
              fieldType="BaseInput"
              label="结算单名称"
              fieldKey="tripTicketClaimName"
              required
              initialValue={tripTicketClaimName}
              disabled={diabledView}
            />

            <FormItem
              fieldType="BaseCustomSelect"
              label="订票方"
              fieldKey="ticketBookSite"
              parentKey="CUS:TICKET_BOOK_SITE"
              disabled
              initialValue={ticketBookSite}
            />

            <FormItem
              fieldType="BaseInputAmt"
              label="结算金额（本位币）"
              fieldKey="baseCurrencyClaimAmt"
              disabled
              initialValue={baseCurrencyClaimAmt}
            />

            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="attachment"
              api="/api/production/adm/tripTicketClaim/sfs/token"
              dataKey={formData.id}
              disabled={diabledView}
            /> */}
            <FormItem
              fieldType="FileUpload"
              fieldKey="attachment"
              label="附件"
              fileList={attachments}
              multiple
              preview={diabledView}
            />

            <FormItem
              fieldType="SupplierSimpleSelect"
              label="供应商"
              fieldKey="supplierId"
              descriptionField="supplierName"
              disabled
              initialValue={supplierId}
              onChange={(value, option, allOptions) => {
                this.callModelEffects('fetchAccountList', {
                  abNo: option[0].supplierNo,
                  accStatus: 'ACTIVE',
                });
              }}
            />

            <FormItem
              fieldType="BaseCustomSelect"
              label="费用承担公司"
              fieldKey="chargeCompany"
              parentKey="CUS:INTERNAL_COMPANY"
              disabled
              initialValue={chargeCompany}
            />

            <FormItem
              fieldType="BaseSelect"
              label="状态"
              fieldKey="applyStatus"
              parentKey="COM:APPLY_STATUS"
              disabled
              initialValue={applyStatus}
            />
            <FormItem
              form={form}
              fieldType="BaseTreeSelect"
              label="会计科目"
              required={diabledView}
              fieldKey="finAccSubjId"
              options={financialAccSubjList}
              disabled={!diabledView}
            />
            <FormItem
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              descriptionField="applyResName"
              initialValue={extInfo.resId}
              disabled
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="申请日期"
              initialValue={moment().format('YYYY-MM-DD')}
              fieldKey="applyDate"
              descriptionField="applyDate"
              disabled
            />

            <FormItem
              fieldType="BaseInputTextArea"
              label="备注"
              fieldKey="remark"
              disabled={diabledView}
            />
          </BusinessForm>

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="行政订票明细"
              columns={paymentDescColumns}
              dataSource={details}
              prodSelection={false}
            />
          )}

          {formMode === 'EDIT' && (
            <EditTable
              title="行政订票明细"
              form={form}
              columns={paymentColumns}
              dataSource={details}
            />
          )}

          <BusinessForm title="支付信息" form={form} formData={formData} defaultColumnStyle={8}>
            <FormItem
              fieldType="BaseSelect"
              label="付款银行账户"
              fieldKey="payAccountNo"
              descList={payAccountList}
              required={currentNode === 'cashEdit'}
              disabled={currentNode !== 'cashEdit'}
              onChange={(value, options) => {
                this.updateModelState({
                  formData: {
                    ...formData,
                    payHolderName: options[0]?.holderName,
                    payBankBranch: options[0]?.bankBranch,
                  },
                });
              }}
            />
            <FormItem fieldType="BaseInput" label="付款户名" fieldKey="payHolderName" disabled />
            <FormItem
              fieldType="BaseInput"
              label="付款银行网点"
              fieldKey="payBankBranch"
              disabled
            />
            <FormItem
              fieldType="BaseCustomSelect"
              label="支付方式"
              fieldKey="paymentMethod"
              descriptionField="paymentMethodDesc"
              parentKey="CUS:PAYMENT_METHOD"
              disabled={diabledView || formMode === 'DESCRIPTION'}
              required
            />

            <FormItem
              fieldType="BaseSelect"
              label="收款账号"
              fieldKey="accountNo"
              descriptionField="accountNo"
              required
              descList={accountList}
              disabled={diabledView || formMode === 'DESCRIPTION'}
              onChange={(value, option, allOptions) => {
                const { bankName, holderName, bankBranch } = option[0];
                this.callModelEffects('updateForm', { bankName, holderName, bankBranch });
              }}
            />

            <FormItem fieldType="Group" label="支付金额">
              <FormItem
                fieldType="BaseInputAmt"
                fieldKey="paymentAmt"
                descriptionField="paymentAmt"
                disabled
                initialValue={baseCurrencyClaimAmt}
              />
              <FormItem
                fieldType="BaseSelect"
                fieldKey="originalCurrency"
                parentKey="COMMON_CURRENCY"
                descriptionField="originalCurrencyDesc"
                disabled
              />
            </FormItem>

            <FormItem fieldType="BaseInput" label="户名" fieldKey="holderName" disabled />

            <FormItem fieldType="BaseInput" label="收款银行" fieldKey="bankName" disabled />

            <FormItem fieldType="BaseInput" label="收款银行网点" fieldKey="bankBranch" disabled />
          </BusinessForm>
          {!taskId && <BpmConnection source={allBpm} />}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}
export default TripManagementClaimDisplay;
