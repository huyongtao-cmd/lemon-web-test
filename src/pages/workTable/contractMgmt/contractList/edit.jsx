import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import { createConfirm } from '@/components/core/Confirm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import RelatedDocs from './components/RelatedDocs';
import { fromQs } from '@/utils/production/stringUtil';
import createMessage from '@/components/core/AlertMessage';

import styles from './style.less';

const DOMAIN = 'contractListEdit';

@connect(({ user: { user }, loading, contractListEdit, dispatch }) => ({
  loading,
  ...contractListEdit,
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

    const { id, scene } = fromQs();

    this.setState({
      scene,
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    if (scene === 'adjust') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PROD_CONTACT_EDIT:CONTRACT_ADJUST' },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PROD_CONTACT_EDIT' },
      });
    }
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

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      contractRulesList,
      formData,
    } = this.props;
    const { contractClass1, contractClass2, contractRules = [], ...newFormData } = formData;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!contractClass1 || !contractClass2) {
          createMessage({ type: 'warn', description: '请填写合同分类信息！' });
          return;
        }
        let delIds = [];
        if (contractRulesList.filter(v => v.id < 0).length > 0) {
          delIds = contractRules.map(v => v.id);
        }
        dispatch({
          type: `${DOMAIN}/pcontractSubmit`,
          payload: {
            ...newFormData,
            ...values,
            contractRulesList,
            contractClass1,
            contractClass2,
            delIds,
            submit: true,
            result: 'APPLIED',
          },
        });
      }
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      contractRulesList,
      formData,
    } = this.props;
    const { contractClass1, contractClass2, ...newFormData } = formData;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!contractClass1 || !contractClass2) {
          createMessage({ type: 'warn', description: '请填写合同分类信息！' });
          return;
        }
        let delIds = [];
        if (contractRulesList.filter(v => v.id < 0).length > 0) {
          delIds = formData.contractRules.map(v => v.id);
        }
        dispatch({
          type: `${DOMAIN}/pcontractSave`,
          payload: {
            ...newFormData,
            ...values,
            contractRulesList,
            contractClass1,
            contractClass2,
            delIds,
          },
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      formData,
      formMode,
      pageConfig,
      form,
      user: {
        extInfo: { userId },
      },
      formData: { attachments, scans },
    } = this.props;

    const fields = [
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
              content: '修改合同分类将清空合同规则并重新生成，请确认是否继续？',
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
                content: '修改合同分类将清空合同规则并重新生成，请确认是否继续？',
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
              content: '切换合同分类二将会清除现有合同规则信息，是否继续？',
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
        fieldType="BaseCustomSelect"
        label="签约公司"
        key="signingCompany"
        fieldKey="signingCompany"
        parentKey="CUS:INTERNAL_COMPANY"
        initialValue={formData.signingCompany}
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
        onChange={(value, option) => {
          if (value) {
            this.callModelEffects('updateForm', {
              relatedProduct: option[0].relatedProductId,
            });
          }
        }}
      />,
      <FormItem
        fieldType="ProductSimpleSelect"
        label="相关产品"
        key="relatedProduct"
        fieldKey="relatedProduct"
        initialValue={formData.relatedProduct}
        queryParam={{
          orProjectId: formData.relatedProject,
          productClass1s: ['PRODUCT_CLASS1:004', 'PRODUCT_CLASS1:003'].join(','),
          productStatus: 'ACTIVE',
        }}
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
      // />,
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="双方用印扫描件"
      //   key="scan"
      //   fieldKey="scan"
      //   dataKey={formData.id}
      //   initialValue={formData.scan}
      //   api="/api/production/adm/v1/pcontract/sfs/token/scan"
      //   listType="text"
      // />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="attach"
        key="attach"
        label="定稿附件"
        fileList={attachments}
        multiple
      />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="scan"
        key="scan"
        label="双方用印扫描件"
        fileList={scans}
        multiple
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
      <FormItem
        fieldType="BaseSelect"
        label="关闭原因"
        key="closeReason"
        fieldKey="closeReason"
        parentKey="CUS:CONTRACT_CLOSE_REASON"
        initialValue={formData.closeReason}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="关闭备注"
        key="closeRemark"
        fieldKey="closeRemark"
        initialValue={formData.closeRemark}
      />,
      <FormItem
        fieldType="BaseDatePicker"
        label="关闭时间"
        key="closeTime"
        fieldKey="closeTime"
        parentKey="ADM:CONTRACT_STATUS"
        initialValue={formData.closeTime}
      />,
      <FormItem fieldType="BaseInputTextArea" label="备注" key="remark" fieldKey="remark" />,
      <BusinessFormTitle title="签约方信息" />,
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
    const { dispatch, loading, form, formData, formMode, contractRulesList, delIds } = this.props;
    const { scene } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] ||
      loading.effects[`${DOMAIN}/pcontractSave`] ||
      loading.effects[`${DOMAIN}/pcontractSubmit`] ||
      loading.effects[`${DOMAIN}/rulesTemplatePagingRq`];

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
        {formMode === 'EDIT' && (
          <ButtonCard>
            <Button
              icon="save"
              size="large"
              type="primary"
              onClick={this.handleSave}
              disabled={disabledBtn}
            >
              保存
            </Button>
            {scene !== 'adjust' ? (
              <Button
                icon="save"
                size="large"
                type="primary"
                onClick={this.handleSubmit}
                disabled={disabledBtn}
              >
                提交
              </Button>
            ) : (
              ''
            )}
          </ButtonCard>
        )}
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="合同规则" />
            <Table
              rowKey="rulesLineNo"
              rowSelection={formMode === 'EDIT' ? rowSelection : null}
              pagination={false}
              columns={columns}
              dataSource={contractRulesList}
              loading={loading.effects[`${DOMAIN}/rulesTemplatePagingRq`]}
            />
          </BusinessForm>
        </div>
      </PageWrapper>
    );
  }
}

export default index;
