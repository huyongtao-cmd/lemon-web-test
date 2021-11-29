/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form, Input, DatePicker, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { selectUsersWithBu } from '@/services/gen/list';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

import Purchase from './TabContent/Purchase';
import Gathering from './TabContent/Gathering';
import Sharing from './TabContent/Sharing';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import { selectContract, selectFinperiod, selectBuProduct } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';

const DOMAIN = 'userContractCreateSub';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, dispath, userContractCreateSub }) => ({
  dispath,
  loading,
  userContractCreateSub,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (
      value instanceof Object &&
      name !== 'startDate' &&
      name !== 'endDate' &&
      name !== 'signDate'
    ) {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    } else if (name === 'custpaytravelFlag') {
      // const val = value === 'YES' ? 1 : 0;
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value === undefined ? null : value },
      });
    } else if (name === 'startDate' || name === 'endDates' || name === 'signDate') {
      // antD 时间组件返回的是moment对象 转成字符串提交
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: formatDT(value) },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class CreateSubContract extends PureComponent {
  state = {
    operationkey: 'Info',
  };

  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { mainId } = fromQs();

    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/queryMain`,
      payload: mainId,
    });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/user` });
    dispatch({ type: `${DOMAIN}/salesRegionBu` });
    // 加载页面配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_CREATE_SUB' },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { operationkey } = this.state;

    if (operationkey === 'Info') {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/createInfo`,
          });
        }
      });
    }
  };

  handleCancel = () => {
    closeThenGoto('/sale/contract/salesList');
  };

  // onOperationTabChange = key => {
  //   this.setState({ operationkey: key });
  // };

  handleChange = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/UDC_SmallClass`,
      payload: value,
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        saleType2: null,
        saleType2Desc: null,
      });
    });
  };

  render() {
    const { operationkey } = this.state;
    const {
      loading,
      dispatch,
      userContractCreateSub: {
        formData,
        smallClass,
        buData = [],
        deliBuDataSource = [],
        preSaleBuDataSource = [],
        salesRegionBuData = [],
        salesRegionBuDataSource = [],
        userData = [],
        deliResDataSource = [],
        preSaleResDataSource = [],
        pageConfig = {},
      },
      form: { getFieldDecorator, setFields },
    } = this.props;
    const readOnly = true;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const { pageFieldViews = {} } = pageBlockViews[0];
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryMain`] || loading.effects[`${DOMAIN}/createInfo`];

    const operationTabList = [
      {
        key: 'Info',
        tab: '合同信息',
      },
      {
        key: 'Purchase',
        tab: <span className="tw-card-multiTab-disabled">采购合同</span>,
      },
      {
        key: 'Gathering',
        tab: <span className="tw-card-multiTab-disabled">收款计划</span>,
      },
      {
        key: 'Sharing',
        tab: <span className="tw-card-multiTab-disabled">收益分配</span>,
      },
      {
        key: 'PurchaseDemandDeal',
        tab: <span className="tw-card-multiTab-disabled">采购需求处理</span>,
      },
    ];

    const baseInfo = [
      <Field
        name="contractName"
        key="contractName"
        label="子合同名称"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractName
            ? formData.contractName
            : formData.subContractDefaultName,
          rules: [
            {
              required: true,
              message: '请输入子合同名称',
            },
          ],
        }}
      >
        <Input placeholder="请输入子合同名称" />
      </Field>,

      <Field
        name="contractNo"
        key="contractNo"
        label="编号"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractNo,
        }}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field
        key="mainContractId"
        name="mainContractName"
        label="主合同"
        decorator={{
          initialValue: formData.mainContractName,
          rules: [
            {
              required: false,
              message: '请选择主合同',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectContract().then(resp => resp.response)}
          placeholder="请选择主合同"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="userdefinedNo"
        name="userdefinedNo"
        label="参考合同号"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.userdefinedNo,
        }}
      >
        <Input placeholder="请输入参考合同号" />
      </Field>,

      <Field
        key="signBuId"
        name="signBuName"
        label="签单BU"
        decorator={{
          initialValue: formData.signBuName,
          rules: [
            {
              required: false,
              message: '请选择签单BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectBus().then(resp => resp.response)}
          placeholder="请选择签单BU"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="salesmanResId"
        name="salesmanResName"
        label="销售负责人"
        decorator={{
          initialValue: formData.salesmanResName,
          rules: [
            {
              required: false,
              message: '请选择销售负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Input disabled />
      </Field>,

      <Field
        key="deliBuId"
        name="deliBuId"
        label="交付BU"
        decorator={{
          initialValue:
            formData.deliBuId && formData.deliBuName
              ? {
                  code: formData.deliBuId,
                  name: formData.deliBuName,
                }
              : null,
          rules: [
            {
              required: true,
              message: '请选择交付BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder="请选择主交付BU"
          columns={subjCol}
          dataSource={deliBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  deliBuDataSource: buData.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,

      <Field
        key="deliResId"
        name="deliResId"
        label="交付负责人"
        decorator={{
          initialValue:
            formData.deliResId && formData.deliResName
              ? {
                  code: formData.deliResId,
                  name: formData.deliResName,
                }
              : null,
          rules: [
            {
              required: true,
              message: '请选择交付负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder="请选择交付负责人"
          columns={subjCol}
          dataSource={deliResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  deliResDataSource: userData.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,
      <Field
        key="preSaleBuId"
        name="preSaleBuId"
        label="售前BU"
        decorator={{
          initialValue:
            formData.preSaleBuId && formData.preSaleBuName
              ? {
                  code: formData.preSaleId,
                  name: formData.preSaleName,
                }
              : null,
          rules: [
            {
              required: true,
              message: '请选择售前BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder="请选择售前BU"
          columns={subjCol}
          dataSource={preSaleBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  preSaleBuDataSource: buData.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,

      <Field
        key="preSaleResId"
        name="preSaleResId"
        label="售前负责人"
        decorator={{
          initialValue:
            formData.preSaleResId && formData.preSaleResName
              ? {
                  code: formData.preSaleResId,
                  name: formData.preSaleResName,
                }
              : null,
          rules: [
            {
              required: true,
              message: '请选择售前负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder="请选择售前负责人"
          columns={subjCol}
          dataSource={preSaleResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  preSaleResDataSource: userData.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,
      <Field
        key="pmoResId"
        name="pmoResId"
        label="PMO"
        decorator={{
          initialValue:
            formData.pmoResId && formData.pmoResIdName
              ? {
                  code: formData.pmoResId,
                  name: formData.pmoResIdName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择资源"
        />
      </Field>,
      <Field
        key="regionBuId"
        name="regionBuId"
        label="销售区域BU"
        decorator={{
          initialValue:
            formData.regionBuId && formData.regionBuName
              ? {
                  code: formData.regionBuId,
                  name: formData.regionBuName,
                }
              : null,
          rules: [
            {
              required: true,
              message: '请选择销售区域BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder="请选择销售区域BU"
          columns={subjCol}
          dataSource={salesRegionBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  salesRegionBuDataSource: salesRegionBuData.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,

      <Field
        key="signDate"
        name="signDate"
        label="签订日期"
        decorator={{
          initialValue: formData.signDate ? moment(formData.signDate) : null,
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择签订日期" className="x-fill-100" />
      </Field>,

      <Field
        key="startDate"
        name="startDate"
        label="合同开始日期"
        decorator={{
          initialValue: formData.startDate ? moment(formData.startDate) : null,
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && formData.endDate && moment(formData.endDate).isBefore(value)) {
                  callback('合同开始日期应该早于结束日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择合同开始日期" className="x-fill-100" />
      </Field>,
      <Field
        key="endDate"
        name="endDate"
        label="合同结束日期"
        decorator={{
          initialValue: formData.endDate ? moment(formData.endDate) : null,
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && formData.startDate && moment(value).isBefore(formData.startDate)) {
                  callback('合同结束日期应该晚于开始日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择合同结束日期" className="x-fill-100" />
      </Field>,

      <Field
        key="attache"
        name="attache"
        label="附件"
        decorator={{
          initialValue: formData.attache,
        }}
        {...FieldListLayout}
      >
        <FileManagerEnhance
          api="/api/op/v1/contract/sub/sfs/token"
          dataKey=""
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field
        key="deliveryAddress"
        name="deliveryAddress"
        label="交付地点"
        decorator={{
          initialValue: formData.deliveryAddress,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入交付地点" />
      </Field>,

      <Field
        key="contractStatus"
        name="contractStatus"
        label="合同状态"
        decorator={{
          initialValue: formData.contractStatus,
        }}
        {...FieldListLayout}
      >
        <UdcSelect disabled={readOnly} code="TSK.CONTRACT_STATUS" placeholder="请选择合同状态" />
      </Field>,

      <Field
        key="closeReason"
        name="closeReason"
        label="关闭原因"
        decorator={{
          initialValue: formData.closeReason,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          disabled={readOnly}
          code="TSK.CONTRACT_CLOSE_REASON"
          placeholder="请选择关闭原因"
        />
      </Field>,

      <Field key="activateDate" label="合同激活日期" presentational {...FieldListLayout}>
        <Input
          placeholder="系统生成"
          value={formData.activateDate ? formatDT(formData.activateDate) : null}
          disabled={readOnly}
        />
      </Field>,
      <Field key="closeDate" label="合同关闭日期" presentational {...FieldListLayout}>
        <Input
          placeholder="系统生成"
          value={formData.closeDate ? formatDT(formData.closeDate) : null}
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="currCode"
        name="currCode"
        label="币种"
        decorator={{
          initialValue: formData.currCode,
          rules: [
            {
              required: true,
              message: '请选择币种',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="COM.CURRENCY_KIND" placeholder="请选择币种" />
      </Field>,
      <Field
        key="paperStatus"
        name="paperStatus"
        label="纸质合同状态"
        decorator={{
          initialValue: formData.paperStatus,
        }}
        {...FieldListLayout}
      >
        <Selection.UDC code="TSK:CONT_PAPER_STATUS" placeholder="请选择纸质合同状态" />
      </Field>,
      <Field
        key="paperDesc"
        name="paperDesc"
        label="纸质合同状态描述"
        decorator={{
          initialValue: formData.paperDesc,
        }}
        fieldCol={1}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input.TextArea placeholder="请输入纸质合同状态描述" rows={3} />
      </Field>,

      <Field
        key="remark"
        name="remark"
        label={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
        decorator={{
          initialValue: formData.remark,
        }}
        fieldCol={1}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input.TextArea placeholder="请输入备注" rows={3} />
      </Field>,

      <Field
        key="createUserId"
        name="createUserName"
        label="创建人"
        decorator={{
          initialValue: formData.createUserName,
        }}
        {...FieldListLayout}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field
        key="createTime"
        name="createTime"
        label="创建日期"
        decorator={{
          initialValue: formData.createTime,
        }}
        {...FieldListLayout}
        disabled={readOnly}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          // eslint-disable-next-line no-nested-ternary
          name:
            pageFieldJson[field.key].fieldKey === 'signBuId'
              ? 'signBuName'
              : // eslint-disable-next-line no-nested-ternary
                pageFieldJson[field.key].fieldKey === 'salesmanResId'
                ? 'salesmanResName'
                : // eslint-disable-next-line no-nested-ternary
                  pageFieldJson[field.key].fieldKey === 'mainContractId'
                  ? 'mainContractName'
                  : pageFieldJson[field.key].fieldKey === 'createUserId'
                    ? 'createUserName'
                    : pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const saleInfo = [
      <Field
        key="productId"
        name="productId"
        label="产品"
        decorator={{
          initialValue: formData.productId,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectBuProduct().then(resp => resp.response)}
          placeholder="请选择产品"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        key="briefDesc"
        name="briefDesc"
        label="简要说明"
        decorator={{
          initialValue: formData.briefDesc,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入简要说明" />
      </Field>,

      <Field
        key="workType"
        name="workType"
        label="工作类型"
        decorator={{
          initialValue: formData.workType,
          rules: [
            {
              required: true,
              message: '请选择工作类型',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="TSK.WORK_TYPE" placeholder="请选择工作类型" />
      </Field>,

      <Field
        key="promotionType"
        name="promotionType"
        label="促销码"
        decorator={{
          initialValue: formData.promotionType,
          rules: [
            {
              required: true,
              message: '请选择促销码',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="TSK.PROMOTION_TYPE" placeholder="请选择促销码" />
      </Field>,

      <Field
        key="rangeProp"
        name="rangeProp"
        label="范围性质"
        decorator={{
          initialValue: formData.rangeProp,
          rules: [
            {
              required: true,
              message: '请选择范围性质',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="TSK.RANGE_PROP" placeholder="请选择范围性质" />
      </Field>,

      <Field
        key="halfOpenDesc"
        name="halfOpenDesc"
        label="半开口说明"
        decorator={{
          initialValue: formData.halfOpenDesc,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入半开口说明" />
      </Field>,

      <Field
        key="saleType1"
        name="saleType1"
        label="产品大类"
        decorator={{
          initialValue: formData.saleType1,
          rules: [
            {
              required: true,
              message: '请选择产品大类',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.SALE_TYPE1"
          onChange={this.handleChange}
          placeholder="请选择产品大类"
        />
      </Field>,

      <Field
        key="saleType2"
        name="saleType2"
        label="产品小类"
        decorator={{
          initialValue: formData.saleType2,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={smallClass || []}
          placeholder="请选择产品小类"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        key="prodProp"
        name="prodProp"
        label="供应主体类别"
        decorator={{
          initialValue: formData.prodProp,
          rules: [
            {
              required: true,
              message: '请选择供应主体类别',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="COM.PROD_PROP" placeholder="请选择供应主体类别" />
      </Field>,

      <Field
        key="projProp"
        name="projProp"
        label="提成类别"
        decorator={{
          initialValue: formData.projProp,
          rules: [
            {
              required: true,
              message: '请选择提成类别',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="TSK.PROJ_PROP" placeholder="请选择提成类别" />
      </Field>,

      <Field
        key="channelType"
        name="channelType"
        label="交易方式"
        decorator={{
          initialValue: formData.channelType,
          rules: [
            {
              required: true,
              message: '请选择交易方式',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="TSK.CHANNEL_TYPE" placeholder="请选择交易方式" />
      </Field>,

      <Field
        key="cooperationType"
        name="cooperationType"
        label="交易性质"
        decorator={{
          initialValue: formData.cooperationType,
          rules: [
            {
              required: true,
              message: '请选择交易性质',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          code="TSK.COOPERATION_TYPE"
          placeholder="请选择交易性质"
          onValueChange={e => {
            if (e.sphd1 === '1') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  demandTypeRequired: e.sphd1 === '1',
                },
              });
              if (!formData.demandType) {
                setFields({
                  demandType: {
                    value: undefined,
                    error: [new Error('请选择需求类别')],
                  },
                });
              }
            } else {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  demandTypeRequired: false,
                },
              });
              if (!formData.demandType) {
                setFields({
                  demandType: {
                    value: undefined,
                    success: [new Error('请选择需求类别')],
                  },
                });
              }
            }
          }}
        />
      </Field>,
      <Field
        key="demandType"
        name="demandType"
        label="需求类别"
        decorator={{
          initialValue: formData.demandType,
          rules: [
            {
              required: true,
              message: '请选择需求类别',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          filters={[{ sphd1: '1' }]}
          code="TSK:BUSINESS_TYPE"
          placeholder="请选择需求类别"
          disabled={formData.contractStatus === 'ACTIVE'}
        />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required:
                  field.key === 'demandType'
                    ? pageFieldJson[field.key].requiredFlag && formData.demandTypeRequired
                    : pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props && f1.props.sortNo - f2.props.sortNo);
    const finInfo = [
      <Field
        key="custpaytravelFlag"
        name="custpaytravelFlag"
        label="客户承担差旅费"
        decorator={{
          initialValue: formData.custpaytravelFlag, // ? 'YES' : 'NO',
          rules: [
            {
              required: false,
              message: '请选择客户承担差旅费',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect code="ACC:CONTRACT_CUSTPAY_TRAVEL" placeholder="请选择..." />
      </Field>,

      <Field
        key="reimbursementDesc"
        name="reimbursementDesc"
        label="报销政策说明"
        decorator={{
          initialValue: formData.reimbursementDesc,
          rules: [
            {
              required: false,
              message: '报销政策说明',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入报销政策说明" />
      </Field>,

      <FieldLine key="amtTaxRate" label="含税总金额/税率" {...FieldListLayout} required>
        {pageFieldJson.amt.visibleFlag && (
          <Field
            key="amt"
            name={pageFieldJson.amt.fieldKey}
            decorator={{
              initialValue: formData.amt,
              rules: [
                {
                  required: pageFieldJson.amt.requiredFlag,
                  message: `请输入${pageFieldJson.amt.displayName}`,
                },
              ],
            }}
            wrapperCol={{ span: 23, xxl: 23 }}
          >
            <InputNumber
              placeholder={`请输入${pageFieldJson.amt.displayName}`}
              disabled={pageFieldJson.amt.fieldMode !== 'EDITABLE'}
              className="x-fill-100"
            />
          </Field>
        )}
        {pageFieldJson.taxRate.visibleFlag && (
          <Field
            key="taxRate"
            name="taxRate"
            decorator={{
              initialValue: formData.taxRate,
              rules: [
                {
                  required: pageFieldJson.taxRate.requiredFlag,
                  message: `请输入${pageFieldJson.taxRate.displayName}`,
                },
                {
                  min: 0,
                  max: 100,
                  required: true,
                  message: '请输入0-100之间的整数',
                },
              ],
            }}
            wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
          >
            <Input
              type="number"
              addonAfter="%"
              placeholder={`请输入${pageFieldJson.taxRate.displayName}`}
              disabled={pageFieldJson.taxRate.fieldMode !== 'EDITABLE'}
            />
          </Field>
        )}
      </FieldLine>,

      <Field
        key="extraAmt"
        name="extraAmt"
        label="其它费用"
        decorator={{
          initialValue: formData.extraAmt,
          rules: [
            {
              required: true,
              message: '请输入其它费用',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <InputNumber placeholder="请输入其它费用" className="x-fill-100" />
      </Field>,

      <Field
        key="effectiveAmt"
        name="effectiveAmt"
        label="有效合同额"
        decorator={{
          initialValue: formData.effectiveAmt,
          rules: [
            {
              required: true,
              message: '请输入有效合同额',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <InputNumber placeholder="请输入有效合同额" className="x-fill-100" />
      </Field>,

      <Field
        key="grossProfit"
        name="grossProfit"
        label="毛利"
        decorator={{
          initialValue: formData.grossProfit,
        }}
        {...FieldListLayout}
      >
        <InputNumber placeholder="请输入毛利" className="x-fill-100" />
      </Field>,

      <Field
        key="finPeriodId"
        name="finPeriodId"
        label="财务期间"
        decorator={{
          initialValue: formData.finPeriodId,
          rules: [
            {
              required: true,
              message: '请选择财务期间',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectFinperiod().then(resp => resp.response)}
          placeholder="请选择财务期间"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props && f1.props.sortNo - f2.props.sortNo);

    const contentList = {
      Info: (
        <>
          <FieldList
            layout="horizontal"
            legend={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator
          >
            {baseInfo}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="销售信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {saleInfo}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="财务信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            {finInfo}
          </FieldList>
        </>
      ),
      Purchase: <Purchase />,
      Gathering: <Gathering formData={formData} />,
      Sharing: <Sharing formData={formData} />,
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey="Info"
          tabList={operationTabList}
          // onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CreateSubContract;
