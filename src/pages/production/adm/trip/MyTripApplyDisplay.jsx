import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit, isNil } from 'ramda';
import { Form } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import EditTable from '@/components/production/business/EditTable';
import { fromQs } from '@/utils/production/stringUtil';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import update from 'immutability-helper';
import { outputHandle } from '@/utils/production/outputUtil';
import { projectManagementDetailRq } from '../../../../services/workbench/project';
import { tripExpenseDetailLogicalDelete } from '../../../../services/production/adm/trip/tripApply';
import BpmWrapper from '../../../gen/BpmMgmt/BpmWrapper';
import BpmConnection from '../../../gen/BpmMgmt/BpmConnection';
import { expenseQuotaFindQuotas } from '../../../../services/workbench/reimQuotaMgmt';
import message from '@/components/production/layout/Message.tsx';
import { add, mul, div } from '@/utils/mathUtils';

// namespace声明
const DOMAIN = 'myTripDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, myTripDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...myTripDisplayPage,
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
    const { formData } = props;
    const name = Object.keys(changedValues)[0];
    let value = changedValues[name];
    switch (name) {
      case 'relatedBudgetId':
        if (formData.chargeClassification !== 'DAILY' && !formData.chargeProjectId) {
          createMessage({
            type: 'error',
            description: '请先选择相关项目',
          });
          value = '';
        } else if (formData.chargeClassification === 'DAILY' && !formData.chargeBuId) {
          createMessage({
            type: 'error',
            description: '请先选择费用承担部门',
          });
          value = '';
        }
        break;
      default:
        break;
    }
    const newFieldData = { [name]: value };
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class MyTripApplyDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'ADD' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION'; //ADD 新增；EDIT 编辑；edit 审批；重新提交页面
    this.updateModelState({ formMode, taskId, id, copy, tripExpenseDataList: [] });
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchBudgetDescList', {
      budgetStatus: 'ACTIVE',
      limit: 0,
      clearField: 'no-clear',
    });
    this.callModelEffects('fetchExpenseClaimSiteList');
    // 页面初始化加载预算列表，如果要严格控制到项目可以在这里进行屏蔽
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init');
    taskId && this.callModelEffects('fetchConfig', taskId);
    this.callModelEffects('fetchInternalOuList');
    this.callModelEffects('fetchBudgetList');
    // this.callModelEffects('fetchFinancialAccSubjList');
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

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
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = cb => {
    this.commitFormData({ submit: false }, cb);
  };

  /**
   * 提交
   */
  handleSubmitProcess = cb => {
    this.commitFormData({ submit: true, result: 'APPROVED' }, cb);
  };

  /**
   * 提交表单数据
   */
  commitFormData = (params, cb) => {
    const { form, formData } = this.props;
    const { tripExpenseDataList } = formData;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { startEndTime } = formData;
        const startDate = startEndTime[0];
        const endDate = startEndTime[1];
        const { tripExpenseDataList: tempList } = values;
        for (let i = 0; i < tripExpenseDataList.length; i += 1) {
          tripExpenseDataList[i] = Object.assign(tripExpenseDataList[i], tempList[i]);
        }
        this.callModelEffects('save', {
          formData: {
            ...omit(['tripExpenseDataList'], formData),
            startDate,
            endDate,
            ...params,
            tripExpenseDataList,
            ...omit(['tripExpenseDataList'], values),
          },
          cb,
        });
      }
    });
  };

  deleteTripExpenseData = async keys =>
    outputHandle(tripExpenseDetailLogicalDelete, { keys: keys.join(',') }, undefined, false);

  updateQuota = (params, index) => {
    outputHandle(expenseQuotaFindQuotas, [
      {
        busiAccItemId: params.busAccItemId,
        quotaDimension1Value: params.jobGrade,
        quotaDimension2Value: params.cityLevel,
      },
    ]).then((result, other) => {
      const { data } = result.data;
      if (data.length > 0) {
        if (data[0].quotaAmt !== undefined && data[0].quotaAmt !== null) {
          const arr = [];
          arr[index] = {
            quota: data[0].currCodeDesc + ' ' + data[0].quotaAmt + '/' + data[0].timeUnitDesc,
            quotaCurrency: data[0].currCode,
            quotaUnit: data[0].timeUnit,
            quotaAmt: data[0].quotaAmt,
          };

          this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
        } else {
          const arr = [];
          arr[index] = {
            quota: '',
            quotaCurrency: undefined,
            quotaUnit: undefined,
            quotaAmt: undefined,
          };
          this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
        }
      }
    });
  };

  render() {
    // 定义渲染使用的变量
    const {
      form,
      formData,
      dispatch,
      formMode,
      taskId,
      flowForm,
      fieldsConfig,
      loading,
      saveLoading,
      submitState,
      internalOuList,
      budgetTypeList,
      budgetDescList,
      expenseClaimSiteList,
      projectSelectParam,
      businessAccItemList,
      budgetList,
      financialAccSubjList,
      user: {
        extInfo: { resId, userId, baseBuId, ouId, ouAbNo, jobGrade },
      }, // 取当前登陆人的resId
    } = this.props;
    const { setFieldsValue } = form;
    const { tripExpenseDataList, tripExpenseDataListNo } = formData;
    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'ADM_M04', title: '我的出差申请流程' }];

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
            if (taskKey === 'ADM_M04_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.commitFormData(
                  {
                    submit: true,
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
                this.commitFormData(
                  {
                    submit: true,
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                    dryRunFlag: true,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            }
            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {(formMode === 'EDIT' || formMode === 'ADD') && [
              <Button
                size="large"
                key="save"
                type="primary"
                onClick={() => {
                  this.handleSave(output => {
                    message({ type: 'success' });
                    this.callModelEffects('updateForm', { id: output.data.id });
                    this.callModelEffects('init', { id: output.data.id });
                  });
                }}
                loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                size="large"
                type="primary"
                key="submit"
                onClick={() => {
                  if (
                    tripExpenseDataList.some(item => {
                      //数据是数组，提交时只要有一条数据费用超标就会提示
                      const num = !item.qty //计算预算金额没有填写单位预算金额/1，有单位预算金额/单位
                        ? item.baseCurrencyBudgetAmt / 1
                        : item.baseCurrencyBudgetAmt / item.qty;
                      return (
                        item.quotaAmt < num && //费用标准小于预算金额
                        !item.overrunQuotaDescription && //费用超标说明不是空
                        !isNil(item.quota) && //费用标准不是空
                        item.quotaUnit === item.unit //费用标准单位和申请的单位一致
                      );
                    })
                  ) {
                    tripExpenseDataList.forEach((v, index) => {
                      const item = v;
                      if (!isNil(item.quotaUnit) && item.quotaUnit === item.unit) {
                        //费用标准单位不是null，并且费用标准单位和申请的单位一致
                        const num1 = !item.qty
                          ? item.baseCurrencyBudgetAmt / 1
                          : item.baseCurrencyBudgetAmt / item.qty;
                        if (item.quotaAmt < num1 && !item.overrunQuotaDescription) {
                          //费用标准小于预算金额，并且费用超标说明不是空
                          createMessage({
                            type: 'warn',
                            description: `第${index +
                              1}行 预算金额超过费用标准，请修改预算金额或填写超标准说明`,
                          });
                        }
                      }
                    });
                  } else if (
                    tripExpenseDataList.some(item => item.quotaUnit !== item.unit && item.quota)
                  ) {
                    createConfirm({
                      content:
                        '出差明细中计量单位和费用标准中的计量单位不一致，系统不做是否费用超标判断，请留意是否费用超标',
                      onOk: () =>
                        this.handleSubmitProcess(() => {
                          closeThenGoto(`/user/flow/process?type=procs`);
                        }),
                    });
                  } else {
                    this.handleSubmitProcess(() => {
                      closeThenGoto(`/user/flow/process?type=procs`);
                    });
                  }
                }}
                loading={saveLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="出差申请"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="申请编号"
              placeholder="系统自动完成"
              disabled
              formMode={formMode}
              fieldKey="tripNo"
            />
            <FormItem
              fieldType="BaseInput"
              label="申请名称"
              placeholder="请输入申请名称"
              formMode={formMode}
              required
              fieldKey="tripName"
            />
            <FormItem
              label="申请人"
              fieldKey="applyResId"
              fieldType="ResSimpleSelect"
              initialValue={resId}
              formMode={formMode}
              descriptionField="applyResName"
              disabled
            />
            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              parentKey="CUS:CHARGE_CLASSIFICATION"
              options={budgetTypeList}
              required
              descriptionField="chargeClassificationDesc"
              onChange={(value, option, allOptions) => {
                this.callModelEffects('fetchBudgetDescList', {
                  budgetStatus: 'ACTIVE',
                  limit: 0,
                  chargeClassification: value,
                });
                let chargeBuId = baseBuId;
                if (value === 'DAILY') {
                  const ouList = internalOuList.filter(item => item.extVarchar1 === ouAbNo);
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
                  this.callModelEffects('updateForm', {
                    chargeProjectId: undefined,
                    chargeBuId,
                    chargeCompany,
                  });
                  this.callModelEffects('fetchBudgetDescList', {
                    budgetStatus: 'ACTIVE',
                    limit: 0,
                    chargeClassification: value,
                    chargeBuId: baseBuId,
                  });
                } else {
                  chargeBuId = undefined;
                  // 更换项目列表
                  this.updateModelState({ projectSelectParam: value });
                  // 更换默认 部门列表
                  this.callModelEffects('updateForm', {
                    chargeProjectId: undefined,
                    chargeBuId,
                    chargeCompany: undefined,
                  });
                }
                this.callModelEffects('fetchBusinessAccItem', {
                  docType: 'TRIP_EXPENSE',
                  buId: chargeBuId,
                  projType: value,
                });
                this.callModelEffects('clearAllBusAccItem');
              }}
            />
            <FormItem
              fieldType="BaseDateRangePicker"
              label="出发-结束日期"
              fieldKey="startEndTime"
              descriptionRender={formData.startDate + '~' + formData.endDate}
              required
              onChange={(value, option, allOptions) => {
                let snDate = '';
                if (value !== undefined && value.length === 2) {
                  snDate = value[0] + '~' + value[1];
                  this.callModelEffects('updateForm', { startDate: value[0], endDate: value[1] });
                }
              }}
            />
            <FormItem
              label="申请日期"
              fieldKey="applyDate"
              initialValue={new Date()}
              fieldType="BaseDatePicker"
              disabled
            />
            <FormItem
              label="费用承担项目"
              fieldType="ProjectSimpleSelect"
              required={
                formData.chargeClassification === 'PROJECT' ||
                formData.chargeClassification === 'SPECIAL'
              }
              queryParam={{
                projectClass1: projectSelectParam,
                myProjectResId: resId,
                myProjectUserId: userId,
                projectStatus: 'ACTIVE',
              }}
              fieldKey="chargeProjectId"
              descriptionField="chargeProjectName"
              disabled={formData.chargeClassification === 'DAILY'}
              onChange={(value, option, allOptions) => {
                if (option.length > 0) {
                  // 根据项目查询项目所属的部门和公司
                  outputHandle(projectManagementDetailRq, { id: value }).then((result, other) => {
                    const { startEndTime } = formData;
                    let snDate = '';
                    if (startEndTime !== undefined && startEndTime.length === 2) {
                      snDate = startEndTime[0] + '~' + startEndTime[1];
                    }
                    const { inchargeBuId, inchargeCompany, projectName } = result.data;
                    this.callModelEffects('fetchBusinessAccItem', {
                      docType: 'TRIP_EXPENSE',
                      buId: inchargeBuId,
                      projType: formData.chargeClassification,
                    });
                    this.callModelEffects('updateForm', {
                      relatedBudgetId: undefined,
                      //tripBudgetAmt: undefined,
                      chargeBuId: inchargeBuId,
                      chargeCompany: inchargeCompany,
                    });
                    // 根据项目查询预算列表
                    if (inchargeBuId) {
                      this.callModelEffects('fetchBudgetDescList', {
                        budgetStatus: 'ACTIVE',
                        limit: 0,
                        chargeProjectId: value,
                        chargeBuId: inchargeBuId,
                        chargeClassification: formData.chargeClassification,
                      });
                    } else {
                      this.callModelEffects('fetchBudgetDescList', {
                        budgetStatus: 'ACTIVE',
                        limit: 0,
                        chargeProjectId: value,
                        chargeClassification: formData.chargeClassification,
                      });
                    }
                  });
                }
              }}
            />

            <FormItem
              label="费用承担部门"
              fieldType="BuSimpleSelect"
              required
              fieldKey="chargeBuId"
              descriptionField="chargeBuName"
              // initialValue={formData.chargeClassification === 'DAILY' ? baseBuId : ''}
              onChange={(value, option) => {
                if (option.length > 0) {
                  const ouList = internalOuList.filter(
                    item => item.extVarchar1 === option[0].ouAbNo
                  );
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
                  // 根据项目查询预算列表
                  if (formData.chargeProjectId) {
                    this.callModelEffects('fetchBudgetDescList', {
                      budgetStatus: 'ACTIVE',
                      limit: 0,
                      chargeProjectId: formData.chargeProjectId,
                      chargeBuId: value,
                      chargeClassification: formData.chargeClassification,
                    });
                  } else {
                    this.callModelEffects('fetchBudgetDescList', {
                      budgetStatus: 'ACTIVE',
                      limit: 0,
                      chargeBuId: value,
                      chargeClassification: formData.chargeClassification,
                    });
                  }
                  this.callModelEffects('updateForm', {
                    chargeBuType: option.buType,
                    chargeCompany,
                  });
                  this.callModelEffects('fetchBusinessAccItem', {
                    docType: 'TRIP_EXPENSE',
                    butmplType: option[0].buType,
                    projType: formData.chargeClassification,
                  }).then(res => {
                    if (!res) {
                      setFieldsValue({ chargeBuId: '' });
                    }
                  });
                }
              }}
            />
            <FormItem
              label="费用承担公司"
              fieldType="BaseSelect"
              // disabled
              fieldKey="chargeCompany"
              descriptionField="chargeCompanyName"
              descList={internalOuList}
            />
            <FormItem
              label="相关预算"
              fieldType="BaseSelect"
              required
              disabled={false}
              fieldKey="relatedBudgetId"
              descriptionField="budgetName"
              descList={budgetDescList}
              onChange={(value, option, allOptions) => {
                // outputHandle(budgetDetail, {id: value}).then((result, other) => {
                //   this.callModelEffects('updateForm', {tripBudgetAmt: result.data.totalBudgetAmt});
                // });
              }}
            />
            {/*根据费用明细进行汇总*/}
            <FormItem
              fieldType="BaseInputAmt"
              label="总预算金额"
              disabled
              fieldKey="tripBudgetAmt"
            />

            <FormItem
              fieldType="BaseSelect"
              label="状态"
              placeholder="自动生成"
              disabled
              descriptionField="tripApplyStatusDesc"
              parentKey="COM:DOC_STATUS"
              fieldKey="tripApplyStatus"
            />

            <FormItem
              fieldType="BaseInputTextArea"
              label="出差说明"
              fieldKey="tripDescription"
              required
            />
          </BusinessForm>
          <EditTable
            form={form}
            formMode={formMode}
            tableTitle="费用明细"
            dataSource={tripExpenseDataList} // 获取数据的方法,请注意获取数据的格式
            columns={[
              {
                title: '费用编号',
                width: '100px',
                required: true,
                dataIndex: 'tripExpenseNo',
                sorter: true,
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    fieldType="BaseInput"
                    fieldKey={`tripExpenseDataList[${i}].tripExpenseNo`}
                    disabled
                  />
                ),
              },
              {
                title: '费用状态',
                required: true,
                dataIndex: 'tripExpenseStatus',
                width: '100px',
                // required: true, // 需要展示必须填入的配置
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    required
                    fieldType="BaseSelect"
                    fieldKey={`tripExpenseDataList[${i}].tripExpenseStatus`}
                    parentKey="ADM:TRIP_EXPENSE_STATUS"
                    disabled
                    initialValue="UNAPPROVED"
                  />
                ),
              },
              {
                title: '出差人',
                width: 200,
                required: true,
                dataIndex: 'tripResId',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    required
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="ResSimpleSelect"
                    fieldKey={`tripExpenseDataList[${i}].tripResId`}
                    initialValue={resId}
                    onChange={(value, option) => {
                      if (option.length > 0) {
                        const arr = [
                          {
                            jobGrade: option[0].jobGrade,
                          },
                        ];
                        this.updateQuota({ ...row, ...{ jobGrade: option[0].jobGrade } }, i);
                        this.callModelEffects('updateFormForEditTable', {
                          tripExpenseDataList: arr,
                        });
                      }
                    }}
                  />
                ),
              },
              // {
              //   title: '职级',
              //   width: 100,
              //   required: true,
              //   dataIndex: 'jobGrade',
              //   render: (val, row, i) => (
              //     <FormItem
              //       form={form}
              //       required
              //       // disabled={formMode === 'DESCRIPTION'}
              //       disabled
              //       fieldType="BaseCustomSelect"
              //       fieldKey={`tripExpenseDataList[${i}].jobGrade`}
              //       parentKey="CUS:JOB_GRADE"
              //       initialValue={jobGrade}
              //     />
              //   ),
              // },
              {
                title: '出差地',
                width: 250,
                required: true,
                dataIndex: 'tripCity',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    required
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseCustomSelect"
                    fieldKey={`tripExpenseDataList[${i}].tripCity`}
                    parentKey="CUS:CITY"
                    onChange={(value, option, allOptions) => {
                      if (option.length > 0) {
                        const arr = [];
                        arr[i] = {
                          cityLevel: option[0].extVarchar1,
                        };
                        this.updateQuota({ ...row, cityLevel: option[0].extVarchar1 }, i);
                        this.callModelEffects('updateFormForEditTable', {
                          tripExpenseDataList: arr,
                        });
                      }
                    }}
                  />
                ),
              },
              {
                title: '城市级别',
                width: 150,
                dataIndex: 'cityLevel',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    // disabled={formMode === 'DESCRIPTION'}
                    disabled
                    fieldType="BaseCustomSelect"
                    fieldKey={`tripExpenseDataList[${i}].cityLevel`}
                    parentKey="CUS:CITY_LEVEL"
                  />
                ),
              },
              {
                title: '核算项目',
                width: '200px',
                required: true,
                dataIndex: 'busAccItemId',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    fieldType="BaseTreeSelect"
                    parentSelectAble={false}
                    required
                    disabled={formMode === 'DESCRIPTION'}
                    fieldKey={`tripExpenseDataList[${i}].busAccItemId`}
                    options={businessAccItemList}
                    optionsKeyField="busAccItemId"
                    onChange={(value, option) => {
                      if (option.length > 0) {
                        const arr = [];
                        arr[i] = {
                          budgetItemId: option[0].budgetItemId,
                        };
                        // 费用标准 busiAccItemId:核算项目，quotaDimension1Value：职位级别，quotaDimension2Value；城市级别
                        this.updateQuota(
                          {
                            ...omit(['busAccItemId'], row),
                            busAccItemId: value,
                            budgetItemId: option[0].budgetItemId,
                          },
                          i
                        );
                        this.callModelEffects('updateFormForEditTable', {
                          tripExpenseDataList: arr,
                        });
                      }
                    }}
                  />
                ),
              },
              {
                title: '预算项目',
                dataIndex: 'budgetItemId',
                required: true,
                width: '200px',
                render: (text, record, index) => (
                  <FormItem
                    form={form}
                    fieldType="BaseTreeSelect"
                    parentSelectAble={false}
                    required
                    fieldKey={`tripExpenseDataList[${index}].budgetItemId`}
                    options={budgetList}
                    disabled={formMode === 'DESCRIPTION'}
                  />
                ),
              },
              // {
              //   title: '会计科目',
              //   dataIndex: 'finAccSubjId',
              //   visible: false,
              //   render: (text, record, index) => (
              //     <FormItem
              //       form={form}
              //       fieldType="BaseTreeSelect"
              //       disabled
              //       fieldKey={`details[${index}].finAccSubjId`}
              //       options={financialAccSubjList}
              //     />
              //   ),
              // },
              {
                title: '数量/单位',
                width: 100,
                colSpan: 2,
                dataIndex: 'qty',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseInputNumber"
                    fieldKey={`tripExpenseDataList[${i}].qty`}
                  />
                ),
              },
              {
                title: '单位',
                width: 100,
                colSpan: 0,
                dataIndex: 'unit',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseSelect"
                    fieldKey={`tripExpenseDataList[${i}].unit`}
                    parentKey="COM:TIME_UNIT"
                  />
                ),
              },
              {
                title: '费用标准',
                width: 170,
                dataIndex: 'quota',
                render: (val, row, i) => tripExpenseDataList[i].quota,
              },
              {
                title: '预算金额（本位币）',
                width: 100,
                required: true,
                dataIndex: 'baseCurrencyBudgetAmt',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    required
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseInputAmt"
                    fieldKey={`tripExpenseDataList[${i}].baseCurrencyBudgetAmt`}
                    onBlur={() => {
                      let allAmt = 0;
                      tripExpenseDataList.forEach(te => {
                        allAmt +=
                          te.baseCurrencyBudgetAmt === undefined ? 0 : te.baseCurrencyBudgetAmt;
                      });
                      this.callModelEffects('updateForm', { tripBudgetAmt: allAmt });
                    }}
                  />
                ),
              },
              {
                title: '费用超标说明',
                width: 200,
                dataIndex: 'overrunQuotaDescription',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseInput"
                    fieldKey={`tripExpenseDataList[${i}].overrunQuotaDescription`}
                  />
                ),
              },
              {
                title: '备注',
                width: 150,
                dataIndex: 'remark',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseInput"
                    fieldKey={`tripExpenseDataList[${i}].remark`}
                  />
                ),
              },
              {
                title: '费用结算方',
                width: '250px',
                required: true,
                dataIndex: 'expenseClaimSite',
                render: (val, row, i) => (
                  <FormItem
                    form={form}
                    required
                    disabled={formMode === 'DESCRIPTION'}
                    fieldType="BaseRadioSelect"
                    fieldKey={`tripExpenseDataList[${i}].expenseClaimSite`}
                    parentKey="ADM:EXPENSE_CLAIM_SITE"
                    options={expenseClaimSiteList}
                  />
                ),
              },
            ]} //{columns} // 要展示的列
            style={{ overflow: 'hidden' }}
            onAddClick={
              formMode !== 'EDIT' && formMode !== 'ADD'
                ? undefined
                : () => {
                    const currentSerNo =
                      (tripExpenseDataListNo === undefined ? 0 : tripExpenseDataListNo) + 1;
                    if (formData.relatedBudgetId) {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          tripExpenseDataList: update(tripExpenseDataList, {
                            $push: [
                              {
                                id: currentSerNo,
                                tripExpenseStatus: 'UNAPPROVED',
                                jobGrade,
                                tripResId: resId,
                                tripExpenseNo:
                                  'TE-' +
                                  (currentSerNo < 10 ? '0' + currentSerNo : currentSerNo + ''),
                              },
                            ],
                          }),
                          tripExpenseDataListNo: currentSerNo,
                        },
                      });
                    } else {
                      createMessage({
                        type: 'error',
                        description: '请确认费用归属、费用承担部门、相关预算等信息已正确填写',
                      });
                    }
                  }
            } // 新增按钮逻辑,不写不展示
            scroll={{ x: 2500 }}
            onDeleteConfirm={
              formMode !== 'EDIT' && formMode !== 'ADD'
                ? undefined
                : keys => {
                    const newDataSource = tripExpenseDataList.filter(
                      row => keys.indexOf(row.id) < 0
                    );
                    const allAmt = newDataSource
                      .map(v => v.baseCurrencyBudgetAmt || 0)
                      .reduce((x = 0, y = 0) => add(x, y), 0);
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { tripExpenseDataList: newDataSource, tripBudgetAmt: allAmt },
                    });
                    // if (formMode === 'EDIT') {
                    //   this.deleteTripExpenseData(keys);
                    // }
                  }
            }
          />
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default MyTripApplyDisplay;
