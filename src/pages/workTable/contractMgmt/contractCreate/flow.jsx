import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import RelatedDocs from './components/RelatedDocs';
import { fromQs } from '@/utils/production/stringUtil';
import { createConfirm } from '@/components/core/Confirm';
import { submitOrApprRq } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { remindString } from '@/components/production/basic/Remind';

import styles from './style.less';

const DOMAIN = 'contractFlowApprove';

@connect(({ user: { user }, loading, contractFlowApprove, dispatch }) => ({
  loading,
  ...contractFlowApprove,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class index extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    // // 调用页面载入初始化方法,一般是请求页面数据
    // // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    // const { id, copy, mode } = fromQs();
    // // 把url的参数保存到state
    // this.updateModelState({ formMode: mode, id, copy });
    // this.callModelEffects('init');

    const { id: ids, taskId: taskIds, mode: modes } = fromQs();
    this.setState(
      {
        id: ids,
        taskId: taskIds,
        mode: modes,
        formMode: modes === 'view' ? 'DESCRIPTION' : 'EDIT',
      },
      () => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            formMode: modes === 'edit' ? 'EDIT' : 'DESCRIPTION',
          },
        });

        const { id, taskId, mode } = this.state;
        id &&
          dispatch({
            type: `${DOMAIN}/queryDetails`,
            payload: { id },
          });

        if (mode === 'edit') {
          taskId &&
            dispatch({
              type: `${DOMAIN}/fetchConfig`,
              payload: taskId,
            }).then(res => {
              const { taskKey } = res;
              if (taskKey === 'ADM_M02_01_SUBMIT_i') {
                // 第一节点审批场景
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROD_CONTACT_EDIT' },
                });
              } else if (taskKey === 'ADM_M02_04_FINANCIAL_LEGAL_APPROVAL') {
                // 财法会审批场景
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROD_CONTACT_EDIT:ACCOUNT_LEGAL_COUNTERSIGN_APPROVE' },
                });
                // 上传扫描件场景
              } else if (taskKey === 'ADM_M02_07_UPLOAD_SCANNED_COPY') {
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROD_CONTACT_EDIT:UPLOAD_SACN_FILES' },
                });
              } else {
                // 常规审批场景
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROD_CONTACT_EDIT:NORMAL_APPROVE' },
                });
              }
            });
        } else {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: 'PROD_CONTACT_EDIT:DETAILS' },
          });
        }
      }
    );
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
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

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      formData,
      pageConfig,
      form,
      user: {
        extInfo: { userId },
      },
      formData: { attachments, scans },
    } = this.props;

    const { formMode } = this.state;

    const fields = [
      <BusinessFormTitle title="法务意见" key="legalComments" />,
      <FormItem
        fieldType="BaseInputTextArea"
        label="法务意见"
        key="legalComments"
        fieldKey="legalComments"
      />,
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        fieldType="BaseInput"
        label="合同名称"
        key="contractName"
        fieldKey="contractName"
        initialValue={formData.contractName}
      />,
      <FormItem
        fieldType="BaseInput"
        label="参考合同号"
        key="refContractNo"
        fieldKey="refContractNo"
        initialValue={formData.refContractNo}
      />,
      <FormItem
        fieldType="BaseInput"
        label="合同编号"
        key="contractNo"
        fieldKey="contractNo"
        initialValue={formData.contractNo}
        disabled
      />,
      <FormItem fieldType="Group" label="合同分类" key="contractClass" form={null}>
        <FormItem
          fieldKey="contractClass1"
          fieldType="BaseCustomCascaderMultiSelect"
          parentKey="CUS:CONTRACT_CLASS1"
          cascaderValues={[]}
          form={null}
          value={formData.contractClass1}
          onChange={value => {
            const { contractRulesList: contractRulesList1 } = this.props;
            if (isEmpty(contractRulesList1)) {
              // 赋值
              this.callModelEffects('updateForm', {
                contractClass1: value,
                contractClass2: undefined,
              });
              return;
            }

            createConfirm({
              content: remindString({
                remindCode: 'ADM:W:RULES_CLEAR_WARN',
                defaultMessage: '修改合同分类将清空合同规则并重新生成，请确认是否继续？',
              }),
              width: '500px',
              onOk: () => {
                // 赋值
                this.callModelEffects('updateForm', {
                  contractClass1: value,
                  contractClass2: undefined,
                });

                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    contractRulesList: [],
                  },
                });
              },
            });
          }}
        />
        <FormItem
          fieldKey="contractClass2"
          fieldType="BaseCustomCascaderMultiSelect"
          parentKey="CUS:CONTRACT_CLASS1"
          cascaderValues={[`${formData.contractClass1}`]}
          value={formData.contractClass2 || undefined}
          onChange={value => {
            const { contractRulesList: contractRulesList1 } = this.props;
            if (isEmpty(contractRulesList1)) {
              // 赋值
              this.callModelEffects('updateForm', {
                contractClass2: value,
              });
              // 拉取新规则明细
              dispatch({
                type: `${DOMAIN}/rulesTemplatePagingRq`,
                payload: {
                  associatedObject: 'CONTRACT',
                  associatedObjectClass1: formData.contractClass1,
                  associatedObjectClass2: value,
                },
              });
              return;
            }

            if (!value) {
              createConfirm({
                content: remindString({
                  remindCode: 'ADM:W:RULES_CLEAR_WARN',
                  defaultMessage: '修改合同分类将清空合同规则并重新生成，请确认是否继续？',
                }),
                width: '500px',
                onOk: () => {
                  // 赋值
                  this.callModelEffects('updateForm', {
                    contractClass2: value,
                  });

                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      contractRulesList: [],
                    },
                  });
                },
              });
              return;
            }

            createConfirm({
              content: remindString({
                remindCode: 'ADM:W:RULES_CLEAR_WARN',
                defaultMessage: '修改合同分类将清空合同规则并重新生成，请确认是否继续？',
              }),
              onOk: () => {
                // 赋值
                this.callModelEffects('updateForm', {
                  contractClass2: value,
                });

                // 拉取新规则明细
                dispatch({
                  type: `${DOMAIN}/rulesTemplatePagingRq`,
                  payload: {
                    associatedObject: 'CONTRACT',
                    associatedObjectClass1: formData.contractClass1,
                    associatedObjectClass2: value,
                  },
                });
              },
            });
          }}
        />
      </FormItem>,
      <FormItem
        fieldType="ProductSimpleSelect"
        label="相关产品"
        key="relatedProduct"
        fieldKey="relatedProduct"
        initialValue={formData.relatedProduct}
      />,
      <FormItem
        fieldType="ContractSimpleSelect"
        label="相关合同"
        key="relatedContract"
        fieldKey="relatedContract"
        initialValue={formData.relatedContract}
      />,
      <FormItem
        fieldType="ProjectSimpleSelect"
        label="相关项目"
        key="relatedProject"
        fieldKey="relatedProject"
        initialValue={formData.relatedProject}
      />,
      <FormItem
        fieldType="BaseCustomSelect"
        label="签约公司"
        key="signingCompany"
        fieldKey="signingCompany"
        parentKey="CUS:INTERNAL_COMPANY"
        initialValue={formData.signingCompany}
      />,
      <FormItem
        fieldType="BaseDatePicker"
        label="签订日期"
        key="signingDate"
        fieldKey="signingDate"
        initialValue={formData.signingDate}
      />,
      <FormItem
        fieldType="BaseDateRangePicker"
        label="生效日期"
        key="effectiveStartDate"
        fieldKey="effectiveStartDate"
        initialValue={formData.effectiveStartDate}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="币种"
        key="currCode"
        fieldKey="currCode"
        parentKey="COMMON_CURRENCY"
        initialValue={formData.currCode}
      />,
      <FormItem
        fieldType="BaseInputAmt"
        label="金额"
        key="amt"
        fieldKey="amt"
        initialValue={formData.amt}
        precision={2}
        maxLength={15}
      />,
      <FormItem
        fieldType="ResSimpleSelect"
        label="合同负责人"
        key="inchargeResId"
        fieldKey="inchargeResId"
        initialValue={formData.inchargeResId}
      />,
      <FormItem
        fieldType="BuSimpleSelect"
        label="所属部门"
        key="inchargeBuId"
        fieldKey="inchargeBuId"
        initialValue={formData.inchargeBuId}
      />,
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="定稿附件"
      //   key="attach"
      //   fieldKey="attach"
      //   dataKey={formData.id}
      //   initialValue={formData.id}
      //   api="/api/production/adm/v1/pcontract/sfs/token/pcontract"
      //   listType="text"
      //   attach
      // />,
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="双方用印扫描件"
      //   key="scan"
      //   fieldKey="scan"
      //   dataKey={formData.id}
      //   initialValue={formData.id}
      //   api="/api/production/adm/v1/pcontract/sfs/token/scan"
      //   listType="text"
      //   attach
      // />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="attach"
        key="attach"
        label="定稿附件"
        fileList={attachments}
        multiple
        preview
        attach // 不加attach属性，在可配置化处理中，preview会被设置为null；设置了attach属性，才会根据配置化设置attach
      />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="scan"
        key="scan"
        label="双方用印扫描件"
        fileList={scans}
        preview
        attach
      />,
      <FormItem
        fieldType="Custom"
        label="相关单据"
        key="relateDocument"
        fieldKey="relateDocument"
        initialValue={formData.relateDocument}
        descriptionField="relateDocumentDesc"
      >
        <RelatedDocs />
      </FormItem>,
      <FormItem
        fieldType="UserSimpleSelect"
        label="创建人"
        key="createUserId"
        fieldKey="createUserId"
        initialValue={userId}
        // disabled
      />,
      <FormItem
        fieldType="BaseDatePicker"
        label="创建时间"
        key="createTime"
        fieldKey="createTime"
        initialValue={formData.createTime}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="合同状态"
        key="contractStatus"
        fieldKey="contractStatus"
        parentKey="ADM:CONTRACT_STATUS"
        initialValue={formData.contractStatus}
      />,
      <FormItem fieldType="BaseInputTextArea" label="备注" key="remark" fieldKey="remark" />,
      <BusinessFormTitle key="partyA" title="签约方信息" />,
      <FormItem
        fieldType="BaseInput"
        label="甲方"
        key="partyA"
        fieldKey="partyA"
        initialValue={formData.partyA}
      />,
      <FormItem
        fieldType="BaseInput"
        label="乙方"
        key="partyB"
        fieldKey="partyB"
        initialValue={formData.partyB}
      />,
      <FormItem
        fieldType="BaseInput"
        label="丙方"
        key="partyC"
        fieldKey="partyC"
        initialValue={formData.partyC}
      />,
      <FormItem
        fieldType="BaseInput"
        label="丁方"
        key="partyD"
        fieldKey="partyD"
        initialValue={formData.partyD}
      />,
      <FormItem
        fieldType="BaseInput"
        label="戊方"
        key="partyE"
        fieldKey="partyE"
        initialValue={formData.partyE}
      />,
      <FormItem
        fieldType="BaseInputTextArea"
        label="备注"
        key="partiesRemark"
        fieldKey="partiesRemark"
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PROD_CONTACT_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm
        formData={formData}
        form={form}
        formMode={formMode}
        defaultColumnStyle={8}
        // title="基本信息"
      >
        {fieldsConfig}
      </BusinessForm>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      form,
      form: { validateFieldsAndScroll },
      formData,
      formMode,
      flowForm,
      fieldsConfig,
      contractRulesList,
    } = this.props;
    const { taskId } = this.state;
    const { taskKey } = fieldsConfig;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] || loading.effects[`${DOMAIN}/submit`];

    const columns = [
      {
        title: '编号',
        dataIndex: 'rulesLineNo',
        align: 'center',
        width: 100,
      },
      {
        title: '描述',
        dataIndex: 'rulesDescription',
        render: val => <pre>{val}</pre>,
      },
    ];

    const rowSelection = {
      selectedRowKeys: contractRulesList.filter(v => v.matchMark).map(v => v.rulesLineNo),
      getCheckboxProps: record => ({
        disabled: taskKey !== 'ADM_M02_01_SUBMIT_i',
      }),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            contractRulesList: contractRulesList.map(v => ({
              ...v,
              matchMark: v.rulesLineNo === record.rulesLineNo ? selected : v.matchMark,
            })),
          },
        });
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        const tt = changeRows.map(v => v.rulesLineNo);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            contractRulesList: contractRulesList.map(v => ({
              ...v,
              matchMark: tt.includes(v.rulesLineNo) ? selected : v.matchMark,
            })),
          },
        });
      },
    };

    return (
      <PageWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={disabledBtn}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;

            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }

            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  submitOrApprRq({
                    id: formData.id,
                    procIden: 'ADM_M02',
                    procTaskId: taskId,
                    result: 'REJECTED',
                    branch,
                    submit: true,
                    procRemark: remark,
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

            if (key === 'FLOW_PASS' || key === 'FLOW_COMMIT') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  const {
                    contractClass1,
                    contractClass2,
                    contractRules = [],
                    ...newFormData
                  } = formData;

                  if (!contractClass1 || !contractClass2) {
                    createMessage({ type: 'warn', description: '请填写合同分类信息！' });
                    return;
                  }

                  let delIds = [];
                  if (contractRulesList.filter(v => v.id < 0).length > 0) {
                    delIds = contractRules.map(v => v.id);
                  }

                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      ...newFormData,
                      result: 'APPROVED',
                      procTaskId: taskId,
                      taskId,
                      procRemark: remark,
                      branch,
                      submit: true,
                      procTaskKey: taskKey,
                      taskKey,
                      contractClass1,
                      contractClass2,
                      contractRulesList,
                      delIds,
                    },
                  });
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {this.renderPage()}
          {taskKey !== 'ADM_M02_07_UPLOAD_SCANNED_COPY' ? (
            <div className={styles.boxWarp}>
              <BusinessForm
                formData={formData}
                form={form}
                formMode={formMode}
                defaultColumnStyle={24}
              >
                <BusinessFormTitle title="合同规则" />
                <Table
                  rowKey="rulesLineNo"
                  rowSelection={rowSelection}
                  pagination={false}
                  columns={columns}
                  dataSource={contractRulesList}
                  loading={loading.effects[`${DOMAIN}/rulesTemplatePagingRq`]}
                />
              </BusinessForm>
            </div>
          ) : (
            ''
          )}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default index;
