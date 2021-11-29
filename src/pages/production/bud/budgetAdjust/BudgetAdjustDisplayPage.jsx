import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit } from 'ramda';
import { Form } from 'antd';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';

import { fromQs } from '@/utils/production/stringUtil.ts';
// service方法
import EditTable from '@/components/production/business/EditTable.tsx';
import DataTable from '@/components/production/business/DataTable.tsx';

import { listToTreePlus } from '@/utils/production/TreeUtil.ts';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BudgetProgress from '@/pages/production/bud/budget/BudgetProgress';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

// namespace声明
const DOMAIN = 'budgetAdjustDisplayPage';

/**
 * 预算变更 综合展示页面
 */
@connect(({ loading, dispatch, budgetAdjustDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...budgetAdjustDisplayPage,
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
class BudgetAdjustDisplayPage extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, budgetId, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    // 把url的参数保存到state
    this.updateModelState({ formMode, copy, taskId });
    this.callModelEffects('updateForm', { id, budgetId });
    this.callModelEffects('init');
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchBudgetControlType');
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
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
          },
        });
      }
    });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
            ...param,
            submit: true,
          },
        }).then(data => {
          cb && cb();
        });
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

  onExpand = (expanded, record) => {
    const { unExpandedRowKeys } = this.props;
    const set = new Set(unExpandedRowKeys);
    if (!expanded) {
      set.add(record.id);
    } else {
      set.delete(record.id);
    }
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  onExpandAdjust = (expanded, record) => {
    const { unExpandedAdjustRowKeys } = this.props;
    const set = new Set(unExpandedAdjustRowKeys);
    if (!expanded) {
      set.add(record.id);
    } else {
      set.delete(record.id);
    }
    this.updateModelState({ unExpandedAdjustRowKeys: [...set] });
  };

  /**
   * 级联修改上级金额
   */
  recursionUpdateAmt = (record, amt) => {
    const {
      formData: { details },
    } = this.props;
    // eslint-disable-next-line eqeqeq
    const parentRecord = details.filter(item => item.budgetItemId + '' == record.parentId)[0];
    const index = details.indexOf(parentRecord);
    if (parentRecord) {
      this.callModelEffects('recursionUpdateAmt', {
        index,
        detailBudgetAmt: (parentRecord.detailBudgetAmt || 0) + amt,
      }).then(data => {
        this.recursionUpdateAmt(parentRecord, amt);
      });
    }
  };

  render() {
    const {
      form,
      formData,
      formMode,
      budgetControlTypeList,
      budgetTypeList,
      unExpandedRowKeys,
      unExpandedAdjustRowKeys,
      loading,
      saveLoading,
      taskId,
      fieldsConfig,
      flowForm,
      attachments,
    } = this.props;

    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'BUD_B03', title: '预算调整流程' }];

    const { details, adjustDetails = [] } = formData;
    const expandedRowKeys = details
      .map(d => d.id)
      .filter(detail => unExpandedRowKeys.indexOf(detail) === -1);

    const tempDetails = details
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'budgetItemId');

    const expandedAdjustRowKeys = adjustDetails
      .map(d => d.id)
      .filter(detail => unExpandedAdjustRowKeys.indexOf(detail) === -1);
    const tempAdjustDetails = adjustDetails
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedAdjustDetails = listToTreePlus(tempAdjustDetails, undefined, 'budgetItemId');

    const editColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlag',
        width: '50px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseSwitch"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].detailControlFlag`}
          />
        ),
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            disabled={record.children && record.children.length > 0}
            required
            fieldType="BaseInputAmt"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].detailBudgetAmt`}
            onChange={value => {
              const changeAmt = value - (record.detailBudgetAmt || 0);
              if (!Number.isNaN(changeAmt)) {
                this.recursionUpdateAmt(record, changeAmt);
                this.callModelEffects('updateForm', {
                  totalBudgetAmt: (formData.totalBudgetAmt || 0) + changeAmt,
                });
              }
            }}
          />
        ),
      },
      {
        title: '预算比例',
        dataIndex: 'budgetRatio',
        width: '50px',
        render: (text, record, index) => (text ? text + '%' : ''),
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].configurableField1`}
          />
        ),
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].configurableField2`}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputTextArea"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].remark`}
          />
        ),
      },
    ];

    const descriptionColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlagDesc',
        width: '50px',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '预算比例',
        dataIndex: 'budgetRatio',
        width: '50px',
        render: (text, record, index) => (text ? text + '%' : ''),
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    const changeColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '是否控制变更前',
        dataIndex: 'detailControlFlagBeforeDesc',
      },
      {
        title: '是否控制变更后',
        dataIndex: 'detailControlFlagAfterDesc',
        render: (value, record, index) => {
          const style = {};
          if (record.detailControlFlagBefore !== record.detailControlFlagAfter) {
            style.color = 'red';
          }
          return <span style={style}>{value}</span>;
        },
      },
      {
        title: '预算金额变更前',
        dataIndex: 'detailBudgetAmtBefore',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '预算金额变更值',
        dataIndex: 'detailBudgetAmtDiff',
        className: 'prod-number-description',
        render: (value, record, index) => {
          const style = {};
          if (value !== 0) {
            style.color = 'red';
          }
          return <span style={style}>{isNil(value) ? '' : value.toFixed(2)}</span>;
        },
      },
      {
        title: '预算金额变更后',
        dataIndex: 'detailBudgetAmtAfter',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={saveLoading}
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
            if (taskKey === 'B02_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT' || key === 'FLOW_PASS') {
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
            {formMode === 'EDIT' && [
              <Button
                key="save"
                size="large"
                type="primary"
                onClick={() => this.handleSave()}
                loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                key="submit"
                size="large"
                type="primary"
                onClick={() =>
                  this.handleSubmit({ result: 'APPROVED' }, () => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  })
                }
                loading={saveLoading}
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
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              parentKey="CUS:CHARGE_CLASSIFICATION"
              options={budgetTypeList}
              required
              initialValue="DAILY"
              disabled
            />

            <FormItem fieldType="BaseInput" label="预算名称" fieldKey="budgetName" required />

            <FormItem fieldType="BaseInput" label="预算编码" fieldKey="budgetCode" disabled />

            <FormItem
              fieldType="BaseInput"
              label="预算部门"
              fieldKey="chargeBuName"
              descriptionField="chargeBuName"
              disabled
            />

            <FormItem
              fieldType="BaseInput"
              label="预算项目"
              fieldKey="chargeProjectName"
              disabled
            />

            <FormItem fieldType="BaseInput" label="科目模板" fieldKey="tmplName" disabled />

            <FormItem
              fieldType="BaseRadioSelect"
              label="控制策略"
              fieldKey="controlType"
              options={budgetControlTypeList}
              required
              initialValue="RIGID"
            />

            <FormItem
              fieldType="BaseDateRangePicker"
              label="起止日期"
              fieldKey="budgetDate"
              descriptionRender={`${formData.budgetStartDate || ''} ~ ${formData.budgetEndDate ||
                ''}`}
            />

            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="file"
              api="/api/production/bud/budget/sfs/token"
              dataKey={formData.id}
            /> */}

            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="附件"
              fileList={attachments}
              multiple
            />

            <FormItem
              fieldType="BaseSelect"
              label="预算状态"
              fieldKey="budgetStatus"
              parentKey="COM:DOC_STATUS"
              disabled
            />

            <FormItem
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              descriptionField="applyResName"
              disabled
              descList={[{ value: formData.resId, title: formData.resName }]}
            />

            <FormItem fieldType="BaseDatePicker" label="调整日期" fieldKey="applyDate" disabled />

            <FormItem
              fieldType="BaseInputAmt"
              label="预算总金额"
              fieldKey="totalBudgetAmt"
              disabled
            />

            <FormItem
              fieldType="Custom"
              label="使用进度"
              fieldKey="custom1"
              descriptionRender={<BudgetProgress row={formData} />}
            >
              <BudgetProgress row={formData} />
            </FormItem>

            <FormItem
              fieldType="BaseInputAmt"
              label="已拨款"
              fieldKey="totalAppropriationAmt"
              disabled
            />

            <FormItem fieldType="BaseInputAmt" label="已使用" fieldKey="usedAmt" disabled />

            <FormItem fieldType="BaseInputAmt" label="已占用" fieldKey="occupiedAmt" disabled />

            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="预算明细"
              form={form}
              columns={editColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              onExpand={this.onExpand}
              rowSelectAble={false}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="预算明细"
              columns={descriptionColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              prodSelection={false}
              onExpand={this.onExpand}
            />
          )}
          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="调整明细"
              columns={changeColumns}
              dataSource={wrappedAdjustDetails}
              expandedRowKeys={expandedAdjustRowKeys}
              prodSelection={false}
              onExpand={this.onExpandAdjust}
            />
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default BudgetAdjustDisplayPage;
