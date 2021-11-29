import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';

import styles from './style.less';

const DOMAIN = 'reimQuotaMgmtDetail';

@connect(({ loading, reimQuotaMgmtDetail, dispatch }) => ({
  loading,
  ...reimQuotaMgmtDetail,
  dispatch,
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

    const { id, scene } = fromQs();

    if (id) {
      // 报销额度表单
      dispatch({
        type: `${DOMAIN}/expenseQuotaDetail`,
        payload: { id },
      });
    }

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'P_EXPENSE_QUOTA_EDIT' },
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

  renderColumns = () => {
    const { pageConfig } = this.props;
    const fields = [
      {
        title: '规则码',
        key: 'ruleCode',
        dataIndex: 'ruleCode',
        align: 'center',
      },
      {
        title: '维度1值',
        key: 'quotaDimension1Value',
        dataIndex: 'quotaDimension1ValueDesc',
        align: 'center',
      },
      {
        title: '维度2值',
        key: 'quotaDimension2Value',
        dataIndex: 'quotaDimension2ValueDesc',
        align: 'center',
      },
      {
        title: '报销额度',
        key: 'quotaAmt',
        dataIndex: 'quotaAmt',
        align: 'right',
        render: val => (isNil(val) ? '' : val.toFixed(2)),
      },
      {
        title: '币种',
        key: 'currCode',
        dataIndex: 'currCodeDesc',
        align: 'center',
      },
      {
        title: '时间单位',
        key: 'timeUnit',
        dataIndex: 'timeUnitDesc',
        align: 'center',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'EXPENSE_QUOTA_D_TABLT',
      fields
    );

    return fieldsConfig;
  };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="报销额度" />,
      <FormItem
        label="核算项目"
        key="busiAccItemId"
        fieldKey="busiAccItemId"
        fieldType="BaseTreeSelect"
        initialValue={formData.busiAccItemId}
        required
      />,
      <FormItem
        label="状态"
        fieldKey="quotaStatus"
        key="quotaStatus"
        fieldType="BaseSelect"
        parentKey="COM:ENABLE_FLAG"
        initialValue={formData.quotaStatus}
      />,
      <FormItem
        label="报销额度维度1"
        key="quotaDimension1"
        fieldKey="quotaDimension1"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        initialValue={formData.quotaDimension1}
      />,
      <FormItem
        label="报销额度维度2"
        key="quotaDimension2"
        fieldKey="quotaDimension2"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        initialValue={formData.quotaDimension2}
      />,

      <FormItem
        label="报销额度说明"
        key="expenseQuotaDesc"
        fieldKey="expenseQuotaDesc"
        fieldType="BaseInputTextArea"
        initialValue={formData.expenseQuotaDesc}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'EXPENSE_QUOTA_EDIT_FORM',
      fields
    );

    return (
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  render() {
    const { loading, form, formData, formMode, dataList = [] } = this.props;

    return (
      <PageWrapper>
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="额度明细" />
            <Table
              bordered
              rowKey="id"
              pagination={false}
              columns={this.renderColumns()}
              dataSource={dataList}
              loading={loading.effects[`${DOMAIN}/expenseQuotaDDetail`]}
            />
          </BusinessForm>
        </div>
      </PageWrapper>
    );
  }
}

export default index;
