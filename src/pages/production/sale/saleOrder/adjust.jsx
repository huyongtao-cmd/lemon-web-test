import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit, type } from 'ramda';
import { Form, Input } from 'antd';
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
import { add, mul } from '@/utils/mathUtils';

// namespace声明
const DOMAIN = 'saleOrderAdjust';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, saleOrderAdjust, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/saleOrderAdjust`],
  dispatch,
  ...saleOrderAdjust,
  user,
}))
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
class adjust extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
      dispatch,
    } = this.props;
    // 租户币种信息
    dispatch({ type: `${DOMAIN}/fetchCustomSetting` });

    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId });
    this.callModelEffects('updateForm', { id });
    // this.callModelEffects('init');
    this.callModelEffects('init');
    this.callModelEffects('getCustomerList');
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
   * 调整
   */
  handleSave = (param, cb) => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData: { detailViews, planViews, ...newFormData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saleOrderAdjust`,
          payload: {
            ...newFormData,
            ...values,
            ...param,
            detailEntities: detailViews,
            planEntities: planViews,
            submit: true,
          },
        }).then(data => {
          cb && cb();
        });
      }
    });
  };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      saveLoading,
      dispatch,
      fieldsConfig,
      flowForm,
      taskId,
      detailDelViews,
      planDelViews,
      customerList,
      user: { extInfo = {} }, // 取当前登陆人的resId
      attachments,
    } = this.props;
    const { userId } = extInfo;
    const { detailViews = [], planViews = [] } = formData;

    const detailColumns = [
      {
        title: '商品名称',
        dataIndex: 'itemName',
        align: 'center',
        render: (text, record, index) => (
          <FormItem form={form} fieldType="BaseInput" fieldKey={`detailViews[${index}].itemName`} />
        ),
      },
      {
        title: '数量',
        align: 'center',
        dataIndex: 'qty',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailViews[${index}].qty`}
          />
        ),
      },
      {
        title: '单价',
        align: 'center',
        dataIndex: 'unitPrice',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailViews[${index}].unitPrice`}
          />
        ),
      },
      {
        title: '金额',
        align: 'center',
        dataIndex: 'amt',
        render: (val, row, index) =>
          row.qty && row.unitPrice ? mul(row.qty || 0, row.unitPrice || 0).toFixed(2) : '0.00',
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'taxRate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailViews[${index}].taxRate`}
            max={100}
            min={0}
            formatter={value => (value ? `${value}%` : '0%')}
            parser={value => value.replace('%', '')}
          />
        ),
      },
      {
        title: '交付日期',
        align: 'center',
        dataIndex: 'deliveryDate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`detailViews[${index}].deliveryDate`}
          />
        ),
      },
    ];

    const detailDescColumns = [
      {
        title: '商品名称',
        dataIndex: 'itemName',
        align: 'center',
      },
      {
        title: '数量',
        align: 'center',
        dataIndex: 'qty',
      },
      {
        title: '单价',
        align: 'center',
        dataIndex: 'unitPrice',
      },
      {
        title: '金额',
        align: 'center',
        dataIndex: 'amt',
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'taxRate',
      },
      {
        title: '交付日期',
        align: 'center',
        dataIndex: 'deliveryDate',
      },
    ];

    const planColumns = [
      {
        title: '收款阶段',
        dataIndex: 'collectionStage',
        align: 'center',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`planViews[${index}].collectionStage`}
            disabled={record.batchNo !== null}
          />
        ),
      },
      {
        title: '收款计划状态',
        dataIndex: 'collectionStatusDesc',
        align: 'center',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`planViews[${index}].collectionStatusDesc`}
            disabled
          />
        ),
      },
      {
        title: '开票批次号',
        dataIndex: 'batchNo',
        align: 'center',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`planViews[${index}].batchNo`}
            disabled
          />
        ),
      },
      {
        title: '当期收款金额',
        align: 'center',
        dataIndex: 'collectionAmt',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`planViews[${index}].collectionAmt`}
            disabled={record.batchNo !== null}
          />
        ),
      },
      {
        title: '当期收款比例%',
        align: 'center',
        dataIndex: 'collectionRate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`planViews[${index}].collectionRate`}
            max={100}
            min={0}
            formatter={value => (value ? `${value}%` : '0%')}
            parser={value => value.replace('%', '')}
            disabled={record.batchNo !== null}
          />
        ),
      },
      {
        title: '预计收款日期',
        align: 'center',
        dataIndex: 'expectedCollectionDate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`planViews[${index}].expectedCollectionDate`}
            disabled={record.batchNo !== null}
          />
        ),
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'taxRate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`planViews[${index}].taxRate`}
            max={100}
            min={0}
            formatter={value => (value ? `${value}%` : '0%')}
            parser={value => value.replace('%', '')}
            disabled={record.batchNo !== null}
          />
        ),
      },
    ];

    const planDescColumns = [
      {
        title: '收款阶段',
        dataIndex: 'collectionStage',
        align: 'center',
      },
      {
        title: '收款计划状态',
        dataIndex: 'collectionStatusDesc',
        align: 'center',
      },
      {
        title: '开票批次号',
        dataIndex: 'batchNo',
        align: 'center',
      },
      {
        title: '当期收款金额',
        align: 'center',
        dataIndex: 'collectionAmt',
      },
      {
        title: '当期收款比例%',
        align: 'center',
        dataIndex: 'collectionRate',
      },
      {
        title: '预计收款日期',
        align: 'center',
        dataIndex: 'expectedCollectionDate',
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'taxRate',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'SAL03_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.handleSave(
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
            <Button
              icon="upload"
              size="large"
              type="primary"
              loading={saveLoading}
              onClick={() => {
                this.handleSave({ result: 'APPROVED' }, () => {
                  closeThenGoto(`/user/flow/process?type=procs`);
                });
              }}
              // disabled={disabledBtn}
            >
              调整
            </Button>
          </ButtonCard>

          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              label="销售单名称"
              key="soName"
              fieldKey="soName"
              fieldType="BaseInput"
              required
              initialValue={formData.soName}
            />
            <FormItem
              label="销售单编号"
              key="soNo"
              fieldKey="soNo"
              fieldType="BaseInput"
              initialValue={formData.soNo}
              disabled
              plcaeholder="系统自动生成"
            />
            <FormItem
              label="客户名称"
              key="custId"
              fieldKey="custId"
              fieldType="BaseSelect"
              initialValue={formData.custId}
              descList={customerList}
            />
            <FormItem
              label="相关合同"
              key="relatedContractId"
              fieldKey="relatedContractId"
              fieldType="ContractSimpleSelect"
              initialValue={formData.relatedContractId}
              required
              onChange={(value, option) => {
                if (value) {
                  const { relatedProduct } = option[0];
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      relatedProductId: relatedProduct,
                    },
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/updateFormForEditTable`,
                    payload: {
                      relatedProductId: null,
                    },
                  });
                }
              }}
            />
            <FormItem
              label="相关产品"
              key="relatedProductId"
              fieldKey="relatedProductId"
              fieldType="ProductSimpleSelect"
              required
              initialValue={formData.relatedProductId}
            />
            <FormItem
              label="相关项目"
              key="collectionProjectId"
              fieldKey="collectionProjectId"
              fieldType="ProjectSimpleSelect"
              initialValue={formData.collectionProjectId}
            />
            <FormItem
              label="签单公司"
              key="collectionCompany"
              fieldKey="collectionCompany"
              fieldType="BaseCustomSelect"
              parentKey="CUS:INTERNAL_COMPANY"
              required
              initialValue={formData.collectionCompany}
            />
            <FormItem
              label="签单部门"
              key="collectionBuId"
              fieldKey="collectionBuId"
              fieldType="BuSimpleSelect"
              required
              initialValue={formData.collectionBuId}
            />
            <FormItem
              label="销售负责人"
              key="inchargeSaleId"
              fieldKey="inchargeSaleId"
              fieldType="ResSimpleSelect"
              required
              initialValue={formData.inchargeSaleId}
            />
            <FormItem
              label="外币业务"
              key="foreignCurrencyFlag"
              fieldKey="foreignCurrencyFlag"
              fieldType="BaseRadioSelect"
              options={[{ label: '是', value: true }, { label: '否', value: false }]}
              initialValue={formData.foreignCurrencyFlag}
              required
              onChange={e => {
                if (!e) {
                  const { customFormData } = this.props;
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      ...customFormData,
                    },
                  });
                  // 税率设置为1  重新计算本币金额、原币金额
                  // const {detailViews} = formData;
                  const tt1 = detailViews
                    .map(v => mul(v.qty || 0, v.unitPrice || 0))
                    .reduce((x = 0, y = 0) => add(x, y), 0);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      baseCurrencyAmt: tt1,
                      originalCurrencyAmt: tt1,
                      exchangeRate: 1,
                    },
                  });
                }
              }}
            />
            <FormItem
              fieldType="Group"
              label="原币/汇率"
              key="originalCurrency"
              visible={formData.foreignCurrencyFlag}
            >
              <FormItem
                key="originalCurrency"
                fieldKey="originalCurrency"
                fieldType="BaseSelect"
                parentKey="COMMON_CURRENCY"
                initialValue={formData.originalCurrency}
              />
              <FormItem
                key="exchangeRate"
                fieldKey="exchangeRate"
                fieldType="BaseInputNumber"
                initialValue={formData.exchangeRate || undefined}
                onChange={e => {
                  if (type(e) === 'Number') {
                    const { originalCurrencyAmt } = formData;
                    const tt =
                      !isNil(originalCurrencyAmt) && !isNil(e) ? mul(originalCurrencyAmt, e) : '';
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        baseCurrencyAmt: tt,
                      },
                    });
                  }
                }}
              />
            </FormItem>
            <FormItem
              label="原币金额"
              key="originalCurrencyAmt"
              fieldKey="originalCurrencyAmt"
              fieldType="BaseInputAmt"
              initialValue={formData.originalCurrencyAmt}
              disabled
              plcaeholder="系统自动计算"
              visible={formData.foreignCurrencyFlag}
            />
            <FormItem
              label="本币金额"
              key="baseCurrencyAmt"
              fieldKey="baseCurrencyAmt"
              fieldType="BaseInputAmt"
              initialValue={formData.baseCurrencyAmt}
              disabled
              plcaeholder="系统自动计算"
            />
            <FormItem
              label="销售单类型"
              fieldKey="saleType"
              key="saleType"
              fieldType="BaseCustomSelect"
              parentKey="FUNCTION:SALE:SALE_TYPE"
              initialValue={formData.saleType}
            />
            {/* <FormItem
              label="附件"
              key="productsaleorder"
              fieldKey="productsaleorder"
              fieldType="BaseFileManagerEnhance"
              dataKey={formData.id}
              api="/api/production/sale/saleOrder/sfs/token"
              listType="text"
              attach
            /> */}
            <FormItem
              fieldType="FileUpload"
              label="附件"
              key="productsaleorder"
              fieldKey="productsaleorder"
              fileList={attachments}
              multiple
              attach
            />
            <FormItem
              label="状态"
              fieldKey="soStatus"
              key="soStatus"
              fieldType="BaseSelect"
              parentKey="COM:DOC_STATUS"
              initialValue={formData.soStatus}
              disabled
            />
            <FormItem
              label="创建人"
              fieldKey="createUserId"
              key="createUserId"
              fieldType="UserSimpleSelect"
              initialValue={userId}
              disabled
            />
            <FormItem
              label="创建时间"
              fieldKey="createTime"
              key="createTime"
              fieldType="BaseInput"
              // initialValue={formData.createTime}
              disabled
            />
            <FormItem
              label="备注"
              fieldKey="remark"
              key="remark"
              fieldType="BaseInputTextArea"
              initialValue={formData.remark}
            />
            <FormItem
              fieldType="BaseInputTextArea"
              label="调整说明"
              fieldKey="soAdjustDesc"
              key="soAdjustDesc"
              required
            />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="销售单明细"
              form={form}
              columns={detailColumns}
              dataSource={detailViews}
              onDeleteConfirm={keys => {
                const newDataSource = detailViews.filter(row => keys.indexOf(row.id) < 0);
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    detailViews: newDataSource,
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    detailDelViews: [...detailDelViews, ...keys],
                  },
                });
              }}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="销售单明细"
              columns={detailDescColumns}
              dataSource={detailViews}
              prodSelection={false}
            />
          )}

          {formMode === 'EDIT' && (
            <EditTable
              title="收款计划"
              form={form}
              columns={planColumns}
              dataSource={planViews}
              getCheckboxProps={record => ({
                disabled: record.batchNo !== null,
              })}
              onDeleteConfirm={keys => {
                const newDataSource = planViews.filter(row => keys.indexOf(row.id) < 0);
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    planViews: newDataSource,
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    planDelViews: [...planDelViews, ...keys],
                  },
                });
              }}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="收款计划"
              columns={planDescColumns}
              dataSource={planViews}
              prodSelection={false}
            />
          )}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default adjust;
