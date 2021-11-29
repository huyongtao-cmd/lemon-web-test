import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit } from 'ramda';
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

// namespace声明
const DOMAIN = 'tripDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, tripDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...tripDisplayPage,
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
class MyTripApplyDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'ADD' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    this.updateModelState({ formMode, id, copy, tripExpenseDataList: [] });
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchBudgetDescList');
    this.callModelEffects('fetchExpenseClaimSiteList');
    // 页面初始化加载预算列表，如果要严格控制到项目可以在这里进行屏蔽
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init');
    taskId && this.callModelEffects('fetchConfig', taskId);
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
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    this.commitFormData({ submit: false });
  };

  /**
   * 提交
   */
  handleSubmitProcess = () => {
    this.commitFormData({ submit: true });
  };

  /**
   * 提交表单数据
   */
  commitFormData = params => {
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
        });
      }
    });
  };

  deleteTripExpenseData = async keys =>
    outputHandle(tripExpenseDetailLogicalDelete, { keys: keys.join(',') }, undefined, false);

  updateQuota = params => {
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
          const arr = [
            {
              quota: data[0].currCodeDesc + ' ' + data[0].quotaAmt + '/' + data[0].timeUnitDesc,
              quotaCurrency: data[0].currCode,
              quotaUnit: data[0].timeUnit,
              quotaAmt: data[0].quotaAmt,
            },
          ];
          this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
        } else {
          const arr = [
            {
              quota: '',
              quotaCurrency: undefined,
              quotaUnit: undefined,
              quotaAmt: undefined,
            },
          ];
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
      budgetTypeList,
      budgetDescList,
      internalOuList,
      expenseClaimSiteList,
      projectSelectParam,
      businessAccItemList,
      user: {
        extInfo: { resId, userId, baseBuId, ouAbNo, ouId, jobGrade },
      }, // 取当前登陆人的resId
    } = this.props;
    const { tripExpenseDataList, tripExpenseDataListNo } = formData;
    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'AMD_M04', title: '预算申请流程' }];

    // 表格展示列
    const columns = [
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
        width: '200px',
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
              this.updateQuota(row);
              if (option.length > 0) {
                const arr = [
                  {
                    jobGrade: option[0].jobGrade,
                  },
                ];
                this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
              }
            }}
          />
        ),
      },
      {
        title: '职级',
        width: '100px',
        required: true,
        dataIndex: 'jobGrade',
        render: (val, row, i) => (
          <FormItem
            form={form}
            required
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseCustomSelect"
            fieldKey={`tripExpenseDataList[${i}].jobGrade`}
            parentKey="CUS:JOB_GRADE"
            initialValue={jobGrade}
            onChange={() => this.updateQuota(row)}
          />
        ),
      },
      {
        title: '出差地',
        width: 200,
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
              this.updateQuota(row);
              if (option.length > 0) {
                const arr = [];
                arr[i] = {
                  cityLevel: option[0].extVarchar1,
                };
                this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
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
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseCustomSelect"
            fieldKey={`tripExpenseDataList[${i}].cityLevel`}
            parentKey="CUS:CITY_LEVEL"
            onChange={() => this.updateQuota(row)}
          />
        ),
      },
      {
        title: '核算项目',
        width: '200px',
        required: true,
        dataIndex: 'budgetItemId',
        render: (val, row, i) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
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
                this.callModelEffects('updateFormForEditTable', { tripExpenseDataList: arr });
              }
              // 费用标准 busiAccItemId:核算项目，quotaDimension1Value：职位级别，quotaDimension2Value；城市级别
              this.updateQuota(row);
            }}
          />
        ),
      },
      {
        title: '数量/单位',
        width: 100,
        colSpan: 2,
        dataIndex: 'qty',
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseInput"
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
                allAmt += te.baseCurrencyBudgetAmt === undefined ? 0 : te.baseCurrencyBudgetAmt;
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
            if (taskKey === 'ADM_M04_01_SUBMIT_i') {
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
            {(formMode === 'EDIT' || formMode === 'ADD') && [
              <Button size="large" type="primary" onClick={this.handleSave} loading={saveLoading}>
                保存
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
              label="ID"
              placeholder="ID"
              disabled
              visible={false}
              fieldKey="id"
            />
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
              placeholder=""
              disabled={false}
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
                if (value === 'DAILY') {
                  const ouList = internalOuList.filter(item => item.extVarchar1 === ouAbNo);
                  const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;
                  this.callModelEffects('updateForm', {
                    chargeProjectId: undefined,
                    chargeBuId: baseBuId,
                    chargeCompany,
                  });
                } else {
                  // 更换项目列表
                  this.updateModelState({ projectSelectParam: value });
                  // 更换默认 部门列表
                  this.callModelEffects('updateForm', {
                    chargeProjectId: undefined,
                    chargeBuId: undefined,
                    chargeCompany: undefined,
                  });
                }
              }}
            />
            <FormItem fieldType="BaseInput" visible={false} label="出发日期" fieldKey="startDate" />
            <FormItem fieldType="BaseInput" visible={false} label="出发日期" fieldKey="endDate" />
            <FormItem
              fieldType="BaseDateRangePicker"
              label="出发-结束日期"
              fieldKey="startEndTime"
              required
              onChange={(value, option, allOptions) => {
                let snDate = '';
                if (value !== undefined && value.length === 2) {
                  snDate = value[0] + '~' + value[1];
                  this.callModelEffects('updateForm', { startDate: value[0], endDate: value[1] });
                }
                // 根据项目查询项目所属的部门和公司
                const { chargeProjectId } = formData;
                if (chargeProjectId !== undefined) {
                  outputHandle(projectManagementDetailRq, { id: chargeProjectId }).then(
                    (result, other) => {
                      const { projectName } = result.data;
                      this.callModelEffects('updateForm', {
                        tripName: projectName + '~' + (snDate === undefined ? '' : snDate),
                      });
                    }
                  );
                } else {
                  this.callModelEffects('updateForm', {
                    tripName: snDate === undefined ? '' : snDate,
                  });
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
              fieldType="ProjectSimpleSelect"
              label="费用承担项目"
              queryParam={{ projectClass1: projectSelectParam }}
              fieldKey="chargeProjectId"
              descriptionField="chargeProjectName"
              disabled={formData.chargeClassification === 'DAILY'}
              onChange={(value, option, allOptions) => {
                // 根据项目查询预算列表
                this.callModelEffects('fetchBudgetDescList', { chargeProjectId: value });

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
                  });
                  this.callModelEffects('updateForm', {
                    relatedBudgetId: undefined,
                    //tripBudgetAmt: undefined,
                    chargeBuId: inchargeBuId,
                    chargeCompany: inchargeCompany,
                    tripName: projectName + '~' + (snDate === undefined ? '' : snDate),
                  });
                });
              }}
            />

            <FormItem
              fieldType="BuSimpleSelect"
              label="费用承担部门"
              required
              fieldKey="chargeBuId"
              descriptionField="chargeBuName"
              // initialValue={formData.chargeClassification === 'DAILY' ? baseBuId : ''}
              onChange={(value, option) => {
                const ouList = internalOuList.filter(item => item.extVarchar1 === option[0].ouAbNo);
                const chargeCompany = ouList.length > 0 ? ouList[0].value : undefined;

                this.callModelEffects('updateForm', { chargeBuType: option.buType, chargeCompany });
                this.callModelEffects('fetchBusinessAccItem', {
                  docType: 'TRIP_EXPENSE',
                  butmplType: option[0].buType,
                });
              }}
            />
            <FormItem
              fieldType="BaseCustomSelect"
              label="费用承担公司"
              disabled
              fieldKey="chargeCompany"
              descriptionField="chargeCompanyName"
              descList={internalOuList}
            />
            <FormItem
              fieldType="BaseSelect"
              label="相关预算"
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

            <FormItem fieldType="BaseInputTextArea" label="出差说明" fieldKey="tripDescription" />
          </BusinessForm>
          <EditTable
            form={form}
            formMode={formMode}
            tableTitle="费用明细"
            dataSource={tripExpenseDataList} // 获取数据的方法,请注意获取数据的格式
            columns={columns} //{columns} // 要展示的列
            style={{ overflow: 'hidden' }}
            onAddClick={
              formMode !== 'EDIT' && formMode !== 'ADD'
                ? undefined
                : () => {
                    const currentSerNo =
                      (tripExpenseDataListNo === undefined ? 0 : tripExpenseDataListNo) + 1;
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
                  }
            } // 新增按钮逻辑,不写不展示
            scroll={{ x: 2300 }}
            onDeleteConfirm={
              formMode !== 'EDIT' && formMode !== 'ADD'
                ? undefined
                : keys => {
                    const newDataSource = tripExpenseDataList.filter(
                      row => keys.indexOf(row.id) < 0
                    );
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { tripExpenseDataList: newDataSource },
                    });
                    if (formMode === 'EDIT') {
                      this.deleteTripExpenseData(keys);
                    }
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
