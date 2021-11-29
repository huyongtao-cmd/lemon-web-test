import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import EditTable from '@/components/production/business/EditTable';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils';
import { ProductTableColumnsBlockConfig } from '@/utils/pageConfigUtils';

const DOMAIN = 'collectionEdit';

// dispatch是触犯标志，我要开始调用方法了

// 连接数据（redux）
@connect(({ user: { user }, loading, collectionEdit, dispatch }) => ({
  loading,
  ...collectionEdit,
  dispatch,
  user,
}))
// 托管表单的变化（所有表单的onChange事件，统一托管在这）
// dispatch是调用方法的标志
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

// react基本页面结构
class collectionListEdit extends Component {
  // 状态、数据
  state = {};

  // 页面准备完成->该发请求了
  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PROJECT_EDIT' },
    // });
  }

  // 页面即将卸载
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

  handleSave = () => {
    const {
      // 看anta的Form表单
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { createTime, ...newFormData },
      delIds,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      const { detailEntities, ...restValues } = values;
      if (!error) {
        dispatch({
          type: `${DOMAIN}/interfaceCollectionAdd`,
          payload: {
            ...newFormData,
            ...restValues,
            delIds,
          },
        });
      }
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
        extInfo: { resId, userId, baseBuId },
      },
      projectTemplateList,
    } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="公司"
        fieldType="InternalOuSimpleSelect"
        key="dwbm"
        fieldKey="dwbm"
        initialValue={formData.dwbm}
        transfer={{ code: 'abNo', name: 'ouName' }}
        disabled
      />,
      <FormItem
        label="交易类型名称"
        fieldType="BaseInput"
        key="djlxbm"
        fieldKey="djlxbm"
        initialValue={formData.djlxbm}
        disabled
      />,
      <FormItem
        label="单据号"
        key="djbh"
        fieldKey="djbh"
        fieldType="BaseInput"
        initialValue={formData.djbh}
        disabled
      />,
      <FormItem
        label="单据日期"
        fieldType="BaseDatePicker"
        key="djrq"
        fieldKey="djrq"
        initialValue={formData.djrq}
        disabled
      />,
      <FormItem
        label="币种"
        key="bzbm"
        fieldKey="bzbm"
        fieldType="BaseSelect"
        initialValue={formData.bzbm}
        parentKey="COMMON_CURRENCY"
        disabled
      />,
      <FormItem
        label="往来对象标识"
        fieldType="BaseInputNumber"
        key="wldx"
        fieldKey="wldx"
        initialValue={formData.wldx}
        disabled
      />,
      <FormItem
        label="客商"
        fieldType="BaseInput"
        key="hbbm"
        fieldKey="hbbm"
        initialValue={formData.hbbm}
        disabled
      />,
      <FormItem
        label="业务员"
        fieldType="ResSimpleSelect"
        key="ywybm"
        fieldKey="ywybm"
        transfer={{ code: 'resNo', name: 'resName' }}
        resStatus="3"
        initialValue={formData.ywybm}
        disabled
      />,
      <FormItem
        label="本方银行帐号"
        key="bfyhzh"
        fieldKey="bfyhzh"
        fieldType="BaseInput"
        initialValue={formData.bfyhzh}
        disabled
      />,
      <FormItem
        label="部门"
        key="deptid"
        fieldKey="deptid"
        fieldType="BuSimpleSelect"
        initialValue={formData.deptid}
        transfer={{ code: 'buNo', name: 'buName' }}
        disabled
      />,
      <FormItem
        label="对方银行账号"
        fieldType="BaseInput"
        key="dfyhzh"
        fieldKey="dfyhzh"
        initialValue={formData.dfyhzh}
        disabled
      />,
      <FormItem
        label="起算日期"
        fieldType="BaseDatePicker"
        key="effectdate"
        fieldKey="effectdate"
        initialValue={formData.effectdate}
        disabled
      />,
      <FormItem
        label="发票类型"
        fieldType="BaseInput"
        key="finvoicetype"
        fieldKey="finvoicetype"
        parentKey="COM:INV_TYPE"
        initialValue={formData.finvoicetype}
        disabled
      />,
      <FormItem
        label="科目"
        fieldType="BaseInput"
        key="kmbm"
        fieldKey="kmbm"
        initialValue={formData.kmbm}
        disabled
      />,
      <FormItem
        label="录入人"
        fieldType="ResSimpleSelect"
        key="lrr"
        fieldKey="lrr"
        initialValue={formData.lrr}
        transfer={{ code: 'mobile', name: 'resName' }}
        resStatus="3"
        disabled
      />,
      <FormItem
        label="结算方式"
        fieldType="BaseInput"
        key="pjJsfs"
        fieldKey="pjJsfs"
        // parentKey="PRO:PRODUCT_STATUS"
        initialValue={formData.pjJsfs}
        disabled
      />,
      <FormItem
        label="票据号"
        fieldType="BaseInput"
        key="pjNum"
        fieldKey="pjNum"
        initialValue={formData.pjNum}
        disabled
      />,
      <FormItem
        label="预收付标志"
        fieldType="BaseRadioSelect"
        key="prepay"
        fieldKey="prepay"
        initialValue={formData.prepay}
        options={[{ label: '是', value: true }, { label: '否', value: false }]}
        disabled
      />,
      <FormItem
        label="是期初"
        fieldType="BaseInput"
        key="qcbz"
        fieldKey="qcbz"
        initialValue={formData.qcbz}
        disabled
      />,
      <FormItem
        label="收支项目"
        fieldType="BaseInput"
        key="szxmid"
        fieldKey="szxmid"
        initialValue={formData.szxmid}
        disabled
      />,
      <FormItem
        label="交易对象类型"
        fieldType="BaseInput"
        key="tradertype"
        fieldKey="tradertype"
        // parentKey="PRO:PRODUCT_STATUS"
        initialValue={formData.tradertype}
        disabled
      />,
      <FormItem
        label="业务流程"
        fieldType="BaseInput"
        key="xslxbm"
        fieldKey="xslxbm"
        initialValue={formData.xslxbm}
        disabled
      />,
      <FormItem
        label="备注"
        fieldType="BaseInputTextArea"
        key="scomment"
        fieldKey="scomment"
        initialValue={formData.scomment}
        disabled
      />,
    ];

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fields}
      </BusinessForm>
    );
  };

  renderColumns = () => {
    const { form, pageConfig } = this.props;
    const fields = [
      {
        title: '收支项目',
        align: 'center',
        dataIndex: 'szxmid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].szxmid`}
            disabled
          />
        ),
      },
      {
        title: '摘要',
        align: 'center',
        dataIndex: 'zy',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].zy`}
            disabled
          />
        ),
      },
      {
        title: '交易对象类型',
        align: 'center',
        dataIndex: 'tradertype',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].tradertype`}
            disabled
          />
        ),
      },
      {
        title: '部门',
        align: 'center',
        dataIndex: 'deptid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].deptid`}
            disabled
          />
        ),
      },
      {
        title: '业务员',
        align: 'center',
        dataIndex: 'ywybm',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].ywybm`}
            disabled
          />
        ),
      },
      {
        title: '本币汇率',
        align: 'center',
        dataIndex: 'bbhl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].bbhl`}
            formatter={value => (value ? `${value}` : '')}
            disabled
          />
        ),
      },
      {
        title: '借方本币金额',
        align: 'center',
        dataIndex: 'jfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfbbje`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币金额',
        align: 'center',
        dataIndex: 'dfybje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybje`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币税金',
        align: 'center',
        dataIndex: 'dfybsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybsj`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币无税金额',
        align: 'center',
        dataIndex: 'dfybwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybwsje`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币金额',
        align: 'center',
        dataIndex: 'dfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbje`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币税金',
        align: 'center',
        dataIndex: 'dfbbsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbsj`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币无税金额',
        align: 'center',
        dataIndex: 'dfbbwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbwsje`}
            disabled
          />
        ),
      },
      {
        title: '存货',
        align: 'center',
        dataIndex: 'cinventoryid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].cinventoryid`}
            disabled
          />
        ),
      },
      {
        title: '订单号',
        align: 'center',
        dataIndex: 'ddh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].ddh`}
            disabled
          />
        ),
      },
      {
        title: '贷方数量',
        align: 'center',
        dataIndex: 'dfshl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].dfshl`}
            disabled
          />
        ),
      },
      {
        title: '单价',
        align: 'center',
        dataIndex: 'dj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dj`}
            disabled
          />
        ),
      },
      {
        title: '发票号',
        align: 'center',
        dataIndex: 'fph',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].fph`}
            disabled
          />
        ),
      },
      {
        title: '含税单价',
        align: 'center',
        dataIndex: 'hsdj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].hsdj`}
            disabled
          />
        ),
      },
      {
        title: '借方本币税金',
        align: 'center',
        dataIndex: 'jfbbsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfbbsj`}
            disabled
          />
        ),
      },
      {
        title: '借方数量',
        align: 'center',
        dataIndex: 'jfshl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].jfshl`}
            disabled
          />
        ),
      },
      {
        title: '借方原币税金',
        align: 'center',
        dataIndex: 'jfybje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybje`}
            disabled
          />
        ),
      },
      {
        title: '借方原币金额',
        align: 'center',
        dataIndex: 'jfybsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybsj`}
            disabled
          />
        ),
      },
      {
        title: '借方原币无税金额',
        align: 'center',
        dataIndex: 'jfybwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybwsje`}
            disabled
          />
        ),
      },
      {
        title: '项目',
        align: 'center',
        dataIndex: 'kmbm',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].kmbm`}
            disabled
          />
        ),
      },
      {
        title: '扣税类别',
        align: 'center',
        dataIndex: 'kslb',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].kslb`}
            disabled
          />
        ),
      },
      {
        title: '收付款协议',
        align: 'center',
        dataIndex: 'sfkxyh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].sfkxyh`}
            disabled
          />
        ),
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'sl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].sl`}
            max={100}
            min={0}
            formatter={value => (value ? `${value}%` : '')}
            parser={value => value.replace('%', '')}
            disabled
          />
        ),
      },
      {
        title: '借方本币无税金额',
        align: 'center',
        dataIndex: 'wbfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].wbfbbje`}
            disabled
          />
        ),
      },
      {
        title: '固定资产编号',
        align: 'center',
        dataIndex: 'facardbh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].facardbh`}
            disabled
          />
        ),
      },
    ];
    const fieldsConfig = pageConfig
      ? ProductTableColumnsBlockConfig(pageConfig, 'blockKey', 'EXPENSE_QUOTA_D_TABLT', fields)
      : fields;

    return fields;
  };

  render() {
    const { dispatch, formData, form, loading } = this.props;
    const { detailEntities = [], delIds = [] } = formData;
    const { scene } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] ||
      loading.effects[`${DOMAIN}/productManagementSave`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button icon="save" size="large" type="primary" onClick={this.handleSave} disabled>
            保存
          </Button>
        </ButtonCard>
        {this.renderPage()}
        <EditTable
          title="应付单明细"
          form={form}
          columns={this.renderColumns()}
          dataSource={detailEntities}
          // onAddClick={() => {
          //   dispatch({
          //     type: `${DOMAIN}/updateForm`,
          //     payload: {
          //       detailEntities: update(detailEntities, {
          //         $push: [
          //           {
          //             id: genFakeId(-1),
          //           },
          //         ],
          //       }),
          //     },
          //   });
          // }}
          // onDeleteConfirm={keys => {
          //   const newDataSource = detailEntities.filter(row => keys.indexOf(row.id) < 0);
          //   dispatch({
          //     type: `${DOMAIN}/updateForm`,
          //     payload: {
          //       detailEntities: newDataSource,
          //     },
          //   });
          //   dispatch({
          //     type: `${DOMAIN}/updateState`,
          //     payload: {
          //       delIds: [...delIds, ...keys],
          //     },
          //   });
          // }}
          scroll={{ x: 4000 }}
          loading={loading || false}
        />
      </PageWrapper>
    );
  }
}

export default collectionListEdit;
