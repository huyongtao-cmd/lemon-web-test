import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Tooltip } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import classnames from 'classnames';
import RelatedDocs from '../components/RelatedDocs';
import { fromQs } from '@/utils/production/stringUtil';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Button from '@/components/production/basic/Button.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';

import styles from './style.less';

const DOMAIN = 'contractListDetail';

@connect(({ user: { user }, loading, contractListDetail, dispatch }) => ({
  loading,
  ...contractListDetail,
  dispatch,
  user,
}))
class index extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    this.setState({
      id,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROD_CONTACT_EDIT:DETAILS' },
    });
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
      <FormItem fieldType="Group" label="合同分类" key="contractClass">
        <FormItem
          fieldKey="contractClass1"
          fieldType="BaseSystemCascaderMultiSelect"
          parentKey="COMMON:ADM_DIVISION:CHINA"
          cascaderValues={[]}
        />
        <FormItem
          fieldKey="contractClass2"
          fieldType="BaseSystemCascaderMultiSelect"
          parentKey="COMMON:ADM_DIVISION:CHINA"
          cascaderValues={[`${formData.contractClass1}`]}
        />
      </FormItem>,
      <FormItem
        fieldType="BaseSelect"
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
        fieldType="BaseSelect"
        label="相关项目"
        key="relatedProject"
        fieldKey="relatedProject"
        initialValue={formData.relatedProject}
      />,
      <FormItem
        fieldType="BaseSelect"
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
        fieldType="BaseInput"
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
        fieldType="BaseInputNumber"
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
        preview
      />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="scan"
        key="scan"
        label="双方用印扫描件"
        fileList={scans}
        preview
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
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={8}>
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  render() {
    const { loading, form, formData, formMode, contractRulesList, dispatch } = this.props;
    const { id } = this.state;

    const allBpm = [{ docId: id, procDefKey: 'ADM_M02', title: '台账合同新建审批流程' }];

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
        disabled: id,
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
        <ButtonCard>
          <a
            href={`/print?scope=ADM_M02&id=${fromQs().id}`}
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
        </ButtonCard>
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
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
        <BpmConnection source={allBpm} />
      </PageWrapper>
    );
  }
}

export default index;
