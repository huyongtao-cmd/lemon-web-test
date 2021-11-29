/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { Form, Card, Input, DatePicker, InputNumber, Button } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import Link from 'umi/link';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { UdcSelect, UdcCheck, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { selectContract, selectFinperiod } from '@/services/user/Contract/sales';

const DOMAIN = 'userContractEditMain';
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const subjCol2 = [
  { dataIndex: 'id', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, userContractEditMain, dispatch }) => ({
  loading,
  userContractEditMain,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      // if (name === 'custId') {
      //   props.dispatch({
      //     type: `${DOMAIN}/updateForm`,
      //     payload: { custId: value.id, custName: value.name },
      //   });
      // } else
      if (value instanceof Object && name !== 'signDate' && name !== 'custId') {
        const key = name.split('Id')[0];
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
        });
      } else if (name === 'signDate') {
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
    }
  },
})
@mountToTab()
class EditMain extends PureComponent {
  state = {
    sourceType: '',
    subListParm: {
      mainType: 'SUB',
      mainContractId: fromQs().id,
    },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const mainId = fromQs().id;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: mainId,
    });
    // dispatch({
    //   type: `${DOMAIN}/querySub`,
    //   payload: mainId,
    // });
    this.fetchData();
    dispatch({ type: `${DOMAIN}/oppo` });
    dispatch({ type: `${DOMAIN}/cust` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/user` });
    dispatch({ type: `${DOMAIN}/salesRegionBu` });

    // 加载页面配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_EDIT' },
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const { subListParm } = this.state;
    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: {
        ...subListParm,
        ...params,
      },
    });
  };

  handleSourceType = e => {
    const {
      dispatch,
      userContractEditMain: { formData },
    } = this.props;
    this.setState({
      sourceType: e.target.value,
    });
    if (e.target.value === 'EXTERNAL') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            internalBuId: null,
            internalResId: null,
            profitDesc: null,
          },
        },
      });
    } else if (e.target.value === 'INTERNAL') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            externalIden: null,
            externalName: null,
            externalPhone: null,
          },
        },
      });
    }
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userContractEditMain: { formData },
      dispatch,
    } = this.props;

    if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
      createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
      return;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      } else {
        createMessage({ type: 'error', description: '必填项不能为空' });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sale/contract/salesList');
  };

  handleChange = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/UDC_SmallClass`,
      payload: value,
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        saleType2: '',
        saleType2Desc: '',
      });
    });
  };

  handleLead = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryLead`,
      payload: value.id,
    });
  };

  handleRegionBu = value => {
    const { dispatch } = this.props;
    if (value && value.id) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          regionPrincipalResName: value.salesmanResName,
        },
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userContractEditMain: {
        formData,
        subList,
        subListTotal,
        smallClass = [],
        oppoData = [],
        oppoDataSource = [],
        custData = [],
        custDataSource = [],
        buData = [],
        signBuDataSource = [],
        deliBuDataSource = [],
        coBuDataSource = [],
        codeliBuDataSource = [],
        internalBuDataSource = [],
        userData = [],
        salesmanResDataSource = [],
        deliResDataSource = [],
        coResDataSource = [],
        codeliResDataSource = [],
        internalResDataSource = [],
        salesRegionBuData = [],
        salesRegionBuDataSource = [],
        pageConfig = {},
      },
      form: { getFieldDecorator },
    } = this.props;
    const { sourceType } = this.state;
    const readOnly = true;
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/querySub`] ||
      loading.effects[`${DOMAIN}/save`];

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const [
      { pageFieldViews: pageFieldViewsMain },
      { pageFieldViews: pageFieldViewsList },
    ] = pageConfig.pageBlockViews;
    const pageFieldJsonMain = {};
    const pageFieldJsonList = {};
    pageFieldViewsMain.forEach(field => {
      pageFieldJsonMain[field.fieldKey] = field;
    });
    pageFieldViewsList.forEach(field => {
      pageFieldJsonList[field.fieldKey] = field;
    });

    const {
      contractName,
      contractNo,
      ouId,
      userdefinedNo,
      oppoId,
      relatedContractId,
      custId,
      newContractFlag,
      signDate,
      specialConcerned,
      attache,
      audit,
      contractStatus,
      closeReason,
      currCode,
      remark,
      createUserId,
      createTime,
      custProj,
      saleContent,
      saleType1,
      saleType2,
      deliveryAddress,
      finPeriodId,
      amt,
      extraAmt,
      effectiveAmt,
      grossProfit,
      horizontal,
      regionBuId,
      regionPrincipalResName,
      signBuId,
      salesmanResId,
      deliBuId,
      deliResId,
      coBuId,
      coResId,
      codeliBuId,
      codeliResId,
      platType,
      mainType,
      pmoResId,
      sourceType: sourceTypePage, // 变量重命名
      internalBuId,
      internalResId,
      profitDesc,
      externalIden,
      externalName,
      externalPhone,
    } = pageFieldJsonMain;

    // 使用formData的数据,来初始来源类型切换状态
    if (formData) {
      (() => {
        this.setState({
          sourceType: formData.sourceType,
        });
      })();
    }

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      // loading,
      expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      dataSource: subList,
      total: subListTotal,
      onChange: filters => {
        this.fetchData(filters);
      },
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // router.push(markAsTab(`/user/contract/tab`));
            const mainId = fromQs().id;
            router.push(`/sale/contract/createSub?mainId=${mainId}`);
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            /* if (selectedRows[0].contractStatus === 'ACTIVE') {
              createMessage({ type: 'error', description: '合同状态为激活,不可修改!' });
              return;
            } */
            const mainId = fromQs().id;
            const { id } = selectedRows[0];
            router.push(`/sale/contract/editSub?mainId=${mainId}&id=${id}`);
          },
        },
      ],
      columns: [
        {
          key: 'contractNo',
          sorter: true,
          align: 'center',
          render: (value, rowData) => {
            const { mainContractId, id } = rowData;
            const href = `/sale/contract/salesSubDetail?mainId=${mainContractId}&id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          key: 'contractName',
        },
        {
          key: 'deliBuId',
        },
        {
          key: 'amt',
          sorter: true,
          align: 'right',
        },
        {
          key: 'mainType',
          align: 'center',
        },
        {
          key: 'createTime',
          align: 'center',
          sorter: true,
        },
      ]
        .filter(
          col =>
            !col.key || (pageFieldJsonList[col.key] && pageFieldJsonList[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJsonList[col.key].displayName,
          sortNo: pageFieldJsonList[col.key].sortNo,
          // eslint-disable-next-line no-nested-ternary
          dataIndex:
            pageFieldJsonList[col.key].fieldKey === 'deliBuId'
              ? 'buName'
              : pageFieldJsonList[col.key].fieldKey === 'mainType'
                ? 'mainTypeDesc'
                : pageFieldJsonList[col.key].fieldKey,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    const fieldListBaseInfo = [
      <Field
        key="contractName"
        name="contractName"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractName,
        }}
      >
        <Input
          placeholder={`请输入${contractName.displayName}`}
          disabled={contractName.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="contractNo"
        name="contractNo"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractNo,
        }}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field
        key="ouId"
        name="ouId"
        decorator={{
          initialValue: formData.ouId,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectInternalOus().then(resp => resp.response)}
          placeholder={`请选择${ouId.displayName}`}
          disabled={ouId.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="userdefinedNo"
        name="userdefinedNo"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.userdefinedNo,
        }}
      >
        <Input
          placeholder={`请输入${userdefinedNo.displayName}`}
          disabled={userdefinedNo.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="oppoId"
        name="oppoId"
        decorator={{
          initialValue:
            formData.oppoId && formData.oppoName
              ? {
                  code: formData.oppoId,
                  name: formData.oppoName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${oppoId.displayName}`}
          disabled={oppoId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={oppoDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  oppoDataSource: oppoData.filter(
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
        key="relatedContractId"
        name="relatedContractId"
        decorator={{
          initialValue: formData.relatedContractId,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectContract().then(resp => resp.response)}
          placeholder={`请选择${relatedContractId.displayName}`}
          disabled={relatedContractId.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="custId"
        key="custId"
        decorator={{
          initialValue: formData.custId || '',
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={custDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${custId.displayName}`}
          disabled={custId.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="newContractFlag"
        key="newContractFlag"
        decorator={{
          initialValue: formData.newContractFlag,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.CONTRACT_CUSTPROP"
          placeholder={`请选择${newContractFlag.displayName}`}
          disabled={newContractFlag.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="signDate"
        key="signDate"
        decorator={{
          initialValue: formData.signDate ? moment(formData.signDate) : null,
        }}
        {...FieldListLayout}
      >
        <DatePicker
          placeholder={`请选择${signDate.displayName}`}
          disabled={signDate.fieldMode !== 'EDITABLE'}
          format="YYYY-MM-DD"
          className="x-fill-100"
        />
      </Field>,

      <Field
        name="specialConcerned"
        key="specialConcerned"
        decorator={{
          initialValue: formData.specialConcerned,
        }}
        {...FieldListLayout}
      >
        <Input
          placeholder={`请输入${specialConcerned.displayName}`}
          disabled={specialConcerned.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field name="attache" key="attache" {...FieldListLayout}>
        <FileManagerEnhance
          api="/api/op/v1/contract/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field
        name="audit"
        key="audit"
        decorator={{
          initialValue: formData.audit,
        }}
        {...FieldListLayout}
      >
        <Input disabled={readOnly} />
      </Field>,

      <Field
        name="contractStatus"
        key="contractStatus"
        decorator={{
          initialValue: formData.contractStatus,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          disabled={contractStatus.fieldMode !== 'EDITABLE'}
          code="TSK.CONTRACT_STATUS"
          placeholder={`请选择${contractStatus.displayName}`}
        />
      </Field>,

      <Field
        name="closeReason"
        key="closeReason"
        decorator={{
          initialValue: formData.closeReason,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.CONTRACT_CLOSE_REASON"
          placeholder={`请输入${closeReason.displayName}`}
          disabled={closeReason.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="currCode"
        key="currCode"
        decorator={{
          initialValue: formData.currCode,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="COM.CURRENCY_KIND"
          placeholder={`请选择${currCode.displayName}`}
          disabled={currCode.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="remark"
        key="remark"
        decorator={{
          initialValue: formData.remark,
        }}
        fieldCol={1}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input.TextArea
          placeholder={`请输入${remark.displayName}`}
          disabled={remark.fieldMode !== 'EDITABLE'}
          rows={3}
        />
      </Field>,

      <Field key="createUserId" presentational {...FieldListLayout}>
        <Input value={formData.createUserName} disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field key="createTime" presentational {...FieldListLayout}>
        <Input
          value={formData.createTime ? formatDT(formData.createTime) : null}
          disabled={readOnly}
          placeholder="系统生成"
        />
      </Field>,
    ]
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonMain[field.key] && pageFieldJsonMain[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJsonMain[field.key].fieldKey,
          label: pageFieldJsonMain[field.key].displayName,
          sortNo: pageFieldJsonMain[field.key].sortNo,
          decorator: {
            ...field.props.decorator, // 此处写错，会导致文本框不加载数据
            rules: [
              {
                required: pageFieldJsonMain[field.key].requiredFlag,
                message: `请输入${pageFieldJsonMain[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const fieldListFin = [
      <Field
        key="custProj"
        decorator={{
          initialValue: formData.custProj,
        }}
        {...FieldListLayout}
      >
        <Input
          placeholder={`请输入${custProj.displayName}`}
          disabled={custProj.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="saleContent"
        decorator={{
          initialValue: formData.saleContent,
        }}
        {...FieldListLayout}
      >
        <Input
          placeholder={`请输入${saleContent.displayName}`}
          disabled={saleContent.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="saleType1"
        decorator={{
          initialValue: formData.saleType1,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.SALE_TYPE1"
          onChange={this.handleChange}
          placeholder={`请选择${saleType1.displayName}`}
          disabled={saleType1.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="saleType2"
        decorator={{
          initialValue: formData.saleType2,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={smallClass}
          placeholder={`请输入${saleType2.displayName}`}
          disabled={saleType2.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="deliveryAddress"
        decorator={{
          initialValue: formData.deliveryAddress,
        }}
        {...FieldListLayout}
      >
        <Input
          placeholder={`请输入${deliveryAddress.displayName}`}
          disabled={deliveryAddress.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="finPeriodId"
        decorator={{
          initialValue: formData.finPeriodId,
        }}
        {...FieldListLayout}
      >
        <AsyncSelect
          source={() => selectFinperiod().then(resp => resp.response)}
          placeholder={`请选择${finPeriodId.displayName}`}
          disabled={finPeriodId.fieldMode !== 'EDITABLE'}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        key="amt"
        decorator={{
          initialValue: formData.amt,
        }}
        {...FieldListLayout}
      >
        <InputNumber
          placeholder={`请输入${amt.displayName}`}
          disabled={amt.fieldMode !== 'EDITABLE'}
          className="x-fill-100"
        />
      </Field>,

      <Field
        key="extraAmt"
        decorator={{
          initialValue: formData.extraAmt,
        }}
        {...FieldListLayout}
      >
        <InputNumber
          placeholder={`请输入${extraAmt.displayName}`}
          disabled={extraAmt.fieldMode !== 'EDITABLE'}
          className="x-fill-100"
        />
      </Field>,

      <Field
        key="effectiveAmt"
        decorator={{
          initialValue: formData.effectiveAmt,
        }}
        {...FieldListLayout}
      >
        <InputNumber
          placeholder={`请输入${effectiveAmt.displayName}`}
          disabled={effectiveAmt.fieldMode !== 'EDITABLE'}
          className="x-fill-100"
        />
      </Field>,

      <Field
        key="grossProfit"
        decorator={{
          initialValue: formData.grossProfit,
        }}
        {...FieldListLayout}
      >
        <InputNumber
          placeholder={`请输入${grossProfit.displayName}`}
          disabled={grossProfit.fieldMode !== 'EDITABLE'}
          className="x-fill-100"
        />
      </Field>,

      <Field
        key="regionBuId"
        decorator={{
          initialValue:
            formData.regionBuId && formData.regionBuName
              ? {
                  code: formData.regionBuId,
                  name: formData.regionBuName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${regionBuId.displayName}`}
          disabled={regionBuId.fieldMode !== 'EDITABLE'}
          onChange={this.handleRegionBu}
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

      <Field key="regionPrincipalResName" presentational {...FieldListLayout}>
        <Input value={formData.regionPrincipalResName} disabled={readOnly} />
      </Field>,
    ]
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonMain[field.key] && pageFieldJsonMain[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJsonMain[field.key].fieldKey,
          label: pageFieldJsonMain[field.key].displayName,
          sortNo: pageFieldJsonMain[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJsonMain[field.key].requiredFlag,
                message: `请输入${pageFieldJsonMain[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const fieldListInter = [
      <Field
        key="signBuId"
        decorator={{
          initialValue:
            formData.signBuId && formData.signBuId
              ? {
                  name: formData.signBuName,
                  code: formData.signBuId,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${signBuId.displayName}`}
          disabled={signBuId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={signBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  signBuDataSource: buData.filter(
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
        key="salesmanResId"
        decorator={{
          initialValue:
            formData.salesmanResId && formData.salesmanResName
              ? {
                  code: formData.salesmanResId,
                  name: formData.salesmanResName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${salesmanResId.displayName}`}
          disabled={salesmanResId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={salesmanResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  salesmanResDataSource: userData.filter(
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
        key="deliBuId"
        decorator={{
          initialValue:
            formData.deliBuId && formData.deliBuName
              ? {
                  code: formData.deliBuId,
                  name: formData.deliBuName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${deliBuId.displayName}`}
          disabled={deliBuId.fieldMode !== 'EDITABLE'}
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
        decorator={{
          initialValue:
            formData.deliResId && formData.deliResName
              ? {
                  code: formData.deliResId,
                  name: formData.deliResName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${deliResId.displayName}`}
          disabled={deliResId.fieldMode !== 'EDITABLE'}
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
        key="coBuId"
        decorator={{
          initialValue:
            formData.coBuId && formData.coBuName
              ? {
                  code: formData.coBuId,
                  name: formData.coBuName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${coBuId.displayName}`}
          disabled={coBuId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={coBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  coBuDataSource: buData.filter(
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
        key="coResId"
        decorator={{
          initialValue:
            formData.coResId && formData.coResName
              ? {
                  code: formData.coResId,
                  name: formData.coResName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${coResId.displayName}`}
          disabled={coResId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={coResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  coResDataSource: userData.filter(
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
        key="codeliBuId"
        decorator={{
          initialValue:
            formData.codeliBuId && formData.codeliBuName
              ? {
                  code: formData.codeliBuId,
                  name: formData.codeliBuName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${codeliBuId.displayName}`}
          disabled={codeliBuId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={codeliBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  codeliBuDataSource: buData.filter(
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
        key="codeliResId"
        decorator={{
          initialValue:
            formData.codeliResId && formData.codeliResName
              ? {
                  code: formData.codeliResId,
                  name: formData.codeliResName,
                }
              : null,
        }}
        {...FieldListLayout}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${codeliResId.displayName}`}
          disabled={codeliResId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={codeliResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  codeliResDataSource: userData.filter(
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
        key="platType"
        decorator={{
          initialValue: formData.platType,
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.PLAT_TYPE"
          placeholder={`请选择${platType.displayName}`}
          disabled={platType.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="mainType"
        decorator={{
          initialValue: formData.mainType,
          rules: [
            {
              required: false,
              message: '请选择主子合同类型',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="TSK.MAIN_TYPE"
          disabled={readOnly}
          placeholder={`请输入${mainType.displayName}`}
        />
      </Field>,

      <Field
        key="pmoResId"
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
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${pmoResId.displayName}`}
          disabled={pmoResId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={coResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  coResDataSource: userData.filter(
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
    ]
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonMain[field.key] && pageFieldJsonMain[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJsonMain[field.key].fieldKey,
          sortNo: pageFieldJsonMain[field.key].sortNo,
          label: pageFieldJsonMain[field.key].displayName,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJsonMain[field.key].requiredFlag,
                message: `请输入${pageFieldJsonMain[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);
    const fieldListSource = [
      <Field
        key="sourceType"
        decorator={{
          initialValue: formData.sourceType,
          rules: [
            {
              required: pageFieldJsonMain.sourceType.requiredFlag,
              message: `请输入${pageFieldJsonMain.sourceType.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcCheck
          code="TSK.SOURCE_TYPE"
          onChange={this.handleSourceType}
          placeholder={`请选择${pageFieldJsonMain.sourceType.displayName}`}
          disabled={pageFieldJsonMain.sourceType.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field key="emptyField" label="" presentational>
        &nbsp;
      </Field>,

      <Field
        key="internalBuId"
        decorator={{
          initialValue:
            formData.internalBuId && formData.internalBuName
              ? {
                  code: formData.internalBuId,
                  name: formData.internalBuName,
                }
              : null,
          rules: [
            {
              required: sourceType === 'INTERNAL' && pageFieldJsonMain.internalBuId.requiredFlag,
              message: `请输入${pageFieldJsonMain.internalBuId.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'INTERNAL' ? 'inline-block' : 'none' }}
      >
        <SelectWithCols
          labelKey="name"
          placeholder={`请选择${internalBuId.displayName}`}
          disabled={internalBuId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={internalBuDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  internalBuDataSource: buData.filter(
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
        key="internalResId"
        decorator={{
          initialValue:
            formData.internalResId && formData.internalResName
              ? {
                  code: formData.internalResId,
                  name: formData.internalResName,
                }
              : null,
          rules: [
            {
              required: sourceType === 'INTERNAL' && pageFieldJsonMain.internalResId.requiredFlag,
              message: `请输入${pageFieldJsonMain.internalResId.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'INTERNAL' ? 'inline-block' : 'none' }}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          placeholder={`请选择${internalResId.displayName}`}
          disabled={internalResId.fieldMode !== 'EDITABLE'}
          columns={subjCol}
          dataSource={internalResDataSource}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  internalResDataSource: userData.filter(
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
        key="profitDesc"
        decorator={{
          initialValue: formData.profitDesc,
          rules: [
            {
              required: sourceType === 'INTERNAL' && pageFieldJsonMain.profitDesc.requiredFlag,
              message: `请输入${pageFieldJsonMain.profitDesc.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'INTERNAL' ? 'inline-block' : 'none' }}
      >
        <Input
          placeholder={`请输入${profitDesc.displayName}`}
          disabled={profitDesc.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="externalIden"
        decorator={{
          initialValue: formData.externalIden,
          rules: [
            {
              required: sourceType === 'EXTERNAL' && pageFieldJsonMain.externalIden.requiredFlag,
              message: `请输入${pageFieldJsonMain.externalIden.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'EXTERNAL' ? 'inline-block' : 'none' }}
      >
        <Input
          placeholder={`请输入${externalIden.displayName}`}
          disabled={externalIden.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="externalName"
        decorator={{
          initialValue: formData.externalName,
          rules: [
            {
              required: sourceType === 'EXTERNAL' && pageFieldJsonMain.externalName.requiredFlag,
              message: `请输入${pageFieldJsonMain.externalName.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'EXTERNAL' ? 'inline-block' : 'none' }}
      >
        <Input
          placeholder={`请许${externalName.displayName}`}
          disabled={externalName.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        key="externalPhone"
        decorator={{
          initialValue: formData.externalPhone,
          rules: [
            {
              required: sourceType === 'EXTERNAL' && pageFieldJsonMain.externalPhone.requiredFlag,
              message: `请输入${pageFieldJsonMain.externalPhone.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
        style={{ display: sourceType === 'EXTERNAL' ? 'inline-block' : 'none' }}
      >
        <Input
          placeholder={`请输入${externalPhone.displayName}`}
          disabled={externalPhone.fieldMode !== 'EDITABLE'}
        />
      </Field>,
    ]
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonMain[field.key] && pageFieldJsonMain[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: field.key && {
          ...field.props,
          name: pageFieldJsonMain[field.key].fieldKey,
          sortNo: pageFieldJsonMain[field.key].sortNo,
          label: pageFieldJsonMain[field.key].displayName,
          // decorator:{
          //   ...field.props.decorator,
          //   rules:[{
          //     required:pageFieldJsonMain[field.key].requiredFlag,
          //     message:`请输入${pageFieldJsonMain[field.key].displayName}`
          //   }]
          // }
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);
    return (
      <PageHeaderWrapper title="创建销售合同">
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
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title
              icon="profile"
              id="user.contract.menu.mainContract"
              defaultMessage="主合同信息"
            />
          }
        >
          <FieldList
            layout="horizontal"
            legend={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {fieldListBaseInfo}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="销售和财务信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {fieldListFin}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="内部信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {fieldListInter}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="来源信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            {fieldListSource}
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="user.contract.menu.subContract" defaultMessage="子合同信息" />
          }
          style={{ marginTop: 6 }}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default EditMain;
